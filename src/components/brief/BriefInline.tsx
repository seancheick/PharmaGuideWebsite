"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BriefForm } from "./BriefForm";
import { track } from "@/lib/analytics";
import { isKnownSubscriber } from "@/lib/brief-offer";

/**
 * End-of-article Safety Brief offer. Always rendered, never suppressed:
 * suppression only governs the automatic BriefOffer, and a reader can
 * always ask for the brief on purpose. A reader this browser already knows
 * (a confirmed request, or a visit from one of our emails) gets the PDF
 * link straight away instead of a signup form, with the form one tap away.
 */
export function BriefInline() {
  const ref = useRef<HTMLElement>(null);
  const [known, setKnown] = useState(false);

  // After mount: the server render can't read browser storage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once
    setKnown(isKnownSubscriber());
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        track("brief_offer", { action: "shown", placement: "blog_inline" });
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={ref}
      aria-labelledby="brief-inline-heading"
      className="mx-auto mt-16 grid max-w-3xl gap-6 rounded-3xl border border-border bg-surface/70 p-6 sm:grid-cols-[7.5rem_1fr] sm:p-8"
    >
      <Image
        src="/images/brief-cover.webp"
        alt=""
        width={640}
        height={829}
        sizes="7.5rem"
        className="hidden h-auto w-full rounded-md shadow-md sm:block"
      />
      <div>
        <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
          Free 19-page guide · Clinician-reviewed
        </p>
        <h2 id="brief-inline-heading" className="mt-2 font-serif text-2xl italic leading-tight">
          Know what you&apos;re actually taking.
        </h2>
        <p className="mt-2 text-body-sm text-muted">
          Get the PharmaGuide Supplement Safety Brief, a practical guide to labels, doses, and
          common interactions, with an eight-check shopping checklist and a printable
          supplement-and-medication worksheet.
        </p>
        <div className="mt-5">
          {known ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href="/supplement-safety-brief.pdf"
                className="rounded-full bg-accent px-7 py-3.5 font-medium text-white transition-opacity hover:opacity-90"
              >
                Read the brief
              </a>
              <button
                type="button"
                onClick={() => setKnown(false)}
                className="text-body-sm text-muted underline underline-offset-[3px] hover:text-ink"
              >
                Email it to a different address
              </button>
            </div>
          ) : (
            <BriefForm idPrefix="brief-inline" placement="blog_inline" />
          )}
        </div>
      </div>
    </aside>
  );
}
