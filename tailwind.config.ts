import type { Config } from "tailwindcss";

// 1단계 미니멀 설정. 토스 컬러 토큰/폰트 토큰 등은 2단계에서 본격 추가한다.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
