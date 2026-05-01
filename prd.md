# PRD — Simple News (v1.1)

> 출퇴근에 딱 보고 세상이 어떻게 돌아가는지 파악하기 위한 **아주 간단한 뉴스 앱**.

**작성일**: 2026-04-26
**버전**: 1.1 (UI 결정 반영)
**프로젝트 디렉토리**: `/Users/monkey/Developer/simple-news`

---

## 1. 비전 & 핵심 가치

### 1-1. 한 줄 정의

> **출퇴근 5분 안에 오늘 세상이 어떻게 돌아가는지 파악하게 해주는 앱.**

### 1-2. 만드는 이유

기존 뉴스 앱들의 문제 → Simple News의 해결:

| 문제 | 해결 |
|---|---|
| 카테고리 너무 많음 | **7개로 고정** |
| 광고/단신 섞여 시간 낭비 | **AI 중복 제거 + 핵심 요약** |
| 본문 길고 어려움 | **150~300자 단일 문단 요약 + 한 줄 결론** |
| 어려운 용어 (FOMC, 양적완화 등) | **핵심 용어 자동 풀이 + 쉬운 설명 팝업** |
| 설정·로그인·구독 잡다 | **로그인 없음, 설정 없음** |
| 영상·SNS·커뮤니티로 산만 | **텍스트 뉴스만** |

### 1-3. 핵심 가치 (3개)

1. **간결성** — 화면, 설정, 인터랙션 미니멀
2. **신호 강도** — AI가 중복 제거 + 핵심만
3. **이해 가능성** — 어려운 뉴스도 비유와 일상 예시로

### 1-4. 핵심 사용 시나리오

> **A. 오전 출근길** — 앱 켬 → 디폴트 섹션(경제) 카드 리스트 → 카드마다 AI가 만든 한 줄 결론이 큰 글씨로 보임 → 흥미 있는 1건 탭 → 한 줄 결론 + 150~300자 요약 → 30초 안에 이해 → 다음 카드. **5분에 5~10건.**
>
> **B. 점심 카페** — 해외증시 섹션 탭 → 미국장 마감 후 흐름 → 모르는 용어 인라인 하이라이트 클릭 → 일상 비유 설명. 또는 본문 [쉬운 설명] 버튼 → 비유로 풀이.

---

## 2. 사용자 페르소나

### 2-1. 페르소나 1: "투자 입문자 직장인"

- 28~38세, 사무직/IT/금융, 투자 1~3년차
- 출근(07:30~08:30), 점심(13:00), 퇴근(18:30~19:30)에 사용
- 기대: "오늘 시장이 왜 이렇게 움직였는지" 1분에 파악

### 2-2. 페르소나 2: "큰 그림을 놓치고 싶지 않은 사람"

- 30~50세, 매니저/창업가/전문직
- 정치·국제·사회 흐름을 매일 5분으로 따라잡기

### 2-3. Anti-persona

- 뉴스 마니아 / 깊이 있는 분석 원하는 사람 / 영상 콘텐츠 선호자

---

## 3. MVP (V1) 범위

### 3-1. V1 포함

| 기능 | 설명 |
|---|---|
| 섹션 7개 + 탭 메인 | 정치/경제/사회/생활문화/세계/IT과학/해외증시 (탭 가로 스크롤) |
| 카드형 리스트 | **AI 결론 1순위**, 원본 제목 보조, 시간 그룹 헤더 |
| 무한 스크롤 + Pull-to-Refresh | 80px threshold |
| 상세 페이지 | titleTheme + 한 줄 결론 + 단일 문단 요약 + 쉬운 설명 + 어려운 용어 + 원문 |
| 핵심 용어 인라인 하이라이트 | 본문 텍스트 매칭 + 클릭 팝업 |
| 링크 복사 공유 | 기사 단위 (카카오톡 공유는 V2 검토) |
| 안드로이드 웹뷰 패키징 | Capacitor + Play Store |
| 자동 스크래핑 | 네이버 7섹션, 6시간 주기 |
| AI 자동 요약 | OpenAI gpt-4o-mini |

### 3-2. V1에서 의도적으로 빠진 것

| 미포함 | 이유 |
|---|---|
| 푸시 알림 | V2 (인프라는 V1 후반에) |
| 비디오 | 영구 제외 |
| 로그인 | V2 |
| 관심종목 / 즐겨찾기 / 검색 | V2 |
| 한경 글로벌마켓 | 보류 |
| 다크모드 | V2 (`prefers-color-scheme` 자동만 가능하면 V1에 추가 검토) |
| iOS | 영구 제외 |

### 3-3. V2 로드맵 (V1 종료 후)

1. 데일리 다이제스트 푸시 알림
2. 다크모드
3. 로그인 + 관심종목 키워드 알림
4. 검색
5. 한경 글로벌마켓 추가

---

## 4. 정보 아키텍처

### 4-1. 화면 트리

```
앱 실행
└── 메인 (목록 화면)
    ├── 상단 섹션 탭 (가로 스크롤 7개)
    ├── 카드 리스트 (선택 섹션)
    │   ├── 시간 그룹 헤더 ("오늘 아침" 등)
    │   ├── 카드 = 썸네일 + AI 결론(큰글씨) + 원본 제목(작은글씨) + 출처/시간
    │   └── 무한 스크롤 / Pull-to-Refresh
    └── 카드 탭 → 상세 화면
        ├── 섹션 칩
        ├── titleTheme (큰 제목)
        ├── 한 줄 결론 강조 박스
        ├── 단일 문단 요약 (150~300자)
        ├── [쉬운 설명] 버튼 → 팝업 (easyExplanation)
        ├── 어려운 용어 리스트 (keyTerms[])
        ├── [원문 기사 보기] → 바텀시트
        └── 공유 (우상단)
            └── 링크 복사
```

### 4-2. 섹션 구성 (확정)

| 섹션 코드 | 표시명 | 네이버 매핑 |
|---|---|---|
| `POLITICS` | 정치 | section_id=100 |
| `ECONOMY` | 경제 | section_id=101 |
| `SOCIETY` | 사회 | section_id=102 |
| `LIFE` | 생활/문화 | section_id=103 |
| `WORLD` | 세계 | section_id=104 |
| `IT` | IT/과학 | section_id=105 |
| `GLOBAL_MARKET` | 해외증시 | section_id=101→258→403 |

> 디폴트 섹션 = `ECONOMY`. 마지막 선택은 `localStorage`에 저장하고 다음 진입 시 복원.

### 4-3. 라우팅

- `/` 또는 `/?section={code}` → 목록
- `/articles/{articleId}` → 상세
- `pushState` 기반 (페이지 리로드 없이)
- 뒤로가기 시 목록 스크롤 위치 복원 (`sessionStorage`)

---

## 5. 도메인 모델

### 5-1. 핵심 엔티티

```
SourceArticle (스크래핑 원본)
  ├─ source: NAVER
  ├─ source_section_id: 네이버 코드
  ├─ source_article_id: 네이버 기사 고유 ID
  ├─ section: 우리 도메인 코드
  ├─ title, link, thumbnail_link
  ├─ published_at (KST → UTC)
  ├─ publisher, author
  └─ content (정제된 HTML)
        │
        ▼
Article (최종 발행본)
  ├─ (위 모든 필드)
  └─ summary
      ├─ title_theme
      ├─ summary           ← 단일 문단 (3~5문장, 150~300자)
      ├─ easy_explanation
      ├─ final_conclusion
      └─ key_terms[]: { term, explanation }
```

### 5-2. 라이프사이클

```
[6시간 주기 cron]
  → 네이버 7섹션 스크래핑 (각 섹션당 ~100건 시도)
  → 중복 필터 (source_article_id UNIQUE)
  → article_template / article_content_template INSERT
  → 신규 N건 → AI 요약 배치 (OpenAI gpt-4o-mini)
  → 응답 JSON 파싱 → article / article_content / article_summary / article_key_term INSERT
  → article_template processed_at 갱신
```

### 5-3. AI 요약 출력 스키마 (확정 — v1.1에서 변경)

```json
{
  "templateId": 12345,
  "titleTheme": "20자 이내 주제",
  "summary": "150~300자 단일 문단 요약. 3~5문장. 친근한 구어체. '무슨 일/영향/반응'을 자연스럽게 흘려서 한 덩이로 풀어쓴다.",
  "easyExplanation": "비유와 일상 예시로 풀어쓴 3문장 설명",
  "finalConclusion": "한 줄 결론, 구어체",
  "keyTerms": [
    { "term": "용어", "explanation": "쉬운 설명" }
  ]
}
```

> **변경 사유**: v1.0은 `coreSummaries.{whatHappened, impactResult, reactionIssue}` 3분할이었으나 사용자가 "구조화된 분리 대신 자연스러운 단일 문단"을 선호. 단일 `summary` 필드로 통합. 나머지 필드는 그대로.

---

## 6. 데이터 소스 (스크래핑)

### 6-1. V1 소스 = 네이버 뉴스 단일

| 섹션 | URL |
|---|---|
| 정치 | `https://news.naver.com/section/100` |
| 경제 | `https://news.naver.com/section/101` |
| 사회 | `https://news.naver.com/section/102` |
| 생활/문화 | `https://news.naver.com/section/103` |
| 세계 | `https://news.naver.com/section/104` |
| IT/과학 | `https://news.naver.com/section/105` |
| 해외증시 | `https://finance.naver.com/news/news_list.naver?mode=LSS3D&section_id=101&section_id2=258&section_id3=403` |

> 6개 일반 섹션 vs 1개 해외증시의 URL 구조가 다름 → **두 종류 스크래퍼**:
> - `NaverGeneralScraper` — 일반 섹션
> - `NaverFinanceScraper` — 해외증시
>
> 둘 다 공통 인터페이스 `Scraper` 구현.

### 6-2. 추출 필드 (네이버 일반 섹션)

| 필드 | CSS 셀렉터 |
|---|---|
| title | `.sa_text_title` 텍스트 |
| link | `.sa_text_title` href |
| summary | `.sa_text_lede` (네이버 짧은 요약) |
| thumbnailLink | `.sa_thumb_inner img` (data-src 또는 src) |
| content | `#dic_area` HTML (script/style/ad 제거) |
| publisher | `.media_end_head_top_logo img[alt]` 등 |
| author | `.media_end_head_journalist_name` 첫 줄 |
| publishedAt | `.media_end_head_info_datestamp_time` (datetime) |

### 6-3. 추출 필드 (네이버 finance 해외증시)

V1 구현 시 **반드시 페이지 직접 점검 후 셀렉터 확정**. 본 PRD 시점 추정 셀렉터는 `docs/scraping-guide.md`에 기록.

### 6-4. 스크래핑 정책

- **주기**: 6시간 (UTC `0 */6 * * *`)
- **건수**: 섹션당 ~100건 시도
- **User-Agent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...`
- **Rate limit**: 요청 간 500ms
- **본문 추출 실패 시**: 스킵 + 로그
- **HTML 정제**: `<script>`, `<style>`, `.ad`, `.advert` 등 제거

### 6-5. 차단/실패 대응

- 단일 섹션 실패 시 다른 섹션 계속 진행
- 모든 섹션 실패 시 다음 cron 주기에 자동 재시도
- V1은 모니터링 없음 (Vercel 로그 수동 확인)

---

## 7. AI 요약 파이프라인

### 7-1. 모델

- **OpenAI gpt-4o-mini** — `gpt-4o-mini`
- SDK: `openai` (Node 공식 SDK)
- 출력 강제: Chat Completions `response_format: { type: "json_schema", json_schema: { strict: true } }`
- 단가: 입력 $0.15 / 1M tokens, 출력 $0.60 / 1M tokens (월 운영비 추정 $1~3)

### 7-2. 프롬프트 구조

```
[시스템 프롬프트 — cache_control: ephemeral]
  - 역할: 한국 뉴스 큐레이터
  - 출력 형식: JSON 배열 (스키마 명시)
  - 톤: 친근 구어체
  - 중복 제거 규칙 (70% 유사)
  - 요약 길이 가이드 (150~300자)
  - 키워드 추출 규칙 (최대 5개)

[유저 메시지]
  배치 N건 기사 직렬화 (templateId + title + content)
```

### 7-3. 시스템 프롬프트 (전체)

> `lib/summarization/prompt.ts`의 `SYSTEM_PROMPT` 상수.

```text
당신은 한국어 뉴스 큐레이터입니다.

제공된 기사 목록을 처리하여:
1. 내용이 70% 이상 유사하거나 중복되는 기사는 가장 낮은 templateId만 남기고 제거 (최대 20개)
2. 각 기사의 핵심을 친절한 구어체로 풀어 설명
3. 핵심 정보 및 용어를 분류
4. JSON 배열로 출력

출력 규칙:
- 모든 JSON 키는 camelCase
- 톤: 친근하고 쉬운 구어체 (~했어요, ~예요, ~이에요)
- titleTheme: 20자 이내 주제 요약
- summary: 150~300자, 3~5문장, 단일 문단. 무슨 일이 있었고/어떤 영향이 있고/어떤 반응이 있는지를
           자연스럽게 한 덩이로 풀어 쓴다. 항목별 분리 금지.
- easyExplanation: 비유 및 일상 예시 포함 3문장. 초등학생도 이해할 수준.
- finalConclusion: 한 줄 결론, 구어체. 카드 노출용이라 짧고 강해야 함 (40자 안팎)
- keyTerms: 기사 이해에 필수적인 단어 최대 5개, 각각 구어체 설명
- 출력은 JSON 배열만. 다른 텍스트 없음.

JSON 스키마:
[
  {
    "templateId": 12345,
    "titleTheme": "...",
    "summary": "...",
    "easyExplanation": "...",
    "finalConclusion": "...",
    "keyTerms": [
      { "term": "...", "explanation": "..." }
    ]
  }
]

규칙:
- 절대 부가 텍스트 출력 금지. JSON 배열만.
- 한국어로만 출력.
- 구어체 톤 유지 (보고서 톤 X, 친구가 설명하는 톤 O).
- 어려운 용어는 keyTerms에 분리하지만 본문(summary)에서는 그대로 사용 가능.
- 출처 / 기자명 / 광고 문구는 요약에 포함하지 않는다.
- summary는 절대 항목별로 분리하지 않는다 (하나의 자연스러운 문단).
```

### 7-4. 모델 파라미터

| 파라미터 | 값 |
|---|---|
| model | `gpt-4o-mini` |
| max_tokens | 8192 |
| temperature | 0.3 |
| messages[0] (system) | (위 프롬프트) |
| response_format | `{ type: "json_schema", strict: true }` |
| schema wrapper | `{ summaries: [...] }` (top-level object 강제) |

### 7-5. 배치 정책

- **배치 크기**: `SUMMARIZE_BATCH_SIZE` (기본 20)
- **신규 기사 처리**:
  1. 섹션별 그룹화
  2. 섹션마다 BATCH_SIZE개씩
  3. 응답 JSON 파싱
  4. `article` / `article_summary` / `article_key_term` INSERT
  5. 응답에 없는 templateId = 중복 제거된 것 → 스킵

### 7-6. Rate limit & 재시도

- 429 응답 시 60초 대기 + 1회 재시도
- 5xx 응답 시 5초 대기 + 1회 재시도
- JSON 파싱 실패 시 배치 전체 스킵 (`processed_at` 미갱신, 다음 cron에서 재시도)
- 일부 templateId 누락 시 다음 cron에서 재시도

### 7-7. 비용 추정

- 일 신규 ~210건 → 중복 제거 후 ~150건
- 입력 평균 1500토큰 × 일 ~150건 + 출력 평균 ~250토큰 = 일 ~280K 입력 + ~40K 출력 토큰
- gpt-4o-mini 단가($0.15/1M 입력, $0.60/1M 출력) 기준 **월 운영비 약 $1~3**
- OpenAI Hard Usage Limit / Prepaid 잔액으로 폭주 방지 (V1 시작 시 $5 prepaid 권장)

---

## 8. API 명세

### 8-1. 기사 목록

```
GET /api/articles?section=ECONOMY&cursor=&limit=10
```

| 파라미터 | 타입 | 필수 | 기본 | 설명 |
|---|---|---|---|---|
| `section` | enum | ✅ | — | 7섹션 enum |
| `cursor` | string (base64) | ❌ | — | 이전 응답의 `cursor.next` |
| `limit` | int | ❌ | 10 (max 30) | 페이지 크기 |

**Response (200)**

```json
{
  "data": [
    {
      "id": 123,
      "title": "삼성전자 분기 실적 발표",
      "thumbnailLink": "https://...",
      "section": "ECONOMY",
      "publisher": "한국경제",
      "publishedAt": "2026-04-26T01:23:45.000Z",
      "summary": {
        "titleTheme": "삼성 실적 회복",
        "finalConclusion": "삼성이 칩 잘 팔려서 실적이 나아졌어요"
      }
    }
  ],
  "cursor": {
    "next": "MjAyNi0wNC0yNlQwMDoxMTowMHwxMjA",
    "hasNext": true
  }
}
```

> 목록 응답에는 `summary.titleTheme`과 `summary.finalConclusion`만 (카드 노출용).

### 8-2. 기사 상세

```
GET /api/articles/{articleId}
```

**Response (200)**

```json
{
  "data": {
    "id": 123,
    "title": "...",
    "link": "https://news.naver.com/...",
    "thumbnailLink": "https://...",
    "section": "ECONOMY",
    "publisher": "한국경제",
    "author": "김철수",
    "publishedAt": "2026-04-26T01:23:45.000Z",
    "content": "<p>본문 HTML...</p>",
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

### 8-3. Cron — 스크래핑

```
POST /api/cron/scrape
Authorization: Bearer ${CRON_SECRET}
```

응답: 섹션별 신규 카운트.

### 8-4. Cron — 요약

```
POST /api/cron/summarize
Authorization: Bearer ${CRON_SECRET}
```

응답: 처리 배치 수, 요약 건수, 중복 스킵 수.

### 8-5. 페이지네이션 커서

```
cursor = base64(`${published_at_iso}|${article_id}`)
WHERE (published_at, id) < (cursor.published_at, cursor.id)
ORDER BY published_at DESC, id DESC
```

### 8-6. 응답 표준 포맷

- 성공: `{ data: ... }` 또는 `{ data: [...], cursor: {...} }`
- 실패: `{ error: { code, message } }`

---

## 9. DB 스키마 (Supabase Postgres)

> 상세 DDL은 `docs/db-schema.md` 참조. 본 섹션은 개요.

### 9-1. 테이블 (V1, 6개)

| 테이블 | 용도 |
|---|---|
| `article_template` | 스크래핑 직후 임시 저장 |
| `article_content_template` | 위 본문 |
| `article` | 요약 완료된 최종 |
| `article_content` | 위 본문 |
| `article_summary` | 1:1, AI 요약 (단일 summary 필드) |
| `article_key_term` | 1:N, 핵심 용어 |

### 9-2. article_summary 컬럼 (변경됨)

```sql
CREATE TABLE article_summary (
  article_id        BIGINT PRIMARY KEY REFERENCES article(id) ON DELETE CASCADE,
  title_theme       VARCHAR(100) NOT NULL,
  summary           TEXT NOT NULL,             -- 단일 문단 (3~5문장)
  easy_explanation  TEXT NOT NULL,
  final_conclusion  VARCHAR(500) NOT NULL,
  model             VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> v1.0의 `what_happened, impact_result, reaction_issue` 3컬럼 → 단일 `summary` TEXT로 통합.

### 9-3. 인덱스 / RLS

`docs/db-schema.md` 참조.

---

## 10. 프론트엔드 화면 명세 (확정)

### 10-1. 디자인 컨셉

| 항목 | 값 |
|---|---|
| 배경 | `#ffffff` |
| 카드 배경 | `#ffffff` (border `#f2f4f6`) |
| 강조 색 | `#3182f6` (토스 블루) |
| 텍스트 (1차) | `#191f28` |
| 텍스트 (2차) | `#6b7684` |
| 텍스트 (3차) | `#b0b8c1` |
| 폰트 | Pretendard 기본 |
| 카드 라운드 | 12px |
| 터치 영역 | 최소 44×44 |
| 다크모드 | V2 |

### 10-2. 목록 화면

```
┌─────────────────────────────┐
│ [정치] [경제●] [사회] [생활] │ ← 가로 스크롤 7탭
│ [세계] [IT] [해외증시]      │
├─────────────────────────────┤
│ 오늘 아침 ━━━━━━━━━━        │ ← 시간 그룹 헤더
│                             │
│ ┌───┐ [경제]                │
│ │썸 │ 삼성이 칩 잘 팔려서  │ ← AI 결론 (큰 글씨, 굵게)
│ │64 │ 4분기 실적이 나아졌어요│
│ └───┘ 삼성전자, 4분기 영업..│ ← 원본 제목 (작은 글씨)
│       한국경제 · 08:42       │ ← 출처 + 시간(절대값)
│                             │
│ ─────────────────────────── │
│ ...카드 N건                  │
│ 어젯밤 ━━━━━━━━━━━━━        │
│ ...카드 N건                  │
│                             │
│         [로딩 중]            │
└─────────────────────────────┘
```

**컴포넌트 구성**:
- `SectionTabs` — 가로 스크롤, 디폴트 `ECONOMY`, 선택 시 `localStorage` 저장
- `TimeGroupHeader` — "오늘 아침", "오늘 낮", "어젯밤", "어제 낮", "이틀 전", "3일 전", ...
- `ArticleCard` — 썸네일(64×64) | finalConclusion(2줄) > 원본 제목(1줄) > 출처+시간

**Pull-to-Refresh** — 80px threshold, flow-pick-view 패턴
**무한 스크롤** — 하단 200px 진입 시 다음 페이지

### 10-3. 시간 그룹 분류 (KST 기준)

```ts
function getTimeGroup(publishedAt: Date, now: Date): string {
  // 모두 KST로 변환 후 비교
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const dayBefore = subDays(today, 2);

  if (publishedAt >= setHours(today, 4) && publishedAt < setHours(today, 12)) return '오늘 아침';
  if (publishedAt >= setHours(today, 12) && publishedAt < setHours(today, 18)) return '오늘 낮';
  if (publishedAt >= setHours(today, 18)) return '오늘 저녁';
  if (publishedAt >= setHours(yesterday, 18) && publishedAt < setHours(today, 4)) return '어젯밤';
  if (publishedAt >= setHours(yesterday, 4) && publishedAt < setHours(yesterday, 18)) return '어제 낮';
  if (publishedAt >= setHours(dayBefore, 0)) return '이틀 전';
  // 3일~7일 전
  if (publishedAt >= subDays(today, 7)) return `${differenceInDays(now, publishedAt)}일 전`;
  // 그 이전
  return format(publishedAt, 'M월 d일');
}
```

카드 시간 표시는 그룹 안에서는 절대값(`08:42`), 7일 이상 옛날 건 날짜 (`4월 19일`).

### 10-4. 상세 화면

```
┌─────────────────────────────┐
│ ←                       [공유]│
│                             │
│ [경제]                       │ ← 섹션 칩
│                             │
│ titleTheme (큰 굵은 제목)    │
│ 한국경제 · 김철수 · 12분 전  │
│                             │
│ ┌───────────────────────┐   │
│ │ 💡 한 줄 결론          │   │
│ │ 삼성이 칩 잘 팔려서    │   │ ← 강조 박스 (블루 그라디언트)
│ │ 실적이 나아졌어요      │   │
│ └───────────────────────┘   │
│                             │
│ 삼성전자가 4분기 영업이익     │ ← summary 단일 문단
│ 10조원을 달성했어요. 메모리   │   (150~300자, 3~5문장)
│ 반도체 가격 상승이 주된      │
│ 이유고, 발표 직후 주가도 4%  │
│ 올랐어요. 다만 일부 분석가는 │
│ 장기 경기 둔화 우려가 여전   │
│ 하다고 봤어요.               │
│                             │
│  [💡 쉬운 설명]              │ ← 버튼 (eshyExplanation 팝업)
│                             │
│ ┌─ 📚 어려운 용어 ──────┐   │ ← 어려운 용어 리스트
│ │ • 영업이익            │   │
│ │   회사가 본업으로...  │   │
│ │ • 메모리반도체        │   │
│ │   스마트폰의 기억력...│   │
│ └───────────────────────┘   │
│                             │
│   [📰 원문 기사 보기 →]      │ ← 바텀시트 트리거
└─────────────────────────────┘
```

**핵심 변경 (v1.0 → v1.1)**:
- 3단 분리(`whatHappened/impactResult/reactionIssue`) → **단일 `summary` 문단**
- 인라인 용어 하이라이트 → **하단 어려운 용어 리스트** (별도 카드)로 이동. 모바일에서 정확히 탭 어려운 문제 해결.

**원문 바텀시트** — flow-pick-view 패턴 유지 (제목/언론사/기자/시간/본문 HTML).

**공유** — 우상단 아이콘. 메뉴: 링크 복사 (V1). 카카오톡 공유는 V2 검토.

### 10-5. 라우팅

- 클라이언트 라우팅 (Next.js App Router + 클라이언트 컴포넌트로 SPA 느낌)
- `/` 또는 `/?section=ECONOMY` → 목록
- `/articles/123` → 상세
- 뒤로가기 시 목록 스크롤 위치 복원 (`sessionStorage`)

---

## 11. 모바일 패키징 (Capacitor)

### 11-1. 설정

- 플랫폼: Android만
- Capacitor 7.x
- `appId`: `com.simplenews.app`
- `appName`: `Simple News`
- `webDir`: `out/` (Next.js Static Export)

### 11-2. Next.js + Capacitor 빌드

```
프론트 = Next.js Static Export (output: "export")
   ├── 빌드 → out/
   └── Capacitor가 안드로이드 assets로 복사

백엔드 = 같은 Next.js 프로젝트의 API Routes
   └── Vercel 배포 (Cron 포함)
```

### 11-3. Capacitor 플러그인

- V1: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/share`, `@capacitor/clipboard`
- V2: `@capacitor/push-notifications`, `@capacitor-firebase/messaging`

### 11-4. Play Store

- Google Play Console 계정
- 키스토어 생성, Play App Signing
- 첫 출시 심사 ~2~7일

---

## 12. 배포 / 인프라

### 12-1. 배포 구조

```
┌────────────────────┐
│  Vercel            │
│  ├─ Next.js 프론트  │
│  ├─ API Routes     │
│  └─ Vercel Cron    │
└──────┬─────────────┘
       │
   ┌───┴───┐
   ▼       ▼
Supabase  OpenAI
(DB)       (Chat Completions API)
```

### 12-2. 환경 변수

| 이름 | 사용처 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트/서버 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 클라이언트 |
| `SUPABASE_SECRET_KEY` | 서버 (Cron) |
| `OPENAI_API_KEY` | 서버 (요약) |
| `SUMMARIZE_BATCH_SIZE` | 서버 |
| `CRON_SECRET` | Cron 인증 |
| `NEXT_PUBLIC_API_BASE_URL` | 클라이언트 |

### 12-3. Vercel Cron

```json
{
  "crons": [
    { "path": "/api/cron/scrape", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/summarize", "schedule": "5 */6 * * *" }
  ]
}
```

### 12-4. 비용 (월)

- Vercel Pro: $20 (Hobby로 시작 가능)
- Supabase Free: $0
- OpenAI gpt-4o-mini: 일 신규 ~150건 요약 기준 월 $1~3 (Hard limit / Prepaid $5 권장)
- **합계: 약 $1~25** (Vercel Hobby 무료 + OpenAI 변동 + Supabase 무료)

---

## 13. 비기능 요구사항

### 성능
- 목록 LCP < 1.5s (3G)
- 상세 응답 < 500ms
- DB 페이지네이션 < 50ms

### 보안
- HTTPS only
- API에 PII 없음
- Service Role/API 키 클라이언트 노출 금지
- `.env.local`, `firebase-service-account*.json` `.gitignore`

### 개인정보
- V1: 사용자 데이터 수집·저장 없음
- V2: FCM 토큰만 (디바이스 식별자, 개인 식별 X)

### 접근성
- V1 기준선: 시맨틱 HTML, alt, 키보드
- 다크모드/큰 글씨는 V2

---

## 14. 리스크 & 미해결 이슈

| 리스크 | 영향 | 완화 |
|---|---|---|
| 네이버 봇 차단 | 스크래핑 중단 | UA 다양화, 간격 조절. V2 RSS 보완 |
| AI 요약 품질 편차 | 사용자 신뢰 ↓ | 매주 샘플 100건 수동 검토, 프롬프트 튜닝 |
| Vercel Cron 시간 한계 | 한 번에 안 끝날 수 있음 | 섹션별 분할 cron, 작은 배치 |
| JSON 파싱 실패 | 배치 손실 | OpenAI `response_format: json_schema strict` 출력 + 3단 폴백 파서 |
| 저작권 | 본문 전체 저장 침해 우려 | V1 개인 학습용. 정식 출시 전 법무 |
| Play Store 거절 | 정책 위반 (저작권 등) | 출처 표기, 정책 점검 |
| 해외증시 셀렉터 미확정 | 7단계 막힘 | 진입 시 직접 페이지 점검 |
| Capacitor + Next.js export 호환성 | 빌드 에러 | Phase 11 진입 전 PoC |

---

## 15. 13단계 개발 로드맵

> 상세 체크리스트는 `TODO.md`. 본 섹션은 큰 흐름.

| Part | 단계 | 핵심 산출물 |
|---|---|---|
| 1 | Claude 아키텍처 구축 | `.claude/`, `CLAUDE.md`, `docs/`, `.gitignore` |
| 2-0 | 환경 준비 | Node, Supabase, OpenAI, Vercel 계정/키 |
| 2-1 | Next.js 스캐폴딩 | `app/`, `package.json` |
| 2-2 | Tailwind + shadcn/ui | 토스 톤 토큰 |
| 2-3 | Supabase 스키마 + RLS | 6테이블 + 인덱스 + RLS |
| 2-4 | 도메인 타입 & 유틸 | `types/`, `lib/sections.ts`, `lib/utils/` |
| 2-5 | API Routes (조회) | `/api/articles`, `/api/articles/[id]` |
| 2-6 | 스크래퍼 (네이버 일반) | 6섹션 |
| 2-7 | 스크래퍼 (네이버 finance) | 해외증시 |
| 2-8 | AI 요약 파이프라인 | OpenAI gpt-4o-mini + 프롬프트 + 배치 |
| 2-9 | Vercel Cron | scrape, summarize |
| 2-10 | 프론트 — 목록 화면 | 섹션 탭, 카드, 시간 그룹, Pull-to-Refresh, 무한 스크롤 |
| 2-11 | 프론트 — 상세 화면 | 한 줄 결론 + summary + 쉬운 설명 + 어려운 용어 + 원문 바텀시트 + 공유 |
| 2-12 | Capacitor 안드로이드 래핑 | APK 생성 + 실기기 |
| 2-13 | Vercel + Play Store 배포 | 프로덕션 + 첫 출시 |

---

## 16. 부록

### 16-1. flow-pick-view에서 가져올 자산

| 위치 | 가져올 것 |
|---|---|
| `src/ArticleList.svelte` | UX 패턴 (Pull-to-Refresh, 무한 스크롤, 섹션 탭) |
| `src/ArticleDetail.svelte` | UX 일부 (원문 바텀시트, 공유 메뉴) |
| `src/utils/format.js` | `formatRelativeTime`, `formatDate` (TS 재작성) |
| `capacitor.config.json` | 패키징 설정 패턴 |

> v1.0 PRD에서 가져오기로 했던 "3단 요약 + 인라인 용어 하이라이트" 패턴은 **버린다**. 사용자 결정으로 단일 summary 문단 + 별도 어려운 용어 리스트로 변경.

### 16-2. flow-pick-api에서 가져올 자산

| 위치 | 가져올 것 |
|---|---|
| `internal/adapter/output/ai/gemini/prompt.json` | 프롬프트 본질 (모델은 OpenAI gpt-4o-mini, 스키마는 단일 summary로 변경) |
| `shema.sql` | 4-테이블 구조 (Postgres 변환 + summary 컬럼 단일화) |
| `internal/adapter/output/search/naver/*` | 셀렉터 매핑 (TS + cheerio 재작성) |
| `internal/adapter/input/http/handler/article_handler.go` | API 응답 + cursor 페이지네이션 (cursor 복합 키로 개선) |

### 16-3. 영원히 안 가져올 것

- 비디오
- 카카오 OAuth (V1)
- iOS 빌드
- 3단 요약 분리 구조 (whatHappened/impactResult/reactionIssue)

---

## 17. 변경 이력

- **v1.0** (2026-04-26): 초기 작성. 교육형 모드 전제. 3단 요약 구조.
- **v1.1** (2026-04-26): UI/UX 5개 결정 반영. AI 스키마 단일 summary로 변경. 협업 모드 (Claude 직접 작성)로 전환.
- **v1.2** (2026-04-30): AI 공급자 Anthropic Claude Haiku → Google Gemini 2.5 Flash 전환 (사용자 기존 키 재활용). V1 공유 메뉴에서 카카오톡 제거 (링크 복사만).
- **v1.3** (2026-05-01): AI 공급자 Google Gemini 2.5 Flash → OpenAI gpt-4o-mini 전환. Gemini Free tier RPD 20 한도가 일 ~150건 처리에 부족 + paid 등록 대비 OpenAI 가격($1~3/월) · 한국어 품질 모두 우수해 채택. SDK 교체(`@google/genai` → `openai`), Structured Outputs(`response_format: json_schema strict`) 채택.

---

> **다음 행동**: `TODO.md` 참조 후 Part 2 — 0단계 환경 준비 부터. 사용자는 외부 계정/키 발급, Claude는 코드 직접 작성.
