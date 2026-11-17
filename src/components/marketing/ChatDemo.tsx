"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, CheckCheck, Clock, Lock, Play } from "lucide-react";

type Line = { id: string; from: "them" | "me"; text?: string; voice?: boolean };
type Tick = 0 | 1 | 2 | 3;

const SCRIPT: Line[] = [
  { id: "a", from: "them", text: "Are we still on for Saturday?" },
  { id: "b", from: "me", text: "Booked the tickets ✈️" },
  { id: "c", from: "them", voice: true },
];

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&@*";
const BARS = [0.4, 0.75, 0.5, 0.9, 0.6, 0.35, 0.8, 0.55, 0.95, 0.45, 0.7, 0.3, 0.65, 0.85, 0.5, 0.4];

const scramble = (text: string) =>
  text
    .split("")
    .map((char) => (char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join("");

// Ciphertext se plaintext: left se right, letter by letter
function Decoded({ text, active }: { text: string; active: boolean }) {
  const [out, setOut] = useState(() => (active ? scramble(text) : text));

  useEffect(() => {
    if (!active) {
      setOut(text);
      return;
    }

    const start = performance.now();
    const id = setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / 1100);
      const solved = Math.floor(t * text.length);

      setOut(
        text
          .split("")
          .map((char, i) =>
            i < solved || char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(""),
      );

      if (t >= 1) clearInterval(id);
    }, 45);

    return () => clearInterval(id);
  }, [active, text]);

  return <span className={active ? "font-mono text-[#5E3122]/55" : ""}>{out}</span>;
}

function Ticks({ tick }: { tick: Tick }) {
  if (tick === 0) return <Clock className="h-3 w-3" />;
  if (tick === 1) return <Check className="h-3 w-3" />;
  return <CheckCheck className={`h-3 w-3 ${tick === 3 ? "text-sky-400" : ""}`} />;
}

export default function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();

  const [shown, setShown] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [decoding, setDecoding] = useState<string | null>(null);
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const [reactions, setReactions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!inView || reduce) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        setShown([]);
        setTicks({});
        setReactions({});
        setDecoding(null);
        await sleep(700);

        for (const line of SCRIPT) {
          if (cancelled) return;

          if (line.from === "them") {
            setTyping(true);
            await sleep(1100);
            if (cancelled) return;
            setTyping(false);
            setShown((list) => [...list, line.id]);
            setDecoding(line.id);
            await sleep(1500);
            setDecoding(null);
            await sleep(700);
          } else {
            setShown((list) => [...list, line.id]);
            setTicks((t) => ({ ...t, [line.id]: 0 }));
            await sleep(550);
            setTicks((t) => ({ ...t, [line.id]: 1 }));
            await sleep(700);
            setTicks((t) => ({ ...t, [line.id]: 2 }));
            await sleep(800);
            setTicks((t) => ({ ...t, [line.id]: 3 }));
            await sleep(700);
            setReactions((r) => ({ ...r, [line.id]: "❤️" }));
            await sleep(1100);
          }
        }

        await sleep(4200);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [inView, reduce]);

  const visible = reduce ? SCRIPT.map((line) => line.id) : shown;
  const tickOf = (id: string): Tick => (reduce ? 3 : (ticks[id] ?? 0));
  const reactionOf = (id: string) => (reduce ? (id === "b" ? "❤️" : undefined) : reactions[id]);

  return (
    <div ref={ref} className="mx-auto w-full max-w-[26rem]">
      <p className="sr-only">
        A demo conversation: a friend&apos;s message arrives encrypted and opens on your device, your
        reply moves from sent to delivered to read, and your friend reacts with a heart.
      </p>

      <div aria-hidden="true" className="overflow-hidden rounded-[2rem] border border-[#F9D2BA]/30 bg-[#F7EAE0] text-[#5E3122] shadow-2xl shadow-black/30">
        <div className="flex items-center gap-3 border-b border-[#1D4533]/10 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F9D2BA] text-sm font-black text-[#1D4533]">S</div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1D4533]">Sara</p>
            <p className={`text-[10px] font-medium ${typing ? "text-emerald-600" : "text-[#5E3122]/60"}`}>
              {typing ? "typing…" : "Online"}
            </p>
          </div>
        </div>

        <div className="flex h-[21rem] flex-col justify-end gap-1.5 overflow-hidden px-4 pb-3">
          <AnimatePresence initial={false}>
            {visible.map((id) => {
              const line = SCRIPT.find((item) => item.id === id) as Line;
              const mine = line.from === "me";
              const reaction = reactionOf(id);

              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${
                      mine
                        ? "rounded-br-sm bg-[#1D4533] text-[#F7EAE0]"
                        : "rounded-bl-sm border border-[#1D4533]/10 bg-white"
                    }`}
                  >
                    {line.voice ? (
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1D4533] text-[#F9D2BA]">
                          <Play className="h-3 w-3 fill-current" />
                        </span>
                        <span className="flex h-6 items-center gap-[3px]">
                          {BARS.map((bar, i) => (
                            <span key={i} className="w-[3px] rounded-full bg-[#1D4533]/50" style={{ height: `${bar * 100}%` }} />
                          ))}
                        </span>
                        <span className="text-[10px] tabular-nums opacity-70">0:12</span>
                      </span>
                    ) : (
                      <>
                        {line.from === "them" ? <Decoded text={line.text as string} active={decoding === id} /> : line.text}
                        <span className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${mine ? "text-[#F9D2BA]/70" : "text-[#5E3122]/50"}`}>
                          10:42
                          {mine && <Ticks tick={tickOf(id)} />}
                        </span>
                      </>
                    )}
                  </div>

                  <AnimatePresence>
                    {reaction && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className="-mt-1.5 mr-2 rounded-full border border-[#1D4533]/15 bg-white px-1.5 py-0.5 text-[11px] shadow-sm"
                      >
                        {reaction}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {typing && (
            <div className="flex w-fit items-center gap-1.5 rounded-2xl border border-[#1D4533]/10 bg-white px-3 py-2.5 shadow-sm">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1D4533] [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1D4533] [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1D4533]" />
            </div>
          )}
        </div>

        <div className="border-t border-[#1D4533]/10 px-4 py-3">
          <div className="rounded-2xl border border-[#1D4533]/10 bg-white px-4 py-2.5 text-xs font-medium text-[#5E3122]/40">
            Message Sara...
          </div>
        </div>
      </div>

      <p aria-hidden="true" className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#F7EAE0]/70">
        <Lock className={`h-3 w-3 ${decoding ? "animate-pulse text-[#F9D2BA]" : ""}`} />
        {decoding ? "Opening on your device" : "Encrypted on your device"}
      </p>
    </div>
  );
}