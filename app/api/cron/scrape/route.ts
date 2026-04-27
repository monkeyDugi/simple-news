import { NextResponse } from "next/server";

import { assertCronAuthorized } from "@/lib/cron/auth";
import { runScrapeAll } from "@/lib/cron/scrape-runner";
import { toErrorBody } from "@/lib/errors";

// Vercel Cron 트리거 또는 로컬 curl 로 호출.
// 7섹션을 순회하며 article_template 에 적재. 실패 격리는 runner 내부에서 처리.
export const runtime = "nodejs";
// 7섹션 × N건 × 본문 fetch 라 기본 10초 한도로는 부족.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    assertCronAuthorized(request);
    const report = await runScrapeAll();
    return NextResponse.json({ data: report }, { status: 200 });
  } catch (err) {
    const { status, body } = toErrorBody(err);
    return NextResponse.json(body, { status });
  }
}

// Vercel Cron 은 GET 으로 호출하므로 동일 핸들러를 GET 에도 노출.
export const GET = POST;
