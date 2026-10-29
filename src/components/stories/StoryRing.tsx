"use client";

import UserAvatar from "@/components/common/UserAvatar";
import type { StoryOwner } from "@/types/story";

const GAP_DEGREES = 8;
const MAX_SEGMENTS = 24;
const STROKE = 2.5;

export default function StoryRing({
  user,
  segments,
  size = 52,
  dashed = false,
}: {
  user: StoryOwner;
  segments: boolean[];
  size?: number;
  dashed?: boolean;
}) {
  const radius = (size - STROKE) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const count = segments.length;
  const split = count > 1 && count <= MAX_SEGMENTS;
  const gap = split ? (GAP_DEGREES / 360) * circumference : 0;
  const length = (split ? circumference / count : circumference) - gap;
  const allSeen = count > 0 && segments.every(Boolean);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {dashed || count === 0 ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeDasharray="4 4"
            className="text-[#1D4533]/60"
          />
        ) : split ? (
          segments.map((seen, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE}
              strokeDasharray={`${length} ${circumference - length}`}
              transform={`rotate(${-90 + (360 / count) * index + GAP_DEGREES / 2} ${center} ${center})`}
              className={seen ? "text-[#1D4533]/25" : "text-[#1D4533]"}
            />
          ))
        ) : (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className={allSeen ? "text-[#1D4533]/25" : "text-[#1D4533]"}
          />
        )}
      </svg>

      <div
        className="absolute rounded-full overflow-hidden"
        style={{ inset: STROKE + 2.5 }}
      >
        <UserAvatar
          name={user.name}
          avatar={user.avatar}
          className="w-full h-full rounded-full"
          textClassName="text-xs"
        />
      </div>
    </div>
  );
}