import { ApiError } from "@/lib/errors";

// Vercel Cron 헤더 또는 명시적 Bearer 토큰을 받아 검증.
// - Vercel Cron 트리거: Authorization: Bearer ${CRON_SECRET}
// - 로컬 curl 테스트: Authorization: Bearer ${CRON_SECRET}
//
// CRON_SECRET 가 비어있으면 (로컬 .env.local 미설정 등) 모든 요청을 거부 — 보안 기본값.
export function assertCronAuthorized(request: Request): void {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    throw new ApiError("UNAUTHORIZED_CRON");
  }
  const auth = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!auth.startsWith(prefix)) {
    throw new ApiError("UNAUTHORIZED_CRON");
  }
  const token = auth.slice(prefix.length).trim();
  if (token !== expected) {
    throw new ApiError("UNAUTHORIZED_CRON");
  }
}
