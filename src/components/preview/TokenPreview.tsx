/**
 * TokenPreview — visual gate for design system approval.
 *
 * Renders every design token (color, type, spacing, radius, shadow, severity)
 * so you can verify the system feels right before we build sections.
 *
 * This component will be removed once approval is given and Header/Hero ship.
 */

import { severityTiers } from "@/lib/tokens";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function TokenPreview() {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO — establishes type personality */}
      <section className="border-b border-border halo-hero">
        <div className="container mx-auto py-section-y">
          <p className="mb-4 font-mono text-eyebrow uppercase text-muted">
            Design system · v0.1
          </p>
          <h1 className="font-sans text-display-xl text-ink">
            {site.name}
            <br />
            <span className="font-serif italic text-muted">design tokens.</span>
          </h1>
          <p className="mt-6 max-w-prose text-body-xl text-muted">
            Every value below is a token. No hex codes, no magic numbers, no
            random Tailwind classes — colors, type, spacing, motion, and
            severity all flow from{" "}
            <code className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-body-sm">
              src/app/globals.css
            </code>
            .
          </p>
        </div>
      </section>

      {/* COLORS */}
      <Section title="01 — Color" eyebrow="Surfaces · Foreground · Borders · Accent">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <Swatch name="background" cls="bg-background border border-border" />
          <Swatch name="surface" cls="bg-surface border border-border" />
          <Swatch name="surface-raised" cls="bg-surface-raised border border-border" />
          <Swatch name="surface-subtle" cls="bg-surface-subtle border border-border" />
          <Swatch name="foreground" cls="bg-foreground" dark />
          <Swatch name="ink" cls="bg-ink" dark />
          <Swatch name="muted" cls="bg-muted" dark />
          <Swatch name="subtle" cls="bg-subtle" dark />
          <Swatch name="border" cls="bg-border" />
          <Swatch name="border-strong" cls="bg-border-strong" />
          <Swatch name="accent" cls="bg-accent" dark />
          <Swatch name="accent-strong" cls="bg-accent-strong" dark />
          <Swatch name="accent-soft" cls="bg-accent-soft border border-border" />
        </div>
      </Section>

      {/* SEVERITY */}
      <Section title="02 — Severity" eyebrow="5-tier verdict system">
        <div className="grid gap-3 md:grid-cols-5">
          {severityTiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "rounded-xl border border-border p-5",
                tier.chipBg.replace("/10", "/8")
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", tier.dot)} />
                <span className={cn("font-medium text-body-sm", tier.chipText)}>
                  {tier.label}
                </span>
              </div>
              <p className="mt-3 text-body-sm text-muted">{tier.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* TYPOGRAPHY */}
      <Section title="03 — Typography" eyebrow="Geist Sans · Newsreader · Geist Mono">
        <div className="space-y-12">
          {/* Display scale */}
          <TypeRow label="display-xl">
            <p className="font-sans text-display-xl text-ink">
              Your supplements don&apos;t work in isolation.
            </p>
          </TypeRow>
          <TypeRow label="display-lg">
            <p className="font-sans text-display-lg text-ink">
              Built to explain uncertainty — not hide it.
            </p>
          </TypeRow>
          <TypeRow label="display-md / serif italic">
            <p className="font-serif text-display-md italic text-ink">
              Because interactions happen between products.
            </p>
          </TypeRow>
          <TypeRow label="h1">
            <p className="text-h1 text-ink">A score that changes with your stack.</p>
          </TypeRow>
          <TypeRow label="h2">
            <p className="text-h2 text-ink">Clear verdicts. Cited reasoning.</p>
          </TypeRow>
          <TypeRow label="h3">
            <p className="text-h3 text-ink">The interaction layer for your stack.</p>
          </TypeRow>
          <TypeRow label="body-xl / muted">
            <p className="max-w-prose text-body-xl text-muted">
              See how your supplements, medications, and timing work together —
              not one bottle at a time.
            </p>
          </TypeRow>
          <TypeRow label="body / muted">
            <p className="max-w-prose text-body text-muted">
              Each interaction includes the strength of supporting evidence
              where available. If evidence is weak, conflicting, or incomplete,
              we say so directly.
            </p>
          </TypeRow>
          <TypeRow label="eyebrow">
            <p className="font-mono text-eyebrow uppercase text-muted">
              The interaction layer for your stack
            </p>
          </TypeRow>
          <TypeRow label="micro">
            <p className="text-micro text-subtle">
              Free during beta. No spam. We will never sell your health data.
            </p>
          </TypeRow>
          <TypeRow label="mono / tnum">
            <p className="font-mono text-h1 tnum text-ink">82</p>
          </TypeRow>
        </div>
      </Section>

      {/* RADIUS */}
      <Section title="04 — Radius" eyebrow="From hairline to pill">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5 lg:grid-cols-9">
          {(["xs", "sm", "DEFAULT", "md", "lg", "xl", "2xl", "3xl", "pill"] as const).map(
            (r) => (
              <div key={r} className="space-y-2 text-center">
                <div
                  className={cn(
                    "mx-auto aspect-square w-full bg-surface border border-border",
                    r === "DEFAULT" ? "rounded" : `rounded-${r}`
                  )}
                />
                <p className="font-mono text-eyebrow uppercase text-muted">
                  {r === "DEFAULT" ? "default" : r}
                </p>
              </div>
            )
          )}
        </div>
      </Section>

      {/* SHADOWS */}
      <Section title="05 — Shadow" eyebrow="Soft, layered, never harsh">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {(["xs", "sm", "DEFAULT", "md", "lg", "xl", "2xl", "glow"] as const).map((s) => (
            <div key={s} className="space-y-3 text-center">
              <div
                className={cn(
                  "mx-auto h-24 w-full rounded-xl bg-surface",
                  s === "DEFAULT" ? "shadow" : `shadow-${s}`
                )}
              />
              <p className="font-mono text-eyebrow uppercase text-muted">
                {s === "DEFAULT" ? "default" : s}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* SPACING */}
      <Section title="06 — Spacing" eyebrow="4px base · geometric scale">
        <div className="space-y-2">
          {([1, 2, 3, 4, 6, 8, 12, 16, 20, 24] as const).map((n) => (
            <div key={n} className="flex items-center gap-4">
              <span className="w-12 font-mono text-eyebrow uppercase text-subtle">
                {n}
              </span>
              <div
                className="h-3 rounded-sm bg-accent/80"
                style={{ width: `${n * 4}px` }}
              />
              <span className="text-body-sm text-muted">{n * 4}px</span>
            </div>
          ))}
        </div>
      </Section>

      {/* MOTION */}
      <Section title="07 — Motion" eyebrow="Hover any card to feel the curve">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "fast / smooth", cls: "duration-fast ease-smooth", note: "180ms · subtle UI changes" },
            { name: "default / smooth", cls: "duration ease-smooth", note: "280ms · most transitions" },
            { name: "slow / emphasized", cls: "duration-slow ease-emphasized", note: "420ms · card reveals" },
            { name: "slower / emphasized", cls: "duration-slower ease-emphasized", note: "640ms · section entrances" },
            { name: "slowest / decelerate", cls: "duration-slowest ease-decelerate", note: "960ms · ambient/hero" },
            { name: "spring", cls: "duration-slower ease-spring", note: "gentle bounce on lift" },
          ].map((m) => (
            <button
              key={m.name}
              type="button"
              className={cn(
                "group rounded-xl border border-border bg-surface p-5 text-left transition-transform",
                "hover:-translate-y-1 hover:shadow-lg",
                m.cls
              )}
            >
              <p className="font-mono text-eyebrow uppercase text-muted">{m.name}</p>
              <p className="mt-2 text-body-sm text-foreground">{m.note}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* GRADIENTS */}
      <Section title="08 — Gradients" eyebrow="Subtle ambience for hero, CTA, transitions">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="aspect-[3/2] rounded-xl border border-border halo-hero">
            <p className="p-4 font-mono text-eyebrow uppercase text-muted">hero-halo</p>
          </div>
          <div className="aspect-[3/2] rounded-xl border border-border fade-warm">
            <p className="p-4 font-mono text-eyebrow uppercase text-muted">warm-fade</p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border bg-surface">
            <div className="absolute inset-0 glow-cta" />
            <p className="relative p-4 font-mono text-eyebrow uppercase text-muted">cta-glow</p>
          </div>
        </div>
      </Section>

      {/* INTERACTION CARD PREVIEW (matches what we'll build in section 04 — Interaction Ladder) */}
      <Section title="09 — Component preview" eyebrow="Real interaction card, real tokens">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-6 shadow-md">
          <div className="flex items-center justify-between">
            <p className="font-medium text-body-lg text-ink">
              Magnesium + Levothyroxine
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-severity-monitor/10 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-severity-monitor" />
              <span className="text-eyebrow font-medium uppercase text-severity-monitor">
                Monitor
              </span>
            </span>
          </div>
          <p className="mt-3 text-body text-muted">
            May reduce absorption when taken together.
          </p>
          <div className="mt-5 border-t border-border pt-4">
            <p className="font-mono text-eyebrow uppercase text-subtle">
              Recommendation
            </p>
            <p className="mt-1 text-body text-foreground">
              Separate doses by at least 4 hours.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <p className="font-mono text-eyebrow uppercase text-subtle">Evidence</p>
            <p className="text-body-sm text-muted">Moderate</p>
          </div>
        </div>
      </Section>

      {/* APPROVAL FOOTER */}
      <section className="border-t border-border bg-surface-subtle">
        <div className="container mx-auto py-section-y-sm text-center">
          <p className="font-mono text-eyebrow uppercase text-muted">
            Awaiting design system approval
          </p>
          <h2 className="mt-3 font-serif text-display-sm italic text-ink">
            Approve the system, then we build sections.
          </h2>
          <p className="mt-4 text-body text-muted">
            Next up — Header (floating glass pill) and Hero with animated app UI loop.
          </p>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto py-section-y-sm">
        <div className="mb-10">
          <p className="font-mono text-eyebrow uppercase text-muted">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-display-sm italic text-ink">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Swatch({ name, cls, dark }: { name: string; cls: string; dark?: boolean }) {
  return (
    <div className="space-y-2">
      <div className={cn("aspect-square w-full rounded-lg", cls)} />
      <p className={cn("font-mono text-eyebrow uppercase", dark ? "text-muted" : "text-muted")}>
        {name}
      </p>
    </div>
  );
}

function TypeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-border pb-8 md:grid-cols-[160px_1fr] md:gap-8">
      <p className="font-mono text-eyebrow uppercase text-subtle">{label}</p>
      <div>{children}</div>
    </div>
  );
}
