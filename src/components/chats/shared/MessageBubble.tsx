"use client";

import { memo } from "react";
import {
  Ban,
  CheckCheck,
  Clock,
  Download,
  FileText,
  Film,
  Mic,
} from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import { formatFileSize, formatMessageTime } from "@/lib/format";
import type { ChatMessage } from "@/types/chat";

function MessageContent({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  if (message.deletedAt) {
    return (
      <p className="flex items-center gap-1.5 italic opacity-70">
        <Ban className="w-3.5 h-3.5 shrink-0" />
        This message was deleted
      </p>
    );
  }

  const textClass = "font-medium whitespace-pre-wrap [overflow-wrap:anywhere]";

  switch (message.type) {
    case "IMAGE":
      return (
        <div className="space-y-2">
          {message.mediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.mediaUrl}
              alt={message.content ?? "Image"}
              loading="lazy"
              // Pehle se jagah reserve, taake image load hone par list kood na jaye
              style={
                message.mediaWidth && message.mediaHeight
                  ? {
                      aspectRatio: `${message.mediaWidth} / ${message.mediaHeight}`,
                    }
                  : undefined
              }
              className="w-full max-h-80 rounded-xl object-cover bg-[#1D4533]/10"
            />
          )}
          {message.content && <p className={textClass}>{message.content}</p>}
        </div>
      );

    case "FILE":
    case "VIDEO":
    case "VOICE": {
      const Icon =
        message.type === "VIDEO"
          ? Film
          : message.type === "VOICE"
            ? Mic
            : FileText;
      const label =
        message.fileName ??
        (message.type === "VOICE" ? "Voice message" : "Attachment");

      return (
        <div
          className={`flex items-center justify-between gap-3 p-2 rounded-xl border ${
            isMine
              ? "bg-[#F7EAE0]/10 border-[#F7EAE0]/20"
              : "bg-[#1D4533]/5 border-[#1D4533]/10"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p
                className={`font-bold text-xs truncate ${
                  isMine ? "text-[#F7EAE0]" : "text-[#1D4533]"
                }`}
              >
                {label}
              </p>
              {message.mediaSize ? (
                <p className="text-[10px] opacity-60">
                  {formatFileSize(message.mediaSize)}
                </p>
              ) : null}
            </div>
          </div>
          {message.mediaUrl && (
            <a
              href={message.mediaUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Download ${label}`}
              className="w-8 h-8 rounded-lg bg-[#1D4533]/10 hover:bg-[#1D4533] hover:text-[#F9D2BA] transition-colors flex items-center justify-center shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      );
    }

    default:
      return <p className={textClass}>{message.content}</p>;
  }
}

type MessageBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  isFirstInRun: boolean;
  // Group chat: incoming messages par avatar aur naam
  showSender?: boolean;
};

// memo: sirf wahi bubble dobara render hota hai jis ka data badla
const MessageBubble = memo(function MessageBubble({
  message,
  isMine,
  isFirstInRun,
  showSender = false,
}: MessageBubbleProps) {
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 rounded-lg bg-[#1D4533]/5 border border-[#1D4533]/10 text-[10px] text-center text-[#5E3122]/70 font-medium [overflow-wrap:anywhere]">
          {message.content}
        </span>
      </div>
    );
  }

  const isDeleted = Boolean(message.deletedAt);
  const senderName = message.sender?.name ?? "Deleted user";
  const showAvatarColumn = showSender && !isMine;

  return (
    <div
      className={`flex items-start gap-2 ${
        isMine ? "justify-end" : "justify-start"
      } ${isFirstInRun ? "mt-3" : "mt-0.5"}`}
    >
      {showAvatarColumn && (
        <div className="w-8 shrink-0">
          {isFirstInRun && (
            <UserAvatar
              name={senderName}
              avatar={message.sender?.avatar ?? null}
              className="w-8 h-8 rounded-xl"
              textClassName="text-[10px]"
            />
          )}
        </div>
      )}

      <div className="max-w-[80%] md:max-w-[65%] min-w-0">
        {showAvatarColumn && isFirstInRun && (
          <p className="text-xs font-bold text-[#1D4533] truncate mb-1 ml-1">
            {senderName}
          </p>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed ${
            isMine
              ? "bg-[#1D4533] text-[#F7EAE0] rounded-br-sm"
              : "bg-white text-[#5E3122] rounded-bl-sm border border-[#1D4533]/10"
          }`}
        >
          {message.replyTo && !isDeleted && (
            <div
              className={`mb-2 border-l-2 pl-2 text-[10px] ${
                isMine
                  ? "border-[#F9D2BA]/60 text-[#F7EAE0]/80"
                  : "border-[#1D4533]/40 text-[#5E3122]/70"
              }`}
            >
              <p className="font-bold truncate">
                {message.replyTo.senderName ?? "Message"}
              </p>
              <p className="line-clamp-2 [overflow-wrap:anywhere]">
                {message.replyTo.content ?? "Attachment"}
              </p>
            </div>
          )}

          <MessageContent message={message} isMine={isMine} />

          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
              isMine ? "text-[#F9D2BA]/70" : "text-[#5E3122]/50"
            }`}
          >
            {message.editedAt && !isDeleted && <span>edited</span>}
            <time dateTime={message.createdAt}>
              {formatMessageTime(message.createdAt)}
            </time>
            {isMine &&
              (message.status === "sending" ? (
                <Clock className="w-3 h-3" />
              ) : message.status === "failed" ? (
                <span className="font-bold text-rose-300">Failed</span>
              ) : (
                <CheckCheck className="w-3 h-3 text-[#F9D2BA]" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;