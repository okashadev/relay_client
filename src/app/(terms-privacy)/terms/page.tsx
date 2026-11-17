import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";
import { TERMS_INTRO, TERMS_SECTIONS } from "@/lib/legal/terms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Relay.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={TERMS_INTRO}
      updated={SITE.legalUpdated}
      sections={TERMS_SECTIONS}
      other={{ label: "Privacy Policy", href: "/privacy" }}
    />
  );
}