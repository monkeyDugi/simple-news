"use client";

import Link from "next/link";

import type { ArticleListItem } from "@/types/api";
import { formatRelativeTime } from "@/lib/utils/format";

// 시안 A — AI 결론(finalConclusion) 1순위 + 원본 제목 보조 + 썸네일 64×64.
interface Props {
  article: ArticleListItem;
}

export function ArticleCard({ article }: Props) {
  function rememberScroll(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window === "undefined") return;
    // ArticleList 가 자기 outer div 에 [data-scroll-container] 를 박아둠.
    // 거기서 scrollTop 을 꺼내 카드 클릭 시점 위치를 sessionStorage 에 저장.
    const scroller = (
      e.currentTarget as HTMLElement
    ).closest<HTMLElement>("[data-scroll-container]");
    const top = scroller?.scrollTop ?? 0;
    sessionStorage.setItem(
      `simple-news:scroll:${article.section}`,
      String(top),
    );
  }

  return (
    <Link
      href={`/article?id=${article.id}`}
      onClick={rememberScroll}
      className="block border-b border-toss-border px-5 py-4 active:bg-toss-bg-soft"
    >
      <div className="flex gap-3">
        <Thumbnail src={article.thumbnailLink} />
        <div className="min-w-0 flex-1">
          <span className="mb-1.5 inline-block rounded-full bg-[#e8f0fe] px-2 py-0.5 text-[11px] font-bold text-toss-blue">
            AI 결론
          </span>
          <p className="mb-1 line-clamp-2 text-[16px] font-bold leading-snug tracking-tight text-toss-text">
            {article.summary.finalConclusion}
          </p>
          <p className="mt-1 line-clamp-1 text-[13px] text-toss-text-sub">
            {article.title}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-toss-text-weak">
            {article.publisher && <span>{article.publisher}</span>}
            {article.publisher && <span className="text-toss-text-disabled">·</span>}
            <span>{formatRelativeTime(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Thumbnail({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-toss-bg-mid text-2xl">
        📰
      </div>
    );
  }
  // next/image 가 unoptimized 라 그냥 img 태그로 충분 (Capacitor static export 대응).
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={64}
      height={64}
      className="h-16 w-16 shrink-0 rounded-xl bg-toss-bg-mid object-cover"
      loading="lazy"
    />
  );
}
