// GitHub Actions cron entry. flowpick 패턴 그대로:
//   1) Scrape   (collect → filter → save)
//   2) Summarize (read all → for section batch → article 저장)
//   3) Cleanup  (article_template 통째로 삭제, 실패한 것까지)

import {
  deleteAllArticleTemplates,
  fetchUnprocessedTemplates,
} from "@/lib/articles/repo";
import { runScrapeAll } from "@/lib/cron/scrape-runner";
import { summarizeAllPending } from "@/lib/summarization/batch";

async function main() {
  const startedAt = Date.now();

  // 1) Scrape
  const t1 = Date.now();
  const scrapeReport = await runScrapeAll();
  console.log(
    "[cron] scrape done",
    JSON.stringify({ elapsedMs: Date.now() - t1, ...scrapeReport }),
  );

  // 2) Summarize
  const t2 = Date.now();
  const templates = await fetchUnprocessedTemplates();
  console.log(`[cron] templates fetched=${templates.length}`);
  const summarizeReport = await summarizeAllPending(templates);
  console.log(
    "[cron] summarize done",
    JSON.stringify({ elapsedMs: Date.now() - t2, ...summarizeReport }),
  );

  // 3) Cleanup — 사이클 종료 시 article_template 통째로 삭제 (flowpick DeleteAll 패턴)
  const t3 = Date.now();
  await deleteAllArticleTemplates();
  console.log("[cron] cleanup done", JSON.stringify({ elapsedMs: Date.now() - t3 }));

  console.log(
    "[cron] all done",
    JSON.stringify({ totalElapsedMs: Date.now() - startedAt }),
  );
}

main().catch((e) => {
  console.error("[cron] fatal", e);
  process.exit(1);
});
