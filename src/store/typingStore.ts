import { create } from "zustand";

export type Typer = { userId: string; name: string };

const EXPIRE_MS = 6_000;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const keyOf = (conversationId: string, userId: string) =>
  `${conversationId}:${userId}`;

type TypingState = {
  byConversation: Record<string, Typer[]>;
  setTyping: (conversationId: string, typer: Typer, isTyping: boolean) => void;
  clearAll: () => void;
};

export const useTypingStore = create<TypingState>((set) => {
  const remove = (conversationId: string, userId: string) => {
    const key = keyOf(conversationId, userId);
    const timer = timers.get(key);

    if (timer) clearTimeout(timer);
    timers.delete(key);

    set((state) => {
      const current = state.byConversation[conversationId];
      if (!current?.some((typer) => typer.userId === userId)) return state;

      const next = current.filter((typer) => typer.userId !== userId);
      const byConversation = { ...state.byConversation };

      if (next.length > 0) byConversation[conversationId] = next;
      else delete byConversation[conversationId];

      return { byConversation };
    });
  };

  return {
    byConversation: {},

    setTyping: (conversationId, typer, isTyping) => {
      if (!isTyping) return remove(conversationId, typer.userId);

      const key = keyOf(conversationId, typer.userId);
      const existing = timers.get(key);
      if (existing) clearTimeout(existing);

      timers.set(
        key,
        setTimeout(() => remove(conversationId, typer.userId), EXPIRE_MS),
      );

      set((state) => {
        const current = state.byConversation[conversationId] ?? [];
        if (current.some((item) => item.userId === typer.userId)) return state;

        return {
          byConversation: {
            ...state.byConversation,
            [conversationId]: [...current, typer],
          },
        };
      });
    },

    clearAll: () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      set({ byConversation: {} });
    },
  };
});