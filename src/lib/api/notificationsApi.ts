import { apiRequest } from "@/lib/api/apiRequest";
import { NotificationCounts, NotificationsPage } from "@/types/notifications";

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
