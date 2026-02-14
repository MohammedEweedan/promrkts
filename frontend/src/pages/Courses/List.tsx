import React, { useEffect, useRef } from "react";
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
  Alert,
  AlertIcon,
  Spacer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { productFunnel } from "../../utils/tracking";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/client";
import { useTranslation } from "react-i18next";
import { Star, Users, Award, Zap, CheckCircle, ArrowRight, Sparkles, LineChart, Crosshair, Monitor } from "lucide-react";
// CheckCircle and ArrowRight used in enhanced course cards below
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type Review = { rating: number };

type CourseTier = {
  id: string;
  name: string;
  description: string;
  price_usdt: number;
  price_stripe: number; // cents
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating?: number; // explicit avg (optional)
  latestReviews?: Review[]; // reviews to derive avg from (optional)
  reviewsCount?: number; // optional total count
  isVipProduct?: boolean;
  productType?: string;
  challengePlatform?: string | null;
  challengeMeta?: any;
};

const levelKey = (lvl: CourseTier["level"]) =>
  ({
    BEGINNER: "levels.beginner",
    INTERMEDIATE: "levels.intermediate",
    ADVANCED: "levels.advanced",
  }[lvl]);

const GOLD = "#65a8bf";

// put near the top, below GOLD
const isVip = (t: Partial<CourseTier>) => {
  const v: any = (t as any)?.isVipProduct;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
};

const CoursesList: React.FC = () => {
  const { t } = useTranslation() as any;
  const [tiers, setTiers] = React.useState<CourseTier[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [platformStats, setPlatformStats] = React.useState<{
    users: number; purchases: number; buyersPerCourse: Record<string, number>;
  }>({ users: 0, purchases: 0, buyersPerCourse: {} });
  const { isOpen: isExitOpen, onOpen: onExitOpen, onClose: onExitClose } = useDisclosure();
  const [hasShownExit, setHasShownExit] = React.useState(false);
  const hasTrackedListView = useRef(false);

  // Track product list view on mount
  useEffect(() => {
    if (!hasTrackedListView.current) {
      hasTrackedListView.current = true;
      productFunnel.listViewed('all');
    }
  }, []);

  // Exit-intent detection
  React.useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownExit) {
        setHasShownExit(true);
        onExitOpen();
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !hasShownExit) {
        setHasShownExit(true);
        onExitOpen();
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasShownExit, onExitOpen]);

  React.useEffect(() => {
    (async () => {
      try {
        // Load courses + subscriptions + public stats
        const [coursesResp, subsResp, statsResp] = await Promise.all([
          api.get("/courses").catch(() => ({ data: [] })),
          api.get("/subscriptions").catch(() => ({ data: [] })),
          api.get("/stats/public").catch(() => ({ data: {} })),
        ]);
        const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
        const subs = Array.isArray(subsResp.data) ? subsResp.data : [];
        setTiers([...courses, ...subs]);
        if (statsResp.data) {
          setPlatformStats({
            users: statsResp.data.users || 0,
            purchases: statsResp.data.purchases || 0,
            buyersPerCourse: statsResp.data.buyersPerCourse || {},
          });
        }
      } catch (e: any) {
        setError(
          e?.response?.data?.message || t("errors.load_failed", { defaultValue: "Failed to load." })
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const { guidesOnly, communityOnly, freeGuide } = React.useMemo(() => {
    const guides = tiers.filter(
      (x: any) => String((x as any)?.productType || "").toUpperCase() === "COURSE"
    );
    const community = tiers.filter((x) => isVip(x));
    const free = guides.find((g) => (g.price_usdt ?? 0) <= 0);
    return { guidesOnly: guides, communityOnly: community, freeGuide: free };
  }, [tiers]);

  const renderSnippetStyleStars = (tier: CourseTier) => {
    const explicit = Number((tier as any)?.rating);
    const arr = Array.isArray((tier as any)?.latestReviews) ? (tier as any).latestReviews : [];
    const fromReviews =
      arr.length > 0
        ? arr.reduce((s: number, r: any) => s + (Number(r?.rating) || 0), 0) / arr.length
        : 0;
    const avg = explicit > 0 ? explicit : fromReviews;

    if (!avg || Number.isNaN(avg)) return null;

    const full = Math.round(avg);
    return (
      <HStack justify="center" gap={1}>
        {Array.from({ length: 5 }).map((_, k) => (
          <Icon
            key={k}
            as={Star}
            boxSize={4}
            color={k < full ? GOLD : "gray.400"}
            fill={k < full ? GOLD : "none"}
          />
        ))}
      </HStack>
    );
  };

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box py={{ base: 4, md: 10 }}>
      {/* Premium Hero Section */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        position="relative"
        overflow="hidden"
        py={{ base: 12, md: 16 }}
        px={{ base: 4, md: 8 }}
        mb={8}
        borderRadius="2xl"
        mx={{ base: 4, md: 8 }}
      >
        <VStack spacing={{ base: 6, md: 8 }} textAlign="center" maxW="4xl" mx="auto">

          {/* Main headline */}
          <Heading
            as="h1"
            size={{ base: 'xl', md: '2xl' }}
            fontWeight="800"
            lineHeight="shorter"
          >
            <Text
              as="span"
              bgGradient="linear(to-r, #65a8bf, #b7a27d)"
              bgClip="text"
            >
              {t("hero.title_part1", { defaultValue: "Master the Markets." })}
            </Text>{' '}
            {t("hero.title_part2", { defaultValue: "Build Your Wealth." })}
          </Heading>
        </VStack>
      </MotionBox>

      <Container maxW="7xl">
        <VStack align="stretch" gap={6}>

          <Alert status="info" variant="subtle" borderRadius="xl" bg={isDark ? 'rgba(101, 168, 191, 0.1)' : 'rgba(101, 168, 191, 0.08)'} border="1px solid" borderColor="rgba(101, 168, 191, 0.3)">
            <AlertIcon color={GOLD} />
            <HStack w="full" gap={3} flexWrap="wrap">
              <Text>
                {t("notes.usdt_trc20", {
                  defaultValue: "All USDT deposits must be sent via the TRC20 (TRON) network.",
                })}
              </Text>
              <Spacer />
              <Button
                as={RouterLink}
                to="/guide/crypto"
                size="sm"
                variant="outline"
                borderColor={GOLD}
                color={GOLD}
                _hover={{ bg: 'rgba(101, 168, 191, 0.1)' }}
              >
                {t("actions.crypto_guide", { defaultValue: "Guide to crypto" })}
              </Button>
            </HStack>
          </Alert>

          {loading && <Text>{t("common.loading", { defaultValue: "Loading..." })}</Text>}
          {error && <Text color="red.500">{error}</Text>}
          {!loading && !error && tiers.length === 0 && (
            <Text>{t("states.empty", { defaultValue: "No courses available yet." })}</Text>
          )}

          {!loading && !error && tiers.length > 0 && (
            <Tabs isFitted variant="unstyled" w="full">
              <TabList w="full" borderRadius="xl" p="2" gap="2">
                <Tab
                  borderRadius="md"
                  fontWeight="semibold"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  _selected={{ bg: "#65a8bf" }}
                >
                  {t("guides.tab", { defaultValue: "Guides" })}
                </Tab>
                <Tab
                  borderRadius="md"
                  fontWeight="semibold"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  _selected={{ bg: "#65a8bf" }}
                >
                  {t("community.tab", { defaultValue: "Community" })}
                </Tab>
                <Tab
                  borderRadius="md"
                  fontWeight="semibold"
                  _hover={{ bg: "rgba(255,255,255,0.08)" }}
                  _selected={{ bg: "linear-gradient(135deg, #65a8bf, #b7a27d)" }}
                >
                  {t("indicators.tab", { defaultValue: "Indicators" })}
                </Tab>
              </TabList>
              <TabPanels>
                {/* Guides tab */}
                <TabPanel px={0}>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 2 }} gap={{ base: 6, md: 8 }}>
                    {guidesOnly.map((tier, idx) => {
                      const isFree = (tier.price_usdt ?? 0) <= 0;
                      const isFeatured = idx === 0;
                      const levelColors: Record<string, string> = {
                        BEGINNER: 'green.500',
                        INTERMEDIATE: '#65a8bf',
                        ADVANCED: '#b7a27d',
                      };
                      return (
                        <MotionBox
                          key={tier.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <Box
                            position="relative"
                            bg={
                              isDark
                                ? "linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(30, 30, 45, 0.9) 100%)"
                                : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 255, 0.95) 100%)"
                            }
                            border="1px solid"
                            borderColor={isFeatured ? "#b7a27d" : "rgba(101, 168, 191, 0.3)"}
                            borderRadius="2xl"
                            overflow="hidden"
                            boxShadow={
                              isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.1)"
                            }
                            _hover={{
                              borderColor: "#65a8bf",
                              boxShadow: "0 12px 40px rgba(101, 168, 191, 0.3)",
                            }}
                            transition="all 0.3s ease"
                          >
                            {/* Featured badge */}
                            {isFeatured && (
                              <Box
                                position="absolute"
                                top={4}
                                right={-8}
                                bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                                color="white"
                                px={10}
                                py={1}
                                fontSize="xs"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                transform="rotate(45deg)"
                                transformOrigin="center"
                                boxShadow="0 2px 10px rgba(0,0,0,0.2)"
                              >
                                {t("products.popular", { defaultValue: "Popular" })}
                              </Box>
                            )}

                            <VStack align="stretch" spacing={4} p={6}>
                              {/* Header */}
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1} flex="1">
                                  <Heading
                                    size="md"
                                    noOfLines={2}
                                    bgGradient={
                                      isFeatured
                                        ? "linear(to-r, #65a8bf, #b7a27d)"
                                        : "linear(to-r, #65a8bf, #b7a27d)"
                                    }
                                    bgClip={isFeatured ? "text" : "text"}
                                  >
                                    {tier.name}
                                  </Heading>
                                  <Badge
                                    bg={levelColors[tier.level] || "#65a8bf"}
                                    color="white"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="600"
                                  >
                                    {t(levelKey(tier.level as any))}
                                  </Badge>
                                </VStack>
                              </HStack>

                              {/* Description */}
                              <Text
                                fontSize="sm"
                                color={isDark ? "whiteAlpha.700" : "gray.600"}
                                noOfLines={3}
                              >
                                {tier.description}
                              </Text>

                              {/* Social proof — real buyers count */}
                              <HStack spacing={4}>
                                {renderSnippetStyleStars(tier)}
                                {(platformStats.buyersPerCourse[tier.id] ?? 0) > 0 && (
                                  <HStack spacing={1} color={isDark ? "whiteAlpha.600" : "gray.500"}>
                                    <Icon as={Users} boxSize={4} color="#65a8bf" />
                                    <Text
                                      fontSize="sm"
                                      color={isDark ? "whiteAlpha.700" : "gray.600"}
                                    >
                                      {t("products.buyers_count", {
                                        defaultValue: "{{count}} purchased",
                                        count: platformStats.buyersPerCourse[tier.id],
                                      })}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>

                              {/* Value props */}
                              <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text
                                    fontSize="sm"
                                    color={isDark ? "whiteAlpha.800" : "gray.700"}
                                  >
                                    {t("products.lifetime_access", {
                                      defaultValue: "Lifetime access",
                                    })}
                                  </Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text
                                    fontSize="sm"
                                    color={isDark ? "whiteAlpha.800" : "gray.700"}
                                  >
                                    {t("products.certificate_included", {
                                      defaultValue: "Certificate included",
                                    })}
                                  </Text>
                                </HStack>
                              </VStack>

                              {/* Price section */}
                              <HStack justify="space-between" align="center" pt={2}>
                                <VStack align="start" spacing={0}>
                                  <HStack align="baseline" spacing={1}>
                                    {isFree ? (
                                      <Text fontSize="2xl" fontWeight="800" color="green.500">
                                        {t("products.free", { defaultValue: "FREE" })}
                                      </Text>
                                    ) : (
                                      <>
                                        <Text
                                          fontSize="sm"
                                          color={isDark ? "whiteAlpha.600" : "gray.500"}
                                        >
                                          $
                                        </Text>
                                        <Text
                                          fontSize="2xl"
                                          fontWeight="800"
                                          bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                                          bgClip="text"
                                        >
                                          {tier.price_usdt}
                                        </Text>
                                      </>
                                    )}
                                  </HStack>
                                </VStack>

                                <VStack spacing={2}>
                                  <Button
                                    as={RouterLink}
                                    to={
                                      isFree ? `/learn/${tier.id}` : `/checkout?tierId=${tier.id}`
                                    }
                                    size="md"
                                    bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                                    color="white"
                                    fontWeight="700"
                                    px={6}
                                    rightIcon={<ArrowRight size={16} />}
                                    _hover={{
                                      transform: "translateY(-2px)",
                                      boxShadow: "0 8px 25px rgba(101, 168, 191, 0.4)",
                                    }}
                                    _active={{ transform: "translateY(0)" }}
                                    transition="all 0.2s"
                                  >
                                    {isFree
                                      ? t("actions.start_free", { defaultValue: "Start Free" })
                                      : t("actions.enroll", { defaultValue: "Enroll Now" })}
                                  </Button>
                                  <Button
                                    as={RouterLink}
                                    to={`/products/${tier.id}`}
                                    variant="ghost"
                                    size="sm"
                                    color="#65a8bf"
                                    _hover={{ bg: "transparent", textDecoration: "underline" }}
                                  >
                                    {t("actions.view_details", { defaultValue: "View Details" })}
                                  </Button>
                                </VStack>
                              </HStack>

                              {/* Trust indicator */}
                              <HStack justify="center" spacing={4} pt={2}>
                                <HStack spacing={1} color={isDark ? "whiteAlpha.500" : "gray.400"}>
                                  <Icon as={Award} boxSize={3} />
                                  <Text fontSize="xs">
                                    {t("products.certificate", { defaultValue: "Certificate" })}
                                  </Text>
                                </HStack>
                                <HStack spacing={1} color={isDark ? "whiteAlpha.500" : "gray.400"}>
                                  <Icon as={Zap} boxSize={3} />
                                  <Text fontSize="xs">
                                    {t("products.lifetime_access", {
                                      defaultValue: "Lifetime Access",
                                    })}
                                  </Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Box>
                        </MotionBox>
                      );
                    })}
                    {guidesOnly.length === 0 && (
                      <Text>{t("guides.none", { defaultValue: "No guides available yet." })}</Text>
                    )}
                  </SimpleGrid>
                </TabPanel>
                {/* Community tab */}
                <TabPanel px={0}>
                  <SimpleGrid columns={{ base: 1, lg: 1 }} gap={{ base: 6, md: 8 }}>
                    {communityOnly.map((tier, idx) => (
                      <MotionBox
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Box
                          position="relative"
                          bg={isDark
                            ? 'linear-gradient(135deg, rgba(183, 162, 125, 0.08) 0%, rgba(20, 20, 30, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(183, 162, 125, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%)'
                          }
                          border="1px solid"
                          borderColor="#b7a27d"
                          borderRadius="2xl"
                          overflow="hidden"
                          boxShadow={isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)'}
                          _hover={{
                            borderColor: '#65a8bf',
                            boxShadow: '0 12px 40px rgba(183, 162, 125, 0.3)',
                          }}
                          transition="all 0.3s ease"
                        >
                          {/* VIP Badge */}
                          <Box
                            position="absolute"
                            top={4}
                            right={-8}
                            bg="linear-gradient(135deg, #b7a27d, #d4af37)"
                            color="white"
                            px={10}
                            py={1}
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            transform="rotate(45deg)"
                            transformOrigin="center"
                            boxShadow="0 2px 10px rgba(0,0,0,0.2)"
                          >
                            VIP
                          </Box>

                          <HStack justify="space-between" align="center" flexWrap="wrap" gap={6} p={6}>
                            <VStack align="start" spacing={3} flex="1">
                              <Heading
                                size={{ base: "md", md: "lg" }}
                                bgGradient="linear(to-r, #b7a27d, #65a8bf)"
                                bgClip="text"
                              >
                                {tier.name}
                              </Heading>
                              <Text color={isDark ? 'whiteAlpha.800' : 'gray.600'} maxW="lg">
                                {tier.description}
                              </Text>
                              <HStack spacing={4} flexWrap="wrap">
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text fontSize="sm">{t("community.exclusive_signals", { defaultValue: "Exclusive signals" })}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text fontSize="sm">{t("community.live_sessions", { defaultValue: "Live trading sessions" })}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text fontSize="sm">{t("community.mentor_access", { defaultValue: "Direct mentor access" })}</Text>
                                </HStack>
                              </HStack>
                            </VStack>
                            
                            <VStack spacing={3} align="center">
                              <VStack spacing={0}>
                                <Text
                                  fontSize="3xl"
                                  fontWeight="800"
                                  bgGradient="linear(to-r, #b7a27d, #65a8bf)"
                                  bgClip="text"
                                >
                                  ${tier.price_usdt}
                                </Text>
                                <Text fontSize="sm" color={isDark ? 'whiteAlpha.600' : 'gray.500'}>{t("products.per_month", { defaultValue: "per month" })}</Text>
                              </VStack>
                              <Button
                                as={RouterLink}
                                to={`/checkout?tierId=${tier.id}`}
                                size="lg"
                                bg="linear-gradient(135deg, #b7a27d, #65a8bf)"
                                color="white"
                                fontWeight="700"
                                px={8}
                                rightIcon={<ArrowRight size={16} />}
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 25px rgba(183, 162, 125, 0.4)',
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                transition="all 0.2s"
                              >
                                {t("actions.subscribe", { defaultValue: "Join VIP" })}
                              </Button>
                            </VStack>
                          </HStack>
                        </Box>
                      </MotionBox>
                    ))}
                    {communityOnly.length === 0 && (
                      <Text>
                        {t("community.none", { defaultValue: "No community subscriptions available." })}
                      </Text>
                    )}
                  </SimpleGrid>
                </TabPanel>
                {/* Indicators tab */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <Box
                      textAlign="center"
                      p={{ base: 8, md: 12 }}
                      borderRadius="2xl"
                      bg={isDark
                        ? 'linear-gradient(135deg, rgba(101, 168, 191, 0.06) 0%, rgba(183, 162, 125, 0.06) 100%)'
                        : 'linear-gradient(135deg, rgba(101, 168, 191, 0.04) 0%, rgba(183, 162, 125, 0.04) 100%)'
                      }
                      border="1px solid"
                      borderColor={isDark ? 'rgba(101, 168, 191, 0.2)' : 'rgba(101, 168, 191, 0.15)'}
                    >
                      <VStack spacing={4}>
                        <Badge
                          bg="rgba(101, 168, 191, 0.12)"
                          color={GOLD}
                          px={4}
                          py={1.5}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="700"
                          textTransform="uppercase"
                        >
                          {t("indicators.badge", { defaultValue: "TradingView" })}
                        </Badge>
                        <Heading
                          size={{ base: 'md', md: 'lg' }}
                          bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                          bgClip="text"
                          fontWeight="800"
                        >
                          {t("indicators.hero_title", { defaultValue: "Proprietary Trading Indicators" })}
                        </Heading>
                        <Text color={isDark ? 'whiteAlpha.700' : 'gray.600'} maxW="xl" mx="auto">
                          {t("indicators.hero_sub", { defaultValue: "Auto Fibonacci, smart signals, and precision entries — built for TradingView, designed for serious traders." })}
                        </Text>
                      </VStack>
                    </Box>

                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                      {[
                        { key: 'swing', icon: LineChart, color: '#65a8bf', price: 39, timeframe: '4H — Weekly', desc: 'Swing trading with auto Fibonacci on prominent swings. Buy at 0.314, sell at 0.88 with auto SL & redraw.' },
                        { key: 'scalp', icon: Crosshair, color: '#b7a27d', price: 29, timeframe: '1M — 15M', desc: 'Fast scalping entries with volume & trend confirmation. Optimized for quick in-and-out trades.' },
                        { key: 'daily', icon: Monitor, color: '#65a8bf', price: 34, timeframe: '1H — Daily', desc: 'Day trading with EMA confluence, VWAP, session filters, and dual take-profit levels.' },
                      ].map((ind, idx) => (
                        <MotionBox
                          key={ind.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <Box
                            position="relative"
                            bg={isDark
                              ? 'linear-gradient(135deg, rgba(20, 20, 30, 0.9) 0%, rgba(30, 30, 45, 0.9) 100%)'
                              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 255, 0.95) 100%)'
                            }
                            border="1px solid"
                            borderColor={`${ind.color}40`}
                            borderRadius="2xl"
                            overflow="hidden"
                            boxShadow={isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)'}
                            _hover={{ borderColor: ind.color, boxShadow: `0 12px 40px ${ind.color}33` }}
                            transition="all 0.3s ease"
                          >
                            <VStack align="stretch" spacing={4} p={6}>
                              <HStack justify="space-between">
                                <HStack spacing={3}>
                                  <Box
                                    w={10} h={10} borderRadius="xl"
                                    bg={`${ind.color}20`}
                                    display="flex" alignItems="center" justifyContent="center"
                                  >
                                    <Icon as={ind.icon} boxSize={5} color={ind.color} />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Heading size="sm">
                                      {t(`indicators.${ind.key}.name`, { defaultValue: `${ind.key.charAt(0).toUpperCase() + ind.key.slice(1)} Trader Pro` })}
                                    </Heading>
                                    <Badge bg={`${ind.color}20`} color={ind.color} borderRadius="full" fontSize="xs">
                                      {ind.timeframe}
                                    </Badge>
                                  </VStack>
                                </HStack>
                              </HStack>

                              <Text fontSize="sm" color={isDark ? 'whiteAlpha.700' : 'gray.600'} noOfLines={3}>
                                {t(`indicators.${ind.key}.desc`, { defaultValue: ind.desc })}
                              </Text>

                              <VStack align="start" spacing={1}>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text fontSize="sm" color={isDark ? 'whiteAlpha.800' : 'gray.700'}>
                                    {t("indicators.feat_fib", { defaultValue: "Auto Fibonacci retracement" })}
                                  </Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text fontSize="sm" color={isDark ? 'whiteAlpha.800' : 'gray.700'}>
                                    {t("indicators.feat_signals", { defaultValue: "Smart buy/sell signals" })}
                                  </Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={CheckCircle} boxSize={4} color="green.500" />
                                  <Text fontSize="sm" color={isDark ? 'whiteAlpha.800' : 'gray.700'}>
                                    {t("indicators.feat_redraw", { defaultValue: "Auto-redraw on SL hit" })}
                                  </Text>
                                </HStack>
                              </VStack>

                              <HStack justify="space-between" align="center" pt={2}>
                                <HStack align="baseline" spacing={1}>
                                  <Text fontSize="sm" color={isDark ? 'whiteAlpha.600' : 'gray.500'}>$</Text>
                                  <Text fontSize="2xl" fontWeight="800" bgGradient={`linear(to-r, ${ind.color}, #b7a27d)`} bgClip="text">
                                    {ind.price}
                                  </Text>
                                  <Text fontSize="sm" color={isDark ? 'whiteAlpha.600' : 'gray.500'}>/mo</Text>
                                </HStack>
                                <Button
                                  as={RouterLink}
                                  to={`/products/indicators?tab=${ind.key}`}
                                  size="md"
                                  bg={`linear-gradient(135deg, ${ind.color}, #b7a27d)`}
                                  color="white"
                                  fontWeight="700"
                                  px={6}
                                  rightIcon={<ArrowRight size={16} />}
                                  _hover={{ transform: 'translateY(-2px)', boxShadow: `0 8px 25px ${ind.color}66` }}
                                  _active={{ transform: 'translateY(0)' }}
                                  transition="all 0.2s"
                                >
                                  {t("indicators.subscribe", { defaultValue: "Subscribe" })}
                                </Button>
                              </HStack>
                            </VStack>
                          </Box>
                        </MotionBox>
                      ))}
                    </SimpleGrid>

                    {/* Bundle CTA */}
                    <Box
                      p={6}
                      bg={isDark
                        ? 'linear-gradient(135deg, rgba(183, 162, 125, 0.08) 0%, rgba(20, 20, 30, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(183, 162, 125, 0.06) 0%, rgba(255, 255, 255, 0.95) 100%)'
                      }
                      border="2px solid #b7a27d"
                      borderRadius="2xl"
                    >
                      <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
                        <VStack align="start" spacing={1}>
                          <Badge bg="linear-gradient(135deg, #b7a27d, #d4af37)" color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700">
                            {t("indicators.best_value", { defaultValue: "BEST VALUE" })}
                          </Badge>
                          <Heading size="md" bgGradient="linear(to-r, #b7a27d, #65a8bf)" bgClip="text">
                            {t("indicators.bundle_name", { defaultValue: "Complete Trading Suite" })}
                          </Heading>
                          <Text fontSize="sm" color={isDark ? 'whiteAlpha.700' : 'gray.600'}>
                            {t("indicators.bundle_desc", { defaultValue: "All 3 indicators — Swing, Scalp & Day Trader. Save 30%." })}
                          </Text>
                        </VStack>
                        <HStack spacing={4} align="center">
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="800" bgGradient="linear(to-r, #b7a27d, #65a8bf)" bgClip="text">
                              $79/mo
                            </Text>
                          </VStack>
                          <Button
                            as={RouterLink}
                            to="/products/indicators"
                            size="lg"
                            bg="linear-gradient(135deg, #b7a27d, #65a8bf)"
                            color="white"
                            fontWeight="700"
                            px={8}
                            rightIcon={<ArrowRight size={16} />}
                            _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(183, 162, 125, 0.4)' }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.2s"
                          >
                            {t("indicators.view_all", { defaultValue: "View All & Subscribe" })}
                          </Button>
                        </HStack>
                      </HStack>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </VStack>
      </Container>

      {/* Exit-Intent Modal - Premium conversion modal */}
      <Modal isOpen={isExitOpen} onClose={onExitClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(12px)" />
        <ModalContent
          bg="linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(30, 30, 45, 0.98) 100%)"
          border="1px solid"
          borderColor="rgba(101, 168, 191, 0.4)"
          borderRadius="2xl"
          mx={4}
          overflow="hidden"
          boxShadow="0 25px 50px rgba(0,0,0,0.5)"
        >
          {/* Gradient header bar */}
          <Box h="4px" bg="linear-gradient(90deg, #65a8bf, #b7a27d)" />
          
          <ModalCloseButton color="whiteAlpha.600" />
          <ModalHeader textAlign="center" pt={8} pb={2}>
            <VStack spacing={3}>
              <Icon as={Sparkles} boxSize={8} color="#b7a27d" />
              <Heading
                size="lg"
                bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                bgClip="text"
                fontWeight="800"
              >
                {t("exit_intent.title", { defaultValue: "Wait! Don't Miss Out" })}
              </Heading>
            </VStack>
          </ModalHeader>
          <ModalBody textAlign="center" pb={8}>
            <VStack spacing={5}>
              <Text fontSize="md" color="whiteAlpha.800">
                {t("exit_intent.message", { defaultValue: "Start your trading journey with our FREE comprehensive guide" })}
              </Text>
              
              {/* Value props */}
              <VStack spacing={2} align="start" w="full" px={4}>
                <HStack spacing={2}>
                  <Icon as={CheckCircle} boxSize={4} color="green.400" />
                  <Text fontSize="sm" color="whiteAlpha.800">{t("exit_intent.value_1", { defaultValue: "Learn proven trading strategies" })}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={CheckCircle} boxSize={4} color="green.400" />
                  <Text fontSize="sm" color="whiteAlpha.800">{t("exit_intent.value_2", { defaultValue: "No credit card required" })}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={CheckCircle} boxSize={4} color="green.400" />
                  <Text fontSize="sm" color="whiteAlpha.800">{t("exit_intent.value_3", { defaultValue: "Instant access to premium content" })}</Text>
                </HStack>
              </VStack>

              {freeGuide ? (
                <VStack spacing={4} w="full">
                  <Box
                    p={4}
                    bg="rgba(101, 168, 191, 0.1)"
                    borderRadius="xl"
                    border="1px solid rgba(101, 168, 191, 0.2)"
                    w="full"
                  >
                    <Text fontWeight="700" color="#65a8bf" fontSize="lg">
                      {freeGuide.name}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.700" noOfLines={2} mt={1}>
                      {freeGuide.description}
                    </Text>
                  </Box>
                  <Button
                    as={RouterLink}
                    to={`/learn/${freeGuide.id}`}
                    bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                    color="white"
                    size="lg"
                    w="full"
                    fontWeight="700"
                    py={6}
                    rightIcon={<ArrowRight size={18} />}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(101, 168, 191, 0.4)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    onClick={onExitClose}
                  >
                    {t("exit_intent.cta", { defaultValue: "🎁 Get Free Access Now" })}
                  </Button>
                </VStack>
              ) : (
                <Button
                  as={RouterLink}
                  to="/register"
                  bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                  color="white"
                  size="lg"
                  w="full"
                  fontWeight="700"
                  rightIcon={<ArrowRight size={18} />}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(101, 168, 191, 0.4)",
                  }}
                  onClick={onExitClose}
                >
                  {t("exit_intent.register", { defaultValue: "Create Free Account" })}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExitClose}
                color="whiteAlpha.500"
                _hover={{ color: "whiteAlpha.700" }}
              >
                {t("exit_intent.dismiss", { defaultValue: "Maybe later" })}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CoursesList;
