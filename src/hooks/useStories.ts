"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStories } from "@/lib/api/storyApi";
import { pruneExpired } from "@/lib/stories/stories";
import type { StoryItem, StoryOwner, StoryUserGroup } from "@/types/story";

const STALE_AFTER_MS = 60_000;
const PRUNE_EVERY_MS = 60_000;

const withMyStory = (
  groups: StoryUserGroup[],
  me: StoryOwner,
  story: StoryItem,
): StoryUserGroup[] => {
  if (!groups.some((group) => group.isMine)) {
    return [{ user: me, isMine: true, stories: [story] }, ...groups];
  }

  return groups.map((group) =>
    group.isMine
      ? {
          ...group,
          stories: group.stories.some((item) => item.id === story.id)
            ? group.stories
            : [...group.stories, story],
        }
      : group,
  );
};

export function useStories(me: StoryOwner) {
  const [groups, setGroups] = useState<StoryUserGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const groupsRef = useRef<StoryUserGroup[] | null>(null);
  const lastFetchedAt = useRef(0);
  const version = useRef(0);

  useEffect(() => {
    groupsRef.current = groups;
  });

  useEffect(() => {
    const controller = new AbortController();
    const startedVersion = version.current;

    setError(null);

    getStories(controller.signal)
      .then((result) => {
        if (version.current !== startedVersion) {
          setReloadKey((key) => key + 1);
          return;
        }

        setGroups(result);
        lastFetchedAt.current = Date.now();
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });

    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const refreshIfStale = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetchedAt.current > STALE_AFTER_MS
      ) {
        setReloadKey((key) => key + 1);
      }
    };

    document.addEventListener("visibilitychange", refreshIfStale);
    window.addEventListener("focus", refreshIfStale);

    return () => {
      document.removeEventListener("visibilitychange", refreshIfStale);
      window.removeEventListener("focus", refreshIfStale);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () =>
        setGroups((previous) => (previous ? pruneExpired(previous) : previous)),
      PRUNE_EVERY_MS,
    );

    return () => clearInterval(timer);
  }, []);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const addStory = useCallback(
    (story: StoryItem) => {
      version.current += 1;
      setGroups((previous) => withMyStory(previous ?? [], me, story));
    },
    [me],
  );

  const markViewed = useCallback((storyId: string): boolean => {
    const current = groupsRef.current;

    const wasUnseen = current?.some(
      (group) =>
        !group.isMine &&
        group.stories.some(
          (story) => story.id === storyId && !story.viewedByMe,
        ),
    );

    if (!wasUnseen) return false;

    version.current += 1;
    setGroups((previous) =>
      previous
        ? previous.map((group) =>
            group.isMine
              ? group
              : {
                  ...group,
                  stories: group.stories.map((story) =>
                    story.id === storyId
                      ? { ...story, viewedByMe: true }
                      : story,
                  ),
                },
          )
        : previous,
    );

    return true;
  }, []);

  const removeStory = useCallback((storyId: string) => {
    version.current += 1;
    setGroups((previous) =>
      previous
        ? previous.map((group) =>
            group.isMine
              ? {
                  ...group,
                  stories: group.stories.filter(
                    (story) => story.id !== storyId,
                  ),
                }
              : group,
          )
        : previous,
    );
  }, []);

  return {
    groups,
    error,
    isLoading: groups === null && error === null,
    reload,
    addStory,
    markViewed,
    removeStory,
  };
}
