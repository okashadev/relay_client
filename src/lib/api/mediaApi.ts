import type { MediaChatSummary, MediaItem } from "@/types/media";
import { apiRequest } from "./apiRequest";

export type MediaKindFilter = "media" | "files";
export type MediaPage = { items: MediaItem[]; nextCursor: string | null };

export const getMedia = (
  params: { kind: MediaKindFilter; conversationId?: string | null; cursor?: string | null },
  signal?: AbortSignal,
) => {
  const query = new URLSearchParams({ kind: params.kind });
  if (params.conversationId) query.set("conversationId", params.conversationId);
  if (params.cursor) query.set("cursor", params.cursor);

  return apiRequest<MediaPage>(`/api/media?${query.toString()}`, { signal });
};

export const getMediaSummary = async (signal?: AbortSignal) => {
  const data = await apiRequest<{ chats: MediaChatSummary[] }>("/api/media/summary", {
    signal,
  });

  return data.chats;
};