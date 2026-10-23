import { NotificationItem } from "@/lib/api/notificationsApi";
import { Relationship } from "../api/friendsApi";
import { ChatMessage, ConversationMeState, PresenceStatus } from "@/types/chat";

export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  FRIENDSHIP_UPDATED: "friendship:updated",
  MESSAGE_NEW: "message:new",
  MESSAGE_UPDATED: "message:updated",
  MESSAGE_REMOVED: "message:removed",
  RECEIPTS_UPDATED: "receipts:updated",
  PRESENCE_UPDATED: "presence:updated",
  TYPING_UPDATED: "typing:updated",
  CONVERSATION_SETTINGS: "conversation:settings",
  CONVERSATION_CLEARED: "conversation:cleared",
  BLOCK_UPDATED: "block:updated",
} as const;

export const CLIENT_EVENTS = {
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
} as const;

export type NotificationNewPayload = NotificationItem;

export type FriendshipUpdatedPayload = {
  userId: string;
  relationship: Relationship;
  friendshipId: string;
};

export type MessageNewPayload = {
  conversationId: string;
  message: ChatMessage;
};

export type MessageUpdatedPayload = {
  conversationId: string;
  message: ChatMessage;
};

export type MessageRemovedPayload = {
  conversationId: string;
  messageId: string;
};

export type ReceiptsUpdatedPayload = {
  conversationId: string;
  deliveredUpTo: string | null;
  readUpTo: string | null;
};

export type PresenceUpdatedPayload = {
  userId: string;
  status: PresenceStatus;
  lastSeen: string | null;
};

export type TypingUpdatedPayload = {
  conversationId: string;
  userId: string;
  name: string;
  isTyping: boolean;
};

export type ConversationSettingsPayload = {
  conversationId: string;
  me: ConversationMeState;
};

export type ConversationClearedPayload = { conversationId: string };
export type BlockUpdatedPayload = { userId: string; blocked: boolean };
