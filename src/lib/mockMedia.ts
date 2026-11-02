import type { MediaItem } from "@/types/media";

const VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const poster = (
  from: string,
  to: string,
  label: string,
  width: number,
  height: number,
) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#g)"/><circle cx="${width * 0.75}" cy="${height * 0.28}" r="${height * 0.14}" fill="rgba(255,255,255,0.18)"/><text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(width / 12)}" font-weight="700" fill="rgba(255,255,255,0.9)">${label}</text></svg>`,
  )}`;

const textFile = (content: string) =>
  `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

type Person = { id: string; name: string };
type Chat = Pick<
  MediaItem,
  "conversationId" | "conversationType" | "conversationName"
>;

const SPRINT: Chat = {
  conversationId: "c-sprint",
  conversationType: "GROUP",
  conversationName: "Product Sprint",
};
const MARCUS: Chat = {
  conversationId: "c-marcus",
  conversationType: "DIRECT",
  conversationName: "Marcus Brody",
};
const SARAH: Chat = {
  conversationId: "c-sarah",
  conversationType: "DIRECT",
  conversationName: "Sarah Jenkins",
};

const base = (id: string, days: number, chat: Chat, sender: Person) => ({
  id,
  ...chat,
  senderId: sender.id,
  senderName: sender.name,
  senderAvatar: null,
  createdAt: daysAgo(days),
});

const image = (
  id: string,
  days: number,
  chat: Chat,
  sender: Person,
  colors: [string, string],
  label: string,
  size: number,
  portrait = false,
): MediaItem => {
  const [width, height] = portrait ? [900, 1200] : [1200, 900];
  const url = poster(colors[0], colors[1], label, width, height);

  return {
    ...base(id, days, chat, sender),
    type: "IMAGE",
    mediaUrl: url,
    thumbnailUrl: url,
    mediaMimeType: "image/png",
    fileName: null,
    mediaSize: size,
    mediaWidth: width,
    mediaHeight: height,
    mediaDuration: null,
  };
};

const video = (
  id: string,
  days: number,
  chat: Chat,
  sender: Person,
  label: string,
  size: number,
  duration: number,
): MediaItem => ({
  ...base(id, days, chat, sender),
  type: "VIDEO",
  mediaUrl: VIDEO_URL,
  thumbnailUrl: poster("#1D4533", "#5E3122", label, 1200, 900),
  mediaMimeType: "video/mp4",
  fileName: null,
  mediaSize: size,
  mediaWidth: 1280,
  mediaHeight: 720,
  mediaDuration: duration,
});

const file = (
  id: string,
  days: number,
  chat: Chat,
  sender: Person,
  fileName: string,
  mime: string,
  size: number,
  content: string,
): MediaItem => ({
  ...base(id, days, chat, sender),
  type: "FILE",
  mediaUrl: textFile(content),
  thumbnailUrl: null,
  mediaMimeType: mime,
  fileName,
  mediaSize: size,
  mediaWidth: null,
  mediaHeight: null,
  mediaDuration: null,
});

export const createMockMedia = (me: Person): MediaItem[] => {
  const marcus = { id: "u-marcus", name: "Marcus Brody" };
  const sarah = { id: "u-sarah", name: "Sarah Jenkins" };
  const elena = { id: "u-elena", name: "Elena Rostova" };

  return [
    image("m1", 1, SPRINT, elena, ["#1D4533", "#2A5C46"], "Architecture v2", 1_840_000),
    video("m2", 2, MARCUS, me, "Demo recording", 14_300_000, 38),
    file("m3", 3, SPRINT, sarah, "Sprint notes.txt", "text/plain", 12_400, "Sprint notes\n- Ship stories\n- Group admin tools"),
    image("m4", 6, SARAH, sarah, ["#B5654A", "#F9D2BA"], "Moodboard", 940_000, true),
    image("m5", 9, MARCUS, marcus, ["#5E3122", "#E0A99D"], "Whiteboard", 2_310_000),
    file("m6", 12, MARCUS, me, "Budget Q4.csv", "text/csv", 48_200, "item,amount\nHosting,40\nDesign,120"),
    image("m7", 18, SPRINT, me, ["#2A5C46", "#1D4533"], "Release plan", 1_120_000, true),
    video("m8", 24, SARAH, sarah, "Office tour", 22_800_000, 61),
    image("m9", 33, SPRINT, marcus, ["#E0A99D", "#F9D2BA"], "Brand colours", 760_000),
    file("m10", 38, SPRINT, elena, "Design tokens.txt", "text/plain", 6_100, "Forest green #1D4533\nCream #F7EAE0"),
    image("m11", 45, SARAH, me, ["#1D4533", "#B5654A"], "Weekend", 1_980_000),
    file("m12", 52, MARCUS, marcus, "Contract draft.txt", "text/plain", 31_000, "Contract draft v1"),
    image("m13", 63, SPRINT, sarah, ["#F9D2BA", "#2A5C46"], "Kickoff", 1_450_000, true),
    video("m14", 70, MARCUS, marcus, "Launch party", 31_500_000, 94),
  ];
};