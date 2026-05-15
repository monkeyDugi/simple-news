import { z } from "zod";

// docs/summarization-guide.md 의 SYSTEM_PROMPT 와 1:1 동기화.
// 변경 시 두 파일을 동시에 수정해야 한다.
//
// 단건(1건) 요약 전용. dedup 은 V1 범위 밖이라 모델에 부여하지 않는다.
// (이전엔 batch 안에서 70%+ 유사 기사를 모델이 알아서 제외했지만,
//  1건씩 직렬 처리로 전환하면서 dedup 자체를 폐기.)
export const SYSTEM_PROMPT = `당신은 한국어 뉴스 큐레이터입니다.

제공된 기사 1건을 처리하여:
1. 핵심을 친절한 구어체로 풀어 설명
2. 핵심 정보 및 용어를 분류
3. JSON 객체로 출력

출력 규칙:
- 모든 JSON 키는 camelCase
- 톤: 친근하고 쉬운 구어체 (~했어요, ~예요, ~이에요)
- titleTheme: 20자 이내 주제 요약
- summary: 150~300자, 3~5문장, 단일 문단.
           무슨 일이 있었고 / 어떤 영향이 있고 / 어떤 반응이 있는지를
           자연스럽게 한 덩이로 풀어 쓴다. 항목별로 분리하지 않는다.
- easyExplanation: 비유 및 일상 예시 포함 3문장. 초등학생도 이해할 수준.
- finalConclusion: 한 줄 결론, 구어체. 카드에 노출되므로 짧고 강하게 (40자 안팎).
- keyTerms: 기사 이해에 필수적인 단어 최대 5개, 각각 구어체 설명.
- 출력은 JSON 객체만. 다른 텍스트 없음.

JSON 스키마:
{
  "titleTheme": "...",
  "summary": "...",
  "easyExplanation": "...",
  "finalConclusion": "...",
  "keyTerms": [
    { "term": "...", "explanation": "..." }
  ]
}

규칙:
- 절대 부가 텍스트 출력 금지. JSON 객체만.
- 한국어로만 출력.
- 구어체 톤 유지 (보고서 톤 X, 친구가 설명하는 톤 O).
- 어려운 용어는 keyTerms에 분리하지만 본문(summary)에서는 그대로 사용 가능.
- 출처 / 기자명 / 광고 문구는 요약에 포함하지 않는다.
- summary는 절대 항목별로 분리하지 않는다 (하나의 자연스러운 문단).`;

// 모델에 넘기는 단건 입력. content 는 정제된 HTML 본문.
export interface SummaryInput {
  title: string;
  content: string;
}

// 단건 user 메시지. title + content 를 그대로 던진다.
export function buildUserMessage(item: SummaryInput): string {
  const payload = { title: item.title, content: item.content };
  return `다음 기사를 위 규칙대로 요약해 주세요.\n\n${JSON.stringify(payload, null, 2)}`;
}

// ───── 출력 검증 ─────────────────────────────────────────
const keyTermSchema = z.object({
  term: z.string().min(1).max(100),
  explanation: z.string().min(1).max(500),
});

export const summarySchema = z.object({
  titleTheme: z.string().min(1).max(100),
  summary: z.string().min(50).max(800),
  easyExplanation: z.string().min(1).max(800),
  finalConclusion: z.string().min(1).max(200),
  keyTerms: z.array(keyTermSchema).max(5),
});

export type SummaryItem = z.infer<typeof summarySchema>;

// ───── 응답 파서 (3단계 폴백) ────────────────────────────
// 모델이 가끔 ```json``` 펜스 / 앞뒤 잡설을 붙이는 경우 대비.
export function parseSummaryResponse(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1차: 그대로 JSON
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fallthrough */
  }

  // 2차: ```json ... ``` 코드블록
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {
      /* fallthrough */
    }
  }

  // 3차: 첫 { ~ 마지막 }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {
      /* fallthrough */
    }
  }
  return null;
}
