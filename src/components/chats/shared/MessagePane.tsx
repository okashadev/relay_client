"use client";

import { Loader2 } from "lucide-react";
import MessageList from "@/components/chats/shared/MessageList";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { useStickToBottom } from "@/hooks/useStickToBottom";

function MessagesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading messages"
      className="space-y-3 animate-pulse"
    >
      <div className="h-10 w-2/3 rounded-2xl bg-[#1D4533]/10" />
      <div className="h-14 w-1/2 rounded-2xl bg-[#1D4533]/10" />
      <div className="h-10 w-3/5 rounded-2xl bg-[#1D4533]/10 ml-auto" />
      <div className="h-10 w-2/5 rounded-2xl bg-[#1D4533]/10 ml-auto" />
      <div className="h-12 w-1/2 rounded-2xl bg-[#1D4533]/10" />
    </div>
  );
}

export default function MessagePane({
  state,
  meId,
  showSender = false,
  intro,
  footer,
}: {
  state: ConversationMessagesState;
  meId: string;
  showSender?: boolean;
  intro?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const {
    messages,
    status,
    error,
    hasMore,
    isLoadingOlder,
    olderError,
    loadOlder,
    reload,
  } = state;

  const last = messages[messages.length - 1];
  const ownKey =
    last && last.senderId === meId ? (last.clientId ?? last.id) : null;

  const { scrollRef, onScroll, capturePosition } =
    useStickToBottom<HTMLDivElement>(messages, ownKey);

  const handleLoadOlder = () => loadOlder(capturePosition);

  const handleScroll = () => {
    onScroll();

    const el = scrollRef.current;
    if (el && el.scrollTop < 120 && hasMore && !isLoadingOlder && !olderError) {
      handleLoadOlder();
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 custom-scrollbar"
    >
      {status === "loading" && <MessagesSkeleton />}

      {status === "error" && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="underline shrink-0 cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          {hasMore ? (
            <div className="flex justify-center pb-2">
              <button
                type="button"
                onClick={handleLoadOlder}
                disabled={isLoadingOlder}
                className="px-4 py-1.5 rounded-full bg-[#1D4533]/10 hover:bg-[#1D4533]/15 text-[11px] font-semibold text-[#1D4533] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isLoadingOlder ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : olderError ? (
                  "Couldn't load. Tap to retry"
                ) : (
                  "Load earlier messages"
                )}
              </button>
            </div>
          ) : (
            <>
              {intro}
              {messages.length === 0 && (
                <p className="text-center text-xs font-medium text-[#5E3122]/60 py-6">
                  No messages yet. Say hello!
                </p>
              )}
            </>
          )}

          <MessageList messages={messages} meId={meId} showSender={showSender} />

          {footer}
        </>
      )}
    </div>
  );
}