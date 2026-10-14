"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import GroupAvatar from "@/components/common/GroupAvatar";
import GroupDetailsPanel from "@/components/chats/group/GroupDetailsPanel";
import MessageInput from "@/components/chats/shared/MessageInput";
import MessagePane from "@/components/chats/shared/MessagePane";
import ResponsivePanel from "@/components/chats/shared/ResponsivePanel";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { createOutgoingMessage } from "@/lib/chatMessages";
import { useAuthStore } from "@/store/authStore";
import type { GroupConversationDetails } from "@/types/chat";

interface GroupChatViewProps {
  conversation: GroupConversationDetails;
  messagesState: ConversationMessagesState;
}

export default function GroupChatView({
  conversation,
  messagesState,
}: GroupChatViewProps) {
  const meId = useAuthStore((state) => state.user?.id) ?? "";
  const { appendMessage } = messagesState;

  const [showDetails, setShowDetails] = useState(false);

  const onlineCount = conversation.members.filter(
    (member) => member.user.status === "ONLINE",
  ).length;

  const handleSend = useCallback(
    (text: string) => {
      appendMessage(createOutgoingMessage(text, meId));
    },
    [appendMessage, meId],
  );

  const closeDetails = useCallback(() => setShowDetails(false), []);

  return (
    <div className="flex-1 min-w-0 h-full flex overflow-hidden bg-[#F7EAE0] relative">
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Group Header */}
        <header className="px-3 sm:px-6 py-3 bg-[#F7EAE0]/90 backdrop-blur-md border-b border-[#1D4533]/10 flex items-center justify-between gap-2 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/app"
              aria-label="Back to conversations"
              className="md:hidden w-9 h-9 -ml-1 rounded-xl hover:bg-[#1D4533]/5 text-[#1D4533] flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <GroupAvatar
              name={conversation.name}
              avatar={conversation.avatar}
              className="w-10 h-10 rounded-2xl"
            />

            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[#1D4533] truncate">
                {conversation.name}
              </h2>
              <p className="text-[10px] text-[#5E3122]/60 font-medium truncate">
                {conversation.members.length} members • {onlineCount} online
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((open) => !open)}
            aria-label="Group info"
            aria-pressed={showDetails}
            title="Group info"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              showDetails
                ? "bg-[#1D4533] text-[#F9D2BA] shadow-sm"
                : "hover:bg-[#1D4533]/5 text-[#1D4533]"
            }`}
          >
            <Info className="w-4 h-4" />
          </button>
        </header>

        <MessagePane state={messagesState} meId={meId} showSender />

        <MessageInput
          placeholder={`Message ${conversation.name}...`}
          ariaLabel={`Message ${conversation.name}`}
          onSend={handleSend}
        />
      </div>

      <ResponsivePanel
        open={showDetails}
        onClose={closeDetails}
        label="Group info"
      >
        <GroupDetailsPanel
          group={conversation}
          meId={meId}
          sharedMedia={[]}
          onClose={closeDetails}
        />
      </ResponsivePanel>
    </div>
  );
}