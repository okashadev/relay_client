'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Backend API Call to send reset email (e.g. Nodemailer + Brevo)
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to send password reset email');
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
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

      {/* Header Title & Subtitle */}
      <div className="text-center lg:text-left space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#1D4533] tracking-tight">
          {isSubmitted ? 'Check your email' : 'Forgot Password?'}
        </h1>
        <p className="text-xs text-[#5E3122]/70 font-medium">
          {isSubmitted
            ? `We've sent password reset instructions to ${submittedEmail}`
            : "No worries! Enter your email and we'll send you instructions to reset your password."}
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-[#F7EAE0]/80 backdrop-blur-md rounded-2xl border border-[#1D4533]/10 p-6 sm:p-7 shadow-xl shadow-[#1D4533]/5 relative overflow-hidden">
        {/* Accent Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F9D2BA]/30 rounded-full blur-2xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            /* Form View */
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1D4533] block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/50 group-focus-within:text-[#1D4533] transition-colors" />
                    <input
                      {...register('email')}
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
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4 text-[#F9D2BA]" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            /* Success State View */
            <motion.div
              key="success-message"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-4 space-y-4 relative z-10"
            >
              <div className="w-12 h-12 bg-[#1D4533]/10 text-[#1D4533] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#1D4533]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[#5E3122]/80 font-medium">
                  Please check your inbox. If you don't see the email within a few minutes, check your spam folder.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-semibold text-[#1D4533] hover:underline cursor-pointer"
              >
                Didn't receive the email? Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Sign In Link */}
        <div className="mt-6 pt-4 border-t border-[#1D4533]/10 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4533] hover:underline transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#5E3122]/70">
        <ShieldCheck className="w-3.5 h-3.5 text-[#1D4533]" />
        <span>Secure password recovery</span>
      </div>
    </motion.div>
  );
}