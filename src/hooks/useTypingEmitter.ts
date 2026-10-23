"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket/socket";
import { CLIENT_EVENTS } from "@/lib/socket/socketEvents";

const REFRESH_MS = 3_000;
const IDLE_MS = 4_000;

export function useTypingEmitter(conversationId: string) {
  const typing = useRef(false);
  const lastSent = useRef(0);
  const idleTimer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;

    if (!typing.current) return;
    typing.current = false;

    const socket = getSocket();
    if (socket.connected)
      socket.emit(CLIENT_EVENTS.TYPING_STOP, { conversationId });
  }, [conversationId]);

  const notify = useCallback(() => {
    const socket = getSocket();
    if (!socket.connected) return;

    const now = Date.now();

    if (!typing.current || now - lastSent.current >= REFRESH_MS) {
      socket.emit(CLIENT_EVENTS.TYPING_START, { conversationId });
      lastSent.current = now;
      typing.current = true;
    }

    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(stop, IDLE_MS);
  }, [conversationId, stop]);

  useEffect(() => stop, [stop]);

  return { notify, stop };
}
