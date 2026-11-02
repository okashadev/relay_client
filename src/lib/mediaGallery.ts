import type { MediaItem } from "@/types/media";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export const downloadName = (item: MediaItem) =>
  item.fileName ??
  `${item.type === "VIDEO" ? "video" : "photo"}-${item.id.slice(0, 6)}.${
    MIME_EXTENSIONS[item.mediaMimeType] ?? "bin"
  }`;

export const extensionOf = (name: string | null) => {
  const extension = name?.split(".").pop();

  return name && extension && extension !== name
    ? extension.slice(0, 4).toUpperCase()
    : "FILE";
};

export const senderLabel = (item: MediaItem, meId: string) =>
  item.senderId === meId ? "You" : item.senderName;

export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });

export type MonthGroup<T> = { key: string; label: string; items: T[] };

export const groupByMonth = <T extends { createdAt: string }>(
  items: T[],
): MonthGroup<T>[] => {
  const groups: MonthGroup<T>[] = [];

  for (const item of items) {
    const date = new Date(item.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = groups[groups.length - 1];

    if (last?.key === key) {
      last.items.push(item);
    } else {
      groups.push({
        key,
        label: date.toLocaleDateString([], { month: "long", year: "numeric" }),
        items: [item],
      });
    }
  }

  return groups;
};