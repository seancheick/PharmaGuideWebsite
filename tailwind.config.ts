import type { Config } from "tailwindcss";

/**
 * Tailwind config — sourced entirely from CSS variables defined in
 * src/app/globals.css under `:root`. This means every value used in
 * Tailwind utilities is a design token, not a hardcoded number.
 *
 * Rule: never add raw hex / px values here. Add a token first.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "var(--container-padding)",
        sm: "var(--container-padding-sm)",
        lg: "var(--container-padding-lg)",
      },
      // Tailwind's container plugin requires each Tailwind breakpoint name
      // declared explicitly — otherwise no max-width applies between them.
      // We cap at --container-max (1280px) at every breakpoint, so the
      // container is consistently 1200px wide centered with proper margins
      // on any viewport ≥ sm.
      // Hard px values — CSS variables don't resolve at Tailwind build time.
      // 1200px matches --container-max in globals.css.
      screens: {
        sm: "1200px",
        md: "1200px",
        lg: "1200px",
        xl: "1200px",
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Surfaces
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
          subtle: "rgb(var(--color-surface-subtle) / <alpha-value>)",
        },
        // Foreground variants
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        // Brand
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
          strong: "rgb(var(--color-accent-strong) / <alpha-value>)",
        },
        // Link — brighter teal for inline text links so they don't
        // read as near-black body text. CTA buttons keep `bg-accent`.
        link: {
          DEFAULT: "rgb(var(--color-link) / <alpha-value>)",
          strong: "rgb(var(--color-link-strong) / <alpha-value>)",
        },
        // Border
        border: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          strong: "rgb(var(--color-border-strong) / <alpha-value>)",
        },
        // Severity (5-tier)
        severity: {
          contraindicated: "rgb(var(--color-severity-contraindicated) / <alpha-value>)",
          avoid: "rgb(var(--color-severity-avoid) / <alpha-value>)",
          caution: "rgb(var(--color-severity-caution) / <alpha-value>)",
          monitor: "rgb(var(--color-severity-monitor) / <alpha-value>)",
          safe: "rgb(var(--color-severity-safe) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo"],
      },
      fontSize: {
        // Display scale
        "display-xl": ["var(--fs-display-xl)", { lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", fontWeight: "var(--fw-display)" }],
        "display-lg": ["var(--fs-display-lg)", { lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", fontWeight: "var(--fw-display)" }],
        "display-md": ["var(--fs-display-md)", { lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-display)", fontWeight: "var(--fw-display)" }],
        "display-sm": ["var(--fs-display-sm)", { lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-display)", fontWeight: "var(--fw-display)" }],
        // Headline
        "h1": ["var(--fs-h1)", { lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-tight)" }],
        "h2": ["var(--fs-h2)", { lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-tight)" }],
        "h3": ["var(--fs-h3)", { lineHeight: "var(--lh-snug)" }],
        "h4": ["var(--fs-h4)", { lineHeight: "var(--lh-snug)" }],
        // Body
        "body-xl": ["var(--fs-body-xl)", { lineHeight: "var(--lh-relaxed)" }],
        "body-lg": ["var(--fs-body-lg)", { lineHeight: "var(--lh-relaxed)" }],
        "body": ["var(--fs-body)", { lineHeight: "var(--lh-normal)" }],
        "body-sm": ["var(--fs-body-sm)", { lineHeight: "var(--lh-normal)" }],
        // Micro
        "micro": ["var(--fs-micro)", { lineHeight: "var(--lh-normal)", letterSpacing: "var(--ls-wide)" }],
        "eyebrow": ["var(--fs-eyebrow)", { lineHeight: "var(--lh-normal)", letterSpacing: "var(--ls-eyebrow)", fontWeight: "var(--fw-medium)" }],
        // Tinier scales (11px / 10px) — replace dozens of arbitrary
        // text-[11px]/text-[10.5px]/text-[10px] literals with named
        // tokens. tracking + medium weight baked in for caps usage.
        "nano": ["var(--fs-nano)", { lineHeight: "var(--lh-normal)", letterSpacing: "var(--ls-eyebrow)", fontWeight: "var(--fw-medium)" }],
        "overline": ["var(--fs-overline)", { lineHeight: "var(--lh-normal)", letterSpacing: "var(--ls-eyebrow)", fontWeight: "var(--fw-medium)" }],
      },
      spacing: {
        // Section padding tokens
        "section-y": "var(--section-y)",
        "section-y-sm": "var(--section-y-sm)",
        "gutter": "var(--gutter)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        glow: "var(--shadow-glow)",
      },
      transitionTimingFunction: {
        // Premium motion curves
        smooth: "var(--ease-smooth)",
        emphasized: "var(--ease-emphasized)",
        decelerate: "var(--ease-decelerate)",
        spring: "var(--ease-spring)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
        slowest: "var(--duration-slowest)",
      },
      backdropBlur: {
        xs: "var(--blur-xs)",
        sm: "var(--blur-sm)",
        DEFAULT: "var(--blur)",
        md: "var(--blur-md)",
        lg: "var(--blur-lg)",
        xl: "var(--blur-xl)",
      },
      outlineColor: {
        accent: "rgb(var(--color-accent))",
      },
      maxWidth: {
        prose: "var(--prose-max)",
        container: "var(--container-max)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "cursor-blink": {
          "0%, 50%": { opacity: "1" },
          "50.01%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up var(--duration-slower) var(--ease-emphasized) both",
        "fade-in": "fade-in var(--duration-slow) var(--ease-smooth) both",
        "scale-in": "scale-in var(--duration-slower) var(--ease-emphasized) both",
        "cursor-blink": "cursor-blink 1s infinite step-end",
      },
    },
  },
  plugins: [],
};

export default config;
