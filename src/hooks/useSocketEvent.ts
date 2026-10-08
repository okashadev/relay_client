"use client";

import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";

export function useSocketEvent<T>(
  event: string,
  handler: (payload: T) => void,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const socket = getSocket();
    const listener = (payload: T) => handlerRef.current(payload);

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
