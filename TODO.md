# Simple News 진행 체크리스트

> **현재 단계**: ✅ Part 1 완료 → 🚀 Part 2 · 0단계 (환경 준비)
> **마지막 업데이트**: 2026-04-26

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

- [ ] Node.js 22 LTS 설치 + `.nvmrc` 작성 (Claude)
- [ ] npm 동작 확인 (`npm -v`)
- [ ] WebStorm/VSCode + Tailwind 플러그인
- [ ] Supabase CLI 설치 (`brew install supabase/tap/supabase`) + Docker Desktop
- [ ] Supabase 프로젝트 생성 → URL / anon key / service role key 확보
- [ ] Anthropic Console (console.anthropic.com) → API 키 발급
- [ ] 카카오 Developers 앱 생성 → JS 키
- [ ] `CRON_SECRET` 생성 (`openssl rand -hex 32`)
- [ ] Vercel 계정 + GitHub 연동
- [ ] Google Play Console 계정 (12단계 직전까지 OK)
- [ ] `.env.local` 파일 작성 (`.env.local.example` 복사 후 키 채우기)

### 1단계: Next.js 스캐폴딩 (Claude 작업)

- [ ] `npx create-next-app@latest .` 실행 (사용자)
- [ ] `package.json`, `tsconfig.json` 검토
- [ ] `app/layout.tsx` (Pretendard 로드 + 메타데이터)
- [ ] `app/page.tsx` (자리만)
- [ ] `next.config.ts` (`output: "export"`)
- [ ] `npm run dev` → localhost:3000 확인 (사용자)

### 2단계: Tailwind + shadcn/ui (토스 톤)

- [ ] `tailwind.config.ts` 토스 컬러 토큰 (`#3182f6`, `#191f28`, `#6b7684`)
- [ ] shadcn/ui init (`npx shadcn@latest init`) — 사용자가 명령 실행, Claude가 config 작성
- [ ] 첫 컴포넌트 추가 (`npx shadcn@latest add button`)
- [ ] `app/globals.css` Pretendard + 베이스 스타일

### 3단계: Supabase 스키마 + RLS

- [ ] `supabase init` (사용자 명령)
- [ ] `supabase/migrations/0001_init.sql` (6테이블, `article_summary`는 단일 `summary` 컬럼)
- [ ] `supabase/migrations/0002_indexes.sql`
- [ ] `supabase/migrations/0003_rls.sql`
- [ ] `supabase/migrations/0004_rpc.sql` (`upsert_article_with_summary`)
- [ ] `lib/supabase/client.ts`
- [ ] `lib/supabase/server.ts`
- [ ] `supabase db reset` 성공 (사용자 실행 + Claude 검증)
- [ ] `supabase gen types typescript --local > types/database.ts`
- [ ] Studio에서 6 테이블 + RLS 활성 확인 (사용자)

### 4단계: 도메인 타입 & 유틸

- [ ] `lib/sections.ts` (7섹션 enum + 라벨 + 네이버 코드)
- [ ] `types/article.ts`, `types/api.ts`
- [ ] `lib/errors.ts`
- [ ] `lib/utils/format.ts` (`formatRelativeTime`, `getTimeGroup`)
- [ ] `lib/utils/cursor.ts` (base64 encode/decode)

### 5단계: API Routes (조회)

- [ ] `lib/articles/repo.ts` (Supabase 쿼리)
- [ ] `lib/articles/service.ts` (cursor 처리 + 응답 정형화)
- [ ] `app/api/articles/route.ts`
- [ ] `app/api/articles/[articleId]/route.ts`
- [ ] curl로 빈 응답 / 404 검증

### 6단계: 스크래퍼 — 네이버 일반 6섹션

- [ ] `lib/scrapers/types.ts` (Scraper 인터페이스)
- [ ] `lib/scrapers/shared.ts` (User-Agent, HTML 정제, KST→UTC)
- [ ] `lib/scrapers/naver-general.ts`
- [ ] 본문 추출 (`#dic_area`)
- [ ] 메타 추출 (publisher, author, publishedAt)
- [ ] `lib/articles/repo.ts` `insertArticleTemplate` 추가
- [ ] 일회성 테스트 (`scripts/test-scraper.ts ECONOMY`)

### 7단계: 스크래퍼 — 네이버 해외증시

- [ ] **사용자**: 페이지 직접 점검 후 셀렉터 확정 → `docs/scraping-guide.md` 갱신 (Claude가 받아 적기)
- [ ] `lib/scrapers/naver-finance.ts`
- [ ] 일회성 테스트

### 8단계: AI 요약 파이프라인

- [ ] `npm i @anthropic-ai/sdk`
- [ ] `lib/summarization/prompt.ts` (단일 summary 프롬프트)
- [ ] `lib/summarization/claude.ts` (`summarizeBatch`)
- [ ] `lib/summarization/batch.ts` (섹션별 그룹 + 분할)
- [ ] zod 검증 + JSON 파싱
- [ ] DB 저장 (`upsert_article_with_summary` RPC)
- [ ] 1건 테스트로 응답 형식 검증

### 9단계: Vercel Cron

- [ ] `vercel.json` (crons 배열)
- [ ] `app/api/cron/scrape/route.ts` (Authorization 검증 + 7섹션 순회)
- [ ] `app/api/cron/summarize/route.ts`
- [ ] 로컬 curl 테스트
- [ ] 프로덕션 1회 수동 트리거 후 결과 확인 (사용자)

### 10단계: 프론트엔드 — 목록 화면

- [ ] `components/SectionTabs.tsx` (가로 스크롤 7탭, `localStorage` 저장)
- [ ] `components/ArticleCard.tsx` (썸네일 64×64 + finalConclusion 1순위 + 원본 제목 보조)
- [ ] `components/TimeGroupHeader.tsx` ("오늘 아침" 등)
- [ ] `components/ArticleList.tsx` (Pull-to-Refresh + 무한 스크롤 + 시간 그룹 분할)
- [ ] `app/page.tsx` 합치기
- [ ] `localStorage` 마지막 섹션 저장/복원
- [ ] 모바일 360~480px 디자인 확인 (사용자)

### 11단계: 프론트엔드 — 상세 화면

- [ ] `components/ConclusionBlock.tsx` (한 줄 결론 강조 박스)
- [ ] `components/ArticleSummary.tsx` (단일 문단 summary)
- [ ] `components/EasyExplanationDialog.tsx` (쉬운 설명 팝업)
- [ ] `components/KeyTermsList.tsx` (어려운 용어 리스트 카드)
- [ ] `components/OriginalBottomSheet.tsx`
- [ ] `components/ShareMenu.tsx` (카카오톡 + 링크 복사)
- [ ] `app/articles/[articleId]/page.tsx`
- [ ] 뒤로가기 시 목록 스크롤 위치 복원 (`sessionStorage`)
- [ ] 모바일 실기기 확인 (사용자)

### 12단계: Capacitor 안드로이드 래핑

- [ ] `npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/share @capacitor/clipboard`
- [ ] `npx cap init "Simple News" "com.simplenews.app"` (사용자)
- [ ] `capacitor.config.ts`
- [ ] `npm run build` (Static Export)
- [ ] `npx cap add android`
- [ ] `npx cap sync`
- [ ] `npx cap open android` → Android Studio 빌드 (사용자)
- [ ] APK 생성 + 실기기 테스트 (사용자)

### 13단계: 배포

- [ ] Vercel 프로젝트 연결 (사용자)
- [ ] Production 환경변수 등록 (사용자)
- [ ] 첫 자동 배포 + 도메인 매핑 (사용자)
- [ ] Vercel Cron 동작 확인 (24시간 모니터링)
- [ ] Google Play Console 앱 등록 (사용자)
- [ ] 키스토어 생성 + 서명 (사용자)
- [ ] AAB 생성 + 업로드
- [ ] 메타데이터 (스크린샷, 설명, 아이콘) 업로드 (사용자)
- [ ] 내부 테스트 트랙 → 프로덕션 출시

---

## 📌 사용 팁

- 다음 단계 진입 시 `다음 뭐 해?` → `/next-step` 가이드
- 진행률 확인: `/status`
- 검증 체크리스트: `/verify`
- Claude Code 기능 추천: `/cc-tip`
