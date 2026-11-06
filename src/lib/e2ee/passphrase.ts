import { getConversations } from "@/lib/api/ChatApi";
import {
  getBackupApi,
  resetAccountApi,
  setPassphraseApi,
  turnOffPassphraseApi,
  type BackupResponse,
} from "@/lib/api/e2eeApi";
import { useAuthStore } from "@/store/authStore";
import { useChatListStore } from "@/store/chatListStore";
import { useE2eeStore } from "@/store/e2eeStore";
import type { E2eeMode } from "@/types/e2ee";
import { fromB64, toB64 } from "./bytes";
import { clearChatKeyCache, flushBackfills, refreshKeys } from "./chatKeys";
import {
  generateKeyPair,
  makeBackup,
  openBackup,
  publicKeyOf,
} from "./primitives";
import { adoptAccount, getAccount } from "./session";

export const MIN_PASSPHRASE = 10;

type PassphraseBackup = Extract<BackupResponse, { mode: "PASSPHRASE" }>;

const currentUserId = () => {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error("Please sign in again.");
  return id;
};

const refreshEverything = (patch: { mode?: E2eeMode; unlocked?: boolean }) => {
  clearChatKeyCache();

  const store = useE2eeStore.getState();
  store.set(patch);
  store.bumpKeys();

  useChatListStore.getState().invalidate();
};

const adoptServerAccount = async (
  response: Extract<BackupResponse, { mode: "SERVER" }>,
) => {
  const secretKey = fromB64(response.accountSecretKey);

  if (publicKeyOf(secretKey) !== response.accountPublicKey) {
    throw new Error("Your account key couldn't be verified.");
  }

  await adoptAccount(currentUserId(), {
    secretKey,
    publicKey: response.accountPublicKey,
  });
  refreshEverything({ mode: "SERVER", unlocked: true });
};

const fetchBackup = async (): Promise<PassphraseBackup> => {
  const response = await getBackupApi();

  if (response.mode === "PASSPHRASE") return response;
  if (response.mode === "SERVER") await adoptServerAccount(response);

  throw new Error(
    "Passphrase protection is off now. Your history is available.",
  );
};

const openWith = async (passphrase: string) => {
  const { backup, accountPublicKey } = await fetchBackup();

  try {
    const secretKey = await openBackup(backup, passphrase, accountPublicKey);
    if (publicKeyOf(secretKey) !== accountPublicKey)
      throw new Error("mismatch");

    return { secretKey, publicKey: accountPublicKey };
  } catch {
    throw new Error("Incorrect passphrase.");
  }
};

const prepareHistory = async (
  onProgress?: (done: number, total: number) => void,
) => {
  const queue = (await getConversations()).map((chat) => chat.id);
  const total = queue.length;
  let done = 0;

  const worker = async () => {
    for (let id = queue.shift(); id; id = queue.shift()) {
      await refreshKeys(id).catch(() => undefined);
      onProgress?.(++done, total);
    }
  };

  await Promise.all(Array.from({ length: 4 }, worker));
  await flushBackfills();
};

export const enablePassphrase = async (
  passphrase: string,
  onProgress?: (done: number, total: number) => void,
) => {
  const account = getAccount();
  if (!account)
    throw new Error("Encryption isn't ready on this device. Please reload.");

  await prepareHistory(onProgress);
  await setPassphraseApi(
    await makeBackup(account.secretKey, account.publicKey, passphrase),
  );

  useE2eeStore.getState().set({ mode: "PASSPHRASE", unlocked: true });
};

export const unlockHistory = async (passphrase: string) => {
  const userId = currentUserId();
  const { secretKey, publicKey } = await openWith(passphrase);

  await adoptAccount(userId, { secretKey, publicKey });
  refreshEverything({ mode: "PASSPHRASE", unlocked: true });
};

export const changePassphrase = async (current: string, next: string) => {
  const userId = currentUserId();
  const { secretKey, publicKey } = await openWith(current);

  await setPassphraseApi(await makeBackup(secretKey, publicKey, next));

  if (!getAccount()) {
    await adoptAccount(userId, { secretKey, publicKey });
    refreshEverything({ unlocked: true });
  }
};

export const disablePassphrase = async (passphrase: string) => {
  const userId = currentUserId();
  const { secretKey, publicKey } = await openWith(passphrase);

  await turnOffPassphraseApi(toB64(secretKey));
  await adoptAccount(userId, { secretKey, publicKey });
  refreshEverything({ mode: "SERVER", unlocked: true });
};

export const forgotPassphrase = async (password?: string) => {
  const userId = currentUserId();
  const pair = generateKeyPair();
  const publicKey = toB64(pair.publicKey);

  await resetAccountApi({
    accountPublicKey: publicKey,
    accountSecretKey: toB64(pair.secretKey),
    password,
  });

  await adoptAccount(userId, { secretKey: pair.secretKey, publicKey });

  useAuthStore.setState((state) => ({
    user: state.user
      ? { ...state.user, accountPublicKey: publicKey }
      : state.user,
  }));
  refreshEverything({ mode: "SERVER", unlocked: true });
};
