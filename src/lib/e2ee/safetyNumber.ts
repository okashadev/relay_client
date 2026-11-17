import { sha512 } from "@noble/hashes/sha2.js";
import { concat, fromB64, utf8 } from "./bytes";

const ITERATIONS = 5200;
const QR_PREFIX = "relay-sn:1:";

export type SafetyParty = { id: string; keys: string[] };

const fingerprint = ({ id, keys }: SafetyParty) => {
  const material = concat(...[...keys].sort().map(fromB64));
  let hash: Uint8Array<ArrayBufferLike> = concat(
    utf8("relay-safety-v2"),
    utf8(id),
    material,
  );

  for (let i = 0; i < ITERATIONS; i++) hash = sha512(concat(hash, material));

  let digits = "";
  for (let i = 0; i < 6; i++) {
    const value = hash
      .subarray(i * 5, i * 5 + 5)
      .reduce((sum, byte) => sum * 256 + byte, 0);
    digits += String(value % 100_000).padStart(5, "0");
  }

  return digits;
};

export const safetyNumber = (a: SafetyParty, b: SafetyParty) =>
  [fingerprint(a), fingerprint(b)].sort().join("");

export const toQrValue = (number: string) => `${QR_PREFIX}${number}`;

export const parseQrValue = (value: string) => {
  if (!value.startsWith(QR_PREFIX)) return null;

  const number = value.slice(QR_PREFIX.length);
  return /^\d{60}$/.test(number) ? number : null;
};
