import { NextResponse } from "next/server";

import { getArticleDetailById } from "@/lib/articles/service";
import { toErrorBody } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ articleId: string }> },
) {
  try {
    const { articleId } = await context.params;
    const data = await getArticleDetailById(articleId);
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    const { status, body } = toErrorBody(err);
    return NextResponse.json(body, { status });
  }
}
