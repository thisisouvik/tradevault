import { HeroSection } from "@/components/landing/HeroSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import HoverGradientNavBar from "@/components/ui/hover-gradient-nav-bar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HoverGradientNavBar />
      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CtaSection />
    </main>
  );
}

