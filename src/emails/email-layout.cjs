const { createElement } = require("react");
const {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Text,
} = require("@react-email/components");

const paragraphStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#3A3A3A",
  margin: "0 0 20px",
};

function EmailLayout({
  preview,
  heading,
  reason,
  unsubscribeUrl,
  unsubscribeLabel,
  preferenceLinks = [],
  children,
}) {
  return createElement(
    Html,
    { lang: "en" },
    createElement(Head),
    createElement(Preview, null, preview),
    createElement(
      Body,
      {
        style: {
          backgroundColor: "#FAF9F6",
          fontFamily: "Arial, Helvetica, sans-serif",
          margin: 0,
        },
      },
      createElement(
        Container,
        { style: { maxWidth: "560px", padding: "32px 24px", backgroundColor: "#FFFFFF" } },
        createElement(
          Row,
          { style: { marginBottom: "24px" } },
          createElement(
            Column,
            { width: "56", style: { verticalAlign: "middle" } },
            createElement(Img, {
              src: "https://pharmaguide.io/brand/logo-pulse.png",
              alt: "",
              width: "56",
              height: "56",
            })
          ),
          createElement(
            Column,
            { style: { paddingLeft: "12px", verticalAlign: "middle" } },
            createElement(
              Text,
              { style: { margin: 0, fontSize: "24px", fontWeight: 600, letterSpacing: "-0.3px", color: "#183B3F" } },
              "PharmaGuide"
            )
          )
        ),
        createElement(
          Heading,
          {
            style: {
              fontFamily: "Georgia, serif",
              fontSize: "28px",
              fontWeight: 400,
              color: "#183B3F",
            },
          },
          heading
        ),
        children,
        createElement(
          Text,
          { style: paragraphStyle },
          "Sean",
          createElement("br"),
          "Founder, PharmaGuide"
        ),
        createElement(
          Text,
          { style: { fontSize: "12px", lineHeight: "1.6", color: "#63666A", textAlign: "center" } },
          reason,
          " PharmaGuide provides information, not medical advice."
        ),
        createElement(
          Text,
          { style: { fontSize: "12px", lineHeight: "1.6", color: "#63666A", textAlign: "center" } },
          unsubscribeUrl
            ? createElement(
                Link,
                { href: unsubscribeUrl, style: { color: "#183B3F" } },
                unsubscribeLabel
              )
            : "For questions about email preferences, contact info@pharmaguide.io.",
          ...preferenceLinks.map(({ href, label }) =>
            createElement(
              "span",
              { key: href },
              createElement("br"),
              createElement(Link, { href, style: { color: "#183B3F" } }, label)
            )
          )
        ),
        createElement(
          Text,
          { style: { fontSize: "12px", color: "#63666A", textAlign: "center" } },
          "PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02114"
        )
      )
    )
  );
}

module.exports = { EmailLayout, paragraphStyle };
