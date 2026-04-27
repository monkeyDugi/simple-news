// 에러 코드 단일 진입점. API 응답의 error.code 와 1:1 매칭.
// docs/api-spec.md 의 에러 표를 코드로 옮긴 것.

export const ERROR_CODES = {
  INVALID_SECTION: { http: 400, message: "올바르지 않은 섹션입니다" },
  INVALID_CURSOR: { http: 400, message: "올바르지 않은 cursor입니다" },
  INVALID_LIMIT: { http: 400, message: "limit는 1~30 사이여야 합니다" },
  INVALID_ARTICLE_ID: { http: 400, message: "올바르지 않은 기사 ID입니다" },
  ARTICLE_NOT_FOUND: { http: 404, message: "기사를 찾을 수 없어요" },
  UNAUTHORIZED_CRON: { http: 401, message: "권한이 없습니다" },
  LLM_RATE_LIMITED: { http: 429, message: "AI 호출 한도 초과" },
  INTERNAL_ERROR: { http: 500, message: "잠시 후 다시 시도해 주세요" },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly http: number;

  constructor(code: ErrorCode, message?: string) {
    const def = ERROR_CODES[code];
    super(message ?? def.message);
    this.code = code;
    this.http = def.http;
  }
}

// 라우트 핸들러에서 catch 후 응답 만들 때 사용.
export function toErrorBody(err: unknown): {
  status: number;
  body: { error: { code: ErrorCode; message: string } };
} {
  if (err instanceof ApiError) {
    return {
      status: err.http,
      body: { error: { code: err.code, message: err.message } },
    };
  }
  // 기타 예외는 INTERNAL_ERROR 로 마스킹 (스택은 로그로만)
  // eslint-disable-next-line no-console
  console.error("[unhandled]", err);
  const def = ERROR_CODES.INTERNAL_ERROR;
  return {
    status: def.http,
    body: { error: { code: "INTERNAL_ERROR", message: def.message } },
  };
}
