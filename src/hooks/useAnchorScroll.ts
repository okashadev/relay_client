"use client";

import { useCallback } from "react";
import { useLenis } from "lenis/react";

export function useAnchorScroll(offset = -90) {
  const lenis = useLenis();

  return useCallback(
    (event: React.MouseEvent, id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      history.replaceState(null, "", `#${id}`);

      if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
      else target.scrollIntoView({ behavior: "auto", block: "start" });
    },
    [lenis, offset],
  );
}