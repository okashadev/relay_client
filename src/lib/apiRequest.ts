import { apiFetch } from "@/lib/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiRequest = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const res = await apiFetch(path, init);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error || "Something went wrong.", res.status);
  }

  return data as T;
};
