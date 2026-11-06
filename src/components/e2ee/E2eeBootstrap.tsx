"use client";

import { useEffect, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { clearDeviceId } from "@/lib/device";
import { DeviceKeyMismatchError, initE2ee } from "@/lib/e2ee/session";
import { useAuthStore } from "@/store/authStore";
import { useE2eeStore } from "@/store/e2eeStore";

export default function E2eeBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const status = useE2eeStore((state) => state.status);
  const error = useE2eeStore((state) => state.error);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const store = useE2eeStore.getState();

    store.set({ status: "loading", error: null });

    initE2ee(userId)
      .then((result) => {
        if (!cancelled) store.set({ ...result, status: "ready", error: null });
      })
      .catch(async (err) => {
        if (cancelled) return;

        if (err instanceof DeviceKeyMismatchError) {
          clearDeviceId();
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          }).catch(() => undefined);
          window.location.assign("/login");
          return;
        }

        store.set({
          status: "error",
          error: err instanceof Error ? err.message : "Something went wrong.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  if (status === "ready") return <>{children}</>;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F7EAE0] p-4">
      {status === "loading" ? (
        <Loader2 className="w-6 h-6 animate-spin text-[#1D4533]" />
      ) : (
        <div className="w-full max-w-sm p-6 bg-white border border-[#1D4533]/15 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center">
            <LockKeyhole size={22} />
          </div>
          <p className="text-xs font-bold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold cursor-pointer hover:bg-[#1D4533]/90"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
