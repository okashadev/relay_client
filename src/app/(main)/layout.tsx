"use client";

import React from "react";
import AppSidebar from "@/components/main/AppSidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import NotificationsSync from "@/components/notifications/NotificationsSync";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGuard>
        <NotificationsSync />
        <div className="h-screen w-full flex bg-[#F7EAE0] overflow-hidden">
          <AppSidebar />

          <main className="flex-1 flex overflow-hidden">{children}</main>
        </div>
      </AuthGuard>
    </>
  );
}
