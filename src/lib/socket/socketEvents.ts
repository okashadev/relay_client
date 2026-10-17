import { NotificationItem } from "@/lib/api/notificationsApi";
import { Relationship } from "../api/friendsApi";
import { ChatMessage } from "@/types/chat";

export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  FRIENDSHIP_UPDATED: "friendship:updated",
  MESSAGE_NEW: "message:new",
  MESSAGE_UPDATED: "message:updated",
  MESSAGE_REMOVED: "message:removed",
  RECEIPTS_UPDATED: "receipts:updated",
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
