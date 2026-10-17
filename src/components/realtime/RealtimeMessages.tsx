"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  SOCKET_EVENTS,
  type MessageNewPayload,
  type MessageRemovedPayload,
  type MessageUpdatedPayload,
} from "@/lib/socket/socketEvents";
import { useAuthStore } from "@/store/authStore";
import { useChatListStore } from "@/store/chatListStore";

export default function RealtimeMessages() {
  const pathname = usePathname() ?? "";
  const meId = useAuthStore((state) => state.user?.id);
  const wasDisconnected = useRef(false);

  useSocketEvent<MessageNewPayload>(
    SOCKET_EVENTS.MESSAGE_NEW,
    ({ conversationId, message }, ack) => {
      ack?.();

      const chatList = useChatListStore.getState();

      const isMine = message.senderId === meId;
      const isViewing =
        pathname.split("/")[2] === conversationId &&
        document.visibilityState === "visible";

      const applied = chatList.applyMessage(conversationId, {
        lastMessage: {
          type: message.type,
          content: message.content,
          fileName: message.fileName,
          senderName: isMine ? null : (message.sender?.name ?? null),
          isMine,
          deleted: message.deletedAt !== null,
        },
        lastMessageAt: message.createdAt,
        incrementUnread: !isMine && message.type !== "SYSTEM" && !isViewing,
      });

      if (!applied) chatList.invalidate();
    },
  );

  useSocketEvent<MessageUpdatedPayload>(
    SOCKET_EVENTS.MESSAGE_UPDATED,
    ({ conversationId, message }) => {
      const chatList = useChatListStore.getState();

      chatList.applyMessageUpdate(conversationId, message);

      if (message.deletedAt) chatList.invalidate();
    },
  );

  useSocketEvent<MessageRemovedPayload>(SOCKET_EVENTS.MESSAGE_REMOVED, () => {
    useChatListStore.getState().invalidate();
  });

  useSocketEvent<void>("disconnect", () => {
    wasDisconnected.current = true;
  });

  useSocketEvent<void>("connect", () => {
    if (!wasDisconnected.current) return;
    wasDisconnected.current = false;
    useChatListStore.getState().invalidate();
  });

  return null;
}
