"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ArticleListItem } from "@/types/api";
import type { SectionCode } from "@/lib/sections";
import { fetchArticleList } from "@/lib/api/client";
import { getTimeGroup } from "@/lib/utils/format";

import { ArticleCard } from "./ArticleCard";
import { TimeGroupHeader } from "./TimeGroupHeader";

// 가로 swipe 는 page.tsx 의 embla carousel 이 담당.
// 세로 scroll 은 이 컴포넌트의 outer div 가 직접 가짐 — 섹션별로 위치 독립 유지.
const NEXT_THRESHOLD_PX = 200;

interface Props {
  section: SectionCode;
  // page.tsx 의 carousel 에서 활성 슬라이드 ± 1 만 true 로 넘김 → prefetch 효과.
  active?: boolean;
}

export function ArticleList({ section, active = true }: Props) {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollRestoredRef = useRef(false);
  const fetchedOnceRef = useRef(false);

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

  // active(자신 또는 인접 슬라이드) 가 되면 한 번만 fetch.
  // 한 번 fetch 한 슬라이드는 이후 active=false 로 돌아가도 데이터 유지 → 다시 swipe 해 와도 즉시 표시.
  useEffect(() => {
    if (!active || fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    void loadFirst();
  }, [active, loadFirst]);

  // 첫 데이터 도착 시 sessionStorage 의 이전 scroll 위치 1회 복원 (자기 컨테이너 기준).
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

  // 무한 스크롤 — 자기 outer div scroll listener. window scroll 아님.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !active) return;
    function onScroll() {
      if (!el || !hasNext || loading) return;
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (fromBottom < NEXT_THRESHOLD_PX) {
        void loadNext();
      }
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [active, hasNext, loading, loadNext]);

  const grouped = useMemo(() => groupByTime(items), [items]);

  return (
    <div
      ref={scrollerRef}
      data-scroll-container={section}
      // overscroll-contain → 끝에서 부모 main 으로 bounce 전달 안 함.
      // touch-pan-y → 세로 제스처만 자기가 받고 가로는 carousel 로 통과.
      className="h-full overflow-y-auto overscroll-contain touch-pan-y"
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
