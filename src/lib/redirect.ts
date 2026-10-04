const DEFAULT_REDIRECT = "/app";
const FAKE_ORIGIN = "http://relay.local";

export const getSafeRedirect = (
  value: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string => {
  if (!value) return fallback;

  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  try {
    const url = new URL(value, FAKE_ORIGIN);
    if (url.origin !== FAKE_ORIGIN) return fallback;

    if (url.pathname === "/login" || url.pathname === "/register") {
      return fallback;
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
};

export const getRedirectTarget = (): string => {
  const value = new URLSearchParams(window.location.search).get("redirect");
  return getSafeRedirect(value);
};
