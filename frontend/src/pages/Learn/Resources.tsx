import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Icon,
  Badge,
  Image,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  BookOpen,
  PlayCircle,
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const GOLD = "#65a8bf";

const Card: React.FC<{ children: React.ReactNode; asLink?: string } & any> = ({
  children,
  asLink,
  ...props
}) => {
  const border = "rgba(182, 233, 255,.5)";
  const bg = "rgba(182, 233, 255,.06)";
  const MotionBox = motion(Box);
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

  if (asLink) {
    return <RouterLink to={asLink}>{content}</RouterLink>;
  }
  return content;
};

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

function Benefit({ icon: I, children }: { icon: any; children: React.ReactNode }) {
  return (
    <HStack align="start" gap={3}>
      <Icon as={I} color={GOLD} mt={1} />
      <Text>{children}</Text>
    </HStack>
  );
}

export default function Resources() {
  const { t } = useTranslation() as any;

  return (
    <Box>
      {/* Hero / Upsell */}
      <Box
        bgGradient={`linear(to-b, rgba(182, 233, 255,.12), transparent)`}
        borderBottom="1px solid"
        borderColor="rgba(182, 233, 255,.35)"
      >
        <Container maxW="7xl" py={{ base: 10, md: 16 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} alignItems="center">
            <VStack align="start" gap={5}>
              <Heading size="xl" lineHeight={1.15}>
                {t("learn.resources.subtitle") ||
                  "Premium guides, checklists, and video breakdowns to accelerate your progress."}
              </Heading>
              <Text color="text.muted" maxW="2xl">
                {t("learn.resources.pitch") ||
                  "Get the exact curriculum our mentors use with real-world scenarios, practical downloads, and actionable frameworks. Start free, upgrade anytime."}
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <RouterLink to="/products">
                  <Button size="lg" bg={GOLD} color="black" _hover={{ filter: "brightness(1.1)" }}>
                    <Icon as={ArrowRight} />
                    {t("common.explore") || "Explore"}
                  </Button>
                </RouterLink>
                <RouterLink to="/learn/faq">
                  <Button size="lg" variant="outline" borderColor={GOLD} color={GOLD}>
                    {t("common.view") || "View"} FAQ
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
                src="/images/rand/terms.png"
                alt={
                  t("learn.resources.image_alt") ||
                  "Students learning with structured course content"
                }
                w="100%"
                objectFit="cover"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Upsell Blocks */}
      <Container maxW="7xl" py={{ base: 10, md: 16 }}>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 6 }}>
          {/* Guides */}
          <Card asLink="/learn/faq">
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

          {/* Video Library */}
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
        </SimpleGrid>

        {/* Why join the course */}
        <Stack mt={{ base: 10, md: 16 }} gap={8}>
          <Heading size="lg">{t("learn.resources.research") || "Research Notes"}</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 8 }}>
            <VStack align="start" gap={4}>
              <Text color="text.muted">
                {t("learn.resources.research_desc") ||
                  "Curated notes and frameworks used by our mentors."}
              </Text>
              <VStack align="start" gap={3}>
                <Benefit icon={CheckCircle2}>
                  {t("learn.resources.point1") ||
                    "Practical, not theoretical: real examples and step-by-step walkthroughs."}
                </Benefit>
                <Benefit icon={CheckCircle2}>
                  {t("learn.resources.point2") || "Cohort access & weekly Q&A with mentors."}
                </Benefit>
                <Benefit icon={CheckCircle2}>
                  {t("learn.resources.point3") || "Lifetime updates to materials."}
                </Benefit>
                <Benefit icon={CheckCircle2}>
                  {t("learn.resources.point4") ||
                    "Certificate of completion to showcase your skills."}
                </Benefit>
              </VStack>
              <HStack gap={3}>
                <RouterLink to="/products">
                  <Button bg={GOLD} color="black" _hover={{ filter: "brightness(1.1)" }}>
                    <Icon as={ArrowRight} />
                    {t("common.enroll_now") || "Enroll now"}
                  </Button>
                </RouterLink>
                <RouterLink to="/learn/faq" color={GOLD}>
                  {t("common.read_more") || "Read more"}
                </RouterLink>
              </HStack>
            </VStack>

            <Card>
              <VStack align="start" gap={4}>
                <HStack gap={3}>
                  <Icon as={FileText} color={GOLD} />
                  <Heading size="md">
                    {t("learn.resources.syllabus") || "Course Syllabus (Preview)"}
                  </Heading>
                </HStack>
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
        </Stack>

        {/* Sticky bottom CTA */}
        <Box position="sticky" bottom={10} zIndex={20} mt={8}>
          <Container maxW="7xl" py={3}>
            <Card p={4} borderColor="rgba(182, 233, 255,.6)" bg="white" color="#65a8bf">
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
                      <Icon as={ArrowRight} />
                      {t("common.enroll_now") || "Enroll now"}
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
