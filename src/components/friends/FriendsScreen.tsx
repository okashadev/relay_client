"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  Loader2,
  MessageSquare,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AddFriendScreen from "./AddFriendScreen";
import NotificationBadge from "@/components/notifications/NotificationBadge";
import { fetchFriends } from "@/lib/api/friendsApi";
import UserAvatar from "../common/UserAvatar";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  type FriendshipUpdatedPayload,
  SOCKET_EVENTS,
} from "@/lib/socket/socketEvents";
import { newChat } from "@/lib/api/ChatApi";
import { usePresence } from "@/hooks/usePresence";
import { usePresenceStore } from "@/store/presenceStore";
import type { FriendUser } from "@/types/friends";

function FriendSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="bg-white border border-[#1D4533]/15 rounded-3xl p-4 sm:p-5 shadow-sm animate-pulse flex flex-col gap-4"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
          <div className="h-2.5 w-20 rounded bg-[#1D4533]/10" />
        </div>
      </div>
      <div className="pt-3 border-t border-[#1D4533]/10 flex items-center justify-between gap-3">
        <div className="h-2.5 w-24 rounded bg-[#1D4533]/10" />
        <div className="h-9 w-24 rounded-xl bg-[#1D4533]/10" />
      </div>
    </li>
  );
}

function OnlineCount({ friends }: { friends: FriendUser[] }) {
  const byUser = usePresenceStore((state) => state.byUser);

  const online = friends.filter(
    (friend) => (byUser[friend.id]?.status ?? friend.status) === "ONLINE",
  ).length;

  return <>{online} online</>;
}

function FriendCard({
  friend,
  index,
  reduceMotion,
  isOpening,
  isDisabled,
  onMessage,
}: {
  friend: FriendUser;
  index: number;
  reduceMotion: boolean;
  isOpening: boolean;
  isDisabled: boolean;
  onMessage: () => void;
}) {
  const presence = usePresence(friend.id, {
    status: friend.status,
    lastSeen: null,
  });
  const online = presence?.status === "ONLINE";

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: reduceMotion ? 0 : Math.min(index, 8) * 0.03,
      }}
      className="bg-white border border-[#1D4533]/15 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 transition-shadow [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:border-[#1D4533]/30"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <UserAvatar name={friend.name} avatar={friend.avatar} />
          <span
            aria-label={online ? "Online" : "Offline"}
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
              online ? "bg-emerald-500" : "bg-[#1D4533]/30"
            }`}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#1D4533] truncate">
            {friend.name}
          </h3>
          <p className="text-xs text-[#1D4533]/70 font-medium truncate">
            @{friend.username}
            {online && (
              <span className="font-bold text-emerald-600"> • Online</span>
            )}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#1D4533]/10 flex items-center justify-between gap-3">
        <span className="min-w-0 text-[11px] text-[#1D4533]/60 font-medium truncate">
          {friend.bio || "No bio yet"}
        </span>
        <button
          type="button"
          onClick={onMessage}
          disabled={isDisabled}
          title="Message"
          aria-label={`Message ${friend.name}`}
          className="h-9 min-w-24 px-3.5 rounded-xl bg-[#1D4533]/10 text-[#1D4533] text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all hover:bg-[#1D4533] hover:text-[#F7EAE0] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isOpening ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <MessageSquare size={14} /> Message
            </>
          )}
        </button>
      </div>
    </motion.li>
  );
}

export default function FriendsScreen() {
  const [currentView, setCurrentView] = useState<"list" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const slide = reduceMotion ? 0 : 20;

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        setFriends(await fetchFriends(controller.signal));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [reloadKey]);

  const openChat = async (otherUserId: string) => {
    if (!otherUserId || openingId) return;
    setOpeningId(otherUserId);

    try {
      const { success, conversation } = await newChat(otherUserId);
      if (!success || !conversation?.id) {
        throw new Error("Could not open the chat");
      }
      router.push(`/app/${conversation.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not open the chat",
      );
      setOpeningId(null);
    }
  };

  useSocketEvent<FriendshipUpdatedPayload>(
    SOCKET_EVENTS.FRIENDSHIP_UPDATED,
    ({ relationship }) => {
      if (relationship === "FRIENDS" || relationship === "NONE") {
        setReloadKey((key) => key + 1);
      }
    },
  );

  const query = searchQuery.trim().toLowerCase();

  const filteredFriends = query
    ? friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(query) ||
          friend.username.toLowerCase().includes(query),
      )
    : friends;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {currentView === "add" ? (
        <AddFriendScreen
          key="add"
          onBack={() => {
            setCurrentView("list");
            setReloadKey((key) => key + 1);
          }}
        />
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: -slide }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -slide }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0 h-full w-full bg-[#F7EAE0] overflow-y-auto overscroll-contain custom-scrollbar"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3 sticky top-0 z-10 bg-[#F7EAE0]/95 backdrop-blur border-b border-[#1D4533]/10">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl lg:text-3xl font-black text-[#1D4533] tracking-tight">
                  Friends
                </h1>
                <p className="text-[11px] font-medium text-[#5E3122]/60 truncate">
                  {friends.length > 0 && !error ? (
                    <>
                      {friends.length}{" "}
                      {friends.length === 1 ? "friend" : "friends"} •{" "}
                      <OnlineCount friends={friends} />
                    </>
                  ) : (
                    "Your people on Relay"
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/notifications"
                  aria-label="Friend requests"
                  title="Requests"
                  className="relative h-9 min-w-9 px-2.5 sm:px-4 rounded-xl bg-white border border-[#1D4533]/15 shadow-sm text-xs font-bold text-[#1D4533] flex items-center justify-center gap-2 transition-all hover:bg-[#1D4533]/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40"
                >
                  <Bell size={15} />
                  <span className="hidden sm:inline">Requests</span>
                  <NotificationBadge
                    source="requests"
                    className="absolute -top-1.5 -right-1.5 sm:static border-2 border-[#F7EAE0] sm:border-0"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setCurrentView("add")}
                  aria-label="Add friends"
                  title="Add friends"
                  className="h-9 min-w-9 px-2.5 sm:px-4 rounded-xl bg-[#1D4533] text-[#F7EAE0] shadow-md text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#1D4533]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40"
                >
                  <UserPlus size={15} />
                  <span className="hidden sm:inline">Add Friends</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-6xl mx-auto">
            {/* Search */}
            <div className="relative max-w-md mb-5">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4533]/50"
              />
              <input
                type="text"
                aria-label="Search friends by name or username"
                placeholder="Search friends by name or username..."
                autoComplete="off"
                enterKeyHint="search"
                maxLength={50}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-[#1D4533]/15 rounded-2xl pl-10 pr-10 py-3 text-base md:text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 shadow-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#1D4533]/50 hover:bg-[#1D4533]/10 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="underline shrink-0 cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {friends.length > 0 && (
              <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-3">
                {query
                  ? `Results (${filteredFriends.length})`
                  : "All friends"}
              </h2>
            )}

            {/* Friends Grid */}
            <ul
              aria-live="polite"
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-6 transition-opacity ${
                isLoading && friends.length > 0 ? "opacity-60" : "opacity-100"
              }`}
            >
              {isLoading &&
                friends.length === 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <FriendSkeleton key={i} />
                ))}

              {filteredFriends.map((friend, index) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  index={index}
                  reduceMotion={reduceMotion}
                  isOpening={openingId === friend.id}
                  isDisabled={openingId !== null}
                  onMessage={() => openChat(friend.id)}
                />
              ))}
            </ul>

            {!isLoading && !error && friends.length === 0 && (
              <div className="p-8 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center">
                  <Users size={22} />
                </div>
                <p className="text-xs font-medium text-[#1D4533]/70">
                  You don&apos;t have any friends yet. Find people to connect
                  with.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView("add")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D4533] text-[#F7EAE0] rounded-2xl shadow-md text-xs font-bold hover:bg-[#1D4533]/90 active:scale-95 transition-all cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>Add Friends</span>
                </button>
              </div>
            )}

            {!isLoading &&
              !error &&
              friends.length > 0 &&
              filteredFriends.length === 0 && (
                <div className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
                  No friends match that search.
                </div>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}