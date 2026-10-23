"use client";

import { useEffect, useRef } from "react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { syncPresence } from "@/lib/presenceSync";
import { SOCKET_EVENTS, type PresenceUpdatedPayload } from "@/lib/socket/socketEvents";
import { usePresenceStore } from "@/store/presenceStore";

export default function PresenceSync() {
  const wasDisconnected = useRef(false);

  useEffect(() => {
    void syncPresence();
  }, []);

  useSocketEvent<PresenceUpdatedPayload>(
    SOCKET_EVENTS.PRESENCE_UPDATED,
    ({ userId, status, lastSeen }) =>
      usePresenceStore.getState().set(userId, { status, lastSeen }),
  );

  useSocketEvent<void>("disconnect", () => {
    wasDisconnected.current = true;
  });

  useSocketEvent<void>("connect", () => {
    if (!wasDisconnected.current) return;
    wasDisconnected.current = false;
    void syncPresence();
  });

  return null;
}