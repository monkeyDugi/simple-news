import { load } from "cheerio";

import { getSection, type SectionCode } from "@/lib/sections";
import type { ScrapedArticle } from "@/types/article";

import {
  REQUEST_DELAY_MS,
  cleanContent,
  fetchHtml,
  parseKstToUtc,
  parseNaverArticleUrl,
  sleep,
} from "./shared";
import type { Scraper } from "./types";

const NAVER_LIST_URL = (sectionId: string) =>
  `https://news.naver.com/section/${sectionId}`;

// 한 섹션당 최대 처리 건수. 운영 부하 방지 + AI 요약 비용 통제.
// REQUEST_DELAY_MS 1500ms 와 5분 maxDuration 안에 7섹션 다 들어가게 20 으로 컷.
const MAX_PER_SECTION = 20;

export const naverGeneralScraper: Scraper = {
  source: "NAVER",

  async scrape(section: SectionCode): Promise<ScrapedArticle[]> {
    const def = getSection(section);
    if (def.scraperKind !== "general") {
      throw new Error(
        `naver-general scraper does not handle section=${section}`,
      );
    }

    const listHtml = await fetchHtml(NAVER_LIST_URL(def.naverSectionId));
    const items = parseList(listHtml);

    const out: ScrapedArticle[] = [];
    for (const item of items.slice(0, MAX_PER_SECTION)) {
      try {
        const detail = await fetchDetail(item.link);
        if (detail) {
          out.push({
            source: "NAVER",
            sourcePublisherId: item.ids.publisherId,
            sourceArticleId: item.ids.articleId,
            sourceSectionId: def.naverSectionId,
            section,
            title: item.title,
            link: item.link,
            thumbnailLink: item.thumbnail,
            publisher: detail.publisher ?? item.publisher,
            author: detail.author,
            publishedAt: detail.publishedAt,
            content: detail.content,
          });
        }
      } catch (e) {
        // 한 기사 실패는 섹션 전체를 막지 않는다.
        // eslint-disable-next-line no-console
        console.error(`[naver-general] detail fail ${item.link}`, e);
      }
      await sleep(REQUEST_DELAY_MS);
    }
    return out;
  },
};

interface ListItem {
  title: string;
  link: string;
  thumbnail: string | null;
  publisher: string | null;
  ids: { publisherId: string; articleId: string };
}

function parseList(html: string): ListItem[] {
  const $ = load(html);
  const items: ListItem[] = [];

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
    items.push({ title, link, thumbnail, publisher, ids });
  });

  // 같은 기사가 여러 영역에 노출되는 경우 dedup.
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  });
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
