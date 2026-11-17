"use client";

import { useEffect, useRef } from "react";
import { evaluatePeer } from "@/lib/e2ee/trust";
import { useTrustStore, type TrustStatus } from "@/store/trustStore";

const RECHECK_MS = 30_000;

export function usePeerTrust(
  meId: string,
  peerId: string | null,
): TrustStatus | null {
  const status = useTrustStore((state) =>
    peerId ? state.byPeer[peerId] : undefined,
  );
  const lastRun = useRef(0);

  useEffect(() => {
    if (!peerId || !meId) return;

    let cancelled = false;

    const run = () => {
      lastRun.current = Date.now();
      evaluatePeer(meId, peerId).catch(() => {});
    };

    const onVisible = () => {
      if (
        !cancelled &&
        document.visibilityState === "visible" &&
        Date.now() - lastRun.current > RECHECK_MS
      ) {
        run();
      }
    };

    run();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [meId, peerId]);

  return status ?? null;
}
