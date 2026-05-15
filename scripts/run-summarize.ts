// GitHub Actions cron — summarize job entry.
// while loop 로 article_template 을 1건씩 처리:
//   1) 가장 오래된 template 1건 SELECT  → 없으면 종료
//   2) Bedrock 단건 요약
//   3) try { applySummary }  catch { 무시 }
//   4) finally: deleteArticleTemplate(id)  ← 성공/실패 무관 삭제
//
// 요건 (사용자 결정 2026-05-15):
// - 배치 처리 없음, 병렬 처리 없음 (오직 1건씩 직렬)
// - 요약 성공/실패와 무관히 스크랩 데이터(article_template) 는 100% 삭제
// - 다음 cron 사이클이 네이버에서 다시 가져오므로 데이터 손실 의미 없음

import {
  applySummary,
  deleteArticleTemplate,
  fetchOldestUnprocessedTemplate,
} from "@/lib/articles/repo";
import { MODEL, summarizeOne } from "@/lib/summarization/anthropic";

// 한 사이클당 처리할 최대 건수. 무한 루프 가드.
// 7섹션 × 약 50건 = 350건 상한이면 충분.
const MAX_ITERATIONS = 500;

async function main() {
  const t0 = Date.now();
  let ok = 0;
  let failed = 0;
  let iter = 0;

  while (iter < MAX_ITERATIONS) {
    iter += 1;
    const tpl = await fetchOldestUnprocessedTemplate();
    if (!tpl) break;

    try {
      const summary = await summarizeOne({
        title: tpl.title,
        content: tpl.content,
      });
      await applySummary(
        {
          templateId: tpl.id,
          titleTheme: summary.titleTheme,
          summary: summary.summary,
          easyExplanation: summary.easyExplanation,
          finalConclusion: summary.finalConclusion,
          keyTerms: summary.keyTerms,
        },
        MODEL,
      );
      ok += 1;
    } catch (e) {
      failed += 1;
      // 한 건 실패는 사이클을 막지 않는다. 어차피 finally 에서 template 은 삭제.
      console.error(
        `[summarize] failed id=${tpl.id} section=${tpl.section}`,
        e instanceof Error ? e.message : e,
      );
    } finally {
      // 요건: 요약 트리거가 걸리면 스크랩 데이터는 100% 삭제.
      try {
        await deleteArticleTemplate(tpl.id);
      } catch (e) {
        // template 삭제 실패는 드물지만, 다음 사이클 부담을 막기 위해 로깅만.
        console.error(
          `[summarize] template delete failed id=${tpl.id}`,
          e instanceof Error ? e.message : e,
        );
      }
    }

    if (iter % 10 === 0) {
      console.log(
        `[summarize] progress iter=${iter} ok=${ok} failed=${failed}`,
      );
    }
  }

  if (iter >= MAX_ITERATIONS) {
    console.warn(`[summarize] hit MAX_ITERATIONS=${MAX_ITERATIONS} — 잔여 template 다음 사이클로`);
  }

  console.log(
    "[summarize] done",
    JSON.stringify({ elapsedMs: Date.now() - t0, ok, failed, iter }),
  );
}

main().catch((e) => {
  console.error("[summarize] fatal", e);
  process.exit(1);
});
