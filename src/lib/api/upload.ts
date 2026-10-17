import { apiRequest } from "@/lib/api/apiRequest";

export type UploadKind = "IMAGE" | "VIDEO" | "VOICE" | "FILE";

export type UploadSource = { name: string; type: string; size: number };

export type SignedUpload = {
  url: string;
  publicId: string;
  fields: Record<string, string | number>;
  maxBytes: number;
};

export const signUpload = async (kind: UploadKind, source: UploadSource) => {
  const data = await apiRequest<{ upload: SignedUpload }>(
    "/api/uploads/chat/sign",
    {
      method: "POST",
      body: JSON.stringify({
        kind,
        fileName: source.name,
        mimeType: source.type,
        size: source.size,
      }),
    },
  );

  return data.upload;
};

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
    xhr.open("POST", upload.url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();

      let message = "Upload failed. Please try again.";
      try {
        message = JSON.parse(xhr.responseText)?.error?.message ?? message;
      } catch {}
      reject(new Error(message));
    };

    xhr.onerror = () =>
      reject(new Error("Upload failed. Check your connection."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    options.signal?.addEventListener("abort", () => xhr.abort(), {
      once: true,
    });

    const form = new FormData();
    Object.entries(upload.fields).forEach(([key, value]) =>
      form.append(key, String(value)),
    );
    form.append("file", file);

    xhr.send(form);
  });
