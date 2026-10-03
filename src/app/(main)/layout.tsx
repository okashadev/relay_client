'use client';

import React from 'react';
import AppSidebar from '@/components/main/AppSidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full flex bg-[#F7EAE0] overflow-hidden">
      <AppSidebar />
      
      {/* Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}