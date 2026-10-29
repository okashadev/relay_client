"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import EmptyStoriesState from "@/components/stories/EmptyStoriesState";
import StoriesList from "@/components/stories/StoriesList";
import StoryComposer from "@/components/stories/StoryComposer";
import StoryViewer from "@/components/stories/StoryViewer";
import { useStories } from "@/hooks/useStories";
import { useStoryPublisher } from "@/hooks/useStoryPublisher";
import { ApiError } from "@/lib/api/apiRequest";
import {
  deleteStory,
  getStoryViewers,
  markStoryViewed,
  replyToStory,
} from "@/lib/api/storyApi";
import { hasUnseen, latestStoryAt } from "@/lib/stories/stories";
import { uuid } from "@/lib/uuid";
import { useAuthStore } from "@/store/authStore";
import { useChatListStore } from "@/store/chatListStore";
import type { StoryDraft, StoryOwner, StoryUserGroup } from "@/types/story";

type ViewerState = { queue: StoryUserGroup[]; startIndex: number } | null;

const newestFirst = (a: StoryUserGroup, b: StoryUserGroup) =>
  Date.parse(latestStoryAt(b)) - Date.parse(latestStoryAt(a));

export default function StoriesPage() {
  const user = useAuthStore((state) => state.user);

  const me = useMemo<StoryOwner>(
    () => ({
      id: user?.id ?? "me",
      name: user?.name ?? "You",
      username: user?.username ?? "you",
      avatar: user?.avatar ?? null,
    }),
    [user],
  );

  const {
    groups,
    error,
    isLoading,
    reload,
    addStory,
    markViewed,
    removeStory,
  } = useStories(me);
  const publish = useStoryPublisher();

  const [viewer, setViewer] = useState<ViewerState>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const replyIds = useRef(new Map<string, string>());

  const mine = groups?.find((group) => group.isMine) ?? null;

  const { recent, viewed } = useMemo(() => {
    const friends = (groups ?? []).filter(
      (group) => !group.isMine && group.stories.length > 0,
    );

    return {
      recent: friends.filter(hasUnseen).sort(newestFirst),
      viewed: friends.filter((group) => !hasUnseen(group)).sort(newestFirst),
    };
  }, [groups]);

  const openGroup = (userId: string) => {
    const queue = [...recent, ...viewed];
    const startIndex = queue.findIndex((group) => group.user.id === userId);

    if (startIndex !== -1) setViewer({ queue, startIndex });
  };

  const openMine = () => {
    if (mine && mine.stories.length > 0) {
      setViewer({ queue: [mine], startIndex: 0 });
    } else {
      setComposerOpen(true);
    }
  };

  const handleViewed = useCallback(
    (storyId: string) => {
      if (!markViewed(storyId)) return;

      markStoryViewed(storyId).catch(() => {});
    },
    [markViewed],
  );

  const handleDelete = useCallback(
    async (storyId: string) => {
      try {
        await deleteStory(storyId);
        removeStory(storyId);
        toast.success("Story deleted.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't delete the story.",
        );
        return false;
      }
    },
    [removeStory],
  );

  const handleReply = useCallback(
    async (owner: StoryOwner, storyId: string, text: string) => {
      const key = `${storyId}:${text}`;
      const clientId = replyIds.current.get(key) ?? uuid();
      replyIds.current.set(key, clientId);

      try {
        await replyToStory(storyId, { clientId, content: text });
        replyIds.current.delete(key);

        useChatListStore.getState().invalidate();
        toast.success(`Reply sent to ${owner.name}.`);
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          replyIds.current.delete(key);
          toast.error("This story is no longer available.");
          reload();
          return false;
        }

        toast.error(
          err instanceof Error ? err.message : "Couldn't send your reply.",
        );
        return false;
      }
    },
    [reload],
  );

  const loadViewers = useCallback(
    (storyId: string) => getStoryViewers(storyId),
    [],
  );

  const handlePublish = useCallback(
    async (
      draft: StoryDraft,
      options: { onProgress: (percent: number) => void; signal: AbortSignal },
    ) => {
      const story = await publish(draft, options);

      addStory(story);
      toast.success("Story shared.");
    },
    [publish, addStory],
  );

  const closeViewer = useCallback(() => setViewer(null), []);

  return (
    <div className="flex h-full w-full bg-[#F7EAE0] overflow-hidden">
      <div className="w-full md:w-85 lg:w-95 shrink-0 min-w-0 md:border-r border-[#1D4533]/10 h-full flex flex-col bg-[#F7EAE0]">
        <StoriesList
          me={me}
          mine={mine}
          recent={recent}
          viewed={viewed}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          onOpenMine={openMine}
          onAddStory={() => setComposerOpen(true)}
          onOpenGroup={openGroup}
        />
      </div>

      <div className="hidden md:flex flex-1 min-w-0 h-full bg-[#F7EAE0]/50 overflow-hidden">
        <EmptyStoriesState onAdd={() => setComposerOpen(true)} />
      </div>

      {viewer && (
        <StoryViewer
          queue={viewer.queue}
          startIndex={viewer.startIndex}
          onClose={closeViewer}
          onViewed={handleViewed}
          onDelete={handleDelete}
          onReply={handleReply}
          loadViewers={loadViewers}
        />
      )}

      {composerOpen && (
        <StoryComposer
          onClose={() => setComposerOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
