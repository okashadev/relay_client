import {
  getBackupApi,
  registerDeviceKeyApi,
  setupAccountApi,
} from "@/lib/api/e2eeApi";
import { getDeviceId } from "@/lib/device";
import type { E2eeMode } from "@/types/e2ee";
import { fromB64, toB64 } from "./bytes";
import { E2eeLockedError, errorCode } from "./errors";
import { generateKeyPair, publicKeyOf } from "./primitives";
import {
  deleteDevice,
  loadAccount,
  loadDevice,
  saveAccount,
  saveDevice,
} from "./storage";

export type DeviceRecord = {
  id: string;
  secretKey: Uint8Array;
  publicKey: string;
};
export type AccountRecord = { secretKey: Uint8Array; publicKey: string };
export type InitResult = {
  deviceId: string;
  mode: E2eeMode;
  unlocked: boolean;
};

export class DeviceKeyMismatchError extends Error {}

let device: DeviceRecord | null = null;
let account: AccountRecord | null = null;
let pending: { userId: string; promise: Promise<InitResult> } | null = null;

export const getDevice = () => {
  if (!device) throw new E2eeLockedError();
  return device;
};

export const getAccount = () => account;

export const adoptAccount = async (userId: string, record: AccountRecord) => {
  account = record;
  await saveAccount(userId, record);
};

export const resetSession = () => {
  device = null;
  account = null;
  pending = null;
};

const ensureDevice = async (userId: string) => {
  const deviceId = getDeviceId();
  if (!deviceId)
    throw new Error("This device isn't registered. Please sign in again.");

  let record = await loadDevice(userId, deviceId);
  const created = !record;

  if (!record) {
    const pair = generateKeyPair();
    record = { secretKey: pair.secretKey, publicKey: toB64(pair.publicKey) };
    await saveDevice(userId, deviceId, record);
  }

  try {
    await registerDeviceKeyApi({ deviceId, publicKey: record.publicKey });
  } catch (error) {
    if (errorCode(error) === "DEVICE_KEY_LOCKED") {
      if (created) await deleteDevice(userId, deviceId);
      throw new DeviceKeyMismatchError();
    }
    throw error;
  }

  device = { id: deviceId, ...record };
};

const ensureAccount = async (
  userId: string,
): Promise<{ mode: E2eeMode; unlocked: boolean }> => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const backup = await getBackupApi();

    if (backup.mode === "NONE") {
      const pair = generateKeyPair();
      const publicKey = toB64(pair.publicKey);

      try {
        await setupAccountApi({
          accountPublicKey: publicKey,
          accountSecretKey: toB64(pair.secretKey),
        });
      } catch (error) {
        if (errorCode(error) === "ACCOUNT_ALREADY_SETUP") continue;
        throw error;
      }

      await adoptAccount(userId, { secretKey: pair.secretKey, publicKey });
      return { mode: "SERVER", unlocked: true };
    }

    const local = await loadAccount(userId);

    if (
      local &&
      local.publicKey === backup.accountPublicKey &&
      publicKeyOf(local.secretKey) === backup.accountPublicKey
    ) {
      account = local;
      return { mode: backup.mode, unlocked: true };
    }

    if (backup.mode === "SERVER") {
      const secretKey = fromB64(backup.accountSecretKey);

      if (publicKeyOf(secretKey) !== backup.accountPublicKey) {
        throw new Error("Your account key couldn't be verified.");
      }

      await adoptAccount(userId, {
        secretKey,
        publicKey: backup.accountPublicKey,
      });
      return { mode: "SERVER", unlocked: true };
    }

    account = null;
    return { mode: "PASSPHRASE", unlocked: false };
  }

  throw new Error("Couldn't set up encryption. Please try again.");
};

export const initE2ee = (userId: string): Promise<InitResult> => {
  if (pending?.userId === userId) return pending.promise;

  const promise = (async () => {
    await ensureDevice(userId);
    const state = await ensureAccount(userId);

    return { deviceId: (device as DeviceRecord).id, ...state };
  })().catch((error) => {
    pending = null;
    throw error;
  });

  pending = { userId, promise };
  return promise;
};
