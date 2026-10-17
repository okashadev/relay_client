"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import type { DeleteDialogConfig } from "@/hooks/useChatSession";

export default function DeleteMessageDialog({
  canDeleteEveryone,
  onConfirm,
  onClose,
}: DeleteDialogConfig) {
  const [busy, setBusy] = useState<"me" | "everyone" | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const run = async (scope: "me" | "everyone") => {
    setBusy(scope);

    try {
      await onConfirm(scope);
    } finally {
      setBusy(null);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-message-title"
      onClick={() => {
        if (!busy) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D4533]/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#F7EAE0] border border-[#1D4533]/15 rounded-3xl p-6 shadow-2xl shadow-[#1D4533]/20"
      >
        <h2
          id="delete-message-title"
          className="text-lg font-black text-[#1D4533] tracking-tight"
        >
          Delete message?
        </h2>
        <p className="mt-2 text-xs text-[#1D4533]/70 font-medium leading-relaxed">
          {canDeleteEveryone
            ? "Delete for me removes it only from your chat. Delete for everyone removes it for all members, and they'll see that it was deleted."
            : "This removes the message only from your chat. Other members will still see it."}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {canDeleteEveryone && (
            <button
              type="button"
              onClick={() => run("everyone")}
              disabled={busy !== null}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {busy === "everyone" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Delete for everyone"
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => run("me")}
            disabled={busy !== null}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {busy === "me" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Delete for me"
            )}
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={busy !== null}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white border border-[#1D4533]/15 text-[#1D4533] hover:bg-[#1D4533]/5 transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}