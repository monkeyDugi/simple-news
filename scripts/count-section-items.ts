// 각 섹션 메타 수집 건수만 측정. 본문 fetch 없음.
// 실행: node --env-file=.env.local node_modules/.bin/tsx scripts/count-section-items.ts

import { getScraperForSection } from "@/lib/scrapers";
import { SECTION_CODES } from "@/lib/sections";

async function main() {
  const t0 = Date.now();
  let total = 0;
  for (const section of SECTION_CODES) {
    const scraper = getScraperForSection(section);
    const items = await scraper.getNewsList(section);
    console.log(`${section}: ${items.length}건`);
    total += items.length;
  }
  console.log(`\n총 ${total}건 (elapsed=${Date.now() - t0}ms)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
