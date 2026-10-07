const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const timeAgo = (iso: string): string => {
  const date = new Date(iso);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(seconds / 86400), "day");

  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
};