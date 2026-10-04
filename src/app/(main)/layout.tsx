"use client";

import React from "react";
import AppSidebar from "@/components/main/AppSidebar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthGuard>
        <div className="h-screen w-full flex bg-[#F7EAE0] overflow-hidden">
          <AppSidebar />

          <main className="flex-1 flex overflow-hidden">{children}</main>
        </div>
      </AuthGuard>
    </>
  );
}
