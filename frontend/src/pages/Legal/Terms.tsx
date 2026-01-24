import React from "react";
import { Box, Container, Heading, Text, VStack, HStack, Badge, Link, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import SpotlightCard from "../../components/SpotlightCard";
import pdfMake from "../../pdf/pdfMake";
import logo from "./text-logo.png";

const GOLD = "#65a8bf";

export default function Terms() {
  const { t, i18n } = useTranslation("translation") as any; // ensure correct ns
  const isRTL = i18n?.language?.startsWith("ar");

  const Section: React.FC<{ title: string; k?: string; children: React.ReactNode }> = ({
    title,
    k,
    children,
  }) => (
    <Box
      id={k}
    >
      <Heading size="md" mb={3} color={GOLD}>
        {title}
      </Heading>
      <VStack align="stretch" gap={3}>
        {children}
      </VStack>
    </Box>
  );

  const loadImageAsDataUrl = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });

  const handleGeneratePdf = async () => {
  // convert imported logo to data URL for pdfMake
  const logoDataUrl = await loadImageAsDataUrl(logo);

  const header = (txt: string) => ({
    text: txt,
    style: "header",
    margin: [0, 12, 0, 6],
  });

  const section = (txt: string) => ({
    text: txt,
    style: "subheader",
    margin: [0, 10, 0, 4],
  });

  const p = (txt: string) => ({
    text: txt,
    style: "paragraph",
    margin: [0, 2, 0, 2],
  });

  const bulletBlock = (items: string[]) => ({
    ul: items.filter(Boolean),
    style: "list",
  });

  const doc: any = {
    pageSize: "A4",
    pageMargins: [40, 50, 40, 60],

    // 🔲 BLACK BACKGROUND + CORNER DECORATIONS
    background: (_currentPage: number, _pageSize: { width: number; height: number }) => ({
      canvas: [
        // full black background
        {
          type: "rect",
          x: 0,
          y: 0,
          w: _pageSize.width,
          h: _pageSize.height,
          color: "#000000",
        },

        // top-left corner accents
        { type: "rect", x: 30, y: 30, w: 80, h: 2, color: GOLD },
        { type: "rect", x: 30, y: 30, w: 2, h: 80, color: GOLD },

        // top-right corner accents
        { type: "rect", x: _pageSize.width - 110, y: 30, w: 80, h: 2, color: GOLD },
        { type: "rect", x: _pageSize.width - 32, y: 30, w: 2, h: 80, color: GOLD },

        // bottom-left corner accents
        {
          type: "rect",
          x: 30,
          y: _pageSize.height - 32,
          w: 80,
          h: 2,
          color: GOLD,
        },
        {
          type: "rect",
          x: 30,
          y: _pageSize.height - 110,
          w: 2,
          h: 80,
          color: GOLD,
        },

        // bottom-right corner accents
        {
          type: "rect",
          x: _pageSize.width - 110,
          y: _pageSize.height - 32,
          w: 80,
          h: 2,
          color: GOLD,
        },
        {
          type: "rect",
          x: _pageSize.width - 32,
          y: _pageSize.height - 110,
          w: 2,
          h: 80,
          color: GOLD,
        },
      ],
    }),

    // 🖼️ IMAGES
    images: {
      logo: logoDataUrl,
    },

    content: [
      // TITLE
      header(t("legal.privacy_refund.title") || "Privacy, Terms & Refund Policy"),
      {
        text:
          (t("legal.common.last_updated") || "Last updated") +
          ": " +
          (t("legal.privacy_refund.last_updated") || "Oct 8, 2025"),
        style: "meta",
        margin: [0, 0, 0, 12],
      },
      p(
        t("legal.privacy_refund.intro") ||
          "This policy explains how we handle your data and how refunds work for our educational products and subscriptions focused on forex and crypto trading."
      ),

      // SCOPE
      section(t("legal.privacy_refund.scope.title") || "Scope"),
      p(t("legal.privacy_refund.scope.p1") || ""),
      p(t("legal.privacy_refund.scope.p2") || ""),

      // PAYMENTS
      section(t("legal.privacy_refund.payments.title") || "Payments & Pricing (USDT Only)"),
      p(t("legal.privacy_refund.payments.p1") || ""),
      bulletBlock([
        t("legal.privacy_refund.payments.li1") ||
          "Prices may be displayed in your local currency for convenience, but settlement is in USDT.",
        t("legal.privacy_refund.payments.li2") ||
          "Network fees and on-chain confirmation times are outside our control.",
        t("legal.privacy_refund.payments.li3") ||
          "You are responsible for sending the exact amount to the correct chain address. Mis-sent funds may be irrecoverable.",
      ]),
      p("* " + (t("legal.privacy_refund.payments.note_text") || "Payment confirmations occur after sufficient on-chain confirmations.")),

      // REFUND POLICY
      section(t("legal.refund.title") || "Refund Policy"),
      p(
        t("legal.refund.p1") ||
          "If you’re not satisfied within 7 days of purchase, contact support for a full refund (terms apply)."
      ),
      bulletBlock([
        t("legal.refund.eligibility") ||
          "Eligibility: first-time purchase of a given product/tier, and meaningful usage under fair-use limits.",
        t("legal.refund.exclusions") ||
          "Exclusions: content scraping/sharing, downloading a substantial portion of materials, account sharing, or policy abuse.",
        t("legal.refund.digital") ||
          "Because access is digital, refunds may be prorated or denied if significant content has been consumed.",
        t("legal.refund.method") ||
          "Refunds are issued in USDT to the original network used for payment. Network fees are non-refundable.",
        t("legal.refund.timeline") ||
          "Processing time: up to 10 business days after approval, excluding on-chain network delays.",
      ]),
      p(
        (t("legal.refund.process") ||
          "To initiate a refund, email support with your order ID, wallet address, and reason.") +
          " " +
          (t("legal.common.support_email") || "support@promrkts.com")
      ),

      // ACCESS & CANCELLATIONS
      section(t("legal.privacy_refund.access.title") || "Access, Renewals & Cancellations"),
      bulletBlock([
        t("legal.privacy_refund.access.li1") ||
          "Access to digital content is personal and non-transferable.",
        t("legal.privacy_refund.access.li2") ||
          "Subscriptions renew automatically unless cancelled before the next billing date.",
        t("legal.privacy_refund.access.li3") ||
          "Cancellation stops future charges; it does not retroactively refund prior periods.",
      ]),

      // CHARGEBACKS
      section(t("legal.privacy_refund.chargebacks.title") || "Chargebacks & Disputes"),
      p(
        t("legal.privacy_refund.chargebacks.p1") ||
          "Please contact us first to resolve billing or access issues. Unauthorized disputes may result in account suspension."
      ),

      // PRIVACY DATA
      section(t("legal.privacy.data.title") || "Privacy: Data We Collect"),
      bulletBlock([
        t("legal.privacy.data.account") ||
          "Account data: name, email, and login identifiers.",
        t("legal.privacy.data.billing") ||
          "Billing metadata: transaction IDs, wallet address, and plan details (no private keys are ever collected).",
        t("legal.privacy.data.usage") ||
          "Usage analytics: page views, progress, device information, and approximate location (for fraud prevention and product improvement).",
      ]),

      // USE OF DATA
      section(t("legal.privacy.use.title") || "How We Use Your Data"),
      bulletBlock([
        t("legal.privacy.use.provide") ||
          "To provide and improve course content, track progress, and deliver support.",
        t("legal.privacy.use.security") ||
          "To protect against fraud, abuse, and unauthorized sharing.",
        t("legal.privacy.use.comms") ||
          "To send essential service emails. You can opt out of non-essential marketing messages.",
      ]),

      // COOKIES
      section(
        t("legal.privacy.cookies.title") || "Cookies, Analytics & Third-Party Services"
      ),
      p(
        t("legal.privacy.cookies.p1") ||
          "We use cookies and similar technologies for authentication, preferences, and analytics. Some third-party providers may process limited personal data according to their own policies."
      ),

      // SECURITY & RETENTION
      section(t("legal.privacy.security.title") || "Data Retention & Security"),
      bulletBlock([
        t("legal.privacy.security.retention") ||
          "We retain data only as long as necessary for the purposes described or as required by law.",
        t("legal.privacy.security.measures") ||
          "We apply technical and organizational safeguards, but no method is 100% secure.",
      ]),

      // RIGHTS
      section(t("legal.privacy.rights.title") || "Your Rights"),
      p(
        t("legal.privacy.rights.p1") ||
          "Subject to local laws, you may request access, correction, deletion, or portability of your data. We may ask for verification before fulfilling requests."
      ),

      // EXTRA LEGAL PROTECTION
      section("Additional Legal & Liability Clauses"),
      p(
        "All content is strictly educational. Nothing provided constitutes financial, trading, or investment advice. You acknowledge that trading forex, crypto, and derivatives involves significant risk of loss."
      ),
      p(
        "We do not guarantee profits, income, performance, or trading results. Past results do not indicate future outcomes."
      ),
      p(
        "We are not liable for losses including financial loss, lost profits, lost opportunities, damages caused by trading decisions, or misuse of educational material."
      ),
      p(
        "You are solely responsible for your trading decisions, wallet security, and correct handling of crypto transactions."
      ),
      p(
        "All videos, templates, PDFs, and course materials are copyrighted. Redistribution, scraping, reselling, or sharing is strictly prohibited."
      ),
      p(
        "Accounts may be suspended for sharing access, downloading content in bulk, or violating fair-use policies."
      ),
      p(
        "These terms are governed under international digital commerce standards and applicable local laws."
      ),
      p("If any section is found unenforceable, the rest of the policy remains valid."),

      // CONTACT
      section(t("legal.common.contact") || "Contact"),
      p(
        (t("legal.common.contact_text") ||
          "For privacy questions or refund requests, reach us at ") +
          (t("legal.common.support_email") || "support@promrkts.com")
      ),

      // BOTTOM LOGO
      {
        image: "logo",
        width: 120,
        alignment: "right",
        margin: [0, 40, 0, 0],
      },

      {
        text: "--- End of Document ---",
        style: "meta",
        alignment: "center",
        margin: [0, 20, 0, 0],
      },
    ],

    styles: {
      header: {
        fontSize: 20,
        bold: true,
        color: GOLD,
        alignment: "center", // 🔵 centered headings
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: GOLD,
        alignment: "center", // 🔵 centered section titles
      },
      paragraph: {
        fontSize: 11,
        color: "#b7dbff",
        alignment: isRTL ? "right" : "left",
      },
      list: {
        fontSize: 11,
        color: "#b7dbff",
        margin: [0, 2, 0, 6],
      },
      listItem: {
        fontSize: 11,
        color: "#b7dbff",
      },
      meta: {
        fontSize: 9,
        color: "#7fa6c7",
      },
    },

    defaultStyle: {
      color: "#b7dbff", // 🔵 base text color
      alignment: isRTL ? "right" : "left",
    },
  };

  pdfMake.createPdf(doc).download("promrkts-Policy.pdf");
};

  return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="5xl">
        <VStack align="stretch" gap={6}>
          {/* Header */}
          <VStack align="stretch" gap={2}>
            <HStack justify="center" flexWrap="wrap" gap={2}>
              <Heading size="lg">{t("legal.terms.title", "Terms & Conditions")}</Heading>
            </HStack>
              <HStack justify="center" flexWrap="wrap" gap={2}>
              <Badge color="#65a8bf"  fontSize="10px">
                {t("legal.common.last_updated") || "Last updated"}:{" "}
                {t("legal.privacy_refund.last_updated") || "December 18th, 2025"}
              </Badge>
            </HStack>
            <Text color="text.muted">
              {t(
                "legal.terms.intro",
                "By using this platform, enrolling in our courses, or purchasing digital content, you agree to these terms and conditions. Please read them carefully before proceeding."
              )}
            </Text>
          </VStack>

          {/* Scope */}
          <SpotlightCard>
            <Section title={t("legal.terms.scope.title", "Scope")} k="scope">
              <Text color="text.muted">
                {t(
                  "legal.terms.scope.p1",
                  "These terms govern your use of our educational services, courses, subscriptions, and community access focused on forex and crypto trading education."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.scope.p2",
                  "All content provided is for educational purposes only and does not constitute financial or investment advice."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Use of Content */}
          <SpotlightCard>
            <Section
              title={t("legal.terms.use.title", "Use of Content & Intellectual Property")}
              k="use"
            >
              <Text color="text.muted">
                {t(
                  "legal.terms.use.p1",
                  "You are granted a personal, non-transferable, limited license to access and use our educational materials. You may not share, resell, distribute, or publicly display our content without written permission."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.use.p2",
                  "All course videos, PDFs, and templates are copyrighted material. Unauthorized use may result in account termination and legal action."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* User Conduct */}
          <SpotlightCard>
            <Section title={t("legal.terms.conduct.title", "User Conduct")} k="conduct">
              <Text color="text.muted">
                {t(
                  "legal.terms.conduct.p1",
                  "You agree not to misuse the platform, engage in fraudulent activity, share your account, or attempt to gain unauthorized access to our systems."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.conduct.p2",
                  "We reserve the right to suspend or terminate accounts involved in content piracy, abusive behavior, or any activity that compromises platform integrity."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Payments & Refunds */}
          <SpotlightCard>
            <Section title={t("legal.terms.payments.title", "Payments & Refunds")} k="payments">
              <Text color="text.muted">
                {t(
                  "legal.terms.payments.p1",
                  "All payments are processed exclusively in USDT. Please review our Refund Policy for detailed terms on eligibility and processing times."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.payments.p2",
                  "You are responsible for verifying payment addresses and network selection before sending crypto transactions."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Risk Disclosure */}
          <SpotlightCard>
            <Section
              title={t("legal.terms.disclaimer.title", "Risk Disclosure & Educational Purpose")}
              k="disclaimer"
            >
              <Text color="text.muted">
                {t(
                  "legal.terms.disclaimer.p1",
                  "Trading forex, cryptocurrencies, and financial markets involves significant risk. Past performance does not guarantee future results."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.disclaimer.p2",
                  "Our courses, templates, and examples are purely educational and do not constitute financial advice, trading recommendations, or investment guidance."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.disclaimer.p3",
                  "You acknowledge that you are solely responsible for any trading decisions made based on information from our materials."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Liability */}
          <SpotlightCard>
            <Section
              title={t("legal.terms.liability.title", "Limitation of Liability")}
              k="liability"
            >
              <Text color="text.muted">
                {t(
                  "legal.terms.liability.p1",
                  "We are not liable for any losses, damages, or claims arising from your use of our platform or the application of our educational content."
                )}
              </Text>
              <Text color="text.muted">
                {t(
                  "legal.terms.liability.p2",
                  "All information is provided 'as is' without warranties of accuracy, completeness, or fitness for purpose."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Modifications */}
          <SpotlightCard>
            <Section
              title={t("legal.terms.modifications.title", "Changes to Terms")}
              k="modifications"
            >
              <Text color="text.muted">
                {t(
                  "legal.terms.modifications.p1",
                  "We may update these terms periodically to reflect new features, laws, or business practices. Continued use after updates implies acceptance."
                )}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Contact */}
          <SpotlightCard>
            <Section title={t("legal.common.contact", "Contact")} k="contact">
              <Text color="text.muted">
                {t("legal.common.contact_text", "For legal inquiries, please contact us at ")}
                <Link
                  href={`mailto:${t("legal.common.support_email", "support@example.com")}`}
                  color={GOLD}
                >
                  {t("legal.common.support_email", "support@example.com")}
                </Link>
                .
              </Text>
            </Section>
          </SpotlightCard>

          {/* Final Disclaimer */}
          <Text color={GOLD} fontSize="sm" textAlign="center" opacity={0.8}>
            {t(
              "legal.common.disclaimer",
              "Trading involves substantial risk and may result in loss of capital. Our content is educational and not a guarantee of results."
            )}
          </Text>
          <HStack justify="center" mb={4}>
            <Button
              bg={GOLD}
              onClick={handleGeneratePdf}
            >
              {t("legal.common.download_pdf") || "Download Full Policy PDF"}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
