"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, MoreVertical } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import UserContactProfilePanel from "@/components/chats/direct/UserContactProfilePanel";
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
import { presenceLabel, usePresence } from "@/hooks/usePresence";
import { useTypers } from "@/hooks/useTypers";
import { typingLabel } from "@/lib/chat/typing";
import type { DirectConversationDetails } from "@/types/chat";

interface DirectChatProps {
  conversation: DirectConversationDetails;
  messagesState: ConversationMessagesState;
}

export default function DirectChat({
  conversation,
  messagesState,
}: DirectChatProps) {
  const router = useRouter();
  const session = useChatSession({ conversation, messagesState });
  const contact = conversation.otherUser;
  const { me, blockedByMe } = useChatMeta(conversation, contact.id);

  const menu = useChatMenu({
    conversationId: conversation.id,
    ...me,
    direct: { userId: contact.id, name: contact.name, blocked: blockedByMe },
    onDeleted: () => router.push("/app"),
  });

  const presence = usePresence(contact.id, {
    status: contact.status,
    lastSeen: contact.lastSeen,
  });
  const typers = useTypers(conversation.id);

  const [showProfile, setShowProfile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const closeProfile = useCallback(() => setShowProfile(false), []);

  const isOnline = presence?.status === "ONLINE";
  const isTyping = typers.length > 0;

  const canSend =
    (conversation.canSend || conversation.blockedByMe) && !blockedByMe;

  return (
    <div className="flex-1 min-w-0 h-full flex overflow-hidden bg-[#F7EAE0] relative">
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-3 sm:px-6 py-3 bg-[#F7EAE0]/90 backdrop-blur-md border-b border-[#1D4533]/10 flex items-center justify-between gap-2 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/app"
              aria-label="Back to conversations"
              className="md:hidden w-9 h-9 -ml-1 rounded-xl hover:bg-[#1D4533]/5 text-[#1D4533] flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="relative shrink-0">
              <UserAvatar
                name={contact.name}
                avatar={contact.avatar}
                className="w-10 h-10 rounded-2xl"
                textClassName="text-xs"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[#1D4533] truncate">
                {contact.name}
              </h2>
              <p
                className={`text-[10px] font-medium truncate ${
                  isTyping ? "text-emerald-600" : "text-[#5E3122]/60"
                }`}
              >
                {isTyping
                  ? typingLabel(typers, "DIRECT")
                  : presenceLabel(presence)}
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
              onClick={() => setShowProfile((open) => !open)}
              aria-label="Contact info"
              aria-pressed={showProfile}
              title="Contact info"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                showProfile
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
          intro={
            <p className="text-center text-[10px] font-medium text-[#5E3122]/50 py-2">
              This is the beginning of your conversation with {contact.name}
            </p>
          }
          footer={
            isTyping ? (
              <TypingBubble label={typingLabel(typers, "GROUP")} />
            ) : null
          }
        />

        {canSend ? (
          <MessageInput
            placeholder={`Message ${contact.name}...`}
            ariaLabel={`Message ${contact.name}`}
            {...session.inputProps}
          />
        ) : (
          <div className="px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#F7EAE0] border-t border-[#1D4533]/10 shrink-0 text-center text-xs font-medium text-[#5E3122]/70">
            {blockedByMe ? (
              <>
                You blocked {contact.name}.{" "}
                <button
                  type="button"
                  onClick={menu.requestBlock}
                  className="font-bold text-[#1D4533] underline cursor-pointer"
                >
                  Unblock
                </button>{" "}
                to send messages.
              </>
            ) : (
              "You can't send messages in this chat."
            )}
          </div>
        )}
      </div>

      <ResponsivePanel
        open={showProfile}
        onClose={closeProfile}
        label="Contact info"
      >
        <UserContactProfilePanel
          user={contact}
          onClose={closeProfile}
          isMuted={me.isMuted}
          isBlocked={blockedByMe}
          onMute={() => void menu.toggleMute()}
          onClearChat={menu.requestDelete}
          onBlock={menu.requestBlock}
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
