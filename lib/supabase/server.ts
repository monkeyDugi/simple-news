import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// 서버 사이드용 (API Routes, Cron). service_role 키.
// RLS 를 우회하므로 INSERT/UPDATE/RPC 호출 권한이 있다.
// 절대 클라이언트 번들에 노출되어선 안 된다 — NEXT_PUBLIC_ 접두사 없는 변수만 사용.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRole = process.env.SUPABASE_SECRET_KEY || "placeholder";

let cached: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
