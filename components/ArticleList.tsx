"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ArticleListItem } from "@/types/api";
import type { SectionCode } from "@/lib/sections";
import { fetchArticleList } from "@/lib/api/client";
import { getTimeGroup } from "@/lib/utils/format";

import { ArticleCard } from "./ArticleCard";
import { TimeGroupHeader } from "./TimeGroupHeader";

const NEXT_THRESHOLD_PX = 200;
const PTR_THRESHOLD = 48; // 이만큼 당기면 새로고침
const PTR_MAX = 56;       // 최대 시각적 당김 거리

interface Props {
  section: SectionCode;
  active?: boolean;
}

export function ArticleList({ section, active = true }: Props) {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pullIndicatorRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const fetchedOnceRef = useRef(false);
  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchArticleList({ section });
      setItems(res.data);
      setHasNext(res.cursor.hasNext);
      setCursor(res.cursor.next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했어요");
    } finally {
      setLoading(false);
    }
  }, [section]);

  const loadNext = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetchArticleList({ section, cursor });
      setItems((prev) => [...prev, ...res.data]);
      setHasNext(res.cursor.hasNext);
      setCursor(res.cursor.next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했어요");
    } finally {
      setLoading(false);
    }
  }, [section, cursor, loading]);

  useEffect(() => {
    if (!active || fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    void loadFirst();
  }, [active, loadFirst]);

  useEffect(() => {
    if (scrollRestoredRef.current) return;
    if (items.length === 0) return;
    const key = `simple-news:scroll:${section}`;
    const raw = sessionStorage.getItem(key);
    if (raw && scrollerRef.current) {
      const y = Number.parseInt(raw, 10);
      if (Number.isFinite(y) && y > 0) {
        requestAnimationFrame(() => {
          const el = scrollerRef.current;
          if (el) el.scrollTop = y;
        });
      }
      sessionStorage.removeItem(key);
    }
    scrollRestoredRef.current = true;
  }, [items.length, section]);

  // 무한 스크롤
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !active) return;
    function onScroll() {
      if (!el || !hasNext || loading) return;
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (fromBottom < NEXT_THRESHOLD_PX) void loadNext();
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [active, hasNext, loading, loadNext]);

  // Pull-to-refresh
  useEffect(() => {
    const scroller = scrollerRef.current;
    const indicator = pullIndicatorRef.current;
    if (!scroller || !indicator) return;
    let startY = 0;
    let pullY = 0;
    function onTouchStart(e: TouchEvent) {
      startY = e.touches[0].clientY;
      pullY = 0;
    }
    function onTouchMove(e: TouchEvent) {
      if (scroller!.scrollTop > 2) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0) return;
      e.preventDefault();
      pullY = Math.min(delta * 0.4, PTR_MAX);
      indicator!.style.height = `${pullY}px`;
    }
    function onTouchEnd() {
      const y = pullY;
      pullY = 0;
      indicator!.style.height = "0px";
      if (y >= PTR_THRESHOLD && !loadingRef.current) void loadFirst();
    }
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: false });
    scroller.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
    };
  }, [loadFirst]);

  const grouped = useMemo(() => groupByTime(items), [items]);

  return (
    <div className="flex h-full flex-col">
      {/* PTR 인디케이터 — height 0 에서 시작해 당기면 늘어남 */}
      <div
        ref={pullIndicatorRef}
        className="flex flex-shrink-0 items-center justify-center overflow-hidden bg-white"
        style={{ height: 0 }}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-toss-blue border-t-transparent" />
      </div>

      <div
        ref={scrollerRef}
        data-scroll-container={section}
        className="flex-1 overflow-y-auto overscroll-contain touch-pan-y"
      >
        {error && (
          <div className="px-5 py-12 text-center text-sm text-destructive">
            {error}
            <button
              type="button"
              onClick={() => void loadFirst()}
              className="mt-3 block w-full text-toss-blue underline-offset-2 hover:underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {!error && !loading && items.length === 0 && (
          <div className="px-5 py-16 text-center text-sm text-toss-text-weak">
            아직 기사가 없어요.
            <br />
            잠시 후 다시 확인해 주세요.
          </div>
        )}

        {grouped.map((g) => (
          <section key={g.label}>
            <TimeGroupHeader label={g.label} />
            {g.items.map((it) => (
              <ArticleCard key={it.id} article={it} />
            ))}
          </section>
        ))}

        {loading && items.length > 0 && (
          <div className="py-6 text-center text-xs text-toss-text-weak">
            불러오는 중…
          </div>
        )}
      </div>
    </div>
  );
}

interface Group {
  label: string;
  items: ArticleListItem[];
}

function groupByTime(items: ArticleListItem[]): Group[] {
  const out: Group[] = [];
  for (const it of items) {
    const label = getTimeGroup(it.publishedAt);
    const last = out[out.length - 1];
    if (!last || last.label !== label) {
      out.push({ label, items: [it] });
    } else {
      last.items.push(it);
    }
  }
  return out;
}
