"use client";

import { getRedirectTarget } from "@/lib/redirect";
import { useAuthStore } from "@/store/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const GoogleAuthButton = ({
  onError,
}: {
  onError?: (message: string) => void;
}) => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: async ({ code }) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/auth/google-auth`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Google login failed");
        }

        if (!data.user?.isEmailVerified) {
          toast.warning("Please Verify Your Email");
          router.push(
            `/verify-email?email=${encodeURIComponent(data.user?.email)}`,
          );
          return;
        }

        setAuth(data.token, data.user);
        toast.success("Login successful!");
        router.push(getRedirectTarget());
      } catch (err: any) {
        onError?.(err.message || "Google login failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setIsLoading(false);
      onError?.("Google sign-in failed. Please try again.");
    },
    onNonOAuthError: () => {
      setIsLoading(false);
    },
  });
  return (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => {
          setIsLoading(true);
          googleLogin();
        }}
        className="w-full py-3 px-4 bg-[#F7EAE0] hover:bg-[#F9D2BA]/40 border border-[#1D4533]/20 rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold text-[#1D4533] transition-all cursor-pointer shadow-sm disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.3s.7 2.6 1.9 5l3.7-2.5z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>
    </>
  );
};

export default GoogleAuthButton;
