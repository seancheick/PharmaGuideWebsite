import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 2: Hero is live. TokenPreview remains below so the design system
 * stays inspectable while remaining sections come online. Placeholder anchor
 * for #problem ensures the secondary CTA scrolls somewhere meaningful until
 * the real Problem section ships in Phase 4.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        {/* Anchor stub — keeps the "Why interactions matter ↓" link working
            until Phase 4 mounts the real Problem section. */}
        <div id="problem" aria-hidden="true" className="h-px w-full" />
        <TokenPreview />
      </main>
    </>
  );
}
