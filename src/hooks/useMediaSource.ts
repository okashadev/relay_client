"use client";

import { useEffect, useState } from "react";
import { loadDecryptedUrl } from "@/lib/e2ee/media";
import type { MessagePayload } from "@/types/e2ee";

type Source = {
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  payload?: MessagePayload | null;
  decryptFailed?: boolean;
};

export function useMediaSource(
  item: Source,
  variant: "thumb" | "full" | "auto",
  enabled = true,
) {
  const useThumb =
    variant === "thumb" ||
    (variant === "auto" && Boolean(item.thumbnailUrl && item.payload?.thumb));

  const url = useThumb ? item.thumbnailUrl : item.mediaUrl;
  const meta = useThumb ? item.payload?.thumb : item.payload?.file;
  const key = meta?.key;
  const mime = meta?.mime;

  const local = url?.startsWith("blob:") ? url : null;
  const id = url && key ? `${url}|${key}` : null;

  const [loaded, setLoaded] = useState<{ id: string; src: string } | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || local || !id || !url || !key || !mime) return;

    let cancelled = false;

    loadDecryptedUrl(url, key, mime)
      .then((src) => !cancelled && setLoaded({ id, src }))
      .catch(() => !cancelled && setFailedId(id));

    return () => {
      cancelled = true;
    };
  }, [enabled, local, id, url, key, mime]);

  return {
    src: local ?? loaded?.src ?? null,
    loading: enabled && !local && id !== null && loaded?.id !== id && failedId !== id,
    failed: failedId === id || Boolean(item.decryptFailed),
  };
}