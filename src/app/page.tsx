import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { InteractionLadder } from "@/components/sections/InteractionLadder";
import { RealLifeMoments } from "@/components/sections/RealLifeMoments";
import { YourFit } from "@/components/sections/YourFit";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 7: Your Fit mounted — dual-assessment card teaches Quality vs Fit
 * duality. Renamed from "FitScore" since the personal assessment is now
 * qualitative (Excellent / Good / Limited / Concerning / Not recommended).
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
        <YourFit />
        <TokenPreview />
      </main>
    </>
  );
}
