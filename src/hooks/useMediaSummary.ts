"use client";

import { useCallback, useEffect, useState } from "react";
import { getMediaSummary } from "@/lib/api/mediaApi";
import type { MediaChatSummary } from "@/types/media";

export function useMediaSummary() {
  const [chats, setChats] = useState<MediaChatSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getMediaSummary(controller.signal)
      .then((result) => {
        setChats(result);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  return { chats, error, reload };
}