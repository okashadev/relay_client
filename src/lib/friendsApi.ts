import { apiFetch } from "./api";
import { apiRequest } from "./apiRequest";

export type Relationship =
  | "NONE"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"
  | "FRIENDS";

export type FriendUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  relationship: Relationship;
  status: "ONLINE" | "OFFLINE";
  friendshipId: string | null;
};

type RelationshipResult = {
  relationship: Relationship;
  friendshipId: string | null;
};

export const fetchSuggestions = async (
  limit: number,
  signal?: AbortSignal,
): Promise<FriendUser[]> => {
  const data = await apiRequest<{ users: FriendUser[] }>(
    `/api/friends/suggestions?limit=${limit}`,
    { signal },
  );
  return data.users ?? [];
};

export const searchUsers = async (
  query: string,
  signal?: AbortSignal,
): Promise<FriendUser[]> => {
  const data = await apiRequest<{ users: FriendUser[] }>(
    `/api/friends/search?q=${encodeURIComponent(query)}`,
    { signal },
  );
  return data.users ?? [];
};

export const sendFriendRequest = (receiverId: string) =>
  apiRequest<{ relationship: Relationship; friendshipId: string | null }>(
    "/api/friends/request",
    {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    },
  );

export const cancelFriendRequest = (friendshipId: string) =>
  apiRequest<{
    message: string;
    relationship: Relationship;
    friendshipId: string | null;
  }>(`/api/friends/request/${encodeURIComponent(friendshipId)}`, {
    method: "DELETE",
  });

export const acceptFriendRequest = (friendshipId: string) =>
  apiRequest<RelationshipResult>(
    `/api/friends/request/${encodeURIComponent(friendshipId)}/accept`,
    { method: "POST" },
  );

export const rejectFriendRequest = (friendshipId: string) =>
  apiRequest<RelationshipResult>(
    `/api/friends/request/${encodeURIComponent(friendshipId)}/reject`,
    { method: "POST" },
  );

export const fetchFriends = async (signal?: AbortSignal): Promise<FriendUser[]> => {
  const data = await apiRequest<{ friends: FriendUser[] }>("/api/friends", {
    signal,
  });
  return data.friends ?? [];
};
