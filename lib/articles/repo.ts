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

// ───── 단건 template claim (run-summarize.ts worker pool) ──
// 여러 worker 가 동시에 처리하므로 race-safe claim 패턴.
//   1) 가장 오래된 1건 SELECT (id + 모든 컬럼 + content)
//   2) DELETE WHERE id=X RETURNING id  → 한 worker 만 성공 (PostgreSQL row lock)
//   3) 못 받으면 retry (다른 worker 가 가져감)
//
// claim 시점에 template 은 이미 사라진다. 이후 summarize/applySummary 가 실패해도
// template 은 이미 삭제됐으니 "100% 삭제" 요건 자동 충족. 잃은 건은 다음 cron 사이클이
// 네이버에서 다시 가져온다.
export interface ClaimedTemplate {
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
  publishedAt: string; // ISO string (article INSERT 에 그대로 사용)
  content: string;
}

export async function claimOldestTemplate(): Promise<ClaimedTemplate | null> {
  if (shouldMock()) return null;
  const supabase = getSupabaseAdminClient();

  // race 발생 시 retry. concurrency=3 정도면 보통 1~2회 안에 성공.
  for (let attempt = 0; attempt < 10; attempt++) {
    // 1) 가장 오래된 1건 (full)
    const { data: oldest, error: e1 } = await supabase
      .from("article_template")
      .select(
        "id, source, source_publisher_id, source_article_id, source_section_id, section, title, link, thumbnail_link, publisher, author, published_at, article_content_template!inner(content)",
      )
      .order("scraped_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (e1) throw e1;
    if (!oldest) return null; // 빈 큐

    // 2) atomic claim — DELETE WHERE id=X
    //    동일 row 를 받은 다른 worker 와 race. PostgreSQL 이 한 명만 통과시킴.
    const { data: claimed, error: e2 } = await supabase
      .from("article_template")
      .delete()
      .eq("id", oldest.id)
      .select("id")
      .maybeSingle();
    if (e2) throw e2;
    if (!claimed) continue; // 다른 worker 가 가져감 → 다음 후보 다시 시도

    const contentRaw = oldest.article_content_template as
      | { content: string }
      | { content: string }[];
    const content = Array.isArray(contentRaw)
      ? contentRaw[0]?.content ?? ""
      : contentRaw?.content ?? "";

    return {
      id: oldest.id as number,
      source: String(oldest.source ?? "NAVER"),
      sourcePublisherId: (oldest.source_publisher_id as string | null) ?? null,
      sourceArticleId: String(oldest.source_article_id),
      sourceSectionId: (oldest.source_section_id as string | null) ?? null,
      section: oldest.section as SectionCode,
      title: String(oldest.title ?? ""),
      link: String(oldest.link ?? ""),
      thumbnailLink: (oldest.thumbnail_link as string | null) ?? null,
      publisher: (oldest.publisher as string | null) ?? null,
      author: (oldest.author as string | null) ?? null,
      publishedAt: String(oldest.published_at),
      content,
    };
  }
  // 10회 race retry 다 실패 → burst 상황, 일단 포기 (다음 worker 호출에서 재개)
  return null;
}

// 스크랩 시작 직전 호출 — article_template 통째 삭제.
// 직전 사이클이 timeout/캔슬되어 정리 못 한 잔존 template 을 일괄 청소한다.
// article_content_template 은 ON DELETE CASCADE 로 자동 정리.
// 새 스크랩은 clean slate 에서 시작 → summarize 단계의 UNIQUE 충돌 발생 자체를 막는다.
export async function deleteAllArticleTemplates(): Promise<number> {
  if (shouldMock()) return 0;
  const supabase = getSupabaseAdminClient();
  // postgrest 는 unconditional delete 를 거부 → id >= 0 로 모든 row 매칭.
  const { error, count } = await supabase
    .from("article_template")
    .delete({ count: "exact" })
    .gte("id", 0);
  if (error) throw error;
  return count ?? 0;
}

// scrape 단계 dedup: article 테이블에 이미 있는 source_article_id 집합 반환.
// flowpick FilterDuplicates 와 동일 역할.
export async function fetchExistingArticleSourceIds(
  ids: string[],
): Promise<Set<string>> {
  if (shouldMock() || ids.length === 0) return new Set();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("article")
    .select("source_article_id")
    .in("source_article_id", ids);
  if (error) throw error;
  return new Set((data ?? []).map((r) => String(r.source_article_id)));
}

// ───── 요약 결과 저장 (cron summarize) ───────────────────
// claim 단계에서 template 데이터를 이미 받았으므로 여기선 article + 자식 row 만 INSERT.
//   1) article INSERT → 2) content INSERT → 3) summary INSERT → 4) key_term INSERT
// 부분 실패 시 article DELETE (FK CASCADE 로 후속 row 자동 정리).
export interface SummaryPayload {
  titleTheme: string;
  summary: string;
  easyExplanation: string;
  finalConclusion: string;
  keyTerms: { term: string; explanation: string }[];
}

export async function applySummary(
  template: ClaimedTemplate,
  payload: SummaryPayload,
  model: string,
): Promise<number | null> {
  if (shouldMock()) return null;
  const supabase = getSupabaseAdminClient();

  // 1) article 승격
  const { data: art, error: artErr } = await supabase
    .from("article")
    .insert({
      source: template.source,
      source_publisher_id: template.sourcePublisherId,
      source_article_id: template.sourceArticleId,
      source_section_id: template.sourceSectionId,
      section: template.section,
      title: template.title,
      link: template.link,
      thumbnail_link: template.thumbnailLink,
      publisher: template.publisher,
      author: template.author,
      published_at: template.publishedAt,
    })
    .select("id")
    .maybeSingle();
  if (artErr) throw artErr;
  if (!art) throw new Error(`article insert returned no row tplId=${template.id}`);
  const articleId = art.id as number;

  try {
    // 2) content / summary / key_terms
    const { error: cErr } = await supabase
      .from("article_content")
      .insert({ id: articleId, content: template.content });
    if (cErr) throw cErr;

    const { error: sErr } = await supabase.from("article_summary").insert({
      article_id: articleId,
      title_theme: payload.titleTheme,
      summary: payload.summary,
      easy_explanation: payload.easyExplanation,
      final_conclusion: payload.finalConclusion,
      model,
    });
    if (sErr) throw sErr;

    if (payload.keyTerms.length > 0) {
      const { error: kErr } = await supabase.from("article_key_term").insert(
        payload.keyTerms.map((t, i) => ({
          article_id: articleId,
          term: t.term,
          explanation: t.explanation,
          position: i + 1,
        })),
      );
      if (kErr) throw kErr;
    }
  } catch (e) {
    // 부분 실패 시 article 롤백 — FK CASCADE 로 content/summary/key_term 까지 정리됨.
    await supabase.from("article").delete().eq("id", articleId);
    throw e;
  }

  return articleId;
}
