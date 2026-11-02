"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Check, Loader2, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import UserAvatar from "@/components/common/UserAvatar";
import SettingsShell from "@/components/settings/SettingsShell";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { ApiError } from "@/lib/api/apiRequest";
import {
  signAvatarUpload,
  updateProfile,
  type ProfileUser,
  type UpdateProfileBody,
} from "@/lib/api/profileApi";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  BIO_MAX,
  NAME_MAX,
} from "@/lib/profileRules";
import { uploadToCloudinary } from "@/lib/api/upload";
import { useAuthStore } from "@/store/authStore";

const LABEL =
  "text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase";
const INPUT =
  "w-full px-4 py-2.5 bg-white border border-[#1D4533]/15 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#1D4533] placeholder-[#1D4533]/40 outline-none transition-all focus:ring-4 focus:ring-[#1D4533]/10 font-semibold disabled:opacity-60";

function UsernameHint({
  status,
  serverError,
}: {
  status: ReturnType<typeof useUsernameCheck>;
  serverError: string | null;
}) {
  if (serverError)
    return (
      <p className="text-[11px] font-semibold text-rose-600">{serverError}</p>
    );

  switch (status) {
    case "invalid":
      return (
        <p className="text-[11px] font-semibold text-rose-600">
          Use 3–20 lowercase letters, numbers or underscores.
        </p>
      );
    case "checking":
      return (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5E3122]/60">
          <Loader2 size={12} className="animate-spin" /> Checking…
        </p>
      );
    case "available":
      return (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
          <Check size={12} /> Available
        </p>
      );
    case "taken":
      return (
        <p className="text-[11px] font-semibold text-rose-600">
          That username is already taken.
        </p>
      );
    case "error":
      return (
        <p className="text-[11px] font-semibold text-[#5E3122]/60">
          Couldn&apos;t check right now. We&apos;ll verify when you save.
        </p>
      );
    default:
      return null;
  }
}

function ProfileForm({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
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

  const normalizedUsername = username.trim().toLowerCase();
  const usernameStatus = useUsernameCheck(normalizedUsername, user.username);

  const nameChanged = name.trim() !== user.name;
  const usernameChanged = normalizedUsername !== user.username;
  const bioChanged = bio.trim() !== (user.bio ?? "");
  const avatarChanged = file !== null || (removeAvatar && user.avatar !== null);
  const dirty = nameChanged || usernameChanged || bioChanged || avatarChanged;

  const canSave =
    dirty &&
    !saving &&
    name.trim().length > 0 &&
    (!usernameChanged ||
      usernameStatus === "available" ||
      usernameStatus === "error");

  const shownAvatar = previewUrl ?? (removeAvatar ? null : user.avatar);

  const dropPreview = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl(null);
    setFile(null);
  };

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    if (!AVATAR_TYPES.includes(picked.type))
      return setAvatarError("Use a JPG, PNG or WebP image.");
    if (picked.size > AVATAR_MAX_BYTES)
      return setAvatarError("Image is too large. Maximum size is 5 MB.");

    setAvatarError(null);
    dropPreview();

    const url = URL.createObjectURL(picked);
    previewRef.current = url;
    setPreviewUrl(url);
    setFile(picked);
    setRemoveAvatar(false);
  };

  const handleSave = async () => {
    if (!canSave) return;

    const controller = new AbortController();
    controllerRef.current = controller;

    setSaving(true);
    setProgress(0);
    setUsernameError(null);

    try {
      const body: UpdateProfileBody = {};

      if (nameChanged) body.name = name.trim();
      if (usernameChanged) body.username = normalizedUsername;
      if (bioChanged) body.bio = bio.trim();

      if (file) {
        const upload = await signAvatarUpload(file);
        await uploadToCloudinary(file, upload, {
          onProgress: setProgress,
          signal: controller.signal,
        });
        body.avatarPublicId = upload.publicId;
      } else if (removeAvatar && user.avatar) {
        body.removeAvatar = true;
      }

      const updated = await updateProfile(body);

      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, ...updated } : state.user,
      }));

      dropPreview();
      setRemoveAvatar(false);
      toast.success("Profile updated.");
    } catch (err) {
      if (controller.signal.aborted) return;

      if (err instanceof ApiError && err.status === 409) {
        setUsernameError(err.message);
      } else {
        toast.error(
          err instanceof Error ? err.message : "Couldn't update your profile.",
        );
      }
    } finally {
      controllerRef.current = null;
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="p-5 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving}
          aria-label="Change profile photo"
          className="relative group rounded-3xl cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40"
        >
          <UserAvatar
            name={name.trim() || user.name}
            avatar={shownAvatar}
            className="w-24 h-24 rounded-3xl"
            textClassName="text-2xl"
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
            {shownAvatar ? "Change photo" : "Add photo"}
          </button>
          {shownAvatar && (
            <button
              type="button"
              onClick={() => {
                if (file) dropPreview();
                else setRemoveAvatar(true);
              }}
              disabled={saving}
              className="text-rose-600 hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <Trash2 size={13} /> Remove
            </button>
          )}
        </div>

        {avatarError && (
          <p role="alert" className="text-[11px] font-semibold text-rose-600">
            {avatarError}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_TYPES.join(",")}
          hidden
          onChange={handlePick}
        />
      </div>

      {/* Details */}
      <div className="p-5 sm:p-6 bg-white border border-[#1D4533]/15 rounded-3xl shadow-sm space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="profile-name" className={LABEL}>
              Name
            </label>
            <span className="text-[11px] text-[#1D4533]/60 tabular-nums">
              {name.length}/{NAME_MAX}
            </span>
          </div>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={saving}
            maxLength={NAME_MAX}
            autoComplete="name"
            className={INPUT}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-username" className={LABEL}>
            Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base md:text-xs font-semibold text-[#1D4533]/50">
              @
            </span>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              readOnly={saving}
              maxLength={20}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={`${INPUT} pl-8`}
            />
          </div>
          <div className="min-h-4">
            <UsernameHint status={usernameStatus} serverError={usernameError} />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="profile-bio" className={LABEL}>
              Bio
            </label>
            <span className="text-[11px] text-[#1D4533]/60 tabular-nums">
              {bio.length}/{BIO_MAX}
            </span>
          </div>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            readOnly={saving}
            maxLength={BIO_MAX}
            rows={3}
            placeholder="Tell people a little about yourself"
            className={`${INPUT} resize-none`}
          />
        </div>

        {/* Email: sirf dikhta hai, badalna alag screen par */}
        <div className="space-y-1.5">
          <span className={LABEL}>Email</span>
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#1D4533]/5 border border-[#1D4533]/10">
            <span className="flex items-center gap-2 min-w-0 text-xs font-semibold text-[#1D4533]">
              <Lock size={13} className="shrink-0 text-[#1D4533]/50" />
              <span className="truncate">{user.email}</span>
            </span>
            {user.provider === "LOCAL" ? (
              <Link
                href="/settings/email"
                className="text-xs font-bold text-[#1D4533] hover:underline shrink-0"
              >
                Change
              </Link>
            ) : (
              <span className="text-[10px] font-bold text-[#5E3122]/60 shrink-0">
                Managed by Google
              </span>
            )}
          </div>
        </div>

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

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void handleSave()}
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
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <SettingsShell
      title="Profile"
      subtitle="How you appear to your friends"
      backHref="/settings"
      maxWidth="max-w-xl"
    >
      {user && <ProfileForm user={user as ProfileUser} />}
    </SettingsShell>
  );
}
