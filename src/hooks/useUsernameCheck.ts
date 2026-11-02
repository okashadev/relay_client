"use client";

import { useEffect, useState } from "react";
import { checkUsername } from "@/lib/api/profileApi";
import { USERNAME_RE } from "@/lib/profileRules";

export type UsernameStatus =
  | "same"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

export function useUsernameCheck(candidate: string, current: string): UsernameStatus {
  const [result, setResult] = useState<{
    username: string;
    available: boolean | null;
  } | null>(null);

  const isSame = candidate === current;
  const isValid = USERNAME_RE.test(candidate);
  const shouldCheck = !isSame && isValid;

  useEffect(() => {
    if (!shouldCheck) return;

    const controller = new AbortController();

    const timer = setTimeout(() => {
      checkUsername(candidate, controller.signal)
        .then((available) => setResult({ username: candidate, available }))
        .catch(() => {
          if (!controller.signal.aborted) {
            setResult({ username: candidate, available: null });
          }
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [candidate, shouldCheck]);

  if (isSame) return "same";
  if (!isValid) return "invalid";
  if (result?.username !== candidate) return "checking";
  if (result.available === null) return "error";

  return result.available ? "available" : "taken";
}