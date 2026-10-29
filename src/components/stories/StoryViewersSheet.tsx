"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import type { StoryViewersResult } from "@/lib/api/storyApi";
import { formatDayLabel, formatMessageTime } from "@/lib/format";

type SheetState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & StoryViewersResult);

export default function StoryViewersSheet({
  storyId,
  initialCount,
  load,
  onClose,
}: {
  storyId: string;
  initialCount: number;
  load: (storyId: string) => Promise<StoryViewersResult>;
  onClose: () => void;
}) {
  const [state, setState] = useState<SheetState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading" });

    load(storyId)
      .then((result) => {
        if (!cancelled) setState({ status: "ready", ...result });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Something went wrong.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [storyId, load, attempt]);

  const count = state.status === "ready" ? state.viewCount : initialCount;

  return (
    <div
      className="absolute inset-0 z-30 flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Story views"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[70%] flex flex-col rounded-t-3xl bg-[#F7EAE0] pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#1D4533]/10 shrink-0">
          <h2 className="text-sm font-black text-[#1D4533]">Views ({count})</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close views"
            className="w-8 h-8 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2">
          {state.status === "loading" && (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#1D4533]" />
            </div>
          )}

          {state.status === "error" && (
            <div className="m-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
              <span>{state.message}</span>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="underline shrink-0 cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {state.status === "ready" && state.viewers.length === 0 && (
            <p className="p-6 text-center text-xs font-medium text-[#1D4533]/70">
              No views yet.
            </p>
          )}

          {state.status === "ready" && state.viewers.length > 0 && (
            <>
              <ul>
                {state.viewers.map(({ user, viewedAt }) => (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl"
                  >
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      className="w-10 h-10 rounded-full"
                      textClassName="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1D4533] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#1D4533]/60 truncate">
                        {formatDayLabel(viewedAt)}, {formatMessageTime(viewedAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {state.viewCount > state.viewers.length && (
                <p className="px-3 py-2 text-center text-[11px] text-[#1D4533]/60">
                  Showing the latest {state.viewers.length} views
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}