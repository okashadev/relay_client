"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { updateChatSettings, type ChatSettingsPatch } from "@/lib/api/ChatApi";
import { useChatListStore } from "@/store/chatListStore";
import type { ConversationMeState } from "@/types/chat";

export function useChatSettings(conversationId: string, initial: ConversationMeState) {
  const [me, setMe] = useState(initial);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const update = useCallback(
    async (patch: ChatSettingsPatch) => {
      if (inFlight.current) return;

      inFlight.current = true;
      setBusy(true);

      try {
        const result = await updateChatSettings(conversationId, patch);

        setMe(result.me);
        useChatListStore.getState().updateSettings(conversationId, {
          isPinned: result.me.isPinned,
          isMuted: result.me.isMuted,
          isArchived: result.me.isArchived,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't update the chat.");
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [conversationId],
  );

  return { me, busy, update };
}