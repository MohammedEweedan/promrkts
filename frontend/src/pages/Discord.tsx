// src/pages/Discord.tsx
/* eslint-disable */
import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Button,
  SimpleGrid,
  Divider,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useThemeMode } from "../themeProvider";
import SpotlightCard from "../components/SpotlightCard";
import api from "../api/client";
import { CheckCircle2, Lock, Rocket, Shield, Users, MessageSquare } from "lucide-react";

const MotionBox = motion(Box);

const BRAND = "#65a8bf";
const GOLD = "#65a8bf";
const DISCORD_PURPLE = "#5865F2";

// Use your server id (same one in Hero widget)
const DISCORD_WIDGET_SERVER_ID = "1447879971946102847";

const DiscordServerWidget: React.FC<{ inviteUrl?: string }> = ({ inviteUrl }) => {
  const widgetSrc = React.useMemo(() => {
    if (DISCORD_WIDGET_SERVER_ID) {
      return `https://discord.com/widget?id=${DISCORD_WIDGET_SERVER_ID}&theme=dark`;
    }
    return "";
  }, []);

  if (!widgetSrc) {
    return (
      <VStack align="stretch" spacing={3}>
        <Text fontSize="sm" color="gray.300">
          Discord server widget is not configured.
        </Text>
        {inviteUrl && (
          <Button
            w="100%"
            borderRadius="full"
            bg={DISCORD_PURPLE}
            color="#65a8bf"
            _hover={{ filter: "brightness(1.05)" }}
            onClick={() => window.open(inviteUrl, "_blank", "noreferrer")}
          >
            Open Discord
          </Button>
        )}
      </VStack>
    );
  }

  return (
    <Box
      as="iframe"
      src={widgetSrc}
      w="100%"
      h="100%"
      border="0"
      allowTransparency
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      sx={{
        borderTop: "1px solid rgba(15,23,42,0.8)",
      }}
    />
  );
};

type Tier = {
  id?: number | string;
  name?: string;
  isVipProduct?: boolean;
  vipType?: string; // "discord"
  discordInviteUrl?: string;
  vipEnd?: string | null;
  price?: number;
  currency?: string;
  periodLabel?: string; // optional if backend has it
  description?: string;
};

export default function DiscordPage() {
  const { t } = useTranslation() as any;
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const [loading, setLoading] = React.useState(true);
  const [me, setMe] = React.useState<any>(null);

  const [discordVipActive, setDiscordVipActive] = React.useState(false);
  const [discordVipEnd, setDiscordVipEnd] = React.useState<string | null>(null);
  const [discordLink, setDiscordLink] = React.useState<string>("");

  const [discordTiers, setDiscordTiers] = React.useState<Tier[]>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);

        // same calls style as Hero.tsx
        const [meResp, statusResp, subsResp] = await Promise.all([
          api.get("/users/me").catch(() => ({ data: null })),
          api.get("/community/status").catch(() => ({ data: null })),
          api.get("/subscriptions").catch(() => ({ data: [] })),
        ]);

        const subs = Array.isArray(subsResp?.data) ? subsResp.data : [];
        const discordTier = subs.find((x: any) => x?.isVipProduct && x?.vipType === "discord");
        const inviteUrl = discordTier?.discordInviteUrl || "";

        const st = statusResp?.data || {};
        const vipEndDate = st?.vipEnd || null;

        // active if tier exists OR status has discord true
        const activeDiscord = !!st?.discord || !!discordTier;

        if (!active) return;

        setMe(meResp?.data || null);
        setDiscordVipActive(activeDiscord);
        setDiscordVipEnd(discordTier?.vipEnd || vipEndDate || null);
        setDiscordLink(inviteUrl);

        // Funnel: only show discord-related tiers
        const tiers = subs
          .filter((x: any) => x?.isVipProduct && x?.vipType === "discord")
          .map((x: any) => ({
            id: x?.id,
            name: x?.name || "Discord VIP",
            isVipProduct: !!x?.isVipProduct,
            vipType: x?.vipType,
            discordInviteUrl: x?.discordInviteUrl,
            vipEnd: x?.vipEnd || null,
            price: x?.price,
            currency: x?.currency || "USD",
            periodLabel: x?.periodLabel, // if exists
            description: x?.description,
          }));

        setDiscordTiers(tiers);
      } catch {
        // silent fail
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const isLoggedIn = !!me;

  const heroBg =
    mode === "dark"
      ? "linear-gradient(180deg, rgba(5,8,17,1) 0%, rgba(7,12,24,1) 100%)"
      : "linear-gradient(180deg, rgba(245,250,255,1) 0%, rgba(235,245,255,1) 100%)";

  const fadeIn = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  const endLabel = (() => {
    if (!discordVipEnd) return null;
    try {
      return new Date(discordVipEnd).toLocaleDateString();
    } catch {
      return discordVipEnd;
    }
  })();

  const goSubscribe = () => {
    // You already use /products for enroll funnels; keep consistent
    navigate("/products");
  };

  return (
    <Box position="relative" minH="100vh">
      {/* Top hero section like Home */}
      <Box
        py={{ base: 10, md: 14 }}
        bg={heroBg}
        borderBottom="1px solid rgba(255,255,255,0.06)"
      >
        <Container maxW="container.xl">
          <MotionBox initial="hidden" animate="visible" variants={fadeIn}>
            <VStack align="start" spacing={4}>
              <HStack spacing={3} wrap="wrap">
                <Badge borderRadius="full" px={4} py={1} bg={`${BRAND}22`} color="teal.100">
                  Trading Floor
                </Badge>
                <Badge borderRadius="full" px={4} py={1} bg={`${DISCORD_PURPLE}22`} color="purple.100">
                  Discord Hub
                </Badge>
                {discordVipActive && (
                  <Badge borderRadius="full" px={4} py={1} bg={`${GOLD}22`} color={GOLD}>
                    Access Active{endLabel ? ` • ends ${endLabel}` : ""}
                  </Badge>
                )}
              </HStack>

              <Heading color="#65a8bf" fontSize={{ base: "3xl", md: "5xl" }}>
                {t("discord.title", { defaultValue: "Join the Trading Floor" })}
              </Heading>

              <Text color="#65a8bf" opacity={0.9} maxW="3xl" fontSize={{ base: "md", md: "lg" }}>
                {discordVipActive
                  ? t("discord.sub.active", {
                      defaultValue:
                        "You’re in. Your Discord hub is unlocked — jump into rooms, reviews, and live execution channels.",
                    })
                  : t("discord.sub.funnel", {
                      defaultValue:
                        "Everything you need to trade with structure: setups, reviews, accountability, and a community that takes execution seriously.",
                    })}
              </Text>

              <HStack spacing={3} wrap="wrap">
                {discordVipActive ? (
                  <>
                    <Button
                      bg={DISCORD_PURPLE}
                      color="#65a8bf"
                      borderRadius="full"
                      _hover={{ filter: "brightness(1.05)" }}
                      onClick={() => window.open(discordLink || "https://discord.com", "_blank", "noreferrer")}
                    >
                      Open Discord
                    </Button>
                    <Button
                      variant="outline"
                      borderColor={BRAND}
                      color={BRAND}
                      borderRadius="full"
                      onClick={() => navigate("/products")}
                    >
                      Manage Membership
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      bg={GOLD}
                      color="black"
                      borderRadius="full"
                      _hover={{ filter: "brightness(1.05)" }}
                      onClick={goSubscribe}
                    >
                      Subscribe to Access
                    </Button>
                    <Button
                      variant="outline"
                      borderColor={BRAND}
                      color={BRAND}
                      borderRadius="full"
                      onClick={() => navigate("/company/about")}
                    >
                      About the Desk
                    </Button>
                  </>
                )}
              </HStack>

              {!isLoggedIn && (
                <Box
                  mt={2}
                  p={4}
                  borderRadius="xl"
                  border="1px solid rgba(255,255,255,0.08)"
                  bg="rgba(15,23,42,0.6)"
                >
                  <HStack justify="space-between" wrap="wrap" spacing={3}>
                    <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                      Log in to see your access status and unlock the embedded Discord hub.
                    </Text>
                    <Button
                      size="sm"
                      borderRadius="full"
                      bg={BRAND}
                      color="black"
                      onClick={() => navigate("/login")}
                    >
                      Log In
                    </Button>
                  </HStack>
                </Box>
              )}
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="container.xl" py={{ base: 8, md: 12 }}>
        {/* If subscribed: show full-page widget (primary goal) */}
        {discordVipActive ? (
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              <SpotlightCard>
                <Box p={6}>
                  <HStack spacing={3} mb={2}>
                    <Icon as={Shield as any} boxSize={6} color={BRAND} />
                    <Heading size="md" color="#65a8bf">
                      Your Access
                    </Heading>
                  </HStack>
                  <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                    Discord VIP is active{endLabel ? ` until ${endLabel}` : ""}.
                  </Text>
                  <Divider my={4} borderColor="rgba(255,255,255,0.08)" />
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Icon as={CheckCircle2 as any} color={GOLD} boxSize={5} />
                      <Text color="#65a8bf" opacity={0.9} fontSize="sm">
                        Rooms unlocked
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={CheckCircle2 as any} color={GOLD} boxSize={5} />
                      <Text color="#65a8bf" opacity={0.9} fontSize="sm">
                        Reviews & accountability
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={CheckCircle2 as any} color={GOLD} boxSize={5} />
                      <Text color="#65a8bf" opacity={0.9} fontSize="sm">
                        Live execution channels
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </SpotlightCard>

              <SpotlightCard>
                <Box p={6}>
                  <HStack spacing={3} mb={2}>
                    <Icon as={MessageSquare as any} boxSize={6} color={DISCORD_PURPLE} />
                    <Heading size="md" color="#65a8bf">
                      Quick Start
                    </Heading>
                  </HStack>
                  <VStack align="stretch" spacing={2}>
                    <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                      1) Set your nickname (real first name or handle)
                    </Text>
                    <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                      2) Pick your market roles (FX / Crypto / Indices)
                    </Text>
                    <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                      3) Post your weekly goals in the accountability room
                    </Text>
                  </VStack>
                  <Button
                    mt={5}
                    w="full"
                    borderRadius="full"
                    bg={DISCORD_PURPLE}
                    color="#65a8bf"
                    _hover={{ filter: "brightness(1.05)" }}
                    onClick={() => window.open(discordLink || "https://discord.com", "_blank", "noreferrer")}
                  >
                    Open Discord
                  </Button>
                </Box>
              </SpotlightCard>

              <SpotlightCard>
                <Box p={6}>
                  <HStack spacing={3} mb={2}>
                    <Icon as={Rocket as any} boxSize={6} color={GOLD} />
                    <Heading size="md" color="#65a8bf">
                      Keep Momentum
                    </Heading>
                  </HStack>
                  <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                    The fastest progress comes from routine: plan → execute → review.
                  </Text>
                  <Divider my={4} borderColor="rgba(255,255,255,0.08)" />
                  <Button
                    w="full"
                    borderRadius="full"
                    variant="outline"
                    borderColor={BRAND}
                    color={BRAND}
                    onClick={() => navigate("/products")}
                  >
                    Explore Guides & Communities
                  </Button>
                </Box>
              </SpotlightCard>
            </SimpleGrid>

            {/* Full-page widget area */}
            <SpotlightCard>
              <Box
                p={0}
                borderRadius="16px"
                overflow="hidden"
                minH={isDesktop ? "72vh" : "70vh"}
                w="100%"
              >
                {/* Optional header chrome */}
                <HStack
                  justify="space-between"
                  align="center"
                  px={4}
                  py={3}
                  bg="rgba(2,6,23,0.65)"
                  borderBottom="1px solid rgba(255,255,255,0.06)"
                >
                  <HStack spacing={2}>
                    <Badge borderRadius="full" px={3} bg={`${DISCORD_PURPLE}22`} color="purple.100">
                      Live
                    </Badge>
                    <Text fontSize="sm" color="#65a8bf" fontWeight="semibold">
                      Discord Hub
                    </Text>
                  </HStack>
                  <Button
                    size="sm"
                    borderRadius="full"
                    bg={DISCORD_PURPLE}
                    color="#65a8bf"
                    _hover={{ filter: "brightness(1.05)" }}
                    onClick={() => window.open(discordLink || "https://discord.com", "_blank", "noreferrer")}
                  >
                    Open in App
                  </Button>
                </HStack>

                <Box w="100%" h={isDesktop ? "calc(72vh - 52px)" : "calc(70vh - 52px)"}>
                  <DiscordServerWidget inviteUrl={discordLink} />
                </Box>
              </Box>
            </SpotlightCard>
          </VStack>
        ) : (
          // Funnel view (not subscribed)
          <VStack spacing={10} align="stretch">
            {/* Why join / benefits */}
            <Box>
              <VStack spacing={2} textAlign="center" mb={7}>
                <Heading color={BRAND} fontSize={{ base: "3xl", md: "4xl" }}>
                  What you get inside
                </Heading>
                <Text color="#65a8bf" opacity={0.85} maxW="3xl">
                  A real trading room: not hype, not noise — structure, rules, and review.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                {[
                  {
                    title: "Live Setups & Planning",
                    body: "Session bias, key levels, and execution checklists.",
                    icon: Users,
                    color: BRAND,
                  },
                  {
                    title: "Accountability Loops",
                    body: "Weekly goals, public review, and consistency tracking.",
                    icon: Shield,
                    color: GOLD,
                  },
                  {
                    title: "Trade Reviews",
                    body: "Breakdowns of wins/losses so you stop repeating mistakes.",
                    icon: MessageSquare,
                    color: DISCORD_PURPLE,
                  },
                ].map((b) => (
                  <SpotlightCard key={b.title}>
                    <Box p={6}>
                      <HStack spacing={3} mb={2}>
                        <Icon as={b.icon as any} boxSize={6} color={b.color} />
                        <Heading size="md" color="#65a8bf">
                          {b.title}
                        </Heading>
                      </HStack>
                      <Text color="#65a8bf" opacity={0.85}>
                        {b.body}
                      </Text>
                    </Box>
                  </SpotlightCard>
                ))}
              </SimpleGrid>
            </Box>

            {/* Plans / Offer */}
            <Box>
              <VStack spacing={2} textAlign="center" mb={7}>
                <Heading color={BRAND} fontSize={{ base: "3xl", md: "4xl" }}>
                  Unlock access
                </Heading>
                <Text color="#65a8bf" opacity={0.85} maxW="3xl">
                  Subscribe to enter the Discord hub and get role-based rooms.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                {/* If backend returns tiers, render them. Otherwise show a default card */}
                {(discordTiers?.length ? discordTiers : [{ name: "Discord VIP", description: "Full hub access + reviews + rooms" }]).map(
                  (tier: any, idx: number) => (
                    <SpotlightCard key={tier?.id ?? tier?.name ?? idx}>
                      <Box p={6}>
                        <HStack justify="space-between" mb={2}>
                          <Heading size="md" color="#65a8bf">
                            {tier?.name || "Discord VIP"}
                          </Heading>
                          <Badge borderRadius="full" px={3} bg={`${DISCORD_PURPLE}22`} color="purple.100">
                            VIP
                          </Badge>
                        </HStack>

                        <Text color="#65a8bf" opacity={0.85} fontSize="sm" mb={4}>
                          {tier?.description ||
                            "Access to the Trading Floor Discord hub, accountability rooms, and review channels."}
                        </Text>

                        <VStack align="stretch" spacing={2} mb={5}>
                          {[
                            "Role-based trading rooms",
                            "Weekly accountability & goals",
                            "Review templates & feedback",
                            "Community events (as scheduled)",
                          ].map((x) => (
                            <HStack key={x} spacing={2}>
                              <Icon as={CheckCircle2 as any} boxSize={5} color={GOLD} />
                              <Text color="#65a8bf" opacity={0.9} fontSize="sm">
                                {x}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>

                        <Button
                          w="full"
                          borderRadius="full"
                          bg={GOLD}
                          color="black"
                          _hover={{ filter: "brightness(1.05)" }}
                          onClick={goSubscribe}
                        >
                          Subscribe Now
                        </Button>

                        <Button
                          mt={3}
                          w="full"
                          borderRadius="full"
                          variant="outline"
                          borderColor={BRAND}
                          color={BRAND}
                          onClick={() => navigate("/products")}
                        >
                          View All Plans
                        </Button>
                      </Box>
                    </SpotlightCard>
                  )
                )}

                {/* Locked widget preview */}
                <SpotlightCard>
                  <Box p={6}>
                    <HStack spacing={3} mb={2}>
                      <Icon as={Lock as any} boxSize={6} color="gray.300" />
                      <Heading size="md" color="#65a8bf">
                        Discord Hub Preview
                      </Heading>
                    </HStack>
                    <Text color="#65a8bf" opacity={0.8} fontSize="sm" mb={4}>
                      The embedded Discord hub unlocks after you subscribe.
                    </Text>

                    <Box
                      borderRadius="xl"
                      border="1px solid rgba(255,255,255,0.08)"
                      bg="rgba(2,6,23,0.55)"
                      overflow="hidden"
                      minH="240px"
                      display="grid"
                      placeItems="center"
                    >
                      <VStack spacing={2} p={6} textAlign="center">
                        <Badge borderRadius="full" px={3} bg={`${DISCORD_PURPLE}22`} color="purple.100">
                          Locked
                        </Badge>
                        <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                          Subscribe to see the live server widget here.
                        </Text>
                        <Button
                          size="sm"
                          borderRadius="full"
                          bg={DISCORD_PURPLE}
                          color="#65a8bf"
                          _hover={{ filter: "brightness(1.05)" }}
                          onClick={goSubscribe}
                        >
                          Unlock Access
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                </SpotlightCard>
              </SimpleGrid>
            </Box>

            {/* FAQ */}
            <Box>
              <VStack spacing={2} textAlign="center" mb={6}>
                <Heading color={BRAND} fontSize={{ base: "2xl", md: "3xl" }}>
                  FAQ
                </Heading>
                <Text color="#65a8bf" opacity={0.85}>
                  Quick answers before you jump in.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {[
                  {
                    q: "Is this signals?",
                    a: "No. We focus on process: planning, execution rules, and review. You learn to build your own edge.",
                  },
                  {
                    q: "Do I get direct mentorship?",
                    a: "You get structured community review and accountability. Mentorship programs may be offered as separate products.",
                  },
                  {
                    q: "How do I access after subscribing?",
                    a: "Once your subscription is active, this page will show the embedded Discord widget and your invite link.",
                  },
                  {
                    q: "Can I cancel anytime?",
                    a: "Depends on your plan rules. Check the plan details on the Products page.",
                  },
                ].map((f) => (
                  <SpotlightCard key={f.q}>
                    <Box p={6}>
                      <Heading size="sm" color="#65a8bf" mb={2}>
                        {f.q}
                      </Heading>
                      <Text color="#65a8bf" opacity={0.85} fontSize="sm">
                        {f.a}
                      </Text>
                    </Box>
                  </SpotlightCard>
                ))}
              </SimpleGrid>

              <HStack justify="center" mt={8} spacing={3} wrap="wrap">
                <Button bg={GOLD} color="black" borderRadius="full" onClick={goSubscribe}>
                  Subscribe to Access
                </Button>
                <Button
                  variant="outline"
                  borderColor={BRAND}
                  color={BRAND}
                  borderRadius="full"
                  onClick={() => navigate("/products")}
                >
                  Browse Products
                </Button>
              </HStack>
            </Box>
          </VStack>
        )}

        {loading && (
          <Box mt={10} textAlign="center">
            <Text color="gray.400" fontSize="sm">
              Loading…
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
}
