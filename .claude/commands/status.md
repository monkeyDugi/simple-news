---
description: "TODO.md 기반 진행률 요약. 어디까지 왔고 다음 뭐 할지 한눈에."
---

# /status

TODO.md를 읽고 진행 상황을 한국어로 요약한다.

## 동작

1. `/Users/monkey/Developer/simple-news/TODO.md` 읽기

2. 집계:
   - Part 1 (아키텍처 구축) 완료율: N/M
   - Part 2 (개발) 각 단계 완료 체크박스 수
   - 현재 단계 (최상단 포인터)
   - 현재 단계 내부 체크박스 중 `[ ]`와 `[x]` 개수

3. 출력:

```
📊 **Simple News 진행 현황** (2026-04-26 기준)

🏗️ **Part 1 Claude 아키텍처 구축**: 27/30 완료 (90%)
- 남은 항목: `git init`, 첫 커밋, Claude Code 재시작 검증

🚀 **Part 2 개발**
- 0단계 ✅ 환경 준비
- 1단계 ✅ Next.js 스캐폴딩
- 2단계 ✅ Tailwind + shadcn
- 3단계 🟡 Supabase 스키마 + RLS (5/8)
- 4~13단계 ⬜ 미착수

📍 **현재 단계**: 3단계 - Supabase 스키마 + RLS
🎯 **다음 한 걸음**: `lib/supabase/server.ts` 작성

⏸️ **블로커 감지**
- (없음 / 있으면 표시)
```

4. 필요하면 `/next-step` 호출을 제안.
