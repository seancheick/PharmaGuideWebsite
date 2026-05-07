import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { InteractionLadder } from "@/components/sections/InteractionLadder";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 5: Interaction Ladder mounted. Severity colors finally land in
 * the design via the 5-tier card row + featured example interaction card.
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
        <TokenPreview />
      </main>
    </>
  );
}
