"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { formatMessageTime } from "@/lib/format";
import { senderLabel } from "@/lib/mediaGallery";
import type { MediaItem } from "@/types/media";
import { useMediaSource } from "@/hooks/useMediaSource";

const SWIPE_PX = 60;

const iconButton =
  "w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center cursor-pointer transition-colors";

function ViewerMedia({ item, who }: { item: MediaItem; who: string }) {
  const { src } = useMediaSource(item, "full");

  if (!src) {
    return (
      <Loader2
        className="w-8 h-8 animate-spin text-white/70"
        aria-label="Loading media"
      />
    );
  }

  if (item.type === "VIDEO") {
    return (
      <video
        key={item.id}
        src={src}
        poster={item.thumbnailUrl ?? undefined}
        controls
        autoPlay
        playsInline
        className="max-h-full max-w-full rounded-lg bg-black"
      />
    );
  }

  return (
    <img
      key={item.id}
      src={src}
      alt={`Photo from ${who}`}
      draggable={false}
      className="max-h-full max-w-full rounded-lg object-contain"
    />
  );
}

export default function StorageMediaViewer({
  items,
  startIndex,
  meId,
  paused,
  onClose,
  onDownload,
  onDelete,
  onShowInChat,
}: {
  items: MediaItem[];
  startIndex: number;
  meId: string;
  paused: boolean;
  onClose: () => void;
  onDownload: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
  onShowInChat: (item: MediaItem) => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const last = items.length - 1;
  const current = Math.min(index, last);
  const item = items[current];

  useEffect(() => {
    if (!item) onClose();
  }, [item, onClose]);

  const go = useCallback(
    (step: number) => setIndex(Math.min(Math.max(current + step, 0), last)),
    [current, last],
  );

  useEffect(() => {
    if (paused) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [paused, go, onClose]);

  if (!item || typeof document === "undefined") return null;

  const isVideo = item.type === "VIDEO";
  const who = senderLabel(item, meId);
  const when = `${new Date(item.createdAt).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${formatMessageTime(item.createdAt)}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${isVideo ? "Video" : "Photo"} from ${who}`}
      className="fixed inset-x-0 top-0 z-50 app-height flex flex-col bg-black/95 select-none"
    >
      <header className="flex items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            name={item.senderName}
            avatar={item.senderAvatar}
            className="w-9 h-9 rounded-full"
            textClassName="text-xs"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{who}</p>
            <p className="text-[10px] font-medium text-white/70 truncate">
              {item.conversationName} • {when}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onShowInChat(item)}
            aria-label="Show in chat"
            title="Show in chat"
            className={iconButton}
          >
            <MessageSquare size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDownload(item)}
            aria-label="Download"
            title="Download"
            className={iconButton}
          >
            <Download size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            aria-label="Delete"
            title="Delete"
            className={`${iconButton} hover:bg-rose-500/70`}
          >
            <Trash2 size={17} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className={iconButton}
          >
            <X size={19} />
          </button>
        </div>
      </header>

      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 md:px-20"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        onTouchStart={(event) => {
          const point = event.touches[0];
          touch.current = { x: point.clientX, y: point.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;

          const point = event.changedTouches[0];
          const dx = point.clientX - start.x;
          const dy = point.clientY - start.y;

          if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        <ViewerMedia key={item.id} item={item} who={who} />

        {current > 0 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center cursor-pointer transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {current < last && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center cursor-pointer transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <footer className="pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs font-bold text-white/70 tabular-nums">
        {current + 1} / {items.length}
      </footer>
    </div>,
    document.body,
  );
}
