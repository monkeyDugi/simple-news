import { load } from "cheerio";

import type { ScrapedArticle } from "@/types/article";
import { getSection, type SectionCode } from "@/lib/sections";

import {
  REQUEST_DELAY_MS,
  cleanContent,
  fetchHtml,
  parseKstToUtc,
  sleep,
} from "./shared";
import type { Scraper } from "./types";

// 해외증시: 경제(101) → 증권(258) → 해외증시(403) 의 3차 분류.
// 일반 섹션과 URL/DOM 구조가 달라서 별도 어댑터.
//
// 페이지 특이사항 (2026-05-01 확인):
//  1) 응답 인코딩이 MS949 (HTML meta 는 utf-8 이라 거짓말, HTTP 헤더가 진실).
//     shared.fetchHtml 이 charset 헤더 보고 자동 디코딩.
//  2) 목록은 li.newsList > dl > dd.articleSubject 구조 (예전 ul.newsList li 와 다름).
//  3) finance 의 news_read.naver URL 은 92바이트 JS 리다이렉트만 내려보낸다:
//       <SCRIPT>top.location.href='https://n.news.naver.com/mnews/article/{office}/{article}';</SCRIPT>
//     그래서 본문은 일반 n.news 도메인에서 #dic_area 로 가져온다.
const FINANCE_LIST_URL =
  "https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101&section_id2=258&section_id3=403";

const MAX_PER_SECTION = 20;

export const naverFinanceScraper: Scraper = {
  source: "NAVER",

  async scrape(section: SectionCode): Promise<ScrapedArticle[]> {
    if (section !== "GLOBAL_MARKET") {
      throw new Error(
        `naver-finance scraper only supports GLOBAL_MARKET (got ${section})`,
      );
    }
    const def = getSection(section);

    const listHtml = await fetchHtml(FINANCE_LIST_URL);
    const items = parseList(listHtml);

    const out: ScrapedArticle[] = [];
    for (const item of items.slice(0, MAX_PER_SECTION)) {
      try {
        const detail = await fetchDetail(item.normalizedLink);
        if (detail) {
          out.push({
            source: "NAVER",
            sourcePublisherId: item.ids.publisherId,
            sourceArticleId: item.ids.articleId,
            sourceSectionId: def.naverSectionId,
            section,
            title: item.title,
            link: item.normalizedLink,
            thumbnailLink: item.thumbnail,
            publisher: detail.publisher ?? item.publisher,
            author: detail.author,
            publishedAt: detail.publishedAt ?? item.publishedAt,
            content: detail.content,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`[naver-finance] detail fail ${item.normalizedLink}`, e);
      }
      await sleep(REQUEST_DELAY_MS);
    }
    return out;
  },
};

interface ListItem {
  title: string;
  normalizedLink: string; // n.news.naver.com 으로 변환된 최종 본문 URL
  thumbnail: string | null;
  publisher: string | null;
  publishedAt: Date;
  ids: { publisherId: string; articleId: string };
}

// finance 의 article_id, office_id 는 query parameter 로.
function parseFinanceUrl(
  url: string,
): { publisherId: string; articleId: string } | null {
  const articleMatch = url.match(/article_id=(\d+)/);
  const officeMatch = url.match(/office_id=(\d+)/);
  if (!articleMatch || !officeMatch) return null;
  return {
    articleId: articleMatch[1],
    publisherId: officeMatch[1],
  };
}

function parseList(html: string): ListItem[] {
  const $ = load(html);
  const items: ListItem[] = [];

  $("dd.articleSubject").each((_, el) => {
    const $el = $(el);
    const a = $el.find("a").first();
    const rawLink = a.attr("href") ?? "";
    if (!rawLink) return;
    const fullLink = rawLink.startsWith("http")
      ? rawLink
      : `https://finance.naver.com${rawLink}`;
    const ids = parseFinanceUrl(fullLink);
    if (!ids) return;

    // 본문은 어차피 n.news 로 리다이렉트되니 처음부터 그쪽 URL 로.
    const normalizedLink = `https://n.news.naver.com/mnews/article/${ids.publisherId}/${ids.articleId}`;

    const title = (a.attr("title") || a.text()).trim();
    if (!title) return;

    // dl 내부의 형제로 dd.articleSummary 가 있고 그 안에 .press / .wdate 가 있다.
    const $dl = $el.closest("dl");
    const summary = $dl.find("dd.articleSummary").first();
    const publisher = summary.find(".press").first().text().trim() || null;
    const dateText = summary.find(".wdate").first().text().trim();
    const publishedAt = parseKstToUtc(dateText) ?? new Date();

    // 썸네일은 형제 dt.thumb > a > img.
    const thumb = $dl.find("dt.thumb img").first();
    const thumbnail =
      thumb.attr("data-src") || thumb.attr("src") || null;

    items.push({
      title,
      normalizedLink,
      thumbnail,
      publisher,
      publishedAt,
      ids,
    });
  });

  // 같은 기사가 상단/일반 영역에 중복 노출되는 경우 제거.
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.normalizedLink)) return false;
    seen.add(it.normalizedLink);
    return true;
  });
}

interface DetailParsed {
  publisher: string | null;
  author: string | null;
  publishedAt: Date | null;
  content: string;
}

// n.news.naver.com 본문은 일반 섹션과 동일한 #dic_area 구조.
async function fetchDetail(url: string): Promise<DetailParsed | null> {
  const html = await fetchHtml(url);
  const $ = load(html);
  const dic = $("#dic_area");
  if (dic.length === 0) return null;

  const cleaned = cleanContent($.html(dic) || "");
  if (cleaned.replace(/<[^>]+>/g, "").trim().length < 50) return null;

  const publisher =
    $(".media_end_head_top_logo img").attr("alt")?.trim() || null;
  const author =
    $(".media_end_head_journalist_name").first().text().trim() || null;
  const dateRaw =
    $(".media_end_head_info_datestamp_time").first().attr("data-date-time") ??
    $(".media_end_head_info_datestamp_time").first().attr("datetime") ??
    "";
  const publishedAt = parseKstToUtc(dateRaw);

  return { publisher, author, publishedAt, content: cleaned };
}
