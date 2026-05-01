import type { ScrapedArticle } from "@/types/article";
import type { SectionCode } from "@/lib/sections";

// 목록 단계에서 추출되는 메타. 본문 fetch 전 dedup 용.
export interface NewsListItem {
  source: string;                    // "NAVER" 등
  sourcePublisherId: string | null;
  sourceArticleId: string;           // dedup key
  sourceSectionId: string;
  section: SectionCode;
  title: string;
  link: string;
  thumbnailLink: string | null;
  publisher: string | null;
}

// 모든 소스의 스크래퍼 인터페이스 (flowpick 패턴: 목록/본문 분리).
//   getNewsList: 섹션 페이지 1번 fetch → 메타만 (본문 X)
//   scrapeArticle: 개별 기사 본문 fetch + 합쳐서 ScrapedArticle 반환
export interface Scraper {
  readonly source: string;
  getNewsList(section: SectionCode): Promise<NewsListItem[]>;
  scrapeArticle(item: NewsListItem): Promise<ScrapedArticle | null>;
}
