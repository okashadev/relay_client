"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { RegisterFormValues, registerSchema } from "@/validators/auth";
import { calculatePasswordStrength } from "@/utils/password";
import { toast } from "sonner";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [view, setView] = useState<"options" | "email-form">("options");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const watchPassword = watch("password", "");

  const hasMinLength = watchPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);

  const strength = calculatePasswordStrength(watchPassword);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      console.log(resData);

      if (!response.ok) {
        throw new Error(
          resData.error || "Something went wrong during registration",
        );
      }

      toast.success(resData.message || "Account created successfully!");
      router.push(
        `/verify-email?email=${encodeURIComponent(resData.user?.email)}`,
      );
    } catch (err: any) {
      setServerError(err.error || "Something went wrong during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full space-y-6 max-w-md mx-auto"
    >
      <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#1D4533] flex items-center justify-center shadow-md">
          <MessageSquare className="w-4 h-4 text-[#F9D2BA]" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#1D4533]">
          Relay
        </span>
      </div>

      <div className="text-center lg:text-left space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#1D4533] tracking-tight">
          Create your account
        </h1>
        <p className="text-xs text-[#5E3122]/70 font-medium">
          Join Relay to start instant, encrypted conversations today.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[#F7EAE0]/80 backdrop-blur-md rounded-2xl border border-[#1D4533]/10 p-6 sm:p-7 shadow-xl shadow-[#1D4533]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9D2BA]/30 rounded-full blur-2xl pointer-events-none" />

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === "options" ? (
            <motion.div
              key="options"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 py-2"
            >
              <div className="space-y-1.5 text-center mb-6">
                <span className="text-[10px] font-bold text-[#5E3122]/60 uppercase tracking-wider block">
                  Get started in seconds
                </span>
                <p className="text-xs text-[#5E3122]/80 font-medium">
                  Choose how you would like to register for Relay
                </p>
              </div>

              <GoogleAuthButton onError={setServerError} />

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-[#1D4533]/15" />
                <span className="absolute bg-[#F7EAE0] px-3 text-[10px] font-bold text-[#5E3122]/60 uppercase tracking-wider">
                  Or
                </span>
              </div>

              <button
                type="button"
                onClick={() => setView("email-form")}
                className="w-full py-3.5 px-4 bg-[#1D4533] hover:bg-[#153426] active:bg-[#0E2319] text-[#F7EAE0] font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#1D4533]/20 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#F9D2BA]" />
                <span>Continue with Email</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setView("options")}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1D4533] hover:text-[#153426] mb-4 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Back to options</span>
              </button>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3.5 relative z-10"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="Alex Morgan"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7EAE0] border border-[#1D4533]/20 focus:border-[#1D4533] rounded-xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/15 font-medium"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] font-semibold text-rose-600 pt-0.5 pl-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    Username
                  </label>
                  <div className="relative group">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register("username")}
                      type="text"
                      placeholder="alexmorgan"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7EAE0] border border-[#1D4533]/20 focus:border-[#1D4533] rounded-xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/15 font-medium"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-[11px] font-semibold text-rose-600 pt-0.5 pl-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7EAE0] border border-[#1D4533]/20 focus:border-[#1D4533] rounded-xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/15 font-medium"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] font-semibold text-rose-600 pt-0.5 pl-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F7EAE0] border border-[#1D4533]/20 focus:border-[#1D4533] rounded-xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/15 font-medium"
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

                {watchPassword.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <div className="flex justify-between items-center text-[11px] font-semibold">
                      <span className="text-[#5E3122]/70">
                        Password strength:
                      </span>
                      <span className={strength.text}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1D4533]/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${strength.color}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${strength.percentage}%` }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#1D4533]/5 rounded-xl space-y-1.5 text-[11px]">
                  <p className="font-semibold text-[#1D4533] mb-1">
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    <span
                      className={`flex items-center gap-1.5 transition-all duration-200 ${hasMinLength ? "text-[#1D4533] font-bold" : "text-[#5E3122]/60"}`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${hasMinLength ? "text-[#1D4533]" : "text-[#5E3122]/30"}`}
                      />
                      At least 8 characters
                    </span>
                    <span
                      className={`flex items-center gap-1.5 transition-all duration-200 ${hasUpper ? "text-[#1D4533] font-bold" : "text-[#5E3122]/60"}`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${hasUpper ? "text-[#1D4533]" : "text-[#5E3122]/30"}`}
                      />
                      One uppercase letter
                    </span>
                    <span
                      className={`flex items-center gap-1.5 transition-all duration-200 ${hasNumber ? "text-[#1D4533] font-bold" : "text-[#5E3122]/60"}`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 transition-colors ${hasNumber ? "text-[#1D4533]" : "text-[#5E3122]/30"}`}
                      />
                      One number
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register("terms")}
                      className="mt-0.5 w-4 h-4 accent-[#1D4533] rounded border-[#1D4533]/30 bg-[#F7EAE0] cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-[#5E3122]/80 font-medium cursor-pointer select-none leading-tight"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="font-bold text-[#1D4533] underline underline-offset-2 hover:text-[#153426]"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-bold text-[#1D4533] underline underline-offset-2 hover:text-[#153426]"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="text-[11px] font-semibold text-rose-600 pl-1">
                      {errors.terms.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="w-full mt-2 py-3 bg-[#1D4533] hover:bg-[#153426] active:bg-[#0E2319] text-[#F7EAE0] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#1D4533]/20 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#F9D2BA]" />
                      <span>Creating Relay account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 text-[#F9D2BA]" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 pt-4 border-t border-[#1D4533]/10 text-center text-xs text-[#5E3122]/70">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#1D4533] hover:underline transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
