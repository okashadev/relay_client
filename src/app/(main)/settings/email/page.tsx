"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MailCheck,
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";
import GoogleManagedCard from "@/components/settings/GoogleManagedCard";
import PasswordField from "@/components/settings/PasswordField";
import SettingsShell from "@/components/settings/SettingsShell";
import { useCooldown } from "@/hooks/useCooldown";
import {
  requestEmailChange,
  resendCode,
  verifyEmailChange,
} from "@/lib/api/accountApi";
import { useAuthStore } from "@/store/authStore";
import { useEmailCheck } from "@/hooks/useEmailCheck";

const CODE_LENGTH = 8;
const RESEND_SECONDS = 60;

const LABEL =
  "block text-[11px] font-extrabold uppercase tracking-wider text-[#1D4533]/60 mb-1.5";

const INPUT =
  "w-full rounded-2xl border border-[#1D4533]/15 bg-white px-4 py-3 text-base md:text-xs font-semibold text-[#1D4533] outline-none transition-all focus:border-[#1D4533] focus:ring-4 focus:ring-[#1D4533]/10 disabled:opacity-60";

const toMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

type Step = "email" | "password" | "verify";

function ChangeEmailFlow({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const cooldown = useCooldown();

  const [step, setStep] = useState<Step>("email");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const normalized = newEmail.trim().toLowerCase();
  const emailStatus = useEmailCheck(normalized, currentEmail);

  const canContinue = emailStatus === "available" && !busy;

  const canRequest = password.length > 0 && !busy;
  const canConfirm = code.length === CODE_LENGTH && !busy;

  const handleNext = () => {
    if (!canContinue) return;

    setError(null);
    setStep("password");
  };

  const sendCode = async () => {
    setError(null);
    setBusy(true);

    try {
      const result = await requestEmailChange({ email: normalized, password });

      setPassword("");
      setCode("");
      setStep("verify");
      cooldown.start(RESEND_SECONDS);
      toast.success(result.message);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    setBusy(true);

    try {
      const result = await resendCode({ email: normalized });

      setCode("");
      cooldown.start(RESEND_SECONDS);
      toast.success(result.message);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setError(null);
    setBusy(true);

    try {
      const result = await verifyEmailChange({ email: normalized, code });

      if (result.success) {
        useAuthStore.setState((state) => ({
          user: state.user
            ? { ...state.user, email: result.email ?? normalized }
            : state.user,
        }));
        toast.success(result.message);
        router.push("/settings");
      }
    } catch (err) {
      setError(toMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm space-y-4">
      {/* Error */}
      {error && (
        <p
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold"
        >
          {error}
        </p>
      )}

      {step === "email" && (
        <form
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            handleNext();
          }}
          className="space-y-4"
        >
          <div className="px-4 py-3 rounded-2xl bg-[#1D4533]/5 border border-[#1D4533]/10">
            <p className={LABEL}>Current email</p>
            <p className="text-xs font-bold text-[#1D4533] wrap-anywhere">
              {currentEmail}
            </p>
          </div>

          <div>
            <label htmlFor="new-email" className={LABEL}>
              New email
            </label>

            <input
              id="new-email"
              name="new-email-address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              required
              className={INPUT}
            />

            {normalized && (
              <div
                aria-live="polite"
                className="mt-1.5 text-[11px] font-semibold"
              >
                {emailStatus === "invalid" && touched && (
                  <p className="text-rose-600">Enter a valid email address.</p>
                )}

                {emailStatus === "same" && (
                  <p className="text-rose-600">
                    This is already your email address.
                  </p>
                )}

                {emailStatus === "checking" && (
                  <p className="text-[#5E3122]/60 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    Checking email availability...
                  </p>
                )}

                {emailStatus === "available" && (
                  <p className="text-emerald-600">
                    Email address is available.
                  </p>
                )}

                {emailStatus === "taken" && (
                  <p className="text-rose-600">
                    This email address is already in use.
                  </p>
                )}

                {emailStatus === "error" && (
                  <p className="text-rose-600">
                    Could not check email availability. Please try again.
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-[11px] font-medium text-[#5E3122]/60 leading-relaxed">
            Enter the new email address you want to use with your Relay account.
          </p>

          <button
            type="submit"
            disabled={!canContinue}
            className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight size={15} />
          </button>
        </form>
      )}

      {step === "password" && (
        <form
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            if (canRequest) void sendCode();
          }}
          className="space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center">
            <LockKeyhole size={22} />
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#1D4533]">
              Confirm your identity
            </h3>
            <p className="mt-1 text-xs font-medium text-[#5E3122]/60 leading-relaxed">
              Enter your current password to continue changing your email
              address.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-[#1D4533]/5 border border-[#1D4533]/10">
            <p className={LABEL}>New email address</p>
            <p className="text-xs font-bold text-[#1D4533] wrap-anywhere">
              {normalized}
            </p>
          </div>

          <PasswordField
            id="email-password"
            label="Current password"
            value={password}
            onChange={setPassword}
            autoComplete="off"
            disabled={busy}
          />

          <p className="text-[11px] font-medium text-[#5E3122]/60 leading-relaxed">
            We'll send a verification code to your new email after confirming
            your password.
          </p>

          <button
            type="submit"
            disabled={!canRequest}
            className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                Send verification code
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setPassword("");
              setError(null);
            }}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#1D4533]/70 hover:text-[#1D4533] cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={14} />
            Back to email
          </button>
        </form>
      )}

      {step === "verify" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (canConfirm) void confirm();
          }}
          className="space-y-4"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center">
              <MailCheck size={22} />
            </div>

            <h3 className="text-sm font-extrabold text-[#1D4533]">
              Verify your new email
            </h3>

            <p className="text-xs font-medium text-[#5E3122]/70 leading-relaxed">
              We sent an {CODE_LENGTH}-character code to{" "}
              <span className="font-bold text-[#1D4533] wrap-anywhere">
                {normalized}
              </span>
              . It expires in 15 minutes.
            </p>
          </div>

          <div>
            <label htmlFor="email-code" className={LABEL}>
              Verification code
            </label>

            <input
              id="email-code"
              type="text"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, CODE_LENGTH),
                )
              }
              disabled={busy}
              maxLength={CODE_LENGTH}
              autoComplete="one-time-code"
              autoCapitalize="characters"
              spellCheck={false}
              required
              className={`${INPUT} text-center font-mono tracking-[0.35em]`}
            />
          </div>

          <button
            type="submit"
            disabled={!canConfirm}
            className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Verify and update email"
            )}
          </button>

          <div className="flex items-center justify-between gap-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setPassword("");
                setCode("");
                setError(null);
              }}
              disabled={busy}
              className="text-[#1D4533]/70 hover:text-[#1D4533] cursor-pointer disabled:opacity-50"
            >
              Change email
            </button>

            <button
              type="button"
              onClick={() => void resend()}
              disabled={busy || cooldown.remaining > 0}
              className="text-[#1D4533] hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              {cooldown.remaining > 0
                ? `Resend in ${cooldown.remaining}s`
                : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ChangeEmailPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <SettingsShell
      title="Email address"
      subtitle="Change the email you sign in with"
      backHref="/settings"
      maxWidth="max-w-md"
    >
      {user.provider === "LOCAL" ? (
        <ChangeEmailFlow currentEmail={user.email} />
      ) : (
        <GoogleManagedCard what="email address" detail={user.email} />
      )}
    </SettingsShell>
  );
}
