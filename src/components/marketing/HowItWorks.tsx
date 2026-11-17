"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, Database, KeyRound, Laptop, Lock, Smartphone } from "lucide-react";

const MONO = "rounded-xl bg-black/20 px-3 py-2 font-mono text-[11px] sm:text-xs";

const STEPS = [
  {
    title: "You write",
    body: "Your phone or browser locks the message with the chat's key before anything is sent. Not even the text leaves your device in the clear.",
    bg: "#1D4533",
    fg: "#F7EAE0",
    visual: (
      <div className="space-y-3">
        <p className="w-fit rounded-2xl rounded-bl-sm bg-[#F7EAE0] px-4 py-2.5 text-sm font-semibold text-[#1D4533]">See you at six.</p>
        <ArrowDown className="ml-4 h-4 w-4 opacity-60" />
        <p className={MONO}><Lock className="mr-2 inline h-3 w-3" />q9Zk4f…8HsT2=</p>
      </div>
    ),
  },
  {
    title: "Relay stores the lock, not the words",
    body: "Our server keeps the scrambled message, who it's for and when it was sent. It can't read what's inside.",
    bg: "#F9D2BA",
    fg: "#5E3122",
    visual: (
      <div className="space-y-2 font-mono text-[11px] sm:text-xs">
        {["to Sara · 10:42", "to Sara · 10:43", "to Group · 10:51"].map((row) => (
          <p key={row} className="flex items-center gap-2 rounded-xl bg-[#5E3122]/10 px-3 py-2">
            <Database className="h-3 w-3 shrink-0" />
            <span className="shrink-0">{row}</span>
            <span className="truncate opacity-60">9fK2xQ…</span>
          </p>
        ))}
      </div>
    ),
  },
  {
    title: "Their device opens it",
    body: "Each device holds its own key. Only people in the chat can turn the scrambled message back into words, and it happens on their device.",
    bg: "#5E3122",
    fg: "#F7EAE0",
    visual: (
      <div className="space-y-3">
        <p className={MONO}>q9Zk4f…8HsT2=</p>
        <KeyRound className="ml-4 h-5 w-5 text-[#F9D2BA]" />
        <p className="w-fit rounded-2xl rounded-bl-sm bg-[#F7EAE0] px-4 py-2.5 text-sm font-semibold text-[#5E3122]">See you at six.</p>
      </div>
    ),
  },
  {
    title: "Your history follows you",
    body: "Sign in on a new device and your history is there. Turn on a passphrase and only you can bring it back, not even Relay.",
    bg: "#2A5C46",
    fg: "#F7EAE0",
    visual: (
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EAE0]/15"><Laptop className="h-7 w-7" /></span>
        <span className="h-px w-8 bg-[#F9D2BA]/60" />
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EAE0]/15"><Smartphone className="h-7 w-7" /></span>
      </div>
    ),
  },
];

function StackCard({
  step,
  index,
  progress,
  reduce,
}: {
  step: (typeof STEPS)[number];
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const total = STEPS.length;
  const target = reduce ? 1 : 1 - (total - 1 - index) * 0.05;
  const scale = useTransform(progress, [index / total, 1], [1, target]);

  return (
    <div className="sticky top-0 flex h-svh items-center justify-center px-3">
      <motion.article
        style={{ scale, y: index * 26, backgroundColor: step.bg, color: step.fg }}
        className="grid w-full max-w-4xl origin-top gap-8 rounded-[2rem] p-7 sm:p-10 md:grid-cols-2 md:items-center md:rounded-[2.5rem]"
      >
        <div>
          <p className="text-xs font-bold opacity-70">Step {index + 1}</p>
          <h3 className="mt-2 font-display text-[clamp(1.6rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-tight text-balance">
            {step.title}
          </h3>
          <p className="mt-4 max-w-md text-sm font-medium leading-relaxed opacity-85 sm:text-base">{step.body}</p>
        </div>
        <div>{step.visual}</div>
      </motion.article>
    </div>
  );
}

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="how" className="scroll-mt-16 px-1 pt-16 sm:pt-24">
      <div className="mx-auto max-w-6xl px-3 sm:px-8">
        <h2 className="max-w-2xl font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight text-[#1D4533] text-balance">
          What happens when you press send.
        </h2>
      </div>

      <div ref={ref} className="relative mt-8">
        {STEPS.map((step, index) => (
          <StackCard key={step.title} step={step} index={index} progress={scrollYProgress} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}