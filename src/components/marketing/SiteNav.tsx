"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import RelayLogo from "@/components/common/RelayLogo";
import { useAnchorScroll } from "@/hooks/useAnchorScroll";
import { useSessionHint } from "@/hooks/useSessionHint";
import { EASE } from "@/lib/motion";

const LINKS = [
  { label: "Features", id: "features" },
  { label: "How it works", id: "how" },
  { label: "Privacy modes", id: "privacy-modes" },
  { label: "FAQ", id: "faq" },
];

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7EAE0]";

export default function SiteNav() {
  const pathname = usePathname();
  const signedIn = useSessionHint();
  const go = useAnchorScroll(-90);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // Neeche scroll par chhup, upar scroll par wapas
  useMotionValueEvent(scrollY, "change", (y) => {
    setHidden(y > (scrollY.getPrevious() ?? 0) && y > 240);
  });

  const onHome = pathname === "/";

  const anchor = (id: string) => (event: React.MouseEvent) => {
    setOpen(false);
    if (onHome) go(event, id);
  };

  return (
    <motion.header
      animate={{ y: hidden && !open ? -120 : 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed inset-x-0 top-3 z-50 px-3"
    >
      <nav
        aria-label="Main"
        className="relative mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-full border border-[#1D4533]/10 bg-[#F7EAE0]/80 py-2 pl-3 pr-2 backdrop-blur-xl"
      >
        <Link href="/" className={`flex items-center gap-2.5 rounded-full ${FOCUS}`} aria-label="Relay home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D4533] shadow-md">
            <RelayLogo size={40} variant="shadow" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-[#1D4533]">Relay</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <Link
                href={`/#${link.id}`}
                onClick={anchor(link.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold text-[#1D4533]/80 transition-colors hover:bg-[#1D4533]/8 hover:text-[#1D4533] ${FOCUS}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          {!signedIn && (
            <Link
              href="/login"
              className={`hidden rounded-full px-3.5 py-2 text-xs font-bold text-[#1D4533] transition-colors hover:bg-[#1D4533]/8 sm:block ${FOCUS}`}
            >
              Sign in
            </Link>
          )}
          <Link
            href={signedIn ? "/app" : "/register"}
            className={`rounded-full bg-[#1D4533] px-4 py-2.5 text-xs font-bold text-[#F7EAE0] transition-all hover:bg-[#153426] active:scale-95 ${FOCUS}`}
          >
            {signedIn ? "Open Relay" : "Get started"}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-[#1D4533] hover:bg-[#1D4533]/8 md:hidden ${FOCUS}`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute inset-x-0 top-full mt-2 rounded-3xl border border-[#1D4533]/10 bg-[#F7EAE0]/95 p-2 backdrop-blur-xl md:hidden"
            >
              {LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={`/#${link.id}`}
                  onClick={anchor(link.id)}
                  className="block rounded-2xl px-4 py-3 text-sm font-bold text-[#1D4533] hover:bg-[#1D4533]/8"
                >
                  {link.label}
                </Link>
              ))}
              {!signedIn && (
                <Link href="/login" className="block rounded-2xl px-4 py-3 text-sm font-bold text-[#1D4533] hover:bg-[#1D4533]/8">
                  Sign in
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}