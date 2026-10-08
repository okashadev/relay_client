import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function SocketProvider() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    socket.connect();

    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        !socket.connected &&
        !socket.active
      ) {
        socket.connect();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return null;
}
