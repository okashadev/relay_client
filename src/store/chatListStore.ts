import { ChatPreview } from "@/types/chat";
import { create } from "zustand";

type ChatListState = {
  chats: ChatPreview[] | null;
  setChats: (chats: ChatPreview[]) => void;
  markRead: (conversationId: string) => void;
};

export const useChatListStore = create<ChatListState>((set) => ({
  chats: null,
  setChats: (chats) => set({ chats }),
  markRead: (conversationId) =>
    set((state) =>
      state.chats
        ? {
            chats: state.chats.map((chat) =>
              chat.id === conversationId && chat.unreadCount > 0
                ? { ...chat, unreadCount: 0 }
                : chat,
            ),
          }
        : state,
    ),
}));
