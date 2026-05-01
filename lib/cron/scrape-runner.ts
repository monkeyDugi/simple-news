import {
  fetchExistingArticleSourceIds,
  insertArticleTemplate,
} from "@/lib/articles/repo";
import { getScraperForSection } from "@/lib/scrapers";
import { REQUEST_DELAY_MS, sleep } from "@/lib/scrapers/shared";
import type { NewsListItem } from "@/lib/scrapers/types";
import { SECTION_CODES, type SectionCode } from "@/lib/sections";

// flowpick CollectNews 패턴: collect → filter → scrape&save 3단계.
//   1) Collect:   7섹션 페이지 fetch → NewsListItem (메타만, 본문 X)
//   2) Filter:    article 테이블에서 source_article_id 비교로 신규만 추림
//   3) Scrape&Save: 신규에 한해서만 본문 fetch + article_template 저장
// 핵심 효과: 네이버 본문 호출 = 신규 건수 만큼만 (기존엔 항상 7×30 = 210회 호출)

export interface ScrapeReport {
  totalNew: number;
  perSection: Record<SectionCode, number>;
  errors: { section: SectionCode; message: string }[];
}

export async function runScrapeAll(): Promise<ScrapeReport> {
  const perSection = {} as Record<SectionCode, number>;
  for (const s of SECTION_CODES) perSection[s] = 0;
  const errors: ScrapeReport["errors"] = [];

  // 1) Collect — 섹션 목록만 fetch
  const allItems: NewsListItem[] = [];
  for (const section of SECTION_CODES) {
    try {
      const scraper = getScraperForSection(section);
      const items = await scraper.getNewsList(section);
      allItems.push(...items);
    } catch (e) {
      errors.push({
        section,
        message: e instanceof Error ? e.message : String(e),
      });
      // eslint-disable-next-line no-console
      console.error(`[cron/scrape] collect failed section=${section}`, e);
    }
  }

  if (allItems.length === 0) {
    return { totalNew: 0, perSection, errors };
  }

  // 2) Filter — DB 에 이미 있는 source_article_id 제외
  const existing = await fetchExistingArticleSourceIds(
    allItems.map((i) => i.sourceArticleId),
  );
  const newItems = allItems.filter(
    (i) => !existing.has(i.sourceArticleId),
  );

  // 3) Scrape&Save — 신규에 한해서만 본문 fetch + insert. 호출 사이 sleep 으로 봇 보호 회피.
  let totalNew = 0;
  for (const item of newItems) {
    try {
      const scraper = getScraperForSection(item.section);
      const detail = await scraper.scrapeArticle(item);
      if (!detail) continue;
      const result = await insertArticleTemplate({
        source: detail.source,
        sourceArticleId: detail.sourceArticleId,
        sourceSectionId: detail.sourceSectionId,
        section: detail.section,
        title: detail.title,
        link: detail.link,
        thumbnailLink: detail.thumbnailLink,
        publisher: detail.publisher,
        author: detail.author,
        publishedAt: detail.publishedAt,
        content: detail.content,
      });
      if (result.inserted) {
        perSection[item.section] += 1;
        totalNew += 1;
      }
    } catch (e) {
      // 한 기사 실패는 전체 cron 을 막지 않음.
      // eslint-disable-next-line no-console
      console.error(
        `[cron/scrape] scrape failed section=${item.section} link=${item.link}`,
        e,
      );
    }
    await sleep(REQUEST_DELAY_MS);
  }

  return { totalNew, perSection, errors };
}
