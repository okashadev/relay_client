"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { sendMessage } from "@/lib/api/ChatApi";
import type { FileKind } from "@/lib/chat/chatMediaRules";
import {
  createOutgoingMedia,
  createOutgoingText,
} from "@/lib/chat/chatMessages";
import { hydrateMessage } from "@/lib/e2ee/hydrate";
import { encryptFileForUpload, makeThumbnail } from "@/lib/e2ee/media";
import { sendWithKeys } from "@/lib/e2ee/send";
import { readVideoMeta } from "@/lib/stories/mediaMeta";
import { signUpload, uploadToCloudinary } from "@/lib/api/upload";
import { useChatListStore } from "@/store/chatListStore";
import type { ReplyDraft } from "@/types/chat";
import type { FileMeta, MessagePayload, ThumbMeta } from "@/types/e2ee";
import { uuid } from "@/lib/uuid";

type MediaType = FileKind | "VOICE";

type UploadResult = {
  publicId: string;
  thumbPublicId?: string;
  file: FileMeta;
  thumb?: ThumbMeta;
};

type TextJob = {
  kind: "TEXT";
  payload: MessagePayload;
  replyToId: string | null;
};

type MediaJob = {
  kind: "MEDIA";
  type: MediaType;
  file: File;
  caption: string | null;
  replyToId: string | null;
  blobUrl: string;
  duration: number | null;
  upload: UploadResult | null;
};

type Job = TextJob | MediaJob;

const uploadEncrypted = async (
  job: MediaJob,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
): Promise<UploadResult> => {
  const sealed = await encryptFileForUpload(job.file);
  const upload = await signUpload(job.type, sealed.blob.size);

  await uploadToCloudinary(sealed.blob, upload, { signal, onProgress });

  const file: FileMeta = {
    mime: job.file.type || "application/octet-stream",
    size: job.file.size,
    key: sealed.key,
    ...(job.type === "FILE" && { name: job.file.name }),
  };

  let thumb: ThumbMeta | undefined;
  let thumbPublicId: string | undefined;

  if (job.type === "IMAGE") {
    const small = await makeThumbnail(job.file);

    if (small) {
      file.width = small.original.width;
      file.height = small.original.height;

      const encrypted = await encryptFileForUpload(small.blob);
      const thumbUpload = await signUpload("THUMB", encrypted.blob.size);
      await uploadToCloudinary(encrypted.blob, thumbUpload, { signal });

      thumb = {
        key: encrypted.key,
        mime: "image/jpeg",
        width: small.width,
        height: small.height,
      };
      thumbPublicId = thumbUpload.publicId;
    }
  } else if (job.type === "VIDEO") {
    const meta = await readVideoMeta(job.blobUrl).catch(() => null);

    if (meta) {
      file.width = meta.width;
      file.height = meta.height;
      file.duration = Math.round(meta.duration);
    }
  } else if (job.type === "VOICE" && job.duration) {
    file.duration = job.duration;
  }

  return { publicId: upload.publicId, thumbPublicId, file, thumb };
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

    if (job?.kind === "MEDIA") {
      setTimeout(() => URL.revokeObjectURL(job.blobUrl), 30_000);
    }

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
        let type: "TEXT" | MediaType = "TEXT";
        let payload: MessagePayload;
        let media: { publicId: string; thumbnailPublicId?: string } | undefined;

        if (job.kind === "TEXT") {
          updateMessage(clientId, { status: "sending" });
          payload = job.payload;
        } else {
          type = job.type;

          if (!job.upload) {
            updateMessage(clientId, { status: "uploading", uploadProgress: 0 });
            job.upload = await uploadEncrypted(
              job,
              controller.signal,
              (percent) => updateMessage(clientId, { uploadProgress: percent }),
            );
          }

          updateMessage(clientId, {
            status: "sending",
            uploadProgress: undefined,
          });

          payload = {
            v: 1,
            ...(job.caption && { text: job.caption }),
            file: job.upload.file,
            thumb: job.upload.thumb,
          };
          media = {
            publicId: job.upload.publicId,
            thumbnailPublicId: job.upload.thumbPublicId,
          };
        }

        const message = await sendWithKeys(
          { conversationId, payload },
          (encrypted) =>
            sendMessage(conversationId, {
              clientId,
              type,
              replyToId: job.replyToId,
              media,
              ...encrypted,
            }).then((result) => result.message),
        );

        const hydrated = await hydrateMessage(conversationId, message);
        upsertMessage(hydrated);

        const chatList = useChatListStore.getState();
        const applied = chatList.applyMessage(conversationId, {
          lastMessage: {
            type: hydrated.type,
            content: hydrated.content,
            fileName: hydrated.fileName,
            senderName: null,
            isMine: true,
            deleted: false,
          },
          lastMessageAt: hydrated.createdAt,
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
    [conversationId, meId, updateMessage, upsertMessage, cleanup],
  );

  const sendText = useCallback(
    (text: string, reply: ReplyDraft | null) => {
      const outgoing = createOutgoingText(text, meId, reply);

      jobs.current.set(outgoing.id, {
        kind: "TEXT",
        payload: { v: 1, text },
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
      const clientId = uuid();
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
        duration: options.duration ?? null,
        upload: null,
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

  const retry = useCallback((clientId: string) => void run(clientId), [run]);

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
