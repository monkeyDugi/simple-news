// DB 안 거치고 scrape → summarize 흐름을 메모리로만 돌리는 드라이런.
// 운영 cron 의 최대 규모 (네이버 7섹션 페이지 1번 전수) 를 실측.
// 실행: node --env-file=.env.local node_modules/.bin/tsx scripts/test-cron-dryrun.ts
//
// 단건 직렬 구조 (2026-05-15 이후): 한 건씩 순차로 Bedrock 호출.

import { getScraperForSection } from "@/lib/scrapers";
import { REQUEST_DELAY_MS, sleep } from "@/lib/scrapers/shared";
import type { NewsListItem } from "@/lib/scrapers/types";
import { SECTION_CODES, type SectionCode } from "@/lib/sections";
import { summarizeOne } from "@/lib/summarization/anthropic";

interface FetchedArticle {
  section: SectionCode;
  title: string;
  content: string;
}

async function main() {
  const t0 = Date.now();

  // ─── 1) Collect ───────────────────────────────────────────
  console.log("=== 1) Collect (7섹션 메타 수집) ===");
  const allItems: { section: SectionCode; item: NewsListItem }[] = [];
  for (const section of SECTION_CODES) {
    const scraper = getScraperForSection(section);
    const items = await scraper.getNewsList(section);
    console.log(`  ${section}: ${items.length}건`);
    for (const it of items) allItems.push({ section, item: it });
  }
  console.log(
    `→ 총 ${allItems.length}건 (elapsed=${Date.now() - t0}ms)\n`,
  );

  // ─── 2) Scrape (본문 fetch) ──────────────────────────────
  console.log(
    `=== 2) Scrape — 본문 fetch (${REQUEST_DELAY_MS}ms sleep × ${allItems.length}건 → 약 ${Math.round((REQUEST_DELAY_MS * allItems.length) / 60_000)}분 예상) ===`,
  );
  const t1 = Date.now();
  const articles: FetchedArticle[] = [];
  let processed = 0;
  let scrapeFailed = 0;
  for (const { section, item } of allItems) {
    processed++;
    try {
      const scraper = getScraperForSection(section);
      const detail = await scraper.scrapeArticle(item);
      if (detail) {
        articles.push({
          section,
          title: detail.title,
          content: detail.content,
        });
      } else {
        scrapeFailed++;
      }
    } catch {
      scrapeFailed++;
    }
    if (processed % 30 === 0) {
      console.log(
        `  진행 ${processed}/${allItems.length} (성공 ${articles.length}, 실패 ${scrapeFailed})`,
      );
    }
    await sleep(REQUEST_DELAY_MS);
  }
  console.log(
    `→ 본문 fetch 성공 ${articles.length}/${allItems.length}건 (elapsed=${Date.now() - t1}ms)\n`,
  );

  // ─── 3) Summarize (1건씩 직렬) ───────────────────────────
  console.log(
    `=== 3) Summarize — 1건씩 직렬 (${articles.length}건) ===`,
  );
  const t2 = Date.now();
  let ok = 0;
  let failed = 0;
  let totalElapsedMs = 0;
  const samples: { section: SectionCode; finalConclusion: string }[] = [];
  const sectionSeen = new Set<SectionCode>();

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const bT0 = Date.now();
    try {
      const result = await summarizeOne({ title: a.title, content: a.content });
      const elapsed = Date.now() - bT0;
      totalElapsedMs += elapsed;
      ok += 1;
      if (!sectionSeen.has(a.section)) {
        sectionSeen.add(a.section);
        samples.push({ section: a.section, finalConclusion: result.finalConclusion });
      }
      if ((i + 1) % 10 === 0 || i + 1 === articles.length) {
        console.log(
          `  진행 ${i + 1}/${articles.length} ok=${ok} failed=${failed} (last=${elapsed}ms, avg=${Math.round(totalElapsedMs / (ok || 1))}ms)`,
        );
      }
    } catch (e) {
      failed += 1;
      console.error(
        `  [${a.section}] 실패 ${i + 1}/${articles.length}`,
        (e as Error).message,
      );
    }
  }
  console.log(
    `→ 요약 성공 ${ok}건 / 실패 ${failed}건 (elapsed=${Date.now() - t2}ms)\n`,
  );

  // ─── 4) 샘플 출력 ────────────────────────────────────────
  console.log("=== 4) 결과 샘플 (섹션별 첫 1건) ===");
  for (const s of samples) {
    console.log(`  [${s.section}] ${s.finalConclusion}`);
  }

  const total = Date.now() - t0;
  console.log(
    `\n=== TOTAL: ${total}ms (${Math.floor(total / 60_000)}분 ${Math.floor((total % 60_000) / 1000)}초) ===`,
  );
}

main().catch((e) => {
  console.error("[dryrun] fatal", e);
  process.exit(1);
});
