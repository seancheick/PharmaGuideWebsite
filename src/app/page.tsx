import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { ScanStory } from "@/components/sections/ScanStory";
import { InteractionLadder } from "@/components/sections/InteractionLadder";
import { BeyondInteractions } from "@/components/sections/BeyondInteractions";
import { RealLifeMoments } from "@/components/sections/RealLifeMoments";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { LatestResearch } from "@/components/sections/LatestResearch";
import { JsonLd } from "@/components/shared/JsonLd";
import { getAllPosts, toCardPost } from "@/lib/blog";
import { pageMetadata, pageSchema } from "@/lib/pages";
import { schemaId } from "@/lib/schema";

/**
 * Homepage — 7 sections.
 *
 * 2026-11-13: Problem and How It Works merged into ScanStory, one compact
 * animated stage (bottle → quality, stack, you). The Problem section's
 * lines and its CDC figure live on inside it as captions.
 * 2026-10-04: TrustBlock dropped (its content overlapped the Infrastructure
 * Strip and the footer's trust badges) and Your Fit folded into How It Works.
 *
 * Page is statically generated. ISR revalidates every 5 days so the
 * footer's "Last reviewed" date stays fresh in production without
 * needing a manual rebuild.
 */
export const revalidate = 432000; // 5 days, in seconds

export const metadata = pageMetadata("home");

export default function Home() {
  const latest = getAllPosts().filter((p) => !p.recall).slice(0, 3).map(toCardPost);

  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <InfrastructureStrip />
        <ScanStory />
        <InteractionLadder />
        <BeyondInteractions />
        <RealLifeMoments />
        <LatestResearch posts={latest} />
        <FinalCTA />
      </main>
      <Footer />
      <JsonLd nodes={pageSchema("home", { mainEntity: schemaId.organization })} />
    </>
  );
}
