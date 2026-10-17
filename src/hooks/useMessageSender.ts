"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { sendMessage, type SendMessageBody } from "@/lib/api/ChatApi";
import {
  createOutgoingMedia,
  createOutgoingText,
} from "@/lib/chat/chatMessages";
import type { FileKind } from "@/lib/chat/chatMediaRules";
import { signUpload, uploadToCloudinary } from "@/lib/api/upload";
import { useChatListStore } from "@/store/chatListStore";
import type { ReplyDraft } from "@/types/chat";

type MediaType = FileKind | "VOICE";

type TextJob = { kind: "TEXT"; text: string; replyToId: string | null };

type MediaJob = {
  kind: "MEDIA";
  type: MediaType;
  file: File;
  caption: string | null;
  replyToId: string | null;
  blobUrl: string;
  publicId: string | null;
};

type Job = TextJob | MediaJob;

const buildMediaBody = (job: MediaJob, clientId: string): SendMessageBody => {
  const common = {
    clientId,
    publicId: job.publicId as string,
    replyToId: job.replyToId,
  };

  switch (job.type) {
    case "VOICE":
      return { type: "VOICE", ...common };
    case "FILE":
      return {
        type: "FILE",
        ...common,
        fileName: job.file.name,
        content: job.caption,
      };
    default:
      return { type: job.type, ...common, content: job.caption };
  }
};

export function useMessageSender({
  conversationId,
  meId,
  state,
}: {
  conversationId: string;
  meId: string;
  state: ConversationMessagesState;
}) {
  const { appendMessage, updateMessage, upsertMessage, removeMessage } = state;

  const jobs = useRef(new Map<string, Job>());
  const controllers = useRef(new Map<string, AbortController>());
  const running = useRef(new Set<string>());

  const cleanup = useCallback((clientId: string) => {
    const job = jobs.current.get(clientId);
    if (job?.kind === "MEDIA") URL.revokeObjectURL(job.blobUrl);

    jobs.current.delete(clientId);
    controllers.current.delete(clientId);
    running.current.delete(clientId);
  }, []);

  const run = useCallback(
    async (clientId: string) => {
      const job = jobs.current.get(clientId);
      if (!job || running.current.has(clientId)) return;

      running.current.add(clientId);

      const controller = new AbortController();
      controllers.current.set(clientId, controller);

      try {
        let body: SendMessageBody;

        if (job.kind === "TEXT") {
          updateMessage(clientId, { status: "sending" });
          body = {
            type: "TEXT",
            clientId,
            content: job.text,
            replyToId: job.replyToId,
          };
        } else {
          if (!job.publicId) {
            updateMessage(clientId, { status: "uploading", uploadProgress: 0 });

            const upload = await signUpload(job.type, {
              name: job.file.name,
              type: job.file.type,
              size: job.file.size,
            });

            await uploadToCloudinary(job.file, upload, {
              signal: controller.signal,
              onProgress: (percent) =>
                updateMessage(clientId, { uploadProgress: percent }),
            });

            job.publicId = upload.publicId;
          }

          updateMessage(clientId, {
            status: "sending",
            uploadProgress: undefined,
          });
          body = buildMediaBody(job, clientId);
        }

        const { message } = await sendMessage(conversationId, body);

        upsertMessage(message);

        const chatList = useChatListStore.getState();
        const applied = chatList.applyMessage(conversationId, {
          lastMessage: {
            type: message.type,
            content: message.content,
            fileName: message.fileName,
            senderName: null,
            isMine: true,
            deleted: false,
          },
          lastMessageAt: message.createdAt,
          incrementUnread: false,
        });
        if (!applied) chatList.invalidate();

        cleanup(clientId);
      } catch (error) {
        running.current.delete(clientId);

        if (controller.signal.aborted) return;

        updateMessage(clientId, {
          status: "failed",
          uploadProgress: undefined,
        });
        toast.error(
          error instanceof Error ? error.message : "Failed to send message.",
        );
      }
    },
    [conversationId, updateMessage, upsertMessage, cleanup],
  );

  const sendText = useCallback(
    (text: string, reply: ReplyDraft | null) => {
      const outgoing = createOutgoingText(text, meId, reply);

      jobs.current.set(outgoing.id, {
        kind: "TEXT",
        text,
        replyToId: reply?.id ?? null,
      });
      appendMessage(outgoing);
      void run(outgoing.id);
    },
    [meId, appendMessage, run],
  );

  const sendFile = useCallback(
    (
      file: File,
      type: MediaType,
      options: {
        caption?: string | null;
        reply?: ReplyDraft | null;
        duration?: number | null;
      } = {},
    ) => {
      const clientId = crypto.randomUUID();
      const blobUrl = URL.createObjectURL(file);
      const caption = options.caption ?? null;
      const reply = options.reply ?? null;

      jobs.current.set(clientId, {
        kind: "MEDIA",
        type,
        file,
        caption,
        replyToId: reply?.id ?? null,
        blobUrl,
        publicId: null,
      });

      appendMessage(
        createOutgoingMedia({
          clientId,
          type,
          senderId: meId,
          file,
          blobUrl,
          caption,
          reply,
          durationHint: options.duration ?? null,
        }),
      );
      void run(clientId);
    },
    [meId, appendMessage, run],
  );

  const sendFiles = useCallback(
    (
      items: { file: File; kind: FileKind }[],
      caption: string | null,
      reply: ReplyDraft | null,
    ) => {
      items.forEach((item, index) =>
        sendFile(item.file, item.kind, {
          caption: index === 0 ? caption : null,
          reply: index === 0 ? reply : null,
        }),
      );
    },
    [sendFile],
  );

  const sendVoice = useCallback(
    (file: File, duration: number, reply: ReplyDraft | null) =>
      sendFile(file, "VOICE", { reply, duration }),
    [sendFile],
  );

  const retry = useCallback(
    (clientId: string) => {
      void run(clientId);
    },
    [run],
  );

  const discard = useCallback(
    (clientId: string) => {
      controllers.current.get(clientId)?.abort();
      cleanup(clientId);
      removeMessage(clientId);
    },
    [cleanup, removeMessage],
  );

  useEffect(() => {
    const allJobs = jobs.current;
    const allControllers = controllers.current;

    return () => {
      allControllers.forEach((controller) => controller.abort());
      allJobs.forEach((job) => {
        if (job.kind === "MEDIA") URL.revokeObjectURL(job.blobUrl);
      });
    };
  }, []);

  return { sendText, sendFiles, sendVoice, retry, discard };
}
