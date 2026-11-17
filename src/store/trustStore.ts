import { create } from "zustand";

export type TrustStatus = "AUTO" | "VERIFIED" | "NEW_DEVICES" | "KEY_CHANGED";

type State = {
  byPeer: Record<string, TrustStatus>;
  set: (peerId: string, status: TrustStatus) => void;
};

export const useTrustStore = create<State>((set) => ({
  byPeer: {},
  set: (peerId, status) =>
    set((state) =>
      state.byPeer[peerId] === status
        ? state
        : { byPeer: { ...state.byPeer, [peerId]: status } },
    ),
}));
