import { getPresence } from "@/lib/api/ChatApi";
import { usePresenceStore } from "@/store/presenceStore";

let inFlight: Promise<void> | null = null;

export const syncPresence = () => {
  if (!inFlight) {
    inFlight = getPresence()
      .then((users) => usePresenceStore.getState().replaceAll(users))
      .catch(() => {})
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};
