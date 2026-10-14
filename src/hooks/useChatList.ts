"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getConversations } from "@/lib/ChatApi";
import { useChatListStore } from "@/store/chatListStore";

const STALE_AFTER_MS = 30_000;

export function useChatList() {
  const chats = useChatListStore((state) => state.chats);
  const setChats = useChatListStore((state) => state.setChats);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const lastFetchedAt = useRef(0);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setError(null);

    try {
      const result = await getConversations(controller.signal);
      setChats(result);
      lastFetchedAt.current = Date.now();
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }, [setChats]);

  useEffect(() => {
    load();

    const refreshIfStale = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetchedAt.current > STALE_AFTER_MS
      ) {
        load();
      }
    };

    document.addEventListener("visibilitychange", refreshIfStale);
    window.addEventListener("focus", refreshIfStale);

    return () => {
      document.removeEventListener("visibilitychange", refreshIfStale);
      window.removeEventListener("focus", refreshIfStale);
      controllerRef.current?.abort();
    };
  }, [load]);

  return { chats, error, reload: load };
}