import { insertArticleTemplate } from "@/lib/articles/repo";
import { getScraperForSection } from "@/lib/scrapers";
import { SECTION_CODES, type SectionCode } from "@/lib/sections";

// Cron 의 비즈니스 로직 본체. 라우트는 인증 + 응답 정형화만 담당하도록 얇게.
// 7섹션을 순서대로 순회. 한 섹션 실패가 다른 섹션을 막지 않도록 try/catch 격리.

export interface ScrapeReport {
  totalNew: number;
  perSection: Record<SectionCode, number>;
  errors: { section: SectionCode; message: string }[];
}

export async function runScrapeAll(): Promise<ScrapeReport> {
  const perSection = {} as Record<SectionCode, number>;
  const errors: ScrapeReport["errors"] = [];
  let totalNew = 0;

  for (const section of SECTION_CODES) {
    try {
      const inserted = await scrapeOneSection(section);
      perSection[section] = inserted;
      totalNew += inserted;
    } catch (e) {
      perSection[section] = 0;
      errors.push({
        section,
        message: e instanceof Error ? e.message : String(e),
      });
      // eslint-disable-next-line no-console
      console.error(`[cron/scrape] section=${section} failed`, e);
    }
  }

  return { totalNew, perSection, errors };
}

async function scrapeOneSection(section: SectionCode): Promise<number> {
  const scraper = getScraperForSection(section);
  const items = await scraper.scrape(section);

  let inserted = 0;
  for (const item of items) {
    try {
      const result = await insertArticleTemplate({
        source: item.source,
        sourceArticleId: item.sourceArticleId,
        sourceSectionId: item.sourceSectionId,
        section: item.section,
        title: item.title,
        link: item.link,
        thumbnailLink: item.thumbnailLink,
        publisher: item.publisher,
        author: item.author,
        publishedAt: item.publishedAt,
        content: item.content,
      });
      if (result.inserted) inserted += 1;
    } catch (e) {
      // 한 기사 실패가 섹션 전체를 막지 않도록 격리.
      // eslint-disable-next-line no-console
      console.error(
        `[cron/scrape] insert fail section=${section} link=${item.link}`,
        e,
      );
    }
  }
  return inserted;
}
