import type { SectionCode } from "@/lib/sections";
import { applySummary, type TemplateRow } from "@/lib/articles/repo";

import { summarizeBatch } from "./claude";

// 섹션별로 묶어서 Claude 에 보내는 이유:
// - 한 batch 안에서만 dedup 이 동작하므로, 같은 섹션끼리 묶어야 중복 제거 정확도가 오른다.
// - 다른 섹션 기사가 섞이면 모델이 주제를 헷갈려 하는 경향이 있다.

const DEFAULT_BATCH_SIZE = 20;
const BATCH_DELAY_MS = 2000;

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
            await applySummary(summary);
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
        // batch 전체가 실패하면 모두 failed 로 집계. processed_at 갱신 X → 다음 cron 에서 재시도.
        report.failed += chunk.length;
        // eslint-disable-next-line no-console
        console.error("[summarize] batch failed", e);
      }
      await sleep(BATCH_DELAY_MS);
    }
  }
  return report;
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
