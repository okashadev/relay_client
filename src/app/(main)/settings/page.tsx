"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { useChatActions } from "@/hooks/useChatActions";
import { getBlockedUsers } from "@/lib/api/ChatApi";
import type { BlockedUser } from "@/types/chat";

export default function SettingsPage() {
  const { unblock } = useChatActions();
  const [users, setUsers] = useState<BlockedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getBlockedUsers(controller.signal)
      .then(setUsers)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => controller.abort();
  }, []);

  const handleUnblock = async (id: string) => {
    setBusyId(id);

    if (await unblock(id)) {
      setUsers((prev) => prev?.filter((user) => user.id !== id) ?? prev);
    }

    setBusyId(null);
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F7EAE0] p-6 lg:p-8">
      <h1 className="text-2xl font-black text-[#1D4533] tracking-tight">
        Settings
      </h1>

      <section className="mt-6 max-w-2xl">
        <h2 className="text-xs font-extrabold text-[#1D4533]/70 uppercase tracking-wider mb-3">
          Blocked contacts
        </h2>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {users === null && !error && (
          <Loader2 className="w-5 h-5 animate-spin text-[#1D4533]" />
        )}

        {users?.length === 0 && (
          <p className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
            You haven&apos;t blocked anyone.
          </p>
        )}

        <ul className="space-y-3">
          {users?.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between gap-3 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <UserAvatar name={user.name} avatar={user.avatar} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1D4533] truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[#1D4533]/70 font-medium truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUnblock(user.id)}
                disabled={busyId !== null}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-[#1D4533]/15 text-[#1D4533] hover:bg-[#1D4533]/5 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
              >
                {busyId === user.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Unblock"
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
