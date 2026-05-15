// 일회성 요약 검증 스크립트 (단건).
// 사용법: npx tsx scripts/test-summarize.ts
//
// MOCK_LLM=true 이거나 AWS Bedrock 키가 없으면 fixture 응답.
// 실제 키가 있으면 Bedrock 1회 호출 후 응답 형식을 검증한다.

import { summarizeOne } from "@/lib/summarization/anthropic";
import { summarySchema } from "@/lib/summarization/prompt";

const SAMPLE = {
  title: "삼성전자, 4분기 영업이익 10조원 돌파",
  content:
    "<p>삼성전자가 4분기 잠정실적으로 영업이익 10조 1200억원을 발표했다. 메모리반도체 가격 반등이 주된 이유다. 주가는 발표 직후 4% 상승했다.</p>",
};

async function main() {
  console.log(`[test-summarize] start title="${SAMPLE.title}"`);
  const result = await summarizeOne(SAMPLE);
  // SDK 호출 결과는 이미 zod 통과한 상태지만 한 번 더 검증해 형식 회귀 방지.
  const parsed = summarySchema.parse(result);
  console.log("[test-summarize] ok");
  console.log(`  titleTheme=${parsed.titleTheme}`);
  console.log(`  finalConclusion=${parsed.finalConclusion}`);
  console.log(`  summary[0..40]=${parsed.summary.slice(0, 40)}...`);
  console.log(`  keyTerms=${parsed.keyTerms.length}건`);
}

main().catch((e) => {
  console.error("[test-summarize] failed", e);
  process.exit(1);
});
