"use client";

import { useEffect } from "react";

// 본문 원문(article_content)을 보여주는 바텀시트.
// HTML 본문이라 dangerouslySetInnerHTML 사용. 본문은 cleanContent 로 정제된 상태.
interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  contentHtml: string;
  link: string;
  publisher: string | null;
}

export function OriginalBottomSheet({
  open,
  onClose,
  title,
  contentHtml,
  link,
  publisher,
}: Props) {
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
      aria-label="원문 보기"
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-toss-border px-5 py-4">
          <h3 className="line-clamp-1 flex-1 pr-3 text-[15px] font-bold text-toss-text">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-[20px] text-toss-text-weak"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: "calc(85vh - 120px)" }}>
          {publisher && (
            <div className="mb-3 text-[12px] text-toss-text-weak">{publisher}</div>
          )}
          <article
            className="prose-original text-[15px] leading-[1.7] text-toss-text"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
          <a
            href={link}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 block text-[13px] text-toss-blue underline-offset-2 hover:underline"
          >
            네이버에서 원본 기사 보기 →
          </a>
        </div>
      </div>
    </div>
  );
}
