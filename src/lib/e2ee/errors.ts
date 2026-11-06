export class E2eeLockedError extends Error {
  constructor() {
    super("Encryption is locked. Please unlock it with your passphrase.");
  }
}

export class E2eeNotReadyError extends Error {
  constructor(message = "Someone in this chat hasn't set up encryption yet.") {
    super(message);
  }
}

export class E2eeKeyMissingError extends Error {
  constructor() {
    super("The key for this message isn't available.");
  }
}

export const errorCode = (error: unknown) =>
  (error as { code?: string } | null)?.code;

export const isKeyConflict = (error: unknown) =>
  ["KEY_EPOCH_STALE", "KEY_EPOCH_CONFLICT"].includes(errorCode(error) ?? "");
