"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  MessageSquare,
  X,
  Check,
  ArrowRight,
  Search,
  Loader2,
} from "lucide-react";
import { fetchFriends, FriendUser } from "@/lib/friendsApi";
import { useRouter } from "next/navigation";
import UserAvatar from "../common/UserAvatar";
import { newChat } from "@/lib/ChatApi";
import { toast } from "sonner";

export default function NewChatDropdownButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"none" | "chat" | "group">(
    "none",
  );
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isOpenChatLoading, setIsOpenChatLoading] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        setFriends(await fetchFriends(controller.signal));
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [reloadKey]);

  const openChat = async (otherUserId: string) => {
    if (!otherUserId) return;
    setIsOpenChatLoading(true);
    try {
      const { success, conversation } = await newChat(otherUserId);
      const conversationId = conversation?.id;
      if (success) {
        setActiveModal("none");
        router.push(`/app/${conversationId}`);
      }
    } catch (err: any) {
      toast.error(
        err instanceof Error ? err.message : "Could not open the chat",
      );
    } finally {
      setIsOpenChatLoading(false);
    }
  };

  const toggleMemberSelection = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const filteredFriends = friends.filter((friend) => {
    const q = friendSearchQuery.toLowerCase();
    return (
      friend.name.toLowerCase().includes(q) ||
      friend.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Start a new chat or group"
        title="New chat"
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
          isOpen
            ? "bg-[#1D4533] text-[#F7EAE0] border-[#1D4533]"
            : "bg-[#F7EAE0] hover:bg-[#F9D2BA]/40 text-[#1D4533] border-[#1D4533]/15 shadow-sm"
        }`}
      >
        <Plus
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 bg-[#F7EAE0] border border-[#1D4533]/15 rounded-2xl shadow-xl z-50 p-1.5 overflow-hidden backdrop-blur-md"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("chat");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/10 rounded-xl transition-colors cursor-pointer text-left"
            >
              <MessageSquare className="w-4 h-4 text-[#1D4533]" />
              New Direct Chat
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("group");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/10 rounded-xl transition-colors cursor-pointer text-left"
            >
              <Users className="w-4 h-4 text-[#1D4533]" />
              New Group Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeModal === "chat" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#F7EAE0] border border-[#1D4533]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[75vh] md:h-120"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#1D4533]/10 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-black text-[#1D4533]">
                    Select a Friend
                  </h3>
                  <p className="text-[10px] text-[#5E3122]/60 font-medium">
                    Choose someone to start chatting with
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveModal("none");
                    setFriendSearchQuery("");
                  }}
                  className="w-8 h-8 rounded-xl bg-[#1D4533]/10 hover:bg-[#1D4533] hover:text-[#F7EAE0] text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="p-3 sm:p-4 border-b border-[#1D4533]/10 shrink-0 bg-[#F7EAE0]/50">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E3122]/40" />
                  <input
                    type="text"
                    placeholder="Search friends by name or username..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-[#1D4533]/15 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all font-medium focus:ring-2 focus:ring-[#1D4533]/10"
                  />
                  {friendSearchQuery && (
                    <button
                      onClick={() => setFriendSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#5E3122]/50 hover:text-[#1D4533] font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Friends Scrollable Container */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
                {isLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#1D4533]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-medium text-[#5E3122]/60">
                      Loading friends...
                    </span>
                  </div>
                ) : error ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-4">
                    <p className="text-xs font-semibold text-red-600">
                      {error}
                    </p>
                    <button
                      onClick={() => setReloadKey((k) => k + 1)}
                      className="text-[11px] text-[#1D4533] font-bold underline cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs font-bold text-[#1D4533]">
                      {friendSearchQuery
                        ? "No friends found"
                        : "No friends yet"}
                    </p>
                    <p className="text-[10px] text-[#5E3122]/60 font-medium mt-0.5">
                      {friendSearchQuery
                        ? "Try searching with a different name or username."
                        : "Add some friends to start a conversation."}
                    </p>
                  </div>
                ) : (
                  filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => openChat(friend.id)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/60 hover:bg-white border border-[#1D4533]/10 transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserAvatar
                            name={friend.name}
                            avatar={friend.avatar}
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1D4533] group-hover:underline">
                            {friend.name}
                          </h4>
                          <p className="text-[10px] text-[#5E3122]/60 font-medium">
                            @{friend.username}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#1D4533]/40 group-hover:text-[#1D4533] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Group Chat Modal */}
        {activeModal === "group" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#F7EAE0] border border-[#1D4533]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 sm:p-5 border-b border-[#1D4533]/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#1D4533]">
                    Create New Group
                  </h3>
                  <p className="text-[10px] text-[#5E3122]/60 font-medium">
                    Add group details and select members
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal("none")}
                  className="w-8 h-8 rounded-xl bg-[#1D4533]/10 hover:bg-[#1D4533] hover:text-[#F7EAE0] text-[#1D4533] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D4533] mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Core Engineering"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#1D4533]/15 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D4533] mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="What is this group about?"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#1D4533]/15 focus:border-[#1D4533] rounded-2xl text-xs text-[#5E3122] placeholder-[#5E3122]/40 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1D4533] mb-2">
                    Select Members ({selectedMembers.length} selected)
                  </label>
                  <div className="space-y-2">
                    {friends.map((friend) => {
                      const isSelected = selectedMembers.includes(friend.id);
                      return (
                        <div
                          key={friend.id}
                          onClick={() => toggleMemberSelection(friend.id)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#1D4533]/10 border-[#1D4533]"
                              : "bg-white/60 hover:bg-white border-[#1D4533]/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={friend.name}
                              avatar={friend.avatar}
                            />
                            <div>
                              <h4 className="text-xs font-bold text-[#1D4533]">
                                {friend.name}
                              </h4>
                              <p className="text-[10px] text-[#5E3122]/60 font-medium">
                                @{friend.username}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#1D4533] border-[#1D4533] text-[#F9D2BA]"
                                : "border-[#1D4533]/30 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#1D4533]/10 bg-white/40 flex justify-end gap-2">
                <button
                  onClick={() => setActiveModal("none")}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#5E3122]/70 hover:bg-[#1D4533]/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  onClick={() => {
                    alert(
                      `Group "${groupName}" created with ${selectedMembers.length} members!`,
                    );
                    setActiveModal("none");
                    setGroupName("");
                    setGroupDesc("");
                    setSelectedMembers([]);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#1D4533] disabled:opacity-50 text-[#F9D2BA] text-xs font-bold shadow-md hover:bg-[#1D4533]/90 transition-all cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
