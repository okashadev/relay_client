"use client";

import { useRef, useState } from "react";
import { ArrowUp, Mic, Plus } from "lucide-react";

export default function MessageInput({
  placeholder,
  ariaLabel,
  onSend,
}: {
  placeholder: string;
  ariaLabel: string;
  onSend: (text: string) => void;
}) {
  // Text yahin rehta hai, to type karne par message list dobara render nahi hoti
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const value = text.trim();
    if (!value) return;

    onSend(value);
    setText("");
    // Mobile par keyboard khula rahe
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 sm:px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#F7EAE0] border-t border-[#1D4533]/10 shrink-0 flex items-center gap-2"
    >
      {/* TODO: file upload */}
      <button
        type="button"
        aria-label="Attach file"
        title="Attach file"
        className="w-10 h-10 rounded-2xl bg-white hover:bg-[#1D4533]/5 border border-[#1D4533]/10 flex items-center justify-center text-[#1D4533] transition-colors cursor-pointer shrink-0"
      >
        <Plus className="w-5 h-5" />
      </button>

      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="send"
          autoComplete="off"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full pl-4 pr-11 py-2.5 bg-white border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-base md:text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium"
        />
        <button
          type="button"
          aria-label="Record voice message"
          title="Record voice message"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E3122]/50 hover:text-[#1D4533] transition-colors cursor-pointer"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>

      <button
        type="submit"
        disabled={!text.trim()}
        aria-label="Send message"
        className="w-10 h-10 rounded-2xl bg-[#1D4533] hover:bg-[#1D4533]/90 active:scale-95 text-[#F9D2BA] flex items-center justify-center shadow-md shadow-[#1D4533]/20 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </form>
  );
}