import { NextResponse } from "next/server";

import { fetchUnprocessedTemplates } from "@/lib/articles/repo";
import { assertCronAuthorized } from "@/lib/cron/auth";
import { pickSectionsByUtcHour } from "@/lib/cron/groups";
import { toErrorBody } from "@/lib/errors";
import { summarizeAllPending } from "@/lib/summarization/batch";

// 미요약 article_template 을 섹션별 batch 로 OpenAI 에 보내 요약.
// 모델 호출 + RPC 트랜잭션이 batch 마다 일어나므로 maxDuration 을 넉넉히.
//
// 참고: 실제 cron 은 GitHub Actions 가 scripts/run-summarize.ts 로 직접 돈다.
// 이 라우트는 수동 호출(curl) 또는 비상용으로 남겨둠.
export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_FETCH_LIMIT = 200;

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
