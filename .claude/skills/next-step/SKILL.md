---
name: next-step
description: "Simple News 프로젝트에서 다음에 무엇을 할지 TODO.md 기반으로 안내한다. '다음 뭐 해?', '다음 단계', '이제 뭐 하면 돼?' 요청 시 트리거. /next-step 슬래시 커맨드로도 호출 가능."
---

# next-step — 진행 흐름 네비게이터

## 목적

세션이 바뀌어도 진행을 끊김 없이 잇는다. `TODO.md`의 "현재 단계"를 읽고 다음 한 걸음을 안내.

## 절차

### 1. TODO.md 읽기

```
/Users/monkey/Developer/simple-news/TODO.md
```

- 최상단 `> 현재 단계:` 포인터 파악
- 현재 단계 섹션에서 `[ ]` 첫 체크박스 찾기

### 2. 출력 구성

```
📍 **현재**: Part 2, 6단계 - 네이버 일반 6섹션 스크래퍼

✅ 지금까지 완료
- 1단계: Next.js 스캐폴딩
- 2단계: Tailwind + shadcn/ui
- 3단계: Supabase 스키마 + RLS
- 4단계: 도메인 타입 & 유틸
- 5단계: API Routes (조회)

🎯 **다음 한 걸음**: `lib/scrapers/types.ts` 작성 — Scraper 인터페이스 정의

📘 **사전 지식** (새 개념)
- TypeScript interface vs type alias
- Promise 반환 타입 표기
- ESM import 경로 (~/lib/...)

📂 **만들 파일**
- /Users/monkey/Developer/simple-news/lib/scrapers/types.ts

🧪 **이 단계 완료 판정**
- 모든 스크래퍼가 같은 인터페이스 구현
- tsc --noEmit 통과
- 테스트 스크립트로 1섹션 N건 추출 성공

🎓 **Claude Code 활용 팁** (이 단계)
- scraper-architect 서브에이전트로 셀렉터 분석 위임 가능
- /teach lib/scrapers/naver-general.ts 로 함수 상세 설명
```

### 3. 바로 시작할 첫 함수 제시

사용자 확인 없이도 code-teacher 스타일로 **첫 함수 1개**까지 제공 (타이핑 대기).

## 규칙

- 한 번에 **1개 단계**에 집중. 뒤 단계 미리 뿌리지 않음.
- 완료 판정 조건을 명확히
- 새 개념이 있으면 사전 설명 박스 포함
- 한국어
- TODO.md의 포인터가 비어있으면 "현재 단계를 어디로 할까요?" 질문
