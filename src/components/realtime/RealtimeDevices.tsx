"use client";

import { toast } from "sonner";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { clearDeviceId } from "@/lib/device";
import { endSession } from "@/lib/e2ee/lifecycle";
import { deleteDevice } from "@/lib/e2ee/storage";
import {
  SOCKET_EVENTS,
  type DeviceRevokedPayload,
} from "@/lib/socket/socketEvents";
import { useAuthStore } from "@/store/authStore";
import { useE2eeStore } from "@/store/e2eeStore";

export default function RealtimeDevices() {
  useSocketEvent<DeviceRevokedPayload>(
    SOCKET_EVENTS.DEVICE_REVOKED,
    async ({ deviceIds }) => {
      const mine = useE2eeStore.getState().deviceId;
      if (!mine || !deviceIds.includes(mine)) return;

      const userId = useAuthStore.getState().user?.id;

      clearDeviceId();
      if (userId) await deleteDevice(userId, mine).catch(() => undefined);
      endSession();

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => undefined);

      toast.info("This device was signed out.");
      window.location.assign("/login");
    },
  );

  return null;
}
