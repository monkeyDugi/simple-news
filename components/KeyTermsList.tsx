interface KeyTerm {
  term: string;
  explanation: string;
}

interface Props {
  terms: KeyTerm[];
}

// 어려운 용어 리스트. 빈 배열이면 섹션 자체를 숨겨 화면 차지를 줄인다.
export function KeyTermsList({ terms }: Props) {
  if (terms.length === 0) return null;

  return (
    <section className="px-5 pb-6">
      <h2 className="mb-2.5 text-[13px] font-bold text-toss-text-sub">
        어려운 용어 풀이
      </h2>
      <ul className="space-y-2">
        {terms.map((t) => (
          <li
            key={t.term}
            className="rounded-xl border border-toss-border bg-white p-4"
          >
            <div className="mb-1 text-[14px] font-bold text-toss-text">
              {t.term}
            </div>
            <div className="text-[13px] leading-relaxed text-toss-text-sub">
              {t.explanation}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
