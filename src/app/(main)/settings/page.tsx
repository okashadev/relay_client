"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronRight,
  Image as ImageIcon,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldBan,
  Smartphone,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import SettingsShell from "@/components/settings/SettingsShell";
import { useAuthStore } from "@/store/authStore";

type Row = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const PROFILE: Row = {
  href: "/settings/profile",
  icon: UserRound,
  title: "Profile",
  description: "Manage your profile  details.",
};

const PASSWORD: Row = {
  href: "/settings/change-password",
  icon: KeyRound,
  title: "Change password",
  description: "Update the password you use to sign in",
};

const BLOCKED: Row = {
  href: "/settings/blocked",
  icon: ShieldBan,
  title: "Blocked contacts",
  description: "People who can't message you",
};

const MEDIA: Row = {
  href: "/settings/media",
  icon: ImageIcon,
  title: "Media & storage",
  description: "Photos, videos and files from all your chats",
};

const EMAIL: Row = {
  href: "/settings/email",
  icon: Mail,
  title: "Email address",
  description: "Change the email you sign in with",
};

const ENCRYPTION: Row = {
  href: "/settings/encryption",
  icon: LockKeyhole,
  title: "Chat privacy",
  description: "Passphrase protection for your chat history",
};

const DEVICES: Row = {
  href: "/settings/devices",
  icon: Smartphone,
  title: "Devices",
  description: "Where you're signed in",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function SettingsRow({ href, icon: Icon, title, description }: Row) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-3xl bg-white border border-[#1D4533]/15 shadow-sm transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 [@media(hover:hover)]:hover:border-[#1D4533]/35 [@media(hover:hover)]:hover:shadow-md"
    >
      <div className="w-11 h-11 rounded-2xl bg-[#1D4533]/10 text-[#1D4533] flex items-center justify-center shrink-0 transition-colors [@media(hover:hover)]:group-hover:bg-[#1D4533] [@media(hover:hover)]:group-hover:text-[#F7EAE0]">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-extrabold text-[#1D4533] truncate">
          {title}
        </h3>
        <p className="text-xs font-medium text-[#5E3122]/70 truncate">
          {description}
        </p>
      </div>
      <ChevronRight
        size={18}
        className="text-[#1D4533]/40 shrink-0 transition-transform [@media(hover:hover)]:group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const reduceMotion = useReducedMotion() ?? false;

  const isLocal = user?.provider === "LOCAL";

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: "Account",
      rows: [
        PROFILE,
        DEVICES,
        ...(isLocal
          ? [
              { ...EMAIL, description: user?.email ?? EMAIL.description },
              PASSWORD,
            ]
          : []),
      ],
    },
    {
      title: "Data",
      rows: [MEDIA],
    },
    {
      title: "Privacy",
      rows: [ENCRYPTION, BLOCKED],
    },
  ];

  return (
    <SettingsShell title="Settings" subtitle="Your account and preferences">
      <motion.div
        variants={container}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item}>
          <Link
            href="/settings/profile"
            aria-label="Edit profile"
            className="flex items-center gap-3.5 p-4 rounded-3xl bg-white border border-[#1D4533]/15 shadow-sm transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4533]/40 [@media(hover:hover)]:hover:border-[#1D4533]/35 [@media(hover:hover)]:hover:shadow-md"
          >
            <UserAvatar
              name={user?.name ?? "You"}
              avatar={user?.avatar ?? null}
              className="w-14 h-14 rounded-2xl"
              textClassName="text-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#1D4533] truncate">
                {user?.name ?? "You"}
              </p>
              <p className="text-xs font-medium text-[#5E3122]/70 truncate">
                @{user?.username ?? "you"}
              </p>
              {!isLocal && (
                <span className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-[#1D4533]/10 text-[10px] font-bold text-[#1D4533]">
                  Signed in with Google
                </span>
              )}
            </div>
            <ChevronRight size={18} className="text-[#1D4533]/40 shrink-0" />
          </Link>
        </motion.div>

        {sections.map((section) => (
          <motion.section key={section.title} variants={item}>
            <h2 className="text-[11px] font-extrabold tracking-wider text-[#1D4533]/60 uppercase px-1 mb-2">
              {section.title}
            </h2>
            <div className="space-y-2.5">
              {section.rows.map((row) => (
                <SettingsRow key={row.href} {...row} />
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </SettingsShell>
  );
}
