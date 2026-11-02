"use client";

import { useEffect, useState } from "react";
import { checkEmail } from "@/lib/api/accountApi";
import { EMAIL_RE } from "@/lib/profileRules";

export type EmailStatus =
  | "same"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

export function useEmailCheck(candidate: string, current: string): EmailStatus {
  const normalized = candidate.trim().toLowerCase();

  const [result, setResult] = useState<{
    email: string;
    available: boolean | null;
  } | null>(null);

  const isSame = normalized === current.trim().toLowerCase();
  const isValid = EMAIL_RE.test(normalized);
  const shouldCheck = !isSame && isValid;

  useEffect(() => {
    if (!shouldCheck) return;

    const controller = new AbortController();

    const timer = setTimeout(() => {
      checkEmail(normalized, controller.signal)
        .then(({ available }) => setResult({ email: normalized, available }))
        .catch(() => {
          if (!controller.signal.aborted) {
            setResult({ email: normalized, available: null });
          }
        });
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalized, shouldCheck]);

  if (!normalized) return "invalid";
  if (isSame) return "same";
  if (!isValid) return "invalid";
  if (result?.email !== normalized) return "checking";
  if (result.available === null) return "error";

  return result.available ? "available" : "taken";
}