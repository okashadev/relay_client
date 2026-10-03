'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ChatList from '@/components/main/ChatList';

export default function AppMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const pathSegments = pathname.split('/');
  const activeChatId = pathSegments.length > 2 ? pathSegments[2] : undefined;

  const handleSelectChat = (chatId: string) => {
    router.push(`/app/${chatId}`);
  };

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Left Chat List (Fixed Persistent Sidebar List) */}
      <ChatList
        selectedChatId={activeChatId}
        onSelectChat={handleSelectChat}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}