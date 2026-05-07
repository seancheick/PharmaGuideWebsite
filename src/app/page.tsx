import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 3: Infrastructure Strip mounted directly under the Hero, acts as
 * a quiet "register change" before the (still-stub) Problem section.
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
        {/* Anchor stub — keeps the "Why interactions matter ↓" link working
            until Phase 4 mounts the real Problem section. */}
        <div id="problem" aria-hidden="true" className="h-px w-full" />
        <TokenPreview />
      </main>
    </>
  );
}
