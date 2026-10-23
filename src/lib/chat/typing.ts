const firstName = (name: string) => name.split(" ")[0];

export const typingLabel = (
  typers: { name: string }[],
  kind: "DIRECT" | "GROUP",
) => {
  if (typers.length === 0) return "";
  if (kind === "DIRECT") return "typing…";

  if (typers.length === 1) return `${firstName(typers[0].name)} is typing…`;
  if (typers.length === 2) {
    return `${firstName(typers[0].name)} and ${firstName(typers[1].name)} are typing…`;
  }

  return `${firstName(typers[0].name)} and ${typers.length - 1} others are typing…`;
};