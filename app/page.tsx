"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { ArticleList } from "@/components/ArticleList";
import {
  SectionTabs,
  readLastSection,
  writeLastSection,
} from "@/components/SectionTabs";
import {
  DEFAULT_SECTION,
  SECTION_CODES,
  type SectionCode,
} from "@/lib/sections";

// 홈 = 7섹션 carousel + 상단 탭. 디폴트 ECONOMY, 마지막 선택은 localStorage.
//
// 레이아웃: h-dvh + flex column.
//   header / SectionTabs 는 위에 고정, carousel 영역만 flex-1 로 남은 공간 차지.
//   각 슬라이드(ArticleList) 가 자기 vertical scroll 을 가져 섹션별 위치 독립.
//   page-level scroll 은 발생하지 않음.
//
// 깜빡임 방지: 첫 paint 는 헤더만 → hydrated 후 HomeBody 마운트 시 localStorage 읽어
// carousel startIndex 를 박아 마지막 섹션에서 시작.
export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-white">
      <header className="px-5 pb-2 pt-5">
        <h1 className="text-[20px] font-extrabold tracking-tight text-toss-text">
          Simple News
        </h1>
        <p className="mt-0.5 text-[12px] text-toss-text-weak">
          출퇴근 5분, 세상 흐름 한눈에
        </p>
      </header>
      {hydrated && <HomeBody />}
    </main>
  );
}

function HomeBody() {
  const initialIdx = Math.max(
    0,
    SECTION_CODES.indexOf(readLastSection() ?? DEFAULT_SECTION),
  );
  const [section, setSection] = useState<SectionCode>(
    SECTION_CODES[initialIdx] ?? DEFAULT_SECTION,
  );
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    startIndex: initialIdx,
    containScroll: "trimSnaps",
    skipSnaps: false,
    dragFree: false,
    duration: 25,
  });

  useEffect(() => {
    if (!emblaApi) return;
    function onSelect() {
      if (!emblaApi) return;
      const idx = emblaApi.selectedScrollSnap();
      const code = SECTION_CODES[idx];
      if (!code) return;
      setSection(code);
      setCurrentIdx(idx);
      writeLastSection(code);
    }
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const handleTabClick = useCallback(
    (code: SectionCode) => {
      const idx = SECTION_CODES.indexOf(code);
      if (idx < 0) return;
      emblaApi?.scrollTo(idx);
    },
    [emblaApi],
  );

  return (
    <>
      <SectionTabs active={section} onChange={handleTabClick} />
      <div ref={emblaRef} className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {SECTION_CODES.map((code, idx) => (
            <div
              key={code}
              className="h-full min-w-0 flex-[0_0_100%]"
            >
              <ArticleList
                section={code}
                // 활성 ± 1 슬라이드 prefetch. swipe 시 옆 슬라이드도 콘텐츠 차 있음.
                active={Math.abs(idx - currentIdx) <= 1}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
