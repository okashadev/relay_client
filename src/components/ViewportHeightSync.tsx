"use client";

import { useEffect } from "react";

export default function ViewportHeightSync() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;

    const update = () => {
      if (viewport && viewport.scale > 1) return;

      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--app-height", `${Math.round(height)}px`);

      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    update();
    viewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      root.style.removeProperty("--app-height");
    };
  }, []);

  return null;
}