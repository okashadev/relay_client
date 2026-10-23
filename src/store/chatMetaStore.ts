import { create } from "zustand";
import type { ConversationMeState } from "@/types/chat";

type ChatMetaState = {
  me: Record<string, ConversationMeState>;
  blocked: Record<string, boolean>;
  setMe: (conversationId: string, me: ConversationMeState) => void;
  setBlocked: (userId: string, blocked: boolean) => void;
};

export const useChatMetaStore = create<ChatMetaState>((set) => ({
  me: {},
  blocked: {},
  setMe: (conversationId, me) =>
    set((state) => ({ me: { ...state.me, [conversationId]: me } })),
  setBlocked: (userId, blocked) =>
    set((state) => ({ blocked: { ...state.blocked, [userId]: blocked } })),
}));