// 단일 문단 summary. v1.1 결정에 따라 항목 분리 없이 흐름대로 보여 준다.
interface Props {
  summary: string;
}

export function ArticleSummary({ summary }: Props) {
  return (
    <section className="px-5 pb-6">
      <h2 className="mb-2.5 text-[13px] font-bold text-toss-text-sub">
        요약
      </h2>
      <p className="whitespace-pre-line text-[15px] leading-[1.7] text-toss-text">
        {summary}
      </p>
    </section>
  );
}
