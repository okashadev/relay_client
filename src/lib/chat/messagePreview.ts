import type { MessageType } from "@/types/chat";

type Describable = {
  type: MessageType;
  content: string | null;
  fileName: string | null;
};

export const describeMessage = (message: Describable): string => {
  switch (message.type) {
    case "IMAGE":
      return message.content || "Photo";
    case "VIDEO":
      return message.content || "Video";
    case "VOICE":
      return "Voice message";
    case "FILE":
      return message.fileName || "File";
    default:
      return message.content ?? "";
  }
};