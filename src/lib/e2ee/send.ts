import { getRotationInfo } from "@/lib/api/e2eeApi";
import { ApiError } from "@/lib/api/apiRequest";
import type { KeyBundle, MessagePayload, RotationInfo } from "@/types/e2ee";
import { getSendContext, refreshKeys, rememberKey } from "./chatKeys";
import { errorCode, isKeyConflict } from "./errors";
import { encryptPayload, randomKey, wrapKey } from "./primitives";
import { getDevice } from "./session";

export type Encrypted = {
  ciphertext: string;
  keyEpoch: number;
  deviceId: string;
  keyBundle?: KeyBundle;
};

const rotate = (info: RotationInfo) => {
  const key = randomKey();

  const bundle: KeyBundle = {
    epoch: info.nextEpoch,
    devices: info.devices.map((device) => ({
      deviceId: device.id,
      wrappedKey: wrapKey(key, device.publicKey),
    })),
    accounts: info.accounts.map((account) => ({
      userId: account.userId,
      wrappedKey: wrapKey(key, account.publicKey),
    })),
  };

  return { key, bundle };
};

export const sendWithKeys = async <T>(
  options: { conversationId: string; payload: MessagePayload },
  call: (encrypted: Encrypted) => Promise<T>,
): Promise<T> => {
  const { conversationId, payload } = options;
  const device = getDevice();
  let rotation: RotationInfo | null = null;

  for (let attempt = 0; attempt < 4; attempt++) {
    let epoch: number;
    let key: Uint8Array;
    let keyBundle: KeyBundle | undefined;

    if (rotation) {
      const next = rotate(rotation);
      epoch = rotation.nextEpoch;
      key = next.key;
      keyBundle = next.bundle;
    } else {
      const context = await getSendContext(conversationId);

      if (!context) {
        rotation = await getRotationInfo(conversationId);
        continue;
      }

      epoch = context.epoch;
      key = context.key;
    }

    try {
      const result = await call({
        ciphertext: encryptPayload(key, conversationId, epoch, payload),
        keyEpoch: epoch,
        deviceId: device.id,
        keyBundle,
      });

      if (keyBundle) rememberKey(conversationId, epoch, key);
      return result;
    } catch (error) {
      if (errorCode(error) === "KEY_ROTATION_REQUIRED") {
        rotation = (error as ApiError).details
          ? ((error as ApiError).details as RotationInfo)
          : await getRotationInfo(conversationId);
        continue;
      }

      if (isKeyConflict(error)) {
        rotation = null;
        await refreshKeys(conversationId);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Couldn't refresh the chat keys. Please try again.");
};
