import type { SignedUpload } from "@/types/uploads";
import { apiRequest } from "./apiRequest";

export type ProfileUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  provider: "LOCAL" | "GOOGLE";
};

export type UpdateProfileBody = {
  name?: string;
  username?: string;
  bio?: string;
  avatarPublicId?: string;
  removeAvatar?: boolean;
};

export const updateProfile = async (body: UpdateProfileBody) => {
  const data = await apiRequest<{ user: ProfileUser }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return data.user;
};

export const checkUsername = async (username: string, signal?: AbortSignal) => {
  const data = await apiRequest<{ available: boolean }>(
    `/api/profile/username-available?username=${encodeURIComponent(username)}`,
    { signal },
  );

  return data.available;
};

export const signAvatarUpload = async (file: {
  type: string;
  size: number;
}) => {
  const data = await apiRequest<{ upload: SignedUpload }>(
    "/api/profile/avatar/sign",
    {
      method: "POST",
      body: JSON.stringify({ mimeType: file.type, size: file.size }),
    },
  );

  return data.upload;
};
