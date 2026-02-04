// src/pages/Broker.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Icon,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Image,
  Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  LineChart,
  DollarSign,
  Clock,
  CheckCircle2,
  Star,
} from "lucide-react";

import GlassCard from "../components/GlassCard";
import SpotlightCard from "../components/SpotlightCard";

const brand = "#65a8bf";
const ANAX_LOGO_SRC = "/ANAX-Logo.png";
const ANAX_LOGIN_LINK = "https://portal.anaxcapital.ae/login";
const ANAX_DEMO_LINK = "https://portal.anaxcapital.ae/register/";

const ANAX_NAMESPACE = "broker.anax";

const PARTNER_LABEL = "IB Partner";
const YOUR_BRAND_LABEL = "promrkts"; // change if needed

const createKeyMap = <T extends readonly [...string[]]>(keys: T) => keys;

const anaxFeatureKeys = createKeyMap([
  "multi_market",
  "low_spreads",
  "hassle_free",
  "support",
] as const);

const anaxPlatformKeys = createKeyMap(["mt5", "app", "web"] as const);

const anaxAccountStepKeys = createKeyMap([
  "register",
  "verify",
  "fund",
  "trade",
] as const);

const anaxSupportKeys = createKeyMap([
  "efficient_onboarding",
  "multilingual_support",
  "education_demo",
  "secure_payments",
] as const);

const anaxDisclaimerKeys = createKeyMap([
  "website",
  "restricted_regions",
  "risk_warning",
] as const);

const Broker: React.FC = () => {
  const { t } = useTranslation() as any;

  const IB_LINK = process.env.REACT_APP_BROKER_IB_LINK || "https://anaxcapital.ae";

  const handleJoin = () => {
    if (!IB_LINK || IB_LINK === "#") return;
    window.open(IB_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <Box mt={{ base: 6, md: 2 }} py={{ base: 8, md: 16 }}>
      <Container maxW="7xl">
        <VStack align="stretch" spacing={{ base: 8, md: 10 }}>
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <SpotlightCard>
              <Box p={{ base: 5, md: 8 }}>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  gap={{ base: 6, md: 8 }}
                  alignItems="center"
                >
                  {/* Left side content */}
                  <VStack
                    align={{ base: "center", md: "start" }}
                    spacing={4}
                    textAlign={{ base: "center", md: "left" }}
                  >
                    <VStack spacing={2} align={{ base: "center", md: "start" }}>
                      <HStack
                        spacing={2}
                        justify={{ base: "center", md: "flex-start" }}
                        flexWrap="wrap"
                      >
                        <Badge
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="0.65rem"
                          bg="rgba(104,165,191,0.16)"
                          color={brand}
                          border="1px solid rgba(104,165,191,0.35)"
                          textTransform="uppercase"
                          letterSpacing="widest"
                        >
                          {PARTNER_LABEL}
                        </Badge>

                        <Text fontSize="xs">
                          {t("broker.partner_label", {
                            defaultValue: "Official referral link",
                          })}
                        </Text>
                      </HStack>

                      <Text fontSize="sm" fontWeight="semibold">
                        {t("broker.anax_brand", { defaultValue: "ANAX Capital" })}
                      </Text>
                    </VStack>

                    <Heading
                      fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                      bgGradient="linear(to-r, #65a8bf, #65a8bf)"
                      bgClip="text"
                      lineHeight="1.1"
                    >
                      {t("broker.hero_title")}
                    </Heading>

                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                     
                      maxW={{ base: "full", md: "lg" }}
                    >
                      {t("broker.hero_subtitle", {
                        defaultValue:
                          "Join our broker through our official IB link to align your trading conditions with the way we actually trade: tight spreads, fast execution and institutional-level support.",
                      })}
                    </Text>

                    <HStack
                      spacing={4}
                      flexWrap="wrap"
                      justify={{ base: "center", md: "flex-start" }}
                    >
                      <HStack spacing={2}>
                        <Icon as={ShieldCheck} color={brand} />
                        <Text fontSize="xs">
                          {t("broker.hero_point_1")}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Icon as={LineChart} color={brand} />
                        <Text fontSize="xs">
                          {t("broker.hero_point_2")}
                        </Text>
                      </HStack>
                    </HStack>

                    <Text fontSize="xs" mt={2} maxW={{ base: "full", md: "lg" }}>
                      {t("broker.disclaimer_short")}
                    </Text>
                  </VStack>

                  {/* Right side – summary card */}
                  <Box w="100%" maxW={{ base: "sm", md: "full" }} mx={{ base: "auto", md: 0 }}>
                    <SpotlightCard>
                      <Box p={{ base: 5, md: 6 }}>
                        <VStack align="stretch" spacing={4}>
                          <SimpleGrid columns={2} gap={{ base: 3, md: 4 }}>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_spreads", { defaultValue: "Spreads from" })}
                              </Text>
                              <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                                0.0 pips
                              </Text>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_spreads_note", {
                                  defaultValue: "On major FX pairs",
                                })}
                              </Text>
                            </VStack>

                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_leverage", { defaultValue: "Leverage up to" })}
                              </Text>
                              <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                                1:500
                              </Text>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_leverage_note", {
                                  defaultValue: "Varies by region & instrument",
                                })}
                              </Text>
                            </VStack>

                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_execution", {
                                  defaultValue: "Average execution",
                                })}
                              </Text>
                              <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                                &lt; 50ms
                              </Text>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_execution_note", {
                                  defaultValue: "Low-latency infrastructure",
                                })}
                              </Text>
                            </VStack>

                            <VStack align="start" spacing={1}>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_platforms", { defaultValue: "Platforms" })}
                              </Text>
                              <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                                MT5 / Web
                              </Text>
                              <Text fontSize="xs" color="#65a8bf">
                                {t("broker.metric_platforms_note", {
                                  defaultValue: "Mobile & web",
                                })}
                              </Text>
                            </VStack>
                          </SimpleGrid>

                          <Button
                            size="lg"
                            w="100%"
                            bg={brand}
                            color="black"
                            borderRadius="xl"
                            _hover={{ bg: "rgba(104,165,191,0.9)" }}
                            onClick={handleJoin}
                          >
                            {t("broker.cta_primary", { defaultValue: "Open via IB Link" })}
                          </Button>
                        </VStack>
                      </Box>
                    </SpotlightCard>
                  </Box>
                </SimpleGrid>
              </Box>
            </SpotlightCard>
          </motion.div>

          {/* WHY THROUGH OUR IB */}
          <SpotlightCard>
            <Box p={{ base: 5, md: 8 }}>
              <VStack
                align={{ base: "center", md: "start" }}
                spacing={3}
                textAlign={{ base: "center", md: "left" }}
              >
                <Heading
                  size={{ base: "md", md: "lg" }}
                  bgGradient="linear(to-r, #65a8bf, #65a8bf)"
                  bgClip="text"
                >
                  {t("broker.why_title")}
                </Heading>

                <Text fontSize={{ base: "sm", md: "sm" }} maxW="2xl">
                  {t("broker.why_subtitle", {
                    defaultValue:
                      "By registering through our official IB link, you help us negotiate better conditions with the broker and unlock extra perks aligned with the way we actually trade in promrkts.",
                  })}
                </Text>
              </VStack>

              <SimpleGrid
                columns={{ base: 1, md: 3 }}
                gap={{ base: 4, md: 5 }}
                mt={{ base: 4, md: 6 }}
              >
                <Box p={{ base: 4, md: 5 }}>
                  <HStack mb={3} spacing={3}>
                    <Icon as={DollarSign} color={brand} />
                    <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                      {t("broker.benefit_spreads")}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="#65a8bf">
                    {t("broker.benefit_spreads_desc")}
                  </Text>
                </Box>

                <Box p={{ base: 4, md: 5 }}>
                  <HStack mb={3} spacing={3}>
                    <Icon as={Clock} color={brand} />
                    <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                      {t("broker.benefit_execution")}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="#65a8bf">
                    {t("broker.benefit_execution_desc")}
                  </Text>
                </Box>

                <Box p={{ base: 4, md: 5 }}>
                  <HStack mb={3} spacing={3}>
                    <Icon as={Star} color={brand} />
                    <Text fontWeight="semibold" fontSize="sm" color="#65a8bf">
                      {t("broker.benefit_alignment")}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="#65a8bf">
                    {t("broker.benefit_alignment_desc")}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>
          </SpotlightCard>

          {/* ANAX OVERVIEW */}
          <SpotlightCard>
            <Box p={{ base: 5, md: 8 }}>
              <VStack
                align={{ base: "center", md: "start" }}
                spacing={3}
                textAlign={{ base: "center", md: "left" }}
              >
                <Text fontSize={{ base: "sm", md: "md" }} color={brand} fontWeight="bold">
                  {t(`${ANAX_NAMESPACE}.hero_badge`)}
                </Text>
                <Text fontSize={{ base: "sm", md: "md" }}>
                  {t(`${ANAX_NAMESPACE}.hero_intro`)}
                </Text>
                <Text fontSize={{ base: "sm", md: "md" }}>
                  {t(`${ANAX_NAMESPACE}.hero_intro_secondary`)}
                </Text>
              </VStack>

              <HStack
                spacing={4}
                justify={{ base: "center", md: "flex-start" }}
                pt={4}
                flexWrap="wrap"
              >
                <Button
                  as="a"
                  href={ANAX_LOGIN_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  bg={brand}
                  color="black"
                  borderRadius="xl"
                  _hover={{ bg: "rgba(104,165,191,0.9)" }}
                >
                  {t(`${ANAX_NAMESPACE}.cta_primary`, { defaultValue: "Client Portal" })}
                </Button>

                <Button
                  as="a"
                  href={ANAX_DEMO_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.2)"
                  color="#65a8bf"
                  borderRadius="xl"
                  _hover={{ bg: "rgba(255,255,255,0.04)" }}
                >
                  {t(`${ANAX_NAMESPACE}.cta_secondary`, { defaultValue: "Open Demo / Register" })}
                </Button>
              </HStack>

              <Divider my={8} borderColor="rgba(255,255,255,0.1)" />

              <Heading
                size={{ base: "md", md: "lg" }}
                color="#65a8bf"
                textAlign={{ base: "center", md: "left" }}
              >
                {t(`${ANAX_NAMESPACE}.why_title`)}
              </Heading>

              <Text
                fontSize="sm"
               
                maxW="4xl"
                textAlign={{ base: "center", md: "left" }}
              >
                {t(`${ANAX_NAMESPACE}.why_intro`)}
              </Text>
              <Text
                fontSize="sm"
               
                maxW="4xl"
                textAlign={{ base: "center", md: "left" }}
              >
                {t(`${ANAX_NAMESPACE}.why_intro_secondary`)}
              </Text>

              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                gap={{ base: 4, md: 6 }}
                mt={{ base: 6, md: 8 }}
              >
                {anaxFeatureKeys.map((key) => (
                  <GlassCard key={key}>
                    <Box p={{ base: 4, md: 5 }}>
                      <Heading size="sm" color="#65a8bf" mb={2}>
                        {t(`${ANAX_NAMESPACE}.features.${key}.title`)}
                      </Heading>
                      <Text fontSize="sm">
                        {t(`${ANAX_NAMESPACE}.features.${key}.description`)}
                      </Text>
                    </Box>
                  </GlassCard>
                ))}
              </SimpleGrid>

              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                gap={{ base: 6, md: 8 }}
                mt={{ base: 8, md: 10 }}
              >
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm" color="#65a8bf">
                    {t(`${ANAX_NAMESPACE}.platform_title`)}
                  </Heading>

                  {anaxPlatformKeys.map((key) => (
                    <Box
                      key={key}
                      p={{ base: 3, md: 4 }}
                      border="1px solid rgba(255,255,255,0.08)"
                      borderRadius="xl"
                    >
                      <Text fontWeight="semibold" color="#65a8bf" mb={1}>
                        {t(`${ANAX_NAMESPACE}.platforms.${key}.title`)}
                      </Text>
                      <Text fontSize="sm">
                        {t(`${ANAX_NAMESPACE}.platforms.${key}.description`)}
                      </Text>
                    </Box>
                  ))}
                </VStack>

                <VStack align="stretch" spacing={5}>
                  <Box>
                    <Heading size="sm" color="#65a8bf" mb={2}>
                      {t(`${ANAX_NAMESPACE}.steps_title`)}
                    </Heading>

                    <SimpleGrid columns={{ base: 2, md: 2 }} gap={4}>
                      {anaxAccountStepKeys.map((key) => (
                        <Box
                          key={key}
                          border="1px solid rgba(255,255,255,0.08)"
                          borderRadius="lg"
                          p={3}
                        >
                          <Text fontWeight="semibold" color={brand} fontSize="sm">
                            {t(`${ANAX_NAMESPACE}.steps.${key}.title`)}
                          </Text>
                          <Text fontSize="xs">
                            {t(`${ANAX_NAMESPACE}.steps.${key}.description`)}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Heading size="sm" color="#65a8bf" mb={2}>
                      {t(`${ANAX_NAMESPACE}.support_title`)}
                    </Heading>
                    <List spacing={2} fontSize="sm">
                      {anaxSupportKeys.map((key) => (
                        <ListItem key={key}>
                          <ListIcon as={CheckCircle2} color={brand} />
                          {t(`${ANAX_NAMESPACE}.support.${key}`)}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </VStack>
              </SimpleGrid>
            </Box>
          </SpotlightCard>

          {/* STEP-BY-STEP FUNNEL */}
          <SpotlightCard>
            <Box p={{ base: 5, md: 8 }}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 6, md: 8 }}>
                <Box>
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    bgGradient="linear(to-r, #65a8bf, #65a8bf)"
                    bgClip="text"
                    mb={3}
                  >
                    {t("broker.steps_title")}
                  </Heading>

                  <List spacing={3} fontSize="sm" color="#65a8bf" maxW={{ base: "full", md: "md" }}>
                    <ListItem>
                      <ListIcon as={CheckCircle2} color={brand} />
                      {t("broker.step_1")}
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircle2} color={brand} />
                      {t("broker.step_2")}
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircle2} color={brand} />
                      {t("broker.step_3")}
                    </ListItem>
                  </List>

                  <HStack mt={6} justify={{ base: "center", md: "flex-start" }}>
                    <Button
                      size="lg"
                      w={{ base: "100%", sm: "auto" }}
                      bg={brand}
                      color="black"
                      borderRadius="xl"
                      _hover={{ bg: "rgba(104,165,191,0.9)" }}
                      onClick={handleJoin}
                    >
                      {t("broker.cta_again")}
                    </Button>
                  </HStack>
                </Box>

                {/* Mini “compliance / safety” box */}
                <Box w="100%">
                  <GlassCard>
                    <Box p={{ base: 4, md: 5 }}>
                      <HStack mb={3} spacing={3}>
                        <Icon as={ShieldCheck} color={brand} />
                        <Text fontWeight="semibold" fontSize="sm" color={brand}>
                          {t("broker.risk_title")}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color={brand} mb={3}>
                        {t("broker.risk_1")}
                      </Text>
                      <Text fontSize="xs" color={brand} mb={3}>
                        {t("broker.risk_2")}
                      </Text>
                      <Text fontSize="xs" color={brand}>
                        {t("broker.risk_3")}
                      </Text>
                    </Box>
                  </GlassCard>
                </Box>
              </SimpleGrid>
            </Box>
          </SpotlightCard>
        </VStack>

        {/* Bottom disclaimers + collaboration mark */}
        <Box mt={10} borderTop="1px solid rgba(255,255,255,0.08)" pt={6}>
          <VStack align="stretch" spacing={4}>
            {anaxDisclaimerKeys.map((key) => (
              <Text key={key} fontSize="xs">
                {t(`${ANAX_NAMESPACE}.disclaimer.${key}`)}
              </Text>
            ))}

            <VStack spacing={2} pt={2}>
              <Image src={ANAX_LOGO_SRC} alt="ANAX Capital logo" h={9} objectFit="contain" />

              <Text
                fontSize="xl"
                bgGradient="linear(to-r, #65a8bf, #65a8bf)"
                bgClip="text"
                fontWeight="extrabold"
                lineHeight="1"
              >
                ×
              </Text>

              <Text fontSize="sm" fontWeight="semibold">
                {YOUR_BRAND_LABEL}
              </Text>

              <Text fontSize="xs">
                {t("broker.ib_partner_note", { defaultValue: "Introducing Broker (IB) partner" })}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Broker;
