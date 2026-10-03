"use client";

import{ useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ShieldCheck } from "lucide-react";

interface ChatItem {
  id: string;
  name: string;
  avatarText: string;
  preview: string;
  time: string;
  ConversationType: string;
  unreadCount?: number;
  isOnline?: boolean;
  isChannel?: boolean;
}

const filterTabs = ["All", "Direct", "Channels", "Archive"];

const mockChats: ChatItem[] = [
  {
    id: "9345678h68307s2a",
    name: "Okasha Khan",
    avatarText: "OK",
    preview: "Let's deploy the end-to-end sync upda...",
    ConversationType: "DIRECT",
    time: "10:42 AM",
    isOnline: true,
  },
  {
    id: "b48210f83c1294ea",
    name: "Sarah Jenkins",
    avatarText: "SJ",
    preview: "The design specs for Relay look gor...",
    ConversationType: "DIRECT",
    time: "09:15 AM",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "b48218f83c1294ea",
    name: "webdevTeam",
    avatarText: "WD",
    preview: "Marcus: Pushed the socket gatewa...",
    ConversationType: "GROUP",
    time: "Yesterday",
    unreadCount: 5,
  },
  {
    id: "c28210j82c1294ea",
    name: "mobileDevTeam",
    avatarText: "MD",
    preview: "alex: Pushed the socket gatewa...",
    ConversationType: "GROUP",
    time: "Yesterday",
    unreadCount: 3,
  },
  {
    id: "s28210w82e1294ur",
    name: "Elena Rostova",
    avatarText: "ER",
    preview: "Sent you the telemetry benchmark report.",
    ConversationType: "DIRECT",
    time: "Aug 28",
    isOnline: true,
  },
  {
    id: "z28210q82k1294ig",
    name: "David Chen",
    avatarText: "DC",
    preview: "Thanks! Have a great weekend.",
    ConversationType: "DIRECT",
    time: "Aug 26",
    isOnline: false,
  },
];

export default function ChatList({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId?: string;
  onSelectChat: (id: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full md:w-85 lg:w-95 h-screen bg-[#F7EAE0] border-r border-[#1D4533]/10 flex flex-col shrink-0 select-none">
      {/* Header */}
      <div className="p-5 pb-3 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1D4533] tracking-tight">
              Conversations
            </h1>
            <p className="text-[11px] font-medium text-[#5E3122]/60">
              3 unread conversations
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-xl bg-[#F7EAE0] hover:bg-[#F9D2BA]/40 border border-[#1D4533]/15 flex items-center justify-center text-[#1D4533] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/40" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1D4533]/5 border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#1D4533] text-[#F7EAE0]"
                    : "bg-[#1D4533]/5 text-[#5E3122]/70 hover:bg-[#1D4533]/10"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations Scrollable Area */}
      <div
        className="flex-1 overflow-y-auto px-3 space-y-1.5 py-2
        custom-scrollbar"
      >
        {mockChats.map((chat) => {
          const isSelected = selectedChatId === chat.id;

          return (
            <motion.div
              key={chat.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectChat(chat.id)}
              className={`relative flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F9D2BA]/40 border-l-4 border-[#1D4533] shadow-sm"
                  : "hover:bg-[#1D4533]/5 border-l-4 border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#1D4533] text-[#F9D2BA] font-bold text-xs flex items-center justify-center shadow-sm">
                  {chat.avatarText}
                </div>
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full" />
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="text-xs font-bold text-[#1D4533] truncate">
                    {chat.name}
                  </h3>
                  <span className="text-[10px] font-medium text-[#5E3122]/60 shrink-0">
                    {chat.time}
                  </span>
                </div>
                <p className="text-[11px] text-[#5E3122]/70 truncate font-medium">
                  {chat.preview}
                </p>
              </div>

              {/* Unread Badge */}
              {chat.unreadCount && (
                <div className="w-4 h-4 rounded-full bg-[#1D4533] text-[#F9D2BA] font-bold text-[9px] flex items-center justify-center shrink-0">
                  {chat.unreadCount}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-[#1D4533]/10 flex items-center justify-between text-[10px] font-medium text-[#5E3122]/60 px-4">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Relay
          Engine v2.4
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#1D4533]" /> Encrypted
        </span>
      </div>
    </div>
  );
}
