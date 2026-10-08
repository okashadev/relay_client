import { NotificationItem } from "@/lib/notificationsApi";
import { Relationship } from "./friendsApi";

export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  FRIENDSHIP_UPDATED: "friendship:updated",
} as const;

export type NotificationNewPayload = NotificationItem;

export type FriendshipUpdatedPayload = {
  userId: string;
  relationship: Relationship;
  friendshipId: string;
};
