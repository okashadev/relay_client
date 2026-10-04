"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Settings, UserPlus, Bell } from "lucide-react";
import { MdWebStories } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/api";

const navItems = [
  { id: "Chats", icon: MessageSquare, label: "Chats", href: "/app" },
  { id: "Stories", icon: MdWebStories, label: "Stories", href: "/stories" },
  { id: "Friends", icon: UserPlus, label: "Friends", href: "/friends" },
  {
    id: "Notifications",
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
  },
];

export default function AppSidebar() {
 const pathName = usePathname();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    if (!pathName) return;

    const currentItem = navItems.find((item) => {
      if (item.href === "/app") {
        return pathName === "/app" || pathName.startsWith("/app/");
      }
      return pathName.startsWith(item.href);
    });

    if (currentItem) {
      setActiveTab(currentItem.id);
    }
  }, [pathName]);

  return (
    <aside className="w-16 sm:w-20 h-screen bg-[#F7EAE0] border-r border-[#1D4533]/10 flex flex-col justify-between items-center py-5 select-none shrink-0 z-20">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-2xl bg-[#1D4533] flex items-center justify-center text-[#F9D2BA] shadow-md shadow-[#1D4533]/20 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
        </motion.div>

        {/* Primary Nav Navigation */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className={`relative p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "bg-[#1D4533] text-[#F9D2BA] shadow-sm"
                    : "text-[#5E3122]/60 hover:text-[#1D4533] hover:bg-[#1D4533]/5"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-2xl border-2 border-[#1D4533]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="flex flex-col items-center gap-4">
        <button
          className="p-3 rounded-2xl text-[#5E3122]/60 hover:text-[#1D4533] hover:bg-[#1D4533]/5 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar with Online Indicator */}
        <div className="relative group cursor-pointer">
          <button onClick={logoutUser} className="w-10 h-10 rounded-2xl bg-[#5E3122] text-[#F7EAE0] font-bold text-xs flex items-center justify-center shadow-md">
            AM
          </button>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full" />
        </div>
      </div>
    </aside>
  );
}
