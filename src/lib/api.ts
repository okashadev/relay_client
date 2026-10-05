import { useAuthStore } from "@/store/authStore";

let refreshPromise: Promise<string | null> | null = null;

export const refreshSession = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          useAuthStore.getState().clearAuth();
          return null;
        }
        const data = await res.json();
        useAuthStore.getState().setAuth(data.token, data.user);
        return data.token as string;
      } catch (error) {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const send = (token: string | null) =>
    fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let res = await send(useAuthStore.getState().accessToken);

  if (res.status === 401) {
    const body = await res
      .clone()
      .json()
      .catch(() => null);

    if (body?.code === "TOKEN_EXPIRED" || body?.code === "NO_TOKEN") {
      const newToken = await refreshSession();

      if (newToken) {
        res = await send(newToken);
      } else if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return res;
};

export const logoutUser = async () => {
  try {
    await fetch(`/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
  }
};
