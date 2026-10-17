"use client";

import { Fragment, memo } from "react";
import MessageBubble from "@/components/chats/shared/MessageBubble";
import { isFirstInRun } from "@/lib/chat/chatMessages";
import { formatDayLabel, isSameDay } from "@/lib/format";
import { tickFor } from "@/lib/chat/receipts";
import type { ChatMessage, Receipts } from "@/types/chat";

const MessageList = memo(function MessageList({
  messages,
  meId,
  receipts,
  showSender = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRetry,
  onDiscard,
}: {
  messages: ChatMessage[];
  meId: string;
  receipts: Receipts;
  showSender?: boolean;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onReact?: (message: ChatMessage, emoji: string) => void;
  onRetry?: (clientId: string) => void;
  onDiscard?: (clientId: string) => void;
}) {
  return (
    <>
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showDay =
          !previous || !isSameDay(previous.createdAt, message.createdAt);
        const isMine = message.senderId === meId;

        return (
          <Fragment key={message.clientId ?? message.id}>
            {showDay && (
              <div className="flex justify-center pt-3 pb-1">
                <span className="px-3 py-1 rounded-full bg-[#1D4533]/10 text-[10px] font-semibold text-[#1D4533]">
                  {formatDayLabel(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              isMine={isMine}
              isFirstInRun={isFirstInRun(messages, index)}
              showSender={showSender}
              tick={isMine ? tickFor(message, receipts) : undefined}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReact={onReact}
              onRetry={onRetry}
              onDiscard={onDiscard}
            />
          </Fragment>
        );
      })}
    </>
  );
});

export default MessageList;