import FinalCta from "@/components/landing/FinalCta";
import Faq from "@/components/landing/Faq";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Limits from "@/components/landing/Limits";
import Marquee from "@/components/landing/Marquee";
import PrivacyModes from "@/components/landing/PrivacyModes";

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
