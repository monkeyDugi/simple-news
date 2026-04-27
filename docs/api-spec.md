# API Spec — Simple News

> 모든 API는 Next.js App Router의 API Routes(`app/api/...`)로 구현. 응답은 JSON.

## 공통 규칙

### 응답 포맷

**성공**:
```json
{ "data": <payload> }
```

**페이지네이션 응답**:
```json
{
  "data": [...],
  "cursor": { "next": "base64string|null", "hasNext": true|false }
}
```

**실패**:
```json
{ "error": { "code": "ERROR_CODE", "message": "사용자 메시지(한국어)" } }
```

### HTTP 상태 코드

| 코드 | 의미 |
|---|---|
| 200 | 정상 |
| 400 | 입력 검증 실패 |
| 401 | 인증 필요 (Cron 라우트만) |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |

### 인증

- V1 사용자 API는 **비로그인 공개**.
- Cron 라우트(`/api/cron/*`)만 `Authorization: Bearer ${CRON_SECRET}` 검증.

---

## 엔드포인트 목록

| 메서드 | 경로 | 용도 | 인증 |
|---|---|---|---|
| GET | `/api/articles` | 섹션별 기사 목록 (cursor 페이지네이션) | 없음 |
| GET | `/api/articles/{articleId}` | 기사 상세 + AI 요약 | 없음 |
| POST | `/api/cron/scrape` | (Cron) 7섹션 스크래핑 트리거 | CRON_SECRET |
| POST | `/api/cron/summarize` | (Cron) 미요약 article_template AI 요약 | CRON_SECRET |

---

## 1. GET /api/articles

### 요청

| 파라미터 | 타입 | 필수 | 기본 | 설명 |
|---|---|---|---|---|
| `section` | enum | ✅ | — | `POLITICS` / `ECONOMY` / `SOCIETY` / `LIFE` / `WORLD` / `IT` / `GLOBAL_MARKET` |
| `cursor` | string | ❌ | (없으면 최신부터) | 이전 응답의 `cursor.next` |
| `limit` | int | ❌ | 10 (max 30) | 페이지 크기 |

### 예시

```
GET /api/articles?section=ECONOMY
GET /api/articles?section=ECONOMY&cursor=MjAyNi0wNC0yNlQwMTowMDowMHwxMjM&limit=10
```

### 응답 (200)

```json
{
  "data": [
    {
      "id": 123,
      "title": "삼성전자 분기 실적 발표",
      "thumbnailLink": "https://imgnews.naver.net/...",
      "section": "ECONOMY",
      "publisher": "한국경제",
      "publishedAt": "2026-04-26T01:23:45.000Z",
      "summary": {
        "titleTheme": "삼성 실적 회복",
        "finalConclusion": "삼성전자는 지금 경기가 좋아서 실적이 나아졌어요."
      }
    }
  ],
  "cursor": {
    "next": "MjAyNi0wNC0yNlQwMDoxMTowMHwxMjA",
    "hasNext": true
  }
}
```

### 에러

| 코드 | HTTP | 의미 |
|---|---|---|
| `INVALID_SECTION` | 400 | section 값이 enum 외 |
| `INVALID_CURSOR` | 400 | cursor base64 디코딩 실패 |
| `INVALID_LIMIT` | 400 | limit이 1~30 범위 밖 |
| `INTERNAL_ERROR` | 500 | DB 오류 |

---

## 2. GET /api/articles/{articleId}

### 요청

- Path parameter: `articleId` — int (BIGINT)

### 응답 (200)

```json
{
  "data": {
    "id": 123,
    "title": "삼성전자, 4분기 영업이익 10조원 ...",
    "link": "https://news.naver.com/.../...",
    "thumbnailLink": "https://imgnews.naver.net/...",
    "section": "ECONOMY",
    "publisher": "한국경제",
    "author": "김철수",
    "publishedAt": "2026-04-26T01:23:45.000Z",
    "content": "<p>4분기 실적 발표에서 ...</p>",
    "summary": {
      "titleTheme": "삼성 실적 회복",
      "summary": "삼성전자가 4분기 영업이익 10조원을 달성했어요. 메모리반도체 가격 상승이 주된 이유고, 발표 직후 주가도 4% 올랐어요. 다만 일부 분석가는 장기 경기 둔화 우려가 여전하다고 봤어요.",
      "easyExplanation": "삼성이 만드는 칩이 잘 팔려서 회사 이익이 늘었어요. 마치 개인이 월급을 많이 받아 통장 잔액이 는 것과 같아요. 주식 사는 사람한테는 좋은 소식이에요.",
      "finalConclusion": "삼성이 칩 잘 팔려서 실적이 나아졌어요",
      "keyTerms": [
        { "term": "영업이익", "explanation": "회사가 본업으로 번 돈이에요." },
        { "term": "메모리반도체", "explanation": "스마트폰의 기억력 같은 칩이에요." }
      ]
    }
  }
}
```

### 에러

| 코드 | HTTP | 의미 |
|---|---|---|
| `INVALID_ARTICLE_ID` | 400 | id가 정수 아님 |
| `ARTICLE_NOT_FOUND` | 404 | DB에 없음 |
| `INTERNAL_ERROR` | 500 | DB 오류 |

---

## 3. POST /api/cron/scrape

### 요청

```
POST /api/cron/scrape
Authorization: Bearer ${CRON_SECRET}
```

### 응답 (200)

```json
{
  "data": {
    "totalNew": 47,
    "perSection": {
      "POLITICS": 5,
      "ECONOMY": 12,
      "SOCIETY": 8,
      "LIFE": 4,
      "WORLD": 9,
      "IT": 7,
      "GLOBAL_MARKET": 2
    },
    "errors": []
  }
}
```

### 에러

| 코드 | HTTP | 의미 |
|---|---|---|
| `UNAUTHORIZED_CRON` | 401 | Authorization 누락 / 불일치 |
| `INTERNAL_ERROR` | 500 | 모든 섹션 실패 등 |

---

## 4. POST /api/cron/summarize

### 요청

```
POST /api/cron/summarize
Authorization: Bearer ${CRON_SECRET}
```

### 응답 (200)

```json
{
  "data": {
    "batches": 3,
    "summarized": 42,
    "skippedDuplicates": 8,
    "failed": 0
  }
}
```

### 에러

| 코드 | HTTP | 의미 |
|---|---|---|
| `UNAUTHORIZED_CRON` | 401 | 인증 실패 |
| `LLM_RATE_LIMITED` | 429 | Anthropic rate limit 초과 |
| `INTERNAL_ERROR` | 500 | 처리 중 예외 |

---

## 에러 코드 전체 표

| 코드 | HTTP | 발생 API | 메시지 (한국어) |
|---|---|---|---|
| `INVALID_SECTION` | 400 | GET /articles | "올바르지 않은 섹션입니다" |
| `INVALID_CURSOR` | 400 | GET /articles | "올바르지 않은 cursor입니다" |
| `INVALID_LIMIT` | 400 | GET /articles | "limit는 1~30 사이여야 합니다" |
| `INVALID_ARTICLE_ID` | 400 | GET /articles/{id} | "올바르지 않은 기사 ID입니다" |
| `ARTICLE_NOT_FOUND` | 404 | GET /articles/{id} | "기사를 찾을 수 없어요" |
| `UNAUTHORIZED_CRON` | 401 | POST /cron/* | "권한이 없습니다" |
| `LLM_RATE_LIMITED` | 429 | POST /cron/summarize | "AI 호출 한도 초과" |
| `INTERNAL_ERROR` | 500 | 모든 | "잠시 후 다시 시도해 주세요" |

---

## Cursor 인코딩

```ts
// encode
const cursor = btoa(`${publishedAt.toISOString()}|${id}`);
// 예: "MjAyNi0wNC0yNlQwMTowMDowMC4wMDBafDEyMw"

// decode
const [iso, idStr] = atob(cursor).split('|');
const publishedAt = new Date(iso);
const id = parseInt(idStr, 10);
```

쿼리:
```sql
WHERE (published_at, id) < ($publishedAt, $id)
ORDER BY published_at DESC, id DESC
```

---

## 변경 이력

- **2026-04-26 v1.0**: 초기 명세 (3단 요약 응답)
- **2026-04-26 v1.1**: `summary` 단일 문단 응답으로 변경
