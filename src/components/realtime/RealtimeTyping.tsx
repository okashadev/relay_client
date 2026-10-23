"use client";

import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  SOCKET_EVENTS,
  type MessageNewPayload,
  type TypingUpdatedPayload,
} from "@/lib/socket/socketEvents";
import { useTypingStore } from "@/store/typingStore";

export default function RealtimeTyping() {
  useSocketEvent<TypingUpdatedPayload>(
    SOCKET_EVENTS.TYPING_UPDATED,
    ({ conversationId, userId, name, isTyping }) =>
      useTypingStore
        .getState()
        .setTyping(conversationId, { userId, name }, isTyping),
  );

  useSocketEvent<MessageNewPayload>(
    SOCKET_EVENTS.MESSAGE_NEW,
    ({ conversationId, message }) => {
      if (message.senderId) {
        useTypingStore
          .getState()
          .setTyping(
            conversationId,
            { userId: message.senderId, name: "" },
            false,
          );
      }
    },
  );

  useSocketEvent<void>("disconnect", () =>
    useTypingStore.getState().clearAll(),
  );

  return null;
}
