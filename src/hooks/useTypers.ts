"use client";

import { useTypingStore, type Typer } from "@/store/typingStore";

const EMPTY: Typer[] = [];

export function useTypers(conversationId: string): Typer[] {
  return (
    useTypingStore((state) => state.byConversation[conversationId]) ?? EMPTY
  );
}