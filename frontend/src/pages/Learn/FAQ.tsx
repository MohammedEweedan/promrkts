// src/pages/Learn/FAQ.tsx
import React from "react";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  SimpleGrid,
  Badge,
  Image,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileText,
  BookOpen,
  PlayCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const GOLD = "#65a8bf";
const MotionBox = motion(Box);

const SmallCollapse: React.FC<{ open: boolean; children: React.ReactNode }> = ({
  open,
  children,
}) => (
  <Box overflow="hidden" maxHeight={open ? "500px" : "0px"} transition="max-height 0.25s ease">
    <Box pt={open ? 3 : 0} pb={open ? 4 : 0}>
      {children}
    </Box>
  </Box>
);

function Stat({ icon: I, label, value }: { icon: any; label: string; value: string }) {
  return (
    <HStack gap={3}>
      <Icon as={I} color={GOLD} />
      <VStack align="start" gap={0}>
        <Text fontSize="sm" color="text.muted">
          {label}
        </Text>
        <Text fontWeight="semibold">{value}</Text>
      </VStack>
    </HStack>
  );
}

export default function FAQ() {
  const { t } = useTranslation() as any;
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);
  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

  const faqs = [
    {
      q: t("learn.faq.q1") || "How long do I keep access?",
      a: t("learn.faq.a1") || "Lifetime access to the content and future updates.",
    },
    {
      q: t("learn.faq.q2") || "Do I get a certificate?",
      a: t("learn.faq.a2") || "Yes, a downloadable certificate upon completion.",
    },
    {
      q: t("learn.faq.q3") || "Is there support?",
      a: t("learn.faq.a3") || "24/7 support via chat and priority email.",
    },
  ];

  return (
    <Box>
      {/* Hero / Upsell (mirrors Resources) */}
      <Box
        bgGradient={`linear(to-b, rgba(182, 233, 255,.12), transparent)`}
        borderBottom="1px solid"
        borderColor="rgba(182, 233, 255,.35)"
        py={{ base: 10, md: 16 }}
      >
        <Container maxW="7xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
            <VStack align="start" gap={5}>
              <Badge
                alignSelf="start"
                variant="outline"
                borderColor={GOLD}
                color={GOLD}
                rounded="full"
                px={3}
                py={1}
              >
                {t("learn.faq.title") || "Frequently Asked Questions"}
              </Badge>
              <Heading size="xl" lineHeight={1.15}>
                {t("learn.faq.subtitle") || "Everything you need to know before you enroll."}
              </Heading>
              <Text color="text.muted" maxW="2xl">
                {t("learn.resources.pitch") ||
                  "Get the exact curriculum our mentors use with real-world scenarios, practical downloads, and actionable frameworks. Start free, upgrade anytime."}
              </Text>

              <HStack gap={3} flexWrap="wrap">
                <RouterLink to="/products">
                  <Button size="lg" bg={GOLD} color="black" _hover={{ filter: "brightness(1.1)" }}>
                    <HStack gap={2}>
                      <Icon as={ArrowRight} />
                      <span>{t("common.explore") || "Explore"}</span>
                    </HStack>
                  </Button>
                </RouterLink>
                <RouterLink to="/learn/resources">
                  <Button size="lg" variant="outline" borderColor={GOLD} color={GOLD}>
                    {t("common.view") || "View"} {t("learn.resources.title") || "Resources"}
                  </Button>
                </RouterLink>
              </HStack>

              <HStack gap={6} pt={2} flexWrap="wrap">
                <Stat
                  icon={ShieldCheck}
                  label={t("learn.resources.guarantee") || "Mentor-reviewed"}
                  value={t("learn.resources.guarantee_value") || "Actionable & vetted"}
                />
                <Stat
                  icon={Clock}
                  label={t("learn.resources.time_to_complete") || "Avg. completion"}
                  value={t("learn.resources.time_value") || "2–6 weeks"}
                />
              </HStack>
            </VStack>

            <Box>
              <Image
                src="/images/rand/students.png"
                alt={
                  t("learn.resources.image_alt") ||
                  "Students learning with structured course content"
                }
                w="100%"
                borderRadius="2xl"
                border="1px solid"
                borderColor="rgba(182, 233, 255,.35)"
                objectFit="cover"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="7xl" py={{ base: 10, md: 16 }}>
        {/* Upsell mini-cards to keep parity with Resources */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 6 }}>
          <Card asLink="/learn/resources">
            <HStack mb={3} gap={3}>
              <Icon as={BookOpen} color={GOLD} />
              <Heading size="md">{t("learn.resources.guides") || "Step-by-Step Guides"}</Heading>
            </HStack>
            <Text color="text.muted" mb={4}>
              {t("learn.resources.guides_desc") ||
                "Structured playbooks from fundamentals to advanced strategies."}
            </Text>
            <HStack gap={3}>
              <Badge variant="outline" borderColor={GOLD} color={GOLD}>
                PDF
              </Badge>
              <Badge variant="outline" borderColor={GOLD} color={GOLD}>
                Checklists
              </Badge>
            </HStack>
          </Card>

          <Card asLink="/products">
            <HStack mb={3} gap={3}>
              <Icon as={PlayCircle} color={GOLD} />
              <Heading size="md">{t("learn.resources.videos") || "Video Library"}</Heading>
            </HStack>
            <Text color="text.muted" mb={4}>
              {t("learn.resources.videos_desc") ||
                "Concise lessons and deep-dives with real market examples."}
            </Text>
            <HStack gap={3}>
              <Badge variant="outline" borderColor={GOLD} color={GOLD}>
                {t("common.explore") || "Explore"}
              </Badge>
              <Badge variant="outline" borderColor={GOLD} color={GOLD}>
                HD
              </Badge>
            </HStack>
          </Card>

          <Card>
            <VStack align="start" gap={4}>
              <HStack gap={3}>
                <Icon as={FileText} color={GOLD} />
                <Heading size="md">
                  {t("learn.resources.syllabus") || "Course Syllabus (Preview)"}
                </Heading>
              </HStack>
              {/* pseudo divider */}
              <Box borderTop="1px solid" borderColor="rgba(182, 233, 255,.35)" w="full" />
              <VStack align="start" gap={3}>
                <HStack justify="space-between" w="full">
                  <Text>1. {t("learn.resources.module1") || "Foundations & Mindset"}</Text>
                  <Badge variant="outline" borderColor={GOLD} color={GOLD}>
                    {t("common.free") || "Free"}
                  </Badge>
                </HStack>
                <Text>2. {t("learn.resources.module2") || "Core Strategies & Risk"}</Text>
                <Text>3. {t("learn.resources.module3") || "Tools, Templates & Automation"}</Text>
                <Text>4. {t("learn.resources.module4") || "Case Studies & Live Reviews"}</Text>
              </VStack>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* FAQ list (styled like an accordion, keeping your SmallCollapse) */}
        <Box mt={{ base: 10, md: 16 }}>
          <Heading size="lg" mb={4}>
            {t("learn.faq.title") || "Frequently Asked Questions"}
          </Heading>
          <Text color="text.muted" mb={6}>
            {t("learn.faq.subtitle") || "Everything you need to know before you enroll."}
          </Text>

          <Box
            border="1px solid"
            borderColor={GOLD}
            borderRadius="xl"
            overflow="hidden"
            bg="transparent"
          >
            {faqs.map((f, i) => {
              const open = openIdx === i;
              return (
                <Box key={i} borderTop={i === 0 ? "none" : "1px solid"} borderColor={GOLD}>
                  <Button
                    onClick={() => toggle(i)}
                    w="100%"
                    justifyContent="space-between"
                    variant="ghost"
                    color="inherit"
                    px={4}
                    py={4}
                    borderRadius={0}
                    _hover={{ bg: "rgba(182, 233, 255,0.08)" }}
                  >
                    <HStack gap={3}>
                      <Text fontWeight={600} textAlign="left">
                        {f.q}
                      </Text>
                    </HStack>
                    <Icon as={open ? ChevronUp : ChevronDown} />
                  </Button>
                  <SmallCollapse open={open}>
                    <Text color="text.muted" px={4}>
                      {f.a}
                    </Text>
                  </SmallCollapse>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Sticky bottom CTA */}
        <Box position="sticky" bottom={10} zIndex={20} mt={{ base: 10, md: 14 }}>
          <Container maxW="7xl" py={3}>
            <Card p={4} borderColor="rgba(182, 233, 255,.6)" bg="white" color={GOLD}>
              <HStack justify="center" align="center" gap={4} flexWrap="wrap">
                <HStack gap={3}>
                  <Icon as={ShieldCheck} color={GOLD} />
                  <Text fontWeight="medium">
                    {t("learn.resources.cta_banner") ||
                      "Ready to go deeper? Join the full course and get all resources unlocked."}
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <RouterLink to="/products">
                    <Button bg={GOLD} color="black" _hover={{ filter: "brightness(1.1)" }}>
                      <HStack gap={2}>
                        <Icon as={ArrowRight} />
                        <span>{t("common.enroll_now") || "Enroll now"}</span>
                      </HStack>
                    </Button>
                  </RouterLink>
                </HStack>
              </HStack>
            </Card>
          </Container>
        </Box>
      </Container>
    </Box>
  );
}

/** Card component (kept inline for easy reuse) */
const Card: React.FC<{ children: React.ReactNode; asLink?: string } & any> = ({
  children,
  asLink,
  ...props
}) => {
  const border = "rgba(182, 233, 255,.5)";
  const bg = "rgba(182, 233, 255,.06)";
  const content = (
    <MotionBox
      border="1px solid"
      borderColor={border}
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
      transition="all 200ms ease"
      bg={bg}
      backdropFilter="saturate(1.1) blur(2px)"
      {...props}
    >
      {children}
    </MotionBox>
  );
  if (asLink) return <RouterLink to={asLink}>{content}</RouterLink>;
  return content;
};
