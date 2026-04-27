// 시간대 그룹 헤더. "오늘 아침 / 어젯밤 / 이틀 전" 등.
// 카드 사이 회색 띠처럼 보이게 — 시안 A(시간 그룹핑) 패턴.

interface Props {
  label: string;
}

export function TimeGroupHeader({ label }: Props) {
  return (
    <div className="bg-toss-bg-mid/60 px-5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-toss-text-weak">
      {label}
    </div>
  );
}
