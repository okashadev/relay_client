"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  FileText,
  Download,
  Plus,
  Smile,
  Mic,
  ArrowUp,
  CheckCheck,
  Info,
  Search,
} from "lucide-react";
import UserContactProfilePanel from "@/components/chats/direct/UserContactProfilePanel";

interface Message {
  id: string;
  sender: "them" | "me";
  text?: string;
  time: string;
  type?: "text" | "file";
  fileName?: string;
  fileSize?: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "them",
    text: "Hey Alex! Have you reviewed the final state of the authentication and chat websocket pipeline?",
    time: "10:38 AM",
  },
  {
    id: "2",
    sender: "them",
    text: "Here is the updated architectural diagram for our sub-millisecond transmission node:",
    time: "10:39 AM",
  },
  {
    id: "3",
    sender: "them",
    type: "file",
    fileName: "relay-cluster-topology.pdf",
    fileSize: "2.4 MB • PDF Document",
    time: "10:39 AM",
  },
  {
    id: "4",
    sender: "me",
    text: "Yes, just tested it with the 24px rounded card system. The warm cream background (#F7EAE0) and contrast ratios look clean across high-DPI displays.",
    time: "10:41 AM",
  },
  {
    id: "5",
    sender: "me",
    text: "Let's deploy the end-to-end sync update to staging right away! 🚀",
    time: "10:42 AM",
  },
];

export default function DirectChat({ chatId }: { chatId: string }) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showProfile, setShowProfile] = useState(false);
  

  const handleSendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#F7EAE0] select-none">
      {/* Left Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 1. Chat Header */}
        <div className="px-6 py-3.5 bg-[#F7EAE0]/80 backdrop-blur-md border-b border-[#1D4533]/10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#1D4533] text-[#F9D2BA] font-bold text-xs flex items-center justify-center shadow-sm">
                OK
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-[#1D4533]">
                  Okasha Khan
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#1D4533]/10 text-[9px] font-semibold text-[#1D4533]">
                  Lead Architect
                </span>
              </div>
              <p className="text-[10px] text-[#5E3122]/60 font-medium">
                Active now • Relay Secure Channel{" "}
                <span className="font-mono text-[9px]">
                  ({chatId.slice(0, 8)})
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              className="w-9 h-9 rounded-xl hover:bg-[#1D4533]/5 text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
              title="Video Call"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-5 bg-[#1D4533]/10 mx-1" />
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                showProfile
                  ? "bg-[#1D4533] text-[#F9D2BA]"
                  : "hover:bg-[#1D4533]/5 text-[#1D4533]"
              }`}
              title="Contact Profile"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {/* Date Divider */}
          <div className="flex justify-center my-2">
            <span className="px-3 py-1 rounded-full bg-[#1D4533]/10 text-[10px] font-semibold text-[#1D4533]">
              Today
            </span>
          </div>

          {/* Encryption Notice */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1D4533]/5 border border-[#1D4533]/10 text-[10px] text-[#5E3122]/70 font-medium">
              <Lock className="w-3 h-3 text-[#1D4533]" />
              <span>
                Messages and calls are end-to-end encrypted with Relay
                zero-trust keys.
              </span>
            </div>
          </div>

          {/* Message Loop */}
          {messages.map((msg, index) => {
            const isMe = msg.sender === "me";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-[#5E3122]/60 ml-1 mb-1">
                    Okasha Khan
                  </span>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[65%] rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed relative ${
                    isMe
                      ? "bg-[#1D4533] text-[#F7EAE0] rounded-br-sm"
                      : "bg-white text-[#5E3122] rounded-bl-sm border border-[#1D4533]/10"
                  }`}
                >
                  {msg.type === "file" ? (
                    <div className="flex items-center justify-between gap-4 p-2 bg-[#1D4533]/5 rounded-xl border border-[#1D4533]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#1D4533] text-[#F9D2BA] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[#1D4533] truncate">
                            {msg.fileName}
                          </p>
                          <p className="text-[10px] text-[#5E3122]/60">
                            {msg.fileSize}
                          </p>
                        </div>
                      </div>
                      <button className="w-7 h-7 rounded-lg bg-[#1D4533]/10 hover:bg-[#1D4533] hover:text-[#F9D2BA] transition-colors flex items-center justify-center text-[#1D4533] cursor-pointer">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="font-medium whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}

                  <div
                    className={`flex items-center gap-1 mt-1 text-[9px] ${
                      isMe
                        ? "text-[#F9D2BA]/70 justify-end"
                        : "text-[#5E3122]/50 justify-end"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#F9D2BA]" />}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="px-3 py-2 rounded-2xl bg-white border border-[#1D4533]/10 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#1D4533] rounded-full animate-bounce" />
              <span className="text-[10px] font-medium text-[#5E3122]/70 ml-1">
                Okasha is typing...
              </span>
            </div>
          </motion.div>
        </div>

        {/* 3. Bottom Input Bar */}
        <div className="p-4 bg-[#F7EAE0] border-t border-[#1D4533]/10 shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              className="w-10 h-10 rounded-2xl bg-white hover:bg-[#1D4533]/5 border border-[#1D4533]/10 flex items-center justify-center text-[#1D4533] transition-colors cursor-pointer shrink-0"
              title="Attach file"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type a message to Okasha Khan..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#1D4533]/10 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all focus:ring-2 focus:ring-[#1D4533]/10 font-medium pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#5E3122]/50">
                <button
                  type="button"
                  className="hover:text-[#1D4533] transition-colors cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="hover:text-[#1D4533] transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-10 h-10 rounded-2xl bg-[#1D4533] hover:bg-[#1D4533]/90 text-[#F9D2BA] flex items-center justify-center shadow-md shadow-[#1D4533]/20 transition-colors cursor-pointer shrink-0"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="h-full overflow-hidden shrink-0"
          >
            <UserContactProfilePanel onClose={() => setShowProfile(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
