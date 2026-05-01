-- upsert_article_with_summary RPC 제거.
-- 응용 코드(lib/articles/repo.ts applySummary) 가 supabase-js 로 직접 INSERT/DELETE 흐름 처리하도록 전환했다.
-- DB 함수는 더 이상 호출되지 않으므로 dead code → 제거.

DROP FUNCTION IF EXISTS upsert_article_with_summary(BIGINT, JSONB, VARCHAR);
