import { downloadFile } from "@/lib/chat/downloadFile";
import { fromB64, toB64, toBlob } from "./bytes";
import { decryptBlob, encryptBlob, randomKey } from "./primitives";
import type { MessagePayload } from "@/types/e2ee";

export const encryptFileForUpload = async (file: Blob) => {
  const key = randomKey();
  const sealed = encryptBlob(key, new Uint8Array(await file.arrayBuffer()));

  return { key: toB64(key), blob: toBlob(sealed) };
};

const urls = new Map<string, Promise<string>>();

export const loadDecryptedUrl = (
  url: string,
  keyB64: string,
  mime: string,
): Promise<string> => {
  const id = `${url}|${keyB64}`;
  const hit = urls.get(id);
  if (hit) return hit;

  const task = (async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Couldn't download this file.");

    const plain = decryptBlob(
      fromB64(keyB64),
      new Uint8Array(await response.arrayBuffer()),
    );
    return URL.createObjectURL(toBlob(plain, mime));
  })();

  urls.set(id, task);
  task.catch(() => urls.delete(id));
  return task;
};

export const downloadDecrypted = async (
  item: { mediaUrl: string | null; payload?: MessagePayload | null },
  fileName: string,
) => {
  const meta = item.payload?.file;
  if (!item.mediaUrl || !meta) throw new Error("This file can't be decrypted.");

  await downloadFile(
    await loadDecryptedUrl(item.mediaUrl, meta.key, meta.mime),
    fileName,
  );
};

export const makeThumbnail = async (file: Blob) => {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 480 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(bitmap, 0, 0, width, height);

    const original = { width: bitmap.width, height: bitmap.height };
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8),
    );

    return blob ? { blob, width, height, original } : null;
  } catch {
    return null;
  }
};
