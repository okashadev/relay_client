"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import PasswordField from "@/components/settings/PasswordField";
import {
  MIN_PASSPHRASE,
  changePassphrase,
  disablePassphrase,
  enablePassphrase,
  forgotPassphrase,
  unlockHistory,
} from "@/lib/e2ee/passphrase";
import { useAuthStore } from "@/store/authStore";

export type PassphraseMode =
  | "unlock"
  | "enable"
  | "change"
  | "disable"
  | "reset";

const COPY: Record<
  PassphraseMode,
  {
    title: string;
    subtitle: string;
    submit: string;
    done: string;
    ack?: string;
  }
> = {
  unlock: {
    title: "Unlock history",
    subtitle:
      "Enter your passphrase to read your older messages on this device.",
    submit: "Unlock",
    done: "History unlocked.",
  },
  enable: {
    title: "Turn on passphrase",
    subtitle:
      "Only you will be able to restore your chat history on a new device. Relay's server won't be able to.",
    submit: "Turn on",
    done: "Passphrase turned on.",
    ack: "I understand that if I forget this passphrase, my history won't come back on a new device.",
  },
  change: {
    title: "Change passphrase",
    subtitle: "Your history stays the same. Only the passphrase changes.",
    submit: "Change passphrase",
    done: "Passphrase changed.",
    ack: "I understand that if I forget this passphrase, my history won't come back on a new device.",
  },
  disable: {
    title: "Turn off passphrase",
    subtitle:
      "New devices will get your history automatically again, without asking. Relay's server will be able to restore it for you.",
    submit: "Turn off",
    done: "Passphrase turned off.",
  },
  reset: {
    title: "Forgot passphrase",
    subtitle:
      "We'll turn passphrase protection off. This device keeps what it can already read, but new devices won't get your older messages.",
    submit: "Reset and turn off",
    done: "Passphrase removed.",
    ack: "I understand that my older messages won't be restored on new devices.",
  },
};

const BUTTON =
  "w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export default function PassphraseDialog({
  mode,
  onClose,
  onDone,
  onForgot,
  onBack,
}: {
  mode: PassphraseMode;
  onClose: () => void;
  onDone?: () => void;
  onForgot?: () => void;
  onBack?: () => void;
}) {
  const isLocal = useAuthStore((state) => state.user?.provider === "LOCAL");

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const copy = COPY[mode];
  const needsCurrent =
    mode === "unlock" || mode === "change" || mode === "disable";
  const needsNew = mode === "enable" || mode === "change";
  const needsPassword = mode === "reset" && isLocal;

  const valid =
    (!needsCurrent || current.length > 0) &&
    (!needsNew || (next.length >= MIN_PASSPHRASE && next === confirm)) &&
    (!needsPassword || password.length > 0) &&
    (!copy.ack || understood);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const run = () => {
    switch (mode) {
      case "unlock":
        return unlockHistory(current);
      case "enable":
        return enablePassphrase(next, (done, total) =>
          setProgress({ done, total }),
        );
      case "change":
        return changePassphrase(current, next);
      case "disable":
        return disablePassphrase(current);
      case "reset":
        return forgotPassphrase(password || undefined);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || busy) return;

    setBusy(true);
    setError(null);

    try {
      await run();
      toast.success(copy.done);
      onDone?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
      setProgress(null);
    }
  };

  if (typeof document === "undefined") return null;

  const danger = mode === "disable" || mode === "reset";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
      className="fixed inset-x-0 top-0 z-50 app-height flex items-end md:items-center justify-center bg-[#1D4533]/40 md:p-6"
    >
      <form
        onSubmit={submit}
        className="w-full md:max-w-md max-h-[92%] md:max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-3xl md:rounded-3xl bg-[#F7EAE0] border border-[#1D4533]/15 shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#1D4533] tracking-tight">
              {copy.title}
            </h2>
            <p className="mt-1 text-[11px] font-medium text-[#5E3122]/70 leading-relaxed">
              {copy.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center cursor-pointer disabled:opacity-40 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold"
          >
            {error}
          </p>
        )}

        {needsPassword && (
          <PasswordField
            id="reset-password"
            label="Account password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={busy}
          />
        )}

        {needsCurrent && (
          <PasswordField
            id="passphrase-current"
            label={mode === "change" ? "Current passphrase" : "Passphrase"}
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            disabled={busy}
          />
        )}

        {needsNew && (
          <>
            <PasswordField
              id="passphrase-new"
              label={mode === "change" ? "New passphrase" : "Passphrase"}
              value={next}
              onChange={setNext}
              autoComplete="new-password"
              disabled={busy}
            />
            <PasswordField
              id="passphrase-confirm"
              label="Confirm passphrase"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              disabled={busy}
            />
            <p className="text-[11px] font-semibold text-[#5E3122]/60">
              At least {MIN_PASSPHRASE} characters. Something long you can
              remember.
              {next.length > 0 && confirm.length > 0 && next !== confirm && (
                <span className="text-rose-600">
                  {" "}
                  The two don&apos;t match.
                </span>
              )}
            </p>
          </>
        )}

        {copy.ack && (
          <label className="flex items-start gap-2.5 text-[11px] font-semibold text-[#5E3122]/80 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              disabled={busy}
              className="mt-0.5 accent-[#1D4533]"
            />
            {copy.ack}
          </label>
        )}

        <button
          type="submit"
          disabled={!valid || busy}
          className={`${BUTTON} ${
            danger
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-[#1D4533] text-[#F7EAE0] hover:bg-[#1D4533]/90"
          }`}
        >
          {busy ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {progress && progress.total > 0
                ? `Preparing history… ${progress.done}/${progress.total}`
                : mode === "enable" || mode === "change"
                  ? "Securing…"
                  : "Please wait…"}
            </>
          ) : (
            copy.submit
          )}
        </button>

        {mode === "unlock" && onForgot && (
          <button
            type="button"
            onClick={onForgot}
            disabled={busy}
            className="w-full text-xs font-bold text-[#1D4533]/70 hover:text-[#1D4533] cursor-pointer disabled:opacity-50"
          >
            Forgot your passphrase?
          </button>
        )}

        {mode === "reset" && onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="w-full text-xs font-bold text-[#1D4533]/70 hover:text-[#1D4533] cursor-pointer disabled:opacity-50"
          >
            Back
          </button>
        )}
      </form>
    </div>,
    document.body,
  );
}
