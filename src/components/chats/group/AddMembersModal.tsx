"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "@/components/common/UserAvatar";
import { fetchFriends } from "@/lib/api/friendsApi";
import type { FriendUser } from "@/types/friends";

const MAX_GROUP_MEMBERS = 100;

export default function AddMembersModal({
  memberIds,
  onClose,
  onAdd,
}: {
  memberIds: Set<string>;
  onClose: () => void;
  onAdd: (ids: string[]) => Promise<boolean>;
}) {
  const [friends, setFriends] = useState<FriendUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setError(null);

    fetchFriends(controller.signal)
      .then(setFriends)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !adding) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [adding, onClose]);

  const candidates = useMemo(
    () => (friends ?? []).filter((friend) => !memberIds.has(friend.id)),
    [friends, memberIds],
  );

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();

    return text
      ? candidates.filter(
          (friend) =>
            friend.name.toLowerCase().includes(text) ||
            friend.username.toLowerCase().includes(text),
        )
      : candidates;
  }, [candidates, query]);

  const room = Math.max(0, MAX_GROUP_MEMBERS - memberIds.size);

  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else if (next.size >= room) {
        toast.info(`A group can have up to ${MAX_GROUP_MEMBERS} members.`);
      } else {
        next.add(id);
      }

      return next;
    });

  const handleAdd = async () => {
    if (selected.size === 0 || adding) return;

    setAdding(true);
    const ok = await onAdd([...selected]);
    setAdding(false);

    if (ok) onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add members"
      onClick={(event) => {
        if (event.target === event.currentTarget && !adding) onClose();
      }}
      className="fixed inset-x-0 top-0 z-50 app-height flex items-end md:items-center justify-center bg-[#1D4533]/40 md:p-6"
    >
      <div className="w-full md:max-w-md h-[88%] md:h-[min(640px,80dvh)] flex flex-col rounded-t-3xl md:rounded-3xl bg-[#F7EAE0] border border-[#1D4533]/15 shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#1D4533] tracking-tight">
              Add members
            </h2>
            <p className="text-[11px] font-medium text-[#5E3122]/60">
              Only your friends who aren&apos;t in this group yet
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={adding}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center cursor-pointer disabled:opacity-40 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4533]/50"
            />
            <input
              type="text"
              aria-label="Search friends"
              placeholder="Search friends..."
              autoComplete="off"
              maxLength={50}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/90 border border-[#1D4533]/15 rounded-2xl pl-10 pr-4 py-2.5 text-base md:text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 font-medium"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-2">
          {friends === null && !error && (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#1D4533]" />
            </div>
          )}

          {error && (
            <div className="m-1 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
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

          {friends !== null && candidates.length === 0 && (
            <p className="m-2 p-6 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
              {friends.length === 0
                ? "You don't have any friends to add yet."
                : "All your friends are already in this group."}
            </p>
          )}

          {friends !== null && candidates.length > 0 && visible.length === 0 && (
            <p className="p-6 text-center text-xs font-medium text-[#1D4533]/70">
              No friends match that search.
            </p>
          )}

          <ul>
            {visible.map((friend) => {
              const isSelected = selected.has(friend.id);

              return (
                <li key={friend.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggle(friend.id)}
                    disabled={adding}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-colors hover:bg-white/60 disabled:cursor-not-allowed"
                  >
                    <UserAvatar
                      name={friend.name}
                      avatar={friend.avatar}
                      className="w-10 h-10 rounded-2xl"
                      textClassName="text-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1D4533] truncate">
                        {friend.name}
                      </p>
                      <p className="text-[11px] text-[#1D4533]/60 truncate">
                        @{friend.username}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#1D4533] border-[#1D4533] text-[#F7EAE0]"
                          : "border-[#1D4533]/30"
                      }`}
                    >
                      {isSelected && <Check size={13} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 pb-4 border-t border-[#1D4533]/10 shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            disabled={selected.size === 0 || adding}
            className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <UserPlus size={15} />
            )}
            {selected.size > 0 ? `Add ${selected.size} to group` : "Select friends to add"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}