import { load } from "cheerio";

import type { ScrapedArticle } from "@/types/article";
import { getSection, type SectionCode } from "@/lib/sections";

import { cleanContent, fetchHtml, parseKstToUtc } from "./shared";
import type { NewsListItem, Scraper } from "./types";

// 해외증시: 경제(101) → 증권(258) → 해외증시(403) 의 3차 분류.
// 일반 섹션과 URL/DOM 구조가 달라서 별도 어댑터.
const FINANCE_LIST_URL =
  "https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101&section_id2=258&section_id3=403";

export const naverFinanceScraper: Scraper = {
  source: "NAVER",

  async getNewsList(section: SectionCode): Promise<NewsListItem[]> {
    if (section !== "GLOBAL_MARKET") {
      throw new Error(
        `naver-finance scraper only supports GLOBAL_MARKET (got ${section})`,
      );
    }
    const def = getSection(section);
    const html = await fetchHtml(FINANCE_LIST_URL);
    return parseList(html, section, def.naverSectionId);
  },

  async scrapeArticle(item: NewsListItem): Promise<ScrapedArticle | null> {
    const detail = await fetchDetail(item.link);
    if (!detail) return null;
    if (!detail.publisher && !item.publisher) return null;
    return {
      source: item.source,
      sourcePublisherId: item.sourcePublisherId,
      sourceArticleId: item.sourceArticleId,
      sourceSectionId: item.sourceSectionId,
      section: item.section,
      title: item.title,
      link: item.link,
      thumbnailLink: item.thumbnailLink,
      publisher: detail.publisher ?? item.publisher,
      author: detail.author,
      publishedAt: detail.publishedAt ?? new Date(),
      content: detail.content,
    };
  },
};

interface RawFinanceItem {
  title: string;
  normalizedLink: string;
  thumbnail: string | null;
  publisher: string | null;
  ids: { publisherId: string; articleId: string };
}

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

function parseList(
  html: string,
  section: SectionCode,
  naverSectionId: string,
): NewsListItem[] {
  const $ = load(html);
  const raw: RawFinanceItem[] = [];

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

    const $dl = $el.closest("dl");
    const summary = $dl.find("dd.articleSummary").first();
    const publisher = summary.find(".press").first().text().trim() || null;

    const thumb = $dl.find("dt.thumb img").first();
    const thumbnail = thumb.attr("data-src") || thumb.attr("src") || null;

    raw.push({ title, normalizedLink, thumbnail, publisher, ids });
  });

  const seen = new Set<string>();
  const out: NewsListItem[] = [];
  for (const it of raw) {
    if (seen.has(it.normalizedLink)) continue;
    seen.add(it.normalizedLink);
    out.push({
      source: "NAVER",
      sourcePublisherId: it.ids.publisherId,
      sourceArticleId: it.ids.articleId,
      sourceSectionId: naverSectionId,
      section,
      title: it.title,
      link: it.normalizedLink,
      thumbnailLink: it.thumbnail,
      publisher: it.publisher,
    });
  }
  return out;
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
