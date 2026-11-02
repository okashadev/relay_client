"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function SettingsShell({
  title,
  subtitle,
  backHref,
  maxWidth = "max-w-2xl",
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto overscroll-contain bg-[#F7EAE0] custom-scrollbar">
      <header className="sticky top-0 z-10 px-4 sm:px-6 lg:px-8 pt-4 pb-3 bg-[#F7EAE0]/95 backdrop-blur border-b border-[#1D4533]/10">
        <div className={`${maxWidth} mx-auto flex items-center gap-3`}>
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back to settings"
              title="Back to settings"
              className="w-9 h-9 rounded-xl bg-white border border-[#1D4533]/15 text-[#1D4533] shadow-sm flex items-center justify-center shrink-0 transition-all hover:bg-[#1D4533]/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40"
            >
              <ArrowLeft size={16} />
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-black text-[#1D4533] tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] font-medium text-[#5E3122]/60 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className={`${maxWidth} mx-auto`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}