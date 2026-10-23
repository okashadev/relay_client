"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  FileText,
  Film,
  Image as ImageIcon,
  Mic,
  Pencil,
  Plus,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import {
  ACCEPT_FILES,
  ACCEPT_MEDIA,
  MAX_ATTACHMENTS,
  classifyFile,
  type FileKind,
} from "@/lib/chat/chatMediaRules";
import { formatDuration } from "@/lib/format";
import { describeMessage } from "@/lib/chat/messagePreview";
import type { EditDraft, ReplyDraft } from "@/types/chat";

import dynamic from "next/dynamic";
import type { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import EmojiText from "@/components/chats/shared/EmojiText";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

type Attachment = {
  id: string;
  file: File;
  kind: FileKind;
  previewUrl: string | null;
};

type MessageInputProps = {
  placeholder: string;
  ariaLabel: string;
  replyTo: ReplyDraft | null;
  onCancelReply: () => void;
  editing: EditDraft | null;
  onCancelEdit: () => void;
  onSubmitEdit: (text: string) => Promise<void>;
  onTyping?: () => void;
  onStopTyping?: () => void;
  onSendText: (text: string) => void;
  onSendFiles: (
    items: { file: File; kind: FileKind }[],
    caption: string | null,
  ) => void;
  onSendVoice: (file: File, durationSeconds: number) => void;
};

const revokePreviews = (items: Attachment[]) =>
  items.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  });

export default function MessageInput({
  placeholder,
  ariaLabel,
  replyTo,
  onCancelReply,
  editing,
  onCancelEdit,
  onSubmitEdit,
  onSendText,
  onSendFiles,
  onSendVoice,
  onTyping,
  onStopTyping,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<Attachment[]>([]);
  const wasEditing = useRef(false);

  const recorder = useVoiceRecorder({
    onError: (message) => toast.error(message),
    onComplete: ({ file, duration }) => {
      if (duration < 1) {
        toast.info("Recording too short.");
        return;
      }
      onSendVoice(file, duration);
    },
  });

  useEffect(() => () => revokePreviews(attachmentsRef.current), []);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  useEffect(() => {
    if (editing) {
      setText(editing.content);
      inputRef.current?.focus();
      wasEditing.current = true;
    } else if (wasEditing.current) {
      setText("");
      wasEditing.current = false;
    }
  }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const insertEmoji = (data: EmojiClickData) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + data.emoji + text.slice(end);

    setText(next);
    if (!editing) onTyping?.();

    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + data.emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  useEffect(() => {
    if (!emojiOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEmojiOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [emojiOpen]);

  const stageFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const current = attachmentsRef.current;
    const accepted: Attachment[] = [];

    for (const file of files) {
      if (current.length + accepted.length >= MAX_ATTACHMENTS) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} files at a time.`);
        break;
      }

      const result = classifyFile(file);

      if (!result.ok) {
        toast.error(`${file.name}: ${result.error}`);
        continue;
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        kind: result.kind,
        previewUrl: result.kind === "IMAGE" ? URL.createObjectURL(file) : null,
      });
    }

    if (accepted.length === 0) return;

    const next = [...current, ...accepted];
    attachmentsRef.current = next;
    setAttachments(next);
  }, []);

  const removeAttachment = (id: string) => {
    const target = attachmentsRef.current.find((item) => item.id === id);
    if (target) revokePreviews([target]);

    const next = attachmentsRef.current.filter((item) => item.id !== id);
    attachmentsRef.current = next;
    setAttachments(next);
  };

  const handlePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    stageFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
    setMenuOpen(false);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (editing) return;

    const files = Array.from(event.clipboardData.files);

    if (files.length > 0) {
      event.preventDefault();
      stageFiles(files);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;

    if (editing) onCancelEdit();
    else if (replyTo) onCancelReply();
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    onStopTyping?.();
    setEmojiOpen(false);

    const value = text.trim();

    if (editing) {
      if (isSavingEdit) return;
      if (!value && editing.type === "TEXT") return;

      setIsSavingEdit(true);
      try {
        await onSubmitEdit(value);
      } finally {
        setIsSavingEdit(false);
      }
      return;
    }

    if (attachments.length > 0) {
      onSendFiles(
        attachments.map(({ file, kind }) => ({ file, kind })),
        value || null,
      );
      revokePreviews(attachments);
      attachmentsRef.current = [];
      setAttachments([]);
    } else if (value) {
      onSendText(value);
    } else {
      return;
    }

    setText("");
    inputRef.current?.focus();
  };

  const trimmed = text.trim();
  const canSend = editing
    ? (editing.type !== "TEXT" || trimmed.length > 0) && !isSavingEdit
    : trimmed.length > 0 || attachments.length > 0;

  return (
    <div className="relative bg-[#F7EAE0] border-t border-[#1D4533]/10 shrink-0">
      {replyTo && !editing && (
        <div className="px-3 sm:px-4 pt-3">
          <div className="flex items-start gap-2 rounded-2xl bg-white border border-[#1D4533]/10 border-l-4 border-l-[#1D4533] px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#1D4533] truncate">
                Replying to {replyTo.senderName}
              </p>
              <p className="text-[11px] text-[#5E3122]/70 line-clamp-1 wrap-anywhere">
                <EmojiText text={describeMessage(replyTo) || "Message"} />
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              aria-label="Cancel reply"
              className="w-6 h-6 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="px-3 sm:px-4 pt-3">
          <div className="flex items-start gap-2 rounded-2xl bg-white border border-[#1D4533]/10 border-l-4 border-l-[#F9D2BA] px-3 py-2">
            <Pencil className="w-3.5 h-3.5 mt-0.5 text-[#1D4533] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#1D4533]">
                Editing message
              </p>
              <p className="text-[11px] text-[#5E3122]/70 line-clamp-1 wrap-anywhere">
                <EmojiText text={editing.content || "Caption"} />
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelEdit}
              aria-label="Cancel edit"
              className="w-6 h-6 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {attachments.length > 0 && !editing && (
        <div className="px-3 sm:px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {attachments.map((item) => (
            <div key={item.id} className="relative shrink-0">
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#1D4533]/10"
                />
              ) : (
                <div className="w-40 h-16 rounded-xl bg-white border border-[#1D4533]/10 px-3 flex items-center gap-2">
                  {item.kind === "VIDEO" ? (
                    <Film className="w-5 h-5 text-[#1D4533] shrink-0" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#1D4533] shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-[#1D4533] truncate">
                    {item.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(item.id)}
                aria-label={`Remove ${item.file.name}`}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center cursor-pointer shadow"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {recorder.isRecording ? (
        <div className="px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2">
          <button
            type="button"
            onClick={recorder.cancel}
            aria-label="Cancel recording"
            title="Cancel recording"
            className="w-10 h-10 rounded-2xl bg-white hover:bg-rose-50 border border-[#1D4533]/10 flex items-center justify-center text-rose-600 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div
            role="status"
            className="flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#1D4533]/10 rounded-2xl"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-[#1D4533] tabular-nums">
              {formatDuration(recorder.seconds)}
            </span>
            <span className="text-[11px] font-medium text-[#5E3122]/60 truncate">
              Recording…
            </span>
          </div>

          <button
            type="button"
            onClick={recorder.stop}
            aria-label="Send voice message"
            className="w-10 h-10 rounded-2xl bg-[#1D4533] hover:bg-[#1D4533]/90 active:scale-95 text-[#F9D2BA] flex items-center justify-center shadow-md shadow-[#1D4533]/20 transition-all cursor-pointer shrink-0"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2"
        >
          {!editing && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Attach file"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Attach file"
                className="w-10 h-10 rounded-2xl bg-white hover:bg-[#1D4533]/5 border border-[#1D4533]/10 flex items-center justify-center text-[#1D4533] transition-colors cursor-pointer"
              >
                <Plus
                  className={`w-5 h-5 transition-transform ${
                    menuOpen ? "rotate-45" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    tabIndex={-1}
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute bottom-full left-0 mb-2 w-52 rounded-2xl bg-white border border-[#1D4533]/10 shadow-lg p-1.5 z-20"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => mediaInputRef.current?.click()}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" /> Photo or video
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" /> Document
                    </button>
                  </div>
                </>
              )}

              <input
                ref={mediaInputRef}
                type="file"
                accept={ACCEPT_MEDIA}
                multiple
                hidden
                onChange={handlePicked}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_FILES}
                multiple
                hidden
                onChange={handlePicked}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setEmojiOpen((open) => !open)}
            aria-label="Emoji"
            aria-pressed={emojiOpen}
            title="Emoji"
            className={`w-10 h-10 rounded-2xl border border-[#1D4533]/10 flex items-center justify-center text-[#1D4533] transition-colors cursor-pointer shrink-0 ${
              emojiOpen ? "bg-[#F9D2BA]" : "bg-white hover:bg-[#1D4533]/5"
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            enterKeyHint="send"
            autoComplete="off"
            aria-label={ariaLabel}
            placeholder={
              editing
                ? "Edit your message..."
                : attachments.length > 0
                  ? "Add a caption..."
                  : placeholder
            }
            value={text}
            onChange={(e) => {
              const value = e.target.value;
              setText(value);

              if (editing) return;
              if (value.trim()) onTyping?.();
              else onStopTyping?.();
            }}
            onBlur={onStopTyping}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
          />

          {editing ? (
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Save edited message"
              className="w-10 h-10 rounded-2xl bg-[#1D4533] hover:bg-[#1D4533]/90 active:scale-95 text-[#F9D2BA] flex items-center justify-center shadow-md shadow-[#1D4533]/20 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
            </button>
          ) : canSend ? (
            <button
              type="submit"
              aria-label="Send message"
              className="w-10 h-10 rounded-2xl bg-[#1D4533] hover:bg-[#1D4533]/90 active:scale-95 text-[#F9D2BA] flex items-center justify-center shadow-md shadow-[#1D4533]/20 transition-all cursor-pointer shrink-0"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={recorder.start}
              aria-label="Record voice message"
              title="Record voice message"
              className="w-10 h-10 rounded-2xl bg-[#1D4533] hover:bg-[#1D4533]/90 active:scale-95 text-[#F9D2BA] flex items-center justify-center shadow-md shadow-[#1D4533]/20 transition-all cursor-pointer shrink-0"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
      
      {emojiOpen && !recorder.isRecording && (
        <>
          <button
            type="button"
            aria-label="Close emoji picker"
            tabIndex={-1}
            onClick={() => setEmojiOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute bottom-full left-3 sm:left-4 mb-2 z-20">
            <EmojiPicker
              onEmojiClick={insertEmoji}
              emojiStyle={"apple" as EmojiStyle}
              width="min(340px, calc(100vw - 1.5rem))"
              height={380}
              lazyLoadEmojis
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        </>
      )}
    </div>
  );
}
