import { Button, Section, Text } from "@react-email/components";
import { EmailLayout, paragraphStyle } from "./EmailLayout";

interface BetaWelcomeEmailProps {
  email: string;
  unsubscribeUrl: string;
  newsletterEnrolled?: boolean;
  newsletterUnsubscribeUrl?: string;
}

export function BetaWelcomeEmail({
  email,
  unsubscribeUrl,
  newsletterEnrolled = false,
  newsletterUnsubscribeUrl,
}: BetaWelcomeEmailProps) {
  return (
    <EmailLayout
      preview="You're on the list. What would you like to check?"
      heading="Thanks for joining."
      reason={`You joined the PharmaGuide beta list with ${email}.`}
      unsubscribeUrl={unsubscribeUrl}
      unsubscribeLabel="Unsubscribe from beta invitations and updates"
      preferenceLinks={newsletterEnrolled && newsletterUnsubscribeUrl
        ? [{ href: newsletterUnsubscribeUrl, label: "Unsubscribe from monthly notes" }]
        : []}
    >
      <Text style={paragraphStyle}>Hi, I&apos;m Sean, the founder of PharmaGuide.</Text>
      <Text style={paragraphStyle}>
        I&apos;m opening beta access in small groups. When I can offer you a place, I&apos;ll send
        an invitation to this address. Signing up doesn&apos;t give you app access yet.
      </Text>
      <Text style={paragraphStyle}>
        PharmaGuide helps you look up supplements and understand product information and interaction
        warnings. Coverage varies, and a missing warning doesn&apos;t mean a combination is safe.
      </Text>
      <Text style={paragraphStyle}>
        What would you most like PharmaGuide to help you understand? Reply with a topic, such as
        product quality, supplement interactions, or overlapping ingredients.
      </Text>
      <Text style={paragraphStyle}>
        Please keep it general. You don&apos;t need to send medication lists, medical records, or
        details about someone else&apos;s health. Your reply helps me choose what to test next.
      </Text>
      {newsletterEnrolled && (
        <Text style={paragraphStyle}>
          You&apos;re also signed up for our monthly notes: clear guides and useful PharmaGuide
          updates, about once a month. These are general updates, not personal product alerts.
        </Text>
      )}
      <Text style={paragraphStyle}>
        You may get a couple of short notes while you wait. There&apos;s nothing else you need to
        do, and I can&apos;t promise an access date yet.
      </Text>
      <Section style={{ textAlign: "center", margin: "8px 0 28px" }}>
        <Button href="https://pharmaguide.io/features" style={{ backgroundColor: "#FFFFFF", border: "1px solid #183B3F", color: "#183B3F", fontSize: "15px", fontWeight: 600, borderRadius: "999px", padding: "14px 24px", textDecoration: "none" }}>
          Explore PharmaGuide features
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default BetaWelcomeEmail;
