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
      header(t("legal.privacy_refund.title") || "Privacy, Terms & Policy"),
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
          "This policy explains how we handle your data, our payment and no-refund terms, cryptocurrency liability, and broker referral disclaimers for our educational products and subscriptions."
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

      // NO REFUND POLICY
      section("No Refund Policy"),
      p(
        "All sales of digital products, courses, subscriptions, and educational materials on this platform are final. Due to the nature of digital content, we do not issue refunds under any circumstances."
      ),
      bulletBlock([
        "All purchases are non-refundable. By completing a purchase, you acknowledge and accept this policy.",
        "In unique and exceptional cases, a partial reimbursement may be considered at our sole discretion. This is not guaranteed and is evaluated on a case-by-case basis.",
        "Requests for partial reimbursement must be submitted within 7 days of purchase with a valid reason and supporting details.",
        "Any approved partial reimbursement will be issued in USDT to the original wallet address. Network fees are non-refundable.",
        "Chargebacks, disputes, or attempts to reverse payments without prior authorization will result in immediate account suspension and potential legal action.",
      ]),

      // CRYPTOCURRENCY PAYMENT LIABILITY
      section("Cryptocurrency Payment Liability"),
      p(
        "All payments on this platform are processed exclusively in cryptocurrency (USDT). By making a payment, you acknowledge and accept the following:"
      ),
      bulletBlock([
        "You are solely responsible for ensuring the correct wallet address, network (e.g., TRC20, ERC20), and payment amount before initiating any transaction.",
        "We are not liable for any loss of funds resulting from incorrect wallet addresses, wrong network selection, insufficient gas fees, or any other user error during the payment process.",
        "Cryptocurrency transactions are irreversible by nature. Once a transaction is confirmed on the blockchain, it cannot be reversed, cancelled, or recovered by us.",
        "Network fees, gas fees, and on-chain confirmation times are entirely outside our control and are the sole responsibility of the sender.",
        "We are not responsible for delays, failures, or losses caused by blockchain network congestion, outages, or third-party wallet/exchange issues.",
        "Mis-sent, underpaid, or overpaid transactions may result in loss of funds. We are under no obligation to recover or compensate for such errors.",
      ]),

      // ACCESS & CANCELLATIONS
      section("Access, Renewals & Cancellations"),
      bulletBlock([
        "Access to digital content is personal and non-transferable.",
        "Subscriptions renew automatically unless cancelled before the next billing date.",
        "Cancellation stops future charges; it does not entitle you to any refund or reimbursement for prior periods.",
        "We reserve the right to revoke access to any user who violates these terms without compensation.",
      ]),

      // IB BROKER DISCLAIMER
      section("Introducing Broker (IB) Partner Disclaimer"),
      p(
        "This platform may refer users to third-party brokerage services through our Introducing Broker (IB) partnerships. By using any broker referral links or registering through our IB program, you acknowledge and agree to the following:"
      ),
      bulletBlock([
        "We act solely as an introducing broker and do not provide brokerage, trading, or financial advisory services. We do not hold, manage, or have access to your trading funds.",
        "Any broker we refer you to is an independent third-party entity. We are not responsible for their actions, policies, trading conditions, platform performance, or regulatory compliance.",
        "Trading forex, CFDs, cryptocurrencies, and other financial instruments through any broker involves substantial risk of loss. You may lose some or all of your invested capital. Past performance is not indicative of future results.",
        "We do not guarantee the solvency, reliability, or regulatory standing of any partner broker. You are responsible for conducting your own due diligence before opening an account or depositing funds.",
        "We are not liable for any financial losses, damages, or disputes arising from your use of any partner broker's services, including but not limited to trading losses, withdrawal issues, platform outages, or account disputes.",
        "Broker referral links may generate commissions for us. This does not influence the educational content we provide, and our IB relationship does not constitute an endorsement or guarantee of any broker's services.",
        "You are solely responsible for understanding and complying with the laws and regulations applicable to trading in your jurisdiction. Some broker services may not be available in all regions.",
        "By registering through our referral links, you agree to the partner broker's own terms of service, privacy policy, and risk disclosures, which are separate from ours.",
      ]),

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
          "For privacy questions or policy inquiries, reach us at ") +
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

          {/* Payments (USDT Only) */}
          <SpotlightCard>
            <Section title={t("legal.terms.payments.title", "Payments & Pricing (USDT Only)")} k="payments">
              <Text color="text.muted">
                {t("legal.terms.payments.p1", "All payments are processed exclusively in USDT. You are responsible for verifying payment addresses and network selection before sending crypto transactions.")}
              </Text>
              <Text color="text.muted">
                {t("legal.terms.payments.p2", "Prices may be displayed in your local currency for convenience, but settlement is always in USDT.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* No Refund Policy */}
          <SpotlightCard>
            <Section title={t("legal.no_refund.title", "No Refund Policy")} k="no-refund">
              <Text color="text.muted">
                {t("legal.no_refund.intro", "All sales of digital products, courses, subscriptions, and educational materials on this platform are final. Due to the nature of digital content, we do not issue refunds under any circumstances.")}
              </Text>
              <Text color="text.muted">
                {t("legal.no_refund.li1", "All purchases are non-refundable. By completing a purchase, you acknowledge and accept this policy.")} {t("legal.no_refund.li2", "In unique and exceptional cases, a partial reimbursement may be considered at our sole discretion. This is not guaranteed and is evaluated on a case-by-case basis.")}
              </Text>
              <Text color="text.muted">
                {t("legal.no_refund.li3", "Requests for partial reimbursement must be submitted within 7 days of purchase with a valid reason and supporting details.")} {t("legal.no_refund.li4", "Any approved partial reimbursement will be issued in USDT to the original wallet address. Network fees are non-refundable.")}
              </Text>
              <Text color="text.muted">
                {t("legal.no_refund.li5", "Chargebacks, disputes, or attempts to reverse payments without prior authorization will result in immediate account suspension and potential legal action.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Cryptocurrency Payment Liability */}
          <SpotlightCard>
            <Section title={t("legal.crypto_liability.title", "Cryptocurrency Payment Liability")} k="crypto-liability">
              <Text color="text.muted">
                {t("legal.crypto_liability.intro", "All payments on this platform are processed exclusively in cryptocurrency (USDT). By making a payment, you acknowledge and accept the following:")}
              </Text>
              <Text color="text.muted">
                {t("legal.crypto_liability.li1", "You are solely responsible for ensuring the correct wallet address, network (e.g., TRC20, ERC20), and payment amount before initiating any transaction.")} {t("legal.crypto_liability.li2", "We are not liable for any loss of funds resulting from incorrect wallet addresses, wrong network selection, insufficient gas fees, or any other user error during the payment process.")}
              </Text>
              <Text color="text.muted">
                {t("legal.crypto_liability.li3", "Cryptocurrency transactions are irreversible by nature. Once a transaction is confirmed on the blockchain, it cannot be reversed, cancelled, or recovered by us.")} {t("legal.crypto_liability.li4", "Network fees, gas fees, and on-chain confirmation times are entirely outside our control and are the sole responsibility of the sender.")}
              </Text>
              <Text color="text.muted">
                {t("legal.crypto_liability.li5", "We are not responsible for delays, failures, or losses caused by blockchain network congestion, outages, or third-party wallet/exchange issues.")} {t("legal.crypto_liability.li6", "Mis-sent, underpaid, or overpaid transactions may result in loss of funds. We are under no obligation to recover or compensate for such errors.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* IB Broker Disclaimer */}
          <SpotlightCard>
            <Section title={t("legal.ib_disclaimer.title", "Introducing Broker (IB) Partner Disclaimer")} k="ib-disclaimer">
              <Text color="text.muted">
                {t("legal.ib_disclaimer.intro", "This platform may refer users to third-party brokerage services through our Introducing Broker (IB) partnerships. By using any broker referral links or registering through our IB program, you acknowledge and agree to the following:")}
              </Text>
              <Text color="text.muted">
                {t("legal.ib_disclaimer.li1", "We act solely as an introducing broker and do not provide brokerage, trading, or financial advisory services. We do not hold, manage, or have access to your trading funds.")} {t("legal.ib_disclaimer.li2", "Any broker we refer you to is an independent third-party entity. We are not responsible for their actions, policies, trading conditions, platform performance, or regulatory compliance.")}
              </Text>
              <Text color="text.muted">
                {t("legal.ib_disclaimer.li3", "Trading forex, CFDs, cryptocurrencies, and other financial instruments through any broker involves substantial risk of loss. You may lose some or all of your invested capital. Past performance is not indicative of future results.")} {t("legal.ib_disclaimer.li4", "We do not guarantee the solvency, reliability, or regulatory standing of any partner broker. You are responsible for conducting your own due diligence before opening an account or depositing funds.")}
              </Text>
              <Text color="text.muted">
                {t("legal.ib_disclaimer.li5", "We are not liable for any financial losses, damages, or disputes arising from your use of any partner broker's services, including but not limited to trading losses, withdrawal issues, platform outages, or account disputes.")}
              </Text>
              <Text color="text.muted">
                {t("legal.ib_disclaimer.li6", "Broker referral links may generate commissions for us. This does not influence the educational content we provide, and our IB relationship does not constitute an endorsement or guarantee of any broker's services.")} {t("legal.ib_disclaimer.li7", "You are solely responsible for understanding and complying with the laws and regulations applicable to trading in your jurisdiction. Some broker services may not be available in all regions.")}
              </Text>
              <Text color="text.muted">
                {t("legal.ib_disclaimer.li8", "By registering through our referral links, you agree to the partner broker's own terms of service, privacy policy, and risk disclosures, which are separate from ours.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Risk Disclosure */}
          <SpotlightCard>
            <Section title={t("legal.terms.disclaimer.title", "Risk Disclosure & Educational Purpose")} k="disclaimer">
              <Text color="text.muted">
                {t("legal.terms.disclaimer.p1", "Trading forex, cryptocurrencies, and financial markets involves significant risk. Past performance does not guarantee future results.")}
              </Text>
              <Text color="text.muted">
                {t("legal.terms.disclaimer.p2", "Our courses, templates, and examples are purely educational and do not constitute financial advice, trading recommendations, or investment guidance.")} {t("legal.terms.disclaimer.p3", "You acknowledge that you are solely responsible for any trading decisions made based on information from our materials.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Liability */}
          <SpotlightCard>
            <Section title={t("legal.terms.liability.title", "Limitation of Liability")} k="liability">
              <Text color="text.muted">
                {t("legal.terms.liability.p1", "We are not liable for any losses, damages, or claims arising from your use of our platform, the application of our educational content, trading activities, or the use of any partner broker's services.")}
              </Text>
              <Text color="text.muted">
                {t("legal.terms.liability.p2", "All information is provided 'as is' without warranties of accuracy, completeness, or fitness for purpose. We do not guarantee profits, income, performance, or trading results.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Modifications */}
          <SpotlightCard>
            <Section title={t("legal.terms.modifications.title", "Changes to Terms")} k="modifications">
              <Text color="text.muted">
                {t("legal.terms.modifications.p1", "We may update these terms periodically to reflect new features, laws, or business practices. Continued use after updates implies acceptance.")}
              </Text>
            </Section>
          </SpotlightCard>

          {/* Contact */}
          <SpotlightCard>
            <Section title={t("legal.common.contact", "Contact")} k="contact">
              <Text color="text.muted">
                {t("legal.common.contact_text", "For privacy questions or policy inquiries, reach us at ")}
                <Link
                  href={`mailto:${t("legal.common.support_email", "support@promrkts.com")}`}
                  color={GOLD}
                >
                  {t("legal.common.support_email", "support@promrkts.com")}
                </Link>
                .
              </Text>
            </Section>
          </SpotlightCard>

          {/* Final Disclaimer */}
          <Text color={GOLD} fontSize="sm" textAlign="center" opacity={0.8}>
            {t("legal.common.disclaimer", "Trading involves substantial risk and may result in loss of capital. Our content is educational and not a guarantee of results. All sales are final — no refunds.")}
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
