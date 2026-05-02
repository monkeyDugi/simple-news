"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

// 안드로이드 하드웨어/제스처 뒤로가기 버튼을 브라우저 history.back()으로 연결.
// 웹 브라우저 환경에선 아무 동작도 하지 않음.
export function AndroidBackHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const promise = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });
    return () => {
      void promise.then((h) => h.remove());
    };
  }, []);

  return null;
}
