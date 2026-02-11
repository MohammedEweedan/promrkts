// src/pages/Broker.tsx
import React, { useEffect, useRef } from "react";
import { brokerFunnel } from "../utils/tracking";
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
  Divider,
  Image,
  useColorMode,
} from "@chakra-ui/react";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  LineChart,
  DollarSign,
  Clock,
  CheckCircle2,
  Zap,
  Globe,
  TrendingUp,
  ArrowRight,
  Smartphone,
  Monitor,
  BarChart3,
  Wallet,
} from "lucide-react";

import SpotlightCard from "../components/SpotlightCard";

const MotionBox = motion(Box);

const BRAND = "#65a8bf";
const GOLD = "#b7a27d";
const LDN_REGISTER = "https://ldnglobalmarkets.com/register-now/";

const IMG = {
  skyline: "/images/rand/ldn-skyline.png",
  dashboard: "/images/rand/dashboard-screenshot.png",
  platforms: "/images/rand/many-platforms.webp",
  features: "/images/rand/trading-features.png",
  fsa: "/images/rand/FSA-regulated.png",
  ib: "/images/rand/ib.png",
  advisors: "/images/rand/advisors.png",
  goldSilver: "/images/rand/gold-silver-bars.webp",
  candlesticks: "/images/rand/candlesticks.png",
  btc: "/images/rand/btc.png",
  eth: "/images/rand/eth.png",
  eur: "/images/rand/eur.png",
  gbp: "/images/rand/gbp.png",
  bofa: "/images/rand/bofa.png",
  shares: "/images/rand/shares.png",
  oil: "/images/rand/oil.png"
};

const MARKETS = [
  { name: "Forex", icon: IMG.eur, desc: "Trade 60+ major, minor & exotic currency pairs" },
  { name: "Crypto", icon: IMG.btc, desc: "BTC, ETH, and more with competitive leverage" },
  { name: "Metals", icon: IMG.goldSilver, desc: "Gold, silver & precious metals CFDs" },
  { name: "Indices", icon: IMG.candlesticks, desc: "S&P 500, NASDAQ, FTSE & global indices" },
  { name: "Commodities", icon: IMG.oil, desc: "Oil, gas & agricultural commodities" },
  { name: "Shares", icon: IMG.shares, desc: "Trade CFDs on top global company shares" },
];

const Broker: React.FC = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const hasTrackedPageView = useRef(false);

  const IB_LINK = process.env.REACT_APP_BROKER_IB_LINK || LDN_REGISTER;
  const cardBg = isDark ? "whiteAlpha.50" : "blackAlpha.30";
  const borderCol = isDark ? "whiteAlpha.100" : "gray.200";

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      brokerFunnel.pageViewed("ldn", "LDN Global Markets");
    }
  }, []);

  const handleJoin = () => {
    brokerFunnel.ctaClicked("primary_cta");
    brokerFunnel.linkOpened("ldn", "register");
    window.open(IB_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <Box py={{ base: 6, md: 12 }} mt="20px">
      <Container maxW="7xl">
        <VStack align="stretch" spacing={{ base: 8, md: 12 }}>

          {/* ═══════════════════ HERO ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Box
              position="relative"
              borderRadius="2xl"
              overflow="hidden"
              bg={isDark
                ? "linear-gradient(135deg, rgba(10,15,26,0.95), rgba(20,30,50,0.95))"
                : "linear-gradient(135deg, rgba(245,250,255,0.98), rgba(230,240,250,0.98))"
              }
              border="1px solid"
              borderColor={borderCol}
            >
              {/* Skyline background */}
              <Box
                position="absolute"
                inset={0}
                bgImage={`url(${IMG.skyline})`}
                bgSize="cover"
                bgPosition="center"
                opacity={isDark ? 0.18 : 0.25}
                pointerEvents="none"
              />

              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={0} position="relative">
                {/* Left — copy */}
                <VStack
                  align={{ base: "center", lg: "start" }}
                  spacing={5}
                  p={{ base: 6, md: 10 }}
                  textAlign={{ base: "center", lg: "left" }}
                >

                  <Heading
                    fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                    fontWeight="800"
                    lineHeight="1.1"
                    color="black"
                  >
                    Trade with{" "}
                    <Text as="span" bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`} bgClip="text">
                      LDN Global Markets
                    </Text>
                  </Heading>

                  <Text fontSize={{ base: "sm", md: "md" }} maxW="lg" color="black">
                    Join our preferred broker through our official IB link. Access 100+ instruments across Forex, Crypto, Metals & more with same-day withdrawals, tight spreads, and the powerful MT5 platform.
                  </Text>

                  <HStack spacing={4} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }} color="black">
                    <HStack spacing={2}>
                      <Icon as={ShieldCheck} color={BRAND} boxSize={4} />
                      <Text fontSize="xs">Licensed Broker</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={Zap} color={BRAND} boxSize={4} />
                      <Text fontSize="xs">Same-Day Withdrawals</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={Globe} color={BRAND} boxSize={4} />
                      <Text fontSize="xs">Global Access</Text>
                    </HStack>
                  </HStack>

                  <HStack spacing={3} pt={2} flexWrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
                    <Button
                      size="lg"
                      bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
                      color="white"
                      fontWeight="700"
                      px={8}
                      borderRadius="xl"
                      rightIcon={<ArrowRight size={18} />}
                      onClick={handleJoin}
                      _hover={{ transform: "translateY(-2px)", boxShadow: `0 8px 25px rgba(101,168,191,0.4)` }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.2s"
                    >
                      Open Account via IB Link
                    </Button>
                  </HStack>
                </VStack>

                {/* Right — metrics card */}
                <Box p={{ base: 4, md: 8 }} display="flex" alignItems="center" justifyContent="center">
                  <Box
                    w="100%"
                    maxW="400px"
                    bg={isDark ? "rgba(15,20,35,0.8)" : "white"}
                    border="1px solid"
                    borderColor={borderCol}
                    borderRadius="2xl"
                    color="black"
                    p={6}
                    backdropFilter="blur(10px)"
                  >
                    <SimpleGrid columns={2} gap={4}>
                      {[
                        { label: "Spreads from", value: "0.0 pips", sub: "On major FX pairs", icon: DollarSign },
                        { label: "Leverage up to", value: "1:500", sub: "Varies by instrument", icon: TrendingUp },
                        { label: "Withdrawals", value: "Same Day", sub: "No withdrawal fees", icon: Wallet },
                        { label: "Instruments", value: "100+", sub: "Forex, Crypto, Metals", icon: BarChart3 },
                      ].map((m, i) => (
                        <VStack key={i} align="start" spacing={1} p={3} bg={cardBg} borderRadius="lg">
                          <Icon as={m.icon} color={BRAND} boxSize={4} />
                          <Text fontWeight="700" fontSize="md">{m.value}</Text>
                          <Text fontSize="2xs">{m.label}</Text>
                          <Text fontSize="2xs">{m.sub}</Text>
                        </VStack>
                      ))}
                    </SimpleGrid>

                    <Image
                      src={IMG.fsa}
                      alt="FSA Regulated"
                      h="50px"
                      objectFit="contain"
                      mx="auto"
                      mt={4}
                      opacity={isDark ? 0.7 : 0.8}
                    />
                  </Box>
                </Box>
              </SimpleGrid>
            </Box>
          </MotionBox>

          {/* ═══════════════════ WHY THROUGH OUR IB ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SpotlightCard>
              <Box p={{ base: 5, md: 8 }}>
                <VStack spacing={3} textAlign="center" mb={6}>
                  <Heading size={{ base: "md", md: "lg" }} bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`} bgClip="text">
                    Why Register Through Our IB Link?
                  </Heading>
                  <Text fontSize="sm" maxW="2xl">
                    By signing up through our official Introducing Broker link, you support promrkts while getting the same great trading conditions. We negotiate on your behalf for the best possible experience.
                  </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
                  {[
                    { icon: DollarSign, title: "Competitive Spreads", desc: "Access tight spreads from 0.0 pips on major pairs, aligned with how we actually trade." },
                    { icon: Clock, title: "Same-Day Withdrawals", desc: "Get your money the same day you request it — no fees for deposits or withdrawals." },
                    { icon: ShieldCheck, title: "Aligned Conditions", desc: "Trade under the same conditions we use. Your success is our success as IB partners." },
                  ].map((b, i) => (
                    <VStack
                      key={i}
                      p={5}
                      bg={cardBg}
                      align="start"
                    >
                      <Icon as={b.icon} color={BRAND} boxSize={6} />
                      <Text fontWeight="700">{b.title}</Text>
                      <Text fontSize="sm">{b.desc}</Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </Box>
            </SpotlightCard>
          </MotionBox>

          {/* ═══════════════════ TRADEABLE MARKETS ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={4} textAlign="center" mb={6}>
              <Heading size={{ base: "md", md: "lg" }}>
                Trade 100+ Instruments
              </Heading>
              <Text fontSize="sm" maxW="xl">
                Access a wide range of global markets from a single MT5 account.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 3 }} gap={4}>
              {MARKETS.map((m, i) => (
                <MotionBox
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  viewport={{ once: true }}
                >
                  <VStack
                    p={5}
                    bg={cardBg}
                    spacing={3}
                    _hover={{ borderColor: BRAND, transform: "translateY(-3px)" }}
                    transition="all 0.2s"
                    h="100%"
                  >
                    <Image src={m.icon} alt={m.name} h="36px" objectFit="contain" />
                    <Text fontWeight="700" fontSize="sm">{m.name}</Text>
                    <Text fontSize="xs" textAlign="center">{m.desc}</Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>

          {/* ═══════════════════ PLATFORM & FEATURES ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} alignItems="center">
              <VStack align="start" spacing={5}>
                <Heading size={{ base: "md", md: "lg" }}>
                  Powerful{" "}
                  <Text as="span" color={BRAND}>MT5</Text>{" "}
                  Trading Platform
                </Heading>
                <Text fontSize="sm">
                  Trade on desktop, web, or mobile with the industry-leading MetaTrader 5 platform. Advanced charting, one-click trading, and algorithmic trading support.
                </Text>

                <SimpleGrid columns={2} gap={3} w="100%">
                  {[
                    { icon: Monitor, label: "MT5 Desktop" },
                    { icon: Globe, label: "MT5 Web Trader" },
                    { icon: Smartphone, label: "MT5 Mobile" },
                    { icon: LineChart, label: "Advanced Charts" },
                  ].map((p, i) => (
                    <HStack
                      key={i}
                      p={3}
                      bg={cardBg}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={borderCol}
                      spacing={3}
                    >
                      <Icon as={p.icon} color={BRAND} boxSize={5} />
                      <Text fontSize="sm" fontWeight="600">{p.label}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>

                <Button
                  size="md"
                  bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
                  color="white"
                  fontWeight="700"
                  borderRadius="xl"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={handleJoin}
                  _hover={{ transform: "translateY(-2px)", boxShadow: `0 8px 25px rgba(101,168,191,0.4)` }}
                  transition="all 0.2s"
                >
                  Start Trading on MT5
                </Button>
              </VStack>

              <Box borderRadius="xl" overflow="hidden">
                <Image
                  src={IMG.platforms}
                  alt="LDN Global Markets Platforms"
                  w="100%"
                  objectFit="cover"
                />
              </Box>
            </SimpleGrid>
          </MotionBox>

          {/* ═══════════════════ TRADING FEATURES SHOWCASE ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} alignItems="center">
              <Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor={borderCol} order={{ base: 2, lg: 1 }}>
                <Image
                  src={IMG.features}
                  alt="Trading Features"
                  w="100%"
                  objectFit="cover"
                />
              </Box>

              <VStack align="start" spacing={5} order={{ base: 1, lg: 2 }}>
                <Heading size={{ base: "md", md: "lg" }}>
                  Built for{" "}
                  <Text as="span" bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`} bgClip="text">
                    Serious Traders
                  </Text>
                </Heading>

                <VStack align="start" spacing={3} w="100%">
                  {[
                    "Spreads from 0.0 pips on major pairs",
                    "Leverage up to 1:500",
                    "Same-day withdrawals with zero fees",
                    "No deposit fees — fund instantly",
                    "100+ tradeable instruments",
                    "24/5 multilingual support",
                  ].map((f, i) => (
                    <HStack key={i} spacing={3}>
                      <Icon as={CheckCircle2} color="green.500" boxSize={4} flexShrink={0} />
                      <Text fontSize="sm">{f}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </SimpleGrid>
          </MotionBox>

          {/* ═══════════════════ DASHBOARD PREVIEW ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <VStack spacing={4} textAlign="center" mb={4}>
              <Heading size={{ base: "md", md: "lg" }}>
                Client App
              </Heading>
              <Text fontSize="sm" maxW="xl">
                Manage your accounts, deposits, and withdrawals from a clean, intuitive dashboard.
              </Text>
            </VStack>
            <Box justifyContent="center" alignItems="center">
              <Image src={IMG.dashboard} alt="LDN Dashboard" />
            </Box>
          </MotionBox>

          {/* ═══════════════════ HOW TO GET STARTED ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SpotlightCard>
              <Box p={{ base: 5, md: 8 }}>
                <VStack spacing={3} textAlign="center" mb={6}>
                  <Heading size={{ base: "md", md: "lg" }} bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`} bgClip="text">
                    Start Trading in 3 Steps
                  </Heading>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                  {[
                    { step: "01", title: "Register", desc: "Click our IB link and complete the fast, secure registration form.", icon: Globe },
                    { step: "02", title: "Fund", desc: "Deposit using a wide range of methods — no fees, instant processing.", icon: Wallet },
                    { step: "03", title: "Trade", desc: "Start trading 100+ instruments on MT5 with competitive conditions.", icon: TrendingUp },
                  ].map((s, i) => (
                    <VStack
                      key={i}
                      p={6}
                      bg={cardBg}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={borderCol}
                      spacing={3}
                      textAlign="center"
                    >
                      <Text fontSize="3xl" fontWeight="800" bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`} bgClip="text">
                        {s.step}
                      </Text>
                      <Icon as={s.icon} color={BRAND} boxSize={6} />
                      <Text fontWeight="700">{s.title}</Text>
                      <Text fontSize="sm">{s.desc}</Text>
                    </VStack>
                  ))}
                </SimpleGrid>

                <VStack pt={6}>
                  <Button
                    size="lg"
                    bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
                    color="white"
                    fontWeight="700"
                    px={10}
                    borderRadius="xl"
                    rightIcon={<ArrowRight size={18} />}
                    onClick={handleJoin}
                    _hover={{ transform: "translateY(-2px)", boxShadow: `0 8px 25px rgba(101,168,191,0.4)` }}
                    transition="all 0.2s"
                  >
                    Open Your Account Now
                  </Button>
                </VStack>
              </Box>
            </SpotlightCard>
          </MotionBox>

          {/* ═══════════════════ ADVISORS / SUPPORT ═══════════════════ */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} alignItems="center">
              <VStack align="start" spacing={4}>
                <Heading size={{ base: "md", md: "lg" }}>
                  Dedicated Support & Advisors
                </Heading>
                <Text fontSize="sm">
                  LDN Global Markets provides multilingual support, personal account managers, and educational resources to help you succeed.
                </Text>
                <VStack align="start" spacing={2}>
                  {[
                    "24/5 multilingual customer support",
                    "Personal account managers",
                    "Free webinars & educational seminars",
                    "Demo accounts for risk-free practice",
                    "Secure payment processing",
                  ].map((s, i) => (
                    <HStack key={i} spacing={3}>
                      <Icon as={CheckCircle2} color="green.500" boxSize={4} flexShrink={0} />
                      <Text fontSize="sm">{s}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              <Box borderRadius="xl" overflow="hidden">
                <Image src={IMG.advisors} alt="LDN Advisors" w="100%" objectFit="cover" />
              </Box>
            </SimpleGrid>
          </MotionBox>

          {/* ═══════════════════ RISK & COMPLIANCE ═══════════════════ */}
          <Box
            p={{ base: 5, md: 8 }}
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderCol}
          >
            <HStack mb={4} spacing={3}>
              <Icon as={ShieldCheck} color={BRAND} boxSize={5} />
              <Heading size="sm">Licensing & Risk Disclosure</Heading>
            </HStack>

            <VStack align="start" spacing={3}>
              <Text fontSize="xs">
                <strong>Licensing:</strong> LDN GLOBAL MARKETS LLC is an officially licensed broker holding an International Brokerage License in Saint Vincent and the Grenadines, numbered 1547 LLC. Registered address: Richmond Hill Rd, Kingstown, St. Vincent and the Grenadines, VC0100. Additionally registered with license number T2023240 on Bonovo Road in Fomboni, Island of Mohéli, Comoros Union.
              </Text>
              <Text fontSize="xs">
                <strong>Physical Address:</strong> Vasiliou Vrionidi 6, 5th floor, office 6, 3095 Limassol.
              </Text>
              <Text fontSize="xs">
                <strong>Risk Warning:</strong> CFDs are complex financial products traded on margin. Trading CFDs carries a high level of risk — you may lose all your invested capital. CFDs may not be suitable for all investors. Please ensure you fully understand the risks involved and seek independent advice if necessary.
              </Text>
              <Text fontSize="xs">
                <strong>Restricted Regions:</strong> LDN Global Markets does not provide services to citizens/residents of the United States, United Kingdom, Canada, Japan, EU countries, Iran, Israel, and North Korea.
              </Text>
            </VStack>
          </Box>

          <Divider borderColor={borderCol} />

          {/* ═══════════════════ PARTNERSHIP FOOTER ═══════════════════ */}
          <VStack spacing={3} py={4} textAlign="center">
            <HStack spacing={4} align="center" justify="center">
              <Text
                fontSize="lg"
                fontWeight="800"
                bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`}
                bgClip="text"
              >
                LDN Global Markets
              </Text>
              <Text fontSize="xl" fontWeight="800">×</Text>
              <Text fontSize="lg" fontWeight="800">promrkts</Text>
            </HStack>
            <Text fontSize="xs">
              Official Introducing Broker (IB) Partnership
            </Text>
            <Text fontSize="xs">
              © {new Date().getFullYear()} LDN Global Markets. All rights reserved.
            </Text>
          </VStack>

        </VStack>
      </Container>
    </Box>
  );
};

export default Broker;
