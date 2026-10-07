"use client";

import { useState } from "react";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export default function UserAvatar({
  name,
  avatar,
  className = "w-12 h-12 rounded-2xl",
}: {
  name: string;
  avatar: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (avatar && !failed) {
    return (
      <img
        src={avatar}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${className} object-cover shadow shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center font-bold text-sm shadow shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}