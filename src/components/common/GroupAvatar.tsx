"use client";

import { useState } from "react";
import { Users } from "lucide-react";

export default function GroupAvatar({
  name,
  avatar,
  className = "w-10 h-10 rounded-2xl",
  iconClassName = "w-5 h-5",
}: {
  name: string;
  avatar: string | null;
  className?: string;
  iconClassName?: string;
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
      aria-hidden="true"
      className={`${className} bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center shadow shrink-0`}
    >
      <Users className={iconClassName} />
    </div>
  );
}