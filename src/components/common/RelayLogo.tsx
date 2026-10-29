import React from "react";

type RelayLogoProps = {
  size?: number;
  className?: string;
  variant?: "flat" | "shadow" | "glow";
  bgScheme?: "green" | "peach";
};

export default function RelayLogo({
  size = 40,
  className = "",
  variant = "flat",
  bgScheme = "green",
}: RelayLogoProps) {
  const isGreen = bgScheme === "green";

  const cardColor = isGreen ? "#1D4533" : "#F9D2BA";
  const bubbleColor = isGreen ? "#F7EAE0" : "#1D4533";
  const dotsColor = isGreen ? "#1D4533" : "#F7EAE0";
  const arrowColor = isGreen ? "#F9D2BA" : "#1D4533";

  const getFilter = () => {
    if (variant === "shadow") {
      return isGreen
        ? "drop-shadow(0px 8px 16px rgba(29, 69, 51, 0.25))"
        : "drop-shadow(0px 8px 16px rgba(94, 49, 34, 0.20))";
    }
    if (variant === "glow") {
      return isGreen
        ? "drop-shadow(0px 0px 12px rgba(249, 210, 186, 0.4))"
        : "drop-shadow(0px 0px 12px rgba(29, 69, 51, 0.3))";
    }
    return "none";
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: getFilter(), flexShrink: 0 }}
    >
      
      <rect width="512" height="512" rx="116" fill={cardColor} />

      
      <path
        d="M148 152C148 152 232 152 304 204C376 256 376 360 376 360C376 360 292 360 220 308C148 256 148 152 148 152Z"
        fill={bubbleColor}
      />

      
      <circle cx="230" cy="256" r="22" fill={dotsColor} />
      <circle cx="294" cy="256" r="22" fill={dotsColor} />

      <path
        d="M340 188H412M412 188V260M412 188L336 264"
        stroke={arrowColor}
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}