"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const CODE_LENGTH = 8;
const RESEND_SECONDS = 60;

const sanitize = (value: string) =>
  value.toUpperCase().replace(/[^A-HJ-KM-NP-Z2-9]/g, "");

const emptyOtp = () => new Array<string>(CODE_LENGTH).fill("");

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(emptyOtp());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(
    searchParams.get("sent") === "1" ? RESEND_SECONDS : 0,
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const fillFrom = (startIndex: number, raw: string) => {
    const chars = sanitize(raw)
      .slice(0, CODE_LENGTH - startIndex)
      .split("");
    if (chars.length === 0) return;

    setOtp((prev) => {
      const next = [...prev];
      chars.forEach((char, i) => {
        next[startIndex + i] = char;
      });
      return next;
    });

    const focusIndex = Math.min(startIndex + chars.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    setServerError(null);

    if (value === "") {
      setOtp((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const incoming =
      value.length === 2 && otp[index] !== "" ? value.slice(-1) : value;

    fillFrom(index, incoming);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      e.preventDefault();
      setOtp((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setServerError(null);
    fillFrom(0, e.clipboardData.getData("text"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < CODE_LENGTH || isSubmitting) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setAuth(data.token, data.user);
      setIsSuccess(true);
    } catch (error: any) {
      setServerError(error.message || "Verification failed");
      setOtp(emptyOtp());
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server ka cooldown frontend ke timer se pehle bhi lag sakta hai
        if (res.status === 429 && data.retryAfterSeconds) {
          setTimer(data.retryAfterSeconds);
        }
        throw new Error(data.error || "Could not resend the code");
      }

      toast.success(data.message);
      setTimer(RESEND_SECONDS);
      setOtp(emptyOtp());
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setServerError(error.message || "Could not resend the code");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7EAE0] text-[#5E3122] font-sans p-4 relative overflow-hidden selection:bg-[#F9D2BA] selection:text-[#5E3122]">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#F9D2BA]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#1D4533]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1D4533_1px,transparent_1px)] bg-size-[24px_24px] opacity-5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#F7EAE0]/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#5E3122]/10 shadow-2xl shadow-[#5E3122]/10 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1D4533] flex items-center justify-center shadow-lg shadow-[#1D4533]/20">
            <MessageSquare className="w-6 h-6 text-[#F7EAE0]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1D4533]">
            Relay
          </span>
        </div>

        {!isSuccess ? (
          <>
            {/* Title & Icon */}
            <div className="text-center space-y-2 mb-8">
              <div className="w-14 h-14 bg-[#F9D2BA]/50 text-[#1D4533] rounded-2xl mx-auto flex items-center justify-center mb-4 border border-[#5E3122]/10 shadow-sm">
                <Mail className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1D4533]">
                Verify Your Email
              </h1>
              <p className="text-xs sm:text-sm text-[#5E3122]/80 leading-relaxed max-w-xs mx-auto">
                We&apos;ve sent an 8-character verification code to{" "}
                <span className="font-semibold text-[#1D4533] break-all">
                  {email}
                </span>
              </p>
            </div>

            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold">
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className="flex items-center justify-between gap-1.5 sm:gap-2"
                onPaste={handlePaste}
              >
                {otp.map((char, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`Verification code character ${index + 1}`}
                    value={char}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold uppercase rounded-xl bg-white/70 border border-[#5E3122]/20 text-[#1D4533] focus:outline-none focus:border-[#1D4533] focus:ring-2 focus:ring-[#1D4533]/20 transition-all shadow-sm"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.join("").length < CODE_LENGTH}
                className="w-full py-3.5 px-4 bg-[#1D4533] hover:bg-[#153426] text-[#F7EAE0] font-semibold rounded-2xl shadow-lg shadow-[#1D4533]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#5E3122]/10 text-center text-xs text-[#5E3122]/80 flex items-center justify-between">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isResending}
                className="font-semibold text-[#1D4533] hover:underline flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`}
                />
                {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4 space-y-4"
          >
            <div className="w-16 h-16 bg-[#1D4533] text-[#F9D2BA] rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#1D4533]/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-[#1D4533]">
              Email Verified!
            </h2>
            <p className="text-xs sm:text-sm text-[#5E3122]/80 leading-relaxed">
              Your email address has been successfully verified. You can now
              access your Relay dashboard.
            </p>

            <div className="pt-4">
              <Link
                href="/app"
                className="w-full py-3.5 px-4 bg-[#1D4533] hover:bg-[#153426] text-[#F7EAE0] font-semibold rounded-2xl shadow-lg shadow-[#1D4533]/20 transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                <span>Continue to App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
