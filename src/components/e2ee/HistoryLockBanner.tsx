"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import PassphraseDialog, {
  type PassphraseMode,
} from "@/components/e2ee/PassphraseDialog";
import { useAuthStore } from "@/store/authStore";
import { useE2eeStore } from "@/store/e2eeStore";

const readSkip = (key: string) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

export default function HistoryLockBanner() {
  const userId = useAuthStore((state) => state.user?.id);
  const mode = useE2eeStore((state) => state.mode);
  const unlocked = useE2eeStore((state) => state.unlocked);
  const deviceId = useE2eeStore((state) => state.deviceId);

  const skipKey = `relay_lock_skip:${userId}:${deviceId}`;
  const [skipped, setSkipped] = useState(() => readSkip(skipKey));
  const [dialog, setDialog] = useState<PassphraseMode | null>(null);

  if (mode !== "PASSPHRASE" || unlocked) return null;

  const skip = () => {
    setSkipped(true);
    try {
      localStorage.setItem(skipKey, "1");
    } catch {}
  };

  return (
    <>
      {!skipped && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-white border border-[#1D4533]/15 shadow-sm space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center shrink-0">
              <Lock size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[#1D4533]">
                History is locked here
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#5E3122]/70 leading-relaxed">
                Enter your passphrase to read older messages on this device. New
                messages work normally.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDialog("unlock")}
              className="flex-1 py-2.5 rounded-xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold shadow-sm hover:bg-[#1D4533]/90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Unlock history
            </button>
            <button
              type="button"
              onClick={skip}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1D4533]/70 hover:bg-[#1D4533]/5 cursor-pointer transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {dialog && (
        <PassphraseDialog
          mode={dialog}
          onClose={() => setDialog(null)}
          onForgot={() => setDialog("reset")}
          onBack={() => setDialog("unlock")}
        />
      )}
    </>
  );
}
