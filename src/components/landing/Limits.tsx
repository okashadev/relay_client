"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/lib/motion";

const LIMITS = [
  { value: 100, label: "people in a group" },
  { value: 24, label: "hours a story lasts" },
  { value: 15, label: "minutes to fix a typo" },
  { value: 48, label: "hours to delete for everyone" },
  { value: 10, label: "devices signed in at once" },
  { value: 6, label: "quick reactions" },
];

function Stat({ value, label, active }: { value: number; label: string; active: boolean }) {
  const reduce = useReducedMotion();
  const counted = useCountUp(value, active && !reduce);

  return (
    <div className="px-1 py-8 sm:px-6">
      <p className="font-display text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-none tracking-tighter tabular-nums text-[#F9D2BA]">
        {reduce ? value : counted}
      </p>
      <p className="mt-2 text-sm font-semibold text-[#F7EAE0]/80">{label}</p>
    </div>
  );
}

export default function Limits() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="mx-3 mt-24 rounded-[2rem] bg-[#5E3122] px-4 py-16 text-[#F7EAE0] sm:mx-6 sm:rounded-[2.75rem] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-xl font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight text-balance">
          The numbers we&apos;re willing to put in writing.
        </h2>
        <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[#F7EAE0]/75">
          No made-up user counts. These are the limits Relay actually runs with today.
        </p>

        <div ref={ref} className="mt-10 grid grid-cols-2 divide-[#F7EAE0]/15 border-t border-[#F7EAE0]/15 md:grid-cols-3 md:divide-x">
          {LIMITS.map((item) => (
            <div key={item.label} className="border-b border-[#F7EAE0]/15 md:[&:nth-child(3n+1)]:border-l-0">
              <Stat {...item} active={inView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}