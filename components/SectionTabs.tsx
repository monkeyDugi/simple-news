"use client";

import { useEffect, useRef } from "react";

import { SECTIONS, type SectionCode } from "@/lib/sections";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "simple-news:last-section";

export function readLastSection(): SectionCode | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  if (SECTIONS.some((s) => s.code === raw)) return raw as SectionCode;
  return null;
}

export function writeLastSection(code: SectionCode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, code);
}

interface Props {
  active: SectionCode;
  onChange: (code: SectionCode) => void;
}

export function SectionTabs({ active, onChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // 활성 탭이 화면 밖일 때만 가운데로 스크롤. 매번 호출되더라도 시각적 점프 없음.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [active]);

  return (
    <nav
      ref={scrollRef}
      className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-toss-border bg-white/95 px-3 py-2 backdrop-blur scrollbar-hidden"
      aria-label="섹션"
    >
      {SECTIONS.map((s) => {
        const isActive = s.code === active;
        return (
          <button
            key={s.code}
            ref={isActive ? activeRef : undefined}
            type="button"
            onClick={() => onChange(s.code)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-toss-text text-white"
                : "bg-transparent text-toss-text-weak hover:text-toss-text",
            )}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
