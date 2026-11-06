export type DeviceItem = {
  id: string;
  name: string;
  platform: string | null;
  browser: string | null;
  os: string | null;
  deviceModel: string | null;
  appVersion: string | null;
  ip: string | null;
  lastActiveAt: string;
  createdAt: string;
  encrypted: boolean;
  isCurrent: boolean;
};
