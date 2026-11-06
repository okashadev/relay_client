import type { DeviceItem } from "@/types/device";
import { apiRequest } from "./apiRequest";

export const getDevices = async (signal?: AbortSignal) => {
  const data = await apiRequest<{ devices: DeviceItem[] }>(
    "/api/auth/devices",
    { signal },
  );
  return data.devices;
};

export const revokeDeviceApi = (id: string) =>
  apiRequest<{ success: true }>(`/api/auth/devices/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const revokeOthersApi = () =>
  apiRequest<{ revoked: number }>("/api/auth/devices/revoke-others", {
    method: "POST",
  });
