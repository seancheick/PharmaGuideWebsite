import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { InteractionLadder } from "@/components/sections/InteractionLadder";
import { RealLifeMoments } from "@/components/sections/RealLifeMoments";
import { YourFit } from "@/components/sections/YourFit";
import { TrustBlock } from "@/components/sections/TrustBlock";
import { FinalCTA } from "@/components/sections/FinalCTA";

/**
 * Phases 9 + 10 shipped — Final CTA + Footer complete the homepage.
 *
 * Page is statically generated. ISR revalidates every 5 days so the
 * footer's "Last reviewed" date stays fresh in production without
 * needing a manual rebuild.
 *
 * TokenPreview removed now that all 10 sections are live.
 */
export const revalidate = 432000; // 5 days, in seconds

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <InfrastructureStrip />
        <Problem />
        <HowItWorks />
        <InteractionLadder />
        <RealLifeMoments />
        <YourFit />
        <TrustBlock />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
