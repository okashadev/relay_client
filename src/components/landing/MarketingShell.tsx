"use client";

import { useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import SiteFooter from "@/components/landing/SiteFooter";
import SiteNav from "@/components/landing/SiteNav";

export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.add("marketing");
    return () => document.documentElement.classList.remove("marketing");
  }, []);

  const page = (
    <>
      <SiteNav />
      <main id="top">{children}</main>
      <SiteFooter />
    </>
  );

  if (reduce) return page;

  return (
    <ReactLenis
      root
      options={{ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 }}
    >
      {page}
    </ReactLenis>
  );
}
