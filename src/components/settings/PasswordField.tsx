"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password" | "off";
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-extrabold uppercase tracking-wider text-[#1D4533]/60 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={label}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          required
          className="w-full rounded-2xl border border-[#1D4533]/15 bg-white pl-4 pr-12 py-3 text-base md:text-xs font-semibold text-[#1D4533] outline-none transition-all focus:border-[#1D4533] focus:ring-4 focus:ring-[#1D4533]/10 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl text-[#1D4533]/60 hover:bg-[#1D4533]/10 flex items-center justify-center cursor-pointer transition-colors"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
