import { load } from "cheerio";

import { getSection, type SectionCode } from "@/lib/sections";
import type { ScrapedArticle } from "@/types/article";

import {
  cleanContent,
  fetchHtml,
  parseKstToUtc,
  parseNaverArticleUrl,
} from "./shared";
import type { NewsListItem, Scraper } from "./types";

const NAVER_LIST_URL = (sectionId: string) =>
  `https://news.naver.com/section/${sectionId}`;

export const naverGeneralScraper: Scraper = {
  source: "NAVER",

  async getNewsList(section: SectionCode): Promise<NewsListItem[]> {
    const def = getSection(section);
    if (def.scraperKind !== "general") {
      throw new Error(
        `naver-general scraper does not handle section=${section}`,
      );
    }
    const html = await fetchHtml(NAVER_LIST_URL(def.naverSectionId));
    return parseList(html, section, def.naverSectionId);
  },

  async scrapeArticle(item: NewsListItem): Promise<ScrapedArticle | null> {
    const detail = await fetchDetail(item.link);
    if (!detail) return null;
    // flowpick 룰: author/publisher 없으면 스킵
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
      publishedAt: detail.publishedAt,
      content: detail.content,
    };
  },
};

interface RawListItem {
  title: string;
  link: string;
  thumbnail: string | null;
  publisher: string | null;
  ids: { publisherId: string; articleId: string };
}

function parseList(
  html: string,
  section: SectionCode,
  naverSectionId: string,
): NewsListItem[] {
  const $ = load(html);
  const raw: RawListItem[] = [];

  $(".sa_item").each((_, el) => {
    const $el = $(el);
    const linkEl = $el.find(".sa_text_title").first();
    const link = linkEl.attr("href") ?? "";
    if (!link) return;
    const ids = parseNaverArticleUrl(link);
    if (!ids) return;
    const title = linkEl.find("strong").text().trim() || linkEl.text().trim();
    const img = $el.find(".sa_thumb_inner img").first();
    const thumbnail = img.attr("data-src") ?? img.attr("src") ?? null;
    const publisher = $el.find(".sa_text_press").text().trim() || null;
    raw.push({ title, link, thumbnail, publisher, ids });
  });

  const seen = new Set<string>();
  const out: NewsListItem[] = [];
  for (const it of raw) {
    if (seen.has(it.link)) continue;
    seen.add(it.link);
    out.push({
      source: "NAVER",
      sourcePublisherId: it.ids.publisherId,
      sourceArticleId: it.ids.articleId,
      sourceSectionId: naverSectionId,
      section,
      title: it.title,
      link: it.link,
      thumbnailLink: it.thumbnail,
      publisher: it.publisher,
    });
  }
  return out;
}

interface DetailParsed {
  publisher: string | null;
  author: string | null;
  publishedAt: Date;
  content: string;
}

async function fetchDetail(url: string): Promise<DetailParsed | null> {
  const html = await fetchHtml(url);
  const $ = load(html);
  const dic = $("#dic_area");
  if (dic.length === 0) return null;

  const cleaned = cleanContent($.html(dic) || "");
  // 광고/단신 의심: 본문이 너무 짧으면 스킵 (운영하면서 조정)
  if (cleaned.replace(/<[^>]+>/g, "").trim().length < 50) return null;

  const publisher =
    $(".media_end_head_top_logo img").attr("alt")?.trim() || null;
  const author =
    $(".media_end_head_journalist_name").first().text().trim() || null;
  const dateRaw =
    $(".media_end_head_info_datestamp_time").first().attr("data-date-time") ??
    $(".media_end_head_info_datestamp_time").first().attr("datetime") ??
    "";
  const publishedAt = parseKstToUtc(dateRaw) ?? new Date();

  return { publisher, author, publishedAt, content: cleaned };
}
