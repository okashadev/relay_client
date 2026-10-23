"use client";

import { useMemo } from "react";
import {
  FileText,
  Image as ImageIcon,
  LogOut,
  UserPlus,
  Video,
  VolumeX,
  X,
} from "lucide-react";
import GroupAvatar from "@/components/common/GroupAvatar";
import UserAvatar from "@/components/common/UserAvatar";
import { timeAgo } from "@/lib/time";
import type {
  ChatGroup,
  ChatUser,
  ParticipantRole,
  SharedMediaItem,
} from "@/types/chat";
import { usePresenceStore } from "@/store/presenceStore";

interface GroupDetailsPanelProps {
  group: ChatGroup;
  meId: string;
  sharedMedia: SharedMediaItem[];
  isMuted?: boolean;
  onClose: () => void;
  onAddMembers?: () => void;
  onMute?: () => void;
  onLeave?: () => void;
}

const ROLE_RANK: Record<ParticipantRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  MEMBER: 2,
};

const ROLE_LABEL: Partial<Record<ParticipantRole, string>> = {
  OWNER: "Owner",
  ADMIN: "Admin",
};

const mediaIcon = (type: SharedMediaItem["type"]) =>
  type === "IMAGE" ? ImageIcon : type === "VIDEO" ? Video : FileText;

export default function GroupDetailsPanel({
  group,
  meId,
  sharedMedia,
  onClose,
  onAddMembers,
  onMute,
  onLeave,
  isMuted = false,
}: GroupDetailsPanelProps) {
  const canManageMembers = group.myRole === "OWNER" || group.myRole === "ADMIN";

  const presenceByUser = usePresenceStore((state) => state.byUser);

  const statusOf = (user: ChatUser) =>
    presenceByUser[user.id] ?? { status: user.status, lastSeen: user.lastSeen };

  const members = useMemo(
    () =>
      [...group.members].sort(
        (a, b) =>
          ROLE_RANK[a.role] - ROLE_RANK[b.role] ||
          Number(b.user.status === "ONLINE") -
            Number(a.user.status === "ONLINE") ||
          a.user.name.localeCompare(b.user.name),
      ),
    [group.members],
  );

  const onlineCount = group.members.filter((member) => {
    const live = statusOf(member.user);
    live.status === "ONLINE";
  }).length;

  const createdDate = new Date(group.createdAt).toLocaleDateString([], {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-full md:w-80 h-full bg-[#F7EAE0] md:border-l border-[#1D4533]/10 flex flex-col overflow-y-auto overscroll-contain shrink-0 shadow-lg">
      {/* Header */}
      <div className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-[#1D4533]/10 flex items-center justify-between bg-[#F7EAE0]/90 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xs font-bold text-[#1D4533]">Group Details</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close group details"
          className="w-9 h-9 rounded-lg hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Group Summary */}
      <div className="p-6 flex flex-col items-center text-center border-b border-[#1D4533]/10">
        <GroupAvatar
          name={group.name}
          avatar={group.avatar}
          className="w-16 h-16 rounded-2xl mb-3"
          iconClassName="w-8 h-8"
        />
        <h3 className="text-sm font-bold text-[#1D4533] max-w-full truncate">
          {group.name}
        </h3>
        <p className="text-[10px] text-[#5E3122]/60 font-medium max-w-full truncate">
          {group.createdBy
            ? `Created by ${group.createdBy.name} • ${createdDate}`
            : `Created ${createdDate}`}
        </p>

        <div className="mt-4 p-3 bg-white/70 border border-[#1D4533]/10 rounded-xl text-left w-full">
          <p className="text-[9px] font-bold text-[#1D4533] uppercase tracking-wider mb-1">
            About
          </p>
          <p className="text-[10px] text-[#5E3122]/80 leading-relaxed font-medium wrap-anywhere">
            {group.description || "No description yet."}
          </p>
        </div>

        {/* Actions: Add sirf owner aur admins ko */}
        <div
          className={`grid gap-2 w-full mt-4 ${
            canManageMembers ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {canManageMembers && (
            <button
              type="button"
              onClick={onAddMembers}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#1D4533] text-[#F9D2BA] hover:bg-[#1D4533]/90 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mb-1" />
              <span className="text-[9px] font-bold">Add</span>
            </button>
          )}
          <button
            type="button"
            onClick={onMute}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533]/5 transition-colors cursor-pointer"
          >
            <VolumeX className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-[#1D4533]/10 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-bold">Leave</span>
          </button>
        </div>
      </div>

      {/* Shared Media */}
      {sharedMedia.length > 0 && (
        <div className="p-4 border-b border-[#1D4533]/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#1D4533] tracking-wide uppercase">
              Shared media ({sharedMedia.length})
            </span>
            {/* TODO: poori media ki list */}
            <button
              type="button"
              className="text-[9px] font-bold text-[#5E3122]/60 hover:text-[#1D4533] cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {sharedMedia.slice(0, 3).map((item) => {
              const Icon = mediaIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="h-16 rounded-xl bg-white border border-[#1D4533]/10 flex flex-col items-center justify-center p-2"
                >
                  <Icon className="w-5 h-5 text-[#1D4533]" />
                  <span className="text-[8px] font-medium text-[#5E3122] truncate w-full text-center mt-1">
                    {item.fileName ?? item.type.toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[#1D4533] tracking-wide uppercase">
            Members ({group.members.length})
          </span>
          <span className="text-[9px] font-bold text-emerald-600">
            {onlineCount} online
          </span>
        </div>

        <ul className="space-y-1">
          {members.map(({ user, role }) => {
            const live = statusOf(user);
            const roleLabel = ROLE_LABEL[role];
            const isOnline = live.status === "ONLINE";

            return (
              <li
                key={user.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      className="w-8 h-8 rounded-xl"
                      textClassName="text-[10px]"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#F7EAE0] ${
                        isOnline ? "bg-emerald-500" : "bg-[#1D4533]/30"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1D4533] truncate">
                      {user.name}
                      {user.id === meId && (
                        <span className="ml-1 text-[9px] font-medium text-[#5E3122]/50">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-[9px] text-[#5E3122]/60 font-medium truncate">
                      @{user.username}
                      {!isOnline &&
                        live.lastSeen &&
                        ` • ${timeAgo(live.lastSeen)}`}
                    </p>
                  </div>
                </div>

                {roleLabel && (
                  <span className="px-2 py-0.5 rounded-md bg-[#1D4533] text-[#F9D2BA] text-[8px] font-bold shrink-0">
                    {roleLabel}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
