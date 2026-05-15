// GitHub Actions cron — scrape job entry.
// 7섹션을 순회하며 article_template / article_content_template 에 저장하기만 한다.
// 요약은 별도 summarize job 에서 처리 (cron.yml needs: scrape + if: always()).

import { deleteAllArticleTemplates } from "@/lib/articles/repo";
import { runScrapeAll } from "@/lib/cron/scrape-runner";

async function main() {
  const t0 = Date.now();

  // 0) clean slate — 이전 사이클이 비정상 종료되어 article_template 에 남은
  //    쓰레기 데이터를 통째로 정리하고 시작한다. 새 스크랩은 깨끗한 상태에서.
  const cleaned = await deleteAllArticleTemplates();
  console.log(`[scrape] startup cleanup deleted=${cleaned}`);

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
