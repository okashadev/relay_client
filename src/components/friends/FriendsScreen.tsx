"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Bell,
  MessageSquare,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";
import AddFriendScreen from "./AddFriendScreen";
import Link from "next/link";
import NotificationBadge from "@/components/notifications/NotificationBadge";
import { fetchFriends, FriendUser } from "@/lib/friendsApi";
import UserAvatar from "../common/UserAvatar";

function FriendSkeleton() {
  return (
    <div className="bg-white border border-[#1D4533]/15 rounded-3xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
          <div className="h-2.5 w-20 rounded bg-[#1D4533]/10" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#1D4533]/10 flex justify-end">
        <div className="h-8 w-8 rounded-xl bg-[#1D4533]/10" />
      </div>
    </div>
  );
}

export default function FriendsScreen() {
  const [currentView, setCurrentView] = useState<"list" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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

  const query = searchQuery.trim().toLowerCase();

  const filteredFriends = query
    ? friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(query) ||
          friend.username.toLowerCase().includes(query),
      )
    : friends;

  if (currentView === "add") {
    return (
      <AddFriendScreen
        onBack={() => {
          setCurrentView("list");
          setReloadKey((key) => key + 1);
        }}
      />
    );
  }

  return (
    <div className="flex h-full w-full bg-[#F7EAE0] overflow-hidden select-none relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 p-6 lg:p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-[#1D4533]/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-[#1D4533] tracking-tight">
                Friends
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1D4533]/10 text-[#1D4533] text-xs font-bold">
                {friends.length} Active
              </span>
            </div>
            <p className="text-xs text-[#1D4533]/70 mt-0.5 font-medium">
              Manage your secure network connections and requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1D4533]/15 rounded-2xl shadow-sm text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Bell size={15} className="text-[#1D4533]" />
              <span className="hidden sm:inline">Requests</span>
              <NotificationBadge source="requests" />
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1D4533] text-[#F7EAE0] rounded-2xl shadow-md text-xs font-bold hover:bg-[#1D4533]/90 transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Add Friends</span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="py-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4533]/50"
            />
            <input
              type="text"
              aria-label="Search friends by name or username"
              placeholder="Search friends by name or username..."
              autoComplete="off"
              maxLength={50}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-[#1D4533]/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 shadow-sm font-medium"
            />
          </div>
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

        {/* Friends Grid List */}
        <div
          aria-live="polite"
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6 transition-opacity ${
            isLoading && friends.length > 0 ? "opacity-60" : "opacity-100"
          }`}
        >
          {isLoading &&
            friends.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => <FriendSkeleton key={i} />)}

          {filteredFriends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#1D4533]/15 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <UserAvatar name={friend.name} avatar={friend.avatar} />
                    <span
                      aria-label={
                        friend.status === "ONLINE" ? "Online" : "Offline"
                      }
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        friend.status === "ONLINE"
                          ? "bg-emerald-500"
                          : "bg-[#1D4533]/30"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#1D4533] group-hover:underline flex items-center gap-1 min-w-0">
                      <span className="truncate">{friend.name}</span>
                      <ShieldCheck
                        size={13}
                        className="text-[#1D4533] shrink-0"
                      />
                    </h3>
                    <p className="text-xs text-[#1D4533]/70 font-medium truncate">
                      @{friend.username}
                    </p>
                  </div>
                </div>
                {/* TODO: unfriend / block menu yahan aayega */}
                <button
                  type="button"
                  aria-label="More options"
                  className="p-2 rounded-xl text-[#1D4533]/60 hover:bg-[#1D4533]/10 transition-all cursor-pointer shrink-0"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1D4533]/10 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#1D4533]/60 font-medium truncate">
                  {friend.bio || "No bio yet"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* TODO: chat banne ke baad yahan se conversation khulegi */}
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533] hover:text-[#F7EAE0] transition-all cursor-pointer"
                    title="Message"
                    aria-label={`Message ${friend.name}`}
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isLoading && !error && friends.length === 0 && (
          <div className="p-8 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center space-y-3">
            <p className="text-xs font-medium text-[#1D4533]/70">
              You don&apos;t have any friends yet. Find people to connect with.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView("add")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D4533] text-[#F7EAE0] rounded-2xl shadow-md text-xs font-bold hover:bg-[#1D4533]/90 transition-all cursor-pointer"
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
    </div>
  );
}
