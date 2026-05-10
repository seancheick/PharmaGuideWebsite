import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you're looking for doesn't exist or may have moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="relative flex min-h-[70vh] items-center bg-background"
      >
        <div className="container relative mx-auto px-6">
          <div className="relative mx-auto flex max-w-2xl flex-col items-start gap-7 py-16 md:py-24">
            {/* Decorative ring — quiet brand signature borrowed from the
                severity ladder (the neutral "monitor" shape). Hidden on
                mobile to let the type breathe; on md+ it sits in the
                top-right of the content block at low opacity. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-4 right-0 hidden md:block"
            >
              <svg
                viewBox="0 0 14 14"
                className="h-24 w-24 text-foreground/[0.08]"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                />
              </svg>
            </span>

            <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-muted">
              404 · Page not found
            </p>

            <h1 className="text-display-md text-ink">
              This page{" "}
              <span className="font-serif italic text-accent">
                doesn&rsquo;t exist.
              </span>
            </h1>

            <p className="max-w-prose text-body-lg leading-relaxed text-muted">
              The link may be broken, or the page may have moved. Head back
              home, or browse the latest from the blog.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 font-medium text-accent transition-colors duration-fast ease-smooth hover:text-accent-strong"
              >
                <span
                  aria-hidden="true"
                  className="transition-transform duration-default ease-smooth group-hover:-translate-x-0.5"
                >
                  &larr;
                </span>
                Back to home
              </Link>
              <Link
                href="/blog"
                className="text-body text-muted underline decoration-border underline-offset-[6px] transition-colors duration-fast ease-smooth hover:text-ink hover:decoration-foreground/40"
              >
                Read the blog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
