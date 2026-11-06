import { getConversationKeys, uploadAccountKeysApi } from "@/lib/api/e2eeApi";
import { E2eeKeyMissingError } from "./errors";
import { unwrapKey, wrapKey } from "./primitives";
import { getAccount, getDevice } from "./session";

type Entry = { keyEpoch: number; keys: Map<number, Uint8Array> };
type Row = { epoch: number; wrappedKey: string };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<Entry>>();
const missing = new Set<string>();
const healed = new Set<string>();

export const clearChatKeyCache = () => {
  cache.clear();
  inflight.clear();
  missing.clear();
  healed.clear();
};

export const invalidateKeys = (conversationId: string) => {
  cache.delete(conversationId);
  healed.delete(conversationId);
  for (const key of [...missing]) {
    if (key.startsWith(`${conversationId}:`)) missing.delete(key);
  }
};

const open = (
  rows: Row[],
  secretKey: Uint8Array,
  into: Map<number, Uint8Array>,
) => {
  for (const row of rows) {
    if (into.has(row.epoch)) continue;

    try {
      into.set(row.epoch, unwrapKey(row.wrappedKey, secretKey));
    } catch {}
  }
};

const uploads = new Set<Promise<unknown>>();

export const flushBackfills = () => Promise.allSettled([...uploads]);

const backfill = (
  conversationId: string,
  keys: Map<number, Uint8Array>,
  covered: Row[],
) => {
  const account = getAccount();
  if (!account || healed.has(conversationId)) return;

  const have = new Set(covered.map((row) => row.epoch));
  const rows = [...keys]
    .filter(([epoch]) => !have.has(epoch))
    .map(([epoch, key]) => ({
      conversationId,
      epoch,
      wrappedKey: wrapKey(key, account.publicKey),
    }));

  healed.add(conversationId);

  if (rows.length > 0) {
    const task: Promise<unknown> = uploadAccountKeysApi(rows)
      .catch(() => healed.delete(conversationId))
      .finally(() => uploads.delete(task));

    uploads.add(task);
  }
};

const load = (conversationId: string): Promise<Entry> => {
  const pending = inflight.get(conversationId);
  if (pending) return pending;

  const task = (async () => {
    const device = getDevice();
    const { keyEpoch, deviceKeys, accountKeys } = await getConversationKeys(
      conversationId,
      device.id,
    );
    const keys = new Map<number, Uint8Array>();

    open(deviceKeys, device.secretKey, keys);

    const account = getAccount();
    if (account) {
      open(accountKeys, account.secretKey, keys);
      backfill(conversationId, keys, accountKeys);
    }

    const entry = { keyEpoch, keys };
    cache.set(conversationId, entry);
    return entry;
  })().finally(() => inflight.delete(conversationId));

  inflight.set(conversationId, task);
  return task;
};

export const refreshKeys = (conversationId: string) => {
  invalidateKeys(conversationId);
  return load(conversationId);
};

export const getEntry = async (conversationId: string) =>
  cache.get(conversationId) ?? load(conversationId);

export const rememberKey = (
  conversationId: string,
  epoch: number,
  key: Uint8Array,
) => {
  const entry = cache.get(conversationId) ?? { keyEpoch: 0, keys: new Map() };

  entry.keys.set(epoch, key);
  entry.keyEpoch = Math.max(entry.keyEpoch, epoch);
  cache.set(conversationId, entry);
};

export const getKeyForEpoch = async (conversationId: string, epoch: number) => {
  const hit = cache.get(conversationId)?.keys.get(epoch);
  if (hit) return hit;

  if (missing.has(`${conversationId}:${epoch}`))
    throw new E2eeKeyMissingError();

  const key = (await refreshKeys(conversationId)).keys.get(epoch);

  if (!key) {
    missing.add(`${conversationId}:${epoch}`);
    throw new E2eeKeyMissingError();
  }

  return key;
};

export const getSendContext = async (conversationId: string) => {
  const entry = await getEntry(conversationId);
  const key = entry.keys.get(entry.keyEpoch);

  return entry.keyEpoch > 0 && key ? { epoch: entry.keyEpoch, key } : null;
};
