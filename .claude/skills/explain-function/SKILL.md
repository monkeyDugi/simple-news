---
name: explain-function-deprecated
description: "[DEPRECATED v1.1] 교육형 모드가 폐기되었습니다. 이 skill은 호출하지 마세요."
---

# explain-function — 함수 교육형 설명

## 목적

기존 함수를 읽고 초심자가 이해하도록 상세 분해한다.

## 절차

### 1. 대상 확정

- 파일 경로 + 함수 이름 (또는 파일 경로만 → 내부 함수 자동 선택)
- 사용자가 특정 못 하면 "어떤 함수를 설명해줄까요?" 리스트 제공

### 2. 시그니처 해설

```
🔍 **함수 시그니처**
`async function listArticles(params: ListArticlesQuery): Promise<ArticleListResult>`

- `async` — 비동기 함수. Promise 반환
- 인자 1개 (객체 분해 패턴)
- 반환: { data: Article[], cursor: { next, hasNext } }
```

### 3. 1줄 요약

```
📝 **한 줄 요약**: 섹션과 cursor를 받아 article 테이블에서 페이지 단위로 기사 목록을 가져온다.
```

### 4. 줄 단위 주석

함수 전체를 다시 보여주되, 각 줄에 한국어 주석:

```ts
async function listArticles(params: ListArticlesQuery) {
  const supabase = createServerClient();        // 서버용 클라이언트 (Service Role)

  let query = supabase
    .from('article')                             // article 테이블에서
    .select('*, summary:article_summary(*)')     // summary 조인
    .eq('section', params.section)               // 섹션 필터
    .order('published_at', { ascending: false }) // 최신순 (1차 정렬)
    .order('id', { ascending: false })           // 동시각 분리용 (2차 정렬)
    .limit(params.limit + 1);                    // 다음 페이지 존재 판정용 +1

  if (params.cursor) {
    const { publishedAt, id } = decodeCursor(params.cursor);
    query = query.or(
      `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},id.lt.${id})`
    );  // (published_at, id) < (cursor.publishedAt, cursor.id)
  }

  const { data, error } = await query;
  if (error) throw error;

  const hasNext = data.length > params.limit;
  const items = hasNext ? data.slice(0, params.limit) : data;
  return { data: items, cursor: buildCursor(items, hasNext) };
}
```

### 5. 새 개념 강조

등장한 개념이 처음이면 별도 박스:
```
📘 **새 개념: method chaining (Supabase JS)**
Supabase 클라이언트는 `.from().select().eq()` 처럼 연속 호출로 쿼리를 조립한다.
각 메서드가 this를 반환해서 다음 메서드를 이어 부를 수 있는 것이 chaining.
```

### 6. 호출 관계

```
🔗 **어디서 호출되나?**
- `app/api/articles/route.ts:L18` (GET 핸들러)

🔗 **무엇을 호출하나?**
- `createServerClient()` (lib/supabase/server.ts)
- `decodeCursor()`, `buildCursor()` (lib/utils/cursor.ts)
```

### 7. 타이핑 체크포인트

```
✏️ 직접 타이핑하며 소리 내 읽어보세요.
✏️ 특히 method chaining 부분은 느리게.
```

### 8. 검증

- 의도대로 동작하는지 테스트 (예: 빈 결과, cursor 따라 페이지 넘김)

## 규칙

- 한 번에 **1개 함수**만 설명
- 30줄 넘으면 쪼개서 여러 응답
- 새 개념은 반드시 선행 설명
- 한국어
