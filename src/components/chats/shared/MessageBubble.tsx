"use client";

import { memo, useRef, useState } from "react";
import {
  Ban,
  Check,
  CheckCheck,
  Clock,
  Copy,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Reply,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import MediaViewer from "@/components/chats/shared/MediaViewer";
import MessageActionSheet, {
  type SheetAction,
} from "@/components/chats/shared/MessageActionSheet";
import VoicePlayer from "@/components/chats/shared/VoicePlayer";
import UserAvatar from "@/components/common/UserAvatar";
import { downloadFile } from "@/lib/chat/downloadFile";
import { formatFileSize, formatMessageTime } from "@/lib/format";
import { describeMessage } from "@/lib/chat/messagePreview";
import { canEditMessage } from "@/lib/chat/messageRules";
import type { MessageTick } from "@/lib/chat/receipts";
import type { ChatMessage } from "@/types/chat";

const aspectStyle = (message: ChatMessage) =>
  message.mediaWidth && message.mediaHeight
    ? { aspectRatio: `${message.mediaWidth} / ${message.mediaHeight}` }
    : undefined;

function MessageContent({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  if (message.deletedAt) {
    return (
      <p className="flex items-center gap-1.5 italic opacity-70">
        <Ban className="w-3.5 h-3.5 shrink-0" />
        This message was deleted
      </p>
    );
  }

  const textClass = "font-medium whitespace-pre-wrap [overflow-wrap:anywhere]";
  const caption = message.content ? (
    <p className={textClass}>{message.content}</p>
  ) : null;

  switch (message.type) {
    case "IMAGE": {
      const src = thumbFailed
        ? message.mediaUrl
        : (message.thumbnailUrl ?? message.mediaUrl);
      const extension =
        message.mediaMimeType?.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";

      return (
        <div className="space-y-2">
          {src && (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              aria-label="Open photo"
              className="block w-full cursor-zoom-in"
            >
              <img
                src={src}
                alt={message.content ?? "Photo"}
                loading="lazy"
                onError={() => setThumbFailed(true)}
                style={aspectStyle(message)}
                className="w-full max-h-80 rounded-xl object-cover bg-[#1D4533]/10"
              />
            </button>
          )}
          {caption}
          {viewerOpen && message.mediaUrl && (
            <MediaViewer
              src={message.mediaUrl}
              alt={message.content ?? "Photo"}
              fileName={`photo.${extension}`}
              onClose={() => setViewerOpen(false)}
            />
          )}
        </div>
      );
    }

    case "VIDEO":
      return (
        <div className="space-y-2">
          {message.mediaUrl && (
            <video
              src={message.mediaUrl}
              poster={message.thumbnailUrl ?? undefined}
              controls
              playsInline
              preload="metadata"
              style={aspectStyle(message)}
              className="w-full max-h-80 rounded-xl bg-black"
            />
          )}
          {caption}
        </div>
      );

    case "VOICE":
      return message.mediaUrl ? (
        <VoicePlayer
          src={message.mediaUrl}
          durationHint={message.mediaDuration}
          isMine={isMine}
        />
      ) : null;

    case "FILE": {
      const label = message.fileName ?? "Attachment";

      return (
        <div className="space-y-2">
          <div
            className={`flex items-center justify-between gap-3 p-2 rounded-xl border ${
              isMine
                ? "bg-[#F7EAE0]/10 border-[#F7EAE0]/20"
                : "bg-[#1D4533]/5 border-[#1D4533]/10"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
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
            {message.mediaUrl && !message.status && (
              <button
                type="button"
                onClick={() => downloadFile(message.mediaUrl as string, label)}
                aria-label={`Download ${label}`}
                className="w-8 h-8 rounded-lg bg-[#1D4533]/10 hover:bg-[#1D4533] hover:text-[#F9D2BA] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {caption}
        </div>
      );
    }

    default:
      return <p className={textClass}>{message.content}</p>;
  }
}

function Ticks({ tick }: { tick: MessageTick }) {
  switch (tick) {
    case "pending":
      return <Clock className="w-3 h-3" aria-label="Sending" />;
    case "sent":
      return <Check className="w-3 h-3" aria-label="Sent" />;
    case "delivered":
      return <CheckCheck className="w-3 h-3" aria-label="Delivered" />;
    case "read":
      return <CheckCheck className="w-3 h-3 text-sky-400" aria-label="Read" />;
    default:
      return null;
  }
}

const copyToClipboard = (text: string) => {
  const result = navigator.clipboard?.writeText(text);

  if (!result) {
    toast.error("Couldn't copy.");
    return;
  }

  result.then(
    () => toast.success("Copied"),
    () => toast.error("Couldn't copy."),
  );
};

type MessageBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  isFirstInRun: boolean;
  showSender?: boolean;
  tick?: MessageTick;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onReact?: (message: ChatMessage, emoji: string) => void;
  onRetry?: (clientId: string) => void;
  onDiscard?: (clientId: string) => void;
};

const MessageBubble = memo(function MessageBubble({
  message,
  isMine,
  isFirstInRun,
  showSender = false,
  tick,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRetry,
  onDiscard,
}: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pressTimer = useRef<number | null>(null);

  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 rounded-lg bg-[#1D4533]/5 border border-[#1D4533]/10 text-[10px] text-center text-[#5E3122]/70 font-medium wrap-anywhere">
          {message.content}
        </span>
      </div>
    );
  }

  const isDeleted = Boolean(message.deletedAt);
  const isPending = Boolean(message.status);
  const senderName = message.sender?.name ?? "Deleted user";
  const showAvatarColumn = showSender && !isMine;
  const clientKey = message.clientId ?? message.id;
  const myReaction =
    message.reactions.find((reaction) => reaction.reactedByMe)?.emoji ?? null;

  const canReact = Boolean(onReact) && !isDeleted && !isPending;
  const canReply = Boolean(onReply) && !isDeleted && !isPending;
  const hasMenu = !isPending;

  const clearPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const startPress = () => {
    if (!hasMenu) return;
    clearPress();
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      setMenuOpen(true);
    }, 450);
  };

  const buildActions = (): SheetAction[] => {
    const list: SheetAction[] = [];

    if (canReply) {
      list.push({ key: "reply", label: "Reply", icon: Reply, onSelect: () => onReply?.(message) });
    }
    if (message.content && !isDeleted) {
      const text = message.content;
      list.push({ key: "copy", label: "Copy text", icon: Copy, onSelect: () => copyToClipboard(text) });
    }
    if (onEdit && canEditMessage(message, isMine)) {
      list.push({ key: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(message) });
    }
    if (onDelete) {
      list.push({ key: "delete", label: "Delete", icon: Trash2, danger: true, onSelect: () => onDelete(message) });
    }

    return list;
  };

  const actionCluster = hasMenu ? (
    <div className="self-center flex items-center gap-0.5 shrink-0 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-60">
      {canReply && (
        <button
          type="button"
          onClick={() => onReply?.(message)}
          aria-label="Reply to this message"
          title="Reply"
          className="hidden [@media(hover:hover)]:flex w-7 h-7 rounded-full text-[#5E3122]/60 hover:text-[#1D4533] hover:bg-[#1D4533]/10 items-center justify-center cursor-pointer"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Message options"
        aria-haspopup="dialog"
        title="More"
        className="w-7 h-7 rounded-full text-[#5E3122]/60 hover:text-[#1D4533] hover:bg-[#1D4533]/10 flex items-center justify-center cursor-pointer"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  return (
    <div
      className={`group flex items-start gap-2 ${
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

      {isMine && actionCluster}

      <div className="max-w-[80%] md:max-w-[65%] min-w-0">
        {showAvatarColumn && isFirstInRun && (
          <p className="text-xs font-bold text-[#1D4533] truncate mb-1 ml-1">
            {senderName}
          </p>
        )}

        <div
          onContextMenu={(event) => {
            if (!hasMenu) return;
            event.preventDefault();
            setMenuOpen(true);
          }}
          onTouchStart={startPress}
          onTouchEnd={clearPress}
          onTouchMove={clearPress}
          onTouchCancel={clearPress}
          className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed [-webkit-touch-callout:none] ${
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
              <p className="line-clamp-2 wrap-anywhere">
                {message.replyTo.deleted
                  ? "This message was deleted"
                  : describeMessage(message.replyTo) || "Message"}
              </p>
            </div>
          )}

          <MessageContent message={message} isMine={isMine} />

          {message.status === "uploading" && (
            <div className="mt-2" role="status" aria-label="Uploading">
              <div className="h-1 rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full bg-[#F9D2BA] transition-all"
                  style={{ width: `${message.uploadProgress ?? 0}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] opacity-70">
                Uploading… {message.uploadProgress ?? 0}%
              </p>
            </div>
          )}

          {message.status === "failed" && (
            <div className="mt-2 flex items-center justify-end gap-3 text-[10px] font-bold">
              <span className="text-rose-300">Not sent</span>
              <button
                type="button"
                onClick={() => onRetry?.(clientKey)}
                className="underline cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => onDiscard?.(clientKey)}
                className="underline opacity-80 cursor-pointer"
              >
                Discard
              </button>
            </div>
          )}

          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
              isMine ? "text-[#F9D2BA]/70" : "text-[#5E3122]/50"
            }`}
          >
            {message.editedAt && !isDeleted && <span>edited</span>}
            <time dateTime={message.createdAt}>
              {formatMessageTime(message.createdAt)}
            </time>
            {isMine && !isDeleted && tick && <Ticks tick={tick} />}
          </div>
        </div>

        {message.reactions.length > 0 && !isDeleted && (
          <div
            className={`flex flex-wrap gap-1 mt-1 px-1 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => onReact?.(message, reaction.emoji)}
                aria-pressed={reaction.reactedByMe}
                aria-label={`${reaction.emoji} ${reaction.count}`}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border shadow-sm cursor-pointer ${
                  reaction.reactedByMe
                    ? "bg-[#F9D2BA] border-[#1D4533]/40 text-[#1D4533]"
                    : "bg-white border-[#1D4533]/15 text-[#5E3122]"
                }`}
              >
                <span>{reaction.emoji}</span>
                {reaction.count > 1 && (
                  <span className="font-bold">{reaction.count}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isMine && actionCluster}

      {menuOpen && (
        <MessageActionSheet
          onClose={() => setMenuOpen(false)}
          myReaction={myReaction}
          onReact={canReact ? (emoji) => onReact?.(message, emoji) : undefined}
          actions={buildActions()}
        />
      )}
    </div>
  );
});

export default MessageBubble;