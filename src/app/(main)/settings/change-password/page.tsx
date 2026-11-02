"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Loader2 } from "lucide-react";
import GoogleManagedCard from "@/components/settings/GoogleManagedCard";
import PasswordField from "@/components/settings/PasswordField";
import SettingsShell from "@/components/settings/SettingsShell";
import { changePassword } from "@/lib/api/accountApi";
import { useAuthStore } from "@/store/authStore";

export default function ChangePasswordPage() {
  const user = useAuthStore((state) => state.user);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const rules = [
    { label: "At least 8 characters", ok: next.length >= 8 },
    { label: "Different from your current password", ok: next.length > 0 && next !== current },
    { label: "Both new passwords match", ok: confirm.length > 0 && next === confirm },
  ];
  const valid = current.length > 0 && rules.every((rule) => rule.ok);

  if (user && user.provider !== "LOCAL") {
    return (
      <SettingsShell title="Change password" backHref="/settings" maxWidth="max-w-md">
        <GoogleManagedCard what="password" />
      </SettingsShell>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || loading) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await changePassword({ currentPassword: current, newPassword: next });

      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsShell
      title="Change password"
      subtitle="Use a strong password you don't use elsewhere"
      backHref="/settings"
      maxWidth="max-w-md"
    >
      <form
        onSubmit={handleSubmit}
        className="p-5 sm:p-6 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm space-y-4"
      >
        {success && (
          <div
            role="status"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            Password updated. Your other devices were signed out.
          </div>
        )}

        {error && (
          <p role="alert" className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold">
            {error}
          </p>
        )}

        <PasswordField id="current-password" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" disabled={loading} />
        <PasswordField id="new-password" label="New password" value={next} onChange={setNext} autoComplete="new-password" disabled={loading} />
        <PasswordField id="confirm-password" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" disabled={loading} />

        <ul aria-label="Password requirements" className="space-y-1.5 pt-1">
          {rules.map((rule) => (
            <li
              key={rule.label}
              className={`flex items-center gap-2 text-[11px] font-semibold transition-colors ${
                rule.ok ? "text-emerald-700" : "text-[#5E3122]/60"
              }`}
            >
              {rule.ok ? <Check size={13} /> : <Circle size={13} />}
              {rule.label}
            </li>
          ))}
        </ul>

        <button
          type="submit"
          disabled={!valid || loading}
          className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </SettingsShell>
  );
}