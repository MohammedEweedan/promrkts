import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Link,
  List,
  ListItem,
  Icon,
  Image,
  Code,
  Button,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Kbd,
  AspectRatio,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import SpotlightCard from "../../components/SpotlightCard";

const GOLD = "#65a8bf";

export default function CryptoGuide() {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");

  return (
    <Box py={{ base: 6, md: 10 }} dir={isRTL ? "rtl" : "ltr"} overflowX="hidden">
      <Container maxW="6xl">
        <VStack align="stretch" spacing={8}>
          {/* Hero */}
          <VStack spacing={2} textAlign="center">
            <Heading fontSize={{ base: "2xl", md: "3xl" }} color={GOLD} letterSpacing="0.3px">
              {t("crypto.title")}
            </Heading>
            <Text opacity={0.9} maxW="3xl">
              {t("crypto.subtitle")}
            </Text>
          </VStack>

          {/* Primer */}
          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card variant="outline" borderColor={GOLD} bg="bg.surface">
                <CardHeader pb={0}>
                  <HStack justify="space-between">
                    <Heading size="md">{t("crypto.what_is_usdt.title")}</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text mb={4}>{t("crypto.what_is_usdt.desc")}</Text>
                  <Image
                    src="/images/payments/usdt.png"
                    alt="USDT example"
                    w="100%"
                    maxW="420px"
                    mx="auto"
                    shadow="sm"
                  />
                  <Alert status="info" mt={4} borderRadius="md">
                    <AlertIcon />
                    {t("crypto.note_stablecoin") ??
                      "USDT is a stablecoin designed to track the US dollar (1 USDT ≈ $1)."}
                  </Alert>
                </CardBody>
              </Card>

              {/* Chain Comparison */}
              <Card variant="outline" borderColor={GOLD} bg="bg.surface">
                <CardHeader pb={2}>
                  <Heading size="md">{t("crypto.chains.title")}</Heading>
                  <Text opacity={0.85} mt={1}>
                    {t("crypto.chains.desc")}
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <SimpleGrid columns={{ base: 1, md: 1 }} spacing={3}>
                    <Box p={4} borderRadius="md">
                      <Heading size="md" color="blue.400" textAlign="center">
                        Ethereum (ERC20)
                      </Heading>
                      <Text fontSize="md" mt={1} textAlign="center">
                        {t("crypto.chains.erc20")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="md">
                      <Heading size="md" color="purple.400" textAlign="center">
                        BNB Smart Chain (BEP20)
                      </Heading>
                      <Text fontSize="md" mt={1} textAlign="center">
                        {t("crypto.chains.bep20")}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="md">
                      <Heading size="md" color="green.500" textAlign="center">
                        TRON (TRC20)
                      </Heading>
                      <Text fontSize="md" mt={1} fontWeight="semibold" textAlign="center">
                        {t("crypto.chains.trc20")}
                      </Text>
                    </Box>
                  </SimpleGrid>
                  <Text fontSize="md" opacity={0.8} mt={3} textAlign="center">
                    ✅{" "}
                    {t("crypto.fees_tip") ??
                      "Tip: TRC20 is usually the cheapest and fastest for USDT transfers."}
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </SpotlightCard>

          {/* How to Buy */}
          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
            <Card variant="outline" borderColor={GOLD} bg="bg.surface">
              <CardHeader pb={2}>
                <Heading size="md">{t("crypto.buy.title")}</Heading>
                <Text opacity={0.85} mt={1}>
                  {t("crypto.buy.desc")}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Heading size="md" mb={2}>
                      {t("crypto.buy.global_title") ?? "Global exchanges"}
                    </Heading>
                    <List spacing={2}>
                      <ListItem>
                        <Link href="https://www.binance.com" isExternal color={GOLD}>
                          Binance <Icon as={ExternalLink} boxSize={4} mx={1} />
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Link href="https://www.okx.com" isExternal color={GOLD}>
                          OKX <Icon as={ExternalLink} boxSize={4} mx={1} />
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Link href="https://www.bybit.com" isExternal color={GOLD}>
                          Bybit <Icon as={ExternalLink} boxSize={4} mx={1} />
                        </Link>
                      </ListItem>
                    </List>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>
                      {t("crypto.buy.libya_title")}
                    </Heading>
                    <Text mb={3}>{t("crypto.buy.libya_desc")}</Text>
                    <List spacing={2}>
                      <ListItem>
                        <Link href="https://goo.gl/maps/dM6uUjNBa2N9eR4P6" isExternal color={GOLD}>
                          Tripoli – Al-Siyahiya Exchange{" "}
                          <Icon as={ExternalLink} boxSize={4} mx={1} />
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Link href="https://goo.gl/maps/wLrLpKUcTcnzjAEz8" isExternal color={GOLD}>
                          Benghazi – Souq Al-Jareed Exchange{" "}
                          <Icon as={ExternalLink} boxSize={4} mx={1} />
                        </Link>
                      </ListItem>
                      <ListItem>
                        <Link href="https://goo.gl/maps/9LhGzAmLxwHbL6Ft7" isExternal color={GOLD}>
                          Misrata – Downtown Financial Center{" "}
                          <Icon as={ExternalLink} boxSize={4} mx={1} />
                        </Link>
                      </ListItem>
                    </List>
                  </Box>
                </SimpleGrid>

                <Alert status="warning" mt={5} borderRadius="md">
                  <AlertIcon />
                  {t("crypto.kyc_warning") ??
                    "Use verified vendors and complete KYC where required. Avoid P2P trades without escrow."}
                </Alert>
              </CardBody>
            </Card>
          </SpotlightCard>

          {/* How to Send */}
          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
          <Card variant="outline" borderColor={GOLD} bg="bg.surface">
            <CardHeader pb={2}>
              <Heading size="md">{t("crypto.send.title")}</Heading>
              <Text opacity={0.85} mt={1}>
                {t("crypto.send.desc")}
              </Text>
            </CardHeader>
            <CardBody pt={0}>
              <List spacing={2} pl={1}>
                <ListItem>✅ {t("crypto.send.steps.1")}</ListItem>
                <ListItem>✅ {t("crypto.send.steps.2")}</ListItem>
                <ListItem>✅ {t("crypto.send.steps.3")}</ListItem>
                <ListItem>✅ {t("crypto.send.steps.4")}</ListItem>
              </List>

              <Divider my={4} />

              <Text fontWeight="bold" mb={1}>
                {t("crypto.txn.title")}
              </Text>
              <Text mb={2}>{t("crypto.txn.desc")}</Text>

              {/* FIXED: wrap long hash on mobile without pushing layout */}
              <Code
                p={3}
                borderRadius="md"
                display="block"
                w="100%"
                fontSize={{ base: "xs", md: "sm" }}
                whiteSpace="pre-wrap" // allow wrapping
                wordBreak="break-all" // break long strings
                overflowWrap="anywhere" // safer wrap across browsers
                bg="gray"
                color="green.200"
              >
                9d14db6a6e4e5e8adf07f1fbbbe23cb9d5b2a4bdfa7cbba532e38aabceabf9c9
              </Code>

              <Text fontSize="sm" opacity={0.8} mt={2}>
                {t("crypto.txn.note")}
              </Text>

              <Alert status="success" mt={4} borderRadius="md">
                <AlertIcon />
                {t("crypto.network_match_tip") ??
                  "Always match the network on both sender and receiver (e.g., TRC20 ↔ TRC20)."}
              </Alert>
            </CardBody>
          </Card>
          </SpotlightCard>

          {/* Quick How-To (polished, not “tutorial-ish”) */}
          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
          <Card variant="outline" borderColor={GOLD} bg="bg.surface">
            <CardHeader pb={2}>
              <Heading size="md">
                {t("crypto.guide.quick.title") ?? "Quick guide: buy → send → confirm"}
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box p={4} border="1px dashed" borderColor="gray.400" borderRadius="lg">
                  <Heading size="sm" mb={2}>
                    1) Buy USDT
                  </Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    {t("crypto.guide.quick.buy") ??
                      "Purchase USDT on an exchange or from a verified local vendor."}
                  </Text>
                </Box>
                <Box p={4} border="1px dashed" borderColor="gray.400" borderRadius="lg">
                  <Heading size="sm" mb={2}>
                    2) Set Network
                  </Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    {t("crypto.guide.quick.network") ??
                      "Choose TRC20 unless you’re told otherwise for fees/speed."}
                  </Text>
                </Box>
                <Box p={4} border="1px dashed" borderColor="gray.400" borderRadius="lg">
                  <Heading size="sm" mb={2}>
                    3) Send & Verify
                  </Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    {t("crypto.guide.quick.verify") ?? (
                      <>
                        Paste the address, double-check the first/last 4 chars, send a small test (
                        <Kbd>$1</Kbd>), then full amount.
                      </>
                    )}
                  </Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
          </SpotlightCard>

          {/* FAQ */}
          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
          <Card variant="outline" borderColor={GOLD} bg="bg.surface">
            <CardHeader pb={2}>
              <Heading size="md">{t("crypto.faq.title") ?? "FAQ"}</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <Accordion allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="start">
                        {t("crypto.faq.network_wrong.q") ?? "What if I pick the wrong network?"}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel>
                    {t("crypto.faq.network_wrong.a") ??
                      "Funds may be lost. Always confirm the network with the receiver before sending."}
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="start">
                        {t("crypto.faq.fees.q") ?? "Why did I receive less?"}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel>
                    {t("crypto.faq.fees.a") ??
                      "Exchanges and networks charge fees. Send slightly more or account for fees ahead of time."}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
          </SpotlightCard>

          {/* Video Guide */}
          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
          <Card variant="outline" borderColor={GOLD} bg="bg.surface">
            <CardHeader pb={2}>
              <Heading size="md">
                {t("crypto.video.title") ?? "Video guide: Buy & Send USDT (TRC20)"}
              </Heading>
              <Text opacity={0.85} mt={1}>
                {t("crypto.video.desc") ??
                  "Watch this step-by-step tutorial on buying USDT (TRC20) and sending it safely."}
              </Text>
            </CardHeader>
            <CardBody pt={0}>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={
                    (t("crypto.video.url") as string) || "https://www.youtube.com/embed/VIDEO_ID"
                  }
                  title="USDT TRC20 Guide"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 0 }}
                />
              </AspectRatio>
            </CardBody>
          </Card>
          </SpotlightCard>

          {/* CTA */}
          <HStack justifyContent="center">
            <Button
              as={RouterLink}
              to="/checkout"
              bg={GOLD}
              color="black"
              px={8}
              size="lg"
              _hover={{ filter: "brightness(0.95)" }}
              shadow="md"
              borderRadius="xl"
            >
              {t("crypto.cta_enroll")}
            </Button>
            <Button
              as={RouterLink}
              to="/contact"
              variant="outline"
              borderColor={GOLD}
              color={GOLD}
              px={8}
              size="lg"
              _hover={{ bg: "transparent", filter: "brightness(1.1)" }}
              shadow="md"
              borderRadius="xl"
            >
              {t("footer.contact_us") ?? "Contact us"}
            </Button>
          </HStack>
          <Text fontSize="sm" opacity={0.7} textAlign="center">
            {t("crypto.cta_disclaimer") ??
              "Educational content only. This is not financial advice."}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
