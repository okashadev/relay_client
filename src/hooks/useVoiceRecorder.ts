"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceResult = { file: File; duration: number };

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

const pickMimeType = () =>
  MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";

const extensionFor = (mime: string) =>
  mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "m4a" : "webm";

export function useVoiceRecorder({
  onComplete,
  onError,
  maxSeconds = 300,
}: {
  onComplete: (result: VoiceResult) => void;
  onError: (message: string) => void;
  maxSeconds?: number;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const discardRef = useRef(false);

  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  const release = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;

    setIsRecording(false);
  }, []);

  const stop = useCallback(() => {
    discardRef.current = false;
    recorderRef.current?.stop();
  }, []);

  const cancel = useCallback(() => {
    discardRef.current = true;
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      onErrorRef.current("Voice recording isn't supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      discardRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const discarded = discardRef.current;

        release();

        if (discarded || blob.size === 0) return;

        onCompleteRef.current({
          file: new File([blob], `voice-${Date.now()}.${extensionFor(type)}`, {
            type,
          }),
          duration,
        });
      };

      recorderRef.current = recorder;
      recorder.start();
      startedAtRef.current = Date.now();
      setSeconds(0);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= maxSeconds) stop();
      }, 250);
    } catch {
      release();
      onErrorRef.current(
        "Couldn't access the microphone. Please allow microphone permission and try again.",
      );
    }
  }, [maxSeconds, release, stop]);

  useEffect(
    () => () => {
      discardRef.current = true;
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      } else {
        streamRef.current?.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    },
    [],
  );

  return { isRecording, seconds, start, stop, cancel };
}