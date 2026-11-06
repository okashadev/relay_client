import type { BackupBlob, E2eeMode, RotationInfo } from "@/types/e2ee";
import { apiRequest } from "./apiRequest";

export type BackupResponse =
  | { mode: "NONE" }
  | { mode: "SERVER"; accountPublicKey: string; accountSecretKey: string }
  | { mode: "PASSPHRASE"; accountPublicKey: string; backup: BackupBlob };

const json = (body: unknown) => ({ method: "POST", body: JSON.stringify(body) });

export const getE2eeStatus = () =>
  apiRequest<{ mode: E2eeMode; accountPublicKey: string | null }>("/api/e2ee/status");

export const registerDeviceKeyApi = (body: { deviceId: string; publicKey: string }) =>
  apiRequest<{ success: true }>("/api/e2ee/device-key", {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const setupAccountApi = (body: { accountPublicKey: string; accountSecretKey: string }) =>
  apiRequest<{ success: true }>("/api/e2ee/account", json(body));

export const getBackupApi = () => apiRequest<BackupResponse>("/api/e2ee/backup");

export const setPassphraseApi = (backup: BackupBlob) =>
  apiRequest<{ success: true }>("/api/e2ee/backup", {
    method: "PUT",
    body: JSON.stringify({ backup }),
  });

export const turnOffPassphraseApi = (accountSecretKey: string) =>
  apiRequest<{ success: true }>("/api/e2ee/backup/off", json({ accountSecretKey }));

export const resetAccountApi = (body: {
  accountPublicKey: string;
  accountSecretKey: string;
  password?: string;
}) => apiRequest<{ success: true }>("/api/e2ee/account/reset", json(body));

export const uploadAccountKeysApi = (
  keys: { conversationId: string; epoch: number; wrappedKey: string }[],
) => apiRequest<{ saved: number }>("/api/e2ee/account-keys", json({ keys }));

export const getPublicKeys = async (userIds: string[]) => {
  const data = await apiRequest<{
    users: { id: string; devices: { id: string; publicKey: string }[] }[];
  }>("/api/e2ee/public-keys", json({ userIds }));

  return data.users;
};

export const getConversationKeys = (conversationId: string, deviceId: string) =>
  apiRequest<{
    keyEpoch: number;
    deviceKeys: { epoch: number; wrappedKey: string }[];
    accountKeys: { epoch: number; wrappedKey: string }[];
  }>(
    `/api/e2ee/conversations/${encodeURIComponent(conversationId)}/keys?deviceId=${encodeURIComponent(deviceId)}`,
  );

export const getRotationInfo = (conversationId: string) =>
  apiRequest<RotationInfo & { keyEpoch: number }>(
    `/api/e2ee/conversations/${encodeURIComponent(conversationId)}/rotation`,
  );