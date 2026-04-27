-- 페이지네이션 핵심 인덱스: section + (published_at DESC, id DESC)
-- /api/articles?section=ECONOMY&cursor=... 의 WHERE/ORDER BY 둘 다 커버
CREATE INDEX idx_article_section_pubat
  ON article (section, published_at DESC, id DESC);

-- Cron summarize 가 미요약 article_template 만 빠르게 조회하도록 부분 인덱스
CREATE INDEX idx_article_template_processed
  ON article_template (processed_at) WHERE processed_at IS NULL;

-- summarize 단계에서 섹션별 그룹 처리 시 사용
CREATE INDEX idx_article_template_section
  ON article_template (section, scraped_at DESC);

-- source_article_id, link 의 UNIQUE 제약은 자동 인덱스라 별도 생성 X
-- article_key_term 도 PRIMARY KEY (article_id, term) 의 prefix 인덱스로 article_id 조회 커버
