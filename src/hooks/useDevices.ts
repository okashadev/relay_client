"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { getDevices } from "@/lib/api/deviceApi";
import { SOCKET_EVENTS, type DeviceRevokedPayload } from "@/lib/socket/socketEvents";
import type { DeviceItem } from "@/types/device";

export function useDevices() {
  const [devices, setDevices] = useState<DeviceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getDevices(controller.signal)
      .then((result) => {
        setDevices(result);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => controller.abort();
  }, [reloadKey]);

  const remove = useCallback((ids: string[]) => {
    setDevices((previous) => previous?.filter((device) => !ids.includes(device.id)) ?? previous);
  }, []);

  const reload = useCallback(() => {
    setError(null);
    setReloadKey((value) => value + 1);
  }, []);

  useSocketEvent<DeviceRevokedPayload>(SOCKET_EVENTS.DEVICE_REVOKED, ({ deviceIds }) =>
    remove(deviceIds),
  );

  return { devices, error, remove, reload };
}