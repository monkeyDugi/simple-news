---
name: new-api-route
description: "Simple News에 새 Next.js API Route를 추가한다. '새 API 라우트 만들어줘', 'API 엔드포인트 추가', 'route.ts 생성' 요청 시 트리거. 경로 → 권한 → zod 스키마 → 핸들러 → 에러 처리 → docs/api-spec.md 갱신까지 일관된 절차를 따른다."
---

# new-api-route — API 라우트 추가 절차

## 목적

일관된 구조의 새 API 라우트를 설계한다. 사용자가 직접 타이핑하도록 **파일 단위로 쪼개서** 코드를 제공한다.

## 절차

### 1. 경로 & 메서드 확정

- App Router 규칙: `app/api/<segments>/route.ts` + export된 HTTP 메서드 함수
- 동적 세그먼트: `[paramName]`
- 예: `GET /api/articles/[articleId]` → `/app/api/articles/[articleId]/route.ts`

### 2. 권한 요구사항

- Simple News V1은 **공개 API** (인증 없음)
- **단**, Cron 라우트(`/api/cron/*`)는 반드시 `Authorization: Bearer ${CRON_SECRET}` 검증
- V2에서 사용자 토큰이 들어오면 그때 권한 매트릭스 추가

### 3. zod 입력 스키마 작성

```ts
import { z } from 'zod';

const listQuerySchema = z.object({
  section: z.enum(['POLITICS', 'ECONOMY', 'SOCIETY', 'LIFE', 'WORLD', 'IT', 'GLOBAL_MARKET']),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});
```

### 4. 핸들러 작성 (표준 순서)

1. (Cron만) Authorization 헤더 검증 (401 `UNAUTHORIZED_CRON`)
2. URL 파싱 → zod 검증 (400 + 세부 코드)
3. 서비스 함수 호출 (`lib/<domain>/service.ts`)
4. 에러 매핑 → HTTP 응답 (`handleError`)

### 5. 서비스 레이어 분리

비즈니스 로직은 `lib/<domain>/service.ts`에. 라우트 핸들러는 얇게 유지.

### 6. 에러 코드

기존 `@docs/api-spec.md` 에러표에 있는 코드 재사용. 새 코드 추가 시 표도 갱신.

### 7. 문서 갱신

- `@docs/api-spec.md`의 엔드포인트 표에 행 추가
- 요청/응답 예시 추가
- 새 에러코드 추가 시 표도 갱신

### 8. 검증

- curl로 정상/에러 시나리오 재현
- `qa-verifier` 에이전트에 체크리스트 요청

## 사용자 타이핑 체크포인트

- `route.ts` 파일 생성 → 사용자 타이핑
- `service.ts` 함수 → 사용자 타이핑 (10~30줄씩)
- `docs/api-spec.md` 갱신 → Claude가 직접 편집 (md 파일이므로)
- 완료 후 `TODO.md`에서 해당 항목 체크
