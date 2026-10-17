"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import UserContactProfilePanel from "@/components/chats/direct/UserContactProfilePanel";
import ChatActionsMenu from "@/components/chats/shared/ChatActionsMenu";
import DeleteMessageDialog from "@/components/chats/shared/DeleteMessageDialog";
import MessageInput from "@/components/chats/shared/MessageInput";
import MessagePane from "@/components/chats/shared/MessagePane";
import ResponsivePanel from "@/components/chats/shared/ResponsivePanel";
import type { ConversationMessagesState } from "@/hooks/useConversationMessages";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatSettings } from "@/hooks/useChatSettings";
import { formatLastSeen } from "@/lib/format";
import type { DirectConversationDetails } from "@/types/chat";

interface DirectChatProps {
  conversation: DirectConversationDetails;
  messagesState: ConversationMessagesState;
}

export default function DirectChat({
  conversation,
  messagesState,
}: DirectChatProps) {
  const session = useChatSession({ conversation, messagesState });
  const settings = useChatSettings(conversation.id, conversation.me);
  const contact = conversation.otherUser;

  const [showProfile, setShowProfile] = useState(false);

  const isContactTyping = false;

  const closeProfile = useCallback(() => setShowProfile(false), []);

  const isOnline = contact.status === "ONLINE";

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
              <p className="text-[10px] text-[#5E3122]/60 font-medium truncate">
                {isOnline ? "Online" : formatLastSeen(contact.lastSeen)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <ChatActionsMenu
              me={settings.me}
              busy={settings.busy}
              onChange={settings.update}
            />
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
            isContactTyping ? (
              <div className="flex items-center gap-2 pt-3">
                <div className="px-3 py-2 rounded-2xl bg-white border border-[#1D4533]/10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce" />
                  <span className="text-[10px] font-medium text-[#5E3122]/70 ml-1">
                    {contact.name.split(" ")[0]} is typing...
                  </span>
                </div>
              </div>
            ) : null
          }
        />

        <MessageInput
          placeholder={`Message ${contact.name}...`}
          ariaLabel={`Message ${contact.name}`}
          {...session.inputProps}
        />
      </div>

      <ResponsivePanel
        open={showProfile}
        onClose={closeProfile}
        label="Contact info"
      >
        <UserContactProfilePanel user={contact} onClose={closeProfile} />
      </ResponsivePanel>

      {session.deleteDialog && <DeleteMessageDialog {...session.deleteDialog} />}
    </div>
  );
}