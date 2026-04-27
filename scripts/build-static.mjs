#!/usr/bin/env node
// Capacitor 용 정적 export 빌드.
// app/api 는 dynamic route handler 라 output:"export" 와 호환 안 됨.
// 빌드 동안만 임시로 옆으로 옮겼다가, 끝나면(성공이든 실패든) 원복한다.

import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const apiDir = resolve(root, "app", "api");
const stashDir = resolve(root, "app", "_api.stashed");
const nextCache = resolve(root, ".next");

let stashed = false;
try {
  // 이전 빌드 캐시가 server route 관련 정보를 남겨 export 단계 충돌을 일으키므로 삭제.
  if (existsSync(nextCache)) {
    rmSync(nextCache, { recursive: true, force: true });
  }
  if (existsSync(apiDir)) {
    renameSync(apiDir, stashDir);
    stashed = true;
  }
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "static" },
  });
} finally {
  if (stashed && existsSync(stashDir)) {
    renameSync(stashDir, apiDir);
  }
}
