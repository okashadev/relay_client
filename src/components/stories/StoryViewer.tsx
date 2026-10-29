"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pause,
  Play,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserAvatar from "@/components/common/UserAvatar";
import StoryViewersSheet from "@/components/stories/StoryViewersSheet";
import { formatStoryAge } from "@/lib/format";
import {
  firstUnseenIndex,
  readableTextOn,
  storyDurationMs,
  textSizeClass,
} from "@/lib/stories/stories";
import type { StoryOwner, StoryUserGroup } from "@/types/story";
import type { StoryViewersResult } from "@/lib/api/storyApi";

const QUICK_REPLIES = ["❤️", "🔥", "👏", "😂", "😮", "😢"];
const HOLD_MS = 220;
const SWIPE_PX = 70;

type Sheet = "viewers" | "delete" | null;

type StoryViewerProps = {
  queue: StoryUserGroup[];
  startIndex: number;
  onClose: () => void;
  onViewed: (storyId: string) => void;
  onDelete: (storyId: string) => Promise<boolean>;
  onReply: (
    owner: StoryOwner,
    storyId: string,
    text: string,
  ) => Promise<boolean>;
  loadViewers: (storyId: string) => Promise<StoryViewersResult>;
};

export default function StoryViewer({
  queue: initialQueue,
  startIndex,
  onClose,
  onViewed,
  onDelete,
  onReply,
  loadViewers,
}: StoryViewerProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [storyIndex, setStoryIndex] = useState(() =>
    initialQueue[startIndex] ? firstUnseenIndex(initialQueue[startIndex]) : 0,
  );
  const [restartKey, setRestartKey] = useState(0);

  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [muted, setMuted] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [readyKey, setReadyKey] = useState("");
  const [failedKey, setFailedKey] = useState("");
  const [videoProgress, setVideoProgress] = useState({ key: "", value: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const markedRef = useRef(new Set<string>());
  const gesture = useRef({
    x: 0,
    y: 0,
    held: false,
    timer: null as number | null,
  });

  const group = queue[groupIndex];
  const story = group?.stories[storyIndex];
  const storyKey = story ? `${story.id}:${restartKey}` : "";

  const ready = story?.type === "TEXT" || readyKey === storyKey;
  const failed = failedKey === storyKey;
  const playing =
    Boolean(story) &&
    ready &&
    !failed &&
    !paused &&
    !holding &&
    !typing &&
    sheet === null &&
    pageVisible;

  const videoValue =
    story?.type === "VIDEO" && videoProgress.key === storyKey
      ? videoProgress.value
      : 0;

  useEffect(() => {
    if (!story) onClose();
  }, [story, onClose]);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!story || !group || group.isMine) return;
    if (markedRef.current.has(story.id)) return;

    markedRef.current.add(story.id);
    onViewed(story.id);
  }, [story, group, onViewed]);

  useEffect(() => {
    setReply("");
  }, [story?.id]);

  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete && image.naturalWidth > 0) {
      setReadyKey(storyKey);
    }
  }, [storyKey]);

  useEffect(() => {
    const next =
      group?.stories[storyIndex + 1] ?? queue[groupIndex + 1]?.stories[0];

    if (next?.type === "IMAGE" && next.mediaUrl) {
      const image = new Image();
      image.src = next.mediaUrl;
    }
  }, [group, storyIndex, groupIndex, queue]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || story?.type !== "VIDEO") return;

    if (!playing) {
      video.pause();
      return;
    }

    video.play().catch(() => setMuted(true));
  }, [playing, muted, storyKey, story?.type]);

  const openGroup = useCallback(
    (index: number, where: "first" | "last") => {
      const target = queue[index];
      if (!target) return;

      setGroupIndex(index);
      setStoryIndex(
        where === "last" ? target.stories.length - 1 : firstUnseenIndex(target),
      );
      setRestartKey((key) => key + 1);
    },
    [queue],
  );

  const goNext = useCallback(() => {
    if (!group) return;

    if (storyIndex < group.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < queue.length - 1) {
      openGroup(groupIndex + 1, "first");
    } else {
      onClose();
    }
  }, [group, storyIndex, groupIndex, queue.length, openGroup, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      openGroup(groupIndex - 1, "last");
    } else {
      setRestartKey((key) => key + 1);
    }
  }, [storyIndex, groupIndex, openGroup]);

  const nextGroup = useCallback(() => {
    if (groupIndex < queue.length - 1) openGroup(groupIndex + 1, "first");
    else onClose();
  }, [groupIndex, queue.length, openGroup, onClose]);

  const prevGroup = useCallback(() => {
    if (groupIndex > 0) openGroup(groupIndex - 1, "first");
    else setRestartKey((key) => key + 1);
  }, [groupIndex, openGroup]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (sheet === "delete") return;

      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      if (event.key === "Escape") {
        if (sheet === "viewers") setSheet(null);
        else if (isTyping) target.blur();
        else onClose();
        return;
      }

      if (isTyping || sheet !== null) return;

      if (event.key === "ArrowRight") goNext();
      else if (event.key === "ArrowLeft") goPrev();
      else if (event.key === " " && !(target instanceof HTMLButtonElement)) {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sheet, goNext, goPrev, onClose]);

  const clearHold = () => {
    if (gesture.current.timer !== null) {
      window.clearTimeout(gesture.current.timer);
      gesture.current.timer = null;
    }
  };

  useEffect(() => clearHold, []);

  const releaseHold = () => {
    clearHold();

    if (gesture.current.held) {
      gesture.current.held = false;
      setHolding(false);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current.x = event.clientX;
    gesture.current.y = event.clientY;
    gesture.current.held = false;

    clearHold();
    gesture.current.timer = window.setTimeout(() => {
      gesture.current.held = true;
      setHolding(true);
    }, HOLD_MS);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    clearHold();

    if (gesture.current.held) {
      releaseHold();
      return;
    }

    const dx = event.clientX - gesture.current.x;
    const dy = event.clientY - gesture.current.y;

    if (dy > SWIPE_PX && Math.abs(dy) > Math.abs(dx)) return onClose();

    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      return dx < 0 ? nextGroup() : prevGroup();
    }

    const rect = event.currentTarget.getBoundingClientRect();

    if (event.clientX - rect.left < rect.width * 0.33) goPrev();
    else goNext();
  };

  const sendReply = async (text: string) => {
    const value = text.trim();
    if (!value || !story || !group || sending) return;

    setSending(true);
    const sent = await onReply(group.user, story.id, value);
    setSending(false);

    if (!sent) return;

    setReply("");
    inputRef.current?.blur();
  };

  const handleDelete = async () => {
    if (!story || deleting) return;

    const targetId = story.id;

    setDeleting(true);
    const deleted = await onDelete(targetId);
    setDeleting(false);

    if (!deleted) return;

    const nextQueue = queue
      .map((item, index) =>
        index === groupIndex
          ? { ...item, stories: item.stories.filter((s) => s.id !== targetId) }
          : item,
      )
      .filter((item) => item.stories.length > 0);

    setSheet(null);

    if (nextQueue.length === 0) {
      onClose();
      return;
    }

    const groupRemoved = nextQueue.length < queue.length;
    const nextGroupIndex = Math.min(groupIndex, nextQueue.length - 1);

    setQueue(nextQueue);
    setGroupIndex(nextGroupIndex);
    setStoryIndex(
      groupRemoved
        ? 0
        : Math.min(storyIndex, nextQueue[nextGroupIndex].stories.length - 1),
    );
  };

  if (!group || !story) return null;
  if (typeof document === "undefined") return null;

  const name = group.isMine ? "My Story" : group.user.name;
  const firstName = group.user.name.split(" ")[0];
  const isVideo = story.type === "VIDEO";
  const hasPrevGroup = groupIndex > 0;
  const hasNextGroup = groupIndex < queue.length - 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name}'s story`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-x-0 top-0 z-50 app-height flex items-center justify-center md:gap-6 md:p-6 bg-[#0E2319] md:bg-[#0E2319]/95 md:backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={prevGroup}
        aria-label="Previous person's story"
        className={`hidden md:flex w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center cursor-pointer shrink-0 transition-colors ${
          hasPrevGroup ? "" : "invisible"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      <div className="relative w-full h-full md:h-[min(100%,860px)] md:max-w-105 md:rounded-3xl overflow-hidden bg-black shadow-2xl select-none">
        <div className="absolute inset-0">
          {story.type === "TEXT" && (
            <div
              className="absolute inset-0 flex items-center justify-center px-8 text-center overflow-y-auto"
              style={{
                backgroundColor: story.backgroundColor ?? "#1D4533",
                color: readableTextOn(story.backgroundColor),
              }}
            >
              <p
                className={`font-extrabold leading-snug whitespace-pre-wrap wrap-anywhere ${textSizeClass(
                  story.caption?.length ?? 0,
                )}`}
              >
                {story.caption}
              </p>
            </div>
          )}

          {story.type === "IMAGE" && story.mediaUrl && (
            <>
              <img
                src={story.mediaUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
              />
              <img
                key={storyKey}
                ref={imageRef}
                src={story.mediaUrl}
                alt={story.caption ?? `${name}'s photo`}
                draggable={false}
                onLoad={() => setReadyKey(storyKey)}
                onError={() => setFailedKey(storyKey)}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </>
          )}

          {story.type === "VIDEO" && story.mediaUrl && (
            <video
              key={storyKey}
              ref={videoRef}
              src={story.mediaUrl}
              poster={story.thumbnailUrl ?? undefined}
              muted={muted}
              playsInline
              preload="auto"
              onCanPlay={() => setReadyKey(storyKey)}
              onPlaying={() => setReadyKey(storyKey)}
              onWaiting={() => setReadyKey("")}
              onError={() => setFailedKey(storyKey)}
              onTimeUpdate={(event) => {
                const video = event.currentTarget;

                if (Number.isFinite(video.duration) && video.duration > 0) {
                  setVideoProgress({
                    key: storyKey,
                    value: video.currentTime / video.duration,
                  });
                }
              }}
              onEnded={goNext}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {!ready && !failed && (
            <div
              className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none"
              role="status"
              aria-label="Loading story"
            >
              <Loader2 className="w-7 h-7 animate-spin text-white/80" />
            </div>
          )}

          {failed && (
            <div className="absolute inset-0 z-5 flex flex-col items-center justify-center gap-1 px-8 text-center text-white pointer-events-none">
              <p className="text-sm font-bold">Couldn&apos;t load this story</p>
              <p className="text-xs text-white/70">Tap to skip</p>
            </div>
          )}
        </div>

        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={releaseHold}
          className="absolute inset-0 z-10 touch-none"
        />

        <div className="absolute inset-x-0 top-0 z-20 pointer-events-none bg-linear-to-b from-black/60 to-transparent px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-8">
          <div className="flex gap-1">
            {group.stories.map((item, index) => (
              <div
                key={item.id}
                className="h-0.75 flex-1 rounded-full bg-white/35 overflow-hidden"
              >
                {index < storyIndex && (
                  <div className="h-full w-full bg-white" />
                )}

                {index === storyIndex &&
                  (isVideo ? (
                    <div
                      className="h-full w-full origin-left bg-white transition-transform duration-300 ease-linear"
                      style={{ transform: `scaleX(${videoValue})` }}
                    />
                  ) : (
                    <div
                      key={storyKey}
                      onAnimationEnd={goNext}
                      className="h-full w-full origin-left bg-white"
                      style={{
                        animationName: "story-progress",
                        animationDuration: `${storyDurationMs(story)}ms`,
                        animationTimingFunction: "linear",
                        animationFillMode: "forwards",
                        animationPlayState: playing ? "running" : "paused",
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                name={group.user.name}
                avatar={group.user.avatar}
                className="w-9 h-9 rounded-full ring-2 ring-white/60"
                textClassName="text-xs"
              />
              <div className="min-w-0 text-white drop-shadow">
                <h3 className="text-xs font-bold truncate">{name}</h3>
                <p className="text-[10px] font-medium text-white/80">
                  {formatStoryAge(story.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white pointer-events-auto shrink-0">
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Play story" : "Pause story"}
                className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer"
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              {isVideo && (
                <button
                  type="button"
                  onClick={() => setMuted((value) => !value)}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer"
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close story"
                className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none bg-linear-to-t from-black/70 via-black/30 to-transparent px-3 pt-16 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {story.type !== "TEXT" && story.caption && (
            <p className="mb-3 px-1 max-h-24 overflow-y-auto pointer-events-auto text-sm font-medium text-white leading-relaxed whitespace-pre-wrap wrap-anywhere drop-shadow">
              {story.caption}
            </p>
          )}

          {group.isMine ? (
            <div className="pointer-events-auto flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSheet("viewers")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <Eye size={15} />
                {story.viewCount ?? 0}{" "}
                {(story.viewCount ?? 0) === 1 ? "view" : "views"}
              </button>
              <button
                type="button"
                onClick={() => setSheet("delete")}
                aria-label="Delete story"
                title="Delete story"
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-rose-500/80 backdrop-blur text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="pointer-events-auto">
              {typing && (
                <div className="mb-3 flex items-center justify-between px-1">
                  {QUICK_REPLIES.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => void sendReply(emoji)}
                      disabled={sending}
                      aria-label={`Reply with ${emoji}`}
                      className="w-11 h-11 rounded-full text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendReply(reply);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onFocus={() => setTyping(true)}
                  onBlur={() => setTyping(false)}
                  readOnly={sending}
                  maxLength={500}
                  autoComplete="off"
                  enterKeyHint="send"
                  aria-label={`Reply to ${firstName}`}
                  placeholder={`Reply to ${firstName}...`}
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-white/15 border border-white/30 backdrop-blur text-base md:text-sm text-white placeholder-white/60 outline-none focus:border-white/70 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!reply.trim() || sending}
                  aria-label="Send reply"
                  className="w-10 h-10 rounded-full bg-[#F9D2BA] text-[#1D4533] flex items-center justify-center shadow cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {sheet === "viewers" && (
          <StoryViewersSheet
            storyId={story.id}
            initialCount={story.viewCount ?? 0}
            load={loadViewers}
            onClose={() => setSheet(null)}
          />
        )}
      </div>

      <button
        type="button"
        onClick={nextGroup}
        aria-label="Next person's story"
        className={`hidden md:flex w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center cursor-pointer shrink-0 transition-colors ${
          hasNextGroup ? "" : "invisible"
        }`}
      >
        <ChevronRight size={20} />
      </button>

      <ConfirmDialog
        open={sheet === "delete"}
        title="Delete this story?"
        description="It will be removed for everyone who can see it."
        confirmLabel="Delete"
        cancelLabel="Keep"
        isLoading={deleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setSheet(null)}
      />
    </div>,
    document.body,
  );
}
