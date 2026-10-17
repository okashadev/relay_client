import type { ChatMessage } from "@/types/chat";

export const EDIT_WINDOW_MS = 15 * 60 * 1000;
export const DELETE_EVERYONE_WINDOW_MS = 48 * 60 * 60 * 1000;

const EDITABLE_TYPES = new Set(["TEXT", "IMAGE", "VIDEO", "FILE"]);

const ageOf = (message: ChatMessage) => Date.now() - Date.parse(message.createdAt);

export const canEditMessage = (message: ChatMessage, isMine: boolean) =>
  isMine &&
  !message.status &&
  !message.deletedAt &&
  EDITABLE_TYPES.has(message.type) &&
  ageOf(message) <= EDIT_WINDOW_MS;

export const canDeleteForEveryone = (message: ChatMessage, isMine: boolean) =>
  isMine &&
  !message.status &&
  !message.deletedAt &&
  ageOf(message) <= DELETE_EVERYONE_WINDOW_MS;