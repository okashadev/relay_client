import { Laptop, Smartphone, type LucideIcon } from "lucide-react";
import { formatDayLabel, formatMessageTime } from "@/lib/format";
import type { DeviceItem } from "@/types/device";

const MOBILE_OS = new Set(["Android", "iOS"]);

export const deviceIcon = (device: DeviceItem): LucideIcon =>
  device.platform !== "web" || MOBILE_OS.has(device.os ?? "")
    ? Smartphone
    : Laptop;

export const deviceKind = (device: DeviceItem) =>
  device.platform === "web"
    ? "Web browser"
    : `Relay app${device.appVersion ? ` ${device.appVersion}` : ""}`;

const LOOPBACK = new Set(["127.0.0.1", "::1"]);

export const formatIp = (ip: string | null) => {
  if (!ip) return null;

  const clean = ip.replace(/^::ffff:/, "");
  return LOOPBACK.has(clean) ? "This computer" : clean;
};

export const deviceActivity = (device: DeviceItem) =>
  device.isCurrent
    ? "Active now"
    : `Last active ${formatDayLabel(device.lastActiveAt)} at ${formatMessageTime(device.lastActiveAt)}`;
