import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import type { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources/messages";

import {
  SYSTEM_PROMPT,
  buildUserMessage,
  parseSummaryResponse,
  summarySchema,
  type SummaryInput,
  type SummaryItem,
} from "./prompt";

// AWS Bedrock 경유로 Anthropic Sonnet 4.6 호출 (단건).
// - region: ap-northeast-2 (서울)
// - 모델 ID: cross-region inference profile (global.anthropic.*).
// - 인증: AWS_BEARER_TOKEN_BEDROCK 또는 표준 AWS credential chain.
export const MODEL = "global.anthropic.claude-sonnet-4-6";

// 1건 응답이라 2000 토큰이면 여유.
const MAX_OUTPUT_TOKENS = 2000;

// ───── 모킹 토글 ─────────────────────────────────────────
function shouldMock(): boolean {
  if (process.env.MOCK_LLM === "true") return true;
  if (
    !process.env.AWS_BEARER_TOKEN_BEDROCK &&
    !process.env.AWS_ACCESS_KEY_ID
  ) {
    return true;
  }
  return false;
}

let cachedClient: AnthropicBedrock | null = null;
function getClient(): AnthropicBedrock {
  if (!cachedClient) {
    cachedClient = new AnthropicBedrock({
      awsRegion: process.env.AWS_REGION ?? "ap-northeast-2",
      timeout: 60_000,
      // 호출자(run-summarize.ts)가 건 단위로 try/catch 하므로 SDK 자동 재시도는 OFF.
      maxRetries: 0,
    });
  }
  return cachedClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// 한 건을 요약. 429/5xx 는 1회 재시도. 실패 시 throw → 호출자가 건 단위로 격리.
export async function summarizeOne(item: SummaryInput): Promise<SummaryItem> {
  if (shouldMock()) return mockSummarize(item);

  const client = getClient();
  let lastErr: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        thinking: { type: "disabled" },
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: buildUserMessage(item) }],
      });

      const text = extractText(res.content);
      const stopReason = res.stop_reason;
      const parsed = parseSummaryResponse(text);
      if (parsed === null) {
        const tail = text.slice(-250);
        throw new Error(
          `Bedrock 응답 JSON 파싱 실패 stop=${stopReason ?? "?"} len=${text.length} tail=${tail}`,
        );
      }
      return summarySchema.parse(parsed);
    } catch (err) {
      lastErr = err;
      const status = extractStatus(err);
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

interface SdkErrorLike {
  status?: number;
  message?: string;
}

function extractStatus(err: unknown): number | undefined {
  const e = err as SdkErrorLike;
  if (typeof e?.status === "number") return e.status;
  const m = e?.message?.match(/\b(4\d{2}|5\d{2})\b/);
  return m ? Number(m[1]) : undefined;
}

function extractText(content: ContentBlock[]): string {
  return content
    .filter((b): b is TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// ───── 모킹 응답 ─────────────────────────────────────────
function mockSummarize(item: SummaryInput): SummaryItem {
  return {
    titleTheme: (item.title || "주제").slice(0, 18),
    summary:
      `${(item.title || "이 기사").slice(0, 30)} 관련 내용을 친근한 톤으로 풀어드릴게요. ` +
      "첫 문장은 무슨 일이 있었는지, 두 번째 문장은 어떤 영향이 있는지, 세 번째 문장은 어떤 반응이 있는지를 자연스럽게 이어 썼어요. " +
      "이건 실제 모델 응답이 아니라 모킹용 fixture예요.",
    easyExplanation:
      "이건 마치 친구가 옆에서 설명해 주는 느낌이에요. 어려운 단어 없이 일상 예시로 풀어드릴게요. 핵심만 짧게 잡고 가요.",
    finalConclusion: "한 줄로 핵심만 요약했어요",
    keyTerms: [{ term: "예시 용어", explanation: "초등학생도 이해할 수준의 설명이에요." }],
  };
}
