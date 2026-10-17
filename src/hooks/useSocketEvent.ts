"use client";

import { getSocket } from "@/lib/socket/socket";
import { useEffect, useRef } from "react";

export function useSocketEvent<T>(
  event: string,
  handler: (payload: T, ack?: () => void) => void,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const socket = getSocket();
    const listener = (payload: T, ack?: () => void) =>
      handlerRef.current(payload, typeof ack === "function" ? ack : undefined);

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
