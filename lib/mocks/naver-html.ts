import { findMockBundle, getMockBundles } from "./articles";
import { SECTIONS, type SectionCode } from "@/lib/sections";

// 네이버 페이지 구조를 흉내낸 fixture HTML.
// MOCK_SCRAPER=true 일 때 fetchHtml 이 이걸 반환해서 cheerio 셀렉터 검증을 가능하게 한다.
// 실제 응답을 100% 똑같이 만들 필요는 없고, 셀렉터가 매칭되는 최소 구조면 충분.

const FAKE_PUBLISHER_ID = "00001";

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]!,
  );
}

function findSectionByNaverId(naverId: string): SectionCode | null {
  const def = SECTIONS.find((s) => s.naverSectionId === naverId);
  return def?.code ?? null;
}

function padId(id: number): string {
  return String(id).padStart(10, "0");
}

// ─── NaverGeneral ──────────────────────────────────────────
export function naverGeneralListHtml(naverSectionId: string): string {
  const section = findSectionByNaverId(naverSectionId);
  if (!section) return "<html></html>";
  const bundles = getMockBundles().filter(
    (b) => b.article.section === section,
  );
  const items = bundles
    .map(
      (b) => `
    <div class="sa_item">
      <a class="sa_text_title" href="https://n.news.naver.com/article/${FAKE_PUBLISHER_ID}/${padId(b.article.id)}">
        <strong>${escapeHtml(b.article.title)}</strong>
      </a>
      <div class="sa_text_press">${escapeHtml(b.article.publisher ?? "")}</div>
      <div class="sa_thumb_inner">
        ${b.article.thumbnailLink ? `<img src="${escapeHtml(b.article.thumbnailLink)}">` : ""}
      </div>
    </div>
  `,
    )
    .join("");
  return `<!DOCTYPE html><html><body><div class="sa_list">${items}</div></body></html>`;
}

export function naverGeneralDetailHtml(articleIdPadded: string): string {
  const id = parseInt(articleIdPadded, 10);
  const bundle = findMockBundle(id);
  if (!bundle) return "<!DOCTYPE html><html><body></body></html>";
  return `<!DOCTYPE html><html><body>
    <div class="media_end_head_top_logo"><img alt="${escapeHtml(bundle.article.publisher ?? "")}"/></div>
    <em class="media_end_head_journalist_name">${escapeHtml(bundle.article.author ?? "익명")}</em>
    <span class="media_end_head_info_datestamp_time" datetime="${bundle.article.publishedAt.toISOString()}"></span>
    <article id="dic_area">${bundle.content}</article>
  </body></html>`;
}

// ─── NaverFinance (해외증시) ───────────────────────────────
export function naverFinanceListHtml(): string {
  const bundles = getMockBundles().filter(
    (b) => b.article.section === "GLOBAL_MARKET",
  );
  const items = bundles
    .map(
      (b) => `
    <li>
      <dl>
        <dt class="articleSubject">
          <a href="https://finance.naver.com/news/news_read.naver?mode=LSS3D&article_id=${padId(b.article.id)}&office_id=${FAKE_PUBLISHER_ID}">${escapeHtml(b.article.title)}</a>
        </dt>
        <dd>
          <span class="press">${escapeHtml(b.article.publisher ?? "")}</span>
          <span class="wdate">${naverFinanceDate(b.article.publishedAt)}</span>
        </dd>
      </dl>
    </li>
  `,
    )
    .join("");
  return `<!DOCTYPE html><html><body><ul class="newsList">${items}</ul></body></html>`;
}

export function naverFinanceDetailHtml(articleIdPadded: string): string {
  const id = parseInt(articleIdPadded, 10);
  const bundle = findMockBundle(id);
  if (!bundle) return "<!DOCTYPE html><html><body></body></html>";
  return `<!DOCTYPE html><html><body>
    <div class="article_info">
      <span class="press">${escapeHtml(bundle.article.publisher ?? "")}</span>
      <span class="wdate">${naverFinanceDate(bundle.article.publishedAt)}</span>
    </div>
    <div id="news_read">${bundle.content}</div>
  </body></html>`;
}

function naverFinanceDate(d: Date): string {
  // KST 표시
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const Y = kst.getUTCFullYear();
  const M = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const D = String(kst.getUTCDate()).padStart(2, "0");
  const ampm = kst.getUTCHours() < 12 ? "오전" : "오후";
  const h = kst.getUTCHours() % 12 || 12;
  const m = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${Y}.${M}.${D}. ${ampm} ${h}:${m}`;
}
