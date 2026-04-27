import type {
  ArticleDetail,
  ArticleListItem,
  PaginatedResponse,
  SuccessResponse,
} from "@/types/api";
import type { SectionCode } from "@/lib/sections";

// 클라이언트 컴포넌트에서 호출하는 fetch 래퍼.
// Capacitor 빌드에서는 webview 내부가 file:// 라 상대 경로가 동작하지 않으므로
// NEXT_PUBLIC_API_BASE_URL 로 절대 URL 을 강제한다. dev 환경에서는 빈 문자열 = 상대 경로.
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface ListResponse {
  data: ArticleListItem[];
  cursor: { next: string | null; hasNext: boolean };
}

export async function fetchArticleList(opts: {
  section: SectionCode;
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ListResponse> {
  const params = new URLSearchParams({ section: opts.section });
  if (opts.cursor) params.set("cursor", opts.cursor);
  if (opts.limit) params.set("limit", String(opts.limit));

  const res = await fetch(`${BASE}/api/articles?${params}`, {
    signal: opts.signal,
    cache: "no-store",
  });
  if (!res.ok) throw await toError(res);
  return (await res.json()) as PaginatedResponse<ArticleListItem>;
}

export async function fetchArticleDetail(
  articleId: number | string,
  signal?: AbortSignal,
): Promise<ArticleDetail> {
  const res = await fetch(`${BASE}/api/articles/${articleId}`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw await toError(res);
  const json = (await res.json()) as SuccessResponse<ArticleDetail>;
  return json.data;
}

async function toError(res: Response): Promise<Error> {
  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string } };
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    const err = new Error(msg) as Error & { code?: string; status?: number };
    err.code = body?.error?.code;
    err.status = res.status;
    return err;
  } catch {
    return new Error(`HTTP ${res.status}`);
  }
}
