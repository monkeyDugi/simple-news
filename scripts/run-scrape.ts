// GitHub Actions cron — scrape job entry.
// 7섹션을 순회하며 article_template / article_content_template 에 저장하기만 한다.
// 요약은 별도 summarize job 에서 처리 (cron.yml needs: scrape + if: always()).

import { runScrapeAll } from "@/lib/cron/scrape-runner";

async function main() {
  const t0 = Date.now();
  const report = await runScrapeAll();
  console.log(
    "[scrape] done",
    JSON.stringify({ elapsedMs: Date.now() - t0, ...report }),
  );
}

main().catch((e) => {
  console.error("[scrape] fatal", e);
  process.exit(1);
});
