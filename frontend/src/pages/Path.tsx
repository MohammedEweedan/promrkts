import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Flex,
  Progress,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  Tooltip,
  Divider,
  Circle,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  fetchJourney,
  fetchEntitlements,
  fetchReadiness,
  hasReachedStage,
  Journey,
  Entitlements,
  ReadinessResponse,
  JOURNEY_STAGE_ORDER,
} from "../api/journey";
import { getMyPurchases } from "../api/client";
import {
  GraduationCap,
  Users,
  LayoutDashboard,
  ClipboardCheck,
  Target,
  Rocket,
  CheckCircle2,
  Lock,
  PlayCircle,
  ArrowRight,
  Sparkles,
  Swords,
  Trophy,
  RefreshCcwIcon,
} from "lucide-react";
import SpotlightCard from "../components/SpotlightCard";
import { useTranslation } from "react-i18next";

const ACCENT = "#65a8bf";

type StepStatus = "locked" | "available" | "in-progress" | "completed";

type Step = {
  id: string;
  title: string;
  description: string;
  badge: string;
  status: StepStatus;
  icon: React.ReactNode;
  subtext?: string;
  xp?: number;
  actions?: Array<{ label: string; onClick: () => void; isPrimary?: boolean; disabled?: boolean }>;
};

type JourneyStage = (typeof JOURNEY_STAGE_ORDER)[number];

const alpha = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const statusMeta = (status: StepStatus) => {
  switch (status) {
    case "completed":
      return { label: "Completed", icon: CheckCircle2 };
    case "in-progress":
      return { label: "In progress", icon: PlayCircle };
    case "available":
      return { label: "Next quest", icon: ArrowRight };
    default:
      return { label: "Locked", icon: Lock };
  }
};

const motivationalQuotes = [
  {
    title: "Discipline beats motivation.",
    body: "Small wins, stacked daily, become funded execution.",
  },
  { title: "Trade the plan.", body: "Clarity first. Then repetition. Then scale." },
  {
    title: "Protect capital.",
    body: "Your first job is to stay in the game long enough to get good.",
  },
  { title: "Execution is a skill.", body: "Systems turn random effort into predictable progress." },
  { title: "One good week ≠ mastery.", body: "Consistency is the flex. Keep showing up." },
  { title: "Risk is a dial.", body: "Turn it down until you can win repeatedly." },
  { title: "You don’t need more signals.", body: "You need fewer rules — followed perfectly." },
  { title: "Focus is leverage.", body: "Remove noise. Add reps. Build confidence." },
];

const useRotatingQuote = (enabled: boolean, intervalMs = 9000) => {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % motivationalQuotes.length);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [enabled, intervalMs]);

  const quote = motivationalQuotes[idx % motivationalQuotes.length];
  return { quote, idx };
};

const QuestPill: React.FC<{
  status: StepStatus;
  label: string;
}> = ({ status, label }) => {
  const meta = statusMeta(status);
  return (
    <HStack
      spacing={1.5}
      px={2.5}
      py={1}
      borderRadius="full"
      bg={alpha(ACCENT, status === "locked" ? 0.06 : 0.12)}
      borderWidth="1px"
      borderColor={alpha(ACCENT, 0.35)}
    >
      <Icon
        as={meta.icon as any}
        sx={{
          "&": {
            width: "16px",
            height: "16px",
            stroke: ACCENT,
          },
        }}
      />
      <Text fontSize="sm" fontWeight="800">
        {label}
      </Text>
    </HStack>
  );
};

const PathStepCard: React.FC<{
  step: Step;
  index: number;
  isLast: boolean;
}> = ({ step, index, isLast }) => {
  const meta = statusMeta(step.status);
  const isLocked = step.status === "locked";
  const isPrimaryDisabled = !!step.actions?.some((a) => a.isPrimary && a.disabled);

  const ringBg = step.status === "completed" ? alpha(ACCENT, 0.18) : alpha(ACCENT, 0.06);
  const ringBorder = step.status === "completed" ? alpha(ACCENT, 0.6) : alpha(ACCENT, 0.18);

  return (
    <Flex gap={4} align="stretch">
      {/* Timeline rail */}
      <Flex direction="column" align="center" minW="52px" pt={1}>
        <Circle
          size="44px"
          bg={ringBg}
          borderWidth="1px"
          borderColor={ringBorder}
          boxShadow={step.status === "available" || step.status === "in-progress" ? "md" : "sm"}
          transform={step.status === "available" ? "scale(1.04)" : "none"}
          position="relative"
        >
          <Box
            display="grid"
            placeItems="center"
            sx={{
              "& svg": {
                width: "22px",
                height: "22px",
                stroke: ACCENT,
              },
            }}
          >
            {step.icon}
          </Box>

          {/* Small "level" badge */}
          <Box
            position="absolute"
            bottom="-8px"
            right="-8px"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="900"
            bg="black"
            color={ACCENT}
            borderWidth="1px"
            borderColor={alpha(ACCENT, 0.6)}
          >
            {index + 1}
          </Box>
        </Circle>

        {!isLast && (
          <Box
            flex="1"
            w="3px"
            mt={2}
            borderRadius="full"
            bg={step.status === "completed" ? alpha(ACCENT, 0.55) : alpha(ACCENT, 0.12)}
          />
        )}
      </Flex>

      {/* Card */}
      <Box
        flex="1"
        bg="transparent"
        borderWidth="1px"
        borderColor={step.status === "available" ? alpha(ACCENT, 0.55) : alpha(ACCENT, 0.14)}
        borderRadius="2xl"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
        boxShadow={step.status === "available" || step.status === "in-progress" ? "lg" : "sm"}
        opacity={isLocked ? 0.72 : 1}
        position="relative"
        overflow="hidden"
      >
        {/* Subtle background shimmer */}
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bgGradient={`radial(circle at 20% 10%, ${alpha(ACCENT, 0.08)} 0%, transparent 45%),
                      radial(circle at 80% 0%, ${alpha(ACCENT, 0.06)} 0%, transparent 42%)`}
        />

        <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap" position="relative">
          <VStack align="start" spacing={1} flex="1" minW={{ base: "100%", md: "auto" }}>
            <HStack spacing={2} wrap="wrap">
              <Badge
                variant="outline"
                borderColor={alpha(ACCENT, 0.7)}
                px={2.5}
                py={1}
                borderRadius="full"
                fontWeight="900"
                letterSpacing="0.02em"
              >
                {step.badge}
              </Badge>

              <QuestPill status={step.status} label={meta.label} />

              {typeof step.xp === "number" ? (
                <HStack
                  spacing={1}
                  px={2.5}
                  py={1}
                  borderRadius="full"
                  bg={alpha(ACCENT, 0.08)}
                  borderWidth="1px"
                  borderColor={alpha(ACCENT, 0.25)}
                >
                  <Icon
                    as={Sparkles as any}
                    sx={{ "&": { width: "16px", height: "16px", stroke: ACCENT } }}
                  />
                  <Text fontSize="sm" fontWeight="900">
                    +{step.xp} XP
                  </Text>
                </HStack>
              ) : null}
            </HStack>

            <Heading size="md" mt={1}>
              {step.title}
            </Heading>

            <Text fontSize="sm" opacity={0.92}>
              {step.description}
            </Text>

            {step.subtext ? (
              <Text fontSize="sm" mt={1} opacity={0.9}>
                {step.subtext}
              </Text>
            ) : null}
          </VStack>

          {step.actions?.length ? (
            <Flex gap={2} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
              {step.actions.map((a) => {
                const isSolid = !!a.isPrimary;
                return (
                  <Button
                    key={a.label}
                    variant={isSolid ? "solid" : "outline"}
                    bg={isSolid ? ACCENT : undefined}
                    borderColor={!isSolid ? alpha(ACCENT, 0.85) : undefined}
                    _hover={{
                      bg: isSolid ? alpha(ACCENT, 0.9) : undefined,
                      borderColor: !isSolid ? ACCENT : undefined,
                      transform: "translateY(-1px)",
                    }}
                    _active={{
                      bg: isSolid ? alpha(ACCENT, 0.85) : undefined,
                      transform: "translateY(0px)",
                    }}
                    isDisabled={!!a.disabled}
                    onClick={a.onClick}
                  >
                    {a.label}
                  </Button>
                );
              })}
              {isPrimaryDisabled ? (
                <Tooltip label="Unlock this quest to continue.">
                  <Box />
                </Tooltip>
              ) : null}
            </Flex>
          ) : null}
        </Flex>
      </Box>
    </Flex>
  );
};

const PathPage: React.FC = () => {
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [journey, setJourney] = React.useState<Journey | null>(null);
  const [entitlements, setEntitlements] = React.useState<Entitlements | null>(null);
  const [readiness, setReadiness] = React.useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [purchases, setPurchases] = React.useState<any[]>([]);

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

      const arr = Array.isArray(myPurchases) ? myPurchases : [];
      setPurchases(arr);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load your journey. Please try again.";
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

  // --- "Game" meta ------------------------------------------------------------
  const LEVEL_MAX = JOURNEY_STAGE_ORDER.length;
  const level = clamp(stageIndex + 1, 1, LEVEL_MAX);

  // Make XP feel game-y: stage progress -> xp bar
  const xpToNext = 1000;
  const xpEarnedThisLevel = Math.round((stageProgress / 100) * xpToNext);
  const xpPercent = clamp((xpEarnedThisLevel / xpToNext) * 100, 0, 100);

  const { quote } = useRotatingQuote(Boolean(user) && !loading && !error, 7500);

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

  const statusForStage = React.useCallback(
    (targetStage: JourneyStage): StepStatus => {
      if (!journey) return "locked";

      if (stage === targetStage) return "in-progress";
      if (hasReachedStage(stage, targetStage)) return "completed";

      const delta = JOURNEY_STAGE_ORDER.indexOf(targetStage) - JOURNEY_STAGE_ORDER.indexOf(stage);
      return delta === 1 ? "available" : "locked";
    },
    [journey, stage]
  );

  const steps = React.useMemo<Step[]>(() => {
    if (!journey) return [];

    return [
      {
        id: "learning",
        title: "Lock in your fundamentals",
        description: "Complete core modules and pass quizzes to unlock the next stage.",
        badge: "Quest • Learning",
        status: statusForStage("LEARNING"),
        icon: <GraduationCap />,
        subtext: "Consistency > intensity. Keep your reps clean.",
        xp: 250,
        actions: [
          {
            label: "Browse courses",
            onClick: () => navigate("/products"),
            isPrimary: statusForStage("LEARNING") !== "completed",
          },
          { label: "View progress", onClick: () => navigate("/progress") },
        ],
      },
      {
        id: "community",
        title: "Join the private community",
        description: "Get access to community channels, office hours, and accountability.",
        badge: "Quest • Community",
        status: statusForStage("COMMUNITY"),
        icon: <Users />,
        subtext: entitlements?.canJoinTelegram
          ? "Unlocked — check your email for the invite."
          : "Confirm a VIP course/subscription to unlock access.",
        xp: 300,
        actions: [
          entitlements?.canJoinTelegram
            ? { label: "Open Discord", onClick: () => navigate("/discord"), isPrimary: true }
            : { label: "See products", onClick: () => navigate("/products"), isPrimary: true },
        ],
      },
      {
        id: "dashboard",
        title: "Build your trading workspace",
        description: "Set up dashboards: charts, news, playbooks, and routines — like a pro desk.",
        badge: "Quest • Dashboard",
        status: entitlements?.canUseDashboard ? statusForStage("DASHBOARD") : "locked",
        icon: <LayoutDashboard />,
        subtext: entitlements?.canUseDashboard
          ? `Unlocked • Workspaces: ${entitlements.maxWorkspaces} • Widgets: ${entitlements.maxWidgets}`
          : "Locked — confirm a course/subscription to unlock.",
        xp: 350,
        actions: [
          {
            label: "Open dashboard",
            onClick: () => navigate("/"),
            isPrimary: true,
            disabled: !entitlements?.canUseDashboard,
          },
        ],
      },
      {
        id: "readiness",
        title: "Complete the readiness checklist",
        description: "Finish the checklist to unlock evaluation purchases and coaching flow.",
        badge: readiness
          ? readiness.ready
            ? "Quest • Ready"
            : `Quest • ${readinessComplete}/${Math.max(readinessTotal, 1)} complete`
          : "Quest • Eval Ready",
        status: readiness?.ready ? "completed" : statusForStage("EVAL_READY"),
        icon: <ClipboardCheck />,
        subtext: readiness
          ? readiness.ready
            ? "All requirements satisfied."
            : missingReadable
            ? `Missing: ${missingReadable}`
            : "Checklist in progress."
          : "This checklist appears once you start your course.",
        xp: 450,
        actions: [
          {
            label: readiness?.ready ? "Review overview" : "See requirements",
            onClick: () => navigate("/progress"),
            isPrimary: !readiness?.ready,
          },
        ],
      },
      {
        id: "evaluation",
        title: "Start your evaluation challenge",
        description: "Choose an evaluation size and follow rules with coach guidance.",
        badge: "Quest • Evaluation",
        status: hasReachedStage(journey.stage, "EVALUATING")
          ? "completed"
          : entitlements?.canBuyEval
          ? "available"
          : "locked",
        icon: <Target />,
        subtext: entitlements?.canBuyEval
          ? "Eligible now — pick a challenge size."
          : "Complete readiness to unlock evaluation purchases.",
        xp: 600,
        actions: [
          {
            label: entitlements?.canBuyEval ? "Browse challenges" : "Contact success team",
            onClick: () =>
              entitlements?.canBuyEval ? navigate("/products") : navigate("/contact"),
            isPrimary: true,
          },
        ],
      },
      {
        id: "execution",
        title: "Go live & scale",
        description: "After passing evaluation, connect to broker and scale with discipline.",
        badge: "Quest • Execute",
        status: hasReachedStage(journey.stage, "EXECUTING") ? "completed" : "locked",
        icon: <Rocket />,
        subtext: hasReachedStage(journey.stage, "FUNDED")
          ? "Payout recorded — your coach guides the broker handoff."
          : "Finish evaluation to unlock funded trading.",
        xp: 800,
        actions: [
          { label: "Talk to success coach", onClick: () => navigate("/contact"), isPrimary: true },
        ],
      },
    ];
  }, [
    journey,
    statusForStage,
    entitlements,
    readiness,
    readinessComplete,
    readinessTotal,
    missingReadable,
    navigate,
  ]);

  const subtleBorder = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const softBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  const progressTrackSx = { "& > div": { background: ACCENT } } as const;

  const stageChips = React.useMemo(() => {
    const labels = stageLabels || {};
    return JOURNEY_STAGE_ORDER.map((s, idx) => {
      const reached = journey ? hasReachedStage(stage, s) || stage === s : idx === 0;
      const active = stage === s;
      return { key: s, label: labels[s] || s, reached, active, idx };
    });
  }, [journey, stageLabels, stage]);

  const nextQuest = React.useMemo(() => {
    const list = steps;
    if (!list.length) return null;
    return list.find((x) => x.status === "available" || x.status === "in-progress") || list[0];
  }, [steps]);

  return (
    <Box minH="100vh" py={{ base: 5, md: 10 }}>
      <Container maxW="7xl">
        <Stack spacing={{ base: 6, md: 8 }}>
          {/* HERO HEADER */}
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
                        Path Mode
                      </Text>
                    </HStack>

                    <HStack
                      spacing={2}
                      px={3}
                      py={1.5}
                      borderRadius="full"
                      borderWidth="1px"
                      borderColor={subtleBorder}
                      bg={softBg}
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

                  <Heading size="2xl" lineHeight="short">
                    {t("path.title")}
                  </Heading>
                  <Text mt={2} fontSize="md" opacity={0.9}>
                    {t("path.subtitle")}
                  </Text>

                  <Box
                    mt={5}
                    p={4}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor={alpha(ACCENT, 0.2)}
                  >
                    <HStack justify="space-between" align="start" spacing={3}>
                      <VStack align="start" spacing={0.5}>
                        <Text
                          textTransform="uppercase"
                          fontSize="xs"
                          letterSpacing="0.14em"
                          opacity={0.85}
                        >
                          Current stage
                        </Text>
                        <Heading size="md">{stageLabels?.[stage] || stage}</Heading>
                      </VStack>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={ACCENT}
                          color="black"
                          _hover={{ bg: alpha(ACCENT, 0.9) }}
                          onClick={load}
                          leftIcon={<RefreshCcwIcon size={16} />}
                          isDisabled={!user}
                        >
                          Refresh
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          bg={ACCENT}
                          color="black"
                          _hover={{ bg: alpha(ACCENT, 0.9) }}
                          onClick={() => navigate("/progress")}
                          isDisabled={!user}
                        >
                          Progress
                        </Button>
                      </HStack>
                    </HStack>

                    <Box mt={4}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="800">
                          XP to next level
                        </Text>
                        <Text fontSize="sm" fontWeight="900">
                          {xpEarnedThisLevel}/{xpToNext}
                        </Text>
                      </HStack>
                      <Progress
                        value={xpPercent}
                        size="sm"
                        borderRadius="full"
                        bg="white"
                        sx={progressTrackSx}
                      />
                    </Box>

                    <Box mt={4}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="800">
                          Stage progress
                        </Text>
                        <Text fontSize="sm" fontWeight="900">
                          {Math.round(stageProgress)}%
                        </Text>
                      </HStack>
                      <Progress
                        value={stageProgress}
                        size="sm"
                        borderRadius="full"
                        bg="white"
                        sx={progressTrackSx}
                      />
                    </Box>

                    {nextQuest ? (
                      <Box
                        mt={4}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={alpha(ACCENT, 0.18)}
                        bg={alpha(ACCENT, 0.06)}
                        p={3}
                      >
                        <HStack justify="space-between" align="start" spacing={3} wrap="wrap">
                          <VStack align="start" spacing={0.5}>
                            <Text
                              fontSize="xs"
                              textTransform="uppercase"
                              letterSpacing="0.14em"
                              opacity={0.9}
                            >
                              Next quest
                            </Text>
                            <Text fontWeight="900">{nextQuest.title}</Text>
                            <Text fontSize="sm" opacity={0.9}>
                              {nextQuest.subtext || nextQuest.description}
                            </Text>
                          </VStack>
                          {nextQuest.actions?.[0] ? (
                            <Button
                              variant="solid"
                              bg={ACCENT}
                              _hover={{ opacity: 0.9 }}
                              onClick={nextQuest.actions[0].onClick}
                              isDisabled={!!nextQuest.actions[0].disabled}
                            >
                              {nextQuest.actions[0].label}
                            </Button>
                          ) : null}
                        </HStack>
                      </Box>
                    ) : null}
                  </Box>
                </Box>

                {/* MOTIVATION PANEL */}
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
                    <HStack justifyContent="center" spacing={2} mb={3}>
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
                        Daily boost
                      </Text>
                    </HStack>

                    <Heading position="relative" size="lg" lineHeight="short" textAlign="center">
                      {quote.title}
                    </Heading>
                    <Text position="relative" mt={2} fontSize="md" opacity={0.92} textAlign="center">
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
                          Readiness
                        </Text>
                        <HStack justify="space-between" mt={1}>
                          <Text fontWeight="900">
                            {readiness?.ready ? "Complete" : `${readinessPercent}%`}
                          </Text>
                          <Text fontSize="sm" opacity={0.85}>
                            {readiness?.ready ? "✅" : "⏳"}
                          </Text>
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
                          {readiness?.ready
                            ? t("path.readinessHint")
                            : missingReadable
                            ? t("path.readinessMissing", { items: missingReadable })
                            : "Keep going — one item at a time."}
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
                            >
                              {entitlements?.canBuyEval ? "Eligible" : "Pending"}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Box>
                    </SimpleGrid>

                    <Text position="relative" mt={4} fontSize="xs" opacity={0.75}>
                      Tip: Your quote updates automatically — refresh your mindset, then your
                      execution.
                    </Text>
                  </Box>
                </Box>
              </Flex>
            </Box>
          </SpotlightCard>

          {/* SIGNED OUT */}
          {!user ? (
            <Stack spacing={4} align="center" textAlign="center">
              <Text opacity={0.9}>{t("path.signInPrompt")}</Text>
              <Flex gap={3} wrap="wrap" justify="center">
                <Button
                  variant="solid"
                  bg={ACCENT}
                  color="black"
                  _hover={{ bg: alpha(ACCENT, 0.9) }}
                  onClick={() => navigate("/login")}
                >
                  {t("path.signInCta")}
                </Button>
                <Button
                  variant="outline"
                  borderColor={alpha(ACCENT, 0.85)}
                  _hover={{ borderColor: ACCENT }}
                  onClick={() => navigate("/register")}
                >
                  {t("path.createAccountCta")}
                </Button>
              </Flex>
            </Stack>
          ) : loading ? (
            <Flex justify="center" py={16}>
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {/* STAGE MAP CHIPS */}
              <SpotlightCard>
                <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                    <Box>
                      <Text textTransform="uppercase" fontSize="xs" letterSpacing="0.12em">
                        World map
                      </Text>
                      <Heading size="md" mt={2}>
                        Levels you’ve unlocked
                      </Heading>
                    </Box>

                    <HStack spacing={2} wrap="wrap">
                      <Badge
                        variant="outline"
                        borderColor={alpha(ACCENT, 0.75)}
                        borderRadius="full"
                        px={2.5}
                        py={1}
                      >
                        Current: {stageLabels?.[stage] || stage}
                      </Badge>
                      <Badge
                        variant="outline"
                        borderColor={subtleBorder}
                        borderRadius="full"
                        px={2.5}
                        py={1}
                      >
                        Level {level}/{LEVEL_MAX}
                      </Badge>
                    </HStack>
                  </Flex>

                  <Divider my={5} opacity={0.5} />

                  <Flex direction="column" gap={4}>
                    <Progress
                      value={stageProgress}
                      size="sm"
                      borderRadius="full"
                      bg={softBg}
                      sx={progressTrackSx}
                    />
                    <Flex wrap="wrap" gap={2}>
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
                            s.active
                              ? alpha(ACCENT, 0.14)
                              : s.reached
                              ? alpha(ACCENT, 0.07)
                              : softBg
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
                    </Flex>
                  </Flex>
                </Box>
              </SpotlightCard>

              {/* QUEST LIST */}
              <Stack spacing={6} pt={2} pb={8}>
                <Box>
                  <HStack spacing={2} mb={2}>
                    <Icon
                      as={Swords as any}
                      sx={{ "&": { width: "22px", height: "22px", stroke: ACCENT } }}
                    />
                    <Heading size="lg">Quest log</Heading>
                  </HStack>
                  <Text opacity={0.9}>
                    Treat each step like a level: clear objective, clean execution, measurable
                    outcome.
                  </Text>
                </Box>

                <Stack spacing={5}>
                  {steps.map((step, idx) => (
                    <PathStepCard
                      key={step.id}
                      step={step}
                      index={idx}
                      isLast={idx === steps.length - 1}
                    />
                  ))}
                </Stack>
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default PathPage;
