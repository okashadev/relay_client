const KEY = "relay_device_id";

export const getDeviceId = () => {
  try {
    return localStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

export const saveDeviceId = (id?: string) => {
  if (!id) return;
  try {
    localStorage.setItem(KEY, id);
  } catch {}
};

export const deviceBody = () => ({
  deviceId: getDeviceId(),
  platform: "web" as const,
});

export const clearDeviceId = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {}
};
