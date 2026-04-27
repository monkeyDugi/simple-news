-- Simple News V1 초기 스키마 (6 테이블)
-- 단일 summary 컬럼 사용 (v1.1 결정 — 3분할 폐기)

-- 스크래핑 직후 임시 저장 (요약 전)
CREATE TABLE article_template (
  id                  BIGSERIAL PRIMARY KEY,
  source              VARCHAR(20) NOT NULL DEFAULT 'NAVER',
  source_publisher_id VARCHAR(10),
  source_article_id   VARCHAR(50) UNIQUE NOT NULL,
  source_section_id   VARCHAR(10),
  section             VARCHAR(20) NOT NULL,
  title               VARCHAR(500) NOT NULL,
  link                VARCHAR(500) UNIQUE NOT NULL,
  thumbnail_link      VARCHAR(500),
  publisher           VARCHAR(50),
  author              VARCHAR(50),
  published_at        TIMESTAMPTZ NOT NULL,
  scraped_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ
);

CREATE TABLE article_content_template (
  id          BIGINT PRIMARY KEY REFERENCES article_template(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 요약 완료된 최종 기사 (사용자 노출용)
CREATE TABLE article (
  id                  BIGSERIAL PRIMARY KEY,
  source              VARCHAR(20) NOT NULL DEFAULT 'NAVER',
  source_publisher_id VARCHAR(10),
  source_article_id   VARCHAR(50) UNIQUE NOT NULL,
  source_section_id   VARCHAR(10),
  section             VARCHAR(20) NOT NULL,
  title               VARCHAR(500) NOT NULL,
  link                VARCHAR(500) UNIQUE NOT NULL,
  thumbnail_link      VARCHAR(500),
  publisher           VARCHAR(50),
  author              VARCHAR(50),
  published_at        TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE article_content (
  id          BIGINT PRIMARY KEY REFERENCES article(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE article_summary (
  article_id        BIGINT PRIMARY KEY REFERENCES article(id) ON DELETE CASCADE,
  title_theme       VARCHAR(100) NOT NULL,
  summary           TEXT NOT NULL,
  easy_explanation  TEXT NOT NULL,
  final_conclusion  VARCHAR(500) NOT NULL,
  model             VARCHAR(50) NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE article_key_term (
  article_id   BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  term         VARCHAR(100) NOT NULL,
  explanation  TEXT NOT NULL,
  position     SMALLINT NOT NULL,
  PRIMARY KEY (article_id, term)
);

-- 섹션 enum 검증 — 7가지 외 값 차단 (DB 레벨 가드)
ALTER TABLE article ADD CONSTRAINT article_section_check
  CHECK (section IN ('POLITICS','ECONOMY','SOCIETY','LIFE','WORLD','IT','GLOBAL_MARKET'));
ALTER TABLE article_template ADD CONSTRAINT article_template_section_check
  CHECK (section IN ('POLITICS','ECONOMY','SOCIETY','LIFE','WORLD','IT','GLOBAL_MARKET'));
