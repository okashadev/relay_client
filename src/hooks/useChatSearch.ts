"use client";

import { useCallback, useEffect, useState } from "react";
import { searchChats } from "@/lib/api/ChatApi";
import type { ChatPreview } from "@/types/chat";

const MIN_LENGTH = 2;
const DEBOUNCE_MS = 300;

type SearchState = {
  query: string;
  chats: ChatPreview[] | null;
  error: string | null;
};

export function useChatSearch(rawQuery: string) {
  const query = rawQuery.trim();
  const active = query.length >= MIN_LENGTH;

  const [state, setState] = useState<SearchState | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!active) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const chats = await searchChats(query, controller.signal);
        setState({ query, chats, error: null });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          query,
          chats: null,
          error: err instanceof Error ? err.message : "Search failed.",
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, query, reloadKey]);

  const current = active && state?.query === query ? state : null;

  const reload = useCallback(() => {
    setState(null);
    setReloadKey((key) => key + 1);
  }, []);

  return {
    active,
    results: current?.chats ?? null,
    error: current?.error ?? null,
    reload,
  };
}
