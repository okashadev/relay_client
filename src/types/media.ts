import { MessagePayload } from "./e2ee";

export type MediaKind = "IMAGE" | "VIDEO" | "FILE";

export type MediaItem = {
  id: string;
  conversationId: string;
  conversationType: "DIRECT" | "GROUP";
  conversationName: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  type: MediaKind;
  ciphertext?: string | null;
  keyEpoch?: number | null;
  payload?: MessagePayload | null;
  decryptFailed?: boolean;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaMimeType: string;
  fileName: string | null;
  mediaSize: number;
  mediaWidth: number | null;
  mediaHeight: number | null;
  mediaDuration: number | null;
  createdAt: string;
};

export type MediaChatSummary = {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string;
  visual: number;
  files: number;
  bytes: number;
};
