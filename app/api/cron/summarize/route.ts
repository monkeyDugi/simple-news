import { NextResponse } from "next/server";

import { fetchUnprocessedTemplates } from "@/lib/articles/repo";
import { assertCronAuthorized } from "@/lib/cron/auth";
import { toErrorBody } from "@/lib/errors";
import { summarizeAllPending } from "@/lib/summarization/batch";

// 미요약 article_template 을 섹션별 batch 로 Claude 에 보내 요약.
// 모델 호출 + RPC 트랜잭션이 batch 마다 일어나므로 maxDuration 을 넉넉히.
export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_FETCH_LIMIT = 200;

export async function POST(request: Request) {
  try {
    assertCronAuthorized(request);
    const templates = await fetchUnprocessedTemplates(BATCH_FETCH_LIMIT);
    const report = await summarizeAllPending(templates);
    return NextResponse.json({ data: report }, { status: 200 });
  } catch (err) {
    const { status, body } = toErrorBody(err);
    return NextResponse.json(body, { status });
  }
}

export const GET = POST;
