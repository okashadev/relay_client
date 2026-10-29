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

export type RelationshipResult = {
  relationship: Relationship;
  friendshipId: string | null;
};