import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { InteractionLadder } from "@/components/sections/InteractionLadder";
import { RealLifeMoments } from "@/components/sections/RealLifeMoments";
import { YourFit } from "@/components/sections/YourFit";
import { TrustBlock } from "@/components/sections/TrustBlock";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 8: Trust Block mounted — three trust cards + four restraint cards
 * + freshness signal. The "what we don't do" panel is structurally
 * important — confident companies admit limits, and the contrast against
 * the trust cards makes both feel more honest.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <InfrastructureStrip />
        <Problem />
        <InteractionLadder />
        <RealLifeMoments />
        <YourFit />
        <TrustBlock />
        <TokenPreview />
      </main>
    </>
  );
}
