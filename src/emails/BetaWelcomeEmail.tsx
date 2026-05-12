import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

/**
 * Welcome email for the beta-waitlist signup (homepage FinalCTA).
 *
 * Design constraints (email is not the web):
 *   • System font stack only — custom Geist/Newsreader render
 *     unreliably across Gmail / Apple Mail / Outlook
 *   • Inline styles via Tailwind — Tailwind component injects
 *     them at render time, falls back gracefully
 *   • Single accent color (#183B3F deep teal) — same as the
 *     site so users feel a real continuity
 *   • Restrained: no images, no buttons that look like ads,
 *     no exclamation marks. Reads like a personal note.
 *
 */

interface BetaWelcomeEmailProps {
  email: string;
}

export function BetaWelcomeEmail({ email }: BetaWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re on the PharmaGuide beta list — opening in waves through 2026.</Preview>
      <Tailwind>
        <Body
          style={{
            backgroundColor: "#FAF9F6",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            style={{
              maxWidth: "560px",
              margin: "0 auto",
              padding: "48px 32px 56px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid #E5E2DB",
            }}
          >
            {/* Brand mark — centered animated pulse logo, no wordmark.
                The From-name and subject line have already told the
                recipient who this is; the logo just confirms it visually
                while breathing on its own. The GIF (1.92s loop) renders
                in Apple Mail / Gmail web + apps / Yahoo / Outlook.com.
                Outlook desktop renders the first frame, which is the
                settled brand mark — looks correct as a static stamp.
                border-radius makes it a disc where the client honors
                it; a clean square otherwise.

                Cache-bust via ?v=2 only when redeploying a NEW pulse
                asset (Gmail's image proxy caches aggressively). */}
            <Section style={{ marginBottom: "32px", textAlign: "center" }}>
              <Img
                src="https://www.pharmaguide.io/brand/logo-pulse.png"
                alt="PharmaGuide"
                width="72"
                height="72"
                style={{
                  display: "block",
                  margin: "0 auto",
                  border: "none",
                  borderRadius: "9999px",
                  outline: "none",
                  textDecoration: "none",
                }}
              />
            </Section>

            <Heading
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "32px",
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                color: "#111314",
                margin: "0 0 20px 0",
              }}
            >
              You&apos;re on the list.
            </Heading>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 16px 0",
              }}
            >
              We&apos;re opening the PharmaGuide beta in waves through 2026.
              When your wave opens, we&apos;ll email this address ({email}) with
              your invite.
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 28px 0",
              }}
            >
              In the meantime, you don&apos;t need to do anything. We&apos;re
              putting the finishing touches on the catalog, interaction logic,
              and clinical review process — cross-referencing products against
              sources like FDA, NIH, PubMed, and DSLD before launch.
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 8px 0",
              }}
            >
              A few things you can do while you wait:
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#3A3A3A",
                margin: "0 0 28px 0",
                paddingLeft: "4px",
              }}
            >
              · Read our{" "}
              <Link
                href="https://pharmaguide.io/faq"
                style={{ color: "#183B3F", textDecoration: "underline" }}
              >
                FAQ
              </Link>{" "}
              — covers privacy, evidence, and what we will and won&apos;t do
              <br />· Browse the{" "}
              <Link
                href="https://pharmaguide.io/blog"
                style={{ color: "#183B3F", textDecoration: "underline" }}
              >
                blog
              </Link>{" "}
              — evidence-based guides on interactions, ingredient quality,
              depletions, and FDA safety alerts
              <br />· Reply to this email if you have a specific question. A
              human reads every reply.
            </Text>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E2DB",
                margin: "32px 0 24px 0",
              }}
            />

            <Text
              style={{
                fontSize: "13px",
                lineHeight: 1.55,
                color: "#63666A",
                margin: "0 0 6px 0",
              }}
            >
              Calm clinical intelligence. No noise.
            </Text>

            <Text
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: "15px",
                color: "#111314",
                margin: 0,
              }}
            >
              — The PharmaGuide team
            </Text>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E2DB",
                margin: "32px 0 16px 0",
              }}
            />

            <Text
              style={{
                fontSize: "11px",
                lineHeight: 1.55,
                color: "#8E9196",
                margin: "0 0 10px 0",
              }}
            >
              You&apos;re receiving this because you joined the PharmaGuide
              beta waitlist at pharmaguide.io. PharmaGuide is not a substitute
              for medical care — always consult your healthcare provider for
              decisions about medications and supplements.{" "}
              <Link
                href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                style={{ color: "#63666A", textDecoration: "underline" }}
              >
                Unsubscribe
              </Link>
            </Text>

            <Text
              style={{
                fontSize: "11px",
                lineHeight: 1.55,
                color: "#8E9196",
                margin: 0,
              }}
            >
              PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default BetaWelcomeEmail;
