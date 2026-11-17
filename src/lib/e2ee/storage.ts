import { openDB, type DBSchema, type IDBPDatabase } from "idb";

type KeyRecord = { secretKey: Uint8Array; publicKey: string };

export type PeerPin = {
  devices: Record<string, string>;
  verified: boolean;
  since: string;
};

interface Schema extends DBSchema {
  account: { key: string; value: KeyRecord };
  device: { key: string; value: KeyRecord };
  verified: { key: string; value: string };
  peers: { key: string; value: PeerPin };
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

const database = () =>
  (dbPromise ??= openDB<Schema>("relay-e2ee", 3, {
    upgrade(db) {
      for (const name of ["account", "device", "verified", "peers"] as const) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
    },
  }));

const deviceKey = (userId: string, deviceId: string) => `${userId}:${deviceId}`;

export const loadDevice = async (userId: string, deviceId: string) =>
  (await database()).get("device", deviceKey(userId, deviceId));

export const saveDevice = async (
  userId: string,
  deviceId: string,
  value: KeyRecord,
) =>
  void (await (
    await database()
  ).put("device", value, deviceKey(userId, deviceId)));

export const deleteDevice = async (userId: string, deviceId: string) =>
  (await database()).delete("device", deviceKey(userId, deviceId));

export const loadAccount = async (userId: string) =>
  (await database()).get("account", userId);

export const saveAccount = async (userId: string, value: KeyRecord) =>
  void (await (await database()).put("account", value, userId));

export const clearAccount = async (userId: string) =>
  (await database()).delete("account", userId);

export const getPeer = async (key: string) =>
  (await database()).get("peers", key);

export const setPeer = async (key: string, value: PeerPin) =>
  void (await (await database()).put("peers", value, key));
