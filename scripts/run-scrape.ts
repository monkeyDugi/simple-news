// GitHub Actions cron 에서 직접 실행되는 스크래핑 엔트리.
// 사용법: tsx scripts/run-scrape.ts
//
// Vercel function 의 /api/cron/scrape 와 동일한 runScrapeAll() 호출.
// 차이는 동작 환경: Vercel(AWS IP) → 네이버가 봇 감지로 429 → GitHub Actions (Azure DC IP) 로 회피.

import { runScrapeAll } from "@/lib/cron/scrape-runner";

async function main() {
  const startedAt = Date.now();
  const report = await runScrapeAll();
  const elapsedMs = Date.now() - startedAt;
  console.log("[run-scrape] done", JSON.stringify({ elapsedMs, ...report }));
  if (report.errors.length > 0) {
    // 에러는 이미 stderr 에 찍혔으니 종료 코드만 0 유지 (한 섹션 실패가 전체 fail 로 이어지지 않게)
    console.warn(`[run-scrape] ${report.errors.length} sections had errors`);
  }
}

main().catch((e) => {
  console.error("[run-scrape] fatal", e);
  process.exit(1);
});
