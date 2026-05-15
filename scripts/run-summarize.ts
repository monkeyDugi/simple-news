// GitHub Actions cron — summarize job entry.
//
// worker pool (concurrency=3) 로 article_template 을 동시 처리.
//   - 각 worker 가 독립적으로 claimOldestTemplate (atomic SELECT+DELETE) 호출
//   - claim 성공 → Bedrock 단건 요약 → applySummary
//   - 실패해도 template 은 claim 시점에 이미 삭제됐으니 100% 정리 보장
//   - 모든 worker 가 빈 큐 발견 → 종료
//
// concurrency 는 SUMMARIZE_CONCURRENCY 환경변수로 조정 (기본 3).
// Bedrock on-demand TPS 한도와 503 빈도를 보고 1~5 사이에서 조정.

import {
  applySummary,
  claimOldestTemplate,
} from "@/lib/articles/repo";
import { MODEL, summarizeOne } from "@/lib/summarization/anthropic";

const DEFAULT_CONCURRENCY = 3;
// 한 사이클당 처리할 최대 건수. 무한 루프 가드.
const MAX_TOTAL = 500;

function getConcurrency(): number {
  const n = Number.parseInt(process.env.SUMMARIZE_CONCURRENCY ?? "", 10);
  if (Number.isFinite(n) && n > 0 && n <= 10) return n;
  return DEFAULT_CONCURRENCY;
}

interface State {
  ok: number;
  failed: number;
  processed: number;
  exhausted: boolean;
}

async function main() {
  const t0 = Date.now();
  const concurrency = getConcurrency();
  const state: State = { ok: 0, failed: 0, processed: 0, exhausted: false };

  console.log(`[summarize] start concurrency=${concurrency}`);

  // worker pool — N개 worker 가 각자 claim-process loop. Promise.all 로 전부 종료 대기.
  const workers = Array.from({ length: concurrency }, (_, i) =>
    worker(i, state),
  );
  await Promise.all(workers);

  console.log(
    "[summarize] done",
    JSON.stringify({
      elapsedMs: Date.now() - t0,
      concurrency,
      processed: state.processed,
      ok: state.ok,
      failed: state.failed,
    }),
  );
}

async function worker(idx: number, state: State): Promise<void> {
  while (!state.exhausted && state.processed < MAX_TOTAL) {
    const tpl = await claimOldestTemplate();
    if (!tpl) {
      // 빈 큐 발견 — 다른 worker 에게도 신호. retry 무한 루프 방지.
      state.exhausted = true;
      break;
    }
    state.processed += 1;
    const myIter = state.processed;

    try {
      const summary = await summarizeOne({
        title: tpl.title,
        content: tpl.content,
      });
      await applySummary(
        tpl,
        {
          titleTheme: summary.titleTheme,
          summary: summary.summary,
          easyExplanation: summary.easyExplanation,
          finalConclusion: summary.finalConclusion,
          keyTerms: summary.keyTerms,
        },
        MODEL,
      );
      state.ok += 1;
    } catch (e) {
      state.failed += 1;
      // claim 시점에 template 은 이미 삭제됐으므로 추가 정리 불필요.
      console.error(
        `[summarize] w${idx} failed id=${tpl.id} section=${tpl.section}`,
        e instanceof Error ? e.message : e,
      );
    }

    if (myIter % 10 === 0) {
      console.log(
        `[summarize] progress processed=${state.processed} ok=${state.ok} failed=${state.failed}`,
      );
    }
  }
}

main().catch((e) => {
  console.error("[summarize] fatal", e);
  process.exit(1);
});
