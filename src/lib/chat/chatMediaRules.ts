export type FileKind = "IMAGE" | "VIDEO" | "FILE";

const MB = 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
];

const LIMITS: Record<FileKind, number> = {
  IMAGE: 10 * MB,
  VIDEO: 50 * MB,
  FILE: 10 * MB,
};

export const MAX_ATTACHMENTS = 5;

export const ACCEPT_MEDIA = [...IMAGE_TYPES, ...VIDEO_TYPES].join(",");
export const ACCEPT_FILES = FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",");

export type ClassifyResult =
  | { ok: true; kind: FileKind }
  | { ok: false; error: string };

export const classifyFile = (file: File): ClassifyResult => {
  const type = file.type.toLowerCase();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  let kind: FileKind;

  if (IMAGE_TYPES.includes(type)) kind = "IMAGE";
  else if (VIDEO_TYPES.includes(type)) kind = "VIDEO";
  else if (FILE_EXTENSIONS.includes(extension)) kind = "FILE";
  else return { ok: false, error: "This file type isn't supported." };

  if (file.size === 0) return { ok: false, error: "This file is empty." };

  if (file.size > LIMITS[kind]) {
    return {
      ok: false,
      error: `File is too large. Maximum size is ${LIMITS[kind] / MB} MB.`,
    };
  }

  return { ok: true, kind };
};