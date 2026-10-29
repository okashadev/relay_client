export type ChatUploadKind = "IMAGE" | "VIDEO" | "VOICE" | "FILE";
export type StoryUploadKind = "IMAGE" | "VIDEO";

export type UploadSource = {
  name: string;
  type: string;
  size: number;
};

export type SignedUpload = {
  url: string;
  publicId: string;
  fields: Record<string, string | number>;
  maxBytes: number;
};
