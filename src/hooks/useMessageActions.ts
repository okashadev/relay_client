"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import {
  deleteMessage,
  editMessage,
  removeReaction,
  setReaction,
} from "@/lib/api/ChatApi";
import { applyMyReaction } from "@/lib/chat/reactions";
import { useChatListStore } from "@/store/chatListStore";
import type { ChatMessage } from "@/types/chat";

export function useMessageActions({
  conversationId,
  state,
}: {
  conversationId: string;
  state: ConversationMessagesState;
}) {
  const { replaceMessage, removeMessageById } = state;

  const react = useCallback(
    async (message: ChatMessage, emoji: string) => {
      const current = message.reactions.find((item) => item.reactedByMe)?.emoji ?? null;
      const removing = current === emoji;

      replaceMessage({
        ...message,
        reactions: applyMyReaction(message.reactions, current, removing ? null : emoji),
      });

      try {
        const { message: updated } = removing
          ? await removeReaction(conversationId, message.id)
          : await setReaction(conversationId, message.id, emoji);

        replaceMessage(updated);
      } catch (error) {
        // Wapas pehle jaisa
        replaceMessage(message);
        toast.error(error instanceof Error ? error.message : "Couldn't react.");
      }
    },
    [conversationId, replaceMessage],
  );

  // Error caller ko jata hai: composer edit mode mein rehta hai
  const edit = useCallback(
    async (messageId: string, content: string) => {
      const { message } = await editMessage(conversationId, messageId, content);
      replaceMessage(message);
    },
    [conversationId, replaceMessage],
  );

  const remove = useCallback(
    async (message: ChatMessage, scope: "me" | "everyone") => {
      const result = await deleteMessage(conversationId, message.id, scope);

      if (scope === "me") removeMessageById(message.id);
      else if (result.message) replaceMessage(result.message);

      // Chat list ka preview aur unread server se sahi aaye
      useChatListStore.getState().invalidate();
    },
    [conversationId, replaceMessage, removeMessageById],
  );

  return { react, edit, remove };
}