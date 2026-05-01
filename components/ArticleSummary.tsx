"use client";

import { useMemo, useState } from "react";

import { TermPopover } from "./TermPopover";

interface KeyTerm {
  term: string;
  explanation: string;
}

interface Props {
  summary: string;
  keyTerms: KeyTerm[];
}

// 단일 문단 summary. v1.1 결정에 따라 항목 분리 없이 흐름대로 보여 준다.
// keyTerms 의 단어가 본문에 등장하면 underline + 클릭 시 TermPopover 로 풀이 노출.
export function ArticleSummary({ summary, keyTerms }: Props) {
  const [active, setActive] = useState<KeyTerm | null>(null);
  const parts = useMemo(() => highlightTerms(summary, keyTerms), [summary, keyTerms]);

  return (
    <section className="px-5 pb-6">
      <h2 className="mb-2.5 text-[13px] font-bold text-toss-text-sub">요약</h2>
      <p className="whitespace-pre-line text-[15px] leading-[1.7] text-toss-text">
        {parts.map((p, i) =>
          p.term ? (
            <button
              key={i}
              type="button"
              onClick={() => setActive(p.term!)}
              className="font-semibold text-toss-blue underline decoration-toss-blue/40 decoration-1 underline-offset-2 active:decoration-toss-blue"
            >
              {p.text}
            </button>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </p>
      <TermPopover
        open={!!active}
        onClose={() => setActive(null)}
        term={active?.term ?? ""}
        explanation={active?.explanation ?? ""}
      />
    </section>
  );
}

interface Part {
  text: string;
  term?: KeyTerm;
}

// 본문을 keyTerm 등장 위치 기준으로 split. 긴 term 부터 매칭해 substring 충돌 방지.
function highlightTerms(text: string, terms: KeyTerm[]): Part[] {
  if (terms.length === 0) return [{ text }];
  const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);

  let parts: Part[] = [{ text }];
  for (const t of sorted) {
    const next: Part[] = [];
    for (const p of parts) {
      if (p.term) {
        next.push(p);
        continue;
      }
      const pieces = p.text.split(t.term);
      for (let i = 0; i < pieces.length; i++) {
        if (pieces[i]) next.push({ text: pieces[i] });
        if (i < pieces.length - 1) next.push({ text: t.term, term: t });
      }
    }
    parts = next;
  }
  return parts;
}
