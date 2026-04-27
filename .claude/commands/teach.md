---
description: "[DEPRECATED v1.1] 교육형 모드가 폐기되었습니다. 이 슬래시 커맨드는 사용하지 마세요."
---

# /teach (DEPRECATED)

이 커맨드는 v1.1에서 폐기되었습니다. 협업 모드로 전환되어 Claude가 코드를 직접 작성합니다.

코드에 대한 질문이 있으면 그냥 자연어로 물어보세요. (예: "lib/scrapers/naver-general.ts에서 KST→UTC 변환 어떻게 하는지 설명해줘")

# /teach $ARGUMENTS

사용자가 지정한 대상을 교육형 모드로 설명한다.

## 동작

1. `$ARGUMENTS`를 파싱:
   - 파일 경로만 (`/teach app/api/articles/route.ts`) → 해당 파일 안의 주요 함수 자동 선택
   - 파일 + 함수명 (`/teach lib/articles/repo.ts findArticleById`) → 특정 함수
   - 인자 없음 → "어느 파일/함수를 설명할까요?" 물어보기

2. `explain-function` skill의 절차를 따른다:
   - 시그니처 해설
   - 1줄 요약
   - 줄 단위 주석
   - 새 개념 선행 박스
   - 호출 관계
   - 타이핑 체크포인트
   - 검증 방법

3. 한 번에 **1개 함수**만. 여러 개 요청되면 첫 번째만 설명 후 "다음 함수도 원하면 말씀하세요" 안내.

4. `code-teacher` 서브에이전트에 위임해도 되고, 동등한 형식으로 직접 답변해도 된다.

## 예시 호출

- `/teach app/api/articles/route.ts`
- `/teach lib/scrapers/naver-general.ts extractArticleList`
- `/teach lib/summarization/claude.ts`
- `/teach middleware.ts`
