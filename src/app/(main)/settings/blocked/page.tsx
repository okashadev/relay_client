"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Info, Loader2, ShieldBan } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import SettingsShell from "@/components/settings/SettingsShell";
import { useChatActions } from "@/hooks/useChatActions";
import { getBlockedUsers } from "@/lib/api/ChatApi";
import type { BlockedUser } from "@/types/chat";

const formatBlockedDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function RowSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="flex items-center justify-between gap-3 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm animate-pulse"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
          <div className="h-2.5 w-20 rounded bg-[#1D4533]/10" />
        </div>
      </div>
      <div className="h-9 w-20 rounded-xl bg-[#1D4533]/10" />
    </li>
  );
}

export default function BlockedUsersPage() {
  const { unblock } = useChatActions();
  const reduceMotion = useReducedMotion() ?? false;

  const [users, setUsers] = useState<BlockedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setError(null);

    getBlockedUsers(controller.signal)
      .then(setUsers)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => controller.abort();
  }, [attempt]);

  const handleUnblock = async (id: string) => {
    if (busyId) return;
    setBusyId(id);

    if (await unblock(id)) {
      setUsers((prev) => prev?.filter((user) => user.id !== id) ?? prev);
    }

    setBusyId(null);
  };

  return (
    <SettingsShell
      title="Blocked contacts"
      subtitle="They can't message you or see your online status"
      backHref="/settings"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="underline shrink-0 cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {users === null && !error && (
        <ul aria-label="Loading blocked contacts" className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </ul>
      )}

      {users?.length === 0 && (
        <div className="p-8 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center">
            <ShieldBan size={22} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#1D4533]">
              No blocked contacts
            </p>
            <p className="text-xs font-medium text-[#5E3122]/70 mt-0.5">
              You haven&apos;t blocked anyone.
            </p>
          </div>
        </div>
      )}

      {users && users.length > 0 && (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {users.map((user) => (
              <motion.li
                key={user.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between gap-3 p-3.5 sm:p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <UserAvatar name={user.name} avatar={user.avatar} />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-[#1D4533] truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] font-medium text-[#5E3122]/70 truncate">
                      @{user.username} • Blocked {formatBlockedDate(user.blockedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleUnblock(user.id)}
                  disabled={busyId !== null}
                  className="h-10 min-w-24 px-4 rounded-2xl bg-white border border-[#1D4533]/25 text-[#1D4533] text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer transition-all hover:bg-[#1D4533] hover:text-[#F7EAE0] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {busyId === user.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {users !== null && (
        <p className="mt-5 px-1 flex items-start gap-2 text-[11px] font-medium text-[#5E3122]/60 leading-relaxed">
          <Info size={13} className="mt-0.5 shrink-0" />
          Blocking someone also removes them from your friends. Unblocking
          doesn&apos;t add them back.
        </p>
      )}
    </SettingsShell>
  );
}