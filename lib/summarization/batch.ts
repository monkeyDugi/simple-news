import type { SectionCode } from "@/lib/sections";
import { applySummary, type TemplateRow } from "@/lib/articles/repo";

import { summarizeBatch, MODEL } from "./openai";

// 섹션별로 묶어서 OpenAI 에 보내는 이유:
// - 한 batch 안에서만 dedup 이 동작하므로, 같은 섹션끼리 묶어야 중복 제거 정확도가 오른다.
// - 다른 섹션 기사가 섞이면 모델이 주제를 헷갈려 하는 경향이 있다.
// 섹션 간 / chunk 간 모두 순차 처리. 섹션 7개 동시(Promise.all) 시도는 TPM 200K 한도 안에 들어가는
// 계산이었지만 실측에서 batch 9개 중 6~7개가 실패(429 추정) → 직렬로 회귀.

// 한 배치에서 모델이 생성해야 할 출력 토큰 양에 비례해 응답 시간이 늘어난다.
// 20건 × ~300토큰 = 6K 토큰 출력이 60s 를 자주 넘겨 timeout 다발 → 10건으로 축소.
// 10건 × ~300토큰 = ~3K 출력 ≈ 30~60s 안정.
const DEFAULT_BATCH_SIZE = 10;
// OpenAI 는 RPM 이 충분히 여유로워 배치 간 sleep 은 짧게 유지.
// (gpt-4o-mini Tier 1 기준 RPM 500, TPM 200K)
const BATCH_DELAY_MS = 1_000;

function getBatchSize(): number {
  const n = Number.parseInt(process.env.SUMMARIZE_BATCH_SIZE ?? "", 10);
  if (Number.isFinite(n) && n > 0 && n <= 50) return n;
  return DEFAULT_BATCH_SIZE;
}

export interface SummarizeReport {
  batches: number;
  summarized: number;
  skippedDuplicates: number; // 모델이 70%+ 유사로 응답에서 누락한 건수
  failed: number;
}

export async function summarizeAllPending(
  templates: TemplateRow[],
): Promise<SummarizeReport> {
  const report: SummarizeReport = {
    batches: 0,
    summarized: 0,
    skippedDuplicates: 0,
    failed: 0,
  };
  if (templates.length === 0) return report;

  const groups = groupBySection(templates);
  const size = getBatchSize();

  for (const items of groups.values()) {
    await processSection(items, size, report);
  }
  return report;
}

async function processSection(
  items: TemplateRow[],
  size: number,
  report: SummarizeReport,
): Promise<void> {
  for (const chunk of chunkArray(items, size)) {
    report.batches += 1;
    try {
      const inputs = chunk.map((t) => ({
        templateId: t.id,
        title: t.title,
        content: t.content,
      }));
      const summaries = await summarizeBatch(inputs);

      const returnedIds = new Set(summaries.map((s) => s.templateId));
      // 모델이 응답하지 않은 templateId = 중복으로 제거된 것 (가장 낮은 id 만 남김 규칙)
      report.skippedDuplicates += chunk.length - returnedIds.size;

      for (const summary of summaries) {
        try {
          await applySummary(summary, MODEL);
          report.summarized += 1;
        } catch (e) {
          report.failed += 1;
          // eslint-disable-next-line no-console
          console.error(
            `[summarize] applySummary failed templateId=${summary.templateId}`,
            e,
          );
        }
      }
    } catch (e) {
      // batch 전체 실패 → failed 로 집계. flowpick 패턴 상 사이클 종료 시 template 통째로 삭제되므로
      // 실패한 건은 이번 사이클에서 영원히 버려지고, 다음 cron 이 네이버에서 새로 가져옴.
      report.failed += chunk.length;
      // eslint-disable-next-line no-console
      console.error("[summarize] batch failed", e);
    }
    await sleep(BATCH_DELAY_MS);
  }
}

function groupBySection(rows: TemplateRow[]): Map<SectionCode, TemplateRow[]> {
  const map = new Map<SectionCode, TemplateRow[]>();
  for (const row of rows) {
    const arr = map.get(row.section) ?? [];
    arr.push(row);
    map.set(row.section, arr);
  }
  return map;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
