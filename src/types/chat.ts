export type PresenceStatus = "ONLINE" | "OFFLINE";
export type ConversationType = "DIRECT" | "GROUP";
export type ParticipantRole = "OWNER" | "ADMIN" | "MEMBER";
export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "FILE"
  | "VOICE"
  | "SYSTEM";

export type ChatUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  status: PresenceStatus;
  lastSeen: string | null;
};

export type ChatSender = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
};

export type ChatPreviewMessage = {
  type: MessageType;
  content: string | null;
  fileName: string | null;
  senderName: string | null;
  isMine: boolean;
  deleted: boolean;
};

export type ChatPreview = {
  id: string;
  type: ConversationType;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastMessage: ChatPreviewMessage | null;
  lastMessageAt: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
};

export type ChatMessage = {
  id: string;
  clientId: string | null;
  senderId: string | null;
  sender?: ChatSender | null;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  fileName: string | null;
  mediaSize: number | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
  replyTo: {
    id: string;
    content: string | null;
    senderName: string | null;
  } | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  status?: "sending" | "failed";
};

export type GroupMemberItem = {
  user: ChatUser;
  role: ParticipantRole;
};

export type ChatGroup = {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  createdAt: string;
  createdBy: { id: string; name: string } | null;
  myRole: ParticipantRole;
  members: GroupMemberItem[];
};

export type SharedMediaItem = {
  id: string;
  type: "IMAGE" | "VIDEO" | "FILE";
  fileName: string | null;
  mediaUrl: string | null;
};

export type ConversationMeState = {
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
};

export type DirectConversationDetails = {
  id: string;
  type: "DIRECT";
  lastMessageAt: string;
  createdAt: string;
  otherUser: ChatUser;
  me: ConversationMeState;
};

export type GroupConversationDetails = ChatGroup & {
  type: "GROUP";
  me: ConversationMeState;
};

export type ConversationDetails =
  | DirectConversationDetails
  | GroupConversationDetails;
