"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { getMessages } from "@/lib/api/ChatApi";
import { isPendingMessage, mergeMessages } from "@/lib/chat/chatMessages";
import {
  type MessageRemovedPayload,
  type MessageUpdatedPayload,
  type MessageNewPayload,
  SOCKET_EVENTS,
  ConversationClearedPayload,
} from "@/lib/socket/socketEvents";
import type { ChatMessage } from "@/types/chat";

type LoadStatus = "loading" | "ready" | "error";

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

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
  const messagesRef = useRef<ChatMessage[]>([]);
  const replaceOnLoad = useRef(false);
  const wasDisconnected = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    setError(null);
    setOlderError(null);

    getMessages(conversationId, { signal: controller.signal })
      .then((page) => {
        const replace = replaceOnLoad.current;
        replaceOnLoad.current = false;

        setMessages((previous) =>
          mergeMessages(
            replace ? previous.filter(isPendingMessage) : previous,
            page.items,
          ),
        );
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

  const syncLatest = useCallback(async () => {
    try {
      const page = await getMessages(conversationId);
      const known = messagesRef.current;

      const overlaps = page.items.some((item) =>
        known.some((message) => message.id === item.id),
      );
      const hasConfirmed = known.some((message) => !isPendingMessage(message));

      if (!overlaps && hasConfirmed && page.nextCursor !== null) {
        replaceOnLoad.current = true;
        setReloadKey((key) => key + 1);
        return;
      }

      setMessages((previous) => mergeMessages(previous, page.items));
    } catch {}
  }, [conversationId]);

  const appendMessage = useCallback(
    (message: ChatMessage) => setMessages((previous) => [...previous, message]),
    [],
  );

  const updateMessage = useCallback(
    (clientId: string, updates: Partial<ChatMessage>) => {
      setMessages((previous) =>
        previous.map((message) =>
          message.clientId === clientId ? { ...message, ...updates } : message,
        ),
      );
    },
    [],
  );

  const upsertMessage = useCallback(
    (message: ChatMessage) =>
      setMessages((previous) => mergeMessages(previous, [message])),
    [],
  );

  const removeMessage = useCallback((clientId: string) => {
    setMessages((previous) =>
      previous.filter((message) => message.clientId !== clientId),
    );
  }, []);

  useSocketEvent<MessageNewPayload>(
    SOCKET_EVENTS.MESSAGE_NEW,
    ({ conversationId: id, message }) => {
      if (id === conversationId) upsertMessage(message);
    },
  );

  useSocketEvent<void>("disconnect", () => {
    wasDisconnected.current = true;
  });

  useSocketEvent<void>("connect", () => {
    if (!wasDisconnected.current) return;
    wasDisconnected.current = false;
    void syncLatest();
  });

  const replaceMessage = useCallback((message: ChatMessage) => {
    setMessages((previous) =>
      previous.map((existing) =>
        existing.id === message.id ? message : existing,
      ),
    );
  }, []);

  const removeMessageById = useCallback((messageId: string) => {
    setMessages((previous) =>
      previous.filter((message) => message.id !== messageId),
    );
  }, []);

  useSocketEvent<MessageUpdatedPayload>(
    SOCKET_EVENTS.MESSAGE_UPDATED,
    ({ conversationId: id, message }) => {
      if (id === conversationId) replaceMessage(message);
    },
  );

  useSocketEvent<MessageRemovedPayload>(
    SOCKET_EVENTS.MESSAGE_REMOVED,
    ({ conversationId: id, messageId }) => {
      if (id === conversationId) removeMessageById(messageId);
    },
  );

   useSocketEvent<ConversationClearedPayload>(
    SOCKET_EVENTS.CONVERSATION_CLEARED,
    ({ conversationId: id }) => {
      if (id !== conversationId) return;
      setMessages([]);
      setNextCursor(null);
    },
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
    updateMessage,
    upsertMessage,
    removeMessage,
    replaceMessage,
    removeMessageById,
  };
}

export type ConversationMessagesState = ReturnType<
  typeof useConversationMessages
>;
