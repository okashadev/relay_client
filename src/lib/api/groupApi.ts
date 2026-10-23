import { apiRequest } from "./apiRequest";

export type CreateGroupBody = {
  name: string;
  description: string;
  memberIds: string[];
};

export const createGroup = async (body: CreateGroupBody, signal?: AbortSignal) =>
  apiRequest<{ success: boolean; conversation: any }>("/api/group/create", {
    method: "POST",
    body: JSON.stringify(body),
    signal
  });
