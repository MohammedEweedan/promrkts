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
  Stack,
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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import api from "../../api/client";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { TokenUSDT } from "@web3icons/react";
import SpotlightCard from "../../components/SpotlightCard";

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
  const { isOpen: isExitOpen, onOpen: onExitOpen, onClose: onExitClose } = useDisclosure();
  const [hasShownExit, setHasShownExit] = React.useState(false);

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
        // Load courses + subscriptions (challenges removed)
        const [coursesResp, subsResp] = await Promise.all([
          api.get("/courses").catch(() => ({ data: [] })),
          api.get("/subscriptions").catch(() => ({ data: [] })),
        ]);
        const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
        const subs = Array.isArray(subsResp.data) ? subsResp.data : [];
        setTiers([...courses, ...subs]);
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

  return (
    <Box py={{ base: 4, md: 10 }}>
      <Container maxW="7xl">
        <VStack align="stretch" gap={6}>

          <Alert status="info" variant="subtle" borderRadius="md" mt={20}>
            <AlertIcon />
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
              </TabList>
              <TabPanels>
                {/* Guides tab */}
                <TabPanel px={0}>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 2 }} gap={{ base: 4, md: 6 }}>
                    {guidesOnly.map((tier) => (
                      <SpotlightCard>
                        <Box
                          key={tier.id}
                          border="1px solid"
                          borderColor={GOLD}
                          borderRadius="lg"
                          p={{ base: 4, md: 5 }}
                          _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                          transition="all 200ms ease"
                          bg="bg.surface"
                        >
                          <Stack gap={4}>
                            <HStack justify="space-between" align="start">
                              <Heading size={{ base: "md", md: "lg" }} noOfLines={2}>
                                {tier.name}
                              </Heading>
                              <Badge
                                color={GOLD}
                                variant="subtle"
                                borderRadius="md"
                                border={`1px solid ${GOLD}`}
                              >
                                {t(levelKey(tier.level as any))}
                              </Badge>
                            </HStack>
                            <Text noOfLines={{ base: 3, md: 4 }} opacity={0.85}>
                              {tier.description}
                            </Text>
                            {renderSnippetStyleStars(tier)}
                            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                              <HStack
                                px={3}
                                py={1}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={GOLD}
                                bg="transparent"
                                gap={2}
                              >
                                <Icon as={TokenUSDT} boxSize={5} />
                                <Text fontWeight="bold">
                                  {(tier.price_usdt ?? 0) <= 0
                                    ? t("price.free", { defaultValue: "Free" })
                                    : t("price.usdt", {
                                        value: tier.price_usdt,
                                        defaultValue: `${tier.price_usdt} USDT`,
                                      })}
                                </Text>
                              </HStack>
                              <HStack gap={3}>
                                <Button
                                  as={RouterLink}
                                  to={`/products/${tier.id}`}
                                  variant="outline"
                                  borderColor={GOLD}
                                  color={GOLD}
                                >
                                  {t("actions.view_details", { defaultValue: "View details" })}
                                </Button>
                                <Button
                                  as={RouterLink}
                                  to={
                                    (tier.price_usdt ?? 0) <= 0
                                      ? `/learn/${tier.id}`
                                      : `/checkout?tierId=${tier.id}`
                                  }
                                  bg={GOLD}
                                  _hover={{ opacity: 0.9 }}
                                  color="black"
                                >
                                  {t("actions.enroll", { defaultValue: "Enroll" })}
                                </Button>
                              </HStack>
                            </HStack>
                            <Text fontSize="xs" opacity={0.7} textAlign="center">
                              {t("notes.network_reminder", {
                                defaultValue: "Use TRC20 network for USDT payments.",
                              })}
                            </Text>
                          </Stack>
                        </Box>
                      </SpotlightCard>
                    ))}
                    {guidesOnly.length === 0 && (
                      <Text>{t("guides.none", { defaultValue: "No guides available yet." })}</Text>
                    )}
                  </SimpleGrid>
                </TabPanel>
                {/* Community tab */}
                <TabPanel px={0}>
                  <SimpleGrid columns={{ base: 1, sm: 1, lg: 1 }} gap={{ base: 4, md: 6 }}>
                    {communityOnly.map((tier) => (
                      <SpotlightCard>
                        <Box
                          key={tier.id}
                          border="1px solid"
                          borderColor={GOLD}
                          borderRadius="lg"
                          p={{ base: 4, md: 5 }}
                          bg="bg.surface"
                        >
                          <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                            <VStack align="start" spacing={1}>
                              <Heading size={{ base: "md", md: "lg" }}>{tier.name}</Heading>
                              <Text opacity={0.85}>{tier.description}</Text>
                              <HStack>
                                <Badge colorScheme="yellow">VIP</Badge>
                                <Text fontWeight="bold">
                                  {t("price.usd_month", {
                                    defaultValue: `$${tier.price_usdt}/month`,
                                  })}
                                </Text>
                              </HStack>
                            </VStack>
                            <Button
                              as={RouterLink}
                              to={`/checkout?tierId=${tier.id}`}
                              bg={GOLD}
                              _hover={{ opacity: 0.9 }}
                              color="black"
                            >
                              {t("actions.subscribe", { defaultValue: "Subscribe" })}
                            </Button>
                          </HStack>
                        </Box>
                      </SpotlightCard> 
                    ))}
                    {communityOnly.length === 0 && (
                      <Text>
                        {t("community.none", { defaultValue: "No community subscriptions available." })}
                      </Text>
                    )}
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </VStack>
      </Container>

      {/* Exit-Intent Modal - Try our free guide */}
      <Modal isOpen={isExitOpen} onClose={onExitClose} isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent
          bg="gray.900"
          border="1px solid"
          borderColor={GOLD}
          borderRadius="xl"
          mx={4}
        >
          <ModalCloseButton color="gray.400" />
          <ModalHeader textAlign="center" pt={8} pb={2}>
            <Text fontSize="2xl" fontWeight="bold" color={GOLD}>
              {t("exit_intent.title", { defaultValue: "Wait! Before you go..." })}
            </Text>
          </ModalHeader>
          <ModalBody textAlign="center" pb={8}>
            <VStack spacing={4}>
              <Text fontSize="lg" opacity={0.9}>
                {t("exit_intent.message", { defaultValue: "Try our free guide and see what we offer!" })}
              </Text>
              {freeGuide ? (
                <VStack spacing={3} w="full">
                  <Text fontWeight="semibold" color={GOLD}>
                    {freeGuide.name}
                  </Text>
                  <Text fontSize="sm" opacity={0.7} noOfLines={2}>
                    {freeGuide.description}
                  </Text>
                  <Button
                    as={RouterLink}
                    to={`/learn/${freeGuide.id}`}
                    bg="white"
                    color="black"
                    size="lg"
                    w="full"
                    _hover={{ opacity: 0.9, transform: "translateY(-2px)" }}
                    onClick={onExitClose}
                  >
                    {t("exit_intent.cta", { defaultValue: "Start Free Guide" })}
                  </Button>
                </VStack>
              ) : (
                <Button
                  as={RouterLink}
                  to="/contact"
                  bg="black"
                  color="white"
                  size="lg"
                  _hover={{ opacity: 0.9 }}
                  onClick={onExitClose}
                >
                  {t("exit_intent.contact", { defaultValue: "Contact Us" })}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onExitClose} opacity={0.6}>
                {t("exit_intent.dismiss", { defaultValue: "No thanks" })}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CoursesList;
