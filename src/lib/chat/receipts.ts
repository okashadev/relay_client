import type { ChatMessage, Receipts } from "@/types/chat";

export type MessageTick = "pending" | "failed" | "sent" | "delivered" | "read";

const toMs = (iso: string | null) => (iso ? Date.parse(iso) : -Infinity);

export const maxIso = (a: string | null, b: string | null) =>
  toMs(a) >= toMs(b) ? a : b;

export const tickFor = (message: ChatMessage, receipts: Receipts): MessageTick => {
  if (message.status === "failed") return "failed";
  
  if (message.status) return "pending";

  const sentAt = Date.parse(message.createdAt);

  if (sentAt <= toMs(receipts.readUpTo)) return "read";
  if (sentAt <= toMs(receipts.deliveredUpTo)) return "delivered";

  return "sent";
};