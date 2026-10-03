"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Phone,
  Video,
  Info,
  Plus,
  Smile,
  Mic,
  Send,
  MessageSquare,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import GroupDetailsPanel from "./GroupDetailsPanel";

export default function GroupChatView({
  groupId,
  onToggleDetails,
}: {
  groupId: string | null;
  onToggleDetails: () => void;
}) {
  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-[#F7EAE0] overflow-hidden select-none">
        {/* Group Header */}
        <div className="px-6 py-3.5 bg-[#F7EAE0]/80 backdrop-blur-md border-b border-[#1D4533]/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D4533] text-[#F9D2BA] font-bold flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-[#1D4533]">
                  {groupId === "product-sprint"
                    ? "Product Sprint Team"
                    : "Team Channel"}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#1D4533]/10 text-[9px] font-bold text-[#1D4533]">
                  12 Members
                </span>
              </div>
              <p className="text-[10px] text-[#5E3122]/60 font-medium">
                4 Online •{" "}
                <span className="font-mono text-[9px]">
                  Secure cluster sync
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-xl hover:bg-[#1D4533]/5 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#1D4533]/10 mx-1" />
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                showDetails
                  ? "bg-[#1D4533] text-[#F9D2BA]"
                  : "hover:bg-[#1D4533]/5 text-[#1D4533]"
              }`}
              title="Contact Profile"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-[#1D4533]/10 text-[10px] font-bold text-[#1D4533]">
              Today
            </span>
          </div>

          {/* Marcus Brody Message */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1D4533] text-[#F9D2BA] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
              MB
            </div>
            <div className="space-y-1 max-w-[80%]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1D4533]">
                  Marcus Brody
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#1D4533] text-[#F9D2BA] text-[8px] font-bold">
                  Admin
                </span>
                <span className="text-[9px] text-[#5E3122]/50">10:35 AM</span>
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-[#1D4533]/10 text-xs text-[#5E3122] shadow-sm font-medium">
                Pushed the updates to staging for group ID:{" "}
                <span className="font-mono text-[10px] font-bold">
                  {groupId}
                </span>
                ! Please test synchronization.
              </div>
            </div>
          </div>

          {/* Own Message */}
          <div className="flex flex-col items-end">
            <div className="bg-[#1D4533] text-[#F7EAE0] p-3.5 rounded-2xl rounded-tr-sm max-w-[80%] text-xs shadow-sm font-medium leading-relaxed">
              On it! Running the telemetry tests right now.
              <div className="text-[9px] text-[#F9D2BA]/70 text-right mt-1">
                10:41 AM ✓
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#F7EAE0] border-t border-[#1D4533]/10 shrink-0">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-2xl bg-white hover:bg-[#1D4533]/5 border border-[#1D4533]/10 text-[#1D4533] flex items-center justify-center shrink-0 cursor-pointer shadow-sm">
              <Plus className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none pr-16 font-medium shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#5E3122]/50">
                <Smile className="w-4 h-4 cursor-pointer hover:text-[#1D4533]" />
                <Mic className="w-4 h-4 cursor-pointer hover:text-[#1D4533]" />
              </div>
            </div>

            <button className="w-10 h-10 rounded-2xl bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center shadow-md hover:bg-[#1D4533]/90 shrink-0 cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full overflow-hidden shrink-0"
          >
            <GroupDetailsPanel onClose={() => setShowDetails(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
