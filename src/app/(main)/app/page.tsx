"use client";
import EmptyState from "@/components/main/EmptyState";

export default function HomePage() {
  return (
    <>
      <div className="w-full h-full flex overflow-hidden">
        <div className="hidden md:flex flex-1">
          <EmptyState />
        </div>
      </div>
    </>
  );
}
