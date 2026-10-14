"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BellOff, Pin, Plus, Search } from "lucide-react";
import GroupAvatar from "@/components/common/GroupAvatar";
import UserAvatar from "@/components/common/UserAvatar";
import { useChatList } from "@/hooks/useChatList";
import { formatChatTime } from "@/lib/format";
import type { ChatPreview } from "@/types/chat";
import NewChatDropdownButton from "../chats/NewChatDropdownButton";

type FilterTab = "All" | "Direct" | "Groups" | "Archive";

const filterTabs: FilterTab[] = ["All", "Direct", "Groups", "Archive"];

const previewText = (chat: ChatPreview) => {
  const last = chat.lastMessage;
  if (!last) return "No messages yet";

  let body: string;

  if (last.deleted) {
    body = "This message was deleted";
  } else {
    switch (last.type) {
      case "IMAGE":
        body = "Photo";
        break;
      case "VIDEO":
        body = "Video";
        break;
      case "VOICE":
        body = "Voice message";
        break;
      case "FILE":
        body = last.fileName ?? "File";
        break;
      default:
        body = last.content ?? "";
    }
  }

  if (last.isMine) return `You: ${body}`;
  if (chat.type === "GROUP" && last.senderName) {
    return `${last.senderName}: ${body}`;
  }

  return body;
};

function ChatRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-11 h-11 rounded-2xl bg-[#1D4533]/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
        <div className="h-2.5 w-44 max-w-full rounded bg-[#1D4533]/10" />
      </div>
    </div>
  );
}

export default function ChatList({
  selectedChatId,
  onSelectChat,
}: {
  selectedChatId?: string;
  onSelectChat: (id: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { chats, error, reload } = useChatList();

  const isInitialLoading = chats === null && !error;

  const unreadConversations = useMemo(
    () =>
      (chats ?? []).filter((chat) => !chat.isArchived && chat.unreadCount > 0)
        .length,
    [chats],
  );

  const rows = useMemo(() => {
    if (!chats) return [];

    const query = searchQuery.trim().toLowerCase();

    return chats
      .filter((chat) => {
        if (activeFilter === "Archive") return chat.isArchived;
        if (chat.isArchived) return false;
        if (activeFilter === "Direct") return chat.type === "DIRECT";
        if (activeFilter === "Groups") return chat.type === "GROUP";
        return true;
      })
      .map((chat) => ({ chat, preview: previewText(chat) }))
      .filter(
        ({ chat, preview }) =>
          !query ||
          chat.name.toLowerCase().includes(query) ||
          preview.toLowerCase().includes(query),
      )
      .sort(
        (a, b) =>
          Number(b.chat.isPinned) - Number(a.chat.isPinned) ||
          Date.parse(b.chat.lastMessageAt) - Date.parse(a.chat.lastMessageAt),
      );
  }, [chats, activeFilter, searchQuery]);

  const emptyText =
    searchQuery.trim() !== ""
      ? "No conversations match that search."
      : activeFilter === "Archive"
        ? "No archived conversations."
        : activeFilter === "Direct"
          ? "No direct conversations."
          : activeFilter === "Groups"
            ? "No group conversations."
            : null;

  return (
    <div className="w-full h-full bg-[#F7EAE0] md:border-r border-[#1D4533]/10 flex flex-col select-none">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 space-y-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-[#1D4533] tracking-tight">
              Conversations
            </h1>
            <p className="text-[11px] font-medium text-[#5E3122]/60">
              {chats === null
                ? "Loading..."
                : unreadConversations > 0
                  ? `${unreadConversations} unread conversation${
                      unreadConversations === 1 ? "" : "s"
                    }`
                  : "All caught up"}
            </p>
          </div>
          <NewChatDropdownButton />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/40" />
          <input
            type="text"
            aria-label="Search conversations"
            placeholder="Search conversations..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1D4533]/5 border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div
          role="tablist"
          aria-label="Conversation filters"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-1.5 custom-scrollbar">
        {isInitialLoading &&
          Array.from({ length: 5 }).map((_, i) => <ChatRowSkeleton key={i} />)}

        {chats === null && error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={reload}
              className="underline shrink-0 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {chats !== null && rows.length === 0 && (
          <div className="mt-4 p-6 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
            {emptyText ?? (
              <>
                No conversations yet.{" "}
                <Link
                  href="/friends"
                  className="font-bold text-[#1D4533] underline"
                >
                  Message a friend
                </Link>{" "}
                to start one.
              </>
            )}
          </div>
        )}

        {rows.map(({ chat, preview }) => {
          const isSelected = selectedChatId === chat.id;

          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelectChat(chat.id)}
              aria-current={isSelected ? "true" : undefined}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border-l-4 ${
                isSelected
                  ? "bg-[#F9D2BA]/40 border-[#1D4533] shadow-sm"
                  : "hover:bg-[#1D4533]/5 border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {chat.type === "GROUP" ? (
                  <GroupAvatar
                    name={chat.name}
                    avatar={chat.avatar}
                    className="w-11 h-11 rounded-2xl"
                    iconClassName="w-5 h-5"
                  />
                ) : (
                  <UserAvatar
                    name={chat.name}
                    avatar={chat.avatar}
                    className="w-11 h-11 rounded-2xl"
                    textClassName="text-xs"
                  />
                )}
                {chat.type === "DIRECT" && chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full" />
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-[#1D4533] truncate mb-0.5">
                  {chat.name}
                </h3>
                <p className="text-[11px] text-[#5E3122]/70 truncate font-medium">
                  {preview}
                </p>
              </div>

              {/* Time, icons aur unread badge */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-medium text-[#5E3122]/60">
                  {formatChatTime(chat.lastMessageAt)}
                </span>
                <div className="flex items-center gap-1 h-4">
                  {chat.isMuted && (
                    <BellOff
                      aria-label="Muted"
                      className="w-3 h-3 text-[#5E3122]/50"
                    />
                  )}
                  {chat.isPinned && (
                    <Pin
                      aria-label="Pinned"
                      className="w-3 h-3 text-[#5E3122]/50"
                    />
                  )}
                  {chat.unreadCount > 0 && (
                    <span
                      aria-label={`${chat.unreadCount} unread messages`}
                      className={`min-w-4 h-4 px-1 rounded-full font-bold text-[9px] flex items-center justify-center ${
                        chat.isMuted
                          ? "bg-[#5E3122]/40 text-[#F7EAE0]"
                          : "bg-[#1D4533] text-[#F9D2BA]"
                      }`}
                    >
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}