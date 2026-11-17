"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ChatDemo from "@/components/marketing/ChatDemo";
import Magnetic from "@/components/marketing/Magnetic";
import { useAnchorScroll } from "@/hooks/useAnchorScroll";
import { useSessionHint } from "@/hooks/useSessionHint";
import { EASE } from "@/lib/motion";

const LINES = ["Conversations,", "relayed", "privately."];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const signedIn = useSessionHint();
  const go = useAnchorScroll(-90);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const demoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const demoRotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -2.5]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section
      ref={ref}
      className="relative mx-3 mt-3 overflow-hidden rounded-[2rem] bg-[#1D4533] text-[#F7EAE0] sm:rounded-[2.75rem]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-[#2A5C46] blur-3xl" />
        <div className="animate-drift absolute -right-20 -top-10 h-[28rem] w-[28rem] rounded-full bg-[#B5654A]/25 blur-3xl [animation-delay:-6s]" />
        <div className="animate-drift absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#F9D2BA]/15 blur-3xl [animation-delay:-3s]" />
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-28">
        <motion.div style={{ y: copyY }}>
          <h1 className="font-display text-[clamp(2.7rem,7.4vw,6.2rem)] font-semibold leading-[0.95] tracking-tight text-balance">
            {LINES.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "112%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.95, ease: EASE, delay: 0.15 + index * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p {...rise(0.65)} className="mt-6 max-w-lg text-base font-medium leading-relaxed text-[#F7EAE0]/80 sm:text-lg">
            Relay is a real-time chat app with groups, stories that last a day, and a history that
            follows you to every device. Messages are encrypted on your device before they leave it.
          </motion.p>

          <motion.div {...rise(0.8)} className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link
                href={signedIn ? "/app" : "/register"}
                className="inline-flex rounded-full bg-[#F9D2BA] px-7 py-4 text-sm font-bold text-[#1D4533] transition-colors hover:bg-[#F7EAE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D2BA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D4533]"
              >
                {signedIn ? "Open Relay" : "Create your account"}
              </Link>
            </Magnetic>
            <Link
              href="/#how"
              onClick={(event) => go(event, "how")}
              className="rounded-full border border-[#F7EAE0]/30 px-7 py-4 text-sm font-bold text-[#F7EAE0] transition-colors hover:bg-[#F7EAE0]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D2BA]"
            >
              See how it works
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: demoY, rotate: demoRotate }}
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
          className="origin-bottom-right"
        >
          <ChatDemo />
        </motion.div>
      </div>
    </section>
  );
}