"use client";

import { ShieldAlert } from "lucide-react";
import type { TrustStatus } from "@/store/trustStore";

export default function TrustBanner({
  name,
  status,
  onVerify,
  onDismiss,
}: {
  name: string;
  status: TrustStatus | null;
  onVerify: () => void;
  onDismiss: () => void;
}) {
  if (status !== "KEY_CHANGED" && status !== "NEW_DEVICES") return null;

  const critical = status === "KEY_CHANGED";

  return (
    <div
      role="alert"
      className={`mx-3 sm:mx-4 mb-2 p-3 rounded-2xl border shrink-0 ${
        critical
          ? "bg-rose-500/10 border-rose-500/25 text-rose-700"
          : "bg-[#F9D2BA]/50 border-[#5E3122]/20 text-[#5E3122]"
      }`}
    >
      <p className="flex items-start gap-2 text-xs font-bold leading-relaxed">
        <ShieldAlert size={15} className="shrink-0 mt-px" />
        {critical
          ? `${name}'s encryption key changed unexpectedly. Verify their security code before you share anything private.`
          : `${name}'s security code changed because they added a new device.`}
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onVerify}
          className="px-3.5 py-2 rounded-xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold cursor-pointer hover:bg-[#1D4533]/90 active:scale-95 transition-all"
        >
          Verify
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-black/5 cursor-pointer transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
