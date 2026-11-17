import Link from "next/link";
import { SITE } from "@/lib/site";

const GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "Privacy modes", href: "/#privacy-modes" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-[#1D4533]/10 px-4 pt-14 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <p className="font-display text-2xl font-bold tracking-tight text-[#1D4533]">Relay</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#5E3122]/75">
            Private, real-time chat with groups, stories and devices you control.
          </p>
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="mt-4 inline-block text-sm font-bold text-[#1D4533] underline-offset-4 hover:underline"
          >
            {SITE.contactEmail}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-extrabold text-[#1D4533]/60">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm font-semibold text-[#1D4533] underline-offset-4 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl text-xs font-medium text-[#5E3122]/60">
        © {new Date().getFullYear()} Relay. All rights reserved.
      </p>

      <div aria-hidden="true" className="pointer-events-none mt-4 -mb-[0.2em] select-none text-center font-display text-[clamp(6rem,26vw,24rem)] font-bold leading-[0.8] tracking-tighter text-[#1D4533]/[0.07]">
        Relay
      </div>
    </footer>
  );
}