"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMessages } from "@/lib/ChatApi";
import type { ChatMessage } from "@/types/chat";

type LoadStatus = "loading" | "ready" | "error";

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

const isLocalOnly = (message: ChatMessage) =>
  message.clientId !== null && message.id === message.clientId;

export function useConversationMessages(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadingOlderRef = useRef(false);
  const olderController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    setError(null);
    setOlderError(null);

    getMessages(conversationId, { signal: controller.signal })
      .then((page) => {
        setMessages((previous) => [
          ...page.items,
          ...previous.filter(
            (message) =>
              isLocalOnly(message) &&
              !page.items.some((item) => item.clientId === message.clientId),
          ),
        ]);
        setNextCursor(page.nextCursor);
        setStatus("ready");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(toMessage(err));
        setStatus("error");
      });

    return () => {
      controller.abort();
      olderController.current?.abort();
    };
  }, [conversationId, reloadKey]);

  const loadOlder = useCallback(
    async (beforeApply?: () => void) => {
      if (!nextCursor || loadingOlderRef.current) return;

      loadingOlderRef.current = true;
      setIsLoadingOlder(true);
      setOlderError(null);

      const controller = new AbortController();
      olderController.current = controller;

      try {
        const page = await getMessages(conversationId, {
          cursor: nextCursor,
          signal: controller.signal,
        });

        beforeApply?.();

        setMessages((previous) => {
          const seen = new Set(previous.map((message) => message.id));
          return [
            ...page.items.filter((message) => !seen.has(message.id)),
            ...previous,
          ];
        });
        setNextCursor(page.nextCursor);
      } catch (err) {
        if (!controller.signal.aborted) setOlderError(toMessage(err));
      } finally {
        loadingOlderRef.current = false;
        setIsLoadingOlder(false);
      }
    },
    [conversationId, nextCursor],
  );

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const appendMessage = useCallback(
    (message: ChatMessage) => setMessages((previous) => [...previous, message]),
    [],
  );

  return {
    messages,
    status,
    error,
    hasMore: nextCursor !== null,
    isLoadingOlder,
    olderError,
    loadOlder,
    reload,
    appendMessage,
  };
}

export type ConversationMessagesState = ReturnType<
  typeof useConversationMessages
>;