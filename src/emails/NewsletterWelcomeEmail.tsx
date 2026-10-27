import { Link, Text } from "@react-email/components";
import { EmailLayout, paragraphStyle } from "./EmailLayout";

interface NewsletterWelcomeEmailProps {
  email: string;
  unsubscribeUrl: string;
}

export function NewsletterWelcomeEmail({ email, unsubscribeUrl }: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout
      preview="A useful read and a short update, about once a month."
      heading="Welcome to the monthly notes."
      reason={`You subscribed to PharmaGuide's monthly notes with ${email}.`}
      unsubscribeUrl={unsubscribeUrl}
      unsubscribeLabel="Unsubscribe from monthly notes"
    >
      <Text style={paragraphStyle}>Hi, I&apos;m Sean, the founder of PharmaGuide.</Text>
      <Text style={paragraphStyle}>
        About once a month, I&apos;ll send a useful article, a short product update, and a question
        I&apos;d like your take on. If there&apos;s a relevant research or recall update, I may
        include that too.
      </Text>
      <Text style={paragraphStyle}>
        These are general updates. They aren&apos;t personalized alerts about products you take, and
        this subscription doesn&apos;t add you to the beta list.
      </Text>
      <Text style={paragraphStyle}>
        You can start with the{" "}
        <Link
          href="https://www.pharmaguide.io/blog?utm_source=resend&utm_medium=email&utm_campaign=newsletter-welcome"
          style={{ color: "#183B3F" }}
        >
          blog
        </Link>
        . If there&apos;s a topic you&apos;d like covered, reply and tell me. Please leave out
        medical records and personal health details.
      </Text>
    </EmailLayout>
  );
}

export default NewsletterWelcomeEmail;
