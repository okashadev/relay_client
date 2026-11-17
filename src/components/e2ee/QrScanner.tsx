"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Loader2 } from "lucide-react";

export default function QrScanner({
  onResult,
}: {
  onResult: (text: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onResultRef = useRef(onResult);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onResultRef.current = onResult;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;
    let last = 0;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "The camera isn't available here. It needs a secure (https) connection.",
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch (err) {
        setError(
          (err as DOMException).name === "NotAllowedError"
            ? "Camera permission was denied. Allow it in your browser settings."
            : "Couldn't open the camera.",
        );
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (stopped || !video || !canvas) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setReady(true);

      const context = canvas.getContext("2d", { willReadFrequently: true });

      const tick = (time: number) => {
        if (stopped) return;
        frame = requestAnimationFrame(tick);

        if (
          time - last < 120 ||
          !context ||
          video.readyState < 2 ||
          !video.videoWidth
        )
          return;
        last = time;

        const scale = Math.min(1, 640 / video.videoWidth);
        const width = Math.round(video.videoWidth * scale);
        const height = Math.round(video.videoHeight * scale);

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        const image = context.getImageData(0, 0, width, height);
        const code = jsQR(image.data, width, height, {
          inversionAttempts: "dontInvert",
        });

        if (code?.data) {
          stop();
          onResultRef.current(code.data);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    void start();

    return stop;
  }, []);

  if (error) {
    return (
      <p
        role="alert"
        className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold leading-relaxed"
      >
        {error}
      </p>
    );
  }

  return (
    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {!ready && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
          aria-label="Opening camera"
        >
          <Loader2 className="w-6 h-6 animate-spin text-white/80" />
        </div>
      )}

      {/* Nishana */}
      <div className="absolute inset-[18%] rounded-2xl border-2 border-[#F9D2BA]/90 pointer-events-none" />
    </div>
  );
}
