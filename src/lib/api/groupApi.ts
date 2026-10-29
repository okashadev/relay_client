import type { SignedUpload } from "@/types/uploads";
import type { GroupMemberItem } from "@/types/chat";
import { apiRequest } from "./apiRequest";

export type CreateGroupBody = {
  name: string;
  description?: string;
  memberIds: string[];
};

export type UpdateGroupBody = {
  name?: string;
  description?: string;
  avatarPublicId?: string;
  removeAvatar?: boolean;
};

const groupPath = (id: string) => `/api/group/${encodeURIComponent(id)}`;

export const createGroup = (body: CreateGroupBody, signal?: AbortSignal) =>
  apiRequest<{ conversation: { id: string; name: string } }>("/api/group", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });

export const updateGroup = (id: string, body: UpdateGroupBody) =>
  apiRequest<{
    group: {
      id: string;
      name: string;
      description: string | null;
      avatar: string | null;
    };
  }>(groupPath(id), { method: "PATCH", body: JSON.stringify(body) });

export const signGroupAvatar = async (
  id: string,
  file: { type: string; size: number },
) => {
  const data = await apiRequest<{ upload: SignedUpload }>(
    `${groupPath(id)}/avatar/sign`,
    {
      method: "POST",
      body: JSON.stringify({ mimeType: file.type, size: file.size }),
    },
  );

  return data.upload;
};

export const addMembers = (id: string, memberIds: string[]) =>
  apiRequest<{ members: GroupMemberItem[] }>(`${groupPath(id)}/members`, {
    method: "POST",
    body: JSON.stringify({ memberIds }),
  });

export const removeMember = (id: string, memberId: string) =>
  apiRequest<{ success: true }>(
    `${groupPath(id)}/members/${encodeURIComponent(memberId)}`,
    { method: "DELETE" },
  );

export const setMemberRole = (
  id: string,
  memberId: string,
  role: "ADMIN" | "MEMBER",
) =>
  apiRequest<{ role: "ADMIN" | "MEMBER" }>(
    `${groupPath(id)}/members/${encodeURIComponent(memberId)}/role`,
    { method: "PATCH", body: JSON.stringify({ role }) },
  );

export const leaveGroup = (id: string) =>
  apiRequest<{ success: true }>(`${groupPath(id)}/leave`, { method: "POST" });
