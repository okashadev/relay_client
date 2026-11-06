import { create } from "zustand";
import type { E2eeMode } from "@/types/e2ee";

type Fields = {
  status: "loading" | "ready" | "error";
  mode: E2eeMode;
  unlocked: boolean;
  deviceId: string | null;
  error: string | null;
  keysVersion: number;
};

type State = Fields & {
  set: (patch: Partial<Fields>) => void;
  bumpKeys: () => void;
  reset: () => void;
};

const initial: Fields = {
  status: "loading",
  mode: "NONE",
  unlocked: false,
  deviceId: null,
  error: null,
  keysVersion: 0,
};

export const useE2eeStore = create<State>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  bumpKeys: () => set((state) => ({ keysVersion: state.keysVersion + 1 })),
  reset: () => set(initial),
}));