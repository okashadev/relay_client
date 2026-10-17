"use client";

import { useEffect } from "react";
import { markConversationRead } from "@/lib/api/ChatApi";
import { useChatListStore } from "@/store/chatListStore";

export function useAutoMarkRead(
  conversationId: string,
  ready: boolean,
  lastIncomingId: string | null,
) {
  const markRead = useChatListStore((state) => state.markRead);

  useEffect(() => {
    if (!ready) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (document.visibilityState !== "visible") return;

      markRead(conversationId);
      markConversationRead(conversationId).catch(() => {});
    };

    timer = setTimeout(run, 300);

    const onVisible = () => {
      clearTimeout(timer);
      run();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [conversationId, ready, lastIncomingId, markRead]);
}