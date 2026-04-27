import type { NextConfig } from "next";

// Capacitor 빌드(=정적 export)와 Vercel 빌드(=API 라우트 포함 server)를 한 코드베이스로 다룬다.
// BUILD_TARGET=static 인 경우에만 output: "export" 를 켜서 out/ 정적 결과물을 만들고,
// 그 외(Vercel 기본 빌드)에서는 일반 server 빌드를 한다.
const isStaticBuild = process.env.BUILD_TARGET === "static";

const nextConfig: NextConfig = {
  output: isStaticBuild ? "export" : undefined,
  images: { unoptimized: true },
  // trailingSlash 는 API 라우트에서 308 redirect 를 유발하므로 false.
  // Capacitor 빌드는 SPA 라우팅(client-side)을 쓰므로 굳이 필요 없다.
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
