import type { SectionCode } from "@/lib/sections";

// API 응답에 노출되는 외부 표현. publishedAt 등 Date 는 ISO 문자열로.

export interface ArticleListItem {
  id: number;
  title: string;
  thumbnailLink: string | null;
  section: SectionCode;
  publisher: string | null;
  publishedAt: string;
  summary: {
    titleTheme: string;
    finalConclusion: string;
  };
}

export interface ArticleDetail {
  id: number;
  title: string;
  link: string;
  thumbnailLink: string | null;
  section: SectionCode;
  publisher: string | null;
  author: string | null;
  publishedAt: string;
  content: string;
  summary: {
    titleTheme: string;
    summary: string;
    easyExplanation: string;
    finalConclusion: string;
    keyTerms: { term: string; explanation: string }[];
  };
}

// 페이지네이션 응답 wrapper.
export interface PaginatedResponse<T> {
  data: T[];
  cursor: { next: string | null; hasNext: boolean };
}

export interface SuccessResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: { code: string; message: string };
}
