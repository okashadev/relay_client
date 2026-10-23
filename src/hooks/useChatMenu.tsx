"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Ban,
  Bell,
  BellOff,
  Pin,
  PinOff,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { SheetAction } from "@/components/chats/shared/MessageActionSheet";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useChatActions } from "@/hooks/useChatActions";

type Pending = "delete" | "block" | null;

export type ChatMenuConfig = {
  conversationId: string;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  direct: { userId: string; name: string; blocked: boolean } | null;
  onDeleted?: () => void;
};

export function useChatMenu({
  conversationId,
  isPinned,
  isMuted,
  isArchived,
  direct,
  onDeleted,
}: ChatMenuConfig) {
  const { updateSettings, block, unblock, clearChat } = useChatActions();
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);

  const confirm = useCallback(
    async (action: () => Promise<boolean>, after?: () => void) => {
      setBusy(true);
      const ok = await action();
      setBusy(false);

      if (ok) {
        setPending(null);
        after?.();
      }
    },
    [],
  );

  const toggleMute = useCallback(
    () => updateSettings(conversationId, { mute: isMuted ? null : "forever" }),
    [updateSettings, conversationId, isMuted],
  );

  const requestDelete = useCallback(() => setPending("delete"), []);

  const requestBlock = useCallback(() => {
    if (!direct) return;
    if (direct.blocked) void unblock(direct.userId);
    else setPending("block");
  }, [direct, unblock]);

  const actions = useMemo<SheetAction[]>(() => {
    const set = (patch: Parameters<typeof updateSettings>[1]) => () =>
      void updateSettings(conversationId, patch);

    const list: SheetAction[] = [
      isPinned
        ? { key: "unpin", label: "Unpin chat", icon: PinOff, onSelect: set({ pinned: false }) }
        : { key: "pin", label: "Pin chat", icon: Pin, onSelect: set({ pinned: true }) },
      ...(isMuted
        ? [{ key: "unmute", label: "Unmute", icon: Bell, onSelect: set({ mute: null }) }]
        : [
            { key: "mute-8h", label: "Mute for 8 hours", icon: BellOff, onSelect: set({ mute: "8h" }) },
            { key: "mute-1w", label: "Mute for 1 week", icon: BellOff, onSelect: set({ mute: "1w" }) },
            { key: "mute-all", label: "Mute always", icon: BellOff, onSelect: set({ mute: "forever" }) },
          ]),
      isArchived
        ? { key: "unarchive", label: "Unarchive", icon: ArchiveRestore, onSelect: set({ archived: false }) }
        : { key: "archive", label: "Archive chat", icon: Archive, onSelect: set({ archived: true }) },
    ];

    if (direct) {
      list.push(
        direct.blocked
          ? {
              key: "unblock",
              label: `Unblock ${direct.name}`,
              icon: ShieldCheck,
              onSelect: () => void unblock(direct.userId),
            }
          : {
              key: "block",
              label: `Block ${direct.name}`,
              icon: Ban,
              danger: true,
              onSelect: () => setPending("block"),
            },
      );
    }

    list.push({
      key: "delete",
      label: "Delete chat",
      icon: Trash2,
      danger: true,
      onSelect: () => setPending("delete"),
    });

    return list;
  }, [conversationId, isPinned, isMuted, isArchived, direct, updateSettings, unblock]);

  const dialogs = (
    <>
      <ConfirmDialog
        open={pending === "delete"}
        title="Delete this chat?"
        description="All messages are removed from your side only. Others in this chat aren't affected, and the chat comes back if a new message arrives."
        confirmLabel="Delete chat"
        cancelLabel="Cancel"
        isLoading={busy}
        onConfirm={() =>
          void confirm(() => clearChat(conversationId), onDeleted)
        }
        onClose={() => {
          if (!busy) setPending(null);
        }}
      />
      <ConfirmDialog
        open={pending === "block" && direct !== null}
        title={`Block ${direct?.name ?? ""}?`}
        description="They won't be able to message you, and you won't see each other's online status or last seen. They won't be told. This also removes them from your friends. You can unblock them any time from Settings."
        confirmLabel="Block"
        cancelLabel="Cancel"
        isLoading={busy}
        onConfirm={() => {
          if (direct) void confirm(() => block(direct.userId));
        }}
        onClose={() => {
          if (!busy) setPending(null);
        }}
      />
    </>
  );

  return { actions, dialogs, toggleMute, requestDelete, requestBlock };
}