import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// 브라우저/클라이언트 컴포넌트용. anon(=publishable) 키.
// V1 은 비로그인 공개 앱이라 RLS 의 anon SELECT 정책으로 충분하다.
//
// 환경변수가 비어 있어도 import 시점에는 throw 하지 않고 placeholder 로 동작.
// 실제 호출은 repo 레이어에서 MOCK_SUPABASE 토글로 분기되므로,
// 키가 없으면 fixture 가 대신 응답한다.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder";

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
