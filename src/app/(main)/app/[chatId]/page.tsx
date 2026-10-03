"use client";

import { useParams } from "next/navigation";
import DirectChat from "@/components/chats/direct/DirectChat";
import { useState } from "react";
import GroupChatView from "@/components/chats/group/GroupChatView";
import GroupDetailsPanel from "@/components/chats/group/GroupDetailsPanel";

const mockChats = [
  {
    id: "9345678h68307s2a",
    name: "Okasha Khan",
    avatarText: "OK",
    preview: "Let's deploy the end-to-end sync upda...",
    ConversationType: "DIRECT",
    time: "10:42 AM",
    isOnline: true,
  },
  {
    id: "b48210f83c1294ea",
    name: "Sarah Jenkins",
    avatarText: "SJ",
    preview: "The design specs for Relay look gor...",
    ConversationType: "DIRECT",
    time: "09:15 AM",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "b48218f83c1294ea",
    name: "webdevTeam",
    avatarText: "WD",
    preview: "Marcus: Pushed the socket gatewa...",
    ConversationType: "GROUP",
    time: "Yesterday",
    unreadCount: 5,
  },
  {
    id: "c28210j82c1294ea",
    name: "mobileDevTeam",
    avatarText: "MD",
    preview: "alex: Pushed the socket gatewa...",
    ConversationType: "GROUP",
    time: "Yesterday",
    unreadCount: 3,
  },
  {
    id: "s28210w82e1294ur",
    name: "Elena Rostova",
    avatarText: "ER",
    preview: "Sent you the telemetry benchmark report.",
    ConversationType: "DIRECT",
    time: "Aug 28",
    isOnline: true,
  },
  {
    id: "z28210q82k1294ig",
    name: "David Chen",
    avatarText: "DC",
    preview: "Thanks! Have a great weekend.",
    ConversationType: "DIRECT",
    time: "Aug 26",
    isOnline: false,
  },
];

export default function ActiveChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const [showDetails, setShowDetails] = useState(false);

  const activeChat = mockChats.find((chat) => chat.id === chatId);
  const isGroup = activeChat?.ConversationType === "GROUP";

  return (
    <>
      <div className="w-full h-full flex overflow-hidden">
        {isGroup ? (
          <div className="flex-1 flex h-full overflow-hidden">
            <GroupChatView
              groupId={chatId}
              onToggleDetails={() => setShowDetails(!showDetails)}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 h-full overflow-hidden">
            <DirectChat chatId={chatId} />
          </div>
        )}
      </div>
    </>
  );
}
