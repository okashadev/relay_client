"use client";

import { useState } from "react";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SettingsShell from "@/components/settings/SettingsShell";
import { useDevices } from "@/hooks/useDevices";
import { revokeDeviceApi, revokeOthersApi } from "@/lib/api/deviceApi";
import {
  deviceActivity,
  deviceIcon,
  deviceKind,
  formatIp,
} from "@/lib/deviceInfo";
import type { DeviceItem } from "@/types/device";

function DeviceRow({
  device,
  busy,
  disabled,
  onLogout,
}: {
  device: DeviceItem;
  busy: boolean;
  disabled: boolean;
  onLogout?: () => void;
}) {
  const Icon = deviceIcon(device);
  const ip = formatIp(device.ip);

  return (
    <li className="flex items-center gap-3.5 p-3.5 sm:p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm">
      <div className="w-11 h-11 rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-extrabold text-[#1D4533] truncate">
            {device.name}
          </h3>
          {device.isCurrent && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold">
              This device
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-[#5E3122]/70 truncate">
          {deviceKind(device)}
        </p>
        <p
          className={`text-[11px] font-semibold truncate ${device.isCurrent ? "text-emerald-700" : "text-[#5E3122]/60"}`}
        >
          {deviceActivity(device)}
          {ip && ` · ${ip}`}
        </p>
      </div>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          disabled={disabled}
          aria-label={`Log out ${device.name}`}
          className="h-10 min-w-10 px-3 sm:px-4 rounded-2xl bg-white border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition-all hover:bg-rose-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </>
          )}
        </button>
      )}
    </li>
  );
}

function RowSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="flex items-center gap-3.5 p-4 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm animate-pulse"
    >
      <div className="w-11 h-11 rounded-2xl bg-[#1D4533]/10" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-36 rounded bg-[#1D4533]/10" />
        <div className="h-2.5 w-24 rounded bg-[#1D4533]/10" />
        <div className="h-2.5 w-44 max-w-full rounded bg-[#1D4533]/10" />
      </div>
    </li>
  );
}

export default function DevicesPage() {
  const { devices, error, remove, reload } = useDevices();

  const [target, setTarget] = useState<DeviceItem | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  const current = devices?.find((device) => device.isCurrent) ?? null;
  const others = devices?.filter((device) => !device.isCurrent) ?? [];
  const working = busyId !== null || busyAll;

  const logoutOne = async () => {
    if (!target || working) return;

    const device = target;
    setBusyId(device.id);
    setTarget(null);

    try {
      await revokeDeviceApi(device.id);
      remove([device.id]);
      toast.success(`${device.name} was logged out.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't log out this device.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const logoutAll = async () => {
    if (working) return;

    setBusyAll(true);

    try {
      const { revoked } = await revokeOthersApi();
      remove(others.map((device) => device.id));
      toast.success(
        revoked === 1
          ? "1 device was logged out."
          : `${revoked} devices were logged out.`,
      );
      setConfirmAll(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Couldn't log out the other devices.",
      );
    } finally {
      setBusyAll(false);
    }
  };

  return (
    <SettingsShell
      title="Devices"
      subtitle="Where you're signed in"
      backHref="/settings"
      maxWidth="max-w-xl"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="underline shrink-0 cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {devices === null && !error && (
        <ul aria-label="Loading devices" className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </ul>
      )}

      {devices !== null && (
        <div className="space-y-6">
          {current && (
            <section>
              <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2">
                Current device
              </h2>
              <ul>
                <DeviceRow device={current} busy={false} disabled />
              </ul>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-3 px-1 mb-2">
              <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase">
                Other devices {others.length > 0 && `(${others.length})`}
              </h2>
              {others.length > 1 && (
                <button
                  type="button"
                  onClick={() => setConfirmAll(true)}
                  disabled={working}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  Log out of all
                </button>
              )}
            </div>

            {others.length === 0 ? (
              <p className="p-6 bg-white/60 border border-dashed border-[#1D4533]/20 rounded-3xl text-center text-xs font-medium text-[#1D4533]/70">
                You&apos;re not signed in anywhere else.
              </p>
            ) : (
              <ul className="space-y-3">
                {others.map((device) => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    busy={busyId === device.id}
                    disabled={working}
                    onLogout={() => setTarget(device)}
                  />
                ))}
              </ul>
            )}
          </section>

          <p className="px-1 flex items-start gap-2 text-[11px] font-medium text-[#5E3122]/60 leading-relaxed">
            <ShieldCheck size={13} className="mt-0.5 shrink-0" />
            If you see a device you don&apos;t recognise, log it out and change
            your password. A logged-out device stops receiving new messages.
            Messages it already opened stay on that device.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        title={`Log out ${target?.name ?? "this device"}?`}
        description="It will be signed out right away and won't receive new messages. You can sign in on it again later."
        confirmLabel="Log out"
        cancelLabel="Cancel"
        isLoading={false}
        onConfirm={() => void logoutOne()}
        onClose={() => setTarget(null)}
      />

      <ConfirmDialog
        open={confirmAll}
        title="Log out of all other devices?"
        description="Every device except this one will be signed out right away and won't receive new messages."
        confirmLabel="Log out all"
        cancelLabel="Cancel"
        isLoading={busyAll}
        onConfirm={() => void logoutAll()}
        onClose={() => {
          if (!busyAll) setConfirmAll(false);
        }}
      />
    </SettingsShell>
  );
}
