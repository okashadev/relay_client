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
import { MessagePayload } from "@/types/e2ee";
import { hydrateMessage } from "@/lib/e2ee/hydrate";
import { getKeyForEpoch } from "@/lib/e2ee/chatKeys";
import { encryptPayload } from "@/lib/e2ee/primitives";

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
      const current =
        message.reactions.find((item) => item.reactedByMe)?.emoji ?? null;
      const removing = current === emoji;

      replaceMessage({
        ...message,
        reactions: applyMyReaction(
          message.reactions,
          current,
          removing ? null : emoji,
        ),
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

  const edit = useCallback(
    async (message: ChatMessage, text: string) => {
      const epoch = message.keyEpoch;
      if (!epoch) throw new Error("This message can't be edited.");

      const key = await getKeyForEpoch(conversationId, epoch);
      const payload: MessagePayload = {
        ...(message.payload ?? { v: 1 }),
        text: text || undefined,
      };

      const { message: updated } = await editMessage(
        conversationId,
        message.id,
        {
          ciphertext: encryptPayload(key, conversationId, epoch, payload),
          keyEpoch: epoch,
        },
      );

      replaceMessage(await hydrateMessage(conversationId, updated));
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
