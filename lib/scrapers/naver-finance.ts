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
const FINANCE_LIST_URL =
  "https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101&section_id2=258&section_id3=403";

const MAX_PER_SECTION = 30;

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
            thumbnailLink: null, // finance 목록에는 썸네일 거의 없음
            publisher: detail.publisher ?? item.publisher,
            author: null,
            publishedAt: detail.publishedAt ?? item.publishedAt,
            content: detail.content,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`[naver-finance] detail fail ${item.link}`, e);
      }
      await sleep(REQUEST_DELAY_MS);
    }
    return out;
  },
};

interface ListItem {
  title: string;
  link: string;
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
  if (!articleMatch) return null;
  return {
    articleId: articleMatch[1],
    publisherId: officeMatch?.[1] ?? "00000",
  };
}

function parseList(html: string): ListItem[] {
  const $ = load(html);
  const items: ListItem[] = [];

  $("ul.newsList li").each((_, el) => {
    const $el = $(el);
    const a = $el.find("dt.articleSubject a").first();
    const link = a.attr("href") ?? "";
    if (!link) return;
    const fullLink = link.startsWith("http")
      ? link
      : `https://finance.naver.com${link}`;
    const ids = parseFinanceUrl(fullLink);
    if (!ids) return;
    const title = a.text().trim();
    const publisher = $el.find("span.press").text().trim() || null;
    const dateText = $el.find("span.wdate").text().trim();
    const publishedAt = parseKstToUtc(dateText) ?? new Date();
    items.push({ title, link: fullLink, publisher, publishedAt, ids });
  });

  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.link)) return false;
    seen.add(it.link);
    return true;
  });
}

interface DetailParsed {
  publisher: string | null;
  publishedAt: Date | null;
  content: string;
}

async function fetchDetail(url: string): Promise<DetailParsed | null> {
  const html = await fetchHtml(url);
  const $ = load(html);
  // finance 본문은 #news_read 또는 .articleCont 둘 중 하나
  const body = $("#news_read").length ? $("#news_read") : $(".articleCont");
  if (body.length === 0) return null;

  const cleaned = cleanContent($.html(body) || "");
  if (cleaned.replace(/<[^>]+>/g, "").trim().length < 50) return null;

  const publisher = $(".article_info .press").first().text().trim() || null;
  const dateText = $(".article_info .wdate").first().text().trim();
  const publishedAt = parseKstToUtc(dateText);

  return { publisher, publishedAt, content: cleaned };
}
