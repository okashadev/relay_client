export type FileMeta = {
  name?: string;
  mime: string;
  size: number;
  key: string;
  width?: number;
  height?: number;
  duration?: number;
};

export type ThumbMeta = {
  key: string;
  mime: string;
  width?: number;
  height?: number;
};

export type MessagePayload = {
  v: 1;
  text?: string;
  file?: FileMeta;
  thumb?: ThumbMeta;
};

export type KeyBundle = {
  epoch: number;
  devices: { deviceId: string; wrappedKey: string }[];
  accounts: { userId: string; wrappedKey: string }[];
};

export type RotationInfo = {
  nextEpoch: number;
  devices: { id: string; userId: string; publicKey: string }[];
  accounts: { userId: string; publicKey: string }[];
};

export type E2eeMode = "NONE" | "SERVER" | "PASSPHRASE";

export type BackupBlob = {
  data: string;
  salt: string;
  kdf: "argon2id";
  kdfParams: { m: number; t: number; p: number };
};
