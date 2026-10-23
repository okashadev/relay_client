"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BellOff,
  Loader2,
  MoreVertical,
  Pin,
  Plus,
  Search,
} from "lucide-react";
import ChatActionSheet from "@/components/chats/shared/ChatActionSheet";
import GroupAvatar from "@/components/common/GroupAvatar";
import UserAvatar from "@/components/common/UserAvatar";
import { useChatList } from "@/hooks/useChatList";
import { formatChatTime } from "@/lib/format";
import { typingLabel } from "@/lib/chat/typing";
import { usePresenceStore } from "@/store/presenceStore";
import { useTypingStore } from "@/store/typingStore";
import type { ChatPreview } from "@/types/chat";
import NewChatDropdownButton from "../chats/NewChatDropdownButton";
import { useChatSearch } from "@/hooks/useChatSearch";
import EmojiText from "@/components/chats/shared/EmojiText";

type FilterTab = "All" | "Direct" | "Groups" | "Archive";

const filterTabs: FilterTab[] = ["All", "Direct", "Groups", "Archive"];

const previewText = (chat: ChatPreview) => {
  const last = chat.lastMessage;
  if (!last) return `say hello 👋`;

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

function ChatRow({
  chat,
  preview,
  isSelected,
  onSelect,
  onOpenMenu,
}: {
  chat: ChatPreview;
  preview: string;
  isSelected: boolean;
  onSelect: () => void;
  onOpenMenu: () => void;
}) {
  const typers = useTypingStore((state) => state.byConversation[chat.id]);
  const livePresence = usePresenceStore((state) =>
    chat.otherUserId ? state.byUser[chat.otherUserId] : undefined,
  );

  const isOnline =
    chat.type === "DIRECT" &&
    !chat.isBlocked &&
    (livePresence ? livePresence.status === "ONLINE" : chat.isOnline);

  const isTyping = Boolean(typers && typers.length > 0);

  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const clearPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startPress = () => {
    clearPress();
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      longPressed.current = true;
      onOpenMenu();
    }, 450);
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          onSelect();
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          onOpenMenu();
        }}
        onTouchStart={startPress}
        onTouchEnd={clearPress}
        onTouchMove={clearPress}
        onTouchCancel={clearPress}
        aria-current={isSelected ? "true" : undefined}
        className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border-l-4 [-webkit-touch-callout:none] ${
          isSelected
            ? "bg-[#F9D2BA]/40 border-[#1D4533] shadow-sm"
            : "hover:bg-[#1D4533]/5 border-transparent"
        }`}
      >
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
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-[#1D4533] truncate mb-0.5">
            {chat.name}
          </h3>
          <p
            className={`text-[11px] truncate font-medium ${
              isTyping ? "text-emerald-600" : "text-[#5E3122]/70"
            }`}
          >
            {isTyping && typers ? (
              typingLabel(typers, chat.type)
            ) : (
              <EmojiText text={preview} size="1.2em" />
            )}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {chat.lastMessage && (
            <span className="text-[10px] font-medium text-[#5E3122]/60">
              {formatChatTime(chat.lastMessageAt)}
            </span>
          )}
          <div className="flex items-center gap-1 h-4">
            {chat.isMuted && (
              <BellOff
                aria-label="Muted"
                className="w-3 h-3 text-[#5E3122]/50"
              />
            )}
            {chat.isPinned && (
              <Pin aria-label="Pinned" className="w-3 h-3 text-[#5E3122]/50" />
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

      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={`Options for ${chat.name}`}
        title="Options"
        className="absolute right-2 top-2 w-7 h-7 rounded-full bg-[#F7EAE0] border border-[#1D4533]/15 shadow-sm text-[#1D4533] items-center justify-center cursor-pointer hidden [@media(hover:hover)]:flex opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ChatList({
  selectedChatId,
  onSelectChat,
  onChatRemoved,
}: {
  selectedChatId?: string;
  onSelectChat: (id: string) => void;
  onChatRemoved?: (id: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { chats, error, reload } = useChatList();
  const search = useChatSearch(searchQuery);

  const isInitialLoading = chats === null && !error;
  const isSearchLoading =
    search.active && search.results === null && !search.error;
  const hasSearchError = search.active && search.error !== null;

  const menuChat = useMemo(
    () => chats?.find((chat) => chat.id === menuChatId) ?? null,
    [chats, menuChatId],
  );

  const unreadConversations = useMemo(
    () =>
      (chats ?? []).filter((chat) => !chat.isArchived && chat.unreadCount > 0)
        .length,
    [chats],
  );

  const rows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let source: ChatPreview[];

    if (search.active) {
      if (!search.results) return [];

      const live = new Map((chats ?? []).map((chat) => [chat.id, chat]));

      source = search.results.map((chat) => {
        const fresh = live.get(chat.id);
        if (fresh) return fresh;

        return chats === null
          ? chat
          : { ...chat, lastMessage: null, unreadCount: 0 };
      });
    } else {
      if (!chats) return [];
      source = chats;
    }

    return source
      .filter((chat) => {
        if (activeFilter === "Archive") return chat.isArchived;
        if (chat.isArchived && !search.active) return false;
        if (activeFilter === "Direct") return chat.type === "DIRECT";
        if (activeFilter === "Groups") return chat.type === "GROUP";
        return true;
      })
      .map((chat) => ({ chat, preview: previewText(chat) }))
      .filter(
        ({ chat, preview }) =>
          search.active ||
          !query ||
          chat.name.toLowerCase().includes(query) ||
          preview.toLowerCase().includes(query),
      )
      .sort(
        (a, b) =>
          Number(b.chat.isPinned) - Number(a.chat.isPinned) ||
          Date.parse(b.chat.lastMessageAt) - Date.parse(a.chat.lastMessageAt),
      );
  }, [chats, search.active, search.results, activeFilter, searchQuery]);

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

  const showEmpty =
    chats !== null && rows.length === 0 && !isSearchLoading && !hasSearchError;

  return (
    <div className="w-full h-full bg-[#F7EAE0] md:border-r border-[#1D4533]/10 flex flex-col select-none">
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

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/40" />
          <input
            type="text"
            aria-label="Search conversations"
            placeholder="Search by name or username..."
            autoComplete="off"
            maxLength={50}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#1D4533]/5 border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
          />
          {isSearchLoading && (
            <Loader2
              aria-label="Searching"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#5E3122]/40"
            />
          )}
        </div>

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

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-1.5 custom-scrollbar">
        {(isInitialLoading || isSearchLoading) &&
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

        {hasSearchError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
            <span>{search.error}</span>
            <button
              type="button"
              onClick={search.reload}
              className="underline shrink-0 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {showEmpty && (
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

        {rows.map(({ chat, preview }) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            preview={preview}
            isSelected={selectedChatId === chat.id}
            onSelect={() => onSelectChat(chat.id)}
            onOpenMenu={() => {
              setMenuChatId(chat.id);
              setMenuOpen(true);
            }}
          />
        ))}
      </div>

      <ChatActionSheet
        chat={menuChat}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onDeleted={onChatRemoved}
      />
    </div>
  );
}
