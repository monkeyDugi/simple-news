import { load } from "cheerio";

import {
  naverFinanceDetailHtml,
  naverFinanceListHtml,
  naverGeneralDetailHtml,
  naverGeneralListHtml,
} from "@/lib/mocks/naver-html";

// 최신 Chrome (macOS) UA. Vercel 같은 클라우드 IP 에서는 네이버가 봇 감지에 더 엄격해서
// 사람 브라우저처럼 보이게 sec-ch-ua / Referer 까지 박는다.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

const BASE_HEADERS: HeadersInit = {
  "User-Agent": UA,
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// URL 기반으로 적절한 Referer 결정.
//   본문(n.news.naver.com 또는 mnews) → 목록 https://news.naver.com/
//   목록(news.naver.com/section/...) → 홈 https://news.naver.com/
//   finance(finance.naver.com) → finance 홈
function pickReferer(url: string): string {
  if (url.includes("finance.naver.com")) return "https://finance.naver.com/";
  if (url.includes("n.news.naver.com")) return "https://news.naver.com/";
  return "https://www.naver.com/";
}

// 네이버 봇 보호 대응: 본문 fetch 간 sleep.
// icn1 region 으로 옮기며 supabase latency 가 사라져 호출 간격이 1s 로 좁아지자
// 429 다발 → 1500ms 로 늘려 네이버 입장 호출 간격 ~2s 유지.
export const REQUEST_DELAY_MS = 1500;

export function shouldMockScraper(): boolean {
  return process.env.MOCK_SCRAPER === "true";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchHtml(url: string): Promise<string> {
  if (shouldMockScraper()) {
    return mockFetchHtml(url);
  }
  const headers: HeadersInit = {
    ...BASE_HEADERS,
    Referer: pickReferer(url),
  };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`fetch ${url} failed: HTTP ${res.status}`);

  // finance.naver.com 은 charset=MS949 로 내려오므로 Content-Type 을 보고 디코딩.
  // (HTML 의 meta 태그는 utf-8 이라고 거짓말하니 HTTP 헤더가 진실원.)
  const ct = res.headers.get("content-type") ?? "";
  const m = ct.match(/charset=([\w-]+)/i);
  const charset = m ? m[1].toLowerCase() : "utf-8";
  if (charset === "euc-kr" || charset === "ms949" || charset === "cp949") {
    const buf = await res.arrayBuffer();
    return new TextDecoder("euc-kr").decode(buf);
  }
  return res.text();
}

// URL 패턴으로 어떤 종류의 페이지인지 판정해서 적절한 fixture 를 반환.
function mockFetchHtml(url: string): string {
  // 일반 섹션 목록: news.naver.com/section/{naverSectionId}
  let m = url.match(/\/section\/(\d+)/);
  if (m) return naverGeneralListHtml(m[1]);
  // 일반 상세: n.news.naver.com/article/{publisherId}/{articleId}
  m = url.match(/\/article\/(\d+)\/(\d+)/);
  if (m) return naverGeneralDetailHtml(m[2]);
  // finance 목록
  if (url.includes("finance.naver.com/news/news_list")) {
    return naverFinanceListHtml();
  }
  // finance 상세
  m = url.match(/article_id=(\d+)/);
  if (m && url.includes("news_read")) return naverFinanceDetailHtml(m[1]);
  return "<html></html>";
}

// script/style/광고/저작권 등 노이즈 제거. 기사 본문 의미 외 요소 정리.
export function cleanContent(html: string): string {
  const $ = load(html);
  $(
    "script, style, .ad, .advert, .copyright, .reporter_area, iframe, video, object",
  ).remove();
  return $.root().html() ?? "";
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 네이버 시간 포맷이 다양하므로 여러 패턴을 시도.
//  - ISO 8601: "2026-04-26T10:23:00+09:00"
//  - 한글: "2026.04.26. 오전 10:23"
//  - data-date-time: "2026-04-26 10:23:00" (KST 가정)
export function parseKstToUtc(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  let m = trimmed.match(
    /^(\d{4})\.(\d{2})\.(\d{2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})/,
  );
  if (m) {
    const [, y, mo, d, ampm, h, mi] = m;
    let hour = parseInt(h, 10);
    if (ampm === "오후" && hour < 12) hour += 12;
    if (ampm === "오전" && hour === 12) hour = 0;
    const kstMs = Date.UTC(
      parseInt(y, 10),
      parseInt(mo, 10) - 1,
      parseInt(d, 10),
      hour,
      parseInt(mi, 10),
    );
    return new Date(kstMs - KST_OFFSET_MS);
  }

  m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    const kstMs = Date.UTC(
      parseInt(y, 10),
      parseInt(mo, 10) - 1,
      parseInt(d, 10),
      parseInt(h, 10),
      parseInt(mi, 10),
      parseInt(s ?? "0", 10),
    );
    return new Date(kstMs - KST_OFFSET_MS);
  }

  return null;
}

// "/article/00001/0000123456" → { publisherId, articleId }
export function parseNaverArticleUrl(
  url: string,
): { publisherId: string; articleId: string } | null {
  const m = url.match(/\/article\/(\d+)\/(\d+)/);
  if (!m) return null;
  return { publisherId: m[1], articleId: m[2] };
}
