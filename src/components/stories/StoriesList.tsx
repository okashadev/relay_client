"use client";

import { Plus } from "lucide-react";
import StoryRing from "@/components/stories/StoryRing";
import { formatDayLabel, formatMessageTime } from "@/lib/format";
import { latestStoryAt } from "@/lib/stories/stories";
import type { StoryOwner, StoryUserGroup } from "@/types/story";
import { motion, AnimatePresence } from "framer-motion";

const timeLabel = (iso: string) =>
  `${formatDayLabel(iso)} at ${formatMessageTime(iso)}`;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2">
      {children}
    </h2>
  );
}

function StoryRow({
  group,
  onOpen,
  dimmed = false,
}: {
  group: StoryUserGroup;
  onOpen: () => void;
  dimmed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${group.user.name}'s story`}
      className="w-full text-left flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-colors hover:bg-white/60"
    >
      <StoryRing
        user={group.user}
        segments={group.stories.map((story) => story.viewedByMe)}
      />
      <div className="flex-1 min-w-0">
        <h3
          className={`text-sm truncate text-[#1D4533] ${
            dimmed ? "font-semibold" : "font-bold"
          }`}
        >
          {group.user.name}
        </h3>
        <p className="text-xs text-[#1D4533]/60 truncate">
          {timeLabel(latestStoryAt(group))}
        </p>
      </div>
    </button>
  );
}

export default function StoriesList({
  me,
  mine,
  recent,
  viewed,
  onOpenMine,
  onAddStory,
  onOpenGroup,
  isLoading = false,
  error = null,
  onRetry,
}: {
  me: StoryOwner;
  mine: StoryUserGroup | null;
  recent: StoryUserGroup[];
  viewed: StoryUserGroup[];
  onOpenMine: () => void;
  onAddStory: () => void;
  onOpenGroup: (userId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const myCount = mine?.stories.length ?? 0;
  const hasFriendStories = recent.length > 0 || viewed.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-[#F7EAE0] overflow-y-auto overscroll-contain select-none custom-scrollbar">
      <div className="px-4 sm:px-5 pt-4 pb-3 flex items-center justify-between gap-3 sticky top-0 bg-[#F7EAE0]/95 backdrop-blur z-10 border-b border-[#1D4533]/10">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-[#1D4533] tracking-tight">
            Stories
          </h1>
          <p className="text-[11px] font-medium text-[#5E3122]/60">
            Disappear after 24 hours
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddStory}
          aria-label="Add a new Story"
          title="New Story"
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer bg-[#F7EAE0] hover:bg-[#F9D2BA]/40 text-[#1D4533] border-[#1D4533]/15 shadow-sm
          `}
        >
          <Plus className={`w-4 h-4 transition-transform duration-200`} />
        </motion.button>
        {/* <button
          type="button"
          onClick={onAddStory}
          aria-label="Add story"
          title="Add story"
          className="w-9 h-9 rounded-xl bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90 active:scale-95 shadow-md flex items-center justify-center cursor-pointer transition-all shrink-0"
        >
          <Plus size={18} />
        </button> */}
      </div>

      <div className="p-3 sm:p-4 space-y-5">
        <div className="flex items-center gap-1 rounded-2xl hover:bg-white/50 transition-colors">
          <button
            type="button"
            onClick={onOpenMine}
            aria-label={myCount > 0 ? "View my story" : "Add to my story"}
            className="flex-1 min-w-0 text-left flex items-center gap-3.5 p-3 cursor-pointer"
          >
            <div className="relative shrink-0">
              <StoryRing
                user={me}
                segments={(mine?.stories ?? []).map(() => false)}
                dashed={myCount === 0}
              />
              {myCount === 0 && (
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#1D4533] text-[#F7EAE0] border-2 border-[#F7EAE0] flex items-center justify-center">
                  <Plus size={11} />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#1D4533]">My Story</h3>
              <p className="text-xs text-[#1D4533]/60 truncate">
                {myCount === 0
                  ? "Tap to add a story"
                  : `${myCount} ${myCount === 1 ? "story" : "stories"} • ${timeLabel(
                      latestStoryAt(mine as StoryUserGroup),
                    )}`}
              </p>
            </div>
          </button>
        </div>
        {isLoading && (
          <div
            role="status"
            aria-label="Loading stories"
            className="space-y-3 animate-pulse px-1"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-full bg-[#1D4533]/10" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-[#1D4533]/10" />
                  <div className="h-2.5 w-36 rounded bg-[#1D4533]/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="underline shrink-0 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {recent.length > 0 && (
          <section>
            <SectionTitle>Recent Stories</SectionTitle>
            <div className="space-y-1">
              {recent.map((group) => (
                <StoryRow
                  key={group.user.id}
                  group={group}
                  onOpen={() => onOpenGroup(group.user.id)}
                />
              ))}
            </div>
          </section>
        )}

        {viewed.length > 0 && (
          <section>
            <SectionTitle>Viewed Stories</SectionTitle>
            <div className="space-y-1 opacity-85">
              {viewed.map((group) => (
                <StoryRow
                  key={group.user.id}
                  group={group}
                  dimmed
                  onOpen={() => onOpenGroup(group.user.id)}
                />
              ))}
            </div>
          </section>
        )}

        {!hasFriendStories && !isLoading && !error && (
          <p className="p-6 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
            No stories from your friends yet. When they share one, it will show
            up here.
          </p>
        )}
      </div>
    </div>
  );
}
