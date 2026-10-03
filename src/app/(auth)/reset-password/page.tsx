"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = watch("password", "");

  const hasMinLength = watchPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(
          resData.message ||
            "Failed to reset password. The link may have expired.",
        );
      }

      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7EAE0] text-[#5E3122] font-sans p-4 relative overflow-hidden selection:bg-[#F9D2BA] selection:text-[#5E3122]">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#F9D2BA]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#1D4533]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1D4533_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#F7EAE0]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#5E3122]/10 shadow-2xl shadow-[#5E3122]/10 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1D4533] flex items-center justify-center shadow-lg shadow-[#1D4533]/20">
            <MessageSquare className="w-6 h-6 text-[#F7EAE0]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1D4533]">
            Relay
          </span>
        </div>

        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1D4533]">
            {isSuccess ? "Password Reset Complete" : "Set New Password"}
          </h1>
          <p className="text-xs sm:text-sm text-[#5E3122]/80 leading-relaxed max-w-xs mx-auto font-medium">
            {isSuccess
              ? "Your password has been successfully updated. You can now log in to your account."
              : "Your new password must be different from previously used passwords."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 relative z-10"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white/70 border border-[#5E3122]/20 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/20 font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E3122]/50 hover:text-[#1D4533] transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-semibold text-rose-600 pt-0.5 pl-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-[#1D4533]/5 rounded-2xl space-y-1.5 text-[11px] border border-[#1D4533]/10">
                  <p className="font-semibold text-[#1D4533] mb-1">
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    <span
                      className={`flex items-center gap-1.5 transition-all duration-200 ${
                        hasMinLength
                          ? "text-[#1D4533] font-bold"
                          : "text-[#5E3122]/60"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${
                          hasMinLength
                            ? "text-[#1D4533]"
                            : "text-[#5E3122]/30"
                        }`}
                      />
                      At least 8 characters
                    </span>
                    <span
                      className={`flex items-center gap-1.5 transition-all duration-200 ${
                        hasUpper
                          ? "text-[#1D4533] font-bold"
                          : "text-[#5E3122]/60"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${
                          hasUpper ? "text-[#1D4533]" : "text-[#5E3122]/30"
                        }`}
                      />
                      One uppercase letter
                    </span>
                    <span
                      className={`flex items-center gap-1.5 transition-all duration-200 ${
                        hasNumber
                          ? "text-[#1D4533] font-bold"
                          : "text-[#5E3122]/60"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${
                          hasNumber ? "text-[#1D4533]" : "text-[#5E3122]/30"
                        }`}
                      />
                      One number
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-white/70 border border-[#5E3122]/20 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/20 font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E3122]/50 hover:text-[#1D4533] transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-semibold text-rose-600 pt-0.5 pl-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="w-full mt-3 py-3.5 px-4 bg-[#1D4533] hover:bg-[#153426] active:bg-[#0E2319] text-[#F7EAE0] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1D4533]/20 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F9D2BA]" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4 text-[#F9D2BA]" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#5E3122]/10 text-center text-xs">
                <Link
                  href="/login"
                  className="font-bold text-[#1D4533] hover:underline transition-all"
                >
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reset-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-2 space-y-5 relative z-10"
            >
              <div className="w-16 h-16 bg-[#1D4533] text-[#F9D2BA] rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#1D4533]/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/login")}
                className="w-full py-3.5 px-4 bg-[#1D4533] hover:bg-[#153426] text-[#F7EAE0] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#1D4533]/20 cursor-pointer"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#F9D2BA]" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-[#5E3122]/10 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#5E3122]/70">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1D4533]" />
          <span>Encrypted session security</span>
        </div>
      </motion.div>
    </div>
  );
}