"use client";

import { formatLastSeen } from "@/lib/format";
import { usePresenceStore } from "@/store/presenceStore";
import type { PresenceInfo } from "@/types/chat";

export function usePresence(
  userId: string | null | undefined,
  fallback: PresenceInfo | null,
): PresenceInfo | null {
  const live = usePresenceStore((state) =>
    userId ? state.byUser[userId] : undefined,
  );

  return live ?? fallback;
}

export const presenceLabel = (presence: PresenceInfo | null) =>
  presence?.status === "ONLINE"
    ? "Online"
    : formatLastSeen(presence?.lastSeen ?? null);