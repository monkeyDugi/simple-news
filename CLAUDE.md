# CLAUDE.md — Simple News 프로젝트 가이드

> Claude Code가 이 프로젝트를 이해하고 일관된 방식으로 작업하기 위한 최상위 규칙 문서.

---

## 🚨 작업 규칙 (Critical Rules)

**1. 협업 모드 — Claude가 코드를 직접 작성한다**

- 모든 파일(`.md`, `.ts`, `.tsx`, `.sql`, `.json`, `.css`, `.html` 등)을 Claude가 직접 `Write`/`Edit`로 작성한다.
- 사용자는 PRD/기획/리뷰/실행/배포를 담당한다. 사용자에게 코드를 타이핑하라고 요구하지 않는다.
- 사용자가 명시적으로 "이건 내가 짤게"라고 하지 않는 이상 코드 작성은 Claude의 일.

**2. 작업 단위 & 보고 방식**

- 한 단계 끝나면 사용자에게 **무엇을 만들었고 왜 그렇게 했는지** 짧게 보고. 코드 전체 덤프 X.
- 큰 결정(스키마 변경, 라이브러리 추가, API 시그니처 변경 등)은 작업 전 사용자와 짧게 합의.
- 작은 결정(변수명, 헬퍼 함수 분리, 사소한 스타일 등)은 알아서 처리.
- 단계 진행은 `TODO.md`의 체크박스로 트래킹.

**3. 코드 작성 컨벤션**

- 함수는 30줄 이하 권장, 넘으면 쪼갠다.
- 주석은 한국어, **WHY**에 집중. 코드가 보여주는 WHAT은 쓰지 않는다.
- 라우트 핸들러는 얇게 → 비즈니스 로직은 `lib/<domain>/service.ts`로 분리.
- 에러 코드는 `lib/errors.ts` 상수 사용.
- 응답 포맷:
  - 성공: `{ data: ... }` 또는 `{ data: [...], cursor: {...} }`
  - 실패: `{ error: { code, message } }`

**4. 절대 경로**

- 파일 경로는 항상 절대경로 명시 (`/Users/monkey/Developer/simple-news/...`).

**5. 응답 언어**

- 사용자와의 모든 대화는 한국어.

---

## 📦 프로젝트 개요

**Simple News** — 출퇴근 5분 안에 세상 돌아가는 흐름을 파악하기 위한 미니멀 뉴스 앱.

7개 섹션(정치/경제/사회/생활문화/세계/IT과학/해외증시)에서 네이버 뉴스를 자동 스크래핑 → Claude Haiku로 중복 제거 + 친근한 구어체 요약 + 핵심 용어 풀이 → 카드 리스트 + 상세 화면. 안드로이드 웹뷰 패키징(Capacitor)으로 Play Store 단독 배포.

전체 스펙은 `@prd.md` 참조.

---

## 🏗️ 기술 스택 & 폴더 구조

**스택**

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 14+ (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS + shadcn/ui (토스 뱅킹 톤) |
| 데이터베이스 | Supabase (PostgreSQL) |
| AI 요약 | Anthropic Claude Haiku 4.5 (`@anthropic-ai/sdk`) |
| HTML 파싱 | cheerio (스크래퍼) |
| 스케줄러 | Vercel Cron (6시간 주기) |
| 모바일 래핑 | Capacitor 7.x (Android only) |
| 배포 | Vercel + Google Play Console |
| 패키지 매니저 | npm |

**배포 구조**: Next.js 단일 프로젝트. 프론트(Static Export)/API/Cron 모두 Vercel 한 곳에 배포. Capacitor가 Static Export 결과를 안드로이드 webview assets로 복사.

**폴더 구조**

```
simple-news/
├── app/                              # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                      # 목록 화면 (섹션 탭)
│   ├── articles/[articleId]/page.tsx # 상세 화면
│   └── api/
│       ├── articles/
│       │   ├── route.ts              # GET /api/articles
│       │   └── [articleId]/route.ts  # GET /api/articles/{id}
│       └── cron/
│           ├── scrape/route.ts
│           └── summarize/route.ts
├── components/
│   ├── ui/                           # shadcn
│   ├── ArticleCard.tsx               # AI 결론 1순위 카드
│   ├── ArticleList.tsx               # 무한 스크롤 + Pull-to-Refresh
│   ├── ArticleDetail.tsx
│   ├── SectionTabs.tsx
│   ├── TimeGroupHeader.tsx           # "오늘 아침" 등
│   ├── EasyExplanationDialog.tsx
│   ├── KeyTermsList.tsx
│   ├── OriginalBottomSheet.tsx
│   └── ShareMenu.tsx
├── lib/
│   ├── supabase/{client,server}.ts
│   ├── scrapers/
│   │   ├── types.ts
│   │   ├── naver-general.ts
│   │   ├── naver-finance.ts
│   │   └── shared.ts
│   ├── summarization/
│   │   ├── claude.ts
│   │   ├── prompt.ts
│   │   └── batch.ts
│   ├── articles/{repo,service}.ts
│   ├── sections.ts
│   ├── errors.ts
│   └── utils/
│       ├── format.ts                 # formatRelativeTime, getTimeGroup
│       └── cursor.ts
├── supabase/migrations/
├── types/
├── android/                          # Capacitor (12단계 후)
├── docs/
├── prototype/                        # UI 시안 모음 (참고용)
├── .claude/
├── public/
├── CLAUDE.md / prd.md / TODO.md / README.md
├── vercel.json
├── capacitor.config.ts               # 12단계 후
├── next.config.ts / tailwind.config.ts / tsconfig.json
├── package.json
├── .env.local                        # gitignore
├── .env.local.example
└── .gitignore
```

---

## 🎯 도메인 핵심 개념

**1. 7개 섹션** — 네이버 뉴스 분류와 1:1 매핑

| 코드 | 표시명 | 네이버 매핑 |
|---|---|---|
| `POLITICS` | 정치 | section_id=100 |
| `ECONOMY` | 경제 | section_id=101 |
| `SOCIETY` | 사회 | section_id=102 |
| `LIFE` | 생활/문화 | section_id=103 |
| `WORLD` | 세계 | section_id=104 |
| `IT` | IT/과학 | section_id=105 |
| `GLOBAL_MARKET` | 해외증시 | section_id=101→258→403 (3차분류) |

> 디폴트 섹션 = `ECONOMY`. 마지막 선택은 `localStorage`에 보관.

**2. 기사 라이프사이클**

```
[Cron 스크래핑] → article_template (임시)
                     ↓
              [Cron AI 요약]
                     ↓
                  article (최종)
                  + article_summary
                  + article_key_term
                     ↓
              [API /articles] → 사용자 노출
```

**3. AI 요약 출력 스키마 (확정)**

```ts
{
  titleTheme: string,            // 20자 이내 주제 (상세 페이지 큰 제목)
  summary: string,                // 150~300자 단일 문단 (3~5문장)
  easyExplanation: string,        // 비유 3문장 (쉬운 설명 팝업)
  finalConclusion: string,        // 한 줄 결론 (카드 1순위 노출)
  keyTerms: { term, explanation }[]  // 어려운 용어 최대 5개
}
```

> ⚠️ flow-pick-view의 `coreSummaries.{whatHappened, impactResult, reactionIssue}` 3분할 구조는 **폐기**. 단일 `summary` 문단으로 통합 (사용자 결정).

**4. 사용자/인증** — V1에는 없다. FCM 토큰도 없다. 알림은 V2.

**5. 핵심 엣지 케이스**

- 동일 시각 publishedAt 기사 다수 → cursor에 `(published_at, id)` 복합 키 사용
- 네이버 봇 차단 → User-Agent 헤더 + 요청 간 500ms 슬립
- AI 응답 JSON 파싱 실패 → 배치 전체 스킵, 다음 cron 주기에 재시도
- 본문 추출 실패 → 요약 단계로 넘기지 않음
- 한 번 처리된 기사 중복 저장 → `source_article_id` UNIQUE 제약

---

## 🎨 UI/UX 결정 (확정)

| 영역 | 결정 |
|---|---|
| **홈 화면 IA** | 섹션 탭 메인 (상단 가로 스크롤 7탭). 디폴트 = 경제 |
| **카드 정보 위계** | AI 결론(`finalConclusion`) 1순위, 원본 제목 보조, 썸네일 64×64 |
| **시간 표시** | 시간대 그룹 헤더 ("오늘 아침"/"오늘 낮"/"어젯밤"/"어제 낮"/"이틀 전"...) |
| **상세 페이지** | titleTheme + 한 줄 결론 강조 + summary 문단 + 쉬운 설명 버튼 + 어려운 용어 리스트 + 원문 보기 |
| **컬러 톤** | 화이트 베이스 + 토스 블루(`#3182f6`). 다크모드 V2. |
| **공유** | 카카오톡 + 링크 복사 |
| **Pull-to-Refresh** | 80px threshold, 구현 |
| **무한 스크롤** | 하단 200px 진입 시 다음 페이지 |

상세 화면 시각 명세는 `@prototype/index.html` 섹션 2(시안 A) + 섹션 3 변형 + 섹션 5(시안 A) 참조. PRD 10장에 글로 정리.

---

## ⚡ 주요 CLI 명령어

```bash
# 개발
npm run dev              # localhost:3000
npm run build
npm run lint
npm run typecheck

# Supabase
supabase start
supabase db reset
supabase gen types typescript --local > types/database.ts

# Capacitor (12단계 이후)
npm run build            # Next.js 정적 export → out/
npx cap sync             # out/ → android/app/src/main/assets/public
npx cap open android

# Cron 로컬 테스트
curl -X POST http://localhost:3000/api/cron/scrape -H "Authorization: Bearer $CRON_SECRET"
curl -X POST http://localhost:3000/api/cron/summarize -H "Authorization: Bearer $CRON_SECRET"

# 배포
git push origin main     # Vercel 자동 배포
```

---

## 📚 참조 문서 (Lazy Load — 필요할 때만 `@` 참조)

- `@prd.md` — 원본 PRD v1.1 (전체 스펙, UI 결정 반영)
- `@docs/db-schema.md` — DB 테이블, RLS 정책, 인덱스
- `@docs/api-spec.md` — API 엔드포인트, 요청/응답, 에러코드
- `@docs/scraping-guide.md` — 네이버 스크래핑 셀렉터, User-Agent 규칙
- `@docs/summarization-guide.md` — Claude Haiku 프롬프트, 배치, JSON 파싱
- `@docs/notification-guide.md` — V2 푸시 알림 로드맵
- `@docs/commit-convention.md` — 커밋 메시지 규칙
- `@TODO.md` — 13단계 진행 체크리스트
- `@prototype/index.html` — 결정된 UI 시안 (참조용)

---

## 🔄 작업 워크플로우 (단계마다)

1. **세션 시작 시** — `@TODO.md` 확인 → 다음 미체크 항목 파악
2. **단계별 사전 합의** — 큰 결정(스키마, API 시그니처)은 작업 전 짧게 합의
3. **구현** — Claude가 `Write`/`Edit`로 직접 작성. 30줄 이상 함수는 쪼갬
4. **검증** — `Bash`로 자동 검증 가능한 부분은 직접 확인 (typecheck, curl, supabase db reset 등)
5. **사용자 확인 필요한 부분** — 외부 계정/UI 동작은 사용자에게 확인 요청
6. **TODO 체크** — 완료된 항목 `[x]` 표시
7. **커밋** — 사용자가 명시 요청 시에만 (`@docs/commit-convention.md`)

---

## 🛡️ 검증 정책

**Claude가 직접 검증 (Bash로):**
- TypeScript 타입 (`npm run typecheck`)
- 린트 (`npm run lint`)
- 빌드 (`npm run build`)
- API 응답 형식 (`curl`)
- DB 스키마 (`supabase db reset`)
- 환경변수 파일 존재/구조
- 스크래퍼 단위 동작 (일회성 스크립트)
- AI 요약 응답 JSON 형식

**사용자에게 확인 요청:**
- 외부 도구 설치 (`brew install`, IDE 확장)
- 외부 계정/프로젝트 생성 (Supabase 대시보드, Anthropic Console, Vercel, Google Play Console)
- API 키 발급 / 환경변수 등록
- UI 조작(앱 화면 확인, 버튼 동작 확인)
- 모바일 실기기 테스트

**검증 실패 시:**
- 다음 단계로 넘어가지 않음
- 에러 원인 분석 + 수정 시도
- 두 번 실패하면 사용자에게 보고 후 합의

---

## ⚠️ 하지 말 것

- 큰 결정(스키마 변경, 라이브러리 추가, API 시그니처 변경)을 사용자 합의 없이 진행
- 한 번에 여러 단계 동시 진행 (한 단계 = 한 보고 = 한 검증)
- AI 요약 출력 스키마(`titleTheme/summary/easyExplanation/finalConclusion/keyTerms`)를 임의로 변경
- V2 기능(알림, 로그인, 검색, 다크모드)을 V1에 슬쩍 넣음
- `git push --force`, `rm -rf` 등 파괴적 명령
- `.env.local`, `firebase-service-account*.json` 등 시크릿 파일 커밋
- 영어로 답변
