import type { ReactionSummary } from "@/types/chat";

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

export const applyMyReaction = (
  reactions: ReactionSummary[],
  previous: string | null,
  next: string | null,
): ReactionSummary[] => {
  let result = reactions.map((reaction) => ({ ...reaction }));

  if (previous) {
    result = result
      .map((reaction) =>
        reaction.emoji === previous
          ? { ...reaction, count: reaction.count - 1, reactedByMe: false }
          : reaction,
      )
      .filter((reaction) => reaction.count > 0);
  }

  if (next) {
    const existing = result.find((reaction) => reaction.emoji === next);

    if (existing) {
      existing.count += 1;
      existing.reactedByMe = true;
    } else {
      result.push({ emoji: next, count: 1, reactedByMe: true });
    }
  }

  return result.sort(
    (a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji),
  );
};