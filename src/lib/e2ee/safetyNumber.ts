import { sha512 } from "@noble/hashes/sha2.js";
import { concat, fromB64, utf8 } from "./bytes";

const ITERATIONS = 5200;

const fingerprint = (userId: string, publicKey: string) => {
  const pk = fromB64(publicKey);
  let hash: Uint8Array<ArrayBufferLike> = concat(
    utf8("relay-safety-v1"),
    pk,
    utf8(userId),
  );

  for (let i = 0; i < ITERATIONS; i++) hash = sha512(concat(hash, pk));

  let digits = "";
  for (let i = 0; i < 6; i++) {
    const value = hash
      .subarray(i * 5, i * 5 + 5)
      .reduce((sum, byte) => sum * 256 + byte, 0);
    digits += String(value % 100_000).padStart(5, "0");
  }

  return digits;
};

export const safetyNumber = (
  a: { id: string; publicKey: string },
  b: { id: string; publicKey: string },
) =>
  [fingerprint(a.id, a.publicKey), fingerprint(b.id, b.publicKey)]
    .sort()
    .join("");
