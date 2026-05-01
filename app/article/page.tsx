"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ArticleSummary } from "@/components/ArticleSummary";
import { ConclusionBlock } from "@/components/ConclusionBlock";
import { EasyExplanationDialog } from "@/components/EasyExplanationDialog";
import { KeyTermsList } from "@/components/KeyTermsList";
import { OriginalBottomSheet } from "@/components/OriginalBottomSheet";
import { ShareMenu } from "@/components/ShareMenu";
import { fetchArticleDetail } from "@/lib/api/client";
import { getSection } from "@/lib/sections";
import { formatRelativeTime } from "@/lib/utils/format";
import type { ArticleDetail } from "@/types/api";

// 정적 export 호환을 위해 path 기반 [articleId] 대신 query string 사용.
// 주소 형태: /article?id=123
export default function ArticleDetailRoute() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ArticleDetailContent />
    </Suspense>
  );
}

function ArticleDetailContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEasy, setShowEasy] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      setError("기사 ID가 없어요");
      return;
    }
    let alive = true;
    setLoading(true);
    fetchArticleDetail(articleId)
      .then((data) => {
        if (alive) setArticle(data);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "불러오지 못했어요");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [articleId]);

  if (loading) return <LoadingScreen />;

  if (error || !article) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
        <Header />
        <div className="px-5 py-12 text-center text-sm text-destructive">
          {error ?? "기사를 찾을 수 없어요."}
          <Link
            href="/"
            className="mt-3 block text-toss-blue underline-offset-2 hover:underline"
          >
            목록으로
          </Link>
        </div>
      </main>
    );
  }

  const sectionLabel = safeSectionLabel(article.section);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[480px] bg-white pb-16">
      <Header onShare={() => setShowShare(true)} />

      <div className="px-5 pb-4 pt-2">
        <div className="mb-2 text-[12px] font-bold tracking-wider text-toss-blue">
          {sectionLabel}
        </div>
        <h1 className="text-[24px] font-extrabold leading-snug tracking-tight text-toss-text">
          {article.summary.titleTheme || article.title}
        </h1>
        <div className="mt-2 text-[12px] text-toss-text-weak">
          {article.publisher && <span>{article.publisher}</span>}
          {article.publisher && (
            <span className="px-1.5 text-toss-text-disabled">·</span>
          )}
          <span>{formatRelativeTime(article.publishedAt)}</span>
        </div>
      </div>

      <ConclusionBlock conclusion={article.summary.finalConclusion} />
      <ArticleSummary summary={article.summary.summary} />

      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={() => setShowEasy(true)}
          className="flex w-full items-center justify-between rounded-xl bg-toss-bg-mid px-4 py-3.5 text-left active:bg-toss-bg-soft"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-[14px] font-bold text-toss-text">
              쉬운 설명 보기
            </span>
          </span>
          <span className="text-toss-text-weak">›</span>
        </button>
      </div>

      <KeyTermsList terms={article.summary.keyTerms} />

      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={() => setShowOriginal(true)}
          className="flex w-full items-center justify-between rounded-xl border border-toss-border px-4 py-3.5 text-left active:bg-toss-bg-soft"
        >
          <span className="text-[14px] font-medium text-toss-text-sub">
            원문 보기
          </span>
          <span className="text-toss-text-weak">↗</span>
        </button>
      </div>

      <EasyExplanationDialog
        open={showEasy}
        onClose={() => setShowEasy(false)}
        explanation={article.summary.easyExplanation}
      />
      <OriginalBottomSheet
        open={showOriginal}
        onClose={() => setShowOriginal(false)}
        title={article.title}
        contentHtml={article.content}
        link={article.link}
        publisher={article.publisher}
      />
      <ShareMenu
        open={showShare}
        onClose={() => setShowShare(false)}
        title={article.summary.titleTheme || article.title}
        url={shareUrl(article.id)}
      />
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[480px] bg-white">
      <Header />
      <div className="px-5 py-12 text-center text-sm text-toss-text-weak">
        불러오는 중…
      </div>
    </main>
  );
}

function Header({ onShare }: { onShare?: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-toss-border bg-white/95 px-3 py-3 backdrop-blur">
      <Link
        href="/"
        aria-label="뒤로"
        className="flex h-10 w-10 items-center justify-center text-[22px] text-toss-text"
      >
        ←
      </Link>
      {onShare && (
        <button
          type="button"
          onClick={onShare}
          aria-label="공유"
          className="flex h-10 w-10 items-center justify-center text-[20px] text-toss-text"
        >
          ↗
        </button>
      )}
    </header>
  );
}

function safeSectionLabel(code: ArticleDetail["section"]): string {
  try {
    return getSection(code).label;
  } catch {
    return "";
  }
}

function shareUrl(id: number): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/article?id=${id}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}/article?id=${id}`;
}
