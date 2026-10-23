"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, MoreVertical } from "lucide-react";
import GroupAvatar from "@/components/common/GroupAvatar";
import GroupDetailsPanel from "@/components/chats/group/GroupDetailsPanel";
import DeleteMessageDialog from "@/components/chats/shared/DeleteMessageDialog";
import MessageActionSheet from "@/components/chats/shared/MessageActionSheet";
import MessageInput from "@/components/chats/shared/MessageInput";
import MessagePane from "@/components/chats/shared/MessagePane";
import ResponsivePanel from "@/components/chats/shared/ResponsivePanel";
import TypingBubble from "@/components/chats/shared/TypingBubble";
import { useChatMenu } from "@/hooks/useChatMenu";
import { useChatMeta } from "@/hooks/useChatMeta";
import { useChatSession } from "@/hooks/useChatSession";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { useTypers } from "@/hooks/useTypers";
import { typingLabel } from "@/lib/chat/typing";
import { usePresenceStore } from "@/store/presenceStore";
import type { GroupConversationDetails } from "@/types/chat";

interface GroupChatViewProps {
  conversation: GroupConversationDetails;
  messagesState: ConversationMessagesState;
}

export default function GroupChatView({
  conversation,
  messagesState,
}: GroupChatViewProps) {
  const router = useRouter();
  const session = useChatSession({ conversation, messagesState });
  const { me } = useChatMeta(conversation, null);
  const typers = useTypers(conversation.id);
  const presenceByUser = usePresenceStore((state) => state.byUser);

  const menu = useChatMenu({
    conversationId: conversation.id,
    ...me,
    direct: null,
    onDeleted: () => router.push("/app"),
  });

  const [showDetails, setShowDetails] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const onlineCount = conversation.members.filter(
    (member) =>
      (presenceByUser[member.user.id]?.status ?? member.user.status) ===
      "ONLINE",
  ).length;

  const closeDetails = useCallback(() => setShowDetails(false), []);

  const isTyping = typers.length > 0;

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
              <p
                className={`text-[10px] font-medium truncate ${
                  isTyping ? "text-emerald-600" : "text-[#5E3122]/60"
                }`}
              >
                {isTyping
                  ? typingLabel(typers, "GROUP")
                  : `${conversation.members.length} members • ${onlineCount} online`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label="Chat options"
              aria-haspopup="dialog"
              title="Chat options"
              className="w-9 h-9 rounded-xl hover:bg-[#1D4533]/5 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDetails((open) => !open)}
              aria-label="Group info"
              aria-pressed={showDetails}
              title="Group info"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                showDetails
                  ? "bg-[#1D4533] text-[#F9D2BA] shadow-sm"
                  : "hover:bg-[#1D4533]/5 text-[#1D4533]"
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        <MessagePane
          {...session.paneProps}
          showSender
          footer={
            isTyping ? (
              <TypingBubble label={typingLabel(typers, "GROUP")} />
            ) : null
          }
        />

        {conversation.canSend ? (
          <MessageInput
            placeholder={`Message ${conversation.name}...`}
            ariaLabel={`Message ${conversation.name}`}
            {...session.inputProps}
          />
        ) : (
          <div className="px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#F7EAE0] border-t border-[#1D4533]/10 shrink-0 text-center text-xs font-medium text-[#5E3122]/70">
            You can&apos;t send messages in this group.
          </div>
        )}
      </div>

      <ResponsivePanel
        open={showDetails}
        onClose={closeDetails}
        label="Group info"
      >
        <GroupDetailsPanel
          group={conversation}
          meId={session.meId}
          isMuted={me.isMuted}
          onMute={() => void menu.toggleMute()}
          sharedMedia={[]}
          onClose={closeDetails}
        />
      </ResponsivePanel>

      {sheetOpen && (
        <MessageActionSheet
          onClose={() => setSheetOpen(false)}
          myReaction={null}
          actions={menu.actions}
        />
      )}
      {menu.dialogs}
      {session.deleteDialog && (
        <DeleteMessageDialog {...session.deleteDialog} />
      )}
    </div>
  );
}
