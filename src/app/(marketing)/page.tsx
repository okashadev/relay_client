import FinalCta from "@/components/marketing/FinalCta";
import Faq from "@/components/marketing/Faq";
import Features from "@/components/marketing/Features";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Limits from "@/components/marketing/Limits";
import Marquee from "@/components/marketing/Marquee";
import PrivacyModes from "@/components/marketing/PrivacyModes";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <PrivacyModes />
      <Limits />
      <Faq />
      <FinalCta />
    </>
  );
}
