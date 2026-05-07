import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 4: Problem section is live. The "Why interactions matter ↓" CTA
 * in the Hero now scrolls to a real section instead of an anchor stub.
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
        <TokenPreview />
      </main>
    </>
  );
}
