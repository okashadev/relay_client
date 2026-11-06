"use client";

import { useState } from "react";
import {
  KeyRound,
  Lock,
  LockOpen,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import PassphraseDialog, {
  type PassphraseMode,
} from "@/components/e2ee/PassphraseDialog";
import SettingsShell from "@/components/settings/SettingsShell";
import { useE2eeStore } from "@/store/e2eeStore";

function ActionRow({
  icon: Icon,
  title,
  description,
  danger = false,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3.5 p-3.5 sm:p-4 rounded-3xl bg-white border border-[#1D4533]/15 shadow-sm cursor-pointer transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 [@media(hover:hover)]:hover:border-[#1D4533]/35 [@media(hover:hover)]:hover:shadow-md"
    >
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
          danger
            ? "bg-rose-500/10 text-rose-600"
            : "bg-[#1D4533]/10 text-[#1D4533]"
        }`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h3
          className={`text-sm font-extrabold ${danger ? "text-rose-600" : "text-[#1D4533]"}`}
        >
          {title}
        </h3>
        <p className="text-xs font-medium text-[#5E3122]/70">{description}</p>
      </div>
    </button>
  );
}

export default function EncryptionSettingsPage() {
  const mode = useE2eeStore((state) => state.mode);
  const unlocked = useE2eeStore((state) => state.unlocked);
  const [dialog, setDialog] = useState<PassphraseMode | null>(null);

  const isPrivate = mode === "PASSPHRASE";

  return (
    <SettingsShell
      title="Chat privacy"
      subtitle="How your chat history is protected"
      backHref="/settings"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Halat */}
        <div className="flex items-start gap-3.5 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center shrink-0 shadow-md shadow-[#1D4533]/15">
            {isPrivate ? <Lock size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-[#1D4533]">
              {isPrivate ? "Private (passphrase on)" : "Standard protection"}
            </p>
            <p className="mt-1 text-xs font-medium text-[#5E3122]/70 leading-relaxed">
              {isPrivate
                ? unlocked
                  ? "Only you can restore your history on a new device, with your passphrase."
                  : "Your history is locked on this device. Enter your passphrase to read older messages."
                : "Your messages are encrypted, and your history appears on every new device automatically. Relay's server can technically restore it for you."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {!isPrivate && (
            <ActionRow
              icon={KeyRound}
              title="Turn on passphrase"
              description="Only you can restore your history on a new device"
              onClick={() => setDialog("enable")}
            />
          )}

          {isPrivate && !unlocked && (
            <>
              <ActionRow
                icon={LockOpen}
                title="Unlock history"
                description="Read older messages on this device"
                onClick={() => setDialog("unlock")}
              />
              <ActionRow
                icon={KeyRound}
                title="Forgot passphrase"
                description="Reset it. Older messages won't come back on new devices"
                danger
                onClick={() => setDialog("reset")}
              />
            </>
          )}

          {isPrivate && unlocked && (
            <>
              <ActionRow
                icon={KeyRound}
                title="Change passphrase"
                description="Pick a new passphrase. History stays the same"
                onClick={() => setDialog("change")}
              />
              <ActionRow
                icon={LockOpen}
                title="Turn off passphrase"
                description="New devices will get your history automatically again"
                danger
                onClick={() => setDialog("disable")}
              />
            </>
          )}
        </div>

        {/* Kaise chalta hai */}
        <section>
          <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2">
            How it works
          </h2>
          <ul className="space-y-2.5 p-4 bg-white/60 border border-[#1D4533]/15 rounded-3xl text-xs font-medium text-[#5E3122]/80 leading-relaxed">
            <li>
              <span className="font-extrabold text-[#1D4533]">
                Passphrase on:
              </span>{" "}
              a new device gets new messages straight away, and older ones after
              you enter the passphrase (or you can skip).
            </li>
            <li>
              <span className="font-extrabold text-[#1D4533]">Forgot it?</span>{" "}
              Reset it. Devices that are already unlocked keep reading, but new
              devices won&apos;t get your older messages.
            </li>
          </ul>
        </section>
      </div>

      {dialog && (
        <PassphraseDialog
          mode={dialog}
          onClose={() => setDialog(null)}
          onForgot={() => setDialog("reset")}
          onBack={() => setDialog("unlock")}
        />
      )}
    </SettingsShell>
  );
}
