import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  HStack,
  Badge,
  Progress,
  SimpleGrid,
  Button,
  Icon,
  Divider,
  useColorModeValue,
  Spinner,
  Alert,
  Flex,
  AlertIcon,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProgressTracker from "../components/ProgressTracker";
import BadgeShowcase from "../components/BadgeShowcase";
import Leaderboard from "../components/Leaderboard";
import SpotlightCard from "../components/SpotlightCard";
import {
  fetchJourney,
  fetchEntitlements,
  fetchReadiness,
  hasReachedStage,
  JOURNEY_STAGE_ORDER,
  Journey,
  Entitlements,
  ReadinessResponse,
} from "../api/journey";
import { getMyPurchases } from "../api/client";
import { Sparkles, Trophy, Swords, Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const ACCENT = "#65a8bf";

type JourneyStage = (typeof JOURNEY_STAGE_ORDER)[number];

const alpha = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const motivationalQuotes = [
  { title: "Stack clean reps.", body: "Your edge grows when you repeat the basics flawlessly." },
  {
    title: "Protect your confidence.",
    body: "Risk small enough to stay consistent and learn fast.",
  },
  { title: "One rule at a time.", body: "Master simplicity before you add complexity." },
  { title: "Be boring, get paid.", body: "Consistency is the strategy. Everything else is noise." },
  { title: "Track it or it didn’t happen.", body: "Progress becomes obvious when it’s measured." },
  { title: "Win the day.", body: "A single focused session beats 10 distracted ones." },
];

const useRotatingQuote = (enabled: boolean, intervalMs = 9000) => {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!enabled) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % motivationalQuotes.length),
      intervalMs
    );
    return () => window.clearInterval(t);
  }, [enabled, intervalMs]);
  return motivationalQuotes[idx % motivationalQuotes.length];
};

const ProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  const [journey, setJourney] = React.useState<Journey | null>(null);
  const [entitlements, setEntitlements] = React.useState<Entitlements | null>(null);
  const [readiness, setReadiness] = React.useState<ReadinessResponse | null>(null);
  const [purchases, setPurchases] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [journeyResp, entitlementResp, readinessResp, myPurchases] = await Promise.all([
        fetchJourney(),
        fetchEntitlements(),
        fetchReadiness().catch(() => null),
        getMyPurchases({ ttlMs: 10 * 60 * 1000 }).catch(() => []),
      ]);
      setJourney(journeyResp);
      setEntitlements(entitlementResp);
      setReadiness(readinessResp);
      setPurchases(Array.isArray(myPurchases) ? myPurchases : []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load progress. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  const confirmed = React.useMemo(() => {
    return (Array.isArray(purchases) ? purchases : []).filter(
      (p: any) => String(p?.status || "").toUpperCase() === "CONFIRMED"
    );
  }, [purchases]);

  const hasAnyConfirmed = confirmed.length > 0;

  const hasVipConfirmed = confirmed.some((p: any) => {
    const tier = p?.tier || p?.Tier || p?.product || {};
    return !!tier?.isVipProduct || String(tier?.vipType || "").length > 0;
  });

  const isEarlyStage = (s: string | null | undefined) => {
    const known = JOURNEY_STAGE_ORDER as readonly string[];
    if (!s || !known.includes(s)) return true;
    return s === JOURNEY_STAGE_ORDER[0];
  };

  const rawStage = (journey?.stage ?? JOURNEY_STAGE_ORDER[0]) as string;

  const stage = React.useMemo<JourneyStage>(() => {
    if (!isEarlyStage(rawStage)) return rawStage as JourneyStage;

    if (entitlements?.canBuyEval) return "EVAL_READY";
    if (entitlements?.canUseDashboard) return "DASHBOARD";
    if (entitlements?.canJoinTelegram || hasVipConfirmed) return "COMMUNITY";
    if (hasAnyConfirmed) return "LEARNING";
    return JOURNEY_STAGE_ORDER[0];
  }, [
    rawStage,
    entitlements?.canBuyEval,
    entitlements?.canUseDashboard,
    entitlements?.canJoinTelegram,
    hasVipConfirmed,
    hasAnyConfirmed,
  ]);

  const stageLabels = t("path.stages", { returnObjects: true }) as Record<string, string>;
  const stageIndex = JOURNEY_STAGE_ORDER.indexOf(stage);
  const maxStageIndex = JOURNEY_STAGE_ORDER.length - 1;
  const stageProgress = maxStageIndex > 0 ? Math.max(0, (stageIndex / maxStageIndex) * 100) : 0;

  const readinessRequirements = readiness?.requirements;
  const readinessTotal = readinessRequirements ? Object.keys(readinessRequirements).length : 0;
  const readinessComplete = readinessRequirements
    ? Object.values(readinessRequirements).filter(Boolean).length
    : readiness?.ready
    ? readinessTotal || 1
    : 0;

  const readinessPercent =
    readinessTotal > 0
      ? Math.round((readinessComplete / readinessTotal) * 100)
      : readiness?.ready
      ? 100
      : 0;

  const missingReadable =
    readiness?.missing && readiness.missing.length
      ? readiness.missing
          .map((item) => {
            const key = `path.missing.${item}`;
            const translated = t(key, { defaultValue: item });
            return translated;
          })
          .join(", ")
      : null;

  // Game-y XP readout aligned with Path page
  const LEVEL_MAX = JOURNEY_STAGE_ORDER.length;
  const level = clamp(stageIndex + 1, 1, LEVEL_MAX);
  const xpToNext = 1000;
  const xpEarnedThisLevel = Math.round((stageProgress / 100) * xpToNext);
  const xpPercent = clamp((xpEarnedThisLevel / xpToNext) * 100, 0, 100);

  const quote = useRotatingQuote(Boolean(user) && !loading && !error, 9500);

  const subtleBorder = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const softBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  const progressTrackSx = { "& > div": { background: ACCENT } } as const;

  const stageChips = React.useMemo(() => {
    const labels = stageLabels || {};
    return JOURNEY_STAGE_ORDER.map((s) => {
      const reached = journey
        ? hasReachedStage(stage, s) || stage === s
        : s === JOURNEY_STAGE_ORDER[0];
      const active = stage === s;
      return { key: s, label: labels[s] || s, reached, active };
    });
  }, [journey, stageLabels, stage]);

  const readinessLine = readiness?.ready
    ? t("path.readinessHint")
    : missingReadable
    ? t("path.readinessMissing", { items: missingReadable })
    : "Keep going — one item at a time.";

  return (
    <Box minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="7xl">
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* HERO / HUD */}
          <SpotlightCard>
            <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 7 }}>
              <Flex justify="space-between" align="flex-start" wrap="wrap" gap={6}>
                <Box flex="1" minW={{ base: "100%", md: "420px" }}>
                  <HStack spacing={3} mb={2}>
                    <HStack
                      spacing={2}
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      borderWidth="1px"
                      borderColor={alpha(ACCENT, 0.35)}
                      bg={alpha(ACCENT, 0.08)}
                    >
                      <Icon
                        as={Swords as any}
                        sx={{ "&": { width: "18px", height: "18px", stroke: ACCENT } }}
                      />
                      <Text fontSize="sm" fontWeight="900">
                        Progress Hub
                      </Text>
                    </HStack>

                    <HStack
                      spacing={2}
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      borderWidth="1px"
                      borderColor={subtleBorder}
                    >
                      <Icon
                        as={Trophy as any}
                        sx={{ "&": { width: "18px", height: "18px", stroke: ACCENT } }}
                      />
                      <Text fontSize="sm" fontWeight="900">
                        Level {level} / {LEVEL_MAX}
                      </Text>
                    </HStack>
                  </HStack>

                  <Heading size="xl">{t("progress.title", "My Progress")}</Heading>
                  <Text mt={2} opacity={0.9}>
                    Track everything in one place — aligned with your Path quests.
                  </Text>

                  <HStack mt={4} spacing={2} wrap="wrap">
                    {stageChips.map((s) => (
                      <Box
                        key={s.key}
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        borderWidth="1px"
                        borderColor={
                          s.active
                            ? alpha(ACCENT, 0.8)
                            : s.reached
                            ? alpha(ACCENT, 0.35)
                            : subtleBorder
                        }
                        bg={
                          s.active ? alpha(ACCENT, 0.14) : s.reached ? alpha(ACCENT, 0.07) : softBg
                        }
                      >
                        <HStack spacing={2}>
                          <Box
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg={s.reached ? ACCENT : alpha(ACCENT, 0.25)}
                          />
                          <Text fontSize="sm" fontWeight={s.active ? "900" : "800"}>
                            {s.label}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </HStack>

                  <HStack mt={5} spacing={3} wrap="wrap">
                    <Button
                      variant="solid"
                      bg={ACCENT}
                      color="black"
                      _hover={{ bg: alpha(ACCENT, 0.9) }}
                      leftIcon={<Flame size={16} />}
                      onClick={load}
                      isDisabled={!user}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      borderColor={alpha(ACCENT, 0.85)}
                      _hover={{ borderColor: ACCENT }}
                      rightIcon={<ArrowRight size={16} />}
                      onClick={() => navigate("/path")}
                    >
                      Go to Path
                    </Button>
                  </HStack>
                </Box>

                <Box flex="1" minW={{ base: "100%", md: "360px" }}>
                  <Box
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor={alpha(ACCENT, 0.18)}
                    bgGradient={`linear(to-br, ${alpha(ACCENT, 0.14)}, ${alpha(ACCENT, 0.04)})`}
                    p={{ base: 5, md: 6 }}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      inset={0}
                      pointerEvents="none"
                      bgGradient={`radial(circle at 10% 20%, ${alpha(
                        ACCENT,
                        0.14
                      )} 0%, transparent 55%),
                                  radial(circle at 80% 0%, ${alpha(
                                    ACCENT,
                                    0.1
                                  )} 0%, transparent 48%)`}
                    />

                    <HStack position="relative" spacing={2} mb={3}>
                      <Icon
                        as={Sparkles as any}
                        sx={{ "&": { width: "18px", height: "18px", stroke: ACCENT } }}
                      />
                      <Text
                        textTransform="uppercase"
                        fontSize="xs"
                        letterSpacing="0.14em"
                        fontWeight="900"
                        opacity={0.9}
                      >
                        Motivation
                      </Text>
                    </HStack>

                    <Heading position="relative" size="lg" lineHeight="short">
                      {quote.title}
                    </Heading>
                    <Text position="relative" mt={2} fontSize="md" opacity={0.92}>
                      {quote.body}
                    </Text>

                    <Divider my={5} opacity={0.5} />

                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} position="relative">
                      <Box
                        borderWidth="1px"
                        borderColor={alpha(ACCENT, 0.18)}
                        borderRadius="xl"
                        p={3}
                      >
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="0.14em"
                          opacity={0.85}
                        >
                          XP to next level
                        </Text>
                        <HStack justify="space-between" mt={1}>
                          <Text fontWeight="900">
                            {xpEarnedThisLevel}/{xpToNext}
                          </Text>
                          <Badge
                            variant="outline"
                            borderColor={alpha(ACCENT, 0.75)}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontWeight="900"
                          >
                            {Math.round(xpPercent)}%
                          </Badge>
                        </HStack>
                        <Progress
                          mt={2}
                          value={xpPercent}
                          size="xs"
                          borderRadius="full"
                          bg={softBg}
                          sx={progressTrackSx}
                        />
                        <Text mt={2} fontSize="sm" opacity={0.9}>
                          Keep moving — levels come from reps, not hype.
                        </Text>
                      </Box>

                      <Box
                        borderWidth="1px"
                        borderColor={alpha(ACCENT, 0.18)}
                        borderRadius="xl"
                        p={3}
                      >
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="0.14em"
                          opacity={0.85}
                        >
                          Readiness
                        </Text>
                        <HStack justify="space-between" mt={1}>
                          <Text fontWeight="900">
                            {readiness?.ready ? "Complete" : `${readinessPercent}%`}
                          </Text>
                          <Icon
                            as={CheckCircle2 as any}
                            sx={{ "&": { width: "18px", height: "18px", stroke: ACCENT } }}
                          />
                        </HStack>
                        <Progress
                          mt={2}
                          value={readinessPercent}
                          size="xs"
                          borderRadius="full"
                          bg={softBg}
                          sx={progressTrackSx}
                        />
                        <Text mt={2} fontSize="sm" opacity={0.9}>
                          {readinessLine}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Box
                      mt={4}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={alpha(ACCENT, 0.18)}
                      bg={alpha(ACCENT, 0.06)}
                      p={3}
                      position="relative"
                    >
                      <Text
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="0.14em"
                        opacity={0.9}
                      >
                        Current stage
                      </Text>
                      <Text fontWeight="900" mt={1}>
                        {stageLabels?.[stage] || stage}
                      </Text>
                      <Text fontSize="sm" opacity={0.9} mt={1}>
                        Stage progress: {Math.round(stageProgress)}%
                      </Text>
                      <Progress
                        mt={2}
                        value={stageProgress}
                        size="xs"
                        borderRadius="full"
                        bg={softBg}
                        sx={progressTrackSx}
                      />
                    </Box>
                  </Box>
                </Box>
              </Flex>
            </Box>
          </SpotlightCard>

          {/* AUTH / LOAD STATES */}
          {!user ? (
            <SpotlightCard>
              <Box p={{ base: 5, md: 6 }} textAlign="center">
                <Heading size="md">Sign in to view your progress</Heading>
                <Text mt={2} opacity={0.9}>
                  Your quests, badges, and leaderboard stats will appear here.
                </Text>
                <HStack mt={4} justify="center" wrap="wrap">
                  <Button
                    variant="solid"
                    bg={ACCENT}
                    color="black"
                    _hover={{ bg: alpha(ACCENT, 0.9) }}
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="outline"
                    borderColor={alpha(ACCENT, 0.85)}
                    _hover={{ borderColor: ACCENT }}
                    onClick={() => navigate("/register")}
                  >
                    Create account
                  </Button>
                </HStack>
              </Box>
            </SpotlightCard>
          ) : loading ? (
            <Flex justify="center" py={12}>
              <HStack spacing={3}>
                <Spinner />
                <Text>Loading progress…</Text>
              </HStack>
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {/* SUMMARY ROW (compliments Path) */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                <SpotlightCard>
                  <Box p={5}>
                    <Text
                      textTransform="uppercase"
                      fontSize="xs"
                      letterSpacing="0.14em"
                      opacity={0.85}
                    >
                      Purchases
                    </Text>
                    <Heading size="md" mt={2}>
                      {confirmed.length}
                    </Heading>
                    <Text mt={1} fontSize="sm" opacity={0.9}>
                      Confirmed course/subscription purchases
                    </Text>
                  </Box>
                </SpotlightCard>

                <SpotlightCard>
                  <Box p={5}>
                    <Text
                      textTransform="uppercase"
                      fontSize="xs"
                      letterSpacing="0.14em"
                      opacity={0.85}
                    >
                      Access
                    </Text>
                    <VStack align="stretch" mt={2} spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="800">
                          Dashboard
                        </Text>
                        <Badge
                          variant="outline"
                          borderColor={alpha(ACCENT, 0.75)}
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          fontWeight="900"
                        >
                          {entitlements?.canUseDashboard ? "Unlocked" : "Locked"}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="800">
                          Evaluation
                        </Text>
                        <Badge
                          variant="outline"
                          borderColor={alpha(ACCENT, 0.75)}
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          fontWeight="900"
                        >
                          {entitlements?.canBuyEval ? "Eligible" : "Pending"}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="800">
                          Community
                        </Text>
                        <Badge
                          variant="outline"
                          borderColor={alpha(ACCENT, 0.75)}
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          fontWeight="900"
                        >
                          {entitlements?.canJoinTelegram || hasVipConfirmed ? "Unlocked" : "Locked"}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </SpotlightCard>

                <SpotlightCard>
                  <Box p={5}>
                    <Text
                      textTransform="uppercase"
                      fontSize="xs"
                      letterSpacing="0.14em"
                      opacity={0.85}
                    >
                      Readiness checklist
                    </Text>
                    <Heading size="md" mt={2}>
                      {readiness?.ready ? "Complete" : `${readinessPercent}%`}
                    </Heading>
                    <Progress
                      mt={3}
                      value={readinessPercent}
                      size="sm"
                      borderRadius="full"
                      bg={softBg}
                      sx={progressTrackSx}
                    />
                    <Text mt={2} fontSize="sm" opacity={0.9}>
                      {readinessLine}
                    </Text>
                  </Box>
                </SpotlightCard>
              </SimpleGrid>

              {/* MAIN TABS (styled to match Path) */}
              <SpotlightCard>
                <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
                  <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
                    <Box>
                      <Text textTransform="uppercase" fontSize="xs" letterSpacing="0.12em">
                        Command center
                      </Text>
                      <Heading size="md" mt={2}>
                        Everything you’ve done — and what’s next
                      </Heading>
                    </Box>
                    <Button
                      variant="outline"
                      borderColor={alpha(ACCENT, 0.85)}
                      _hover={{ borderColor: ACCENT }}
                      onClick={() => navigate("/path")}
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Continue on Path
                    </Button>
                  </HStack>

                  <Divider my={5} opacity={0.5} />

                  <Tabs
                    colorScheme="green"
                    variant="soft-rounded"
                    isLazy
                    lazyBehavior="keepMounted"
                  >
                    <TabList gap={2} flexWrap="wrap">
                      <Tab
                        fontWeight="900"
                        borderWidth="1px"
                        borderColor={alpha(ACCENT, 0.22)}
                        _selected={{
                          bg: alpha(ACCENT, 0.18),
                          color: "black",
                          borderColor: alpha(ACCENT, 0.55),
                        }}
                      >
                        📊 {t("progress.overview", "Overview")}
                      </Tab>
                      <Tab
                        fontWeight="900"
                        borderWidth="1px"
                        borderColor={alpha(ACCENT, 0.22)}
                        _selected={{
                          bg: alpha(ACCENT, 0.18),
                          color: "black",
                          borderColor: alpha(ACCENT, 0.55),
                        }}
                      >
                        🏆 {t("progress.badges", "Badges")}
                      </Tab>
                      <Tab
                        fontWeight="900"
                        borderWidth="1px"
                        borderColor={alpha(ACCENT, 0.22)}
                        _selected={{
                          bg: alpha(ACCENT, 0.18),
                          color: "black",
                          borderColor: alpha(ACCENT, 0.55),
                        }}
                      >
                        🥇 {t("progress.leaderboard", "Leaderboard")}
                      </Tab>
                    </TabList>

                    <TabPanels mt={4}>
                      <TabPanel px={0}>
                        {/* Ensure your ProgressTracker shows everything:
                            - course completion
                            - watch time / lessons tracked
                            - readiness checklist
                            - stage map
                          If your component doesn’t yet, it can read from same endpoints as above.
                        */}
                        <ProgressTracker />
                      </TabPanel>

                      <TabPanel px={0}>
                        <BadgeShowcase />
                      </TabPanel>

                      <TabPanel px={0}>
                        <Leaderboard />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </SpotlightCard>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ProgressPage;
