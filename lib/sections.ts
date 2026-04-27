// 7개 섹션 정의 — 코드, 한글 라벨, 네이버 매핑.
// GLOBAL_MARKET 만 finance 도메인이라 별도 처리 (3차 분류 코드).

export interface SectionDef {
  code: SectionCode;
  label: string;
  naverSectionId: string; // 일반 섹션의 section_id 또는 finance 의 의미 식별자
  scraperKind: "general" | "finance";
}

export type SectionCode =
  | "POLITICS"
  | "ECONOMY"
  | "SOCIETY"
  | "LIFE"
  | "WORLD"
  | "IT"
  | "GLOBAL_MARKET";

export const SECTIONS: readonly SectionDef[] = [
  { code: "POLITICS", label: "정치", naverSectionId: "100", scraperKind: "general" },
  { code: "ECONOMY", label: "경제", naverSectionId: "101", scraperKind: "general" },
  { code: "SOCIETY", label: "사회", naverSectionId: "102", scraperKind: "general" },
  { code: "LIFE", label: "생활/문화", naverSectionId: "103", scraperKind: "general" },
  { code: "WORLD", label: "세계", naverSectionId: "104", scraperKind: "general" },
  { code: "IT", label: "IT/과학", naverSectionId: "105", scraperKind: "general" },
  { code: "GLOBAL_MARKET", label: "해외증시", naverSectionId: "403", scraperKind: "finance" },
] as const;

export const SECTION_CODES: readonly SectionCode[] = SECTIONS.map((s) => s.code);

// 디폴트 섹션 — 사용자가 처음 진입할 때 보여줄 탭. PRD 결정.
export const DEFAULT_SECTION: SectionCode = "ECONOMY";

export function isSectionCode(value: unknown): value is SectionCode {
  return typeof value === "string" && SECTION_CODES.includes(value as SectionCode);
}

export function getSection(code: SectionCode): SectionDef {
  const found = SECTIONS.find((s) => s.code === code);
  if (!found) throw new Error(`Unknown section code: ${code}`);
  return found;
}
