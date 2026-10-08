import { create } from "zustand";
import { fetchUnreadCount } from "@/lib/notificationsApi";

type NotificationState = {
  unreadCount: number;
  pendingRequestCount: number;
  setUnreadCount: (count: number) => void;
  setPendingRequestCount: (count: number) => void;
  refresh: () => Promise<void>;
};

let isFetching = false;
let needsRerun = false;

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  pendingRequestCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setPendingRequestCount: (pendingRequestCount) => set({ pendingRequestCount }),
  refresh: async () => {
    if (isFetching) {
      needsRerun = true;
      return;
    }

    isFetching = true;

    try {
      do {
        needsRerun = false;
        const { unread, pendingRequests } = await fetchUnreadCount();
        set({ unreadCount: unread, pendingRequestCount: pendingRequests });
      } while (needsRerun);
    } catch {
    } finally {
      isFetching = false;
    }
  },
}));
