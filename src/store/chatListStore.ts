import { create } from "zustand";
import type { ChatMessage, ChatPreview, ChatPreviewMessage } from "@/types/chat";

type MessageUpdate = {
  lastMessage: ChatPreviewMessage;
  lastMessageAt: string;
  incrementUnread: boolean;
};

type ChatSettings = Pick<ChatPreview, "isPinned" | "isMuted" | "isArchived">;

type ChatListState = {
  // null: abhi tak load nahi hui
  chats: ChatPreview[] | null;
  // Badhne par useChatList list dobara mangwata hai
  version: number;
  setChats: (chats: ChatPreview[]) => void;
  markRead: (conversationId: string) => void;
  // true: handle ho gaya (ya list abhi load nahi hui). false: ye chat list mein hai hi nahi
  applyMessage: (conversationId: string, update: MessageUpdate) => boolean;
  // Edit ya delete: agar ye wohi aakhri message hai to preview badlo
  applyMessageUpdate: (conversationId: string, message: ChatMessage) => void;
  updateSettings: (conversationId: string, settings: Partial<ChatSettings>) => void;
  invalidate: () => void;
};

export const useChatListStore = create<ChatListState>((set, get) => ({
  chats: null,
  version: 0,

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

  applyMessage: (conversationId, update) => {
    const { chats } = get();

    if (chats === null) return true;

    const current = chats.find((chat) => chat.id === conversationId);
    if (!current) return false;

    // Purana ya wohi message dobara aaye (echo, reconnect): unread double na ginay
    if (Date.parse(update.lastMessageAt) <= Date.parse(current.lastMessageAt)) {
      return true;
    }

    set({
      chats: chats.map((chat) =>
        chat.id === conversationId
          ? {
              ...chat,
              lastMessage: update.lastMessage,
              lastMessageAt: update.lastMessageAt,
              unreadCount: update.incrementUnread
                ? chat.unreadCount + 1
                : chat.unreadCount,
            }
          : chat,
      ),
    });

    return true;
  },

  applyMessageUpdate: (conversationId, message) =>
    set((state) => {
      if (!state.chats) return state;

      return {
        chats: state.chats.map((chat) =>
          chat.id === conversationId &&
          chat.lastMessage &&
          Date.parse(chat.lastMessageAt) === Date.parse(message.createdAt)
            ? {
                ...chat,
                lastMessage: {
                  ...chat.lastMessage,
                  content: message.content,
                  fileName: message.fileName,
                  deleted: message.deletedAt !== null,
                },
              }
            : chat,
        ),
      };
    }),

  updateSettings: (conversationId, settings) =>
    set((state) =>
      state.chats
        ? {
            chats: state.chats.map((chat) =>
              chat.id === conversationId ? { ...chat, ...settings } : chat,
            ),
          }
        : state,
    ),

  invalidate: () => set((state) => ({ version: state.version + 1 })),
}));