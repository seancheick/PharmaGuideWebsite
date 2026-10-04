import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { InfrastructureStrip } from "@/components/sections/InfrastructureStrip";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
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
 * Homepage — 8 sections after dropping TrustBlock and folding the Your Fit
 * section into How It Works step 3 (2026-10-04).
 *
 * TrustBlock ("How we think — Built to explain uncertainty…") was removed
 * because its content overlapped the Infrastructure Strip and the new
 * footer's trust-badges + disclaimer bars. The credentials line
 * (Cross-referenced with FDA · NIH · PubMed · DSLD + the lead reviewer) was
 * folded into HowItWorks as a single statement line. The "we don't"
 * restraint promises live in the footer's trust-badges bar now.
 *
 * Page is statically generated. ISR revalidates every 5 days so the
 * footer's "Last reviewed" date stays fresh in production without
 * needing a manual rebuild.
 */
export const revalidate = 432000; // 5 days, in seconds

export const metadata = pageMetadata("home");

export default function Home() {
  const latest = getAllPosts().slice(0, 3).map(toCardPost);

  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <InfrastructureStrip />
        <Problem />
        {/* Warm fade into HowItWorks — subtle depth between pure-type sections */}
        <div aria-hidden="true" className="fade-warm h-16 md:h-24" />
        <HowItWorks />
        {/* Warm fade into the darker surface-subtle ladder section */}
        <div aria-hidden="true" className="fade-warm h-16 md:h-24" />
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
