"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useStickToBottom<T extends HTMLElement>(
  dependency: unknown,
  forceKey?: unknown,
) {
  const scrollRef = useRef<T>(null);
  const stickRef = useRef(true);
  const forceRef = useRef(forceKey);
  const snapshotRef = useRef<{ height: number; top: number } | null>(null);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const capturePosition = useCallback(() => {
    const el = scrollRef.current;
    if (el) snapshotRef.current = { height: el.scrollHeight, top: el.scrollTop };
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (forceKey !== forceRef.current) {
      forceRef.current = forceKey;
      if (forceKey != null) stickRef.current = true;
    }

    const snapshot = snapshotRef.current;

    if (snapshot) {
      snapshotRef.current = null;
      el.scrollTop = el.scrollHeight - snapshot.height + snapshot.top;
      return;
    }

    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [dependency, forceKey]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      if (stickRef.current) el.scrollTop = el.scrollHeight;
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { scrollRef, onScroll, capturePosition };
}