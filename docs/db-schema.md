# DB Schema — Simple News (Supabase Postgres)

> Single source of truth for the schema. 마이그레이션 변경 시 반드시 이 문서도 동기화.

## 테이블 개요 (V1, 6개)

| 테이블 | 용도 | 행 수 추정 (1년) |
|---|---|---|
| `article_template` | 스크래핑 직후 임시 저장 (요약 전) | ~50K (요약 후 정리) |
| `article_content_template` | 위 본문 (1:1) | 위와 동일 |
| `article` | 요약 완료된 최종 기사 (사용자에게 노출) | ~150K |
| `article_content` | 위 본문 | ~150K |
| `article_summary` | 1:1, AI 요약 결과 | ~150K |
| `article_key_term` | 1:N, 핵심 용어 + 설명 | ~600K (article당 평균 4개) |

> 비디오 관련 테이블은 **만들지 않음**. flow-pick-api에는 있었지만 simple-news는 처음부터 제외.

---

## DDL

### article_template

```sql
CREATE TABLE article_template (
  id                  BIGSERIAL PRIMARY KEY,
  source              VARCHAR(20) NOT NULL DEFAULT 'NAVER',  -- V2에서 한경 추가 시 'HANKYUNG' 등
  source_publisher_id VARCHAR(10),                            -- 네이버 사업자 ID (있으면)
  source_article_id   VARCHAR(50) UNIQUE NOT NULL,           -- 네이버 기사 ID (예: "0000123456")
  source_section_id   VARCHAR(10),                            -- 네이버 섹션 코드 (100/101/102/103/104/105/finance)
  section             VARCHAR(20) NOT NULL,                   -- 우리 섹션 코드 (POLITICS/ECONOMY/...)
  title               VARCHAR(500) NOT NULL,
  link                VARCHAR(500) UNIQUE NOT NULL,
  thumbnail_link      VARCHAR(500),
  publisher           VARCHAR(50),
  author              VARCHAR(50),
  published_at        TIMESTAMPTZ NOT NULL,
  scraped_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ                              -- 요약 완료 시각 (NULL = 미요약)
);
```

### article_content_template

```sql
CREATE TABLE article_content_template (
  id          BIGINT PRIMARY KEY REFERENCES article_template(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,                                    -- 정제된 HTML 본문
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### article

```sql
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
```

### article_content

```sql
CREATE TABLE article_content (
  id          BIGINT PRIMARY KEY REFERENCES article(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### article_summary

```sql
CREATE TABLE article_summary (
  article_id        BIGINT PRIMARY KEY REFERENCES article(id) ON DELETE CASCADE,
  title_theme       VARCHAR(100) NOT NULL,
  summary           TEXT NOT NULL,             -- 단일 문단 요약 (150~300자, 3~5문장)
  easy_explanation  TEXT NOT NULL,
  final_conclusion  VARCHAR(500) NOT NULL,
  model             VARCHAR(50) NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> **v1.1 변경**: `what_happened`, `impact_result`, `reaction_issue` 3컬럼 → 단일 `summary` TEXT 컬럼으로 통합 (사용자 UX 결정).

### article_key_term

```sql
CREATE TABLE article_key_term (
  article_id   BIGINT NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  term         VARCHAR(100) NOT NULL,
  explanation  TEXT NOT NULL,
  position     SMALLINT NOT NULL,           -- 1~5 표시 순서
  PRIMARY KEY (article_id, term)
);
```

---

## 인덱스

```sql
-- 1. 페이지네이션 핵심: section + (published_at, id) DESC
CREATE INDEX idx_article_section_pubat
  ON article (section, published_at DESC, id DESC);

-- 2. 미요약 article_template 조회 (Cron summarize)
CREATE INDEX idx_article_template_processed
  ON article_template (processed_at) WHERE processed_at IS NULL;

-- 3. source_article_id로 중복 방지 (이미 UNIQUE 제약 → 자동 인덱스)

-- 4. article_template section 조회 (Cron summarize 시 섹션별 그룹핑)
CREATE INDEX idx_article_template_section
  ON article_template (section, scraped_at DESC);

-- 5. key_term 조회 (article_id로 한 번에)
-- 이미 PRIMARY KEY (article_id, term)이라 prefix 인덱스로 자동 사용
```

---

## RLS 정책 (V1)

V1는 **비로그인 공개 앱**. 모든 테이블 SELECT는 anon에게 공개. INSERT/UPDATE/DELETE는 service_role에게만.

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE article ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_key_term ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_content_template ENABLE ROW LEVEL SECURITY;

-- article 공개 SELECT
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

-- article_template* 는 SELECT도 service_role만 (사용자 노출용 아님)
-- 정책 미생성 = anon은 read 거부 (RLS 활성 + 정책 없음 = 거부)
-- service_role은 RLS 우회
```

---

## 쿼리 예시

### 섹션별 페이지네이션 (cursor)

```sql
-- 첫 페이지
SELECT a.*, s.* FROM article a
LEFT JOIN article_summary s ON s.article_id = a.id
WHERE a.section = 'ECONOMY'
ORDER BY a.published_at DESC, a.id DESC
LIMIT 11;  -- 11개 가져와서 hasNext 판정

-- 다음 페이지 (cursor = base64('2026-04-26T10:00Z|123'))
SELECT a.*, s.* FROM article a
LEFT JOIN article_summary s ON s.article_id = a.id
WHERE a.section = 'ECONOMY'
  AND (a.published_at, a.id) < (TIMESTAMPTZ '2026-04-26T10:00Z', 123)
ORDER BY a.published_at DESC, a.id DESC
LIMIT 11;
```

### 상세 조회 (article + content + summary + key_terms)

```sql
SELECT
  a.*,
  ac.content,
  s.title_theme, s.summary, s.easy_explanation, s.final_conclusion,
  COALESCE(
    json_agg(
      json_build_object('term', kt.term, 'explanation', kt.explanation)
      ORDER BY kt.position
    ) FILTER (WHERE kt.term IS NOT NULL),
    '[]'::json
  ) AS key_terms
FROM article a
LEFT JOIN article_content ac ON ac.id = a.id
LEFT JOIN article_summary s ON s.article_id = a.id
LEFT JOIN article_key_term kt ON kt.article_id = a.id
WHERE a.id = $1
GROUP BY a.id, ac.content, s.article_id;
```

### 미요약 article_template 조회 (Cron summarize에서 사용)

```sql
SELECT t.*, c.content
FROM article_template t
JOIN article_content_template c ON c.id = t.id
WHERE t.processed_at IS NULL
ORDER BY t.section, t.scraped_at DESC
LIMIT 20;  -- 배치 크기
```

### 요약 결과 저장 (한 트랜잭션)

```sql
BEGIN;

-- 1. article 승격
INSERT INTO article (
  source, source_publisher_id, source_article_id, source_section_id,
  section, title, link, thumbnail_link, publisher, author, published_at
)
SELECT
  source, source_publisher_id, source_article_id, source_section_id,
  section, title, link, thumbnail_link, publisher, author, published_at
FROM article_template
WHERE id = ANY($1::bigint[])
RETURNING id;
-- (RETURNING으로 받은 새 id를 templateId 매핑)

-- 2. article_content 승격
INSERT INTO article_content (id, content)
SELECT id, content FROM article_content_template WHERE id = ANY($1::bigint[]);

-- 3. article_summary INSERT
INSERT INTO article_summary (article_id, title_theme, what_happened, ...)
VALUES ...;

-- 4. article_key_term INSERT
INSERT INTO article_key_term (article_id, term, explanation, position)
VALUES ...;

-- 5. article_template processed_at 갱신
UPDATE article_template SET processed_at = NOW() WHERE id = ANY($1::bigint[]);

COMMIT;
```

> Supabase JS 클라이언트는 SQL 트랜잭션을 직접 못 보냄. 대안:
> 1. **stored procedure (RPC)** 작성 후 `supabase.rpc('upsert_article_with_summary', {...})`
> 2. 또는 single-statement INSERT...SELECT를 활용해 묶기
> 3. V1에서는 옵션 1 채택. `supabase/migrations/0004_rpc.sql`로 함수 추가.

---

## 마이그레이션 파일 매핑

| 파일 | 내용 |
|---|---|
| `0001_init.sql` | 6테이블 DDL |
| `0002_indexes.sql` | 위 인덱스 4개 |
| `0003_rls.sql` | RLS 활성화 + SELECT 정책 |
| `0004_rpc.sql` | `upsert_article_with_summary` RPC 함수 |

---

## 변경 이력

- **2026-04-26 v1.0**: V1 초기 스키마 (3단 요약 컬럼)
- **2026-04-26 v1.1**: `article_summary` 단일 `summary` 컬럼으로 통합
