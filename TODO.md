# Simple News 진행 체크리스트

> **현재 단계**: ✅ 12단계 완료 → 🚀 **13단계: Play Store 비공개 테스트 Google 검토 승인 대기 중**
> **마지막 업데이트**: 2026-05-02
>
> **다음 세션 재개 지점**: Google 검토 승인 이메일 확인 → 테스트 링크로 실기기 검증 → 프로덕션 출시
>
> **env 구조 (중요)**
> - `.env.local` — 로컬 dev (localhost)
> - `.env.production` — Android/프로덕션 빌드 (news.flowpick.org). 둘 다 gitignore.
> - Vercel 대시보드 — 서버 환경변수 별도 등록

---

## Part 1: Claude 아키텍처 구축

- [x] `prd.md` (v1.1, UI 결정 반영)
- [x] `CLAUDE.md` (협업 모드)
- [x] `TODO.md`
- [x] `.claude/settings.json`
- [x] `.claude/agents/` (api-route-writer, qa-verifier, supabase-architect, scraper-architect, cc-mentor)
- [x] `.claude/commands/` (status, cc-tip, verify, error-code)
- [x] `.claude/skills/` (new-api-route, new-db-migration, new-scraper, next-step)
- [x] `docs/db-schema.md` (단일 summary 컬럼 반영)
- [x] `docs/api-spec.md` (단일 summary 응답 반영)
- [x] `docs/scraping-guide.md`
- [x] `docs/summarization-guide.md` (단일 문단 프롬프트)
- [x] `docs/notification-guide.md` (V2 로드맵)
- [x] `docs/commit-convention.md`
- [x] `.gitignore`
- [x] `.env.local.example`
- [x] `prototype/index.html` (UI 시안 비교)
- [ ] **사용자**: `git init` 실행
- [ ] **사용자**: 첫 커밋 — `chore: Claude 아키텍처 초기 구축 (Part 1)`
- [ ] **사용자**: Claude Code 재시작 + `/context`, `/agents` 로드 검증

---

## Part 2: 프로젝트 개발 (13단계)

> 코드 작성은 Claude가 직접. 사용자는 외부 계정/키, UI 동작 확인, 모바일 실기기 테스트, 배포 푸시.

### 0단계: 환경 준비 (사용자 작업)

- [x] Node.js 22 LTS 설치 + `.nvmrc` 작성 (Claude)
- [x] npm 동작 확인 (`npm -v`)
- [ ] WebStorm/VSCode + Tailwind 플러그인 (사용자)
- [ ] Supabase CLI 설치 (`brew install supabase/tap/supabase`) + Docker Desktop (사용자)
- [ ] Supabase 프로젝트 생성 → URL / anon key / service role key 확보 (사용자)
- [ ] OpenAI Platform (platform.openai.com/api-keys) → API 키 발급 + Usage limit 또는 Prepaid 한도 설정 (사용자)
- [ ] `CRON_SECRET` 생성 (`openssl rand -hex 32`) (사용자)
- [ ] Vercel 계정 + GitHub 연동 (사용자)
- [ ] Google Play Console 계정 (12단계 직전까지 OK) (사용자)
- [ ] `.env.local` 파일 작성 (`.env.local.example` 복사 후 키 채우기) (사용자)

### 1단계: Next.js 스캐폴딩 ✅

- [x] Next.js 15 + React 19 설치
- [x] `app/layout.tsx` (Pretendard 로드 + 메타데이터)
- [x] `app/page.tsx`
- [x] `next.config.ts` (BUILD_TARGET 토글로 export 분기)

### 2단계: Tailwind + shadcn/ui (토스 톤) ✅

- [x] `tailwind.config.ts` 토스 컬러 토큰
- [x] shadcn/ui 초기화
- [x] `components/ui/button.tsx`
- [x] `app/globals.css` Pretendard + 베이스 스타일

### 3단계: Supabase 스키마 + RLS ✅

- [x] `supabase/migrations/0001_init.sql` ~ `0004_rpc.sql`
- [x] `lib/supabase/{client,server}.ts`
- [x] `types/database.ts`
- [ ] 사용자: `supabase db reset` 성공 + Studio에서 6테이블 + RLS 확인

### 4단계: 도메인 타입 & 유틸 ✅

- [x] `lib/sections.ts`, `types/article.ts`, `types/api.ts`
- [x] `lib/errors.ts`
- [x] `lib/utils/format.ts`, `lib/utils/cursor.ts`

### 5단계: API Routes (조회) ✅

- [x] `lib/articles/repo.ts`, `lib/articles/service.ts`
- [x] `app/api/articles/route.ts`, `app/api/articles/[articleId]/route.ts`
- [ ] 사용자: curl 검증

### 6단계: 스크래퍼 — 네이버 일반 6섹션 ✅

- [x] `lib/scrapers/{types,shared,naver-general,index}.ts`
- [x] `insertArticleTemplate` (repo)
- [x] `scripts/test-scraper.ts`

### 7단계: 스크래퍼 — 네이버 해외증시 ✅

- [x] `lib/scrapers/naver-finance.ts`

### 8단계: AI 요약 파이프라인 ✅

- [x] `openai` SDK 설치 (Anthropic / Gemini SDK 제거)
- [x] `lib/summarization/prompt.ts` (SYSTEM_PROMPT + zod 스키마 + 3단 폴백 파서)
- [x] `lib/summarization/openai.ts` (`summarizeBatch`, 구조화 출력·재시도·모킹 토글)
- [x] `lib/summarization/batch.ts` (섹션별 그룹 + chunk + sleep)
- [x] `applySummary` RPC 호출 (repo)
- [x] `scripts/test-summarize.ts` — 모킹 모드 검증 통과

### 9단계: Vercel Cron ✅

- [x] `vercel.json` (6h 주기 scrape + summarize)
- [x] `lib/cron/auth.ts` (Bearer 검증)
- [x] `lib/cron/scrape-runner.ts` (7섹션 순회 + 실패 격리)
- [x] `app/api/cron/scrape/route.ts`, `app/api/cron/summarize/route.ts`
- [ ] 사용자: 프로덕션 1회 수동 트리거 후 결과 확인

### 10단계: 프론트엔드 — 목록 화면 ✅

- [x] `lib/api/client.ts` (fetchArticleList/Detail 래퍼)
- [x] `components/SectionTabs.tsx` (가로 스크롤 7탭 + localStorage)
- [x] `components/ArticleCard.tsx` (시안 A: 썸네일 64×64 + finalConclusion 1순위)
- [x] `components/TimeGroupHeader.tsx`
- [x] `components/ArticleList.tsx` (PTR 80px + 무한 스크롤 200px + 시간 그룹)
- [x] `app/page.tsx`
- [ ] 사용자: 모바일 360~480px 디자인 확인

### 11단계: 프론트엔드 — 상세 화면 ✅

- [x] `ConclusionBlock` / `ArticleSummary` / `EasyExplanationDialog`
- [x] `KeyTermsList` / `OriginalBottomSheet` / `ShareMenu` (링크 복사 only — 카카오 V2)
- [x] `app/article/page.tsx` (정적 export 호환 위해 path 기반 → query 기반 `/article?id=N`)
- [x] sessionStorage 스크롤 복원
- [ ] 사용자: 모바일 실기기 확인

### 12단계: Capacitor 안드로이드 래핑 ✅

- [x] `@capacitor/{core,cli,android,share,clipboard,app}` 설치
- [x] `capacitor.config.ts` (appId=com.flowpick.simplenews, webDir=out, androidScheme=https)
- [x] `scripts/build-static.mjs` (API 라우트 stash + .next 정리 + export)
- [x] `npm run build:static` 정상 종료 검증
- [x] `npm run cap:sync` 스크립트 (build:static → cap sync android)
- [x] Android SDK CLI 설치 + `android/local.properties` 설정
- [x] `npm run cap:sync` + `./gradlew assembleDebug` 성공
- [x] 실기기 APK 설치 + 동작 확인
- [x] PTR(Pull-to-Refresh) + 안드로이드 뒤로가기 버튼 처리
- [x] CORS 헤더 추가 (Capacitor webview → Vercel API)
- [x] 릴리즈 서명 키스토어 생성 + `./gradlew bundleRelease` AAB 생성

### 13단계: 배포 (진행 중)

- [x] Vercel 프로젝트 연결 + 프로덕션 배포 (news.flowpick.org)
- [x] Production 환경변수 등록
- [x] Vercel Cron 동작 확인 완료
- [x] Google Play Console 앱 등록 (com.flowpick.simplenews)
- [x] 키스토어 생성 + 릴리즈 서명
- [x] AAB 생성 + 비공개 테스트(Alpha) 업로드
- [x] 스토어 등록정보 입력 (설명, 스크린샷, 아이콘, 개인정보처리방침)
- [ ] Google 검토 승인 대기 중
- [ ] 테스트 링크로 실기기 검증 (사용자)
- [ ] 프로덕션 출시 (사용자)

---

## 📌 사용 팁

- 다음 단계 진입 시 `다음 뭐 해?` → `/next-step` 가이드
- 진행률 확인: `/status`
- 검증 체크리스트: `/verify`
- Claude Code 기능 추천: `/cc-tip`
