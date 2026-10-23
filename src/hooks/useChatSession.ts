"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { useMessageActions } from "@/hooks/useMessageActions";
import { useMessageSender } from "@/hooks/useMessageSender";
import { useReceipts } from "@/hooks/useReceipts";
import type { FileKind } from "@/lib/chat/chatMediaRules";
import { canDeleteForEveryone } from "@/lib/chat/messageRules";
import { useAuthStore } from "@/store/authStore";
import type {
  ChatMessage,
  ConversationDetails,
  EditDraft,
  ReplyDraft,
} from "@/types/chat";
import { useTypingEmitter } from "./useTypingEmitter";

export type DeleteDialogConfig = {
  canDeleteEveryone: boolean;
  onConfirm: (scope: "me" | "everyone") => Promise<void>;
  onClose: () => void;
};

export function useChatSession({
  conversation,
  messagesState,
}: {
  conversation: ConversationDetails;
  messagesState: ConversationMessagesState;
}) {
  const meId = useAuthStore((state) => state.user?.id) ?? "";
  const fallbackName =
    conversation.type === "DIRECT"
      ? conversation.otherUser.name
      : "Deleted user";

  const { sendText, sendFiles, sendVoice, retry, discard } = useMessageSender({
    conversationId: conversation.id,
    meId,
    state: messagesState,
  });
  const { react, edit, remove } = useMessageActions({
    conversationId: conversation.id,
    state: messagesState,
  });
  const receipts = useReceipts(conversation.id, conversation.receipts);

  const typing = useTypingEmitter(conversation.id);

  const [replyTo, setReplyTo] = useState<ReplyDraft | null>(null);
  const [editing, setEditing] = useState<EditDraft | null>(null);
  const [deleting, setDeleting] = useState<ChatMessage | null>(null);

  const handleReply = useCallback(
    (message: ChatMessage) => {
      setEditing(null);
      setReplyTo({
        id: message.id,
        senderName:
          message.senderId === meId
            ? "You"
            : (message.sender?.name ?? fallbackName),
        type: message.type,
        content: message.content,
        fileName: message.fileName,
      });
    },
    [meId, fallbackName],
  );

  const handleEdit = useCallback((message: ChatMessage) => {
    setReplyTo(null);
    setEditing({
      id: message.id,
      type: message.type,
      content: message.content ?? "",
    });
  }, []);

  const cancelReply = useCallback(() => setReplyTo(null), []);
  const cancelEdit = useCallback(() => setEditing(null), []);

  const handleSendText = useCallback(
    (text: string) => {
      sendText(text, replyTo);
      setReplyTo(null);
    },
    [sendText, replyTo],
  );

  const handleSendFiles = useCallback(
    (items: { file: File; kind: FileKind }[], caption: string | null) => {
      sendFiles(items, caption, replyTo);
      setReplyTo(null);
    },
    [sendFiles, replyTo],
  );

  const handleSendVoice = useCallback(
    (file: File, duration: number) => {
      sendVoice(file, duration, replyTo);
      setReplyTo(null);
    },
    [sendVoice, replyTo],
  );

  const submitEdit = useCallback(
    async (text: string) => {
      if (!editing) return;

      try {
        await edit(editing.id, text);
        setEditing(null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Couldn't edit the message.",
        );
      }
    },
    [editing, edit],
  );

  const deleteDialog = useMemo<DeleteDialogConfig | null>(
    () =>
      deleting
        ? {
            canDeleteEveryone: canDeleteForEveryone(
              deleting,
              deleting.senderId === meId,
            ),
            onClose: () => setDeleting(null),
            onConfirm: async (scope) => {
              try {
                await remove(deleting, scope);
                setDeleting(null);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Couldn't delete the message.",
                );
              }
            },
          }
        : null,
    [deleting, meId, remove],
  );

  return {
    meId,
    deleteDialog,
    paneProps: {
      state: messagesState,
      meId,
      receipts,
      onReply: handleReply,
      onEdit: handleEdit,
      onDelete: setDeleting,
      onReact: react,
      onRetry: retry,
      onDiscard: discard,
      onTyping: typing.notify,
      onStopTyping: typing.stop,
    },
    inputProps: {
      replyTo,
      onCancelReply: cancelReply,
      editing,
      onCancelEdit: cancelEdit,
      onSubmitEdit: submitEdit,
      onSendText: handleSendText,
      onSendFiles: handleSendFiles,
      onSendVoice: handleSendVoice,
      onTyping: typing.notify,
      onStopTyping: typing.stop,
    },
  };
}
