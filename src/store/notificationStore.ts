import { create } from "zustand";
import { fetchUnreadCount } from "@/lib/notificationsApi";

type NotificationState = {
  unreadCount: number;
  pendingRequestCount: number;
  setUnreadCount: (count: number) => void;
  setPendingRequestCount: (count: number) => void;
  refresh: () => Promise<void>;
};

let inFlight: Promise<void> | null = null;

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  pendingRequestCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setPendingRequestCount: (pendingRequestCount) => set({ pendingRequestCount }),
  refresh: () => {
    if (!inFlight) {
      inFlight = fetchUnreadCount()
        .then(({ unread, pendingRequests }) =>
          set({ unreadCount: unread, pendingRequestCount: pendingRequests }),
        )
        .catch(() => {})
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  },
}));
