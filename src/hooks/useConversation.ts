"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/apiRequest";
import { getConversation } from "@/lib/api/ChatApi";
import type { ConversationDetails } from "@/types/chat";

type DetailsStatus = "loading" | "ready" | "not-found" | "error";

export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<ConversationDetails | null>(
    null,
  );
  const [status, setStatus] = useState<DetailsStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");

    getConversation(conversationId, controller.signal)
      .then((data) => {
        setConversation(data.conversation);
        setStatus("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;

        const notFound =
          error instanceof ApiError &&
          (error.status === 404 || error.status === 400);

        setStatus(notFound ? "not-found" : "error");
      });

    return () => controller.abort();
  }, [conversationId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { conversation, status, reload };
}
