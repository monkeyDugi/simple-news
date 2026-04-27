import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { findMockBundle, getMockBundles } from "@/lib/mocks/articles";
import type {
  Article,
  ArticleKeyTerm,
  ArticleSummary,
} from "@/types/article";
import type { SectionCode } from "@/lib/sections";

// ───── 모킹 토글 ─────────────────────────────────────────
// MOCK_SUPABASE=true 거나 키가 비어있으면 fixture 사용.
function shouldMock(): boolean {
  if (process.env.MOCK_SUPABASE === "true") return true;
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    return true;
  }
  return false;
}

// ───── 응답 형태 ─────────────────────────────────────────
export interface ArticleListRow {
  article: Article;
  summary: { titleTheme: string; finalConclusion: string };
}

export interface ArticleDetailRow {
  article: Article;
  content: string;
  summary: ArticleSummary;
  keyTerms: ArticleKeyTerm[];
}

export interface ListOpts {
  section: SectionCode;
  cursor?: { publishedAt: Date; id: number };
  limit: number; // 1~30
}

// ───── 목록 ──────────────────────────────────────────────
export async function listArticlesBySection(
  opts: ListOpts,
): Promise<{ rows: ArticleListRow[]; hasMore: boolean }> {
  if (shouldMock()) return mockList(opts);
  return realList(opts);
}

function mockList(opts: ListOpts): { rows: ArticleListRow[]; hasMore: boolean } {
  let bundles = getMockBundles().filter((b) => b.article.section === opts.section);
  // 정렬: published_at DESC, id DESC
  bundles.sort((a, b) => {
    const t = b.article.publishedAt.getTime() - a.article.publishedAt.getTime();
    return t !== 0 ? t : b.article.id - a.article.id;
  });
  // 커서 적용: (publishedAt, id) < (cursor.publishedAt, cursor.id)
  if (opts.cursor) {
    const c = opts.cursor;
    bundles = bundles.filter((b) => {
      const t = b.article.publishedAt.getTime();
      const ct = c.publishedAt.getTime();
      if (t !== ct) return t < ct;
      return b.article.id < c.id;
    });
  }
  const sliced = bundles.slice(0, opts.limit + 1);
  const hasMore = sliced.length > opts.limit;
  const rows = sliced.slice(0, opts.limit).map((b) => ({
    article: b.article,
    summary: {
      titleTheme: b.summary.titleTheme,
      finalConclusion: b.summary.finalConclusion,
    },
  }));
  return { rows, hasMore };
}

async function realList(
  opts: ListOpts,
): Promise<{ rows: ArticleListRow[]; hasMore: boolean }> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("article")
    .select(
      "id, source, source_publisher_id, source_article_id, source_section_id, section, title, link, thumbnail_link, publisher, author, published_at, created_at, article_summary!inner(title_theme, final_conclusion)",
    )
    .eq("section", opts.section)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(opts.limit + 1);

  if (opts.cursor) {
    const iso = opts.cursor.publishedAt.toISOString();
    // (published_at, id) < (cursor) 를 .or() 로 표현
    query = query.or(
      `published_at.lt.${iso},and(published_at.eq.${iso},id.lt.${opts.cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []).slice(0, opts.limit).map((row) => mapListRow(row));
  const hasMore = (data?.length ?? 0) > opts.limit;
  return { rows, hasMore };
}

// ───── 상세 ──────────────────────────────────────────────
export async function getArticleDetail(
  id: number,
): Promise<ArticleDetailRow | null> {
  if (shouldMock()) {
    const bundle = findMockBundle(id);
    if (!bundle) return null;
    return {
      article: bundle.article,
      content: bundle.content,
      summary: bundle.summary,
      keyTerms: bundle.keyTerms,
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("article")
    .select(
      "id, source, source_publisher_id, source_article_id, source_section_id, section, title, link, thumbnail_link, publisher, author, published_at, created_at, article_content(content), article_summary(title_theme, summary, easy_explanation, final_conclusion, model), article_key_term(term, explanation, position)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapDetailRow(data);
}

// ───── snake_case → camelCase 매핑 ───────────────────────
// (Database 타입이 placeholder 라 row 는 unknown 으로 받아 직접 좁힌다)
type Snake<T> = Record<string, unknown> & T;

function toArticle(row: Snake<{ id: number }>): Article {
  return {
    id: row.id,
    source: String(row.source ?? "NAVER"),
    sourcePublisherId: (row.source_publisher_id as string | null) ?? null,
    sourceArticleId: String(row.source_article_id ?? ""),
    sourceSectionId: (row.source_section_id as string | null) ?? null,
    section: row.section as SectionCode,
    title: String(row.title ?? ""),
    link: String(row.link ?? ""),
    thumbnailLink: (row.thumbnail_link as string | null) ?? null,
    publisher: (row.publisher as string | null) ?? null,
    author: (row.author as string | null) ?? null,
    publishedAt: new Date(String(row.published_at)),
    createdAt: new Date(String(row.created_at ?? row.published_at)),
  };
}

function mapListRow(row: Snake<{ id: number }>): ArticleListRow {
  // article_summary 는 1:1 inner join 이지만 supabase 가 array 로 반환할 수 있다
  const summaryRaw = row.article_summary as
    | { title_theme: string; final_conclusion: string }
    | { title_theme: string; final_conclusion: string }[]
    | undefined;
  const s = Array.isArray(summaryRaw) ? summaryRaw[0] : summaryRaw;
  return {
    article: toArticle(row),
    summary: {
      titleTheme: s?.title_theme ?? "",
      finalConclusion: s?.final_conclusion ?? "",
    },
  };
}

function mapDetailRow(row: Snake<{ id: number }>): ArticleDetailRow {
  const contentRaw = row.article_content as
    | { content: string }
    | { content: string }[]
    | null
    | undefined;
  const c = Array.isArray(contentRaw) ? contentRaw[0] : contentRaw;

  const summaryRaw = row.article_summary as
    | Snake<{ title_theme: string }>
    | Snake<{ title_theme: string }>[]
    | null
    | undefined;
  const s = Array.isArray(summaryRaw) ? summaryRaw[0] : summaryRaw;

  const termsRaw = row.article_key_term as
    | { term: string; explanation: string; position: number }[]
    | null
    | undefined;
  const terms = (termsRaw ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((t) => ({ term: t.term, explanation: t.explanation }));

  return {
    article: toArticle(row),
    content: c?.content ?? "",
    summary: {
      articleId: row.id,
      titleTheme: String(s?.title_theme ?? ""),
      summary: String(s?.summary ?? ""),
      easyExplanation: String(s?.easy_explanation ?? ""),
      finalConclusion: String(s?.final_conclusion ?? ""),
      model: String(s?.model ?? ""),
    },
    keyTerms: terms,
  };
}

// ───── INSERT 계열 (스크래퍼/요약에서 사용) ──────────────────
// article_template 추가. UNIQUE 충돌은 무시 (이미 스크랩된 기사).
export async function insertArticleTemplate(payload: {
  source: string;
  sourceArticleId: string;
  sourceSectionId: string | null;
  section: SectionCode;
  title: string;
  link: string;
  thumbnailLink: string | null;
  publisher: string | null;
  author: string | null;
  publishedAt: Date;
  content: string;
}): Promise<{ inserted: boolean; templateId: number | null }> {
  if (shouldMock()) {
    // 모킹 모드: 메모리 저장 안 함. inserted=true 만 반환.
    return { inserted: true, templateId: null };
  }
  const supabase = getSupabaseAdminClient();
  const { data: tplRow, error: tplErr } = await supabase
    .from("article_template")
    .insert({
      source: payload.source,
      source_article_id: payload.sourceArticleId,
      source_section_id: payload.sourceSectionId,
      section: payload.section,
      title: payload.title,
      link: payload.link,
      thumbnail_link: payload.thumbnailLink,
      publisher: payload.publisher,
      author: payload.author,
      published_at: payload.publishedAt.toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (tplErr) {
    // 23505 = unique_violation → 이미 스크랩된 기사
    if ((tplErr as { code?: string }).code === "23505") {
      return { inserted: false, templateId: null };
    }
    throw tplErr;
  }

  if (!tplRow) return { inserted: false, templateId: null };

  const { error: contentErr } = await supabase
    .from("article_content_template")
    .insert({ id: tplRow.id, content: payload.content });
  if (contentErr) throw contentErr;

  return { inserted: true, templateId: tplRow.id as number };
}
