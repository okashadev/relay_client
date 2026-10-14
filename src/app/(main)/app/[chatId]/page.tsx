"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import DirectChat from "@/components/chats/direct/DirectChat";
import GroupChatView from "@/components/chats/group/GroupChatView";
import { useConversation } from "@/hooks/useConversation";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { useChatListStore } from "@/store/chatListStore";
import { useEffect } from "react";
import { markConversationRead } from "@/lib/ChatApi";

function ChatStatusScreen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#F7EAE0]">
      <h2 className="text-xl font-extrabold text-[#1D4533] tracking-tight">
        {title}
      </h2>
      <p className="text-xs text-[#5E3122]/70 font-medium max-w-xs">
        {description}
      </p>
      <div className="flex items-center gap-2.5">
        {children}
        <Link
          href="/app"
          className="px-4 py-2.5 bg-white border border-[#1D4533]/15 text-[#1D4533] rounded-2xl shadow-sm text-xs font-bold hover:bg-[#1D4533]/5 transition-all"
        >
          Back to conversations
        </Link>
      </div>
    </div>
  );
}

function ChatScreen({ chatId }: { chatId: string }) {
  const details = useConversation(chatId);
  const messagesState = useConversationMessages(chatId);

  const markRead = useChatListStore((state) => state.markRead);

  useEffect(() => {
    if (messagesState.status !== "ready") return;

    markRead(chatId);
    markConversationRead(chatId).catch(() => {});
  }, [chatId, messagesState.status, markRead]);

  if (details.status === "loading") {
    return (
      <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-4 bg-[#F7EAE0]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1D4533]" />
        <Link
          href="/app"
          className="md:hidden text-xs font-bold text-[#1D4533] underline"
        >
          Back to conversations
        </Link>
      </div>
    );
  }

  if (details.status === "not-found") {
    return (
      <ChatStatusScreen
        title="Conversation not found"
        description="This conversation doesn't exist or you no longer have access to it."
      />
    );
  }

  if (details.status === "error" || !details.conversation) {
    return (
      <ChatStatusScreen
        title="Couldn't open this chat"
        description="Something went wrong while loading the conversation."
      >
        <button
          type="button"
          onClick={details.reload}
          className="px-4 py-2.5 bg-[#1D4533] text-[#F7EAE0] rounded-2xl shadow-md text-xs font-bold hover:bg-[#1D4533]/90 transition-all cursor-pointer"
        >
          Try again
        </button>
      </ChatStatusScreen>
    );
  }

  const { conversation } = details;

  return conversation.type === "GROUP" ? (
    <GroupChatView conversation={conversation} messagesState={messagesState} />
  ) : (
    <DirectChat conversation={conversation} messagesState={messagesState} />
  );
}

export default function ActiveChatPage() {
  const { chatId } = useParams<{ chatId: string }>();

  return <ChatScreen key={chatId} chatId={chatId} />;
}
