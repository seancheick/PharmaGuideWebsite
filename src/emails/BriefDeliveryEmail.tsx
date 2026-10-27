import { Link, Text } from "@react-email/components";
import { EmailLayout, paragraphStyle } from "./EmailLayout";

interface BriefDeliveryEmailProps {
  email: string;
  betaUnsubscribeUrl?: string;
  newsletterUnsubscribeUrl?: string;
  betaEnrolled: boolean;
  newsletterEnrolled: boolean;
}

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
        Thanks for requesting the Supplement Safety Brief. It covers reading labels, spotting
        overlapping ingredients, and questions to bring to your pharmacist or clinician.
      </Text>
      <Text style={paragraphStyle}>
        <Link
          href="https://www.pharmaguide.io/supplement-safety-brief.pdf"
          style={{ color: "#183B3F" }}
        >
          Read your brief
        </Link>
      </Text>
      <Text style={paragraphStyle}>
        {betaEnrolled
          ? "You're also on the beta list, as described on the request form. I'll email when I can offer you a testing place. There's no confirmed access date yet."
          : "The brief is yours to read. I couldn't confirm an active beta subscription. If you want to check your status or change your email preferences, reply and let me know."}
      </Text>
      {newsletterEnrolled && (
        <Text style={paragraphStyle}>
          You&apos;re also subscribed to the monthly notes: about once a month, a useful article and
          a short product update. They&apos;re general updates, not personalized alerts about
          products you take.
        </Text>
      )}
      <Text style={paragraphStyle}>
        The brief is educational. It doesn&apos;t tell you whether a product is right for you. Bring
        questions about your medications and supplements to your pharmacist or clinician.
      </Text>
    </EmailLayout>
  );
}

export default BriefDeliveryEmail;
