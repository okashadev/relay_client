import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { io, type Socket } from "socket.io-client";
import { refreshSession } from "./api";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

const AUTH_ERROR_CODES = new Set([
  "NO_TOKEN",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
]);

let socket: Socket | null = null;
let authRetried = false;

export const getSocket = (): Socket => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: (callback) => {
      callback({ token: useAuthStore.getState().accessToken });
    },
  });

  socket.on("connect", () => {
    authRetried: false;
    useNotificationStore.getState().refresh();
  });

  socket.on("connect_error", async (error) => {
    const code = (error as Error & { data?: { code?: string } }).data?.code;

    if (!code || !AUTH_ERROR_CODES.has(code)) return;

    if (authRetried) return;
    authRetried = true;

    const token = await refreshSession();
    if (token) socket?.connect();
  });

  return socket;
};
