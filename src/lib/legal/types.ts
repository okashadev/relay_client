export type Block =
  | string
  | { list: string[] }
  | { items: { title: string; text: string }[] }
  | { callout: string };

export type LegalSection = { id: string; title: string; blocks: Block[] };
