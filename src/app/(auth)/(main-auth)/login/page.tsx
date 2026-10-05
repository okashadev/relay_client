"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { LoginFormValues, loginSchema } from "@/validators/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { getRedirectTarget } from "@/lib/redirect";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      console.log(resData);

      if (!res.ok) {
        if (!resData.user?.isEmailVerified) {
          toast.warning("Please Verify Your Email");
          router.push(
            `/verify-email?email=${encodeURIComponent(resData.email)}`,
          );
          throw new Error(resData.error || "Please verify your email before logging in.");
          return;
        }
        
        throw new Error(resData.error || "Something went wrong during login");
      }

      if (resData.success) {
        setAuth(resData.token, resData.user);
        toast.success("Login successfull!");
        router.push(getRedirectTarget());
      }
    } catch (error: any) {
      setServerError(error.message || "Something went wrong during login");
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
      {/* Mobile Branding Header */}
      <div className="flex lg:hidden items-center justify-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#1D4533] flex items-center justify-center shadow-md">
          <MessageSquare className="w-4 h-4 text-[#F9D2BA]" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#1D4533]">
          Relay
        </span>
      </div>

      {/* Title & Description */}
      <div className="text-center lg:text-left space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#1D4533] tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-[#5E3122]/70 font-medium">
          Enter your credentials to access your Relay conversations.
        </p>
      </div>

      {/* Main Login Form Box */}
      <div className="bg-[#F7EAE0]/80 backdrop-blur-md rounded-2xl border border-[#1D4533]/10 p-6 sm:p-7 shadow-xl shadow-[#1D4533]/5 relative overflow-hidden">
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9D2BA]/30 rounded-full blur-2xl pointer-events-none" />

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold">
            <span>{serverError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 relative z-10"
        >
          {/* Email Input */}
          <div className="space-y-1.5">
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

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1D4533]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[#1D4533] hover:underline transition-all"
              >
                Forgot?
              </Link>
            </div>
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

          {/* Submit Button */}
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Relay</span>
                <ArrowRight className="w-4 h-4 text-[#F9D2BA]" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-[#1D4533]/15" />
          <span className="absolute bg-[#F7EAE0] px-3 text-[10px] font-bold text-[#5E3122]/60 uppercase tracking-wider">
            Or Continue With
          </span>
        </div>

        <GoogleAuthButton onError={setServerError} />

        {/* Register Link */}
        <div className="mt-6 pt-4 border-t border-[#1D4533]/10 text-center text-xs text-[#5E3122]/70">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#1D4533] hover:underline transition-all"
          >
            Create one now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
