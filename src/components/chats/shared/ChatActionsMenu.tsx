"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Bell,
  BellOff,
  MoreVertical,
  Pin,
  PinOff,
} from "lucide-react";
import type { ChatSettingsPatch } from "@/lib/api/ChatApi";
import type { ConversationMeState } from "@/types/chat";

export default function ChatActionsMenu({
  me,
  busy,
  onChange,
}: {
  me: ConversationMeState;
  busy: boolean;
  onChange: (patch: ChatSettingsPatch) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const items: {
    key: string;
    label: string;
    icon: typeof Pin;
    patch: ChatSettingsPatch;
  }[] = [
    me.isPinned
      ? { key: "unpin", label: "Unpin chat", icon: PinOff, patch: { pinned: false } }
      : { key: "pin", label: "Pin chat", icon: Pin, patch: { pinned: true } },
    ...(me.isMuted
      ? [{ key: "unmute", label: "Unmute", icon: Bell, patch: { mute: null } }]
      : [
          { key: "mute-8h", label: "Mute for 8 hours", icon: BellOff, patch: { mute: "8h" as const } },
          { key: "mute-1w", label: "Mute for 1 week", icon: BellOff, patch: { mute: "1w" as const } },
          { key: "mute-all", label: "Mute always", icon: BellOff, patch: { mute: "forever" as const } },
        ]),
    me.isArchived
      ? { key: "unarchive", label: "Unarchive", icon: ArchiveRestore, patch: { archived: false } }
      : { key: "archive", label: "Archive chat", icon: Archive, patch: { archived: true } },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Chat options"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Chat options"
        className="w-9 h-9 rounded-xl hover:bg-[#1D4533]/5 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-[#1D4533]/10 shadow-lg p-1.5 z-20"
          >
            {items.map(({ key, label, icon: Icon, patch }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  onChange(patch);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}