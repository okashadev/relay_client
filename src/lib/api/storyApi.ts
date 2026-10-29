import type { ChatMessage } from "@/types/chat";
import type {
  StoryItem,
  StoryUserGroup,
  StoryViewerEntry,
} from "@/types/story";
import { apiRequest } from "./apiRequest";

export type CreateStoryBody =
  | {
      type: "TEXT";
      caption: string;
      backgroundColor: string;
    }
  | {
      type: "IMAGE" | "VIDEO";
      publicId: string;
      caption?: string | null;
    };

export type StoryViewersResult = {
  viewers: StoryViewerEntry[];
  viewCount: number;
};

const storyPath = (storyId: string) =>
  `/api/stories/${encodeURIComponent(storyId)}`;

export const createStory = async (
  body: CreateStoryBody,
  signal?: AbortSignal,
) => {
  const data = await apiRequest<{ story: StoryItem }>("/api/stories", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });

  return data.story;
};

export const getStories = async (signal?: AbortSignal) => {
  const data = await apiRequest<{ groups: StoryUserGroup[] }>("/api/stories", {
    signal,
  });

  return data.groups;
};

export const markStoryViewed = (storyId: string) =>
  apiRequest<{ success: true }>(`${storyPath(storyId)}/view`, {
    method: "POST",
  });

export const getStoryViewers = (storyId: string, signal?: AbortSignal) =>
  apiRequest<StoryViewersResult>(`${storyPath(storyId)}/viewers`, { signal });

export const deleteStory = (storyId: string) =>
  apiRequest<{ success: true }>(storyPath(storyId), { method: "DELETE" });

export const replyToStory = (
  storyId: string,
  body: { clientId: string; content: string },
) =>
  apiRequest<{ conversationId: string; message: ChatMessage }>(
    `${storyPath(storyId)}/reply`,
    { method: "POST", body: JSON.stringify(body) },
  );