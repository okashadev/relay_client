"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, ArrowLeft, RefreshCw } from "lucide-react";
import {
  acceptFriendRequest,
  fetchSuggestions,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
  type FriendUser,
} from "@/lib/friendsApi";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserAvatar from "../common/UserAvatar";
import RelationshipAction from "./RelationshipAction";
import { useNotificationStore } from "@/store/notificationStore";
import { ApiError } from "@/lib/apiRequest";

function UserSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm animate-pulse">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
          <div className="h-2.5 w-20 rounded bg-[#1D4533]/10" />
        </div>
      </div>
      <div className="h-9 w-28 rounded-2xl bg-[#1D4533]/10" />
    </div>
  );
}

const SUGGESTIONS_LIMIT = 4;
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

interface AddFriendScreenProps {
  onBack: () => void;
}

export default function AddFriendScreen({ onBack }: AddFriendScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  const [reloadKey, setReloadKey] = useState(0);

  const [cancelTarget, setCancelTarget] = useState<FriendUser | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [actingIds, setActingIds] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<FriendUser | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const refreshUnread = useNotificationStore((state) => state.refresh);

  const trimmed = searchQuery.trim();
  const isSearching = trimmed !== "";
  const isTooShort = isSearching && trimmed.length < MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (isTooShort) {
      setUsers([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(
      async () => {
        setIsLoading(true);
        setError(null);

        try {
          const result = isSearching
            ? await searchUsers(trimmed, controller.signal)
            : await fetchSuggestions(SUGGESTIONS_LIMIT, controller.signal);

          setUsers(result);
        } catch (err) {
          if (controller.signal.aborted) return;
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        } finally {
          if (!controller.signal.aborted) setIsLoading(false);
        }
      },
      isSearching ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, isSearching, isTooShort, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const updateUser = (userId: string, changes: Partial<FriendUser>) =>
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, ...changes } : user)),
    );

  const handleSendRequest = async (userId: string) => {
    if (sendingIds.has(userId)) return;

    setSendingIds((prev) => new Set(prev).add(userId));

    try {
      const { relationship, friendshipId } = await sendFriendRequest(userId);

      updateUser(userId, { relationship, friendshipId });

      toast.success(
        relationship === "FRIENDS"
          ? "You are now friends!"
          : "Friend request sent.",
      );
    } catch (err: any) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send request",
      );
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const openCancelDialog = (user: FriendUser) => {
    setCancelTarget(user);
    setIsCancelOpen(true);
  };

  const handleAccept = async (user: FriendUser) => {
    if (!user.friendshipId || actingIds.has(user.id)) return;

    setActingIds((prev) => new Set(prev).add(user.id));

    try {
      const { relationship } = await acceptFriendRequest(user.friendshipId);
      updateUser(user.id, { relationship });
      toast.success(`You and ${user.name} are now friends.`);
      refreshUnread();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        updateUser(user.id, { relationship: "NONE", friendshipId: null });
        toast.info("This request is no longer available.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not accept the request",
        );
      }
    } finally {
      setActingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  const openRejectDialog = (user: FriendUser) => {
    setRejectTarget(user);
    setIsRejectOpen(true);
  };

  const closeRejectDialog = () => {
    if (!isRejecting) setIsRejectOpen(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget?.friendshipId || isRejecting) return;

    const target = rejectTarget;
    setIsRejecting(true);

    try {
      const { relationship, friendshipId } = await rejectFriendRequest(
        target.friendshipId!,
      );

      updateUser(target.id, { relationship, friendshipId });

      if (relationship === "FRIENDS") {
        toast.info("You are already friends.");
      } else {
        toast.success("Friend request rejected.");
      }

      setIsRejectOpen(false);
      refreshUnread();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not reject the request",
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const heading = isSearching
    ? `Search Results (${users.length})`
    : `Suggested For You (${users.length})`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col h-full min-w-0 p-6 lg:p-8 overflow-y-auto bg-[#F7EAE0]"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#1D4533]/10">
        <button
          onClick={onBack}
          className="p-2.5 bg-white border border-[#1D4533]/15 rounded-2xl text-[#1D4533] hover:bg-[#1D4533]/5 transition-all shadow-sm cursor-pointer flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft size={16} />
          <span>Back to Friends</span>
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-[#1D4533] tracking-tight">
            Add New Friends
          </h1>
          <p className="text-xs text-[#1D4533]/70 font-medium">
            Discover and connect with developers across the network.
          </p>
        </div>
      </div>

      {/* Search & Suggestions Content */}
      <div className="py-6 max-w-2xl w-full space-y-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4533]/50"
          />
          <input
            type="text"
            aria-label="Search people by name or username"
            placeholder="Search by name or username"
            autoComplete="off"
            maxLength={50}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 border border-[#1D4533]/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 shadow-sm font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-[#1D4533]/70 uppercase tracking-wider">
              {isTooShort ? "Search" : heading}
            </h3>
            {searchQuery.trim() === "" && (
              <button
                type="button"
                onClick={reload}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#1D4533] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <RefreshCw
                  size={13}
                  className={isLoading ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
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

          <div
            aria-live="polite"
            className={`space-y-3 transition-opacity ${
              isLoading && users.length > 0 ? "opacity-60" : "opacity-100"
            }`}
          >
            {isTooShort && (
              <div className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
                Type at least {MIN_SEARCH_LENGTH} characters to search.
              </div>
            )}

            {isLoading &&
              users.length === 0 &&
              Array.from({ length: 3 }).map((_, i) => <UserSkeleton key={i} />)}

            {!isLoading && !error && !isTooShort && users.length === 0 && (
              <div className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
                {isSearching
                  ? "No users found matching that search."
                  : "No suggestions right now. Check back later."}
              </div>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <UserAvatar name={user.name} avatar={user.avatar} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#1D4533] truncate">
                      {user.name}
                    </h4>
                    <p className="text-[11px] text-[#1D4533]/70 font-medium truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-[11px] text-[#1D4533]/60 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <RelationshipAction
                    relationship={user.relationship}
                    isSending={sendingIds.has(user.id)}
                    isActing={actingIds.has(user.id)}
                    onAdd={() => handleSendRequest(user.id)}
                    onCancel={() => openCancelDialog(user)}
                    onAccept={() => handleAccept(user)}
                    onReject={() => openRejectDialog(user)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isRejectOpen}
        title="Reject friend request?"
        description={
          rejectTarget
            ? `${rejectTarget.name} (@${rejectTarget.username}) won't be told. They can send a new request later.`
            : ""
        }
        confirmLabel="Reject"
        cancelLabel="Keep"
        isLoading={isRejecting}
        onConfirm={handleConfirmReject}
        onClose={closeRejectDialog}
      />
    </motion.div>
  );
}
