"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export default function NotificationsSync() {
  const refresh = useNotificationStore((state) => state.refresh);

  useEffect(() => {
    refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return null;
}