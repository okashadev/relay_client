"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full flex bg-[#F7EAE0] text-[#5E3122] font-sans selection:bg-[#F9D2BA] selection:text-[#5E3122] overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 relative bg-[#1D4533] text-[#F7EAE0] flex-col justify-between p-12 overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#F9D2BA]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#F9D2BA]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#F9D2BA_1px,transparent_1px)] bg-size-[24px_24px] opacity-10 pointer-events-none" />

        {/* Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F9D2BA] flex items-center justify-center shadow-lg shadow-black/10">
            <MessageSquare className="w-5 h-5 text-[#1D4533]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F7EAE0]">
            Relay
          </span>
        </div>

        {/* Middle Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 space-y-6 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F9D2BA]/15 border border-[#F9D2BA]/25 text-xs font-medium text-[#F9D2BA]">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encrypted Messaging</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-[#F7EAE0]">
            Connect, chat, and collaborate in real-time.
          </h2>

          <p className="text-sm leading-relaxed text-[#F7EAE0]/80">
            Welcome to Relay. Instant messaging, rich media sharing, and
            seamless conversations built for speed and security.
          </p>
        </motion.div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[#F7EAE0]/60 flex items-center justify-between border-t border-[#F7EAE0]/15 pt-6">
          <span>
            &copy; {new Date().getFullYear()} Relay Chat Inc. All rights
            reserved.
          </span>
          <div className="flex gap-4">
            <a
              href="/privacy"
              className="hover:text-[#F9D2BA] transition-colors"
            >
              Privacy
            </a>
            <a href="/terms" className="hover:text-[#F9D2BA] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Independent Scrollable Auth Form Area */}
      <div
        className="w-full lg:w-1/2 h-screen overflow-y-auto relative flex items-center justify-center p-6 sm:p-12
        custom-scrollbar"
      >
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-radial from-[#F9D2BA]/35 to-transparent rounded-full blur-3xl pointer-events-none" />

        <main className="relative z-10 w-full max-w-md my-auto py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
