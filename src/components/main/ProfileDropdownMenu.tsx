"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import UserAvatar from "../common/UserAvatar";
import { useRouter } from "next/navigation";

const dropdownSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
};

export default function ProfileDropdownMenu({
  user,
  logoutUser,
}: {
  user?: { name?: string; avatar?: string | null; email?: string } | null;
  logoutUser: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center gap-1 md:flex-col md:gap-4">
      <div className="relative" ref={menuRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={dropdownSpring}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User menu"
          title={user?.name ?? "User menu"}
          className={`block rounded-2xl cursor-pointer ring-2 transition-all duration-200 outline-none ${
            isOpen
              ? "ring-[#1D4533] ring-offset-2 ring-offset-[#F7EAE0]"
              : "ring-transparent"
          }`}
        >
          <UserAvatar
            name={user?.name ?? "?"}
            avatar={user?.avatar ?? null}
            className="w-10 h-10 rounded-2xl shadow-sm"
            textClassName="text-xs font-bold"
          />
        </motion.button>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#F7EAE0] rounded-full pointer-events-none" />

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 12,
                transformOrigin: "bottom left",
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={dropdownSpring}
              className="absolute bottom-full right-0 mb-3 w-70 z-50 overflow-hidden rounded-3xl border border-[#1D4533]/15 bg-[#F7EAE0] p-2 shadow-[0_20px_50px_rgba(29,69,51,0.22)] backdrop-blur-md md:bottom-12 md:left-0 md:mb-0"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-[#1D4533]/6 p-3 mb-1.5 border border-[#1D4533]/10">
                <UserAvatar
                  name={user?.name ?? "?"}
                  avatar={user?.avatar ?? null}
                  className="w-10 h-10 rounded-xl"
                  textClassName="text-xs font-bold"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#1D4533]">
                    {user?.name ?? "User"}
                  </p>
                  <p className="truncate text-[11px] font-medium text-[#5E3122]/65">
                    {user?.email ?? "Active Now"}
                  </p>
                </div>
              </div>

              <div className="space-y-0.5">
                <motion.button
                  whileHover={{
                    x: 3,
                    backgroundColor: "rgba(29, 69, 51, 0.08)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    router.push("/profile");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-[#1D4533] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User
                      size={16}
                      strokeWidth={2.2}
                      className="text-[#1D4533]/80"
                    />
                    <span>Profile</span>
                  </div>
                  <ChevronRight size={14} className="text-[#1D4533]/40" />
                </motion.button>

                <motion.button
                  whileHover={{
                    x: 3,
                    backgroundColor: "rgba(29, 69, 51, 0.08)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    router.push("/settings");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-[#1D4533] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings
                      size={16}
                      strokeWidth={2.2}
                      className="text-[#1D4533]/80"
                    />
                    <span>Settings</span>
                  </div>
                  <ChevronRight size={14} className="text-[#1D4533]/40" />
                </motion.button>

                <div className="my-1.5 h-px w-full bg-[#1D4533]/10" />

                <motion.button
                  whileHover={{
                    x: 3,
                    backgroundColor: "rgba(225, 29, 72, 0.08)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    logoutUser();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-extrabold text-rose-600 transition-colors"
                >
                  <LogOut
                    size={16}
                    strokeWidth={2.2}
                    className="text-rose-600"
                  />
                  <span>Log out</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
