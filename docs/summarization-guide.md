# Summarization Guide — Simple News

> Claude Haiku를 사용한 뉴스 요약 파이프라인 운영 가이드.

## 모델

- **Claude Haiku 4.5** — `claude-haiku-4-5-20251001`
- SDK: `@anthropic-ai/sdk`

## 파라미터

```ts
{
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 8192,
  temperature: 0.3,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' }
    }
  ]
}
```

---

## 출력 스키마 (확정 — v1.1)

```json
{
  "templateId": 12345,
  "titleTheme": "20자 이내 주제",
  "summary": "150~300자 단일 문단. 3~5문장. 항목별 분리 금지.",
  "easyExplanation": "비유 3문장",
  "finalConclusion": "한 줄 결론 (40자 안팎)",
  "keyTerms": [
    { "term": "...", "explanation": "..." }
  ]
}
```

> v1.0의 `coreSummaries.{whatHappened, impactResult, reactionIssue}` 3분할 구조는 폐기. 단일 `summary` 필드로 통합.

---

## 시스템 프롬프트 (전체)

> `lib/summarization/prompt.ts`의 `SYSTEM_PROMPT` 상수.

```text
당신은 한국어 뉴스 큐레이터입니다.

제공된 기사 목록을 처리하여:
1. 내용이 70% 이상 유사하거나 중복되는 기사는 가장 낮은 templateId만 남기고 제거 (최대 20개)
2. 각 기사의 핵심을 친절한 구어체로 풀어 설명
3. 핵심 정보 및 용어를 분류
4. JSON 배열로 출력

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
- 출력은 JSON 배열만. 다른 텍스트 없음.

JSON 스키마:
[
  {
    "templateId": 12345,
    "titleTheme": "...",
    "summary": "...",
    "easyExplanation": "...",
    "finalConclusion": "...",
    "keyTerms": [
      { "term": "...", "explanation": "..." }
    ]
  }
]

규칙:
- 절대 부가 텍스트 출력 금지. JSON 배열만.
- 한국어로만 출력.
- 구어체 톤 유지 (보고서 톤 X, 친구가 설명하는 톤 O).
- 어려운 용어는 keyTerms에 분리하지만 본문(summary)에서는 그대로 사용 가능.
- 출처 / 기자명 / 광고 문구는 요약에 포함하지 않는다.
- summary는 절대 항목별로 분리하지 않는다 (하나의 자연스러운 문단).
```

---

## 유저 메시지 형식

```text
다음 기사 목록을 위 규칙대로 요약해 주세요.

[
  {
    "templateId": 12345,
    "title": "...",
    "content": "<p>본문 HTML...</p>"
  },
  ...
]
```

---

## 좋은 / 나쁜 summary 예시

### ✅ 좋은 예 (단일 문단, 3~5문장)

```text
삼성전자가 4분기 영업이익 10조원을 달성했어요. 메모리반도체 가격 상승이
주된 이유고, 발표 직후 주가도 4% 올랐어요. 다만 일부 분석가는 장기 경기
둔화 우려가 여전하다고 봤어요.
```

→ 252자, 3문장, 자연스러운 흐름.

### ❌ 나쁜 예 (항목별 분리)

```text
- 무슨 일: 삼성전자 4분기 영업이익 10조원 달성
- 영향: 주가 4% 상승
- 반응: 분석가들 의견 분분
```

→ 항목 분리 금지. 프롬프트가 단일 문단을 강제.

### ❌ 나쁜 예 (너무 짧음)

```text
삼성이 잘 됐어요.
```

→ 정보 부족. 최소 150자.

---

## 배치 정책

```ts
// lib/summarization/batch.ts
export async function summarizeAll(templates: ArticleTemplate[]) {
  const grouped = groupBy(templates, t => t.section);
  for (const [section, items] of Object.entries(grouped)) {
    for (const batch of chunk(items, BATCH_SIZE)) {
      await summarizeBatch(batch);
      await sleep(2000);
    }
  }
}
```

- **배치 크기**: 환경변수 `SUMMARIZE_BATCH_SIZE` (기본 20)
- **섹션별 그룹화 이유**: 중복 제거 정확도 ↑

---

## JSON 파싱 정책

### 1차: 단순 `JSON.parse`

```ts
const text = response.content[0].text.trim();
const parsed = JSON.parse(text);
```

### 2차: ` ```json ` 코드블록 추출

```ts
const match = text.match(/```json\s*([\s\S]+?)\s*```/);
if (match) parsed = JSON.parse(match[1]);
```

### 3차: 첫 `[` ~ 마지막 `]` 추출

```ts
const first = text.indexOf('[');
const last = text.lastIndexOf(']');
if (first !== -1 && last !== -1) {
  parsed = JSON.parse(text.slice(first, last + 1));
}
```

### 검증 (zod)

```ts
import { z } from 'zod';

const summarySchema = z.object({
  templateId: z.number(),
  titleTheme: z.string().max(100),
  summary: z.string().min(100).max(500),  // 최소 100자, 최대 500자
  easyExplanation: z.string(),
  finalConclusion: z.string().max(200),
  keyTerms: z.array(z.object({
    term: z.string(),
    explanation: z.string(),
  })).max(5),
});

const validated = z.array(summarySchema).parse(parsed);
```

검증 실패 = 배치 전체 스킵, `processed_at` 미갱신 → 다음 cron에서 재시도.

---

## DB 저장 (RPC)

```ts
const { error } = await supabase.rpc('upsert_article_with_summary', {
  template_ids: batch.map(b => b.templateId),
  summaries: validated,
});
```

`docs/db-schema.md`의 `upsert_article_with_summary` 함수 참조.

---

## Rate Limit & 재시도

### 429 응답
```ts
if (error.status === 429) {
  await sleep(60_000);
  return retry();
}
```

1회 재시도 실패 시 다음 cron으로 미룸.

### 5xx 응답
- 1회 재시도, 미해결 시 배치 스킵.

---

## 비용 추적

- Vercel 로그에 매 배치마다 `tokens_in`, `tokens_out`, `latency` 기록
- 월말 Anthropic 청구서 대조

---

## 프롬프트 튜닝 가이드 (V2)

V1 운영 후 매주 샘플 100건 검토:

1. summary 길이 분포 (150~300자 범위 안에 들어오나)
2. summary가 항목별로 분리되어 나오는 케이스 (프롬프트 강화 필요)
3. 중복 제거 미흡 사례
4. keyTerms 적절성
5. JSON 파싱 실패율 (1% 넘으면 프롬프트 강화)

수정한 시스템 프롬프트는 버전 태그로 보관:

```
## 프롬프트 버전 history
- v1.0 (2026-04-26): 3단 분리 구조
- v1.1 (2026-04-26): 단일 summary 문단으로 통합
```

---

## 변경 이력

- **v1.0** (2026-04-26): 초기 (3단 구조)
- **v1.1** (2026-04-26): 단일 summary 문단으로 통합 (사용자 결정)
