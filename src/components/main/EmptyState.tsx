'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, Lock, Sparkles } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex-1 h-screen bg-[#F7EAE0]/50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden select-none">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#F9D2BA]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1D4533_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      {/* Main Content Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 max-w-sm flex flex-col items-center space-y-5"
      >
        {/* Animated Relay Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-[#1D4533] flex items-center justify-center shadow-xl shadow-[#1D4533]/20 text-[#F9D2BA] relative">
          <MessageSquare className="w-9 h-9" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 text-[#F9D2BA]" />
          </motion.div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#1D4533] tracking-tight">
            Select a conversation
          </h2>
          <p className="text-xs text-[#5E3122]/70 leading-relaxed font-medium">
            Choose a contact from the sidebar or start a new chat to begin instant end-to-end encrypted messaging.
          </p>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D4533]/5 border border-[#1D4533]/10 text-[11px] font-semibold text-[#1D4533]">
          <Lock className="w-3.5 h-3.5 text-[#1D4533]" />
          <span>Zero-Trust End-to-End Encryption</span>
        </div>
      </motion.div>
    </div>
  );
}