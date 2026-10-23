"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  blockUser,
  deleteChat,
  unblockUser,
  updateChatSettings,
  type ChatSettingsPatch,
} from "@/lib/api/ChatApi";
import {
  applyBlockState,
  applyChatRemoved,
  applyConversationSettings,
} from "@/lib/chat/chatState";
import { syncPresence } from "@/lib/presenceSync";

const fail = (error: unknown, fallback: string) => {
  toast.error(error instanceof Error ? error.message : fallback);
  return false;
};

export function useChatActions() {
  const updateSettings = useCallback(
    async (conversationId: string, patch: ChatSettingsPatch) => {
      try {
        const { me } = await updateChatSettings(conversationId, patch);
        applyConversationSettings(conversationId, me);
        return true;
      } catch (error) {
        return fail(error, "Couldn't update the chat.");
      }
    },
    [],
  );

  const block = useCallback(async (userId: string) => {
    try {
      await blockUser(userId);
      applyBlockState(userId, true);
      toast.success("Contact blocked.");
      return true;
    } catch (error) {
      return fail(error, "Couldn't block this contact.");
    }
  }, []);

  const unblock = useCallback(async (userId: string) => {
    try {
      await unblockUser(userId);
      applyBlockState(userId, false);
      void syncPresence();
      toast.success("Contact unblocked.");
      return true;
    } catch (error) {
      return fail(error, "Couldn't unblock this contact.");
    }
  }, []);

  const clearChat = useCallback(async (conversationId: string) => {
    try {
      await deleteChat(conversationId);
      applyChatRemoved(conversationId);
      toast.success("Chat deleted.");
      return true;
    } catch (error) {
      return fail(error, "Couldn't delete the chat.");
    }
  }, []);

  return { updateSettings, block, unblock, clearChat };
}
