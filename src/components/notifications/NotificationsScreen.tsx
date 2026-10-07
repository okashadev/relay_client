"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Check, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserAvatar from "@/components/common/UserAvatar";
import { ApiError } from "@/lib/apiRequest";
import { acceptFriendRequest, rejectFriendRequest } from "@/lib/friendsApi";
import {
  fetchNotifications,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/lib/notificationsApi";
import { timeAgo } from "@/lib/time";
import { useNotificationStore } from "@/store/notificationStore";

function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3.5 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-48 rounded bg-[#1D4533]/10" />
        <div className="h-2.5 w-24 rounded bg-[#1D4533]/10" />
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  isActing,
  onAccept,
  onReject,
}: {
  notification: NotificationItem;
  isActing: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { actor, type, friendship } = notification;

  let message: React.ReactNode;

  switch (type) {
    case "FRIEND_REQUEST":
      message = (
        <>
          <span className="font-bold">{actor.name}</span> sent you a friend
          request
        </>
      );
      break;
    case "FRIEND_ACCEPTED":
      message = (
        <>
          <span className="font-bold">{actor.name}</span> accepted your friend
          request
        </>
      );
      break;
    default:
      message = <>You have a new notification</>;
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 p-4 border rounded-3xl shadow-sm ${
        notification.isRead
          ? "bg-white border-[#1D4533]/15"
          : "bg-white border-[#1D4533]/40 ring-1 ring-[#1D4533]/10"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <UserAvatar name={actor.name} avatar={actor.avatar} />
          {!notification.isRead && (
            <span
              aria-label="New"
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#1D4533] leading-snug">{message}</p>
          <p className="text-[11px] text-[#1D4533]/60 font-medium truncate">
            @{actor.username} • {timeAgo(notification.createdAt)}
          </p>
        </div>
      </div>

      {type === "FRIEND_REQUEST" && friendship?.status === "PENDING" && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onAccept}
            disabled={isActing}
            aria-label={`Accept friend request from ${actor.name}`}
            className="px-3.5 py-2.5 rounded-2xl bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isActing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Check size={14} /> Accept
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isActing}
            aria-label={`Reject friend request from ${actor.name}`}
            title="Reject"
            className="p-2.5 rounded-2xl bg-white border border-[#1D4533]/15 text-rose-600 hover:bg-rose-50 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {type === "FRIEND_REQUEST" && friendship?.status === "ACCEPTED" && (
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 text-xs font-bold shrink-0">
          Friends
        </span>
      )}
    </div>
  );
}

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [actingIds, setActingIds] = useState<Set<string>>(new Set());

  const [rejectTarget, setRejectTarget] = useState<NotificationItem | null>(
    null,
  );
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const refreshUnread = useNotificationStore((state) => state.refresh);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const page = await fetchNotifications({ signal: controller.signal });

        setItems(page.items);
        setNextCursor(page.nextCursor);

        if (page.items.some((item) => !item.isRead)) {
          markAllNotificationsRead()
            .then(() => setUnreadCount(0))
            .catch(() => {});
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [reloadKey, setUnreadCount]);

  const reload = () => setReloadKey((key) => key + 1);

  const setActing = (id: string, acting: boolean) =>
    setActingIds((prev) => {
      const next = new Set(prev);
      if (acting) next.add(id);
      else next.delete(id);
      return next;
    });

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const page = await fetchNotifications({ cursor: nextCursor });

      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.filter((item) => !seen.has(item.id))];
      });
      setNextCursor(page.nextCursor);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not load more notifications",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAccept = async (notification: NotificationItem) => {
    const friendshipId = notification.friendship?.id;
    if (!friendshipId || actingIds.has(notification.id)) return;

    setActing(notification.id, true);

    try {
      await acceptFriendRequest(friendshipId);

      setItems((prev) =>
        prev.map((item) =>
          item.id === notification.id && item.friendship
            ? {
                ...item,
                friendship: { ...item.friendship, status: "ACCEPTED" },
              }
            : item,
        ),
      );

      toast.success(`You and ${notification.actor.name} are now friends.`);
      refreshUnread();
    } catch (err) {
      // Bhejne wale ne beech mein request wapas le li
      if (err instanceof ApiError && err.status === 404) {
        removeItem(notification.id);
        toast.info("This request is no longer available.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not accept the request",
        );
      }
    } finally {
      setActing(notification.id, false);
    }
  };

  const openRejectDialog = (notification: NotificationItem) => {
    setRejectTarget(notification);
    setIsRejectOpen(true);
  };

  const closeRejectDialog = () => {
    if (!isRejecting) setIsRejectOpen(false);
  };

  const handleConfirmReject = async () => {
    const friendshipId = rejectTarget?.friendship?.id;
    if (!rejectTarget || !friendshipId || isRejecting) return;

    const target = rejectTarget;
    setIsRejecting(true);

    try {
      const { relationship } = await rejectFriendRequest(friendshipId);

      if (relationship === "FRIENDS") {
        setItems((prev) =>
          prev.map((item) =>
            item.id === target.id && item.friendship
              ? {
                  ...item,
                  friendship: { ...item.friendship, status: "ACCEPTED" },
                }
              : item,
          ),
        );
        toast.info("You are already friends.");
      } else {
        removeItem(target.id);
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col h-full min-w-0 p-6 lg:p-8 overflow-y-auto bg-[#F7EAE0]"
    >
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#1D4533]/10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-black text-[#1D4533] tracking-tight">
              Notifications
            </h1>
            <p className="text-xs text-[#1D4533]/70 font-medium">
              Friend requests and updates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reload}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#1D4533] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="py-6 w-full space-y-3">
        {error && (
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

        {isLoading &&
          items.length === 0 &&
          Array.from({ length: 3 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}

        {!isLoading && !error && items.length === 0 && (
          <div className="p-8 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center space-y-2">
            <Bell size={22} className="mx-auto text-[#1D4533]/40" />
            <p className="text-xs font-medium text-[#1D4533]/70">
              You&apos;re all caught up. New friend requests will show up here.
            </p>
          </div>
        )}

        <div
          aria-live="polite"
          className={`space-y-3 transition-opacity ${
            isLoading && items.length > 0 ? "opacity-60" : "opacity-100"
          }`}
        >
          {items.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isActing={actingIds.has(notification.id)}
              onAccept={() => handleAccept(notification)}
              onReject={() => openRejectDialog(notification)}
            />
          ))}
        </div>

        {nextCursor && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-white border border-[#1D4533]/15 text-[#1D4533] hover:bg-[#1D4533]/5 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            >
              {isLoadingMore ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isRejectOpen}
        title="Reject friend request?"
        description={
          rejectTarget
            ? `${rejectTarget.actor.name} (@${rejectTarget.actor.username}) won't be told. They can send a new request later.`
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
