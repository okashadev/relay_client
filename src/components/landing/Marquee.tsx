const WORDS = [
  "Typing indicators",
  "Read receipts",
  "Voice notes",
  "Groups of 100",
  "24-hour stories",
  "Reply and react",
  "Edit",
  "Delete for everyone",
  "Linked devices",
  "Security codes",
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-8 pr-8">
      {WORDS.map((word) => (
        <li key={word} className="flex items-center gap-8 whitespace-nowrap font-display text-3xl font-semibold tracking-tight text-[#1D4533] sm:text-5xl">
          {word}
          <span className="h-2.5 w-2.5 rounded-full bg-[#B5654A]" />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <div className="select-none overflow-hidden py-12 sm:py-16">
      <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}