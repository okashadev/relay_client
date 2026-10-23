import { useChatListStore } from "@/store/chatListStore";
import { useChatMetaStore } from "@/store/chatMetaStore";
import { usePresenceStore } from "@/store/presenceStore";
import type { ConversationMeState } from "@/types/chat";

export const applyConversationSettings = (
  conversationId: string,
  me: ConversationMeState,
) => {
  useChatMetaStore.getState().setMe(conversationId, me);
  useChatListStore.getState().updateSettings(conversationId, {
    isPinned: me.isPinned,
    isMuted: me.isMuted,
    isArchived: me.isArchived,
  });
};

export const applyBlockState = (userId: string, blocked: boolean) => {
  useChatMetaStore.getState().setBlocked(userId, blocked);
  useChatListStore.getState().setBlockedForUser(userId, blocked);

  if (blocked) {
    usePresenceStore
      .getState()
      .set(userId, { status: "OFFLINE", lastSeen: null });
  }
};

export const applyChatRemoved = (conversationId: string) =>
  useChatListStore.getState().removeChat(conversationId);
