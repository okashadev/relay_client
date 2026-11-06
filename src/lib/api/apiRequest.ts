import { apiFetch } from "@/lib/api/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const res = await apiFetch(path, init);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.error || "Something went wrong.",
      res.status,
      data?.code,
      data?.details,
    );
  }

  return data as T;
};
