"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreVertical } from "lucide-react";

const RECENT_STATUSES = [
  {
    id: "1",
    name: "Subhan",
    time: "Today at 1:40 AM",
    avatar: "S",
    unread: true,
  },
  {
    id: "2",
    name: "Rabeet",
    time: "Yesterday at 11:13 PM",
    avatar: "R",
    unread: true,
  },
];

const VIEWED_STATUSES = [
  {
    id: "3",
    name: "john",
    time: "Yesterday at 8:12 AM",
    avatar: "j",
    unread: false,
  },
  {
    id: "4",
    name: "Mohsin",
    time: "Yesterday at 6:52 AM",
    avatar: "M",
    unread: false,
  },
];

export default function StoriesList({
  selectedId,
  onSelectStory,
}: {
  selectedId?: string;
  onSelectStory: (story: any) => void;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-[#F7EAE0] overflow-y-auto select-none">
      {/* Header */}
      <div className="p-5 pb-4 flex items-center justify-between sticky top-0 bg-[#F7EAE0] z-10 border-b border-[#1D4533]/10">
        <h1 className="text-2xl font-black text-[#1D4533] tracking-tight">
          Stories
        </h1>
        <div className="flex items-center gap-1 text-[#1D4533]">
          <button className="p-2 rounded-xl hover:bg-[#1D4533]/10 transition-all">
            <MoreVertical size={18} />
          </button>
          <button className="p-2 rounded-xl bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90 transition-all shadow-md">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* My Status Section */}
        <div
          onClick={() =>
            onSelectStory({
              id: "my-status",
              name: "My status",
              time: "Click to add status update",
              avatar: "ME",
            })
          }
          className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer hover:bg-white/50 transition-all group border border-transparent hover:border-[#1D4533]/15"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#1D4533]/15 text-[#1D4533] flex items-center justify-center font-bold text-sm border-2 border-dashed border-[#1D4533]">
              ME
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#1D4533] text-[#F7EAE0] rounded-full flex items-center justify-center border-2 border-[#F7EAE0]">
              <Plus size={10} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D4533] group-hover:underline">
              My Story
            </h3>
            <p className="text-xs text-[#1D4533]/70">
              Click to add story update
            </p>
          </div>
        </div>

        {/* Recent Section */}
        <div>
          <span className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2 block">
            Recent
          </span>
          <div className="space-y-1">
            {RECENT_STATUSES.map((status) => {
              const isSelected = selectedId === status.id;
              return (
                <div
                  key={status.id}
                  onClick={() => onSelectStory(status)}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1D4533] text-[#F7EAE0] shadow-md"
                      : "hover:bg-white/60 text-[#1D4533]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm p-0.5 border-2 ${
                      isSelected
                        ? "border-[#F7EAE0] bg-[#F7EAE0] text-[#1D4533]"
                        : "border-[#1D4533] bg-[#1D4533] text-[#F7EAE0]"
                    }`}
                  >
                    {status.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">
                      {status.name}
                    </h4>
                    <p
                      className={`text-xs truncate ${isSelected ? "text-[#F7EAE0]/70" : "text-[#1D4533]/60"}`}
                    >
                      {status.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viewed Section */}
        <div>
          <span className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/50 uppercase px-1 mb-2 block">
            Viewed
          </span>
          <div className="space-y-1 opacity-80">
            {VIEWED_STATUSES.map((status) => {
              const isSelected = selectedId === status.id;
              return (
                <div
                  key={status.id}
                  onClick={() => onSelectStory(status)}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1D4533] text-[#F7EAE0]"
                      : "hover:bg-white/40 text-[#1D4533]"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm bg-[#1D4533]/20 text-[#1D4533] border border-[#1D4533]/30">
                    {status.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">
                      {status.name}
                    </h4>
                    <p className="text-xs text-[#1D4533]/50 truncate">
                      {status.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
