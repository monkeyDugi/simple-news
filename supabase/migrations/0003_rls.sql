-- V1 정책: 비로그인 공개 앱.
-- - article 계열 4종 → anon SELECT 공개
-- - article_template 계열 → 사용자 노출 X, service_role 만 (RLS 활성 + 정책 미생성 = anon 거부)

ALTER TABLE article ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_key_term ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_content_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article"
  ON article FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read article_content"
  ON article_content FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read article_summary"
  ON article_summary FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read article_key_term"
  ON article_key_term FOR SELECT
  USING (true);

-- article_template, article_content_template 는 의도적으로 정책 미생성.
-- service_role 키는 RLS 를 우회하므로 Cron 에서 INSERT/UPDATE 가능.
