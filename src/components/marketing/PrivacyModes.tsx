"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";

type Mode = "standard" | "private";

const MODES: Record<Mode, { label: string; summary: string; rows: { q: string; a: string }[] }> = {
  standard: {
    label: "Standard",
    summary: "The default. Nothing to remember, and your history is on every device you sign in on.",
    rows: [
      { q: "On a new device", a: "Sign in and your full history appears. Nothing to type." },
      { q: "Who can bring your history back", a: "You can. So can Relay's server if it has to, because it keeps a sealed copy of your account key." },
      { q: "If you lose a device", a: "Log it out from Devices. It stops getting new messages straight away." },
    ],
  },
  private: {
    label: "Private (passphrase)",
    summary: "You pick a passphrase in Settings. Relay's server forgets the key that could restore your history.",
    rows: [
      { q: "On a new device", a: "New messages work right away. Older ones open when you enter your passphrase, or you can skip." },
      { q: "Who can bring your history back", a: "Only you. Relay can't." },
      { q: "If you forget the passphrase", a: "Reset it. Devices that are already unlocked keep working, but new devices won't get your older messages." },
    ],
  },
};

export default function PrivacyModes() {
  const [mode, setMode] = useState<Mode>("standard");
  const current = MODES[mode];

  return (
    <section id="privacy-modes" className="mx-3 scroll-mt-24 rounded-[2rem] bg-[#1D4533]/[0.05] px-4 py-16 sm:mx-6 sm:rounded-[2.75rem] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="max-w-xl font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight text-[#1D4533] text-balance">
          You choose how private is private.
        </h2>
        <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[#5E3122]/80 sm:text-lg">
          Both modes encrypt your messages on your device. The difference is who can bring your
          history back.
        </p>

        <div role="tablist" aria-label="Privacy mode" className="mt-8 inline-flex rounded-full bg-[#1D4533]/10 p-1">
          {(Object.keys(MODES) as Mode[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className="relative rounded-full px-5 py-2.5 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533] sm:text-sm"
            >
              {mode === key && (
                <motion.span layoutId="mode-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute inset-0 rounded-full bg-[#1D4533]" />
              )}
              <span className={`relative transition-colors ${mode === key ? "text-[#F7EAE0]" : "text-[#1D4533]/70"}`}>{MODES[key].label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="mt-8"
          >
            <p className="max-w-xl text-sm font-semibold leading-relaxed text-[#1D4533] sm:text-base">{current.summary}</p>
            <dl className="mt-6 divide-y divide-[#1D4533]/12 border-y border-[#1D4533]/12">
              {current.rows.map((row) => (
                <div key={row.q} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
                  <dt className="text-sm font-extrabold text-[#1D4533]">{row.q}</dt>
                  <dd className="text-sm font-medium leading-relaxed text-[#5E3122]/85">{row.a}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}