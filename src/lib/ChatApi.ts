import { ChatMessage, ChatPreview, ConversationDetails } from "@/types/chat";
import { apiRequest } from "./apiRequest";

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
