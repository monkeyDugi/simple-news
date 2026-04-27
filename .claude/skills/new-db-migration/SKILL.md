---
name: new-db-migration
description: "Simple News의 Supabase 스키마에 마이그레이션을 추가한다. '마이그레이션 추가', '테이블 변경', '컬럼 추가', '인덱스 추가' 요청 시 트리거. 파일명 규칙, RLS 영향 분석, rollback 고려, docs/db-schema.md 동기화까지 일관된 절차."
---

# new-db-migration — DB 마이그레이션 추가 절차

## 목적

재현 가능하고 rollback이 가능한 Supabase 마이그레이션을 안전하게 추가한다.

## 절차

### 1. 파일명 확정

```
supabase/migrations/NNNN_<short_description>.sql
```

- `NNNN` — 4자리 일련번호 (마지막 번호 + 1)
- `description` — snake_case, 30자 이내 (예: `add_thumbnail_blur_hash`, `alter_article_section_enum`)

### 2. 변경 내용 SQL 작성

```sql
-- 목적: article에 썸네일 blur hash 추가 (LCP 개선)
-- 영향: API /api/articles 응답에 thumbnailBlurHash 필드 추가

ALTER TABLE article
  ADD COLUMN thumbnail_blur_hash VARCHAR(50);
```

### 3. RLS 영향 분석

- Simple News V1은 anon SELECT 공개. 새 컬럼 자동 포함 (별도 정책 변경 불필요)
- 새 테이블 추가 시 → RLS 활성화 + 정책 작성 (anon SELECT, service_role ALL)

### 4. 인덱스 필요성

- 자주 WHERE/JOIN에 쓰일 컬럼인가? → 인덱스 추가
- 인덱스 파일 분리 원하면 `supabase/migrations/NNNN_indexes.sql`
- **핵심 인덱스**: `article(section, published_at DESC, id DESC)` — cursor 페이지네이션의 기반

### 5. Rollback 계획

각 마이그레이션은 **거꾸로 돌릴 수 있어야** 한다. 주석에 명시:

```sql
-- ⏪ Rollback:
-- ALTER TABLE article DROP COLUMN thumbnail_blur_hash;
```

### 6. 적용 & 검증

```bash
# 로컬 초기화 (파괴적)
supabase db reset

# 또는 증분 적용
supabase db push
```

- Studio에서 스키마 확인
- 샘플 INSERT/UPDATE로 제약 동작 확인

### 7. 타입 자동 생성

```bash
supabase gen types typescript --local > types/database.ts
```

TypeScript 타입이 새 컬럼을 반영하는지 확인.

### 8. 문서 동기화

`@docs/db-schema.md`의 다음 섹션 수정:
- 테이블 개요 표
- DDL (해당 테이블)
- 인덱스 (추가된 경우)
- RLS (정책 변경 시)
- 쿼리 예시 (관련된 경우)

### 9. 검증

`qa-verifier` 에이전트로 마이그레이션 영향 체크리스트 생성.

## 사용자 타이핑 체크포인트

- 마이그레이션 SQL 파일 → 사용자 타이핑
- `supabase db reset` → 사용자 실행
- `docs/db-schema.md` 갱신 → Claude 직접 편집
- `TODO.md` 해당 항목 체크
