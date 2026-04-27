// 일회성 요약 검증 스크립트.
// 사용법: npx tsx scripts/test-summarize.ts
//
// MOCK_ANTHROPIC=true 이거나 ANTHROPIC_API_KEY 가 비어 있으면 fixture 응답을 검증.
// 실제 키가 있으면 Anthropic 1회 호출 후 응답 형식을 검증한다.

import { summarizeBatch } from "@/lib/summarization/claude";
import { summaryArraySchema } from "@/lib/summarization/prompt";

const SAMPLE = [
  {
    templateId: 999001,
    title: "삼성전자, 4분기 영업이익 10조원 돌파",
    content:
      "<p>삼성전자가 4분기 잠정실적으로 영업이익 10조 1200억원을 발표했다. 메모리반도체 가격 반등이 주된 이유다. 주가는 발표 직후 4% 상승했다.</p>",
  },
  {
    templateId: 999002,
    title: "한은, 기준금리 0.25%p 인하",
    content:
      "<p>한국은행 금융통화위원회가 기준금리를 연 3.25%에서 3.00%로 내렸다. 물가 안정세와 내수 부진을 고려한 결정이다.</p>",
  },
];

async function main() {
  console.log(`[test-summarize] start (items=${SAMPLE.length})`);
  const result = await summarizeBatch(SAMPLE);
  // SDK 호출 결과는 이미 zod 통과한 상태지만, 한 번 더 검증해 형식 회귀 방지.
  const parsed = summaryArraySchema.parse(result);
  console.log(`[test-summarize] ok (returned=${parsed.length})`);
  for (const item of parsed) {
    console.log(`- templateId=${item.templateId}`);
    console.log(`  titleTheme=${item.titleTheme}`);
    console.log(`  finalConclusion=${item.finalConclusion}`);
    console.log(`  summary[0..40]=${item.summary.slice(0, 40)}...`);
    console.log(`  keyTerms=${item.keyTerms.length}건`);
  }
}

main().catch((e) => {
  console.error("[test-summarize] failed", e);
  process.exit(1);
});
