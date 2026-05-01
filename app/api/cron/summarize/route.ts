import { NextResponse } from "next/server";

import { fetchUnprocessedTemplates } from "@/lib/articles/repo";
import { assertCronAuthorized } from "@/lib/cron/auth";
import { toErrorBody } from "@/lib/errors";
import type { SectionCode } from "@/lib/sections";
import { summarizeAllPending } from "@/lib/summarization/batch";

// 미요약 article_template 을 섹션별 batch 로 OpenAI 에 보내 요약.
// 모델 호출 + RPC 트랜잭션이 batch 마다 일어나므로 maxDuration 을 넉넉히.
export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_FETCH_LIMIT = 200;

// Vercel Hobby 는 cron 1개당 하루 1회만 트리거 가능. 대신 cron 갯수는 100개까지 자유.
// 그래서 summarize cron 을 2개로 등록(KST 05:00 / 06:00 = UTC 20:00 / 21:00) 하고,
// route 가 호출 시점 UTC hour 로 어떤 그룹을 처리할지 분기한다.
//   - UTC 20:00 (KST 05:00) → group A: 정치/경제/사회/해외증시 (출근길 노출 가중)
//   - UTC 21:00 (KST 06:00) → group B: 생활문화/세계/IT
// Hobby 정확도 ±59분이라 UTC 20시대(20~20:59)와 21시대(21~21:59)는 hour 값으로 깔끔히 분리.
const SECTION_GROUPS: Record<"a" | "b", SectionCode[]> = {
  a: ["POLITICS", "ECONOMY", "SOCIETY", "GLOBAL_MARKET"],
  b: ["LIFE", "WORLD", "IT"],
};

function pickSectionsByUtcHour(hour: number): SectionCode[] {
  // hour === 21 → group B, 그 외(20시 트리거 + 수동 호출 폴백) → group A.
  return hour === 21 ? SECTION_GROUPS.b : SECTION_GROUPS.a;
}

export async function POST(request: Request) {
  try {
    assertCronAuthorized(request);
    const sections = pickSectionsByUtcHour(new Date().getUTCHours());
    const templates = await fetchUnprocessedTemplates(
      BATCH_FETCH_LIMIT,
      sections,
    );
    const report = await summarizeAllPending(templates);
    return NextResponse.json(
      { data: { sections, fetched: templates.length, ...report } },
      { status: 200 },
    );
  } catch (err) {
    const { status, body } = toErrorBody(err);
    return NextResponse.json(body, { status });
  }
}

export const GET = POST;
