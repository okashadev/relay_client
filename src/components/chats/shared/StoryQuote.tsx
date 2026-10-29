"use client";

import { readableTextOn } from "@/lib/stories/stories";
import type { StoryRef } from "@/types/chat";

export default function StoryQuote({
  story,
  isMine,
}: {
  story: StoryRef;
  isMine: boolean;
}) {
  const label = isMine ? "You replied to a story" : "Replied to your story";
  const tone = isMine
    ? "border-[#F9D2BA]/60 text-[#F7EAE0]/80"
    : "border-[#1D4533]/40 text-[#5E3122]/70";

  const snippet = !story.available
    ? "Story no longer available"
    : story.caption ||
      (story.type === "VIDEO" ? "Video" : story.type === "IMAGE" ? "Photo" : "Story");

  return (
    <div className={`mb-2 flex items-center gap-2 border-l-2 pl-2 text-[10px] ${tone}`}>
      {story.available && story.type === "TEXT" ? (
        <div
          aria-hidden="true"
          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-black"
          style={{
            backgroundColor: story.backgroundColor ?? "#1D4533",
            color: readableTextOn(story.backgroundColor),
          }}
        >
          Aa
        </div>
      ) : story.available && story.thumbnailUrl ? (
        <img
          src={story.thumbnailUrl}
          alt=""
          loading="lazy"
          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-black/20"
        />
      ) : (
        <div
          aria-hidden="true"
          className="w-10 h-10 rounded-lg shrink-0 border border-dashed border-current opacity-50"
        />
      )}

      <div className="min-w-0">
        <p className="font-bold truncate">{label}</p>
        <p
          className={`line-clamp-1 wrap-anywhere ${
            story.available ? "" : "italic opacity-80"
          }`}
        >
          {snippet}
        </p>
      </div>
    </div>
  );
}