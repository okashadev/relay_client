"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import ChatList from "@/components/main/ChatList";

export default function AppMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const activeChatId = pathname.split("/")[2] || undefined;

  return (
    <div className="flex-1 min-w-0 h-full flex overflow-hidden bg-[#F7EAE0]">
      <div
        className={`${
          activeChatId ? "hidden md:flex" : "flex"
        } w-full md:w-85 lg:w-95 h-full shrink-0`}
      >
        <ChatList
          selectedChatId={activeChatId}
          onSelectChat={(chatId: string) => router.push(`/app/${chatId}`)}
        />
      </div>

      <div
        className={`${
          activeChatId ? "flex" : "hidden md:flex"
        } flex-1 min-w-0 h-full overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}