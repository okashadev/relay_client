"use client";

import React from "react";
import AppSidebar from "@/components/main/AppSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import NotificationsSync from "@/components/notifications/NotificationsSync";
import SocketProvider from "@/components/providers/SocketProvider";
import RealtimeNotifications from "@/components/realtime/RealtimeNotifications";
import ViewportHeightSync from "@/components/ViewportHeightSync";
import RealtimeMessages from "@/components/realtime/RealtimeMessages";
import PresenceSync from "@/components/realtime/PresenceSync";
import RealtimeTyping from "@/components/realtime/RealtimeTyping";
import E2eeBootstrap from "@/components/e2ee/E2eeBootstrap";
import RealtimeDevices from "@/components/realtime/RealtimeDevices";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <E2eeBootstrap>
        <NotificationsSync />
        <SocketProvider />
        <RealtimeNotifications />
        <RealtimeMessages />
        <RealtimeDevices />
        <PresenceSync />
        <RealtimeTyping />
        <ViewportHeightSync />

        <div className="app-height w-full flex flex-col md:flex-row bg-[#F7EAE0] overflow-hidden pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
          <AppSidebar />

          <main className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
            {children}
          </main>
        </div>
      </E2eeBootstrap>
    </AuthGuard>
  );
}
