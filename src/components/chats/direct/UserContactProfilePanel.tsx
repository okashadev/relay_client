"use client";

import { Ban, BellOff, CheckCircle2, Trash2, X } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { formatLastSeen } from "@/lib/format";
import type { ChatUser } from "@/types/chat";
import { usePresence } from "@/hooks/usePresence";

interface UserContactProfilePanelProps {
  user: ChatUser;
  isMuted?: boolean;
  isBlocked?: boolean;
  onClose: () => void;
  onMute?: () => void;
  onClearChat?: () => void;
  onBlock?: () => void;
}

export default function UserContactProfilePanel({
  user,
  onClose,
  onMute,
  onClearChat,
  onBlock,
  isMuted = false,
  isBlocked = false,
}: UserContactProfilePanelProps) {
  const presence = usePresence(user.id, {
    status: user.status,
    lastSeen: user.lastSeen,
  });
  const isOnline = presence?.status === "ONLINE";

  const actions = [
    {
      key: "mute",
      label: isMuted ? "Unmute notifications" : "Mute notifications",
      icon: BellOff,
      danger: false,
      onClick: onMute,
    },
    {
      key: "clear",
      label: "Delete chat",
      icon: Trash2,
      danger: true,
      onClick: onClearChat,
    },
    {
      key: "block",
      label: isBlocked
        ? `Unblock @${user.username}`
        : `Block @${user.username}`,
      icon: Ban,
      danger: !isBlocked,
      onClick: onBlock,
    },
  ];

  return (
    <div className="w-full md:w-80 h-full bg-[#F7EAE0] md:border-l border-[#1D4533]/10 flex flex-col overflow-y-auto overscroll-contain shrink-0 shadow-lg">
      <div className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-[#1D4533]/10 flex items-center justify-between bg-[#F7EAE0]/90 backdrop-blur-md sticky top-0 z-10">
        <span className="text-xs font-bold text-[#1D4533] tracking-wide">
          Contact Info
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact info"
          className="w-9 h-9 rounded-lg hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative bg-[#F3D7C6] border-b border-[#1D4533]/10 pb-6">
        <div className="h-20 w-full bg-[linear-gradient(to_right,#1D45330a_1px,transparent_1px),linear-gradient(to_bottom,#1D45330a_1px,transparent_1px)] bg-size-[16px_16px] relative">
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-[#1D4533]/10 flex items-center gap-1.5 shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-[#1D4533]/30"
              }`}
            />
            <span className="text-[9px] font-bold text-[#1D4533]">
              {isOnline ? "Online Now" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center px-4 -mt-8">
          <UserAvatar
            name={user.name}
            avatar={user.avatar}
            className="w-20 h-20 rounded-2xl border-4 border-[#F7EAE0]"
            textClassName="text-2xl"
          />

          <div className="text-center mt-3 max-w-full">
            <div className="flex items-center justify-center gap-1.5 min-w-0">
              <h3 className="text-sm font-bold text-[#1D4533] truncate">
                {user.name}
              </h3>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4533] fill-[#1D4533]/20 shrink-0" />
            </div>
            <p className="text-[10px] text-[#5E3122]/70 font-medium mt-0.5 truncate">
              @{user.username}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white/80 border border-[#1D4533]/10 rounded-2xl p-4 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-[#1D4533] uppercase tracking-wider">
            About
          </span>
          <p className="text-[11px] text-[#5E3122]/80 leading-relaxed font-medium wrap-anywhere">
            {user.bio || "No bio yet."}
          </p>
          {!isOnline && presence?.lastSeen && (
            <p className="pt-2 border-t border-[#1D4533]/10 text-[10px] text-[#5E3122]/60 font-medium">
              {formatLastSeen(presence.lastSeen)}
            </p>
          )}
        </div>

        <div className="bg-white/80 border border-[#1D4533]/10 rounded-2xl shadow-sm overflow-hidden divide-y divide-[#1D4533]/10">
          {actions.map(({ key, label, icon: Icon, danger, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors cursor-pointer hover:bg-[#1D4533]/5 ${
                danger ? "text-rose-600" : "text-[#1D4533]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
