import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AndroidBackHandler } from "@/components/AndroidBackHandler";

export const metadata: Metadata = {
  title: "Simple News",
  description: "출퇴근 5분, 세상 흐름 한눈에",
  applicationName: "Simple News",
};

// 모바일 웹뷰(Capacitor) 우선이라 viewport 를 명시적으로 잡아둔다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <AndroidBackHandler />
        {children}
      </body>
    </html>
  );
}
