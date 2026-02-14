import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  Divider,
  List,
  ListItem,
  ListIcon,
  Avatar,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  LineChart,
  Crosshair,
  Monitor,
  Star,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Users,
} from "lucide-react";

const MotionBox = motion(Box);
const GOLD = "#65a8bf";
const ACCENT_GOLD = "#b7a27d";

type IndicatorPlan = {
  key: string;
  icon: any;
  color: string;
  monthly: number;
  yearly: number;
  features: string[];
};

const PLANS: IndicatorPlan[] = [
  {
    key: "swing",
    icon: LineChart,
    color: "#65a8bf",
    monthly: 39,
    yearly: 399,
    features: [
      "indicator.swing.feat1",
      "indicator.swing.feat2",
      "indicator.swing.feat3",
      "indicator.swing.feat4",
      "indicator.swing.feat5",
      "indicator.swing.feat6",
    ],
  },
  {
    key: "scalp",
    icon: Crosshair,
    color: "#b7a27d",
    monthly: 29,
    yearly: 299,
    features: [
      "indicator.scalp.feat1",
      "indicator.scalp.feat2",
      "indicator.scalp.feat3",
      "indicator.scalp.feat4",
      "indicator.scalp.feat5",
      "indicator.scalp.feat6",
    ],
  },
  {
    key: "daily",
    icon: Monitor,
    color: "#65a8bf",
    monthly: 34,
    yearly: 349,
    features: [
      "indicator.daily.feat1",
      "indicator.daily.feat2",
      "indicator.daily.feat3",
      "indicator.daily.feat4",
      "indicator.daily.feat5",
      "indicator.daily.feat6",
    ],
  },
];

const BUNDLE = { monthly: 79, yearly: 799 };

const TESTIMONIALS = [
  { name: "Alex R.", role: "Swing Trader", stars: 5, key: "indicator.review1" },
  { name: "Sarah M.", role: "Scalper", stars: 5, key: "indicator.review2" },
  { name: "James T.", role: "Day Trader", stars: 5, key: "indicator.review3" },
  { name: "Fatima K.", role: "Full-time Trader", stars: 5, key: "indicator.review4" },
];

const STEPS = [
  { icon: Users, key: "indicator.step1" },
  { icon: Shield, key: "indicator.step2" },
  { icon: TrendingUp, key: "indicator.step3" },
  { icon: Target, key: "indicator.step4" },
];

export default function Indicators() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const defaultIndex = initialTab === "scalp" ? 1 : initialTab === "daily" ? 2 : 0;
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");

  return (
    <Box py={{ base: 6, md: 10 }}>
      {/* Hero */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        position="relative"
        overflow="hidden"
        py={{ base: 12, md: 20 }}
        px={{ base: 4, md: 8 }}
        mb={8}
      >
        <Box
          position="absolute"
          inset={0}
          bgGradient="radial(ellipse 80% 50% at 50% -20%, rgba(101, 168, 191, 0.15), transparent)"
          pointerEvents="none"
        />
        <VStack spacing={{ base: 5, md: 7 }} textAlign="center" maxW="4xl" mx="auto" position="relative">
          <Badge
            bg="rgba(101, 168, 191, 0.12)"
            color={GOLD}
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {t("indicator.hero_badge", "TradingView Indicators")}
          </Badge>
          <Heading
            as="h1"
            size={{ base: "xl", md: "2xl" }}
            fontWeight="800"
            lineHeight="shorter"
          >
            <Text as="span" bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
              {t("indicator.hero_title1", "Trade Smarter.")}
            </Text>{" "}
            {t("indicator.hero_title2", "Not Harder.")}
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color={isDark ? "whiteAlpha.800" : "gray.600"}
            maxW="2xl"
          >
            {t(
              "indicator.hero_sub",
              "Our proprietary TradingView indicators apply the exact strategy we teach — auto Fibonacci, smart signals, and precision entries. Choose the style that matches your trading."
            )}
          </Text>

          {/* Quick stats */}
          <SimpleGrid columns={{ base: 3 }} gap={6} pt={4} maxW="lg" mx="auto">
            <VStack>
              <Text fontWeight="800" fontSize="2xl" bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
                3
              </Text>
              <Text fontSize="xs" color={isDark ? "whiteAlpha.600" : "gray.500"}>
                {t("indicator.stat_indicators", "Indicators")}
              </Text>
            </VStack>
            <VStack>
              <Text fontWeight="800" fontSize="2xl" bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
                24/7
              </Text>
              <Text fontSize="xs" color={isDark ? "whiteAlpha.600" : "gray.500"}>
                {t("indicator.stat_signals", "Live Signals")}
              </Text>
            </VStack>
            <VStack>
              <Text fontWeight="800" fontSize="2xl" bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
                1-Click
              </Text>
              <Text fontSize="xs" color={isDark ? "whiteAlpha.600" : "gray.500"}>
                {t("indicator.stat_setup", "Setup")}
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </MotionBox>

      <Container maxW="7xl">
        <VStack align="stretch" spacing={12}>
          {/* ===== HOW IT WORKS ===== */}
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              {t("indicator.how_title", "How It Works")}
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 4 }} gap={6}>
              {STEPS.map((step, idx) => (
                <MotionBox
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <VStack
                    p={6}
                    bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                    border="1px solid"
                    borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
                    borderRadius="2xl"
                    spacing={4}
                    textAlign="center"
                    h="full"
                  >
                    <Box
                      w={12}
                      h={12}
                      borderRadius="xl"
                      bg="rgba(101, 168, 191, 0.12)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={step.icon} boxSize={6} color={GOLD} />
                    </Box>
                    <Text fontWeight="800" fontSize="sm" color={GOLD}>
                      {t(`indicator.step${idx + 1}_label`, `Step ${idx + 1}`)}
                    </Text>
                    <Text fontSize="sm" color={isDark ? "whiteAlpha.800" : "gray.600"}>
                      {t(step.key, [
                        "Subscribe and get instant TradingView access",
                        "Add the indicator to your chart in one click",
                        "Receive automated buy/sell signals with entry, SL & TP",
                        "Trade with confidence using our proven Fibonacci strategy",
                      ][idx])}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* ===== INDICATOR TABS ===== */}
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              {t("indicator.choose_title", "Choose Your Indicator")}
            </Heading>

            {/* Billing toggle */}
            <HStack
              bg={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}
              p={1}
              borderRadius="xl"
              spacing={0}
            >
              <Button
                size="sm"
                variant="ghost"
                bg={billing === "monthly" ? "rgba(101, 168, 191, 0.2)" : "transparent"}
                color={billing === "monthly" ? GOLD : isDark ? "whiteAlpha.700" : "gray.600"}
                fontWeight="700"
                onClick={() => setBilling("monthly")}
                borderRadius="lg"
                px={6}
              >
                {t("indicator.monthly", "Monthly")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                bg={billing === "yearly" ? "rgba(183, 162, 125, 0.2)" : "transparent"}
                color={billing === "yearly" ? ACCENT_GOLD : isDark ? "whiteAlpha.700" : "gray.600"}
                fontWeight="700"
                onClick={() => setBilling("yearly")}
                borderRadius="lg"
                px={6}
              >
                {t("indicator.yearly", "Yearly")}
                <Badge ml={2} colorScheme="green" fontSize="xs" borderRadius="full">
                  {t("indicator.save_15", "Save 15%")}
                </Badge>
              </Button>
            </HStack>

            <Tabs
              isFitted
              variant="unstyled"
              w="full"
              defaultIndex={defaultIndex}
            >
              <TabList borderRadius="xl" p="2" gap="2">
                {PLANS.map((plan) => (
                  <Tab
                    key={plan.key}
                    borderRadius="md"
                    fontWeight="semibold"
                    _hover={{ bg: "rgba(255,255,255,0.08)" }}
                    _selected={{ bg: plan.color }}
                  >
                    <HStack spacing={2}>
                      <Icon as={plan.icon} boxSize={4} />
                      <Text>{t(`indicator.${plan.key}.tab`, plan.key.charAt(0).toUpperCase() + plan.key.slice(1))}</Text>
                    </HStack>
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {PLANS.map((plan) => (
                  <TabPanel key={plan.key} px={0}>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
                      {/* Left: Features */}
                      <MotionBox
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <VStack
                          align="stretch"
                          spacing={5}
                          p={8}
                          bg={isDark
                            ? "linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(30, 30, 45, 0.9) 100%)"
                            : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 255, 0.95) 100%)"
                          }
                          border="1px solid"
                          borderColor={`${plan.color}40`}
                          borderRadius="2xl"
                          boxShadow={isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.1)"}
                        >
                          <HStack>
                            <Box
                              w={10}
                              h={10}
                              borderRadius="xl"
                              bg={`${plan.color}20`}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Icon as={plan.icon} boxSize={5} color={plan.color} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Heading size="md">
                                {t(`indicator.${plan.key}.name`, `${plan.key.charAt(0).toUpperCase() + plan.key.slice(1)} Trader Pro`)}
                              </Heading>
                              <Badge bg={`${plan.color}20`} color={plan.color} borderRadius="full" fontSize="xs">
                                {t(`indicator.${plan.key}.timeframe_label`, "4H — Weekly")}
                              </Badge>
                            </VStack>
                          </HStack>

                          <Text fontSize="sm" color={isDark ? "whiteAlpha.800" : "gray.600"}>
                            {t(`indicator.${plan.key}.long_desc`,
                              "Our proprietary indicator automatically draws Fibonacci retracements on the most prominent swing points, places buy signals at the 0.314 level and sell signals at the 0.88 level, with automatic stop-loss placement and Fibonacci redraw when SL is hit."
                            )}
                          </Text>

                          <Divider borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"} />

                          <Text fontWeight="700" fontSize="sm" color={plan.color}>
                            {t("indicator.whats_included", "What's Included")}
                          </Text>
                          <List spacing={2}>
                            {plan.features.map((feat, i) => (
                              <ListItem key={i} display="flex" alignItems="center">
                                <ListIcon as={CheckCircle} color="green.400" boxSize={4} />
                                <Text fontSize="sm" color={isDark ? "whiteAlpha.800" : "gray.700"}>
                                  {t(feat, [
                                    "Auto Fibonacci retracement on prominent swings",
                                    "Buy signals at 0.314 with auto SL placement",
                                    "Sell signals at 0.88 with auto SL placement",
                                    "Auto-redraw Fibonacci when SL is hit",
                                    "Support & Resistance at break of structure",
                                    "Trend channels with visual overlays",
                                  ][i] || feat)}
                                </Text>
                              </ListItem>
                            ))}
                          </List>
                        </VStack>
                      </MotionBox>

                      {/* Right: Pricing Card */}
                      <MotionBox
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <VStack spacing={6}>
                          {/* Individual plan */}
                          <Box
                            w="full"
                            p={8}
                            bg={isDark
                              ? "linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(30, 30, 45, 0.9) 100%)"
                              : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 255, 0.95) 100%)"
                            }
                            border="1px solid"
                            borderColor={`${plan.color}40`}
                            borderRadius="2xl"
                            boxShadow={isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.1)"}
                          >
                            <VStack spacing={4}>
                              <Text fontWeight="700" fontSize="lg">
                                {t(`indicator.${plan.key}.name`, `${plan.key.charAt(0).toUpperCase() + plan.key.slice(1)} Trader Pro`)}
                              </Text>
                              <HStack align="baseline" spacing={1}>
                                <Text fontSize="sm" color={isDark ? "whiteAlpha.600" : "gray.500"}>$</Text>
                                <Text
                                  fontSize="4xl"
                                  fontWeight="800"
                                  bgGradient={`linear(to-r, ${plan.color}, ${ACCENT_GOLD})`}
                                  bgClip="text"
                                >
                                  {billing === "monthly" ? plan.monthly : plan.yearly}
                                </Text>
                                <Text fontSize="sm" color={isDark ? "whiteAlpha.600" : "gray.500"}>
                                  /{billing === "monthly"
                                    ? t("indicator.mo", "mo")
                                    : t("indicator.yr", "yr")}
                                </Text>
                              </HStack>
                              <Button
                                as={RouterLink}
                                to={`/checkout?indicator=${plan.key}&billing=${billing}`}
                                w="full"
                                size="lg"
                                bg={`linear-gradient(135deg, ${plan.color}, ${ACCENT_GOLD})`}
                                color="white"
                                fontWeight="700"
                                rightIcon={<ArrowRight size={16} />}
                                _hover={{
                                  transform: "translateY(-2px)",
                                  boxShadow: `0 8px 25px ${plan.color}66`,
                                }}
                                _active={{ transform: "translateY(0)" }}
                                transition="all 0.2s"
                              >
                                {t("indicator.subscribe_now", "Subscribe Now")}
                              </Button>
                              <HStack spacing={4} justify="center">
                                <HStack spacing={1}>
                                  <Icon as={Shield} boxSize={3} color="green.400" />
                                  <Text fontSize="xs" color={isDark ? "whiteAlpha.500" : "gray.400"}>
                                    {t("indicator.secure", "Secure Payment")}
                                  </Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Icon as={Clock} boxSize={3} color="green.400" />
                                  <Text fontSize="xs" color={isDark ? "whiteAlpha.500" : "gray.400"}>
                                    {t("indicator.instant", "Instant Access")}
                                  </Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Box>

                          {/* Bundle deal */}
                          <Box
                            w="full"
                            p={6}
                            bg={isDark
                              ? "linear-gradient(135deg, rgba(183, 162, 125, 0.08) 0%, rgba(20, 20, 30, 0.9) 100%)"
                              : "linear-gradient(135deg, rgba(183, 162, 125, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%)"
                            }
                            border="2px solid"
                            borderColor={ACCENT_GOLD}
                            borderRadius="2xl"
                            position="relative"
                            overflow="hidden"
                          >
                            <Badge
                              position="absolute"
                              top={3}
                              right={3}
                              bg="linear-gradient(135deg, #b7a27d, #d4af37)"
                              color="white"
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="700"
                            >
                              {t("indicator.best_value", "BEST VALUE")}
                            </Badge>
                            <VStack spacing={3}>
                              <Text fontWeight="700" fontSize="lg">
                                {t("indicator.bundle_name", "Complete Trading Suite")}
                              </Text>
                              <Text fontSize="sm" color={isDark ? "whiteAlpha.700" : "gray.600"}>
                                {t("indicator.bundle_desc", "All 3 indicators — Swing, Scalp & Day Trader")}
                              </Text>
                              <HStack align="baseline" spacing={1}>
                                <Text fontSize="sm" color={isDark ? "whiteAlpha.600" : "gray.500"}>$</Text>
                                <Text
                                  fontSize="3xl"
                                  fontWeight="800"
                                  bgGradient="linear(to-r, #b7a27d, #65a8bf)"
                                  bgClip="text"
                                >
                                  {billing === "monthly" ? BUNDLE.monthly : BUNDLE.yearly}
                                </Text>
                                <Text fontSize="sm" color={isDark ? "whiteAlpha.600" : "gray.500"}>
                                  /{billing === "monthly" ? t("indicator.mo", "mo") : t("indicator.yr", "yr")}
                                </Text>
                                <Badge colorScheme="green" fontSize="xs" ml={2}>
                                  {t("indicator.save_30", "Save 30%")}
                                </Badge>
                              </HStack>
                              <Button
                                as={RouterLink}
                                to={`/checkout?indicator=bundle&billing=${billing}`}
                                w="full"
                                size="lg"
                                bg="linear-gradient(135deg, #b7a27d, #65a8bf)"
                                color="white"
                                fontWeight="700"
                                rightIcon={<ArrowRight size={16} />}
                                _hover={{
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 8px 25px rgba(183, 162, 125, 0.4)",
                                }}
                                _active={{ transform: "translateY(0)" }}
                                transition="all 0.2s"
                              >
                                {t("indicator.get_bundle", "Get All 3 Indicators")}
                              </Button>
                            </VStack>
                          </Box>
                        </VStack>
                      </MotionBox>
                    </SimpleGrid>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </VStack>

          {/* ===== SOCIAL PROOF ===== */}
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              {t("indicator.reviews_title", "What Traders Say")}
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {TESTIMONIALS.map((review, idx) => (
                <MotionBox
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Box
                    p={6}
                    bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                    border="1px solid"
                    borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
                    borderRadius="2xl"
                    h="full"
                  >
                    <VStack align="start" spacing={3}>
                      <HStack>
                        {Array.from({ length: review.stars }).map((_, k) => (
                          <Icon key={k} as={Star} boxSize={4} color="#b7a27d" fill="#b7a27d" />
                        ))}
                      </HStack>
                      <Text fontSize="sm" color={isDark ? "whiteAlpha.800" : "gray.600"} fontStyle="italic">
                        "{t(review.key, [
                          "The Swing Trader Pro completely changed how I approach the markets. The auto Fibonacci and signal placement is incredibly accurate.",
                          "As a scalper, speed is everything. This indicator gives me clean entries on the 5m chart with tight stop losses. Game changer.",
                          "I was skeptical at first, but after 3 months my win rate went from 45% to 68%. The Day Trader indicator is worth every penny.",
                          "I got the bundle and use all three depending on the session. The auto-redraw feature when SL hits is brilliant — no more manual work.",
                        ][idx])}"
                      </Text>
                      <HStack>
                        <Avatar size="sm" name={review.name} bg={GOLD} color="white" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="700" fontSize="sm">{review.name}</Text>
                          <Text fontSize="xs" color={isDark ? "whiteAlpha.500" : "gray.400"}>
                            {review.role}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>

          {/* ===== KEY FEATURES GRID ===== */}
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              {t("indicator.features_title", "Built for Serious Traders")}
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 3 }} gap={5}>
              {[
                { icon: BarChart3, key: "indicator.feat_fib", fallback: "Auto Fibonacci Retracement" },
                { icon: Target, key: "indicator.feat_signals", fallback: "Smart Buy/Sell Signals" },
                { icon: Shield, key: "indicator.feat_sl", fallback: "Auto Stop-Loss Placement" },
                { icon: Zap, key: "indicator.feat_redraw", fallback: "Auto-Redraw on SL Hit" },
                { icon: TrendingUp, key: "indicator.feat_sr", fallback: "Support & Resistance Levels" },
                { icon: LineChart, key: "indicator.feat_channels", fallback: "Trend Channel Detection" },
              ].map((feat, idx) => (
                <VStack
                  key={idx}
                  p={5}
                  bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                  border="1px solid"
                  borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
                  borderRadius="xl"
                  spacing={3}
                  textAlign="center"
                >
                  <Icon as={feat.icon} boxSize={6} color={GOLD} />
                  <Text fontWeight="600" fontSize="sm">
                    {t(feat.key, feat.fallback)}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>

          {/* ===== FAQ ===== */}
          <VStack spacing={6} pb={8}>
            <Heading size="lg" textAlign="center">
              {t("indicator.faq_title", "Frequently Asked Questions")}
            </Heading>
            <VStack align="stretch" spacing={4} maxW="3xl" mx="auto" w="full">
              {[
                {
                  q: "indicator.faq1_q",
                  a: "indicator.faq1_a",
                  qf: "How do I add the indicator to TradingView?",
                  af: "After subscribing, you'll receive an invite link via email. Click it to add the indicator to your TradingView favorites. Then open any chart, click 'Indicators', and search for it in your invite-only scripts.",
                },
                {
                  q: "indicator.faq2_q",
                  a: "indicator.faq2_a",
                  qf: "What TradingView plan do I need?",
                  af: "Our indicators work on any TradingView plan, including the free plan. However, for real-time data on certain markets, you may need a paid TradingView subscription.",
                },
                {
                  q: "indicator.faq3_q",
                  a: "indicator.faq3_a",
                  qf: "Can I use it on any market?",
                  af: "Yes! The indicators work on Forex, Crypto, Stocks, Commodities, and Indices. The Fibonacci strategy is universal and adapts to any market.",
                },
                {
                  q: "indicator.faq4_q",
                  a: "indicator.faq4_a",
                  qf: "What happens when my stop-loss is hit?",
                  af: "The indicator automatically redraws the Fibonacci levels based on the new swing structure and generates fresh signals. No manual intervention needed.",
                },
                {
                  q: "indicator.faq5_q",
                  a: "indicator.faq5_a",
                  qf: "Can I cancel anytime?",
                  af: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.",
                },
              ].map((faq, idx) => (
                <Box
                  key={idx}
                  p={5}
                  bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                  border="1px solid"
                  borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
                  borderRadius="xl"
                >
                  <Text fontWeight="700" fontSize="sm" mb={2}>
                    {t(faq.q, faq.qf)}
                  </Text>
                  <Text fontSize="sm" color={isDark ? "whiteAlpha.700" : "gray.600"}>
                    {t(faq.a, faq.af)}
                  </Text>
                </Box>
              ))}
            </VStack>
          </VStack>

          {/* ===== RISK DISCLAIMER ===== */}
          <Box
            p={6}
            bg={isDark ? "rgba(255, 200, 0, 0.05)" : "rgba(255, 200, 0, 0.08)"}
            border="1px solid"
            borderColor="rgba(255, 200, 0, 0.2)"
            borderRadius="xl"
            mb={8}
          >
            <Text fontSize="xs" color={isDark ? "whiteAlpha.600" : "gray.500"} textAlign="center">
              {t(
                "indicator.disclaimer",
                "Risk Disclaimer: Trading involves substantial risk of loss. Past performance is not indicative of future results. These indicators are tools for analysis only and do not guarantee profits. Always use proper risk management. This is not financial advice."
              )}
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
