export type NotificationType =
  | "SYSTEM"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "GROUP_ADDED";

export type NotificationItem = {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType | (string & {});
  friendshipId: string | null;
  conversationId: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  friendship?: {
    id: string;
    status: "PENDING" | "ACCEPTED" | "BLOCKED";
  } | null;
  conversation?: {
    id: string;
    name: string | null;
  } | null;
};

export type NotificationsPage = {
  items: NotificationItem[];
  nextCursor: string | null;
};

export type NotificationCounts = {
  unread: number;
  pendingRequests: number;
};