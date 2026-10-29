"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Send,
  Type,
  X,
  Video,
} from "lucide-react";
import { classifyFile } from "@/lib/chat/chatMediaRules";
import { readImageMeta, readVideoMeta } from "@/lib/stories/mediaMeta";
import { readableTextOn, textSizeClass } from "@/lib/stories/stories";
import type { StoryDraft } from "@/types/story";
import Image from "next/image";

type Mode = "TEXT" | "MEDIA";
type PickedMedia = { type: "IMAGE" | "VIDEO"; file: File; url: string };
type PublishOptions = {
  onProgress: (percent: number) => void;
  signal: AbortSignal;
};

const COLORS = [
  "#1D4533",
  "#2A5C46",
  "#5E3122",
  "#B5654A",
  "#E0A99D",
  "#F9D2BA",
];
const MAX_TEXT = 280;
const MAX_CAPTION = 300;
const MAX_VIDEO_SECONDS = 60;
const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm";

const spring = { type: "spring" as const, stiffness: 400, damping: 28 };

export default function StoryComposer({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (draft: StoryDraft, options: PublishOptions) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("TEXT");
  const [text, setText] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<PickedMedia | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      if (mediaRef.current) URL.revokeObjectURL(mediaRef.current.url);
    },
    [],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !publishing) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, publishing]);

  const replaceMedia = (next: PickedMedia | null) => {
    if (mediaRef.current) URL.revokeObjectURL(mediaRef.current.url);
    mediaRef.current = next;
    setMedia(next);
  };

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    const result = classifyFile(file);

    if (!result.ok) return setError(result.error);
    if (result.kind === "FILE") {
      return setError("Only photos and videos can be shared as a story.");
    }

    const url = URL.createObjectURL(file);
    setReading(true);

    try {
      if (result.kind === "IMAGE") {
        await readImageMeta(url);
        replaceMedia({ type: "IMAGE", file, url });
      } else {
        const meta = await readVideoMeta(url);
        if (meta.duration > MAX_VIDEO_SECONDS) {
          throw new Error(`Videos can be up to ${MAX_VIDEO_SECONDS} seconds.`);
        }
        replaceMedia({ type: "VIDEO", file, url });
      }
    } catch (err) {
      URL.revokeObjectURL(url);
      setError(err instanceof Error ? err.message : "Couldn't read this file.");
    } finally {
      setReading(false);
    }
  };

  const canShare =
    mode === "TEXT" ? text.trim().length > 0 : media !== null && !reading;

  const handleShare = async () => {
    if (!canShare || publishing) return;

    const draft: StoryDraft | null =
      mode === "TEXT"
        ? { type: "TEXT", caption: text.trim(), backgroundColor: color }
        : media
          ? {
              type: media.type,
              file: media.file,
              caption: caption.trim() || null,
            }
          : null;

    if (!draft) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    setProgress(0);
    setPublishing(true);

    try {
      await onPublish(draft, {
        onProgress: setProgress,
        signal: controller.signal,
      });
      onClose();
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't share your story. Please try again.",
        );
      }
    } finally {
      controllerRef.current = null;
      setPublishing(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Create story"
      onClick={(event) => {
        if (event.target === event.currentTarget && !publishing) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex h-dvh w-full items-stretch justify-center overflow-hidden bg-[#F7EAE0] md:items-center md:bg-[#0E2319]/70 md:p-4 md:backdrop-blur-lg"
    >
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F7EAE0] pt-[env(safe-area-inset-top)] md:h-auto md:max-h-[min(94dvh,880px)] md:max-w-115 md:rounded-[32px] md:border md:border-white/40 md:pt-0 md:shadow-[0_32px_120px_rgba(8,28,18,0.35)]"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4 md:px-6 md:pt-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1D4533] text-[#F7EAE0] shadow-md shadow-[#1D4533]/15 ring-1 ring-white/20"
            >
              <ImageIcon size={19} strokeWidth={2} />
            </motion.div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-[#1D4533]">
                Create a story
              </h2>
              <p className="mt-0.5 text-[11px] font-semibold text-[#5E3122]/60">
                Share a moment with your friends
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.08, backgroundColor: "rgba(29,69,51,0.12)" }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            type="button"
            onClick={onClose}
            disabled={publishing}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1D4533] transition-colors disabled:opacity-40"
          >
            <X size={19} strokeWidth={2.2} />
          </motion.button>
        </header>

        {/* Mode switch */}
        <div className="shrink-0 px-5 pb-3.5 md:px-6">
          <div
            role="tablist"
            aria-label="Story type"
            className="grid grid-cols-2 gap-1 rounded-2xl border border-[#1D4533]/10 bg-[#1D4533]/6 p-1 shadow-inner"
          >
            {(
              [
                ["TEXT", "Text story", Type],
                ["MEDIA", "Photo / video", ImageIcon],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                disabled={publishing}
                onClick={() => {
                  setMode(value);
                  setError(null);
                }}
                className="relative flex min-h-9.5 items-center justify-center gap-2 rounded-xl px-2 text-xs font-bold transition-all disabled:cursor-not-allowed select-none"
              >
                {mode === value && (
                  <motion.span
                    layoutId="story-mode-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-xl bg-[#1D4533] shadow-[0_4px_12px_rgba(29,69,51,0.22)]"
                  />
                )}
                <Icon
                  size={15}
                  className={`relative z-10 transition-colors duration-150 ${
                    mode === value ? "text-[#F7EAE0]" : "text-[#1D4533]/65"
                  }`}
                />
                <span
                  className={`relative z-10 transition-colors duration-150 ${
                    mode === value ? "text-[#F7EAE0]" : "text-[#1D4533]/70"
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview canvas */}
        <div className="flex min-h-0 flex-1 flex-col px-5 md:px-6">
          <motion.div
            layout
            className="relative min-h-55 flex-1 overflow-hidden rounded-[26px] bg-[#1D4533] shadow-[0_16px_36px_rgba(29,69,51,0.15)] ring-1 ring-black/5 md:max-h-[min(50dvh,480px)]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mode === "TEXT" ? (
                <motion.div
                  key="text-canvas"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center px-6 py-8 select-none"
                  style={{
                    backgroundColor: color,
                    color: readableTextOn(color),
                  }}
                >
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    readOnly={publishing}
                    maxLength={MAX_TEXT}
                    rows={Math.min(
                      10,
                      Math.max(
                        2,
                        Math.ceil(text.length / 16) +
                          text.split("\n").length -
                          1,
                      ),
                    )}
                    aria-label="Story text"
                    placeholder="What's on your mind?"
                    className={`max-h-full w-full resize-none overflow-y-auto bg-transparent text-center font-black leading-tight tracking-tight outline-none placeholder:text-current placeholder:opacity-40 select-text ${textSizeClass(text.length)}`}
                  />
                  <span className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase">
                    Your Story
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="media-canvas"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-[#E9D9CC]"
                >
                  {media ? (
                    <>
                      {media.type === "IMAGE" ? (
                        <Image
                          src={media.url}
                          alt="Story preview"
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 460px"
                          className="object-contain"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          muted
                          playsInline
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      )}
                      {!publishing && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xl backdrop-blur-md transition-colors hover:bg-black/75"
                        >
                          <ImageIcon size={13} />
                          Change media
                        </motion.button>
                      )}
                      <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">
                        {media.type === "VIDEO" ? (
                          <Video size={12} />
                        ) : (
                          <ImageIcon size={12} />
                        )}
                        {media.type === "VIDEO"
                          ? "Video preview"
                          : "Photo preview"}
                      </div>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={reading}
                      className="group absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#1D4533] transition-colors hover:bg-white/20 disabled:cursor-wait"
                    >
                      <motion.div
                        animate={reading ? { rotate: 360 } : { y: [0, -4, 0] }}
                        transition={
                          reading
                            ? {
                                repeat: Infinity,
                                duration: 1.2,
                                ease: "linear",
                              }
                            : {
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut",
                              }
                        }
                        className="mb-3.5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#1D4533]/15 bg-[#F7EAE0] shadow-[0_10px_28px_rgba(29,69,51,0.12)] transition-transform group-hover:scale-105"
                      >
                        {reading ? (
                          <Loader2 size={24} className="text-[#1D4533]" />
                        ) : (
                          <ImageIcon size={26} strokeWidth={1.8} />
                        )}
                      </motion.div>
                      <span className="text-base font-extrabold tracking-tight text-[#1D4533]">
                        {reading
                          ? "Preparing your media…"
                          : "Add a photo or video"}
                      </span>
                      <span className="mt-1.5 max-w-57.5 text-xs font-medium leading-relaxed text-[#1D4533]/65">
                        Choose a moment from your device to share with friends.
                      </span>
                      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1D4533] px-4 py-2 text-[11px] font-extrabold text-[#F7EAE0] shadow-md transition-all group-hover:bg-[#24543F]">
                        <ImageIcon size={13} />
                        Choose media
                      </span>
                      <span className="mt-2.5 text-[10px] font-semibold text-[#1D4533]/50">
                        Videos up to {MAX_VIDEO_SECONDS} seconds
                      </span>
                    </motion.button>
                  )}

                  {reading && media && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <Loader2 className="h-7 w-7 animate-spin text-white" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={handlePick}
          />
        </div>

        {/* Editor controls */}
        <div className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3.5 md:px-6 md:pb-6">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "TEXT" ? (
              <motion.div
                key="text-controls"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="mb-3.5 flex min-h-10 items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#5E3122]/60">
                    Background
                  </span>
                  <div
                    role="radiogroup"
                    aria-label="Background colour"
                    className="flex items-center gap-2"
                  >
                    {COLORS.map((value) => (
                      <motion.button
                        key={value}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                        transition={spring}
                        type="button"
                        role="radio"
                        aria-checked={color === value}
                        aria-label={`Background ${value}`}
                        disabled={publishing}
                        onClick={() => setColor(value)}
                        className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all disabled:cursor-not-allowed ${
                          color === value
                            ? "border-[#1D4533] ring-2 ring-[#1D4533]/20 shadow-sm"
                            : "border-white/90"
                        }`}
                        style={{ backgroundColor: value }}
                      >
                        {color === value && (
                          <Check
                            size={12}
                            strokeWidth={3.2}
                            className={
                              readableTextOn(value) === "#F7EAE0"
                                ? "text-[#F7EAE0]"
                                : "text-[#1D4533]"
                            }
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[#1D4533]/8 px-2.5 py-1 text-[10px] font-extrabold tabular-nums text-[#1D4533]/70">
                  {text.length}/{MAX_TEXT}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="media-controls"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="mb-3.5"
              >
                {media ? (
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#5E3122]/60">
                      Add a caption{" "}
                      <span className="normal-case tracking-normal opacity-70">
                        (optional)
                      </span>
                    </span>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      readOnly={publishing}
                      maxLength={MAX_CAPTION}
                      autoComplete="off"
                      aria-label="Caption"
                      placeholder="Write something about this moment…"
                      className="w-full rounded-2xl border border-[#1D4533]/15 bg-white/80 px-4 py-2.5 text-base font-semibold text-[#5E3122] shadow-inner outline-none transition-all placeholder:text-[#5E3122]/35 focus:border-[#1D4533]/50 focus:bg-white focus:ring-4 focus:ring-[#1D4533]/8 md:text-sm"
                    />
                  </label>
                ) : (
                  <p className="px-1 text-center text-[11px] font-semibold text-[#5E3122]/60">
                    JPG, PNG, WebP, GIF, MP4, MOV or WebM
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                role="alert"
                className="mb-3 overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold leading-relaxed text-rose-700 shadow-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {publishing && mode === "MEDIA" && (
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#1D4533]/15"
            >
              <motion.div
                className="h-full rounded-full bg-[#1D4533]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}

          <motion.button
            whileHover={canShare && !publishing ? { scale: 1.01 } : undefined}
            whileTap={canShare && !publishing ? { scale: 0.98 } : undefined}
            transition={spring}
            type="button"
            onClick={handleShare}
            disabled={!canShare || publishing}
            className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1D4533] px-5 py-3 text-sm font-extrabold text-[#F7EAE0] shadow-[0_8px_20px_rgba(29,69,51,0.22)] transition-all hover:bg-[#24543F] hover:shadow-[0_12px_28px_rgba(29,69,51,0.28)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {publishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {mode === "MEDIA" && progress < 100
                  ? `Uploading… ${progress}%`
                  : "Sharing your story…"}
              </>
            ) : (
              <>
                <Send size={15} strokeWidth={2.2} />
                {error ? "Try again" : "Share story"}
              </>
            )}
          </motion.button>

          {publishing && (
            <motion.button
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              type="button"
              onClick={() => controllerRef.current?.abort()}
              className="mt-2 w-full rounded-xl py-1.5 text-xs font-bold text-[#1D4533]/70 transition-colors hover:bg-[#1D4533]/8 hover:text-[#1D4533]"
            >
              Cancel upload
            </motion.button>
          )}
        </div>
      </motion.section>
    </motion.div>,
    document.body,
  );
}
