"use client";

import { memo, useMemo, useState } from "react";

const CDN = "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64";

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

const EMOJI_RE = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const KEYCAP_RE = /^[0-9#*]\uFE0F?\u20E3$/;

const isEmoji = (g: string) => EMOJI_RE.test(g) || KEYCAP_RE.test(g);

const toCode = (g: string) =>
  Array.from(g)
    .map((c) => c.codePointAt(0)!.toString(16))
    .join("-");

type Part = { text: string; emoji: boolean };

export const splitEmojis = (text: string): Part[] => {
  if (!segmenter) return [{ text, emoji: false }];

  const parts: Part[] = [];
  for (const { segment } of segmenter.segment(text)) {
    const emoji = isEmoji(segment);
    const last = parts[parts.length - 1];
    if (last && !emoji && !last.emoji) last.text += segment;
    else parts.push({ text: segment, emoji });
  }
  return parts;
};

export const isJumboEmoji = (text: string | null) => {
  if (!text) return false;
  const parts = splitEmojis(text.trim());
  const emojis = parts.filter((p) => p.emoji);
  return (
    emojis.length > 0 &&
    emojis.length <= 3 &&
    parts.every((p) => p.emoji || !p.text.trim())
  );
};

function AppleEmoji({ char, size }: { char: string; size: string }) {
  const [step, setStep] = useState(0);
  const code = toCode(char);
  const candidates = [code, code.replace(/-fe0f/g, "")];

  if (step >= candidates.length) return <span>{char}</span>;

  return (
    <img
      src={`${CDN}/${candidates[step]}.png`}
      alt={char}
      draggable={false}
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
      style={{ width: size, height: size }}
      className="inline-block align-text-bottom select-none"
    />
  );
}

function EmojiText({
  text,
  size = "1.25em",
  jumbo = false,
}: {
  text: string | null | undefined;
  size?: string;
  jumbo?: boolean;
}) {
  const parts = useMemo(() => (text ? splitEmojis(text) : []), [text]);
  if (!text) return null;

  const finalSize = jumbo ? "2.6em" : size;

  return (
    <>
      {parts.map((part, i) =>
        part.emoji ? (
          <AppleEmoji key={i} char={part.text} size={finalSize} />
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export default memo(EmojiText);