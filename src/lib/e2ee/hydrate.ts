import type { ChatMessage, ChatPreview, ChatPreviewMessage } from "@/types/chat";
import type { MediaItem } from "@/types/media";
import type { MessagePayload } from "@/types/e2ee";
import { getKeyForEpoch } from "./chatKeys";
import { decryptPayload } from "./primitives";

const decode = async (
  conversationId: string,
  ciphertext: string,
  epoch: number,
): Promise<MessagePayload | null> => {
  try {
    const key = await getKeyForEpoch(conversationId, epoch);
    return decryptPayload<MessagePayload>(key, conversationId, epoch, ciphertext);
  } catch {
    return null;
  }
};

export const hydrateMessage = async (
  conversationId: string,
  message: ChatMessage,
): Promise<ChatMessage> => {
  let replyTo = message.replyTo;

  if (replyTo?.ciphertext && replyTo.keyEpoch) {
    const quoted = await decode(conversationId, replyTo.ciphertext, replyTo.keyEpoch);
    replyTo = {
      ...replyTo,
      content: quoted?.text ?? null,
      fileName: quoted?.file?.name ?? null,
    };
  }

  if (message.type === "SYSTEM" || message.deletedAt || !message.ciphertext || !message.keyEpoch) {
    return { ...message, replyTo };
  }

  const payload = await decode(conversationId, message.ciphertext, message.keyEpoch);

  if (!payload) return { ...message, replyTo, payload: null, decryptFailed: true };

  return {
    ...message,
    replyTo,
    payload,
    decryptFailed: false,
    content: payload.text ?? null,
    fileName: payload.file?.name ?? null,
    mediaMimeType: payload.file?.mime ?? null,
    mediaWidth: payload.file?.width ?? null,
    mediaHeight: payload.file?.height ?? null,
    mediaDuration: payload.file?.duration ?? null,
  };
};

export const hydrateMessages = (conversationId: string, messages: ChatMessage[]) =>
  Promise.all(messages.map((message) => hydrateMessage(conversationId, message)));

const preview = (text: string) => Array.from(text).slice(0, 80).join("");

export const hydrateChats = async (
  chats: ChatPreview[],
  onEach: (conversationId: string, lastMessageAt: string, patch: Partial<ChatPreviewMessage>) => void,
) => {
  const queue = chats.filter((chat) => {
    const last = chat.lastMessage;
    return (
      last &&
      !last.deleted &&
      last.ciphertext &&
      last.keyEpoch &&
      (last.type === "TEXT" || last.type === "FILE")
    );
  });

  const worker = async () => {
    for (let chat = queue.shift(); chat; chat = queue.shift()) {
      const last = chat.lastMessage as ChatPreviewMessage;
      const payload = await decode(chat.id, last.ciphertext as string, last.keyEpoch as number);

      onEach(
        chat.id,
        chat.lastMessageAt,
        payload
          ? { content: payload.text ? preview(payload.text) : null, fileName: payload.file?.name ?? null }
          : { decryptFailed: true },
      );
    }
  };

  await Promise.all(Array.from({ length: 4 }, worker));
};

export const hydrateMediaItems = (items: MediaItem[]) =>
  Promise.all(
    items.map(async (item): Promise<MediaItem> => {
      if (!item.ciphertext || !item.keyEpoch) return item;

      const payload = await decode(item.conversationId, item.ciphertext, item.keyEpoch);

      if (!payload) return { ...item, decryptFailed: true };

      return {
        ...item,
        payload,
        fileName: payload.file?.name ?? null,
        mediaMimeType: payload.file?.mime ?? "",
        mediaWidth: payload.file?.width ?? null,
        mediaHeight: payload.file?.height ?? null,
        mediaDuration: payload.file?.duration ?? null,
      };
    }),
  );