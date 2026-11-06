"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMedia, type MediaKindFilter } from "@/lib/api/mediaApi";
import type { MediaItem } from "@/types/media";
import { hydrateMediaItems } from "@/lib/e2ee/hydrate";

type Feed = { key: string; items: MediaItem[]; nextCursor: string | null };

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

export function useMediaFeed(
  kind: MediaKindFilter,
  conversationId: string | null,
) {
  const key = `${kind}:${conversationId ?? "all"}`;

  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(
    null,
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const keyRef = useRef(key);
  const loadingRef = useRef(false);

  useEffect(() => {
    keyRef.current = key;
  });

  useEffect(() => {
    const controller = new AbortController();

    getMedia({ kind, conversationId }, controller.signal)
      .then(async (page) => {
        const items = await hydrateMediaItems(page.items);

        if (controller.signal.aborted) return;

        setFeed({ key, items, nextCursor: page.nextCursor });
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError({ key, message: toMessage(err) });
      });

    return () => controller.abort();
  }, [key, kind, conversationId, reloadKey]);

  const current = feed?.key === key ? feed : null;
  const currentError = error?.key === key ? error.message : null;

  const loadMore = useCallback(async () => {
    if (!current?.nextCursor || loadingRef.current) return;

    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const page = await getMedia({
        kind,
        conversationId,
        cursor: current.nextCursor,
      });

      const items = await hydrateMediaItems(page.items);

      if (keyRef.current !== key) return;

      setFeed((previous) => {
        if (!previous || previous.key !== key) return previous;

        const seen = new Set(previous.items.map((item) => item.id));

        return {
          key,
          items: [
            ...previous.items,
            ...items.filter((item) => !seen.has(item.id)),
          ],
          nextCursor: page.nextCursor,
        };
      });
    } catch (err) {
      setError({ key, message: toMessage(err) });
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [current, kind, conversationId, key]);

  const reload = useCallback(() => {
    setError(null);
    setReloadKey((value) => value + 1);
  }, []);

  const remove = useCallback((id: string) => {
    setFeed((previous) =>
      previous
        ? {
            ...previous,
            items: previous.items.filter((item) => item.id !== id),
          }
        : previous,
    );
  }, []);

  return {
    items: current?.items ?? [],
    isLoading: current === null && currentError === null,
    error: currentError,
    hasMore: Boolean(current?.nextCursor),
    loadingMore,
    loadMore,
    reload,
    remove,
  };
}
