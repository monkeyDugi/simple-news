"use client";

import { useEffect, useState } from "react";

// PRD 결정: 카카오톡 공유 + 링크 복사. Web Share API 가 가능하면 그것도 같이 노출.
// 카카오 JS 키가 없으면 카카오 버튼은 숨김.

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description: string;
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share?: {
        sendDefault: (opts: unknown) => void;
      };
    };
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_SDK_KEY;

function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Kakao?.Share) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-kakao-sdk]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.share.min.js";
    s.dataset.kakaoSdk = "true";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("kakao sdk load failed"));
    document.head.appendChild(s);
  });
}

export function ShareMenu({ open, onClose, title, url, description }: Props) {
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

  async function handleKakao() {
    if (!KAKAO_KEY) return;
    try {
      await loadKakaoSdk();
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_KEY);
      }
      window.Kakao?.Share?.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl: "",
          link: { mobileWebUrl: url, webUrl: url },
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[share] kakao failed", e);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 일부 webview 에서 clipboard 권한 미허용 시 fallback: prompt
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
        <div className="grid grid-cols-2 gap-2 px-2 pb-1 pt-3">
          {KAKAO_KEY && (
            <button
              type="button"
              onClick={handleKakao}
              className="flex flex-col items-center gap-2 rounded-xl bg-[#fee500] py-4 text-[13px] font-bold text-[#191600]"
            >
              <span className="text-2xl">💬</span>
              카카오톡
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex flex-col items-center gap-2 rounded-xl bg-toss-bg-mid py-4 text-[13px] font-bold text-toss-text ${KAKAO_KEY ? "" : "col-span-2"}`}
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
