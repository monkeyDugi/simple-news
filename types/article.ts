import type { SectionCode } from "@/lib/sections";

// DB row 와 1:1 대응되는 도메인 모델. snake_case → camelCase 매핑은 repo 에서.

export interface Article {
  id: number;
  source: string;
  sourcePublisherId: string | null;
  sourceArticleId: string;
  sourceSectionId: string | null;
  section: SectionCode;
  title: string;
  link: string;
  thumbnailLink: string | null;
  publisher: string | null;
  author: string | null;
  publishedAt: Date;
  createdAt: Date;
}

export interface ArticleSummary {
  articleId: number;
  titleTheme: string;
  summary: string;
  easyExplanation: string;
  finalConclusion: string;
  model: string;
}

export interface ArticleKeyTerm {
  term: string;
  explanation: string;
}

// 스크래퍼가 article_template 에 넣기 전 단계의 raw shape.
export interface ScrapedArticle {
  source: string;
  sourcePublisherId: string | null;
  sourceArticleId: string;
  sourceSectionId: string;
  section: SectionCode;
  title: string;
  link: string;
  thumbnailLink: string | null;
  publisher: string | null;
  author: string | null;
  publishedAt: Date;
  content: string; // 정제된 HTML 본문
}
