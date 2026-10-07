"use client";

import { useNotificationStore } from "@/store/notificationStore";

type NotificationBadgeProps = {
  source?: "unread" | "requests";
  className?: string;
};

export default function NotificationBadge({
  source = "unread",
  className = "",
}: NotificationBadgeProps) {
  const count = useNotificationStore((state) =>
    source === "requests" ? state.pendingRequestCount : state.unreadCount,
  );

  if (count <= 0) return null;

  const label =
    source === "requests"
      ? `${count} pending friend requests`
      : `${count} unread notifications`;

  const tone =
    source === "requests"
      ? "bg-[#1D4533] text-[#F7EAE0]"
      : "bg-rose-500 text-white";

  return (
    <span
      aria-label={label}
      className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${tone} ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}