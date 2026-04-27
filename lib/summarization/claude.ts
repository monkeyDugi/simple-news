import Anthropic from "@anthropic-ai/sdk";

import {
  SYSTEM_PROMPT,
  buildUserMessage,
  parseSummaryResponse,
  summaryArraySchema,
  type SummaryInput,
  type SummaryItem,
} from "./prompt";

// docs/summarization-guide.md 의 모델 / 파라미터와 1:1 매칭.
export const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 8192;
const TEMPERATURE = 0.3;

// ───── 모킹 토글 ─────────────────────────────────────────
// MOCK_ANTHROPIC=true 거나 키가 비어 있으면 fixture 응답.
// repo 의 shouldMock 과 동일한 보호 장치.
function shouldMock(): boolean {
  if (process.env.MOCK_ANTHROPIC === "true") return true;
  if (!process.env.ANTHROPIC_API_KEY) return true;
  return false;
}

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!cachedClient) {
    cachedClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    });
  }
  return cachedClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface SdkErrorLike {
  status?: number;
  message?: string;
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
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        // 시스템 프롬프트를 캐시 — Haiku 4.5 기준 캐시 히트 시 토큰 비용 큰 폭 절감.
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: buildUserMessage(items) }],
      });

      const textBlock = res.content.find((b) => b.type === "text");
      const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
      const parsed = parseSummaryResponse(text);
      if (parsed === null) {
        throw new Error("Claude 응답 JSON 파싱 실패");
      }
      return summaryArraySchema.parse(parsed);
    } catch (err) {
      lastErr = err;
      const status = (err as SdkErrorLike)?.status;
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
// 실제 Anthropic 호출 없이 prompt.ts 의 zod 스키마를 만족하는 더미 결과.
// MOCK_ANTHROPIC=true 또는 API 키 없을 때 사용.
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
