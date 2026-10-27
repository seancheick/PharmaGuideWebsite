import { Button, Column, Img, Link, Row, Section, Text } from "@react-email/components";
import { EmailLayout, paragraphStyle } from "./EmailLayout";

interface BriefDeliveryEmailProps {
  email: string;
  betaUnsubscribeUrl?: string;
  newsletterUnsubscribeUrl?: string;
  betaEnrolled: boolean;
  newsletterEnrolled: boolean;
}

const BRIEF_URL = "https://pharmaguide.io/supplement-safety-brief.pdf";
// JPEG, not WebP: Outlook and some older clients don't render WebP.
// Re-render from page 1 of the PDF whenever the brief changes.
const COVER_URL = "https://pharmaguide.io/images/brief-cover-email.jpg";

export function BriefDeliveryEmail({
  email,
  betaUnsubscribeUrl,
  newsletterUnsubscribeUrl,
  betaEnrolled,
  newsletterEnrolled,
}: BriefDeliveryEmailProps) {
  return (
    <EmailLayout
      preview="Your guide to supplement labels, doses, and interactions."
      heading="Here's your brief."
      reason={`You requested the Supplement Safety Brief with ${email}.`}
      unsubscribeUrl={betaUnsubscribeUrl}
      unsubscribeLabel="Unsubscribe from beta invitations and updates"
      preferenceLinks={
        newsletterUnsubscribeUrl
          ? [{ href: newsletterUnsubscribeUrl, label: "Unsubscribe from monthly notes" }]
          : []
      }
    >
      <Text style={paragraphStyle}>
        Thanks for requesting the Supplement Safety Brief. Save it, print the worksheet, and bring
        it to your next pharmacy visit.
      </Text>

      {/* Download card: the cover tells people at a glance it's a file to open. */}
      <Section
        style={{
          margin: "0 0 28px",
          padding: "20px",
          backgroundColor: "#FAF9F6",
          border: "1px solid #E5E2DB",
          borderRadius: "16px",
        }}
      >
        <Row>
          <Column width="112" style={{ width: "112px", verticalAlign: "top" }}>
            <Link href={BRIEF_URL}>
              <Img
                src={COVER_URL}
                alt="Cover of the PharmaGuide Supplement Safety Brief"
                width="112"
                height="145"
                style={{ display: "block", borderRadius: "6px", border: "1px solid #E5E2DB" }}
              />
            </Link>
          </Column>
          <Column style={{ paddingLeft: "20px", verticalAlign: "top" }}>
            <Text
              style={{
                margin: "0 0 6px",
                fontSize: "11px",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: "#63666A",
              }}
            >
              PDF · 19 pages · Free
            </Text>
            <Text
              style={{
                margin: "0 0 6px",
                fontFamily: "Georgia, serif",
                fontSize: "20px",
                lineHeight: "1.25",
                color: "#183B3F",
              }}
            >
              Supplement Safety Brief
            </Text>
            <Text
              style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.5", color: "#3A3A3A" }}
            >
              Labels, doses, common interactions, and an eight-check shopping list.
            </Text>
            <Button
              href={BRIEF_URL}
              style={{
                backgroundColor: "#183B3F",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "999px",
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              Get your brief
            </Button>
          </Column>
        </Row>
      </Section>

      {newsletterEnrolled && (
        <Text style={paragraphStyle}>
          You&apos;re also subscribed to the monthly notes: about once a month, a useful article and
          a short product update. They&apos;re general updates, not personalized alerts about
          products you take.
        </Text>
      )}
      <Text style={paragraphStyle}>
        {betaEnrolled
          ? "You're on the beta list too, as described on the request form. I'll email when I can offer you a testing place. There's no confirmed access date yet."
          : "I couldn't confirm an active beta subscription for this address. If you'd like to check your status or change your email preferences, reply and let me know."}
      </Text>
      <Text style={paragraphStyle}>
        The brief is educational. It doesn&apos;t tell you whether a product is right for you. Bring
        questions about your medications and supplements to your pharmacist or clinician.
      </Text>
    </EmailLayout>
  );
}

export default BriefDeliveryEmail;
