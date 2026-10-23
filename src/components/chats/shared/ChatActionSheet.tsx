"use client";

import MessageActionSheet from "@/components/chats/shared/MessageActionSheet";
import { useChatMenu } from "@/hooks/useChatMenu";
import type { ChatPreview } from "@/types/chat";

export default function ChatActionSheet({
  chat,
  open,
  onClose,
  onDeleted,
}: {
  chat: ChatPreview | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: (conversationId: string) => void;
}) {
  const menu = useChatMenu({
    conversationId: chat?.id ?? "",
    isPinned: chat?.isPinned ?? false,
    isMuted: chat?.isMuted ?? false,
    isArchived: chat?.isArchived ?? false,
    direct:
      chat && chat.type === "DIRECT" && chat.otherUserId
        ? { userId: chat.otherUserId, name: chat.name, blocked: chat.isBlocked }
        : null,
    onDeleted: () => {
      if (chat) onDeleted?.(chat.id);
    },
  });

  return (
    <>
      {open && chat && (
        <MessageActionSheet
          onClose={onClose}
          myReaction={null}
          actions={menu.actions}
        />
      )}
      {menu.dialogs}
    </>
  );
}