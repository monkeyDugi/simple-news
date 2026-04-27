---
description: "API 에러 코드의 의미/발생 조건/대응 방법을 조회. 인자: 에러 코드명."
---

# /error-code $ARGUMENTS

주어진 에러 코드를 `@docs/api-spec.md`에서 조회해 상세 설명.

## 동작

1. `$ARGUMENTS`에서 에러 코드 파싱 (예: `ARTICLE_NOT_FOUND`, `INVALID_CURSOR`)

2. `docs/api-spec.md`의 에러 표에서 해당 코드 찾기
3. `prd.md`에서 해당 코드가 등장하는 맥락 검색
4. 관련 `docs/*` 파일에서 추가 맥락 수집

5. 출력:

```
❌ **ARTICLE_NOT_FOUND** (404)

📝 의미: 존재하지 않는 articleId로 상세 조회 시도

🎯 발생하는 API
- `GET /api/articles/{articleId}`

🧩 관련 흐름
- 사용자가 오래된 링크 진입 → DB에 article 행 없음
- 또는 articleId가 정수지만 DB에 없는 값

🔧 대응
- 클라이언트: "기사를 찾을 수 없어요" 메시지 + 목록으로 돌아가기 버튼
- 서버: 그대로 404 반환 (Soft delete 정책 없음)

💬 사용자 메시지: "기사를 찾을 수 없어요"
```

6. 코드가 없으면 유사 코드 제안 + `@docs/api-spec.md` 확인 링크

## 예시

- `/error-code ARTICLE_NOT_FOUND`
- `/error-code INVALID_SECTION`
- `/error-code INVALID_CURSOR`
