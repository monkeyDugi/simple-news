import {
  getArticleDetail as repoGetArticleDetail,
  listArticlesBySection,
  type ArticleListRow,
  type ArticleDetailRow,
} from "@/lib/articles/repo";
import { ApiError } from "@/lib/errors";
import type { ArticleDetail, ArticleListItem } from "@/types/api";
import { isSectionCode, type SectionCode } from "@/lib/sections";
import { decodeCursor, encodeCursor } from "@/lib/utils/cursor";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

export interface ListInput {
  section: string | null;
  cursor: string | null;
  limit: string | null;
}

export interface ListOutput {
  data: ArticleListItem[];
  cursor: { next: string | null; hasNext: boolean };
}

// 라우트 핸들러에서 받은 raw query 를 검증·파싱 후 repo 호출까지 책임.
export async function getArticleList(input: ListInput): Promise<ListOutput> {
  if (!input.section) throw new ApiError("INVALID_SECTION");
  if (!isSectionCode(input.section)) throw new ApiError("INVALID_SECTION");
  const section: SectionCode = input.section;

  const limit = parseLimit(input.limit);

  let cursorState: { publishedAt: Date; id: number } | undefined;
  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (!decoded) throw new ApiError("INVALID_CURSOR");
    cursorState = decoded;
  }

  const { rows, hasMore } = await listArticlesBySection({
    section,
    cursor: cursorState,
    limit,
  });

  const data = rows.map(toListItem);
  const last = rows[rows.length - 1];
  const next =
    hasMore && last
      ? encodeCursor(last.article.publishedAt, last.article.id)
      : null;

  return {
    data,
    cursor: { next, hasNext: hasMore },
  };
}

function parseLimit(raw: string | null): number {
  if (raw == null) return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1 || n > MAX_LIMIT) {
    throw new ApiError("INVALID_LIMIT");
  }
  return n;
}

function toListItem(row: ArticleListRow): ArticleListItem {
  return {
    id: row.article.id,
    title: row.article.title,
    thumbnailLink: row.article.thumbnailLink,
    section: row.article.section,
    publisher: row.article.publisher,
    publishedAt: row.article.publishedAt.toISOString(),
    summary: {
      titleTheme: row.summary.titleTheme,
      finalConclusion: row.summary.finalConclusion,
    },
  };
}

export async function getArticleDetailById(rawId: string): Promise<ArticleDetail> {
  const id = Number.parseInt(rawId, 10);
  if (Number.isNaN(id) || id < 1) throw new ApiError("INVALID_ARTICLE_ID");

  const row = await repoGetArticleDetail(id);
  if (!row) throw new ApiError("ARTICLE_NOT_FOUND");

  return toDetail(row);
}

function toDetail(row: ArticleDetailRow): ArticleDetail {
  return {
    id: row.article.id,
    title: row.article.title,
    link: row.article.link,
    thumbnailLink: row.article.thumbnailLink,
    section: row.article.section,
    publisher: row.article.publisher,
    author: row.article.author,
    publishedAt: row.article.publishedAt.toISOString(),
    content: row.content,
    summary: {
      titleTheme: row.summary.titleTheme,
      summary: row.summary.summary,
      easyExplanation: row.summary.easyExplanation,
      finalConclusion: row.summary.finalConclusion,
      keyTerms: row.keyTerms,
    },
  };
}
