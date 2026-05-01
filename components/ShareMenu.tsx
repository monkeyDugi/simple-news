"use client";

import { useEffect, useState } from "react";

// V1 공유 = 링크 복사 only.
// (V2 검토: Web Share API / Capacitor Share 플러그인 활용)

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function ShareMenu({ open, onClose, title, url }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 일부 webview 에서 clipboard 권한 미허용 시 fallback
      window.prompt("링크를 복사하세요:", url);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-white p-2 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-2 mt-1 h-1 w-10 rounded-full bg-toss-border" />
        <div className="px-3 py-2">
          <h3 className="mb-1 text-[15px] font-bold text-toss-text">공유하기</h3>
          <p className="line-clamp-1 text-[12px] text-toss-text-weak">{title}</p>
        </div>
        <div className="px-2 pb-1 pt-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full flex-col items-center gap-2 rounded-xl bg-toss-bg-mid py-4 text-[13px] font-bold text-toss-text"
          >
            <span className="text-2xl">🔗</span>
            {copied ? "복사됐어요" : "링크 복사"}
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl py-3 text-[14px] font-medium text-toss-text-weak"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
