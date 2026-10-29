import type { StoryItem, StoryUserGroup } from "@/types/story";

export const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const IMAGE_DURATION_MS = 5_000;

export const hasUnseen = (group: StoryUserGroup) =>
  group.stories.some((story) => !story.viewedByMe);

export const latestStoryAt = (group: StoryUserGroup) =>
  group.stories.length > 0
    ? group.stories[group.stories.length - 1].createdAt
    : "";

export const firstUnseenIndex = (group: StoryUserGroup) => {
  const index = group.stories.findIndex((story) => !story.viewedByMe);
  return index === -1 ? 0 : index;
};

export const storyDurationMs = (story: StoryItem) =>
  story.type === "TEXT"
    ? Math.min(
        12_000,
        Math.max(5_000, 4_000 + (story.caption?.length ?? 0) * 50),
      )
    : IMAGE_DURATION_MS;

export const readableTextOn = (hex: string | null) => {
  const value = hex?.replace("#", "") ?? "";
  if (value.length !== 6) return "#F7EAE0";

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 255_000;

  return brightness > 0.6 ? "#1D4533" : "#F7EAE0";
};

export const textSizeClass = (length: number) =>
  length <= 40 ? "text-3xl" : length <= 120 ? "text-2xl" : "text-xl";

export const pruneExpired = (
  groups: StoryUserGroup[],
  now = Date.now(),
): StoryUserGroup[] => {
  let changed = false;

  const next = groups
    .map((group) => {
      const alive = group.stories.filter(
        (story) => Date.parse(story.expiresAt) > now,
      );

      if (alive.length === group.stories.length) return group;

      changed = true;
      return { ...group, stories: alive };
    })
    .filter((group) => group.isMine || group.stories.length > 0);

  return changed ? next : groups;
};
