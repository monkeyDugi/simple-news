import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// 토스 뱅킹 톤 디자인 토큰 + shadcn HSL 변수 매핑.
// 컴포넌트 코드에서는 가능하면 의미 토큰(primary, foreground 등)을 쓰고,
// 디자인 시안과 1:1 매칭이 필요한 경우에만 toss.* 토큰을 직접 사용한다.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 토스 디자인 토큰 (PRD 시안에서 추출)
        toss: {
          blue: "#3182f6",
          "blue-pressed": "#1b64da",
          text: {
            DEFAULT: "#191f28",
            sub: "#4e5968",
            weak: "#6b7684",
            disabled: "#b0b8c1",
          },
          bg: {
            DEFAULT: "#ffffff",
            soft: "#f9fafb",
            mid: "#f2f4f6",
          },
          border: "#e5e8eb",
          divider: "#f2f4f6",
        },

        // shadcn semantic 토큰 — globals.css 의 CSS variable 와 1:1 매핑
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
