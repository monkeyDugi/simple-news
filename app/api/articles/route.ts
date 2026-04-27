import { NextResponse } from "next/server";

import { getArticleList } from "@/lib/articles/service";
import { toErrorBody } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const out = await getArticleList({
      section: url.searchParams.get("section"),
      cursor: url.searchParams.get("cursor"),
      limit: url.searchParams.get("limit"),
    });
    return NextResponse.json(out, { status: 200 });
  } catch (err) {
    const { status, body } = toErrorBody(err);
    return NextResponse.json(body, { status });
  }
}
