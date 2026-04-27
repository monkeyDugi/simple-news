// 시간 포맷 헬퍼. 사용자 노출용 한국어 문자열을 만든다.
// 기준 시각은 호출 시점의 시스템 시계. 테스트가 필요하면 now 인자로 주입 가능.

type TimeBucket = "아침" | "낮" | "밤";

function getBucket(hour: number): TimeBucket {
  // PRD 결정: 0~12 아침, 12~18 낮, 18~24 밤
  if (hour < 12) return "아침";
  if (hour < 18) return "낮";
  return "밤";
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDays(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

// 카드 부가 정보용. "방금 전 / N분 전 / N시간 전 / N일 전 / 4월 26일"
export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  return target.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

// 목록 시간대 그룹 헤더용. "오늘 아침 / 오늘 낮 / 어젯밤 / 어제 낮 / 이틀 전 / 사흘 전 / 4월 21일"
export function getTimeGroup(date: Date | string, now: Date = new Date()): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const days = diffDays(target, now);
  const bucket = getBucket(target.getHours());

  if (days === 0) return `오늘 ${bucket}`;
  if (days === 1) {
    // "어젯밤" 은 관용 표현 — "어제 밤" 보다 자연스러움
    if (bucket === "밤") return "어젯밤";
    return `어제 ${bucket}`;
  }
  if (days === 2) return "이틀 전";
  if (days === 3) return "사흘 전";
  if (days < 7) return `${days}일 전`;
  return target.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
