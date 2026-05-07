import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { InteractionLadder } from "@/components/sections/InteractionLadder";
import { RealLifeMoments } from "@/components/sections/RealLifeMoments";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 6: Real-Life Moments mounted — four expand-on-tap scenario cards.
 * Severity colors reinforced through per-card "Example flag" chips.
 *
 * TokenPreview remains below for inspection until all sections ship.
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
        <TokenPreview />
      </main>
    </>
  );
}
