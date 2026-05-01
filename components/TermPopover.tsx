"use client";

import { useEffect } from "react";

// 어려운 용어 클릭 시 보여 주는 overlay dialog. EasyExplanationDialog 와 동일 패턴 (native overlay).
interface Props {
  open: boolean;
  onClose: () => void;
  term: string;
  explanation: string;
}

export function TermPopover({ open, onClose, term, explanation }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-[12px] font-bold tracking-wider text-toss-blue">
          용어 풀이
        </div>
        <h3 className="mb-3 text-[18px] font-extrabold text-toss-text">
          {term}
        </h3>
        <p className="text-[15px] leading-relaxed text-toss-text-sub">
          {explanation}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-toss-blue py-3 text-[15px] font-bold text-white active:bg-toss-blue-pressed"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
