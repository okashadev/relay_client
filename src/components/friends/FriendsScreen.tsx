"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Bell,
  MessageSquare,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";
import AddFriendScreen from "./AddFriendScreen";

const INITIAL_FRIENDS = [
  {
    id: "1",
    name: "Okasha Khan",
    role: "Design Lead",
    status: "Online",
    avatar: "OK",
    mutual: 4,
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    role: "Frontend Engineer",
    status: "In a meeting",
    avatar: "SJ",
    mutual: 2,
  },
  {
    id: "3",
    name: "Rabeet",
    role: "Security Ops",
    status: "Offline",
    avatar: "R",
    mutual: 6,
  },
  {
    id: "4",
    name: "wasif",
    role: "Product Manager",
    status: "Online",
    avatar: "U",
    mutual: 1,
  },
];

const INITIAL_REQUESTS = [
  {
    id: "r1",
    name: "Zainab Malik",
    role: "UI/UX Designer",
    avatar: "ZM",
    mutual: 3,
  },
  { id: "r2", name: "Hamza Ali", role: "Backend Dev", avatar: "HA", mutual: 5 },
];

export default function FriendsScreen() {
  const [currentView, setCurrentView] = useState<"list" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (currentView === "add") {
    return <AddFriendScreen onBack={() => setCurrentView("list")} />;
  }

  return (
    <div className="flex h-full w-full bg-[#F7EAE0] overflow-hidden select-none relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 p-6 lg:p-8 overflow-y-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 border-b border-[#1D4533]/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-[#1D4533] tracking-tight">
                Friends
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1D4533]/10 text-[#1D4533] text-xs font-bold">
                {friends.length} Active
              </span>
            </div>
            <p className="text-xs text-[#1D4533]/70 mt-0.5 font-medium">
              Manage your secure network connections and requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Requests Toggle Button with Badge */}
            <motion.a
              href="/notifications"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1D4533]/15 rounded-2xl shadow-sm text-xs font-bold text-[#1D4533] hover:bg-[#1D4533]/5 transition-all cursor-pointer"
            >
              <Bell size={15} className="text-[#1D4533]" />
              <span className="hidden sm:inline">Requests</span>
              {requests.length > 0 && (
                <span className="w-5 h-5 bg-[#1D4533] text-[#F7EAE0] rounded-full flex items-center justify-center text-[10px] font-black animate-pulse">
                  {requests.length}
                </span>
              )}
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView("add")}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1D4533] text-[#F7EAE0] rounded-2xl shadow-md text-xs font-bold hover:bg-[#1D4533]/90 transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Add Friends</span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="py-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4533]/50"
            />
            <input
              type="text"
              placeholder="Search friends by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-[#1D4533]/15 rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D4533] placeholder-[#1D4533]/50 focus:outline-none focus:ring-2 focus:ring-[#1D4533]/30 shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Friends Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
          {filteredFriends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#1D4533]/15 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center font-bold text-sm shadow">
                      {friend.avatar}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        friend.status === "Online"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1D4533] group-hover:underline flex items-center gap-1">
                      {friend.name}
                      <ShieldCheck size={13} className="text-[#1D4533]" />
                    </h3>
                    <p className="text-xs text-[#1D4533]/70 font-medium">
                      {friend.role}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-xl text-[#1D4533]/60 hover:bg-[#1D4533]/10 transition-all cursor-pointer">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1D4533]/10 flex items-center justify-between">
                <span className="text-[11px] text-[#1D4533]/60 font-medium">
                  {friend.mutual} mutual connections
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    className="p-2 rounded-xl bg-[#1D4533]/10 text-[#1D4533] hover:bg-[#1D4533] hover:text-[#F7EAE0] transition-all cursor-pointer"
                    title="Message"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Responsive Slide-over Panel for Friend Requests */}
      {/* <AnimatePresence>
        {showRequestsPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestsPanel(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-xs z-20 lg:hidden"
            />
            <motion.div 
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 lg:w-96 bg-white border-l border-[#1D4533]/15 shadow-2xl flex flex-col z-30"
            >
              <div className="p-5 border-b border-[#1D4533]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-[#1D4533]" />
                  <h2 className="text-sm font-bold text-[#1D4533]">Friend Requests ({requests.length})</h2>
                </div>
                <button 
                  onClick={() => setShowRequestsPanel(false)}
                  className="p-1.5 rounded-xl text-[#1D4533]/60 hover:bg-[#1D4533]/10 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {requests.length === 0 ? (
                  <div className="text-center py-12 text-[#1D4533]/50 text-xs font-medium">
                    No pending friend requests.
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="p-3.5 bg-[#F7EAE0]/60 border border-[#1D4533]/15 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1D4533] text-[#F7EAE0] flex items-center justify-center font-bold text-xs">
                          {req.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1D4533] truncate">{req.name}</h4>
                          <p className="text-[10px] text-[#1D4533]/70 truncate font-medium">{req.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(req.id)}
                          className="flex-1 py-1.5 bg-[#1D4533] text-[#F7EAE0] rounded-xl text-xs font-bold hover:bg-[#1D4533]/90 transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(req.id)}
                          className="flex-1 py-1.5 bg-white border border-[#1D4533]/20 text-[#1D4533] rounded-xl text-xs font-bold hover:bg-[#1D4533]/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence> */}
    </div>
  );
}
