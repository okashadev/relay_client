import { apiRequest } from "@/lib/api/apiRequest";
import { ChatUploadKind, SignedUpload, StoryUploadKind, UploadSource } from "@/types/uploads";

const requestSignedUpload = async (
  endpoint: string,
  kind: ChatUploadKind | StoryUploadKind,
  source: UploadSource,
) => {
  const data = await apiRequest<{ upload: SignedUpload }>(endpoint, {
    method: "POST",
    body: JSON.stringify({
      kind,
      fileName: source.name,
      mimeType: source.type,
      size: source.size,
    }),
  });

  return data.upload;
};

export const signUpload = (kind: ChatUploadKind, source: UploadSource) =>
  requestSignedUpload("/api/uploads/chat/sign", kind, source);

export const signStoryUpload = (kind: StoryUploadKind, source: UploadSource) =>
  requestSignedUpload("/api/uploads/story/sign", kind, source);

export const uploadToCloudinary = (
  file: Blob,
  upload: SignedUpload,
  options: {
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  } = {},
) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const { signal } = options;

    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const cleanup = () => {
      signal?.removeEventListener("abort", handleAbort);
      xhr.upload.onprogress = null;
      xhr.onload = null;
      xhr.onerror = null;
      xhr.onabort = null;
    };

    const handleAbort = () => xhr.abort();

    xhr.open("POST", upload.url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        cleanup();
        resolve();
        return;
      }

      let message = "Upload failed. Please try again.";

      try {
        message = JSON.parse(xhr.responseText)?.error?.message ?? message;
      } catch {
      }

      cleanup();
      reject(new Error(message));
    };

    xhr.onerror = () => {
      cleanup();
      reject(new Error("Upload failed. Check your connection."));
    };

    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    signal?.addEventListener("abort", handleAbort, { once: true });

    const form = new FormData();

    Object.entries(upload.fields).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    form.append("file", file);

    xhr.send(form);
  });
