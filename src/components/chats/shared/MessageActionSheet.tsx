"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { QUICK_REACTIONS } from "@/lib/chat/reactions";

export type SheetAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onSelect: () => void;
};

export default function MessageActionSheet({
  onClose,
  myReaction,
  onReact,
  actions,
}: {
  onClose: () => void;
  myReaction: string | null;
  onReact?: (emoji: string) => void;
  actions: SheetAction[];
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Message options"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#1D4533]/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-3xl bg-[#F7EAE0] border border-[#1D4533]/15 shadow-2xl overflow-hidden"
      >
        {onReact && (
          <div className="flex items-center justify-between gap-1 p-3 border-b border-[#1D4533]/10">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`React with ${emoji}`}
                aria-pressed={myReaction === emoji}
                onClick={() => {
                  onReact(emoji);
                  onClose();
                }}
                className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  myReaction === emoji ? "bg-[#F9D2BA]" : "hover:bg-[#1D4533]/5"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <ul className="p-1.5">
          {actions.map(({ key, label, icon: Icon, danger, onSelect }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelect();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-left cursor-pointer hover:bg-[#1D4533]/5 ${
                  danger ? "text-rose-600" : "text-[#1D4533]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
