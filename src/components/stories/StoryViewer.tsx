'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Pause, Volume2, X, Send, Smile } from 'lucide-react';

export default function StoryViewer({ story }: { story: any }) {
  const previewText = story.preview || story.name || 'Status Update';
  const contentText = story.content || `Building the new Relay design system! Clean tokens, warm cream surfaces, and rock-solid socket architecture.`;
  const tagsList = story.tags || ['#DesignTokens', '#RelayDesign', '#SocketUI'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full w-full bg-[#F7EAE0] p-6 gap-6 overflow-hidden items-center justify-center select-none"
    >
      {/* Main Active Story Card Panel */}
      <div className="flex-1 max-w-md h-full max-h-[860px] bg-white rounded-3xl border border-[#1D4533]/15 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Progress Bars */}
        <div className="flex gap-1.5 px-4 pt-3 pb-2 bg-gradient-to-b from-black/30 to-transparent absolute top-0 left-0 right-0 z-20">
          <div className="h-1 flex-1 bg-white/80 rounded-full overflow-hidden">
            <div className="h-full bg-[#1D4533] w-full animate-pulse"></div>
          </div>
          <div className="h-1 flex-1 bg-white/40 rounded-full"></div>
          <div className="h-1 flex-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Top Header info */}
        <div className="flex items-center justify-between px-4 py-3 pt-4 bg-white/90 backdrop-blur-md z-10 border-b border-[#1D4533]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F7EAE0] border border-[#1D4533]/20 text-[#1D4533] flex items-center justify-center font-bold text-xs shadow-sm">
              {story.avatar || 'OK'}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-bold text-[#1D4533]">{story.name || story.author || 'Okasha Khan'}</h3>
                <ShieldCheck size={13} className="text-[#1D4533] fill-[#1D4533]/20" />
              </div>
              <p className="text-[10px] text-[#1D4533]/70 font-medium">{story.time || '18m ago'} • Relay Secure</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[#1D4533]">
            <button className="p-1.5 rounded-lg hover:bg-[#1D4533]/10 transition-all"><Pause size={14} /></button>
            <button className="p-1.5 rounded-lg hover:bg-[#1D4533]/10 transition-all"><Volume2 size={14} /></button>
            <button className="p-1.5 rounded-lg hover:bg-[#1D4533]/10 transition-all"><X size={16} /></button>
          </div>
        </div>

        {/* Media Banner & Floating Caption Area */}
        <div className="flex-1 relative bg-[#1D4533] flex flex-col justify-end overflow-hidden p-4">
          
          {/* Simulated Image / Banner Background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1D4533] via-[#1D4533]/90 to-[#2A5C46] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full bg-[#F7EAE0] text-[#1D4533] rounded-2xl p-5 shadow-2xl border border-[#1D4533]/20 text-left space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-[#1D4533]/60">
                <span>Oakhaven Tokens</span>
                <span>v1.2</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1D4533] text-[#F7EAE0] p-2 rounded-xl text-[10px] font-bold">Forest Green</div>
                <div className="bg-[#E0A99D] text-[#1D4533] p-2 rounded-xl text-[10px] font-bold">Warm Cream</div>
                <div className="bg-white text-[#1D4533] p-2 rounded-xl text-[10px] font-bold">Pure Surface</div>
              </div>
              <p className="text-[11px] font-semibold text-[#1D4533]/80">Typography: DM Sans Regular / Bold</p>
            </div>
          </div>

          {/* Floating Caption Overlay Card */}
          <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-[#1D4533]/15 space-y-2.5">
            <p className="text-xs font-semibold text-[#1D4533] leading-relaxed">
              {contentText}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tagsList.map((tag: string, idx: number) => (
                <span key={idx} className="text-[10px] font-bold text-[#1D4533] bg-[#F7EAE0] px-2.5 py-0.5 rounded-lg border border-[#1D4533]/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Emojis / Reactions Bar */}
        <div className="px-4 py-2.5 bg-white border-t border-[#1D4533]/10 flex items-center justify-around">
          {['❤️', '🔥', '👏', '🚀', '😄'].map((emoji, idx) => (
            <motion.button 
              key={idx}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              className="text-lg p-1.5 rounded-full hover:bg-[#F7EAE0] transition-all"
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Bottom Reply Bar */}
        <div className="p-3 bg-white border-t border-[#1D4533]/15 flex items-center gap-2">
          <input 
            type="text" 
            placeholder={`Reply to ${story.name || story.author || 'Okasha'}...`}
            className="flex-1 bg-[#F7EAE0]/70 border border-[#1D4533]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-1 focus:ring-[#1D4533]"
          />
          <button className="p-2.5 bg-[#F7EAE0] text-[#1D4533] rounded-xl hover:bg-[#1D4533]/10 transition-all">
            <Smile size={18} />
          </button>
          <button className="p-2.5 bg-[#1D4533] text-[#F7EAE0] rounded-xl shadow hover:bg-[#1D4533]/90 transition-all">
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Next Story Preview Card (Right Sidebar) */}
      <div className="hidden xl:flex flex-col w-64 bg-white/80 backdrop-blur-md border border-[#1D4533]/15 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-[10px] font-extrabold text-[#1D4533]/60 uppercase tracking-widest px-1">
          <span>Next Story</span>
          <span>&gt;</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#F7EAE0] border border-[#1D4533]/15 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center font-bold text-xs">
              SJ
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1D4533]">Sarah Jenkins</h4>
              <p className="text-[9px] text-[#1D4533]/70">45m ago</p>
            </div>
          </div>
          <p className="text-[11px] text-[#1D4533]/80 line-clamp-2 font-medium">
            Figma autolayout benchmarks and token mapping...
          </p>
        </div>
        <div className="flex justify-center gap-1 pt-1">
          <div className="w-6 h-1 bg-[#1D4533] rounded-full"></div>
          <div className="w-1.5 h-1 bg-[#1D4533]/30 rounded-full"></div>
          <div className="w-1.5 h-1 bg-[#1D4533]/30 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}