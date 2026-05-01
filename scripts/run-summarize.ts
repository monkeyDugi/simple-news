// GitHub Actions cron 에서 직접 실행되는 요약 엔트리.
// 사용법: tsx scripts/run-summarize.ts <group>
//   <group> = "a" | "b"
//   - a: POLITICS / ECONOMY / SOCIETY / GLOBAL_MARKET (KST 05:00 트리거)
//   - b: LIFE / WORLD / IT (KST 06:00 트리거)

import { fetchUnprocessedTemplates } from "@/lib/articles/repo";
import {
  SECTION_GROUPS,
  type SectionGroupName,
} from "@/lib/cron/groups";
import { summarizeAllPending } from "@/lib/summarization/batch";

const BATCH_FETCH_LIMIT = 200;

async function main() {
  const groupArg = (process.argv[2] ?? "a") as SectionGroupName;
  if (!(groupArg in SECTION_GROUPS)) {
    console.error(
      `[run-summarize] unknown group: ${groupArg}. valid: ${Object.keys(SECTION_GROUPS).join(", ")}`,
    );
    process.exit(1);
  }
  const sections = SECTION_GROUPS[groupArg];
  const startedAt = Date.now();
  console.log(
    `[run-summarize] start group=${groupArg} sections=${sections.join(",")}`,
  );
  const templates = await fetchUnprocessedTemplates(
    BATCH_FETCH_LIMIT,
    sections,
  );
  console.log(`[run-summarize] fetched=${templates.length}`);
  const report = await summarizeAllPending(templates);
  const elapsedMs = Date.now() - startedAt;
  console.log(
    "[run-summarize] done",
    JSON.stringify({ group: groupArg, elapsedMs, ...report }),
  );
}

main().catch((e) => {
  console.error("[run-summarize] fatal", e);
  process.exit(1);
});
