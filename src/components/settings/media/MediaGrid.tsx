"use client";

import { useMemo } from "react";
import { Play } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { groupByMonth, senderLabel } from "@/lib/mediaGallery";
import type { MediaItem } from "@/types/media";

export default function MediaGrid({
  items,
  meId,
  onOpen,
}: {
  items: MediaItem[];
  meId: string;
  onOpen: (index: number) => void;
}) {
  const groups = useMemo(() => groupByMonth(items), [items]);
  const indexById = useMemo(
    () => new Map(items.map((item, index) => [item.id, index])),
    [items],
  );

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key}>
          <h3 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2">
            {group.label}
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-1.5">
            {group.items.map((item) => {
              const isVideo = item.type === "VIDEO";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpen(indexById.get(item.id) ?? 0)}
                  aria-label={`${isVideo ? "Video" : "Photo"} from ${senderLabel(item, meId)} in ${item.conversationName}`}
                  className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-[#1D4533]/10 cursor-pointer transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnailUrl ?? item.mediaUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-105"
                  />

                  {isVideo && (
                    <>
                      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/55 to-transparent" />
                      <span className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] font-bold text-white">
                        <Play size={11} className="fill-current" />
                        {item.mediaDuration !== null &&
                          formatDuration(item.mediaDuration)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}