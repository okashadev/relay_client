import { x25519 } from "@noble/curves/ed25519";
import { randomBytes } from "@noble/hashes/utils";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { argon2idAsync } from "@noble/hashes/argon2";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { concat, fromB64, fromUtf8, toB64, utf8 } from "./bytes";
import type { BackupBlob } from "@/types/e2ee";

export const randomKey = () => randomBytes(32);

export const generateKeyPair = () => {
  const secretKey = randomBytes(32);
  return { secretKey, publicKey: x25519.getPublicKey(secretKey) };
};

export const publicKeyOf = (secretKey: Uint8Array) =>
  toB64(x25519.getPublicKey(secretKey));

const seal = (key: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array) => {
  const nonce = randomBytes(24);
  return concat(nonce, xchacha20poly1305(key, nonce, aad).encrypt(plaintext));
};

const open = (key: Uint8Array, sealed: Uint8Array, aad?: Uint8Array) =>
  xchacha20poly1305(key, sealed.subarray(0, 24), aad).decrypt(
    sealed.subarray(24),
  );

const WRAP_INFO = utf8("relay-wrap-v1");

const wrapSecret = (
  shared: Uint8Array,
  ephemeralPk: Uint8Array,
  recipientPk: Uint8Array,
) => hkdf(sha256, shared, concat(ephemeralPk, recipientPk), WRAP_INFO, 32);

export const wrapKey = (chatKey: Uint8Array, recipientPublicKey: string) => {
  const recipient = fromB64(recipientPublicKey);
  const ephemeral = generateKeyPair();
  const shared = x25519.getSharedSecret(ephemeral.secretKey, recipient);
  const secret = wrapSecret(shared, ephemeral.publicKey, recipient);

  return toB64(concat(ephemeral.publicKey, seal(secret, chatKey)));
};

export const unwrapKey = (wrapped: string, secretkey: Uint8Array) => {
  const bytes = fromB64(wrapped);
  const ephemeralPk = bytes.subarray(0, 32);
  const shared = x25519.getSharedSecret(secretkey, ephemeralPk);
  const secret = wrapSecret(
    shared,
    ephemeralPk,
    x25519.getPublicKey(secretkey),
  );

  return open(secret, bytes.subarray(32));
};

const aadFor = (conversationId: string, epoch: number) =>
  utf8(`relay1|${conversationId}|${epoch}`);

export const encryptPayload = (
  key: Uint8Array,
  conversationId: string,
  epoch: number,
  payload: unknown,
) =>
  toB64(
    seal(key, utf8(JSON.stringify(payload)), aadFor(conversationId, epoch)),
  );

export const decryptPayload = <T>(
  key: Uint8Array,
  conversationId: string,
  epoch: number,
  ciphertext: string,
): T =>
  JSON.parse(
    fromUtf8(open(key, fromB64(ciphertext), aadFor(conversationId, epoch))),
  ) as T;

const BLOB_AAD = utf8("relay-blob-v1");

export const encryptBlob = (key: Uint8Array, data: Uint8Array) =>
  seal(key, data, BLOB_AAD);

export const decryptBlob = (key: Uint8Array, sealed: Uint8Array) =>
  open(key, sealed, BLOB_AAD);

export const BACKUP_PARAMS = { m: 32_768, t: 3, p: 1 } as const;

export const deriveBackupKey = (
  passPhrase: string,
  salt: Uint8Array,
  params: { m: number; t: number; p: number },
) =>
  argon2idAsync(utf8(passPhrase.normalize("NFKC")), salt, {
    ...params,
    dkLen: 32,
    asyncTick: 10,
  });

const backupAad = (publicKey: string) => utf8(`relay-backup-v1|${publicKey}`);

export const makeBackup = async (
  secretKey: Uint8Array,
  publicKey: string,
  passphrase: string,
): Promise<BackupBlob> => {
  const salt = randomBytes(16);
  const key = await deriveBackupKey(passphrase, salt, BACKUP_PARAMS);

  return {
    data: toB64(seal(key, secretKey, backupAad(publicKey))),
    salt: toB64(salt),
    kdf: "argon2id",
    kdfParams: { ...BACKUP_PARAMS },
  };
};

export const openBackup = async (
  backup: BackupBlob,
  passPhrase: string,
  publicKey: string,
) => {
  const { m, t, p } = backup.kdfParams;

  if (m > 262_144 || t > 10 || p > 16) throw new Error("Unsupported backup.");

  const key = await deriveBackupKey(passPhrase, fromB64(backup.salt), {
    m,
    t,
    p,
  });

  return open(key, fromB64(backup.data), backupAad(publicKey));
};
