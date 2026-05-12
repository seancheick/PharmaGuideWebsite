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
 * Welcome email for the newsletter signup (/faq NewsletterCTA).
 *
 * Different intent from the beta welcome — this user is signing up
 * to STAY INFORMED, not to use the product. Tone shifts:
 *   • "Welcome to the loop" instead of "You're on the list"
 *   • Sets expectations on cadence (roughly monthly)
 *   • Previews what the dispatch will contain
 *   • Includes an unsubscribe stub (Resend handles automatically
 *     via List-Unsubscribe header — no manual link needed in body)
 *
 * Same brand mark + typography rhythm as the beta email — they're
 * sister templates that should feel like the same system.
 */

interface NewsletterWelcomeEmailProps {
  email: string;
}

export function NewsletterWelcomeEmail({ email }: NewsletterWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to PharmaGuide — first dispatch on the way.</Preview>
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
            {/* Brand mark — centered animated pulse logo. See
                BetaWelcomeEmail for the full email-client compatibility
                rationale. Outlook desktop shows the first frame, which
                IS the settled brand stamp; everything else animates. */}
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
              Welcome to the loop.
            </Heading>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 24px 0",
              }}
            >
              You&apos;re subscribed at {email}. The first dispatch arrives in
              the next few weeks — short, focused, and useful.
            </Text>

            <Text
              style={{
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 8px 0",
              }}
            >
              What you&apos;ll get, roughly monthly:
            </Text>

            <Section
              style={{
                margin: "0 0 28px 0",
                paddingLeft: "4px",
              }}
            >
              <Text
                style={{
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#3A3A3A",
                  margin: 0,
                }}
              >
                · Recent supplement and medication research, distilled
                <br />· Recall and safety alerts that affect what you actually
                take
                <br />· One quick-read article on something that matters in
                consumer health
                <br />· No marketing. No noise. No partnerships in disguise.
              </Text>
            </Section>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E2DB",
                margin: "32px 0 24px 0",
              }}
            />

            <Text
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 12px 0",
              }}
            >
              While the first dispatch comes together, the{" "}
              <Link
                href="https://pharmaguide.io/blog"
                style={{
                  color: "#183B3F",
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                blog
              </Link>{" "}
              already has guides on interactions, ingredient spotlights, news,
              and safety alerts.
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
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#3A3A3A",
                margin: "0 0 12px 0",
              }}
            >
              Want to be among the first to use PharmaGuide when it ships?
              Join the beta waitlist:
            </Text>

            <Text
              style={{
                fontSize: "14px",
                lineHeight: 1.6,
                margin: "0 0 28px 0",
              }}
            >
              <Link
                href="https://pharmaguide.io/#waitlist"
                style={{
                  color: "#183B3F",
                  textDecoration: "underline",
                  fontWeight: 500,
                }}
              >
                Join the beta →
              </Link>
            </Text>

            <Hr
              style={{
                border: "none",
                borderTop: "1px solid #E5E2DB",
                margin: "0 0 24px 0",
              }}
            />

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
              You&apos;re receiving this because you signed up for the
              PharmaGuide newsletter at pharmaguide.io.{" "}
              <Link
                href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                style={{ color: "#63666A", textDecoration: "underline" }}
              >
                Unsubscribe
              </Link>{" "}
              anytime — one click, no questions asked.
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

export default NewsletterWelcomeEmail;
