const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const daysAgo = (date: Date) =>
  Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

export const isSameDay = (a: string, b: string) =>
  startOfDay(new Date(a)) === startOfDay(new Date(b));

export const formatMessageTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const formatChatTime = (iso: string) => {
  const date = new Date(iso);
  const days = daysAgo(date);

  if (days <= 0) return formatMessageTime(iso);
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatDayLabel = (iso: string) => {
  const date = new Date(iso);
  const days = daysAgo(date);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatLastSeen = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const days = daysAgo(date);

  if (days <= 0) return `Last seen today at ${formatMessageTime(iso)}`;
  if (days === 1) return `Last seen yesterday at ${formatMessageTime(iso)}`;

  return `Last seen ${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })}`;
};

export const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes || bytes < 0) return "";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
};

export const formatDuration = (totalSeconds: number) => {
  const safe =
    Number.isFinite(totalSeconds) && totalSeconds > 0
      ? Math.floor(totalSeconds)
      : 0;

  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
};