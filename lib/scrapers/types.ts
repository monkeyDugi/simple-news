import type { ScrapedArticle } from "@/types/article";
import type { SectionCode } from "@/lib/sections";

// 모든 소스의 스크래퍼는 이 인터페이스를 구현한다.
// V1 은 NaverGeneral / NaverFinance 두 종.
export interface Scraper {
  readonly source: string;
  scrape(section: SectionCode): Promise<ScrapedArticle[]>;
}
