export type StoryType = "IMAGE" | "VIDEO" | "TEXT";

export type StoryOwner = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
};

export type StoryViewerEntry = {
  user: StoryOwner;
  viewedAt: string;
};

export type StoryItem = {
  id: string;
  type: StoryType;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
  mediaDuration: number | null;
  caption: string | null;
  backgroundColor: string | null;
  createdAt: string;
  expiresAt: string;
  viewedByMe: boolean;
  viewCount?: number;
};

export type StoryUserGroup = {
  user: StoryOwner;
  isMine: boolean;
  stories: StoryItem[];
};

export type StoryDraft =
  | { type: "TEXT"; caption: string; backgroundColor: string }
  | { type: "IMAGE" | "VIDEO"; file: File; caption: string | null };
