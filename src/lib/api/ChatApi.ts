import {
  BlockedUser,
  ChatMessage,
  ChatPreview,
  ConversationDetails,
  ConversationMeState,
  PresenceStatus,
} from "@/types/chat";
import { apiRequest } from "@/lib/api/apiRequest";

export type SendMessageBody =
  | {
      type: "TEXT";
      clientId: string;
      content: string;
      replyToId?: string | null;
    }
  | {
      type: "IMAGE" | "VIDEO";
      clientId: string;
      publicId: string;
      content?: string | null;
      replyToId?: string | null;
    }
  | {
      type: "VOICE";
      clientId: string;
      publicId: string;
      replyToId?: string | null;
    }
  | {
      type: "FILE";
      clientId: string;
      publicId: string;
      fileName: string;
      content?: string | null;
      replyToId?: string | null;
    };

type MessagesPage = {
  items: ChatMessage[];
  nextCursor: string | null;
};

export const newChat = async (otherUserId: string) =>
  apiRequest<{ success: boolean; conversation: any }>(
    "/api/conversation/direct/new-chat",
    {
      method: "POST",
      body: JSON.stringify({ otherUserId }),
    },
  );

export const getConversation = (conversationId: string, signal?: AbortSignal) =>
  apiRequest<{ conversation: ConversationDetails }>(
    `/api/conversation/${encodeURIComponent(conversationId)}`,
    { signal },
  );

export const getMessages = (
  conversationId: string,
  options: {
    cursor?: string | null;
    limit?: number;
    signal?: AbortSignal;
  } = {},
) => {
  const params = new URLSearchParams();
  params.set("limit", String(options.limit ?? 30));
  if (options.cursor) params.set("cursor", options.cursor);

  return apiRequest<MessagesPage>(
    `/api/conversation/${encodeURIComponent(conversationId)}/messages?${params}`,
    { signal: options.signal },
  );
};

export const getConversations = async (signal?: AbortSignal) => {
  const data = await apiRequest<{ chats: ChatPreview[] }>("/api/conversation", {
    signal,
  });
  return data.chats;
};

export const markConversationRead = (conversationId: string) =>
  apiRequest<{ lastReadAt: string }>(
    `/api/conversation/${encodeURIComponent(conversationId)}/read`,
    { method: "POST" },
  );

export const sendMessage = (
  conversationId: string,
  body: SendMessageBody,
  signal?: AbortSignal,
) =>
  apiRequest<{ message: ChatMessage }>(
    `/api/conversation/${encodeURIComponent(conversationId)}/messages`,
    { method: "POST", body: JSON.stringify(body), signal },
  );

export type ChatSettingsPatch = {
  pinned?: boolean;
  archived?: boolean;
  mute?: "8h" | "1w" | "forever" | null;
};

const messagePath = (conversationId: string, messageId: string) =>
  `/api/conversation/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`;

export const editMessage = (
  conversationId: string,
  messageId: string,
  content: string,
) =>
  apiRequest<{ message: ChatMessage }>(messagePath(conversationId, messageId), {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });

export const deleteMessage = (
  conversationId: string,
  messageId: string,
  scope: "me" | "everyone",
) =>
  apiRequest<{ message?: ChatMessage }>(
    `${messagePath(conversationId, messageId)}?scope=${scope}`,
    { method: "DELETE" },
  );

export const setReaction = (
  conversationId: string,
  messageId: string,
  emoji: string,
) =>
  apiRequest<{ message: ChatMessage }>(
    `${messagePath(conversationId, messageId)}/reaction`,
    { method: "PUT", body: JSON.stringify({ emoji }) },
  );

export const removeReaction = (conversationId: string, messageId: string) =>
  apiRequest<{ message: ChatMessage }>(
    `${messagePath(conversationId, messageId)}/reaction`,
    { method: "DELETE" },
  );

export const updateChatSettings = (
  conversationId: string,
  patch: ChatSettingsPatch,
) =>
  apiRequest<{ me: ConversationMeState }>(
    `/api/conversation/${encodeURIComponent(conversationId)}/settings`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );

export const deleteChat = (conversationId: string) =>
  apiRequest<{ success: true }>(
    `/api/conversation/${encodeURIComponent(conversationId)}`,
    { method: "DELETE" },
  );

export const blockUser = (userId: string) =>
  apiRequest<{ success: true }>("/api/blocks", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });

export const unblockUser = (userId: string) =>
  apiRequest<{ success: true }>(`/api/blocks/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });

export const getBlockedUsers = async (signal?: AbortSignal) => {
  const data = await apiRequest<{ users: BlockedUser[] }>("/api/blocks", {
    signal,
  });
  return data.users;
};

export const getPresence = async (signal?: AbortSignal) => {
  const data = await apiRequest<{
    users: { id: string; status: PresenceStatus; lastSeen: string | null }[];
  }>("/api/presence", { signal });
  return data.users;
};

export const searchChats = async (query: string, signal?: AbortSignal) => {
  const data = await apiRequest<{ chats: ChatPreview[] }>(
    `/api/conversation/search?q=${encodeURIComponent(query)}`,
    { signal },
  );
  return data.chats;
};
