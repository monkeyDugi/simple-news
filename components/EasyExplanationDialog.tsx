"use client";

import { useEffect } from "react";

// shadcn dialog 의 의존성을 피해 native overlay 로 직접 구현. (Capacitor 환경 단순화)
// ESC + 바깥 클릭 + 닫기 버튼으로 닫힌다.

interface Props {
  open: boolean;
  onClose: () => void;
  explanation: string;
}

export function EasyExplanationDialog({ open, onClose, explanation }: Props) {
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
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <h3 className="text-[16px] font-bold text-toss-text">쉬운 설명</h3>
        </div>
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
