import { getSection, type SectionCode } from "@/lib/sections";

import { naverFinanceScraper } from "./naver-finance";
import { naverGeneralScraper } from "./naver-general";
import type { Scraper } from "./types";

// 섹션 → 스크래퍼 디스패치. cron/scrape 에서 7섹션을 순회하며 호출.
export function getScraperForSection(section: SectionCode): Scraper {
  const def = getSection(section);
  return def.scraperKind === "general"
    ? naverGeneralScraper
    : naverFinanceScraper;
}

export { naverGeneralScraper, naverFinanceScraper };
export type { Scraper } from "./types";
