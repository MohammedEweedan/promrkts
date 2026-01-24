/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Spinner,
  Icon,
  Image,
  AspectRatio,
  chakra,
  Grid,
  GridItem,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import api, { getMyPurchases } from "../../api/client";
import RequireEnrollment from "../../components/RequireEnrollment";
import { Lock, Star, Award, Send, Headphones, Target, Shield, Calendar, Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

type Review = {
  id: string;
  author?: string;
  rating?: number;
  comment?: string;
  created_at?: string;
};

type Resource = { id: string; type: "pdf" | "video"; url: string };

type TierBase = {
  id: string;
  name: string;
  description: string;
  price_usdt: number;
  price_stripe: number; // cents
  productType?: "COURSE" | "CHALLENGE" | "SUBSCRIPTION" | string;

  purchases_count?: number;
  rating_avg?: number;
  rating_count?: number;
  reviews?: Review[];
  resources?: Resource[];

  trailerUrl?: string;
  previewUrl?: string;

  instructorName?: string;
  instructorBio?: string;
  instructorAvatarUrl?: string;

  telegramEmbedUrl?: string;
  telegramUrl?: string;
  discordWidgetId?: string;
  discordInviteUrl?: string;
  twitterTimelineUrl?: string;

  // challenge-specific (optional)
  challengePlatform?: string | null;
  challengeMeta?: any;
};

type CourseTier = TierBase & {
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
};

const levelKey = (lvl?: CourseTier["level"]) =>
  ({
    BEGINNER: "levels.beginner",
    INTERMEDIATE: "levels.intermediate",
    ADVANCED: "levels.advanced",
  }[lvl || "BEGINNER"]);

const GOLD = "#65a8bf";
const MotionBox = motion(Box);

const FeatureChip = ({ children }: { children: React.ReactNode }) => (
  <HStack
    px={3}
    py={2}
    border="1px solid"
    borderColor="border.default"
    borderRadius="md"
    color="text.primary"
    minH="40px"
  >
    {children}
  </HStack>
);

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) => (
  <Box
    border="1px solid"
    borderColor="border.default"
    borderRadius="lg"
    p={4}
    bg="bg.surface"
  >
    <HStack align="center" gap={3} mb={1}>
      <Icon as={icon} color={GOLD} />
      <Text fontWeight={700}>{label}</Text>
    </HStack>
    <Text fontSize="lg" fontWeight={800}>
      {value}
    </Text>
  </Box>
);

// flexible meta reader
const pick = (obj: any, keys: string[]) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};

const formatPct = (v: any) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  // If already looks like 0-100 => show as percent
  return `${n}%`;
};

const formatMoney = (v: any, fallback = "") => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return `$${n.toLocaleString("en-US")}`;
};

const guessSteps = (tier: TierBase): 1 | 2 | null => {
  const meta = (tier as any)?.challengeMeta || {};
  const direct =
    Number(pick(meta, ["steps", "stepCount", "phases", "phaseCount"])) ||
    Number(pick(tier as any, ["steps", "stepCount"]));
  if (direct === 1) return 1;
  if (direct === 2) return 2;

  const hay = `${tier?.name || ""} ${tier?.description || ""}`.toLowerCase();
  const twoHints = ["2-step", "2 step", "two-step", "two step", "phase 2", "phase ii", "step 2"];
  const oneHints = ["1-step", "1 step", "one-step", "one step", "single step", "phase 1 only"];
  if (twoHints.some((k) => hay.includes(k))) return 2;
  if (oneHints.some((k) => hay.includes(k))) return 1;
  return null;
};

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tier, setTier] = React.useState<CourseTier | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const { t, i18n } = useTranslation() as any;
  const [isEnrolled, setIsEnrolled] = React.useState(false);

  // Track which endpoint succeeded so we can infer type if productType missing
  const [resolvedKind, setResolvedKind] = React.useState<"course" | "challenge" | "subscription" | null>(null);

  const fmtDate = React.useCallback(
    (d?: string) => {
      if (!d) return "";
      try {
        return new Date(d).toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return d;
      }
    },
    [i18n.language]
  );

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [resp, mineList] = await Promise.all([
          (async () => {
            // Try course -> challenge -> subscription (keep your logic but capture which worked)
            const c = await api.get(`/courses/${id}`).catch(() => null as any);
            if (c?.data) {
              setResolvedKind("course");
              return c;
            }
            const ch = await api.get(`/challenges/${id}`).catch(() => null as any);
            if (ch?.data) {
              setResolvedKind("challenge");
              return ch;
            }
            const s = await api.get(`/subscriptions/${id}`);
            setResolvedKind("subscription");
            return s;
          })(),
          getMyPurchases({ ttlMs: 10 * 60 * 1000 }).catch(() => [] as any[]),
        ]);

        const loaded = (resp as any)?.data || null;
        setTier(loaded);

        const list: any[] = Array.isArray(mineList) ? mineList : [];
        const enrolled = list.some(
          (p: any) =>
            String(p.status || "").toUpperCase() === "CONFIRMED" &&
            ((p.tier && p.tier.id === id) || p.tierId === id)
        );
        setIsEnrolled(enrolled);
      } catch (e: any) {
        setError(e?.response?.data?.message || t("errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, t]);

  // Resolve media/asset URLs
  const apiBase =
    (process.env.REACT_APP_API_BASE_URL as string) ||
    `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}`;
  const apiOrigin = React.useMemo(() => apiBase.replace(/\/?api\/?$/, ""), [apiBase]);

  const resolveUrl = React.useCallback(
    (u?: string) => {
      if (!u) return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      if (u.startsWith("/api/")) return `${apiOrigin}${u}`;
      if (u.startsWith("/uploads/"))
        return `${apiOrigin}${u.replace(/^\/uploads\//, "/api/uploads/")}`;
      if (!u.startsWith("/")) return `${window.location.origin}/${u.replace(/^\.\//, "")}`;
      return u;
    },
    [apiOrigin]
  );

  // Build media list
  const media = React.useMemo(() => {
    const items: Array<{ type: "video" | "image"; url: string; label?: string }> = [];
    const pushUrl = (url?: string, label?: string) => {
      if (!url) return;
      const ru = resolveUrl(url);
      const isVideo =
        /(\.mp4|\.webm|\.ogg|\.mov|\.m4v)$/i.test(ru) ||
        ru.includes("youtube.com") ||
        ru.includes("youtu.be");
      items.push({ type: isVideo ? "video" : "image", url: ru, label });
    };
    if (tier?.trailerUrl) pushUrl(tier.trailerUrl, "Trailer");
    if (tier?.previewUrl) pushUrl(tier.previewUrl, "Preview");
    (tier?.resources || []).forEach((r) => {
      const ru = resolveUrl(r.url);
      if (r.type === "video") items.push({ type: "video", url: ru, label: "Video" });
      else if (/(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)$/i.test(ru))
        items.push({ type: "image", url: ru, label: "Image" });
    });
    return items;
  }, [tier, resolveUrl]);

  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => setIdx(0), [tier?.id]);

  const next = () => setIdx((i) => (media.length ? (i + 1) % media.length : 0));
  const prev = () => setIdx((i) => (media.length ? (i - 1 + media.length) % media.length : 0));

  const StarsRow = ({ value, size = 18 }: { value: number; size?: number }) => {
    const full = Math.round(value || 0);
    return (
      <HStack gap={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon
            key={i}
            as={Star}
            boxSize={`${size}px`}
            color={i < full ? GOLD : "gray.400"}
            fill={i < full ? GOLD : "none"}
          />
        ))}
      </HStack>
    );
  };

  const heroImage = React.useMemo(() => (media.find((m) => m.type === "image")?.url || ""), [media]);
  const heroVideo = React.useMemo(
    () => (media.find((m) => m.type === "video" && !/youtube|youtu\.be/i.test(m.url))?.url || ""),
    [media]
  );

  const scrollToMedia = React.useCallback(() => {
    const el = document.getElementById("course-media");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const isChallenge = React.useMemo(() => {
    const pt = String((tier as any)?.productType || "").toUpperCase();
    if (pt === "CHALLENGE") return true;
    if (resolvedKind === "challenge") return true;
    if ((tier as any)?.challengePlatform) return true;
    if ((tier as any)?.challengeMeta) return true;
    return false;
  }, [tier, resolvedKind]);

  const challengeMeta = (tier as any)?.challengeMeta || {};
  const steps = isChallenge ? guessSteps(tier as any) : null;

  // Common challenge stats (flexible keys)
  const accountSize = pick(challengeMeta, ["accountSize", "account_size", "balance", "startingBalance", "starting_balance", "capital"]);
  const profitTarget = pick(challengeMeta, ["profitTarget", "profit_target", "targetProfit", "target_profit", "profit"]);
  const maxDailyDD = pick(challengeMeta, ["maxDailyDrawdown", "dailyDrawdown", "max_daily_drawdown", "daily_dd"]);
  const maxTotalDD = pick(challengeMeta, ["maxTotalDrawdown", "maxOverallDrawdown", "overallDrawdown", "max_total_drawdown", "overall_dd"]);
  const minDays = pick(challengeMeta, ["minTradingDays", "minimumDays", "min_days", "min_trading_days"]);
  const leverage = pick(challengeMeta, ["leverage", "maxLeverage", "max_leverage"]);
  const platform = (tier as any)?.challengePlatform || pick(challengeMeta, ["platform", "brokerPlatform"]) || "MT5";

  const primaryCtaHref = React.useMemo(() => {
    if (!tier?.id) return "/products";
    if (isEnrolled) {
      // keep your existing route; for challenges you can later swap to /challenge/:id if you have it
      return isChallenge ? `/products/${tier.id}` : `/learn/${tier.id}`;
    }
    return `/checkout?tierId=${tier.id}`;
  }, [tier?.id, isEnrolled, isChallenge]);

  return (
    <Box py={{ base: 0, md: 0 }} color="text.primary">
      {/* ===== HERO (Challenge-styled when isChallenge) ===== */}
      <Box
        position="relative"
        h={{ base: "46vh", md: "62vh" }}
        overflow="hidden"
        borderBottom="1px solid"
        borderColor={GOLD}
      >
        {heroVideo ? (
          <chakra.video
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : heroImage ? (
          <Image src={heroImage} alt="hero" w="100%" h="100%" objectFit="cover" />
        ) : (
          <Box w="100%" h="100%" bgGradient="linear(to-b, blackAlpha.700, blackAlpha.500, blackAlpha.700)" />
        )}

        <Box position="absolute" inset={0} bgGradient="linear(to-b, blackAlpha.750, blackAlpha.150 45%, blackAlpha.850)" />

        <Container
          maxW="7xl"
          position="absolute"
          inset={0}
          display="flex"
          alignItems="flex-end"
          pb={{ base: 6, md: 10 }}
        >
          <VStack align="start" gap={3} maxW={{ base: "92%", md: "64%" }} color="#65a8bf">
            <HStack gap={2} flexWrap="wrap">
              <Badge
                borderRadius="full"
                px={3}
                py={1}
                bg={`${GOLD}22`}
                color={GOLD}
                border={`1px solid ${GOLD}55`}
              >
                {isChallenge
                  ? t("products.challenge", { defaultValue: "Challenge" })
                  : t("products.course", { defaultValue: "Course" })}
              </Badge>

              {isChallenge && (
                <Badge borderRadius="full" px={3} py={1} bg="blackAlpha.600" border="1px solid rgba(255,255,255,0.25)">
                  {String(platform || "MT5")}
                </Badge>
              )}

              {isChallenge && steps && (
                <Badge borderRadius="full" px={3} py={1} bg="blackAlpha.600" border="1px solid rgba(255,255,255,0.25)">
                  {steps === 1
                    ? t("challenges.one_step", { defaultValue: "1-Step" })
                    : t("challenges.two_step", { defaultValue: "2-Step" })}
                </Badge>
              )}
            </HStack>

            <Heading size={{ base: "xl", md: "2xl" }}>
              {tier?.name || (isChallenge ? "Challenge" : "Course")}
            </Heading>

            {tier?.description && (
              <Text noOfLines={{ base: 3, md: 4 }} opacity={0.92}>
                {tier.description}
              </Text>
            )}

            <HStack gap={3} pt={2} flexWrap="wrap">
              <Button
                as={RouterLink}
                to={primaryCtaHref}
                size="lg"
                bg={GOLD}
                color="black"
                _hover={{ opacity: 0.92 }}
                borderRadius="xl"
              >
                {isEnrolled
                  ? isChallenge
                    ? t("actions.view_details", { defaultValue: "View Details" })
                    : t("home.courses.view", { defaultValue: "Continue" })
                  : isChallenge
                  ? t("actions.buy_challenge", { defaultValue: "Buy Challenge" })
                  : t("actions.enroll", { defaultValue: "Enroll" })}
              </Button>

              {(heroVideo || media.some((m) => m.type === "video")) && (
                <Button
                  size="lg"
                  variant="outline"
                  color="#65a8bf"
                  onClick={scrollToMedia}
                  borderRadius="xl"
                >
                  {t("learn.materials.trailer", { defaultValue: "Watch Trailer" })}
                </Button>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="7xl" py={{ base: 8, md: 12 }}>
        {loading && (
          <HStack>
            <Spinner size="sm" />
            <Text>{t("common.loading")}</Text>
          </HStack>
        )}
        {error && <Text color="red.500">{error}</Text>}

        {!loading && !error && tier && (
          <VStack align="stretch" gap={{ base: 8, md: 10 }}>
            <Grid templateColumns={{ base: "1fr", lg: "1.15fr 0.85fr" }} gap={{ base: 6, lg: 8 }}>
              {/* LEFT: Media */}
              <GridItem>
                <VStack align="stretch" gap={3}>
                  <Box
                    id="course-media"
                    borderColor={GOLD}
                    borderRadius="lg"
                    overflow="hidden"
                    borderWidth="1px"
                    position="relative"
                  >
                    <AspectRatio ratio={16 / 9} bg="bg.surface">
                      <MotionBox key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                        {media[idx]?.type === "video" ? (
                          media[idx].url.includes("youtube") || media[idx].url.includes("youtu.be") ? (
                            <chakra.iframe
                              src={media[idx].url}
                              title={`media-${idx}`}
                              allowFullScreen
                              width="100%"
                              height="100%"
                            />
                          ) : (
                            <chakra.video src={media[idx].url} controls width="100%" height="100%" />
                          )
                        ) : (
                          <Image
                            src={media[idx]?.url}
                            alt={`media-${idx}`}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        )}
                      </MotionBox>
                    </AspectRatio>

                    {media.length > 1 && (
                      <>
                        <Button size="sm" position="absolute" top="50%" left={2} transform="translateY(-50%)" onClick={prev}>
                          {t("common.prev") || "Prev"}
                        </Button>
                        <Button size="sm" position="absolute" top="50%" right={2} transform="translateY(-50%)" onClick={next}>
                          {t("common.next") || "Next"}
                        </Button>
                      </>
                    )}
                  </Box>

                  {media.length > 1 && (
                    <HStack p={1} overflowX="auto" gap={3}>
                      {media.map((m, i) => (
                        <Box
                          key={i}
                          onClick={() => setIdx(i)}
                          cursor="pointer"
                          borderWidth={i === idx ? "2px" : "1px"}
                          borderColor={i === idx ? GOLD : "border.default"}
                          borderRadius="md"
                          p={1}
                          minW="92px"
                        >
                          {m.type === "image" ? (
                            <Image src={m.url} alt={`thumb-${i}`} height="60px" width="90px" objectFit="cover" />
                          ) : (
                            <Box
                              height="60px"
                              width="90px"
                              bg="bg.surface"
                              color="#65a8bf"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="xs"
                            >
                              {m.label || "Video"}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </GridItem>

              {/* RIGHT: Product summary */}
              <GridItem>
                <VStack align="stretch" gap={4}>
                  <VStack align="stretch" gap={2}>
                    <HStack flexWrap="wrap" gap={3}>
                      <Heading size={{ base: "lg", md: "xl" }}>{tier.name}</Heading>

                      {!isChallenge && (tier as any)?.level && (
                        <Badge colorScheme="yellow" borderRadius="full">
                          {t(levelKey((tier as any)?.level))}
                        </Badge>
                      )}

                      {isChallenge && (
                        <Badge colorScheme="purple" borderRadius="full">
                          {t("products.evaluation", { defaultValue: "Evaluation" })}
                        </Badge>
                      )}
                    </HStack>

                    {typeof tier.rating_avg === "number" && (
                      <HStack gap={3} align="center" flexWrap="wrap">
                        <StarsRow value={tier.rating_avg} />
                        <Text fontWeight="semibold">{(tier.rating_avg ?? 0).toFixed(1)}</Text>
                        <Text color="text.muted">
                          {t("meta.rating_summary", {
                            defaultValue: "{{avg}} ({{count}} reviews)",
                            avg: (tier.rating_avg ?? 0).toFixed(1),
                            count: tier.rating_count ?? 0,
                          })}
                        </Text>
                      </HStack>
                    )}

                    <Text color="text.muted">{tier.description}</Text>
                  </VStack>

                  <Divider />

                  {/* Price + CTA */}
                  <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                    <Box>
                      <Text fontSize="sm" color="text.muted">
                        {t("price.label", { defaultValue: "Price" })}
                      </Text>
                      <Heading size="lg">
                        {(tier.price_usdt ?? 0) <= 0
                          ? t("price.free", { defaultValue: "Free" })
                          : t("price.usdt", { value: tier.price_usdt, defaultValue: `${tier.price_usdt} USDT` })}
                      </Heading>
                    </Box>

                    <Button
                      as={RouterLink}
                      to={primaryCtaHref}
                      size="lg"
                      bg={GOLD}
                      _hover={{ opacity: 0.92 }}
                      color="black"
                      borderRadius="xl"
                      minW={{ base: "100%", sm: "240px" }}
                    >
                      {isEnrolled
                        ? isChallenge
                          ? t("actions.view_details", { defaultValue: "View Details" })
                          : t("home.courses.view", { defaultValue: "View Course" })
                        : isChallenge
                        ? t("actions.buy_challenge", { defaultValue: "Buy Challenge" })
                        : t("actions.enroll", { defaultValue: "Enroll" })}
                    </Button>
                  </HStack>

                  {/* Challenge-specific: Specs */}
                  {isChallenge && (
                    <>
                      <Divider />
                      <Heading size="md">
                        {t("challenge.specs", { defaultValue: "Challenge Specs" })}
                      </Heading>

                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                        <StatCard
                          icon={Briefcase}
                          label={t("challenge.account_size", { defaultValue: "Account Size" })}
                          value={accountSize ? formatMoney(accountSize) : t("common.tbd", { defaultValue: "TBD" })}
                        />
                        <StatCard
                          icon={Target}
                          label={t("challenge.profit_target", { defaultValue: "Profit Target" })}
                          value={profitTarget !== undefined ? formatPct(profitTarget) : t("common.tbd", { defaultValue: "TBD" })}
                        />
                        <StatCard
                          icon={Shield}
                          label={t("challenge.max_daily_dd", { defaultValue: "Max Daily Drawdown" })}
                          value={maxDailyDD !== undefined ? formatPct(maxDailyDD) : t("common.tbd", { defaultValue: "TBD" })}
                        />
                        <StatCard
                          icon={Shield}
                          label={t("challenge.max_total_dd", { defaultValue: "Max Total Drawdown" })}
                          value={maxTotalDD !== undefined ? formatPct(maxTotalDD) : t("common.tbd", { defaultValue: "TBD" })}
                        />
                        <StatCard
                          icon={Calendar}
                          label={t("challenge.min_days", { defaultValue: "Min Trading Days" })}
                          value={minDays !== undefined ? String(minDays) : t("common.tbd", { defaultValue: "TBD" })}
                        />
                        <StatCard
                          icon={Award}
                          label={t("challenge.leverage", { defaultValue: "Leverage" })}
                          value={leverage ? String(leverage) : t("common.tbd", { defaultValue: "TBD" })}
                        />
                      </SimpleGrid>

                      {/* Optional: Rules list from meta */}
                      {(Array.isArray(challengeMeta?.rules) || typeof challengeMeta?.rules === "string") && (
                        <Box>
                          <Heading size="sm" mb={2}>
                            {t("challenge.rules", { defaultValue: "Rules" })}
                          </Heading>
                          {Array.isArray(challengeMeta?.rules) ? (
                            <VStack align="stretch" gap={2}>
                              {challengeMeta.rules.map((r: any, i: number) => (
                                <HStack key={i} align="start" gap={2}>
                                  <Box mt="7px" w="6px" h="6px" borderRadius="full" bg={GOLD} />
                                  <Text fontSize="sm" color="text.muted">{String(r)}</Text>
                                </HStack>
                              ))}
                            </VStack>
                          ) : (
                            <Text fontSize="sm" color="text.muted">
                              {String(challengeMeta.rules)}
                            </Text>
                          )}
                        </Box>
                      )}
                    </>
                  )}

                  {/* Course benefits (keep yours for courses) */}
                  {!isChallenge && (
                    <Box>
                      <VStack align="stretch" gap={2} mt={2}>
                        <HStack align="start" gap={3}>
                          <Icon as={Award} boxSize={5} color={GOLD} mt="2px" />
                          <Text fontSize="sm" lineHeight="1.4">
                            {t("checkout.benefits.certificate", {
                              defaultValue: "You’ll receive a certificate of achievement",
                            })}
                          </Text>
                        </HStack>
                        <HStack align="start" gap={3}>
                          <Icon as={Headphones} boxSize={5} color={GOLD} mt="2px" />
                          <Text fontSize="sm" lineHeight="1.4">
                            {t("checkout.benefits.lifetime", {
                              defaultValue: "Lifetime access to all tiers",
                            })}
                          </Text>
                        </HStack>
                        <HStack align="start" gap={3}>
                          <Icon as={Send} boxSize={5} color={GOLD} mt="2px" />
                          <Text fontSize="sm" lineHeight="1.4">
                            {t("checkout.benefits.brokerBonus", {
                              defaultValue:
                                "Join our certified broker and enjoy a complimentary 50–100% bonus on your deposits",
                            })}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  )}

                  {(tier.instructorName || tier.instructorBio || tier.instructorAvatarUrl) && !isChallenge && (
                    <>
                      <Divider />
                      <HStack align="start" gap={4}>
                        {tier.instructorAvatarUrl ? (
                          <Image
                            src={resolveUrl(tier.instructorAvatarUrl)}
                            alt={tier.instructorName || "Instructor"}
                            boxSize="64px"
                            borderRadius="full"
                            objectFit="cover"
                          />
                        ) : (
                          <Box
                            boxSize="64px"
                            borderRadius="full"
                            bg="gray.300"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                          >
                            {(tier.instructorName || " ? ").slice(0, 1)}
                          </Box>
                        )}
                        <VStack align="start" gap={1}>
                          {tier.instructorName && <Heading size="sm">{tier.instructorName}</Heading>}
                          {tier.instructorBio && <Text color="text.muted">{tier.instructorBio}</Text>}
                        </VStack>
                      </HStack>
                    </>
                  )}

                  {typeof tier.purchases_count === "number" && (
                    <Text color="text.muted">
                      {t("meta.purchased_by", {
                        defaultValue: "{{count}} students enrolled",
                        count: tier.purchases_count,
                      })}
                    </Text>
                  )}
                </VStack>
              </GridItem>
            </Grid>

            {/* ===== Community / Social Widgets (gated) ===== */}
            <Box>
              <Heading size="md" mb={3}>
                {t("socials.title", {
                  defaultValue: "Premium features (included after enrollment)",
                })}
              </Heading>

              <RequireEnrollment
                tierId={tier.id}
                fallback={
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    <FeatureChip>
                      <Icon as={Lock} />
                      <Text>{t("features.signals", { defaultValue: "Telegram Signals" })}</Text>
                    </FeatureChip>
                    <FeatureChip>
                      <Icon as={Lock} />
                      <Text>{t("features.discord", { defaultValue: "Private Discord" })}</Text>
                    </FeatureChip>
                    <FeatureChip>
                      <Icon as={Lock} />
                      <Text>{t("features.twitter", { defaultValue: "Curated X/Twitter feed" })}</Text>
                    </FeatureChip>
                  </SimpleGrid>
                }
              >
                <VStack align="stretch" gap={4}>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    {/* Telegram */}
                    <Box>
                      <Heading size="sm" mb={2}>Telegram</Heading>
                      {tier.telegramEmbedUrl ? (
                        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                          <AspectRatio ratio={16 / 9}>
                            <chakra.iframe src={tier.telegramEmbedUrl} title="Telegram" width="100%" height="100%" />
                          </AspectRatio>
                        </Box>
                      ) : tier.telegramUrl ? (
                        <chakra.a href={tier.telegramUrl} target="_blank" rel="noreferrer" style={{ color: GOLD }}>
                          {t("socials.join_telegram", { defaultValue: "Join our Telegram" })}
                        </chakra.a>
                      ) : (
                        <Text color="text.muted">
                          {t("socials.telegram_unavailable", { defaultValue: "Telegram not available." })}
                        </Text>
                      )}
                    </Box>

                    {/* Discord */}
                    <Box>
                      <Heading size="sm" mb={2}>Discord</Heading>
                      {tier.discordWidgetId ? (
                        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                          <AspectRatio ratio={16 / 9}>
                            <chakra.iframe
                              src={`https://discord.com/widget?id=${tier.discordWidgetId}&theme=dark`}
                              title="Discord"
                              allowTransparency
                              allowFullScreen
                            />
                          </AspectRatio>
                        </Box>
                      ) : tier.discordInviteUrl ? (
                        <chakra.a href={tier.discordInviteUrl} target="_blank" rel="noreferrer" style={{ color: GOLD }}>
                          {t("socials.join_discord", { defaultValue: "Join our Discord" })}
                        </chakra.a>
                      ) : (
                        <Text color="text.muted">
                          {t("socials.discord_unavailable", { defaultValue: "Discord not available." })}
                        </Text>
                      )}
                    </Box>

                    {/* X */}
                    <Box>
                      <Heading size="sm" mb={2}>X (Twitter)</Heading>
                      {tier.twitterTimelineUrl ? (
                        <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                          <AspectRatio ratio={16 / 9}>
                            <chakra.iframe
                              src={`https://twitframe.com/show?url=${encodeURIComponent(tier.twitterTimelineUrl)}`}
                              title="X Timeline"
                            />
                          </AspectRatio>
                        </Box>
                      ) : (
                        <Text color="text.muted">
                          {t("socials.twitter_unavailable", { defaultValue: "X feed not available." })}
                        </Text>
                      )}
                    </Box>
                  </SimpleGrid>
                </VStack>
              </RequireEnrollment>
            </Box>

            {/* ===== Reviews ===== */}
            <Box>
              <Box borderTop="1px solid" borderColor="border.default" my={4} />
              <Heading size="md" mb={3}>
                {t("reviews.title", { defaultValue: "Reviews" })}
              </Heading>
              {Array.isArray(tier.reviews) && tier.reviews.length > 0 ? (
                <Box position="relative">
                  <HStack justify="space-between" mb={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById("reviews-rail");
                        if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                      }}
                    >
                      {t("common.prev") || "Prev"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById("reviews-rail");
                        if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                      }}
                    >
                      {t("common.next") || "Next"}
                    </Button>
                  </HStack>

                  <Box
                    id="reviews-rail"
                    display="flex"
                    gap={4}
                    overflowX="auto"
                    py={2}
                    px={1}
                    scrollSnapType="x mandatory"
                  >
                    {tier.reviews.map((rv) => (
                      <Box
                        key={rv.id}
                        minW={{ base: "260px", md: "360px" }}
                        maxW={{ base: "260px", md: "360px" }}
                        p={3}
                        border="1px solid"
                        borderColor="border.default"
                        borderRadius="md"
                        scrollSnapAlign="start"
                        bg="bg.surface"
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" gap={1}>
                            <HStack>
                              <Text fontWeight={600}>
                                {(rv as any).author ||
                                  (rv as any).user?.name ||
                                  t("reviews.anonymous", { defaultValue: "Anonymous" })}
                              </Text>
                              <HStack>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Icon
                                    key={i}
                                    as={Star}
                                    color={i < Math.round(rv.rating ?? 0) ? GOLD : "gray.400"}
                                    fill={i < Math.round(rv.rating ?? 0) ? GOLD : "none"}
                                  />
                                ))}
                              </HStack>
                            </HStack>
                            {rv.comment && <Text>{rv.comment}</Text>}
                          </VStack>
                          <Text fontSize="sm" color="text.muted">
                            {fmtDate(rv.created_at)}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Text color="text.muted">
                  {t("reviews.empty", { defaultValue: "No reviews yet." })}
                </Text>
              )}
            </Box>
          </VStack>
        )}

        {!loading && !error && !tier && <Text>{t("errors.load_failed")}</Text>}
      </Container>
    </Box>
  );
};

export default CourseDetail;
