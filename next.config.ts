import type { NextConfig } from "next";

// Capacitor 빌드(=정적 export)와 Vercel 빌드(=API 라우트 포함 server)를 한 코드베이스로 다룬다.
// BUILD_TARGET=static 인 경우에만 output: "export" 를 켜서 out/ 정적 결과물을 만들고,
// 그 외(Vercel 기본 빌드)에서는 일반 server 빌드를 한다.
const isStaticBuild = process.env.BUILD_TARGET === "static";

const nextConfig: NextConfig = {
  output: isStaticBuild ? "export" : undefined,
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
  // Capacitor 앱(origin: https://localhost)이 Vercel API를 호출할 수 있도록 허용
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
