"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  addMembers,
  leaveGroup,
  removeMember,
  setMemberRole,
  signGroupAvatar,
  updateGroup,
  type UpdateGroupBody,
} from "@/lib/api/groupApi";
import { uploadToCloudinary } from "@/lib/api/upload";
import { useChatListStore } from "@/store/chatListStore";

export type GroupEdit = {
  name?: string;
  description?: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
};

type UploadOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

export function useGroupActions(
  conversationId: string,
  refresh: () => Promise<void> | void,
) {
  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      success: string,
      fallback: string,
    ) => {
      try {
        await action();
        toast.success(success);
        useChatListStore.getState().invalidate();
        await refresh();
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return false;
        }

        toast.error(error instanceof Error ? error.message : fallback);
        return false;
      }
    },
    [refresh],
  );

  return useMemo(
    () => ({
      add: (memberIds: string[]) =>
        run(
          () => addMembers(conversationId, memberIds),
          memberIds.length === 1
            ? "Member added."
            : `${memberIds.length} members added.`,
          "Couldn't add members.",
        ),

      remove: (memberId: string) =>
        run(
          () => removeMember(conversationId, memberId),
          "Member removed.",
          "Couldn't remove the member.",
        ),

      setRole: (memberId: string, role: "ADMIN" | "MEMBER") =>
        run(
          () => setMemberRole(conversationId, memberId, role),
          role === "ADMIN" ? "Made group admin." : "Removed as admin.",
          "Couldn't change the role.",
        ),

      leave: () =>
        run(
          () => leaveGroup(conversationId),
          "You left the group.",
          "Couldn't leave the group.",
        ),

      update: (edit: GroupEdit, options: UploadOptions = {}) =>
        run(
          async () => {
            const body: UpdateGroupBody = {};

            if (edit.name !== undefined) body.name = edit.name;
            if (edit.description !== undefined)
              body.description = edit.description;

            if (edit.avatarFile) {
              const upload = await signGroupAvatar(
                conversationId,
                edit.avatarFile,
              );
              await uploadToCloudinary(edit.avatarFile, upload, options);
              body.avatarPublicId = upload.publicId;
            } else if (edit.removeAvatar) {
              body.removeAvatar = true;
            }

            await updateGroup(conversationId, body);
          },
          "Group updated.",
          "Couldn't update the group.",
        ),
    }),
    [conversationId, run],
  );
}

export type GroupActions = ReturnType<typeof useGroupActions>;
