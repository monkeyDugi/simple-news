---
description: "현재 맥락에서 쓰면 좋은 Claude Code 기능 1~3개 추천. Claude Code 초심자 튜터링용."
---

# /cc-tip $ARGUMENTS

지금 상황에 맞는 Claude Code 기능을 추천한다.

## 동작

1. `$ARGUMENTS` 파싱:
   - 비어있음 → 대화 직전 맥락 + TODO.md "현재 단계" 기반 추천
   - 키워드 (예: `병렬`, `문서참조`, `리팩토링`, `스크래퍼`) → 해당 주제 기능

2. `cc-mentor` 서브에이전트 또는 동등 형식으로 답변:
   - 현재 맥락 분석 1줄
   - **추천 기능 1~3개** (각각)
     - 이름 + 1줄 요약
     - 지금 왜 유용한가
     - 구체 사용 예 (명령/단축키/파일 경로)
   - 마지막에 "지금 당장 시도해볼 것" 딱 1개

## 예시 출력

```
🎯 현재 맥락: 네이버 일반 스크래퍼 + finance 스크래퍼 둘 다 만들어야 함

💡 **추천 1: 병렬 Subagent**
- scraper-architect 에이전트를 두 번 동시에 호출 → 일반/finance 동시 설계
- "scraper-architect로 일반 스크래퍼 + 동시에 finance 스크래퍼 셀렉터 분석해줘"

💡 **추천 2: Plan Mode** (Shift+Tab)
- cheerio 셀렉터가 깨지면 디버깅 복잡 → 먼저 계획 짜고 승인 후 구현

💡 **추천 3: @문서 참조**
- @docs/scraping-guide.md 보면서 셀렉터 형식 통일

⭐ **지금 시도**: "scraper-architect로 finance 페이지 분석해줘"
```

## 규칙

- 과도하게 많은 기능 쏟지 않음 (3개 이하)
- Simple News 단계별 학습 로드맵 고려 (CLAUDE.md의 표)
- 이미 도입한 기능보다 아직 안 써본 기능 우선
- 한국어
