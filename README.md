# Simple News

> 출퇴근 5분 안에 세상 돌아가는 흐름을 파악하기 위한 미니멀 뉴스 앱.

## 핵심 컨셉

- 7개 섹션 (정치 / 경제 / 사회 / 생활문화 / 세계 / IT과학 / 해외증시)
- 네이버 뉴스 자동 스크래핑
- Claude Haiku로 중복 제거 + 친근한 구어체 요약
- 핵심 용어 자동 풀이
- 안드로이드 웹뷰 (Capacitor) → Play Store 배포
- **잡다한 거 의도적으로 없음** (광고 / 댓글 / 좋아요 / 검색 / 다크모드 모두 V1 미포함)

## 기술 스택

- Next.js 14+ (App Router) · TypeScript · Tailwind · shadcn/ui
- Supabase (Postgres) · Anthropic Claude Haiku 4.5 · Vercel Cron
- Capacitor 7.x (Android only)

## 시작하기

전체 진행 흐름은 `TODO.md` 참조. 각 단계는 사용자가 직접 코드를 타이핑하며 진행하는 교육형 모드.

```bash
# 1. 환경변수 준비
cp .env.local.example .env.local
# → 각 키 채우기

# 2. 의존성 (Part 2 1단계에서)
npm install

# 3. 개발 서버
npm run dev
```

## 문서

- [`prd.md`](./prd.md) — 제품 요구사항 (전체 스펙)
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code 작업 규칙
- [`TODO.md`](./TODO.md) — 13단계 개발 체크리스트
- [`docs/db-schema.md`](./docs/db-schema.md) — DB 스키마
- [`docs/api-spec.md`](./docs/api-spec.md) — API 엔드포인트
- [`docs/scraping-guide.md`](./docs/scraping-guide.md) — 스크래핑 셀렉터
- [`docs/summarization-guide.md`](./docs/summarization-guide.md) — AI 요약 프롬프트/배치
- [`docs/notification-guide.md`](./docs/notification-guide.md) — V2 알림 로드맵
- [`docs/commit-convention.md`](./docs/commit-convention.md) — 커밋 메시지 규칙

## 라이선스

개인 프로젝트. 정식 배포 시 라이선스 정의 예정.
