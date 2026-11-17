"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { Info } from "lucide-react";
import { useAnchorScroll } from "@/hooks/useAnchorScroll";
import type { Block, LegalSection } from "@/lib/legal/types";

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (typeof block === "string") {
          return (
            <p
              key={index}
              className="mt-4 text-[15px] font-medium leading-[1.75] text-[#5E3122]/90"
            >
              {block}
            </p>
          );
        }

        if ("list" in block) {
          return (
            <ul key={index} className="mt-4 space-y-2.5 pl-1">
              {block.list.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[15px] font-medium leading-[1.7] text-[#5E3122]/90"
                >
                  <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#B5654A]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if ("items" in block) {
          return (
            <dl
              key={index}
              className="mt-4 divide-y divide-[#1D4533]/10 border-y border-[#1D4533]/10"
            >
              {block.items.map((item) => (
                <div
                  key={item.title}
                  className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-extrabold text-[#1D4533]">
                    {item.title}
                  </dt>
                  <dd className="text-[15px] font-medium leading-[1.7] text-[#5E3122]/90">
                    {item.text}
                  </dd>
                </div>
              ))}
            </dl>
          );
        }

        return (
          <aside
            key={index}
            className="mt-5 flex gap-3 rounded-2xl border border-[#1D4533]/15 bg-[#F9D2BA]/40 p-4"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1D4533]" />
            <p className="text-sm font-semibold leading-relaxed text-[#5E3122]">
              {block.callout}
            </p>
          </aside>
        );
      })}
    </>
  );
}

export default function LegalPage({
  title,
  intro,
  updated,
  sections,
  other,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  other: { label: string; href: string };
}) {
  const go = useAnchorScroll(-100);
  const [active, setActive] = useState(sections[0]?.id);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];

        if (top) setActive(top.target.id);
      },
      { rootMargin: "-18% 0px -70% 0px" },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[#B5654A]"
      />

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-32 sm:px-8 sm:pt-40">
        <Link
          href="/"
          className="text-xs font-bold text-[#1D4533]/70 underline-offset-4 hover:underline"
        >
          Back to Relay
        </Link>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,7vw,5rem)] font-semibold leading-[0.98] tracking-tight text-[#1D4533]">
          {title}
        </h1>
        <p className="mt-3 text-sm font-semibold text-[#5E3122]/70">
          Last updated {updated}
        </p>
        <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[#5E3122]/85">
          {intro}
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 sm:px-8 lg:grid-cols-[15rem_1fr] lg:gap-16">
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <p className="mb-3 text-xs font-extrabold text-[#1D4533]/60">
            On this page
          </p>
          <ol className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {sections.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  onClick={(event) => go(event, section.id)}
                  aria-current={active === section.id ? "true" : undefined}
                  className={`block whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors lg:whitespace-normal lg:rounded-xl lg:py-2.5 ${
                    active === section.id
                      ? "bg-[#1D4533] text-[#F7EAE0]"
                      : "text-[#1D4533]/70 hover:bg-[#1D4533]/8"
                  }`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 max-w-3xl">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-t border-[#1D4533]/12 py-10 first:border-t-0 first:pt-0"
            >
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1D4533] sm:text-3xl">
                {section.title}
              </h2>
              <Blocks blocks={section.blocks} />
            </section>
          ))}

          <p className="border-t border-[#1D4533]/12 pt-8 text-sm font-semibold text-[#5E3122]/80">
            Also read the{" "}
            <Link
              href={other.href}
              className="font-extrabold text-[#1D4533] underline underline-offset-4"
            >
              {other.label}
            </Link>
            .
          </p>
        </article>
      </div>
    </>
  );
}
