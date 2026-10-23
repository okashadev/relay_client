import { create } from "zustand";
import type { PresenceInfo } from "@/types/chat";

type PresenceState = {
  byUser: Record<string, PresenceInfo>;
  replaceAll: (items: ({ id: string } & PresenceInfo)[]) => void;
  set: (userId: string, presence: PresenceInfo) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  byUser: {},
  replaceAll: (items) =>
    set({
      byUser: Object.fromEntries(
        items.map(({ id, status, lastSeen }) => [id, { status, lastSeen }]),
      ),
    }),
  set: (userId, presence) =>
    set((state) => ({ byUser: { ...state.byUser, [userId]: presence } })),
}));
