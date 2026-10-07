import { apiRequest } from "@/lib/apiRequest";

export type NotificationType = "FRIEND_REQUEST" | "FRIEND_ACCEPTED";

export type NotificationItem = {
  id: string;
  type: NotificationType | (string & {});
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  friendship: {
    id: string;
    status: "PENDING" | "ACCEPTED" | "BLOCKED";
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

export const fetchNotifications = (options?: {
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
}): Promise<NotificationsPage> => {
  const params = new URLSearchParams();
  if (options?.cursor) params.set("cursor", options.cursor);
  if (options?.limit) params.set("limit", String(options.limit));

  const query = params.toString();

  return apiRequest<NotificationsPage>(
    `/api/notifications${query ? `?${query}` : ""}`,
    { signal: options?.signal },
  );
};

export const fetchUnreadCount = async (
  signal?: AbortSignal,
): Promise<NotificationCounts> => {
  const data = await apiRequest<{ count: number; pendingRequests: number }>(
    "/api/notifications/unread-count",
    { signal },
  );
  return { unread: data.count, pendingRequests: data.pendingRequests };
};

export const markAllNotificationsRead = () =>
  apiRequest<{ updated: number }>("/api/notifications/read-all", {
    method: "POST",
  });
