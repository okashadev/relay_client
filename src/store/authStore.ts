import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar?: string | null;
  accountPublicKey: string | null;
  isEmailVerified: boolean;
  provider: "LOCAL" | "GOOGLE";
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
