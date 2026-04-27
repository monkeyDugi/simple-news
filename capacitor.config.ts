import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor 설정.
// - webDir: Next.js Static Export 결과물(out/) 을 webview 의 정적 자원으로 사용.
// - server.androidScheme: 안드로이드 webview 가 https:// 스킴으로 origin 을 갖도록.
//   (기본 file:// 이면 fetch 의 same-origin 이 깨지고 일부 API 가 오작동)
// - 실제 데이터 호출은 NEXT_PUBLIC_API_BASE_URL 의 절대 URL 로 Vercel 서버에 직접.
const config: CapacitorConfig = {
  appId: "com.simplenews.app",
  appName: "Simple News",
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
