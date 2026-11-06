"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";
import { safetyNumber } from "@/lib/e2ee/safetyNumber";
import { getVerified, setVerified } from "@/lib/e2ee/storage";

type Party = { id: string; publicKey: string };

export default function SafetyNumberDialog({
  me,
  other,
  onClose,
}: {
  me: Party;
  other: Party & { name: string };
  onClose: () => void;
}) {
  const storageKey = `${me.id}:${other.id}`;
  // undefined: abhi load ho raha hai
  const [saved, setSaved] = useState<string | null | undefined>(undefined);
  const number = useMemo(() => safetyNumber(me, other), [me, other]);

  useEffect(() => {
    getVerified(storageKey).then((value) => setSaved(value ?? null));
  }, [storageKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const verified = saved === other.publicKey;
  const changed = Boolean(saved) && saved !== other.publicKey;
  const groups = number.match(/.{5}/g) ?? [];

  const toggle = async () => {
    const next = verified ? null : other.publicKey;
    await setVerified(storageKey, next);
    setSaved(next);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verify security code"
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-x-0 top-0 z-50 app-height flex items-end md:items-center justify-center bg-[#1D4533]/40 md:p-6"
    >
      <div className="w-full md:max-w-sm rounded-t-3xl md:rounded-3xl bg-[#F7EAE0] border border-[#1D4533]/15 shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#1D4533] tracking-tight">Security code</h2>
            <p className="text-[11px] font-medium text-[#5E3122]/70 leading-relaxed">
              Compare this with {other.name}&apos;s screen (in person or on a call). If both match,
              nobody is in between.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center cursor-pointer shrink-0">
            <X size={18} />
          </button>
        </div>

        {changed && (
          <p role="alert" className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold">
            <ShieldAlert size={16} className="shrink-0 mt-px" />
            {other.name}&apos;s security code has changed since you verified it. Verify the new code before trusting it.
          </p>
        )}

        <div className="flex justify-center p-3 bg-white rounded-2xl border border-[#1D4533]/10">
          <QRCodeSVG value={number} size={140} fgColor="#1D4533" bgColor="#FFFFFF" />
        </div>

        <div className="grid grid-cols-3 gap-y-2 text-center font-mono text-sm font-bold text-[#1D4533] tabular-nums">
          {groups.map((group, index) => (
            <span key={index}>{group}</span>
          ))}
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={saved === undefined}
          className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
        >
          <ShieldCheck size={15} />
          {verified ? "Remove verification" : "Mark as verified"}
        </button>
      </div>
    </div>,
    document.body,
  );
}