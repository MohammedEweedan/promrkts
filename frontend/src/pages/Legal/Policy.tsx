/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Box, Container, Heading, Text, VStack, HStack, Link, Badge, Code } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "../../themeProvider";
import SpotlightCard from "../../components/SpotlightCard";
import pdfMake from "../../pdf/pdfMake";
import logo from "../Legal/text-logo.png";
import { Button } from "@chakra-ui/react";

const GOLD = "#65a8bf";

export default function PrivacyRefundPolicy() {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");
  const { mode } = useThemeMode();

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

  const li = (txt: string) => ({
    text: txt,
    style: "listItem",
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
          (t("legal.privacy_refund.last_updated") || "December , 2025"),
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


  const Bullets: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box as="ul" listStyleType="disc" ps={5} display="grid" rowGap={2} color="#65a8bf">
      {children}
    </Box>
  );

  const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box as="li" ms={0}>
      {children}
    </Box>
  );

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

  return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"} mt={5}>
      <Container maxW="5xl">
        <VStack align="stretch" gap={6}>
          {/* Page Header */}
          <VStack align="stretch" gap={2}>
            <HStack justify="center" flexWrap="wrap" gap={2}>
              <Heading size="lg">
                {t("legal.privacy_refund.title") || "Privacy & Refund Policy"}
              </Heading>
            </HStack>
            <HStack justify="center" flexWrap="wrap" gap={2}>
            <Badge color="#65a8bf"  fontSize="10px">
                {t("legal.common.last_updated") || "Last updated"}:{" "}
                {t("legal.privacy_refund.last_updated") || "December 18th, 2025"}
              </Badge>
            </HStack>
            <Text>
              {t("legal.privacy_refund.intro") ||
                "This policy explains how we handle your data and how refunds work for our educational products and subscriptions focused on forex and crypto trading."}
            </Text>
          </VStack>

          {/* Scope */}
          <SpotlightCard>
            <Section title={t("legal.privacy_refund.scope.title") || "Scope"} k="scope">
              <Text color="#65a8bf">
                {t("legal.privacy_refund.scope.p1") ||
                  "These terms apply to all courses, live sessions, templates, and membership tiers available on our platform."}
              </Text>
              <Text color="#65a8bf">
                {t("legal.privacy_refund.scope.p2") ||
                  "Financial markets are risky. We provide education only—no investment advice, signals, or portfolio management."}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Payments (USDT only) */}
          <SpotlightCard>
            <Section
              title={t("legal.privacy_refund.payments.title") || "Payments & Pricing (USDT Only)"}
              k="payments"
            >
              <Text color="#65a8bf">
                {t("legal.privacy_refund.payments.p1") ||
                  "All sales are processed exclusively in USDT. Where supported, we accept USDT on TRC20 and ERC20 networks."}
              </Text>
              <Bullets>
                <Bullet>
                  {t("legal.privacy_refund.payments.li1") ||
                    "Prices may be displayed in your local currency for convenience, but settlement is in USDT."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy_refund.payments.li2") ||
                    "Network fees and on-chain confirmation times are outside our control."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy_refund.payments.li3") ||
                    "You are responsible for sending the exact amount to the correct chain address. Mis-sent funds may be irrecoverable."}
                </Bullet>
              </Bullets>
              <HStack pt={1} wrap="wrap" gap={2}>
                <Badge variant="subtle" colorScheme="yellow">
                  {t("legal.privacy_refund.payments.note") || "Note"}
                </Badge>
                <Text color="#65a8bf" flex="1">
                  {t("legal.privacy_refund.payments.note_text") ||
                    "Payment confirmations occur after sufficient on-chain confirmations."}
                </Text>
              </HStack>
            </Section>
          </SpotlightCard>

          {/* Refund Policy */}
          <SpotlightCard>
            <Section title={t("legal.refund.title") || "Refund Policy"} k="refund">
              <Text color="#65a8bf">
                {t("legal.refund.p1") ||
                  "If you’re not satisfied within 7 days of purchase, contact support for a full refund (terms apply)."}
              </Text>
              <Bullets>
                <Bullet>
                  {t("legal.refund.eligibility") ||
                    "Eligibility: first-time purchase of a given product/tier, and meaningful usage under fair-use limits."}
                </Bullet>
                <Bullet>
                  {t("legal.refund.exclusions") ||
                    "Exclusions: content scraping/sharing, downloading a substantial portion of materials, account sharing, or policy abuse."}
                </Bullet>
                <Bullet>
                  {t("legal.refund.digital") ||
                    "Because access is digital, refunds may be prorated or denied if significant content has been consumed."}
                </Bullet>
                <Bullet>
                  {t("legal.refund.method") ||
                    "Refunds are issued in USDT to the original network used for payment. Network fees are non-refundable."}
                </Bullet>
                <Bullet>
                  {t("legal.refund.timeline") ||
                    "Processing time: up to 10 business days after approval, excluding on-chain network delays."}
                </Bullet>
              </Bullets>
              <Text color="#65a8bf">
                {t("legal.refund.process") ||
                  "To initiate a refund, email support with your order ID, wallet address, and reason."}{" "}
                <Code>{t("legal.common.support_email") || "support@promrkts.com"}</Code>
              </Text>
            </Section>
          </SpotlightCard>

          {/* Access & Cancellations */}
          <SpotlightCard>
            <Section
              title={t("legal.privacy_refund.access.title") || "Access, Renewals & Cancellations"}
              k="access"
            >
              <Bullets>
                <Bullet>
                  {t("legal.privacy_refund.access.li1") ||
                    "Access to digital content is personal and non-transferable."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy_refund.access.li2") ||
                    "Subscriptions renew automatically unless cancelled before the next billing date."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy_refund.access.li3") ||
                    "Cancellation stops future charges; it does not retroactively refund prior periods."}
                </Bullet>
              </Bullets>
            </Section>
          </SpotlightCard>

          {/* Chargebacks & Disputes */}
          <SpotlightCard>
            <Section
              title={t("legal.privacy_refund.chargebacks.title") || "Chargebacks & Disputes"}
              k="chargebacks"
            >
              <Text color="#65a8bf">
                {t("legal.privacy_refund.chargebacks.p1") ||
                  "Please contact us first to resolve billing or access issues. Unauthorized disputes may result in account suspension."}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Privacy: Data We Collect */}
          <SpotlightCard>
            <Section
              title={t("legal.privacy.data.title") || "Privacy: Data We Collect"}
              k="privacy-data"
            >
              <Bullets>
                <Bullet>
                  {t("legal.privacy.data.account") ||
                    "Account data: name, email, and login identifiers."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy.data.billing") ||
                    "Billing metadata: transaction IDs, wallet address, and plan details (no private keys are ever collected)."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy.data.usage") ||
                    "Usage analytics: page views, progress, device information, and approximate location (for fraud prevention and product improvement)."}
                </Bullet>
              </Bullets>
            </Section>
          </SpotlightCard>  

          {/* How We Use Data */}
          <SpotlightCard>
            <Section title={t("legal.privacy.use.title") || "How We Use Your Data"} k="privacy-use">
              <Bullets>
                <Bullet>
                  {t("legal.privacy.use.provide") ||
                    "To provide and improve course content, track progress, and deliver support."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy.use.security") ||
                    "To protect against fraud, abuse, and unauthorized sharing."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy.use.comms") ||
                    "To send essential service emails. You can opt out of non-essential marketing messages."}
                </Bullet>
              </Bullets>
            </Section>
          </SpotlightCard>

          {/* Cookies & Third Parties */}
          <SpotlightCard>
            <Section
              title={t("legal.privacy.cookies.title") || "Cookies, Analytics & Third-Party Services"}
              k="cookies"
            >
              <Text color="#65a8bf">
                {t("legal.privacy.cookies.p1") ||
                  "We use cookies and similar technologies for authentication, preferences, and analytics. Some third-party providers may process limited personal data according to their own policies."}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Retention & Security */}
          <SpotlightCard>
            <Section
              title={t("legal.privacy.security.title") || "Data Retention & Security"}
              k="security"
            >
              <Bullets>
                <Bullet>
                  {t("legal.privacy.security.retention") ||
                    "We retain data only as long as necessary for the purposes described or as required by law."}
                </Bullet>
                <Bullet>
                  {t("legal.privacy.security.measures") ||
                    "We apply technical and organizational safeguards, but no method is 100% secure."}
                </Bullet>
              </Bullets>
            </Section>
          </SpotlightCard>

          {/* Your Rights */}
          <SpotlightCard>
            <Section title={t("legal.privacy.rights.title") || "Your Rights"} k="rights">
              <Text color="#65a8bf">
                {t("legal.privacy.rights.p1") ||
                  "Subject to local laws, you may request access, correction, deletion, or portability of your data. We may ask for verification before fulfilling requests."}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Contact */}
          <SpotlightCard>
            <Section title={t("legal.common.contact") || "Contact"} k="contact">
              <Text color="#65a8bf">
                {t("legal.common.contact_text") ||
                  "For privacy questions or refund requests, reach us at "}
                <Link href="mailto:support@promrkts.com" color={GOLD}>
                  {t("legal.common.support_email") || "support@promrkts.com"}
                </Link>
                .
              </Text>
            </Section>
          </SpotlightCard>

          <Text color={GOLD} textAlign="center" fontSize="sm" opacity={0.8}>
            {t("legal.common.disclaimer") ||
              "Nothing here is financial advice. Trading involves substantial risk of loss. Educational content is provided as-is without guarantees."}
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
