import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from "@/lib/legal/privacy";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Relay collects, why, who it's shared with, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={PRIVACY_INTRO}
      updated={SITE.legalUpdated}
      sections={PRIVACY_SECTIONS}
      other={{ label: "Terms of Service", href: "/terms" }}
    />
  );
}