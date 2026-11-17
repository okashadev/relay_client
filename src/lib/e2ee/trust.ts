import { getPublicKeys } from "@/lib/api/e2eeApi";
import { useTrustStore, type TrustStatus } from "@/store/trustStore";
import { getPeer, setPeer } from "./storage";

export type DeviceMap = Record<string, string>;

const pinKey = (meId: string, peerId: string) => `${meId}:${peerId}`;

const toMap = (devices?: { id: string; publicKey: string }[]): DeviceMap =>
  Object.fromEntries(
    (devices ?? []).map((device) => [device.id, device.publicKey]),
  );

const publish = (peerId: string, status: TrustStatus) => {
  useTrustStore.getState().set(peerId, status);
  return status;
};

export const fetchDevices = async (meId: string, peerId: string) => {
  const users = await getPublicKeys([peerId]);

  return {
    mine: toMap(users.find((user) => user.id === meId)?.devices),
    theirs: toMap(users.find((user) => user.id === peerId)?.devices),
  };
};

export const evaluatePeer = async (
  meId: string,
  peerId: string,
): Promise<TrustStatus> => {
  const { theirs } = await fetchDevices(meId, peerId);
  const key = pinKey(meId, peerId);
  const pin = await getPeer(key);
  const ids = Object.keys(theirs);

  if (!pin) {
    if (ids.length > 0) {
      await setPeer(key, {
        devices: theirs,
        verified: false,
        since: new Date().toISOString(),
      });
    }
    return publish(peerId, "AUTO");
  }

  if (
    ids.some(
      (id) => pin.devices[id] !== undefined && pin.devices[id] !== theirs[id],
    )
  ) {
    return publish(peerId, "KEY_CHANGED");
  }

  const added = ids.some((id) => pin.devices[id] === undefined);
  const removed = Object.keys(pin.devices).some(
    (id) => theirs[id] === undefined,
  );

  if (added && pin.verified) return publish(peerId, "NEW_DEVICES");

  if (added || removed) await setPeer(key, { ...pin, devices: theirs });

  return publish(peerId, pin.verified ? "VERIFIED" : "AUTO");
};

export const confirmVerified = async (
  meId: string,
  peerId: string,
  theirs: DeviceMap,
) => {
  await setPeer(pinKey(meId, peerId), {
    devices: theirs,
    verified: true,
    since: new Date().toISOString(),
  });

  return publish(peerId, "VERIFIED");
};

export const acceptPeerChanges = async (meId: string, peerId: string) => {
  const { theirs } = await fetchDevices(meId, peerId);

  await setPeer(pinKey(meId, peerId), {
    devices: theirs,
    verified: false,
    since: new Date().toISOString(),
  });

  return publish(peerId, "AUTO");
};
