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
  Text,
} from "@react-email/components";

/**
 * Delivery email for the Supplement Safety Intelligence Brief
 * (the /checklist lead-magnet funnel).
 *
 * Same design constraints as the other templates: system font stack,
 * single accent (#183B3F deep teal), restrained personal-note tone,
 * no exclamation marks. The brief itself carries the
 * "Educational only, not medical advice" framing on every page;
 * this email just delivers it.
 */

const BRIEF_URL = "https://pharmaguide.io/supplement-safety-brief.pdf";

interface BriefDeliveryEmailProps {
  email: string;
}

export function BriefDeliveryEmail({ email }: BriefDeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your Supplement Safety Brief is here — 12 pharmacist-reviewed sections on labels, doses, and
        interactions.
      </Preview>
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
            Your brief is here.
          </Heading>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#3A3A3A",
              margin: "0 0 16px 0",
            }}
          >
            The Supplement Safety Intelligence Brief: twelve pharmacist-reviewed sections on reading
            labels, spotting hidden doses, checking interactions with your medications, and what the
            FDA keeps finding inside supplements. Built on primary research, written for real life.
          </Text>

          <Section style={{ margin: "28px 0", textAlign: "center" }}>
            <Link
              href={BRIEF_URL}
              style={{
                display: "inline-block",
                backgroundColor: "#183B3F",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
                padding: "14px 32px",
                borderRadius: "9999px",
                textDecoration: "none",
              }}
            >
              Read the brief
            </Link>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#63666A",
              margin: "0 0 16px 0",
            }}
          >
            It opens right in your browser — no download needed. Screenshot the eight-checks page
            before your next store run.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#3A3A3A",
              margin: "0 0 28px 0",
            }}
          >
            You&apos;re also on the PharmaGuide beta list now. When your wave opens, we&apos;ll
            email this address ({email}) with your invite — the app runs every check in this brief
            automatically, against your medications and conditions.
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
            You&apos;re receiving this because you requested the Supplement Safety Brief at
            pharmaguide.io. The brief is educational and was reviewed by Laurie Pham, PharmD — it is
            not a substitute for medical care. Always consult your healthcare provider for decisions
            about medications and supplements.{" "}
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
    </Html>
  );
}

export default BriefDeliveryEmail;
