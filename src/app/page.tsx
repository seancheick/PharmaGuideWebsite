import { Header } from "@/components/layout/Header";
import { TokenPreview } from "@/components/preview/TokenPreview";

/**
 * Phase 1 preview: Header floats above the TokenPreview so the scroll behavior
 * (glass appears > 24px, hides on scroll-down past 200px, returns on scroll-up)
 * can be verified against real content. TokenPreview will be removed once
 * sections start landing.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <TokenPreview />
      </main>
    </>
  );
}
