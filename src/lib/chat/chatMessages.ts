import { isSameDay } from "@/lib/format";
import type { ChatMessage, MessageType, ReplyDraft } from "@/types/chat";

const EMPTY_MESSAGE: ChatMessage = {
  id: "",
  clientId: null,
  senderId: null,
  sender: null,
  type: "TEXT",
  content: null,
  mediaUrl: null,
  thumbnailUrl: null,
  mediaMimeType: null,
  fileName: null,
  mediaSize: null,
  mediaWidth: null,
  mediaHeight: null,
  mediaDuration: null,
  replyTo: null,
  reactions: [],
  editedAt: null,
  deletedAt: null,
  createdAt: "",
};

const toReplyRef = (reply: ReplyDraft | null): ChatMessage["replyTo"] =>
  reply
    ? {
        id: reply.id,
        content: reply.content,
        senderName: reply.senderName,
        type: reply.type,
        fileName: reply.fileName,
      }
    : null;

export const createOutgoingText = (
  content: string,
  senderId: string,
  reply: ReplyDraft | null,
): ChatMessage => {
  const id = crypto.randomUUID();

  return {
    ...EMPTY_MESSAGE,
    id,
    clientId: id,
    senderId,
    content,
    replyTo: toReplyRef(reply),
    createdAt: new Date().toISOString(),
    status: "sending",
  };
};

export const createOutgoingMedia = (options: {
  clientId: string;
  type: Exclude<MessageType, "TEXT" | "SYSTEM">;
  senderId: string;
  file: File;
  blobUrl: string;
  caption: string | null;
  reply: ReplyDraft | null;
  durationHint: number | null;
}): ChatMessage => ({
  ...EMPTY_MESSAGE,
  id: options.clientId,
  clientId: options.clientId,
  senderId: options.senderId,
  type: options.type,
  content: options.caption,
  mediaUrl: options.blobUrl,
  mediaMimeType: options.file.type || null,
  fileName: options.type === "FILE" ? options.file.name : null,
  mediaSize: options.file.size,
  mediaDuration: options.durationHint,
  replyTo: toReplyRef(options.reply),
  createdAt: new Date().toISOString(),
  status: "uploading",
  uploadProgress: 0,
});

export const isPendingMessage = (message: ChatMessage) =>
  message.status !== undefined;

const byTime = (a: ChatMessage, b: ChatMessage) =>
  Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id);

export const mergeMessages = (
  previous: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] => {
  const result = [...previous];

  for (const message of incoming) {
    const index = result.findIndex(
      (existing) =>
        existing.id === message.id ||
        (message.clientId !== null && existing.clientId === message.clientId),
    );

    if (index === -1) result.push(message);
    else result[index] = message;
  }

  return [
    ...result.filter((message) => !isPendingMessage(message)).sort(byTime),
    ...result.filter(isPendingMessage),
  ];
};

export const isFirstInRun = (messages: ChatMessage[], index: number) => {
  const current = messages[index];
  const previous = messages[index - 1];

  return (
    !previous ||
    previous.senderId !== current.senderId ||
    previous.type === "SYSTEM" ||
    current.type === "SYSTEM" ||
    !isSameDay(previous.createdAt, current.createdAt)
  );
};
