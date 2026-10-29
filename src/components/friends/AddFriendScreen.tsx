"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Search, ArrowLeft, RefreshCw, X } from "lucide-react";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  fetchSuggestions,
  rejectFriendRequest,
  searchUsers,
  sendFriendRequest,
} from "@/lib/api/friendsApi";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserAvatar from "../common/UserAvatar";
import RelationshipAction from "./RelationshipAction";
import { useNotificationStore } from "@/store/notificationStore";
import { ApiError } from "@/lib/api/apiRequest";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  type FriendshipUpdatedPayload,
  SOCKET_EVENTS,
} from "@/lib/socket/socketEvents";
import type { FriendUser } from "@/types/friends";

function UserSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm animate-pulse"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
          <div className="h-2.5 w-20 rounded bg-[#1D4533]/10" />
        </div>
      </div>
      <div className="h-10 w-28 rounded-2xl bg-[#1D4533]/10" />
    </li>
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

  const reduceMotion = useReducedMotion() ?? false;
  const slide = reduceMotion ? 0 : 20;

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

  useSocketEvent<FriendshipUpdatedPayload>(
    SOCKET_EVENTS.FRIENDSHIP_UPDATED,
    ({ userId, relationship, friendshipId }) => {
      updateUser(userId, {
        relationship,
        friendshipId: relationship === "NONE" ? null : friendshipId,
      });
    },
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
    } catch (err) {
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

  const closeCancelDialog = () => {
    if (!isCancelling) setIsCancelOpen(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget || isCancelling) return;

    const target = cancelTarget;

    if (!target.friendshipId) {
      updateUser(target.id, { relationship: "NONE" });
      setIsCancelOpen(false);
      return;
    }

    setIsCancelling(true);

    try {
      const { relationship, friendshipId } = await cancelFriendRequest(
        target.friendshipId,
      );

      updateUser(target.id, { relationship, friendshipId });

      if (relationship === "FRIENDS") {
        toast.info("They already accepted your request.");
      } else {
        toast.success("Friend request cancelled.");
      }

      setIsCancelOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        updateUser(target.id, { relationship: "NONE", friendshipId: null });
        toast.info("This request is no longer available.");
        setIsCancelOpen(false);
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not cancel the request",
        );
      }
    } finally {
      setIsCancelling(false);
    }
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
    const requestId = rejectTarget.friendshipId;
    setIsRejecting(true);

    try {
      const { relationship, friendshipId } =
        await rejectFriendRequest(requestId);

      updateUser(target.id, { relationship, friendshipId });

      if (relationship === "FRIENDS") {
        toast.info("You are already friends.");
      } else {
        toast.success("Friend request rejected.");
      }

      setIsRejectOpen(false);
      refreshUnread();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        updateUser(target.id, { relationship: "NONE", friendshipId: null });
        toast.info("This request is no longer available.");
        setIsRejectOpen(false);
        refreshUnread();
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not reject the request",
        );
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const countLabel =
    isLoading && users.length === 0 ? "" : ` (${users.length})`;
  const heading = `${isSearching ? "Search Results" : "Suggested For You"}${countLabel}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: slide }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: slide }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col h-full min-w-0 bg-[#F7EAE0] overflow-y-auto overscroll-contain custom-scrollbar"
    >
      {/* Header with Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3 sticky top-0 z-10 bg-[#F7EAE0]/95 backdrop-blur border-b border-[#1D4533]/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to friends"
            title="Back to friends"
            className="w-9 h-9 rounded-xl bg-white border border-[#1D4533]/15 text-[#1D4533] shadow-sm flex items-center justify-center cursor-pointer transition-all hover:bg-[#1D4533]/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-black text-[#1D4533] tracking-tight">
              Add Friends
            </h1>
            <p className="text-[11px] font-medium text-[#5E3122]/60 truncate">
              Discover and connect with friends and family.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Suggestions Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-2xl w-full space-y-5">
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
            enterKeyHint="search"
            maxLength={50}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/90 border border-[#1D4533]/15 rounded-2xl pl-10 pr-10 py-3 text-base md:text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 shadow-sm font-medium"
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

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase">
              {isTooShort ? "Search" : heading}
            </h2>
            {!isSearching && (
              <button
                type="button"
                onClick={reload}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#1D4533] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer transition-all"
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

          {isTooShort && (
            <div className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
              Type at least {MIN_SEARCH_LENGTH} characters to search.
            </div>
          )}

          {!isLoading && !error && !isTooShort && users.length === 0 && (
            <div className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
              {isSearching
                ? "No users found matching that search."
                : "No suggestions right now. Check back later."}
            </div>
          )}

          <ul
            aria-live="polite"
            className={`space-y-3 pb-6 transition-opacity ${
              isLoading && users.length > 0 ? "opacity-60" : "opacity-100"
            }`}
          >
            {isLoading &&
              users.length === 0 &&
              !isTooShort &&
              Array.from({ length: 3 }).map((_, i) => <UserSkeleton key={i} />)}

            {users.map((user, index) => (
              <motion.li
                key={user.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: reduceMotion ? 0 : Math.min(index, 8) * 0.03,
                }}
                className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm transition-shadow [@media(hover:hover)]:hover:shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <UserAvatar name={user.name} avatar={user.avatar} />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#1D4533] truncate">
                      {user.name}
                    </h3>
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
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <ConfirmDialog
        open={isCancelOpen}
        title="Cancel friend request?"
        description={
          cancelTarget
            ? `Your request to ${cancelTarget.name} (@${cancelTarget.username}) will be withdrawn. You can send a new request later.`
            : ""
        }
        confirmLabel="Cancel Request"
        cancelLabel="Keep Request"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={closeCancelDialog}
      />
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
