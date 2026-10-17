"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { formatDuration } from "@/lib/format";

let activeAudio: HTMLAudioElement | null = null;

export default function VoicePlayer({
  src,
  durationHint,
  isMine,
}: {
  src: string;
  durationHint: number | null;
  isMine: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationHint ?? 0);

  useEffect(
    () => () => {
      if (activeAudio === audioRef.current) activeAudio = null;
    },
    [],
  );

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;

    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  const total = duration || durationHint || 0;

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
          isMine ? "bg-[#F9D2BA] text-[#1D4533]" : "bg-[#1D4533] text-[#F9D2BA]"
        }`}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <input
          type="range"
          min={0}
          max={total || 1}
          step={0.1}
          value={Math.min(current, total || 1)}
          onChange={(e) => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.currentTime = Number(e.target.value);
            setCurrent(audio.currentTime);
          }}
          aria-label="Seek voice message"
          className={`w-full h-1 cursor-pointer ${
            isMine ? "accent-[#F9D2BA]" : "accent-[#1D4533]"
          }`}
        />
        <p className="mt-1 text-[10px] opacity-70 tabular-nums">
          {formatDuration(playing || current > 0 ? current : total)}
          {total > 0 && ` / ${formatDuration(total)}`}
        </p>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const value = e.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
      />
    </div>
  );
}