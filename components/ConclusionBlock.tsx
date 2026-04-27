// 상세 페이지 상단 한 줄 결론 강조 박스. 시안 A 의 그라데이션 카드 패턴.
interface Props {
  conclusion: string;
}

export function ConclusionBlock({ conclusion }: Props) {
  return (
    <div className="mx-5 mb-6 rounded-2xl bg-gradient-to-br from-[#e8f0fe] to-[#f3f8ff] p-5">
      <div className="mb-2 text-[11px] font-bold tracking-wider text-toss-blue">
        AI 결론
      </div>
      <p className="text-[17px] font-bold leading-relaxed tracking-tight text-toss-text">
        {conclusion}
      </p>
    </div>
  );
}
