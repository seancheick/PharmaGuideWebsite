import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE } from "./seo";
import { CATALOG_SIZE } from "./site";

/**
 * Share-card renderer — the one design behind every og:image and
 * twitter:image on the site (pages via /og/page/[key], articles via
 * /og/post/[slug]).
 *
 * Set in the site's own typefaces (Geist, Geist Mono, Newsreader italic,
 * vendored in /assets/fonts because satori can't read woff2) and the
 * light-theme palette from globals.css, so a card in a feed reads as the
 * same object as the page it opens.
 */

const PALETTE = {
  background: "#FAF9F6",
  ink: "#111314",
  muted: "#63666A",
  hairline: "#E5E2DB",
  border: "#D1CDC4",
  accent: "#183B3F",
} as const;

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");

type Font = { name: string; data: Buffer; weight: 400 | 500; style: "normal" | "italic" };

let fontCache: Font[] | undefined;

function fonts(): Font[] {
  fontCache ??= [
    { name: "Geist", data: fs.readFileSync(path.join(FONT_DIR, "Geist-Medium.ttf")), weight: 500, style: "normal" },
    { name: "Geist Mono", data: fs.readFileSync(path.join(FONT_DIR, "GeistMono-Medium.ttf")), weight: 500, style: "normal" },
    { name: "Newsreader", data: fs.readFileSync(path.join(FONT_DIR, "Newsreader-Italic.woff")), weight: 400, style: "italic" },
  ];
  return fontCache;
}

export interface OgCard {
  eyebrow: string;
  headline: string;
  /** Italic serif line in the brand accent — the site's signature rhythm. */
  accent?: string;
  /** Mono caps line bottom-left. */
  footnote?: string;
}

/** Long article titles step down so they never exceed three lines. */
function headlineSize(chars: number): number {
  if (chars <= 34) return 76;
  if (chars <= 52) return 66;
  if (chars <= 72) return 58;
  return 50;
}

export const DEFAULT_FOOTNOTE = `${CATALOG_SIZE} products · Evidence-graded · Clinician-informed`;

export function renderOgCard(card: OgCard): ImageResponse {
  const size = headlineSize(card.headline.length + (card.accent?.length ?? 0));

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "64px 80px 60px",
          backgroundColor: PALETTE.background,
          // Ambient light painted on the canvas itself — positioned halo
          // boxes left visible seams at their edges in satori.
          backgroundImage:
            "radial-gradient(circle at 88% 8%, rgba(24,59,63,0.10), rgba(24,59,63,0) 42%), radial-gradient(circle at 0% 100%, rgba(209,205,196,0.55), rgba(209,205,196,0) 38%)",
          fontFamily: "Geist",
          position: "relative",
        }}
      >
        {/* Masthead */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 9999, backgroundColor: PALETTE.accent }} />
            <span style={{ fontSize: 30, color: PALETTE.ink, letterSpacing: "-0.015em" }}>PharmaGuide</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 9999,
              border: `1.5px solid ${PALETTE.border}`,
              backgroundColor: "rgba(255,255,255,0.6)",
              fontFamily: "Geist Mono",
              fontSize: 17,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: PALETTE.accent,
            }}
          >
            {card.eyebrow}
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: size,
              lineHeight: 1.06,
              textWrap: "balance",
              letterSpacing: "-0.028em",
              color: PALETTE.ink,
            }}
          >
            {card.headline}
          </div>
          {card.accent ? (
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontFamily: "Newsreader",
                fontStyle: "italic",
                fontSize: Math.round(size * 1.04),
                lineHeight: 1.08,
                textWrap: "balance",
                letterSpacing: "-0.012em",
                color: PALETTE.accent,
              }}
            >
              {card.accent}
            </div>
          ) : null}
        </div>

        {/* Colophon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 26,
            borderTop: `1.5px solid ${PALETTE.hairline}`,
          }}
        >
          <span
            style={{
              fontFamily: "Geist Mono",
              fontSize: 16,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: PALETTE.muted,
            }}
          >
            {card.footnote ?? DEFAULT_FOOTNOTE}
          </span>
          <span style={{ fontSize: 20, color: PALETTE.ink, letterSpacing: "-0.01em" }}>pharmaguide.io</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts() }
  );
}

/**
 * "Statins and CoQ10: what the research actually shows" →
 * headline "Statins and CoQ10:" + accent "what the research actually shows".
 */
export function splitTitle(title: string): Pick<OgCard, "headline" | "accent"> {
  const i = title.indexOf(": ");
  if (i > 0 && i < title.length - 2) {
    return { headline: title.slice(0, i + 1), accent: title.slice(i + 2) };
  }
  return { headline: title };
}
