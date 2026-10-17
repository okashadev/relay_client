"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import type { Receipts } from "@/types/chat";
import { maxIso } from "@/lib/chat/receipts";
import {
  type ReceiptsUpdatedPayload,
  SOCKET_EVENTS,
} from "@/lib/socket/socketEvents";
import { getConversation } from "@/lib/api/ChatApi";

const NONE: Receipts = { deliveredUpTo: null, readUpTo: null };

export function useReceipts(conversationId: string, initial: Receipts | null) {
  const [live, setLive] = useState<Receipts>(NONE);
  const wasDisconnected = useRef(false);

  const merge = useCallback(
    (incoming: Receipts) =>
      setLive((previous) => ({
        deliveredUpTo: maxIso(previous.deliveredUpTo, incoming.deliveredUpTo),
        readUpTo: maxIso(previous.readUpTo, incoming.readUpTo),
      })),
    [],
  );

  useSocketEvent<ReceiptsUpdatedPayload>(
    SOCKET_EVENTS.RECEIPTS_UPDATED,
    (payload) => {
      if (payload.conversationId === conversationId) merge(payload);
    },
  );

  useSocketEvent<void>("disconnect", () => {
    wasDisconnected.current = true;
  });

  useSocketEvent<void>("connect", () => {
    if (!wasDisconnected.current) return;
    wasDisconnected.current = false;

    getConversation(conversationId)
      .then(({ conversation }) => merge(conversation.receipts))
      .catch(() => {});
  });

  return useMemo<Receipts>(
    () => ({
      deliveredUpTo: maxIso(initial?.deliveredUpTo ?? null, live.deliveredUpTo),
      readUpTo: maxIso(initial?.readUpTo ?? null, live.readUpTo),
    }),
    [initial, live],
  );
}
