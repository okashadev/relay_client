"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ScanLine, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import QrScanner from "@/components/e2ee/QrScanner";
import { safetyNumber, parseQrValue, toQrValue } from "@/lib/e2ee/safetyNumber";
import {
  acceptPeerChanges,
  confirmVerified,
  fetchDevices,
  type DeviceMap,
} from "@/lib/e2ee/trust";
import { useTrustStore } from "@/store/trustStore";

type Loaded = { number: string; theirs: DeviceMap } | { empty: true };
type View = "code" | "scan";

export default function SafetyNumberDialog({
  me,
  other,
  onClose,
}: {
  me: { id: string };
  other: { id: string; name: string };
  onClose: () => void;
}) {
  const status = useTrustStore((state) => state.byPeer[other.id]);

  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("code");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanKey, setScanKey] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchDevices(me.id, other.id)
      .then(({ mine, theirs }) => {
        if (cancelled) return;

        if (
          Object.keys(theirs).length === 0 ||
          Object.keys(mine).length === 0
        ) {
          setData({ empty: true });
          return;
        }

        setData({
          theirs,
          number: safetyNumber(
            { id: me.id, keys: Object.values(mine) },
            { id: other.id, keys: Object.values(theirs) },
          ),
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
      });

    return () => {
      cancelled = true;
    };
  }, [me.id, other.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const ready = data && "number" in data ? data : null;
  const groups = useMemo(() => ready?.number.match(/.{5}/g) ?? [], [ready]);
  const verified = status === "VERIFIED";

  const verify = async () => {
    if (!ready || busy) return;

    setBusy(true);
    try {
      await confirmVerified(me.id, other.id, ready.theirs);
      toast.success(`Verified with ${other.name}.`);
    } finally {
      setBusy(false);
    }
  };

  const unverify = async () => {
    if (busy) return;

    setBusy(true);
    try {
      await acceptPeerChanges(me.id, other.id);
      toast.info("Verification removed.");
    } finally {
      setBusy(false);
    }
  };

  const handleScan = async (text: string) => {
    const scanned = parseQrValue(text);

    if (!scanned) return setScanError("That isn't a Relay security code.");

    if (!ready || scanned !== ready.number) {
      return setScanError(
        `The codes don't match. Don't trust this chat until you've checked with ${other.name} in person.`,
      );
    }

    await verify();
    setScanError(null);
    setView("code");
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verify security code"
      onClick={(event) =>
        event.target === event.currentTarget && !busy && onClose()
      }
      className="fixed inset-x-0 top-0 z-50 app-height flex items-end md:items-center justify-center bg-[#1D4533]/40 md:p-6"
    >
      <div className="w-full md:max-w-sm max-h-[94%] overflow-y-auto overscroll-contain rounded-t-3xl md:rounded-3xl bg-[#F7EAE0] border border-[#1D4533]/15 shadow-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#1D4533] tracking-tight">
              Security code
            </h2>
            <p className="mt-1 text-[11px] font-medium text-[#5E3122]/70 leading-relaxed">
              Compare this with {other.name}&apos;s screen, or scan their code.
              If it matches, nobody is in between.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {(status === "KEY_CHANGED" || status === "NEW_DEVICES") && (
          <p
            role="alert"
            className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold leading-relaxed"
          >
            <ShieldAlert size={16} className="shrink-0 mt-px" />
            {status === "KEY_CHANGED"
              ? `${other.name}'s encryption key changed unexpectedly. Verify the code before trusting this chat.`
              : `${other.name} added a new device since you verified. Compare the new code.`}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold"
          >
            {error}
          </p>
        )}

        {!data && !error && (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#1D4533]" />
          </div>
        )}

        {data && "empty" in data && (
          <p className="p-4 bg-white/70 border border-dashed border-[#1D4533]/20 rounded-2xl text-center text-xs font-semibold text-[#1D4533]/70 leading-relaxed">
            {other.name} hasn&apos;t opened Relay on any device with encryption
            yet, so there&apos;s no code to compare.
          </p>
        )}

        {ready && view === "code" && (
          <>
            <div className="flex justify-center p-3 bg-white rounded-2xl border border-[#1D4533]/10">
              <QRCodeSVG
                value={toQrValue(ready.number)}
                size={150}
                fgColor="#1D4533"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="grid grid-cols-3 gap-y-2 text-center font-mono text-sm font-bold text-[#1D4533] tabular-nums">
              {groups.map((group, index) => (
                <span key={index}>{group}</span>
              ))}
            </div>

            {verified && (
              <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck size={14} /> Verified with {other.name}
              </p>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setScanError(null);
                  setScanKey((value) => value + 1);
                  setView("scan");
                }}
                disabled={busy}
                className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <ScanLine size={15} /> Scan their code
              </button>

              <button
                type="button"
                onClick={verified ? unverify : verify}
                disabled={busy}
                className="w-full py-3 rounded-2xl bg-white border border-[#1D4533]/15 text-[#1D4533] text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#1D4533]/5 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    {verified ? "Remove verification" : "Mark as verified"}
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {ready && view === "scan" && (
          <div className="space-y-3">
            {scanError ? (
              <>
                <p
                  role="alert"
                  className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold leading-relaxed"
                >
                  {scanError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setScanError(null);
                    setScanKey((value) => value + 1);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold cursor-pointer hover:bg-[#1D4533]/90"
                >
                  Scan again
                </button>
              </>
            ) : busy ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#1D4533]" />
              </div>
            ) : (
              <>
                <QrScanner
                  key={scanKey}
                  onResult={(text) => void handleScan(text)}
                />
                <p className="text-center text-[11px] font-semibold text-[#5E3122]/70">
                  Point the camera at the code on {other.name}&apos;s screen.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={() => setView("code")}
              className="w-full text-xs font-bold text-[#1D4533]/70 hover:text-[#1D4533] cursor-pointer"
            >
              Back to my code
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
