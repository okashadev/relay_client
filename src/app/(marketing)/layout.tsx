import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import MarketingShell from "@/components/marketing/MarketingShell";
import { SITE } from "@/lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Relay: private, real-time chat", template: "%s · Relay" },
  description:
    "Relay is a real-time chat app with groups, 24-hour stories and a history that follows you to every device, encrypted on your device.",
  openGraph: { title: "Relay", description: "Private, real-time chat.", type: "website" },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} bg-[#F7EAE0] text-[#5E3122] min-h-dvh`}>
      <MarketingShell>{children}</MarketingShell>
    </div>
  );
}