"use client";

import { useCallback, useRef } from "react";
import { createStory } from "@/lib/api/storyApi";
import { signStoryUpload, uploadToCloudinary } from "@/lib/api/upload";
import type { StoryDraft, StoryItem } from "@/types/story";

export type PublishOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

export function useStoryPublisher() {
  const uploaded = useRef<{ file: File; publicId: string } | null>(null);

  return useCallback(
    async (
      draft: StoryDraft,
      options: PublishOptions = {},
    ): Promise<StoryItem> => {
      if (draft.type === "TEXT") {
        return createStory(
          {
            type: "TEXT",
            caption: draft.caption,
            backgroundColor: draft.backgroundColor,
          },
          options.signal,
        );
      }

      let publicId =
        uploaded.current?.file === draft.file
          ? uploaded.current.publicId
          : null;

      if (!publicId) {
        const upload = await signStoryUpload(draft.type, {
          name: draft.file.name,
          type: draft.file.type,
          size: draft.file.size,
        });

        await uploadToCloudinary(draft.file, upload, options);

        publicId = upload.publicId;
        uploaded.current = { file: draft.file, publicId };
      }

      const story = await createStory(
        { type: draft.type, publicId, caption: draft.caption },
        options.signal,
      );

      uploaded.current = null;
      return story;
    },
    [],
  );
}
