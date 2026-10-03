'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend Code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP digit input
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace and key navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste event (e.g. paste 6-digit code)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });
    setOtp(newOtp);

    // Focus last filled input or submit
    const targetIndex = Math.min(digits.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  // Resend Handler
  const handleResend = () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);

    setTimeout(() => {
      setIsResending(false);
      setTimer(60);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7EAE0] text-[#5E3122] font-sans p-4 relative overflow-hidden selection:bg-[#F9D2BA] selection:text-[#5E3122]">
      
      {/* Background Subtle Glows (Consistent with Auth Layout) */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#F9D2BA]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#1D4533]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1D4533_1px,transparent_1px)] bg-size-[24px_24px] opacity-5 pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#F7EAE0]/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-[#5E3122]/10 shadow-2xl shadow-[#5E3122]/10 relative z-10"
      >
        {/* Brand Logo Header */}
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
                We've sent a 6-digit verification code to <span className="font-semibold text-[#1D4533]">user@example.com</span>
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-white/70 border border-[#5E3122]/20 text-[#1D4533] focus:outline-none focus:border-[#1D4533] focus:ring-2 focus:ring-[#1D4533]/20 transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || otp.join('').length < 6}
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

            {/* Resend Section */}
            <div className="mt-8 pt-6 border-t border-[#5E3122]/10 text-center text-xs text-[#5E3122]/80 flex items-center justify-between">
              <span>Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isResending}
                className="font-semibold text-[#1D4533] hover:underline flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </>
        ) : (
          /* Success Screen State */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4 space-y-4"
          >
            <div className="w-16 h-16 bg-[#1D4533] text-[#F9D2BA] rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#1D4533]/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-[#1D4533]">Email Verified!</h2>
            <p className="text-xs sm:text-sm text-[#5E3122]/80 leading-relaxed">
              Your email address has been successfully verified. You can now access your Relay dashboard.
            </p>

            <div className="pt-4">
              <Link
                href="/dashboard"
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