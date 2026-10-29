"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { ApiError } from "@/lib/api/apiRequest";
import { getConversation } from "@/lib/api/ChatApi";
import {
  SOCKET_EVENTS,
  type GroupUpdatedPayload,
} from "@/lib/socket/socketEvents";
import type { ConversationDetails } from "@/types/chat";

type DetailsStatus = "loading" | "ready" | "not-found" | "error";

const isGone = (error: unknown) =>
  error instanceof ApiError && (error.status === 404 || error.status === 400);

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
        setStatus(isGone(error) ? "not-found" : "error");
      });

    return () => controller.abort();
  }, [conversationId, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const refresh = useCallback(async () => {
    try {
      const data = await getConversation(conversationId);
      setConversation(data.conversation);
      setStatus("ready");
    } catch (error) {
      if (isGone(error)) setStatus("not-found");
    }
  }, [conversationId]);

  useSocketEvent<GroupUpdatedPayload>(
    SOCKET_EVENTS.GROUP_UPDATED,
    ({ conversationId: id }) => {
      if (id === conversationId) void refresh();
    },
  );

  return { conversation, status, reload, refresh };
}