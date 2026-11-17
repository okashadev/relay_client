"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, CheckCheck, Clock, File as FileIcon, Image as ImageIcon, Laptop, Smartphone } from "lucide-react";

const TILE = "relative flex flex-col overflow-hidden p-6 sm:p-7";
const BARS = [0.5, 0.9, 0.4, 0.75, 1, 0.55, 0.85, 0.35, 0.7, 0.95, 0.45, 0.8];

function TileText({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="mt-auto pt-6">
      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h3>
      <p className={`mt-2 text-sm font-medium leading-relaxed ${dark ? "text-[#F7EAE0]/75" : "opacity-75"}`}>{children}</p>
    </div>
  );
}

function TicksTile() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (!inView || reduce) return;

    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1500);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const labels = ["Sending", "Sent", "Delivered", "Read"];
  const Icon = [Clock, Check, CheckCheck, CheckCheck][step];

  return (
    <div ref={ref} className={`${TILE} rounded-[2rem] border border-[#1D4533]/10 bg-white text-[#5E3122] md:col-span-3`}>
      <div className="flex flex-1 flex-col items-end justify-center gap-5 py-4">
        <div className="flex items-end gap-2 rounded-2xl rounded-br-sm bg-[#1D4533] px-4 py-3 text-sm font-medium text-[#F7EAE0]">
          On my way
          <Icon aria-hidden="true" className={`h-4 w-4 transition-colors ${step === 3 ? "text-sky-400" : "text-[#F9D2BA]"}`} />
        </div>
        <ol className="flex w-full flex-wrap justify-end gap-1.5" aria-label="Message states">
          {labels.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors duration-300 ${
                i === step ? "bg-[#1D4533] text-[#F7EAE0]" : "bg-[#1D4533]/8 text-[#1D4533]/60"
              }`}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>
      <TileText title="Receipts you can read at a glance">
        One tick means it&apos;s saved. Two means it reached their device. Blue means they opened the
        chat. In a group, ticks wait for everyone.
      </TileText>
    </div>
  );
}

const arc = (from: number, to: number) => {
  const point = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${50 + 44 * Math.cos(rad)} ${50 + 44 * Math.sin(rad)}`;
  };

  return `M ${point(from)} A 44 44 0 0 1 ${point(to)}`;
};

function StoriesTile() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: true });

  return (
    <div ref={ref} className={`${TILE} rounded-[2rem] bg-[#1D4533] text-[#F7EAE0] md:col-span-3`}>
      <div className="flex flex-1 items-center justify-center py-4">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.path
                key={i}
                d={arc(i * 120 + 6, i * 120 + 114)}
                fill="none"
                stroke="#F9D2BA"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: i === 2 ? 0.35 : 1 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.55, ease: "easeOut" }}
              />
            ))}
          </svg>
          <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[#F9D2BA] font-display text-4xl font-bold text-[#1D4533]">A</div>
        </div>
      </div>
      <TileText title="Stories that disappear" dark>
        Share text, photos or video for 24 hours. See who watched. Replies land in your chat.
      </TileText>
    </div>
  );
}

const EMOJI = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function ReactTile() {
  const [picked, setPicked] = useState<string | null>("❤️");

  return (
    <div className={`${TILE} rounded-[2rem] bg-[#F9D2BA] text-[#5E3122] md:col-span-2`}>
      <div className="flex flex-1 flex-col justify-center gap-4 py-4">
        <div className="relative w-fit rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm font-medium">
          Dinner at 8?
          <AnimatePresence>
            {picked && (
              <motion.span
                key={picked}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="absolute -bottom-3 left-3 rounded-full border border-[#1D4533]/15 bg-[#F7EAE0] px-1.5 py-0.5 text-xs"
              >
                {picked}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Try a reaction">
          {EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-pressed={picked === emoji}
              onClick={() => setPicked((current) => (current === emoji ? null : emoji))}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-all hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533] ${
                picked === emoji ? "bg-[#1D4533]" : "bg-white/70"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <TileText title="Reply, react, edit">
        Edit a message within 15 minutes. Delete it for yourself, or for everyone within 48 hours.
      </TileText>
    </div>
  );
}

function GroupsTile() {
  const people = [
    { n: "A", c: "#1D4533" },
    { n: "M", c: "#B5654A" },
    { n: "S", c: "#5E3122" },
    { n: "Z", c: "#2A5C46" },
  ];

  return (
    <div className={`${TILE} rounded-[2rem] border border-[#1D4533]/10 bg-[#1D4533]/[0.04] text-[#5E3122] md:col-span-2`}>
      <div className="flex flex-1 flex-col justify-center gap-4 py-4">
        <div className="flex -space-x-3">
          {people.map((person) => (
            <span
              key={person.n}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#F7EAE0] font-display text-lg font-bold text-[#F7EAE0]"
              style={{ backgroundColor: person.c }}
            >
              {person.n}
            </span>
          ))}
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#F7EAE0] bg-[#F9D2BA] text-xs font-extrabold text-[#1D4533]">+96</span>
        </div>
        <dl className="space-y-1 text-xs font-medium">
          <div className="flex justify-between gap-3"><dt className="font-extrabold text-[#1D4533]">Owner</dt><dd className="opacity-75">manages everyone</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-extrabold text-[#1D4533]">Admin</dt><dd className="opacity-75">adds and removes</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-extrabold text-[#1D4533]">Member</dt><dd className="opacity-75">chats</dd></div>
        </dl>
      </div>
      <TileText title="Groups with roles">
        Up to 100 people. When someone leaves or is removed, the group&apos;s keys refresh.
      </TileText>
    </div>
  );
}

function MediaTile() {
  return (
    <div className={`${TILE} rounded-[2rem] bg-[#5E3122] text-[#F7EAE0] md:col-span-2`}>
      <div className="flex flex-1 flex-col justify-center gap-4 py-4">
        <div aria-hidden="true" className="flex h-12 items-center gap-1">
          {BARS.map((bar, i) => (
            <span key={i} className="animate-wave w-1.5 rounded-full bg-[#F9D2BA]" style={{ height: `${bar * 100}%`, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 rounded-full bg-[#F7EAE0]/12 px-3 py-1.5"><ImageIcon className="h-3.5 w-3.5" />photo.jpg</span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F7EAE0]/12 px-3 py-1.5"><FileIcon className="h-3.5 w-3.5" />notes.pdf</span>
        </div>
      </div>
      <TileText title="Voice, video and files" dark>
        Photos, video, voice notes and documents. Files are encrypted before they upload.
      </TileText>
    </div>
  );
}

const DEVICES = [
  { id: "d1", name: "Chrome on Linux", meta: "Active now", Icon: Laptop },
  { id: "d2", name: "Motorola moto g54 · Android", meta: "2 hours ago", Icon: Smartphone },
  { id: "d3", name: "Safari on macOS", meta: "Yesterday", Icon: Laptop },
];

function DevicesTile() {
  const [rows, setRows] = useState(DEVICES);

  return (
    <div className={`${TILE} rounded-[2rem] border border-[#1D4533]/10 bg-white text-[#5E3122] md:col-span-6 md:flex-row md:items-center md:gap-10`}>
      <div className="md:w-5/12">
        <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Your devices, your call</h3>
        <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed opacity-75">
          See everywhere you&apos;re signed in, with the real browser or phone model. Log any device
          out and it stops getting new messages straight away.
        </p>
      </div>

      <ul className="mt-6 flex-1 space-y-2 md:mt-0">
        <AnimatePresence initial={false}>
          {rows.map(({ id, name, meta, Icon }) => (
            <motion.li
              key={id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, x: -24, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-[#1D4533]/10 bg-[#F7EAE0]/60 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4533]/10 text-[#1D4533]"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-extrabold text-[#1D4533]">{name}</span>
                  <span className={`block text-[11px] font-semibold ${meta === "Active now" ? "text-emerald-700" : "opacity-60"}`}>{meta}</span>
                </span>
                {meta !== "Active now" && (
                  <button
                    type="button"
                    onClick={() => setRows((list) => list.filter((row) => row.id !== id))}
                    aria-label={`Log out ${name}`}
                    className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  >
                    Log out
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
        {rows.length === 1 && (
          <li>
            <button type="button" onClick={() => setRows(DEVICES)} className="px-1 text-[11px] font-bold text-[#1D4533] underline-offset-4 hover:underline">
              Sign the other devices in again
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight text-[#1D4533] text-balance">
          Built for talking, not scrolling.
        </h2>
        <p className="mt-4 text-base font-medium leading-relaxed text-[#5E3122]/80 sm:text-lg">
          Relay sticks to the basics and does them properly: fast delivery, clear receipts, and the
          tools you need for the moment after you hit send.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-6">
        <TicksTile />
        <StoriesTile />
        <ReactTile />
        <GroupsTile />
        <MediaTile />
        <DevicesTile />
      </div>
    </section>
  );
}