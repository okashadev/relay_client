"use client";

import { motion } from "framer-motion";
import { MessageSquare, Settings, UserPlus, Bell } from "lucide-react";
import { MdWebStories } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/api/api";
import { useAuthStore } from "@/store/authStore";
import NotificationBadge from "@/components/notifications/NotificationBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { useChatList } from "@/hooks/useChatList";

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

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function AppSidebar() {
  const pathname = usePathname() ?? "";
  const { chats } = useChatList();
  const user = useAuthStore((state) => state.user);

  const isChatOpen = /^\/app\/[^/]+/.test(pathname);

  const unreadConversations = (chats ?? []).filter(
    (chat) => !chat.isArchived && chat.unreadCount > 0,
  ).length;

  return (
    <aside
      className={`${
        isChatOpen ? "hidden md:flex" : "flex"
      } order-last md:order-first md:flex-col items-center justify-between shrink-0 w-full md:w-20 h-[calc(4rem+env(safe-area-inset-bottom))] md:h-full px-2 md:px-0 md:py-5 pb-[env(safe-area-inset-bottom)] md:pb-5 bg-[#F7EAE0] border-t md:border-t-0 md:border-r border-[#1D4533]/10 z-20`}
    >
      <div className="flex flex-1 md:flex-none items-center md:flex-col md:gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:flex w-10 h-10 rounded-2xl bg-[#1D4533] items-center justify-center text-[#F9D2BA] shadow-md shadow-[#1D4533]/20"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
        </motion.div>

        <nav
          aria-label="Primary"
          className="flex flex-1 md:flex-none items-center justify-around md:flex-col md:gap-3"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className={`relative p-3 rounded-2xl transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-[#1D4533] text-[#F9D2BA] shadow-sm"
                    : "text-[#5E3122]/60 hover:text-[#1D4533] hover:bg-[#1D4533]/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.id === "Chats" && unreadConversations > 0 && (
                  <span
                    aria-label={`${unreadConversations} unread conversations`}
                    className="absolute -top-1 -right-1 z-10 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F7EAE0]"
                  >
                    {unreadConversations > 99 ? "99+" : unreadConversations}
                  </span>
                )}
                {item.id === "Notifications" && (
                  <NotificationBadge className="absolute -top-1 -right-1 z-10 border-2 border-[#F7EAE0]" />
                )}
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

      <div className="flex items-center gap-1 md:flex-col md:gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={logoutUser}
            aria-label="Log out"
            title="Log out"
            className="block rounded-2xl cursor-pointer"
          >
            <UserAvatar
              name={user?.name ?? "?"}
              avatar={user?.avatar ?? null}
              className="w-10 h-10 rounded-2xl"
              textClassName="text-xs"
            />
          </button>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full pointer-events-none" />
        </div>
      </div>
    </aside>
  );
}
