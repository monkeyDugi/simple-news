#!/usr/bin/env node
// Play Store 제출용 그래픽 에셋 생성
// 출력: store-assets/ 폴더
// 실행: node scripts/gen-store-assets.mjs

import puppeteer from "puppeteer";
import { mkdir } from "node:fs/promises";

const OUT = "store-assets";
await mkdir(OUT, { recursive: true });

const BLUE = "#3182f6";
const DARK = "#191F28";

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();

// ── 1. 앱 아이콘 512×512 ────────────────────────────────────────────────────
await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
await page.setContent(`<!DOCTYPE html>
<html><body style="margin:0;padding:0;width:512px;height:512px;
  background:${BLUE};display:flex;align-items:center;justify-content:center;
  font-family:-apple-system,sans-serif;">
  <div style="text-align:center;">
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="180" height="160" rx="12" fill="white" opacity="0.95"/>
      <rect x="40" y="58" width="140" height="12" rx="6" fill="${BLUE}"/>
      <rect x="40" y="82" width="100" height="8" rx="4" fill="${DARK}" opacity="0.3"/>
      <rect x="40" y="100" width="120" height="8" rx="4" fill="${DARK}" opacity="0.2"/>
      <rect x="40" y="126" width="140" height="10" rx="5" fill="${BLUE}" opacity="0.7"/>
      <rect x="40" y="148" width="100" height="8" rx="4" fill="${DARK}" opacity="0.2"/>
      <rect x="40" y="164" width="80" height="8" rx="4" fill="${DARK}" opacity="0.15"/>
    </svg>
    <div style="color:white;font-size:32px;font-weight:800;letter-spacing:-1px;margin-top:8px;">
      Simple News
    </div>
  </div>
</body></html>`);
await page.screenshot({ path: `${OUT}/icon-512.png` });
console.log("✓ icon-512.png");

// ── 2. 그래픽 이미지 1024×500 ──────────────────────────────────────────────
await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
await page.setContent(`<!DOCTYPE html>
<html><body style="margin:0;padding:0;width:1024px;height:500px;
  background:linear-gradient(135deg,${BLUE} 0%,#1a6fd4 100%);
  display:flex;align-items:center;justify-content:center;
  font-family:-apple-system,sans-serif;">
  <div style="text-align:center;color:white;">
    <div style="font-size:72px;font-weight:900;letter-spacing:-2px;line-height:1;">
      Simple News
    </div>
    <div style="font-size:28px;font-weight:400;margin-top:16px;opacity:0.85;">
      출퇴근 5분, 세상 흐름 한눈에
    </div>
    <div style="margin-top:28px;display:flex;gap:16px;justify-content:center;font-size:18px;opacity:0.75;">
      <span>📰 정치</span><span>💰 경제</span><span>🌍 세계</span>
      <span>💻 IT</span><span>📊 해외증시</span>
    </div>
  </div>
</body></html>`);
await page.screenshot({ path: `${OUT}/feature-graphic-1024x500.png` });
console.log("✓ feature-graphic-1024x500.png");

// ── 3. 전화 스크린샷 1080×1920 ─────────────────────────────────────────────
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await page.goto("https://news.flowpick.org", { waitUntil: "networkidle2", timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: `${OUT}/screenshot-phone-home.png` });
console.log("✓ screenshot-phone-home.png");

// 상세 페이지 스크린샷 (기사 카드 클릭)
try {
  await page.click("a[href*='/article']");
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${OUT}/screenshot-phone-detail.png` });
  console.log("✓ screenshot-phone-detail.png");
} catch {
  console.log("⚠ 상세 페이지 스크린샷 건너뜀 (카드 없음)");
}

// ── 4. 7인치 태블릿 스크린샷 1200×1920 ────────────────────────────────────
await page.setViewport({ width: 1200, height: 1920, deviceScaleFactor: 1 });
await page.goto("https://news.flowpick.org", { waitUntil: "networkidle2", timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: `${OUT}/screenshot-tablet7.png` });
console.log("✓ screenshot-tablet7.png");

// ── 5. 10인치 태블릿 스크린샷 1600×2560 ───────────────────────────────────
await page.setViewport({ width: 1600, height: 2560, deviceScaleFactor: 1 });
await page.goto("https://news.flowpick.org", { waitUntil: "networkidle2", timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: `${OUT}/screenshot-tablet10.png` });
console.log("✓ screenshot-tablet10.png");

await browser.close();
console.log(`\n완료! store-assets/ 폴더를 확인하세요.`);
