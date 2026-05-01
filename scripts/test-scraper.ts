// 일회성 스크래퍼 검증 스크립트.
// 사용법: npx tsx scripts/test-scraper.ts ECONOMY
//
// MOCK_SCRAPER=true 로 두면 fixture HTML 로 동작하므로 네트워크 없이도 검증 가능.
// MOCK_SCRAPER=false 로 두면 실제 네이버에 요청한다.

import { getScraperForSection } from "@/lib/scrapers";
import { REQUEST_DELAY_MS, sleep } from "@/lib/scrapers/shared";
import { isSectionCode, SECTION_CODES } from "@/lib/sections";

async function main() {
  const arg = process.argv[2] ?? "ECONOMY";
  if (!isSectionCode(arg)) {
    console.error(
      `unknown section: ${arg}. choose one of: ${SECTION_CODES.join(", ")}`,
    );
    process.exit(1);
  }
  const scraper = getScraperForSection(arg);
  const list = await scraper.getNewsList(arg);
  console.log(`[test] ${arg} list=${list.length}`);
  // 앞 3건만 본문 fetch 시도
  for (const item of list.slice(0, 3)) {
    const detail = await scraper.scrapeArticle(item);
    if (!detail) {
      console.log(`- SKIP ${item.title}`);
    } else {
      console.log(`- [${detail.publisher ?? "?"}] ${detail.title}`);
      console.log(`  link=${detail.link}`);
      console.log(
        `  publishedAt=${detail.publishedAt.toISOString()}, contentLen=${detail.content.length}`,
      );
    }
    await sleep(REQUEST_DELAY_MS);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
