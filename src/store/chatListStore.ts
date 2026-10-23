import { create } from "zustand";
import type {
  ChatMessage,
  ChatPreview,
  ChatPreviewMessage,
} from "@/types/chat";

type MessageUpdate = {
  lastMessage: ChatPreviewMessage;
  lastMessageAt: string;
  incrementUnread: boolean;
};

type ChatSettings = Pick<ChatPreview, "isPinned" | "isMuted" | "isArchived">;

type ChatListState = {
  chats: ChatPreview[] | null;
  version: number;
  setChats: (chats: ChatPreview[]) => void;
  markRead: (conversationId: string) => void;
  applyMessage: (conversationId: string, update: MessageUpdate) => boolean;
  applyMessageUpdate: (conversationId: string, message: ChatMessage) => void;
  updateSettings: (
    conversationId: string,
    settings: Partial<ChatSettings>,
  ) => void;
  removeChat: (conversationId: string) => void;
  setBlockedForUser: (userId: string, blocked: boolean) => void;
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

  removeChat: (conversationId) =>
    set((state) =>
      state.chats
        ? { chats: state.chats.filter((chat) => chat.id !== conversationId) }
        : state,
    ),

  setBlockedForUser: (userId, blocked) =>
    set((state) =>
      state.chats
        ? {
            chats: state.chats.map((chat) =>
              chat.otherUserId === userId
                ? {
                    ...chat,
                    isBlocked: blocked,
                    isOnline: blocked ? false : chat.isOnline,
                  }
                : chat,
            ),
          }
        : state,
    ),

  invalidate: () => set((state) => ({ version: state.version + 1 })),
}));
