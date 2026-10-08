import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  FriendshipUpdatedPayload,
  NotificationNewPayload,
  SOCKET_EVENTS,
} from "@/lib/socketEvents";
import { useNotificationStore } from "@/store/notificationStore";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const describe = (notification: NotificationNewPayload) => {
  switch (notification.type) {
    case "FRIEND_REQUEST":
      return `${notification.actor.name} sent you a friend request`;
    case "FRIEND_ACCEPTED":
      return `${notification.actor.name} accepted your friend request`;
    default:
      return "You have a new notification";
  }
};

export default function RealtimeNotifications() {
  const pathname = usePathname();
  const refresh = useNotificationStore((state) => state.refresh);

  useSocketEvent<NotificationNewPayload>(
    SOCKET_EVENTS.NOTIFICATION_NEW,
    (notification) => {
      refresh();

      if (pathname?.startsWith("/notifications")) return;

      toast(describe(notification));
    },
  );

  useSocketEvent<FriendshipUpdatedPayload>(
    SOCKET_EVENTS.FRIENDSHIP_UPDATED,
    () => {
      refresh();
    },
  );

  return null;
}
