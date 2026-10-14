"use client";

import { Fragment, memo } from "react";
import MessageBubble from "@/components/chats/shared/MessageBubble";
import { isFirstInRun } from "@/lib/chatMessages";
import { formatDayLabel, isSameDay } from "@/lib/format";
import type { ChatMessage } from "@/types/chat";

const MessageList = memo(function MessageList({
  messages,
  meId,
  showSender = false,
}: {
  messages: ChatMessage[];
  meId: string;
  showSender?: boolean;
}) {
  return (
    <>
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showDay =
          !previous || !isSameDay(previous.createdAt, message.createdAt);

        return (
          <Fragment key={message.id}>
            {showDay && (
              <div className="flex justify-center pt-3 pb-1">
                <span className="px-3 py-1 rounded-full bg-[#1D4533]/10 text-[10px] font-semibold text-[#1D4533]">
                  {formatDayLabel(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              isMine={message.senderId === meId}
              isFirstInRun={isFirstInRun(messages, index)}
              showSender={showSender}
            />
          </Fragment>
        );
      })}
    </>
  );
});

export default MessageList;