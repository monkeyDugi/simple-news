// 일회성 스크래퍼 검증 스크립트.
// 사용법: npx tsx scripts/test-scraper.ts ECONOMY
//
// MOCK_SCRAPER=true 로 두면 fixture HTML 로 동작하므로 네트워크 없이도 검증 가능.
// MOCK_SCRAPER=false 로 두면 실제 네이버에 요청한다.

import { getScraperForSection } from "@/lib/scrapers";
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
  const items = await scraper.scrape(arg);
  console.log(`scraped ${items.length} items from ${arg}`);
  for (const it of items.slice(0, 5)) {
    console.log(`- [${it.publisher ?? "?"}] ${it.title}`);
    console.log(`  link=${it.link}`);
    console.log(
      `  publishedAt=${it.publishedAt.toISOString()}, contentLen=${it.content.length}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
