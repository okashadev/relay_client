"use client";

import { useChatMetaStore } from "@/store/chatMetaStore";
import type { ConversationMeState } from "@/types/chat";

export function useChatMeta(
  conversation: { id: string; me: ConversationMeState; blockedByMe: boolean },
  otherUserId: string | null,
) {
  const me =
    useChatMetaStore((state) => state.me[conversation.id]) ?? conversation.me;
  const blockedByMe =
    useChatMetaStore((state) =>
      otherUserId ? state.blocked[otherUserId] : undefined,
    ) ?? conversation.blockedByMe;

  return { me, blockedByMe };
}