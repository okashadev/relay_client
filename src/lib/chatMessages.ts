import { isSameDay } from "@/lib/format";
import type { ChatMessage } from "@/types/chat";

export const createOutgoingMessage = (
  content: string,
  senderId: string,
): ChatMessage => {
  const id = crypto.randomUUID();

  return {
    id,
    clientId: id,
    senderId,
    sender: null,
    type: "TEXT",
    content,
    mediaUrl: null,
    fileName: null,
    mediaSize: null,
    mediaWidth: null,
    mediaHeight: null,
    replyTo: null,
    editedAt: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
  };
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