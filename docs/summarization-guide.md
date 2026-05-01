# Summarization Guide — Simple News

> OpenAI gpt-4o-mini 를 사용한 뉴스 요약 파이프라인 운영 가이드.

## 모델

- **OpenAI gpt-4o-mini** — `gpt-4o-mini`
- SDK: `openai` (공식 Node SDK)
- 출력 강제: Chat Completions `response_format: { type: "json_schema", json_schema: { strict: true } }`
- 한국어 품질: 수준급 (요약·구어체 자연스러움)
- 단가: 입력 $0.15 / 1M tokens, 출력 $0.60 / 1M tokens (실측 기준 월 운영비 $1~3)

## 파라미터

```ts
await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "summary_batch",
      schema: RESPONSE_SCHEMA, // lib/summarization/openai.ts
      strict: true,
    },
  },
  temperature: 0.3,
  max_tokens: 8192,
});
```

`RESPONSE_SCHEMA` 는 `prompt.ts` 의 zod 스키마와 1:1 동기화. OpenAI Structured Outputs 의 strict 모드 제약 때문에 응답 배열을 `{ summaries: [...] }` 객체로 한 번 감싼다 (top-level 은 object 여야 하므로).

---

## 출력 스키마 (확정 — v1.1)

각 항목 1건의 형태:

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

OpenAI 응답 본체는 다음과 같이 객체로 한 번 감싸 들어온다:

```json
{ "summaries": [ { ...item1 }, { ...item2 }, ... ] }
```

`openai.ts` 가 `summaries` 키를 풀어 배열만 zod 검증으로 흘려보낸다.

> v1.0의 `coreSummaries.{whatHappened, impactResult, reactionIssue}` 3분할 구조는 폐기. 단일 `summary` 필드로 통합.

---

## 시스템 프롬프트 (전체)

> `lib/summarization/prompt.ts` 의 `SYSTEM_PROMPT` 상수.

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

(중략 — 자세한 규칙은 prompt.ts 참조)
```

> 프롬프트는 "JSON 배열만" 을 명시하지만, OpenAI Structured Outputs 의 strict 모드가 객체 wrapper(`summaries`) 를 강제하므로 실제 응답은 객체로 감싸 나온다. SDK 어댑터(`openai.ts`) 가 풀어준다.

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
export async function summarizeAllPending(templates: TemplateRow[]) {
  const grouped = groupBySection(templates);
  for (const items of grouped.values()) {
    await processSection(items, BATCH_SIZE);   // 섹션 순차
  }
}

async function processSection(items: TemplateRow[], size: number) {
  for (const chunk of chunkArray(items, size)) {  // chunk 순차
    const summaries = await summarizeBatch(inputs);
    for (const s of summaries) await applySummary(s, MODEL);
    await sleep(BATCH_DELAY_MS); // 1s
  }
}
```

- **배치 크기**: 환경변수 `SUMMARIZE_BATCH_SIZE` (기본 10)
- **배치 간 sleep**: `BATCH_DELAY_MS = 1_000`
- **섹션 동시성**: 1 (직렬). v3.1 에서 7 동시 실험 → batch 9 중 6~7 실패(429 추정)로 회귀.
- **섹션별 그룹화 이유**: 중복 제거 정확도 ↑ (다른 섹션이 섞이면 모델이 주제 헷갈림)
- **응답 누락 templateId**: 모델이 70%+ 유사로 제거한 것 → 다음 cron 에서 재시도하지 않음 (정상 동작)

### Cron 흐름 (flowpick 패턴 그대로)

GitHub Actions (`.github/workflows/cron.yml`) 가 6시간 주기 (`0 */6 * * *` UTC = KST 09/15/21/03시) 로 `scripts/run-cron.ts` 를 실행. 한 process 안에서 순차:

```
1) runScrapeAll()              ← collect → filter → save
2) fetchUnprocessedTemplates() ← article_template 전체 조회 (섹션 분담 없음)
3) summarizeAllPending()       ← 섹션별 그룹 → batch 처리
4) deleteAllArticleTemplates() ← 사이클 종료 시 통째로 삭제 (실패한 것까지)
```

핵심: **template 은 한 사이클 임시 버퍼**. 이번 사이클에 처리 못 한 건 그냥 버리고, 다음 cron 이 네이버 목록에서 신규로 다시 가져옴 (flowpick `cleaner.DeleteAll()` 패턴).

`applySummary` 는 article 만 만들고 template 은 안 건드림 → 정리는 사이클 끝에서 한 번.

---

## JSON 파싱 정책

`response_format` strict 모드 덕에 거의 1차에서 통과. 그래도 SDK 차이·모델 변동을 대비해 3단 폴백 유지.

### 1차: 단순 `JSON.parse`

```ts
const text = res.choices[0].message.content;
const parsed = JSON.parse(text);
```

### 2차: ` ```json ` 코드블록 추출

```ts
const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
if (match) parsed = JSON.parse(match[1]);
```

### 3차: 첫 `[` ~ 마지막 `]` 추출 (배열만 반환된 경우 대비)

```ts
const first = text.indexOf('[');
const last = text.lastIndexOf(']');
if (first !== -1 && last !== -1) {
  parsed = JSON.parse(text.slice(first, last + 1));
}
```

### 객체 wrapper 처리

```ts
const arr = Array.isArray(parsed)
  ? parsed
  : (parsed as { summaries?: unknown }).summaries;
```

### 검증 (zod)

`lib/summarization/prompt.ts` 의 `summaryArraySchema` 로 최종 검증. 검증 실패 = 배치 전체 스킵, `processed_at` 미갱신 → 다음 cron 에서 재시도.

---

## DB 저장 (RPC)

```ts
await applySummary(summary, MODEL);
// 내부적으로 supabase.rpc('upsert_article_with_summary', {
//   p_template_id, p_summary, p_model: 'gpt-4o-mini'
// })
```

`docs/db-schema.md` 의 `upsert_article_with_summary` 함수 참조.

---

## Rate Limit & 재시도

### 429 (rate limit)
```ts
if (status === 429) {
  await sleep(60_000);
  return retry(); // 1회만
}
```

### 5xx (server error)
```ts
if (status >= 500) {
  await sleep(5_000);
  return retry(); // 1회만
}
```

1회 재시도 실패 시 배치 전체 스킵 → 다음 cron 으로 미룸.

`openai` SDK 의 `APIError` 는 `.status` 속성을 가진다. 일부 케이스에서 비어 있을 수 있어 `openai.ts` 의 `extractStatus()` 가 message 에서도 추출.

---

## 비용 추적

- Vercel 로그에 매 배치마다 `usage` 기록 (`prompt_tokens`, `completion_tokens`, `total_tokens`)
- OpenAI 대시보드 ([platform.openai.com/usage](https://platform.openai.com/usage)) 에서 일/월 누적 확인
- **Hard limit / Prepaid 잔액**으로 폭주 방지 (필수)

---

## 프롬프트 튜닝 가이드 (V2)

V1 운영 후 매주 샘플 100건 검토:

1. summary 길이 분포 (150~300자 범위 안에 들어오나)
2. summary가 항목별로 분리되어 나오는 케이스 (프롬프트 강화 필요)
3. 중복 제거 미흡 사례
4. keyTerms 적절성
5. JSON 파싱 실패율 (1% 넘으면 프롬프트 강화)

---

## 변경 이력

- **v1.0** (2026-04-26): 초기 (3단 구조)
- **v1.1** (2026-04-26): 단일 summary 문단으로 통합 (사용자 결정)
- **v2.0** (2026-04-30): AI 공급자 Anthropic Claude Haiku 4.5 → Google Gemini 2.5 Flash 전환. `responseSchema` 구조화 출력 도입.
- **v3.0** (2026-05-01): AI 공급자 Google Gemini 2.5 Flash → OpenAI gpt-4o-mini 전환. Gemini Free tier RPD 20 한도 발견 + Paid 등록 대신 가격·품질 모두 우수한 OpenAI 채택. Structured Outputs(`response_format: json_schema strict`) + `summaries` 객체 wrapper 도입.
- **v3.1** (2026-05-01): Cron 주기 6시간(하루 4회) → 하루 2회(KST 06:00 / 18:00 = UTC 21:00 / 09:00). 섹션 7개를 `Promise.all` 로 병렬 처리하도록 변경. 16분 직렬 → ~3분 병렬 + TPD 사용량 50% → 25%.
- **v3.2** (2026-05-01): v3.1 의 섹션 병렬 실측에서 batch 9 중 6~7 실패(TPM 순간 초과 추정) 확인 → 직렬로 회귀. 대신 한 cron 호출이 일부 섹션만 처리하도록 시간대 분담 도입(morning 4섹션 / evening 3섹션). `fetchUnprocessedTemplates` 에 `sections` 필터 인자 추가.
- **v3.3** (2026-05-01): Vercel Hobby 의 "cron 1개당 하루 1회" 제약 발견 (v3.1·3.2 의 `0 21,9 * * *` 표현은 deploy 실패). cron 을 3개로 분리: scrape (KST 03:00), summarize A (KST 05:00, 4섹션), summarize B (KST 06:00, 3섹션). 그룹 이름 morning/evening → A/B 로 변경.
- **v3.4** (2026-05-01): cron 자체를 GitHub Actions 로 이전 (Vercel/AWS IP 봇 차단 회피). flowpick CollectNews/SummarizeNews 패턴 그대로 정렬: scrape collect→filter→save 3단계, summarize 끝에 `DeleteAll`. 시간대 분담 / 섹션 그룹 인자 / per-template DELETE 모두 제거. cron 6시간 주기로 복구 (`0 */6 * * *` UTC).
