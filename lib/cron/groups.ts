import type { SectionCode } from "@/lib/sections";

// summarize cron 한 번이 처리할 섹션 그룹.
// Hobby plan 의 cron 1개 = 하루 1회 제약 + AWS IP 봇 감지 회피를 위해 GitHub Actions 로 옮긴 후에도
// 한 호출 부담을 절반으로 나누기 위해 두 그룹으로 분담 유지.
//   - A: 출근길 가중 4섹션 (KST 05:00 트리거)
//   - B: 퇴근/저녁 3섹션 (KST 06:00 트리거)
export const SECTION_GROUPS: Record<"a" | "b", SectionCode[]> = {
  a: ["POLITICS", "ECONOMY", "SOCIETY", "GLOBAL_MARKET"],
  b: ["LIFE", "WORLD", "IT"],
};

export type SectionGroupName = keyof typeof SECTION_GROUPS;

// UTC hour 기반으로 그룹 자동 분기.
// hour === 21 (KST 06:00) → B, 그 외(20시 트리거 + 수동 호출 폴백) → A.
export function pickSectionsByUtcHour(hour: number): SectionCode[] {
  return hour === 21 ? SECTION_GROUPS.b : SECTION_GROUPS.a;
}
