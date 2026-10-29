"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Loader2, Trash2, X } from "lucide-react";
import GroupAvatar from "@/components/common/GroupAvatar";
import type { GroupEdit } from "@/hooks/useGroupActions";

const MAX_NAME = 30;
const MAX_DESCRIPTION = 300;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";

type UploadOptions = { onProgress: (percent: number) => void; signal: AbortSignal };

export default function EditGroupModal({
  group,
  onClose,
  onSave,
}: {
  group: { name: string; description: string | null; avatar: string | null };
  onClose: () => void;
  onSave: (edit: GroupEdit, options: UploadOptions) => Promise<boolean>;
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [saving, onClose]);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    if (!ACCEPT.split(",").includes(picked.type)) {
      return setError("Use a JPG, PNG or WebP image.");
    }
    if (picked.size > MAX_AVATAR_BYTES) {
      return setError("Image is too large. Maximum size is 5 MB.");
    }

    setError(null);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);

    const url = URL.createObjectURL(picked);
    previewRef.current = url;
    setPreviewUrl(url);
    setFile(picked);
    setRemoveAvatar(false);
  };

  const dropNewPhoto = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl(null);
    setFile(null);
  };

  const trimmedName = name.trim();
  const nameChanged = trimmedName !== group.name;
  const descriptionChanged = description.trim() !== (group.description ?? "");
  const avatarChanged = file !== null || (removeAvatar && group.avatar !== null);
  const canSave =
    trimmedName.length > 0 &&
    (nameChanged || descriptionChanged || avatarChanged) &&
    !saving;

  const shownAvatar = previewUrl ?? (removeAvatar ? null : group.avatar);
  const hasPhoto = shownAvatar !== null;

  const handleSave = async () => {
    if (!canSave) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    setError(null);
    setProgress(0);
    setSaving(true);

    const ok = await onSave(
      {
        ...(nameChanged && { name: trimmedName }),
        ...(descriptionChanged && { description: description.trim() }),
        avatarFile: file,
        removeAvatar: removeAvatar && !file,
      },
      { onProgress: setProgress, signal: controller.signal },
    );

    controllerRef.current = null;
    setSaving(false);

    if (ok) onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit group"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
      className="fixed inset-x-0 top-0 z-50 app-height flex items-end md:items-center justify-center bg-[#1D4533]/40 md:p-6"
    >
      <div className="w-full md:max-w-md max-h-[92%] md:max-h-[88dvh] flex flex-col rounded-t-3xl md:rounded-3xl bg-[#F7EAE0] border border-[#1D4533]/15 shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 shrink-0">
          <h2 className="text-lg font-black text-[#1D4533] tracking-tight">
            Edit group
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-4 space-y-5">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={saving}
              aria-label="Change group photo"
              className="relative group rounded-3xl cursor-pointer disabled:cursor-not-allowed"
            >
              <GroupAvatar
                name={group.name}
                avatar={shownAvatar}
                className="w-24 h-24 rounded-3xl"
                iconClassName="w-10 h-10"
              />
              <span className="absolute inset-0 rounded-3xl bg-black/35 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                <Camera size={22} />
              </span>
            </button>

            <div className="flex items-center gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={saving}
                className="text-[#1D4533] hover:underline cursor-pointer disabled:opacity-50"
              >
                {hasPhoto ? "Change photo" : "Add photo"}
              </button>
              {hasPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    if (file) dropNewPhoto();
                    else setRemoveAvatar(true);
                  }}
                  disabled={saving}
                  className="text-rose-600 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              hidden
              onChange={handlePick}
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="group-name"
                className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase"
              >
                Group name
              </label>
              <span className="text-[11px] text-[#1D4533]/60 tabular-nums">
                {name.length}/{MAX_NAME}
              </span>
            </div>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={saving}
              maxLength={MAX_NAME}
              autoComplete="off"
              className="w-full px-4 py-2.5 bg-white border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#1D4533] outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="group-description"
                className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase"
              >
                Description
              </label>
              <span className="text-[11px] text-[#1D4533]/60 tabular-nums">
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={saving}
              maxLength={MAX_DESCRIPTION}
              rows={4}
              placeholder="What is this group about?"
              className="w-full resize-none px-4 py-2.5 bg-white border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#1D4533] placeholder-[#1D4533]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-semibold text-rose-700 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2"
            >
              {error}
            </p>
          )}
        </div>

        <div className="px-5 pt-3 pb-4 border-t border-[#1D4533]/10 shrink-0 space-y-2">
          {saving && file && (
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 rounded-full bg-[#1D4533]/10 overflow-hidden"
            >
              <div
                className="h-full bg-[#1D4533] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-3 rounded-2xl bg-[#1D4533] text-[#F7EAE0] text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1D4533]/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {file && progress < 100 ? `Uploading… ${progress}%` : "Saving…"}
              </>
            ) : (
              "Save changes"
            )}
          </button>

          {saving && (
            <button
              type="button"
              onClick={() => controllerRef.current?.abort()}
              className="w-full py-2 text-xs font-bold text-[#1D4533]/70 hover:text-[#1D4533] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}