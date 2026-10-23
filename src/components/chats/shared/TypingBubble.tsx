"use client";

export default function TypingBubble({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 pt-3"
    >
      <div className="px-3 py-2 rounded-2xl bg-white border border-[#1D4533]/10 flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce" />
        <span className="text-[10px] font-medium text-[#5E3122]/70 ml-1">
          {label}
        </span>
      </div>
    </div>
  );
}
