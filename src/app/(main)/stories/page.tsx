"use client";

import React, { useState } from "react";
import StoriesList from "@/components/stories/StoriesList";
import StoryViewer from "@/components/stories/StoryViewer";
import EmptyStoriesState from "@/components/stories/EmptyStoriesState";

export default function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  return (
    <div className="flex h-full w-full bg-[#F7EAE0] overflow-hidden">
      <div className="w-full md:w-85 lg:w-95 shrink-0 border-r border-[#1D4533]/10 h-full flex flex-col bg-[#F7EAE0]">
        <StoriesList
          selectedId={selectedStory?.id}
          onSelectStory={(story) => setSelectedStory(story)}
        />
      </div>

      <div className="hidden md:flex flex-1 h-full bg-[#F7EAE0]/50 overflow-hidden">
        {selectedStory ? (
          <StoryViewer story={selectedStory} />
        ) : (
          <EmptyStoriesState />
        )}
      </div>
    </div>
  );
}
