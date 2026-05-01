import OpenAI from "openai";

import {
  SYSTEM_PROMPT,
  buildUserMessage,
  parseSummaryResponse,
  summaryArraySchema,
  type SummaryInput,
  type SummaryItem,
} from "./prompt";

// docs/summarization-guide.md 의 모델 / 파라미터와 1:1 매칭.
// 코드의 MODEL 이 단일 진리원. RPC 호출 시 p_model 로 명시 전달.
export const MODEL = "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 8192;
const TEMPERATURE = 0.3;

// OpenAI Structured Outputs 용 JSON Schema. prompt.ts 의 zod 와 1:1 동기화.
// strict 모드 제약: top-level 은 object 여야 하고 모든 object 가
// additionalProperties:false + 모든 property 가 required 에 포함돼야 한다.
// 그래서 실제 응답 배열을 summaries 로 한 번 감싼다.
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summaries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          templateId: { type: "integer" },
          titleTheme: { type: "string" },
          summary: { type: "string" },
          easyExplanation: { type: "string" },
          finalConclusion: { type: "string" },
          keyTerms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                term: { type: "string" },
                explanation: { type: "string" },
              },
              required: ["term", "explanation"],
              additionalProperties: false,
            },
          },
        },
        required: [
          "templateId",
          "titleTheme",
          "summary",
          "easyExplanation",
          "finalConclusion",
          "keyTerms",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["summaries"],
  additionalProperties: false,
} as const;

// ───── 모킹 토글 ─────────────────────────────────────────
// MOCK_OPENAI=true 거나 키가 비어 있으면 fixture 응답.
// repo 의 shouldMock 과 동일한 보호 장치.
function shouldMock(): boolean {
  if (process.env.MOCK_OPENAI === "true") return true;
  if (!process.env.OPENAI_API_KEY) return true;
  return false;
}

let cachedClient: OpenAI | null = null;
function getClient(): OpenAI {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "",
      // SDK 기본 timeout 이 600s 라 한 배치가 hang 하면 cron 전체가 막힌다.
      // 10건 배치 기준 정상 응답 30~60초 + 안전 여유 = 90초로 끊는다.
      timeout: 90_000,
      // 자동 재시도는 batch.ts 가 batch 단위로 격리해 처리하므로 여기서는 비활성.
      // (SDK 가 429/5xx 마다 backoff 재시도하면 batch 시간이 비정상적으로 늘어남.)
      maxRetries: 0,
    });
  }
  return cachedClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface SdkErrorLike {
  status?: number;
  code?: number | string;
  message?: string;
}

// APIError.status 가 비어 있을 때 message 에서 "429"/"500"/"503" 추출.
function extractStatus(err: unknown): number | undefined {
  const e = err as SdkErrorLike;
  if (typeof e?.status === "number") return e.status;
  if (typeof e?.code === "number") return e.code;
  const m = e?.message?.match(/\b(4\d{2}|5\d{2})\b/);
  return m ? Number(m[1]) : undefined;
}

// 한 batch 를 요약. 최대 1회 재시도 (rate limit / 5xx).
// 실패 시 throw → 호출자(batch.ts)가 batch 단위로 스킵 처리.
export async function summarizeBatch(
  items: SummaryInput[],
): Promise<SummaryItem[]> {
  if (items.length === 0) return [];
  if (shouldMock()) return mockSummarize(items);

  const client = getClient();
  let lastErr: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(items) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "summary_batch",
            schema: RESPONSE_SCHEMA as unknown as Record<string, unknown>,
            strict: true,
          },
        },
        temperature: TEMPERATURE,
        max_tokens: MAX_OUTPUT_TOKENS,
      });

      const text = res.choices[0]?.message?.content ?? "";
      const parsed = parseSummaryResponse(text);
      if (parsed === null) {
        throw new Error("OpenAI 응답 JSON 파싱 실패");
      }
      // structured outputs 응답: { summaries: [...] }
      // 폴백 파서가 배열을 직접 뽑은 경우도 있어 둘 다 처리.
      const arr = Array.isArray(parsed)
        ? parsed
        : (parsed as { summaries?: unknown }).summaries;
      return summaryArraySchema.parse(arr);
    } catch (err) {
      lastErr = err;
      const status = extractStatus(err);
      // 429 → 60초 후 1회 재시도, 5xx → 5초 후 1회 재시도, 그 외 → 즉시 throw
      if (status === 429 && attempt === 0) {
        await sleep(60_000);
        continue;
      }
      if (status !== undefined && status >= 500 && attempt === 0) {
        await sleep(5_000);
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

// ───── 모킹 응답 ─────────────────────────────────────────
// 실제 OpenAI 호출 없이 prompt.ts 의 zod 스키마를 만족하는 더미 결과.
// MOCK_OPENAI=true 또는 API 키 없을 때 사용.
function mockSummarize(items: SummaryInput[]): SummaryItem[] {
  return items.map((it) => ({
    templateId: it.templateId,
    titleTheme: (it.title || "주제").slice(0, 18),
    summary:
      `${(it.title || "이 기사").slice(0, 30)} 관련 내용을 친근한 톤으로 풀어드릴게요. ` +
      "첫 문장은 무슨 일이 있었는지, 두 번째 문장은 어떤 영향이 있는지, 세 번째 문장은 어떤 반응이 있는지를 자연스럽게 이어 썼어요. " +
      "이건 실제 모델 응답이 아니라 모킹용 fixture예요.",
    easyExplanation:
      "이건 마치 친구가 옆에서 설명해 주는 느낌이에요. 어려운 단어 없이 일상 예시로 풀어드릴게요. 핵심만 짧게 잡고 가요.",
    finalConclusion: "한 줄로 핵심만 요약했어요",
    keyTerms: [{ term: "예시 용어", explanation: "초등학생도 이해할 수준의 설명이에요." }],
  }));
}
