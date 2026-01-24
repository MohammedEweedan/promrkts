import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Link,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { motion, useInView } from "framer-motion";
import { Global } from "@emotion/react";

// === Theme tokens ===
const GOLD = "#65a8bf";
const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

// == Reusable full-viewport section with snap and pulsing dot ==
const SnapSection: React.FC<{
  heading: string;
  sub?: string;
  media?: React.ReactNode;
  invert?: boolean;
  k?: string;
}> = ({ heading, sub, media, invert = false, k }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px", once: false });

  return (
    <Box
      as="section"
      ref={ref}
      id={k}
      minH="100svh"
      position="relative"
      display="grid"
      // Mobile also uses 2 columns so the rail divides text (L) / image (R)
      gridTemplateColumns={{ base: "1fr 1fr", md: "1.1fr 0.9fr" }}
      alignItems="center"
      gap={{ base: 4, md: 10 }}
      px={{ base: 4, md: 10 }}
      py={{ base: 8, md: 10 }}
      scrollSnapAlign="start"
    >
      {/* Pulsing dot (subtle / Apple-y) */}
      <MotionBox
        aria-hidden
        position="absolute"
        left="49.7%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="12px"
        h="12px"
        borderRadius="full"
        bg="#65a8bf"
        boxShadow={`0 0 0 6px #65a8bf22, 0 0 0 12px #65a8bf11`}
        zIndex={1}
        initial={{ opacity: 0.5, scale: 0.9 }}
        animate={
          inView
            ? {
                opacity: [0.7, 0.9, 0.7],
                scale: [1, 1.12, 1],
                transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
              }
            : { opacity: 0.4, scale: 0.96 }
        }
      />

      {/* Text — always left on mobile; alternates on desktop via `invert` */}
      <MotionVStack
        align="center"
        gap={4}
        order={{ base: 1, md: invert ? 2 : 1 }}
        initial={{ opacity: 0, y: 26 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 12 }}
        transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.8 }}
      >
        <Heading size={{ base: "lg", md: "2xl" }} color="#65a8bf" letterSpacing="tight">
          {heading}
        </Heading>
        {sub && (
          <Text color="text.muted" fontSize={{ base: "md", md: "lg" }} maxW="48ch">
            {sub}
          </Text>
        )}
      </MotionVStack>

      {/* Media — narrowed a bit so images aren't edge-to-edge */}
      <MotionBox
        order={{ base: 2, md: invert ? 1 : 2 }}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0.6, scale: 0.99 }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9, delay: 0.02 }}
        w={{ base: "92%", md: "82%" }}
        maxW="720px"
        mx="auto"
      >
        {media}
      </MotionBox>
    </Box>
  );
};

export default function About() {
  const { t } = useTranslation() as any;

  // Page-level effects
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // Make this page the ONLY scroll container
    document.body.setAttribute("data-page", "about");
    document.body.setAttribute("data-footer", "hidden"); // Footer hidden by default

    return () => {
      document.body.style.overflow = prevOverflow || "";
      document.body.removeAttribute("data-page");
      document.body.removeAttribute("data-footer");
    };
  }, []);

  // Refs to control rail + footer behavior
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const moreRef = React.useRef<HTMLDivElement | null>(null);
  const ctaRef = React.useRef<HTMLDivElement | null>(null);

  const heroInView = useInView(heroRef, {
    margin: "-10% 0px -80% 0px",
    once: false,
  });

  const moreInView = useInView(moreRef, {
    margin: "-10% 0px -10% 0px",
    once: false,
  });

  const bottomInView = useInView(ctaRef, {
    margin: "-10% 0px -10% 0px",
    once: false,
  });

  // Show footer ONLY at the bottom (CTA in view)
  React.useEffect(() => {
    document.body.setAttribute("data-footer", bottomInView ? "show" : "hidden");
  }, [bottomInView]);

  // Hide rail on hero AND on the last two slides
  const showCenterRail = !heroInView && !moreInView && !bottomInView;

  return (
    <Box
      position="fixed"
      inset={0}
      overflowY="auto"
      scrollSnapType="y mandatory"
      overscrollBehavior="contain"
      bg="transparent"
    >
      {/* Page-scoped CSS (footer control & rail fade on mobile) */}
      <Global
        styles={`
          body[data-page="about"][data-footer="hidden"] footer{display:none!important}
          body[data-page="about"][data-footer="show"] footer{display:block!important}
          .about-center-rail{}
          @media (max-width:768px){
            .about-center-rail{
              -webkit-mask-image:linear-gradient(to bottom, transparent 0, black 28px, black calc(100% - 28px), transparent 100%);
              mask-image:linear-gradient(to bottom, transparent 0, black 28px, black calc(100% - 28px), transparent 100%);
            }
          }
        `}
      />

      {/* Center rail — hidden on hero & last two slides */}
      {showCenterRail && (
        <Box
          aria-hidden
          className="about-center-rail"
          position="fixed"
          left="50%"
          top={0}
          transform="translateX(-50%)"
          h="100%"
          w="2px"
          bg={GOLD}
          opacity={0.7}
          pointerEvents="none"
          zIndex={0}
        />
      )}

      {/* HERO */}
      <Box
        ref={heroRef}
        minH="100svh"
        position="relative"
        scrollSnapAlign="start"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 10 }}
      >
        <Container maxW="7xl">
          <VStack align="start" gap={6}>
            <Heading size={{ base: "xl", md: "3xl" }} letterSpacing="-0.01em">
              {t("company.about.title")}
            </Heading>
            <Text color="text.muted" fontSize={{ base: "md", md: "xl" }} maxW="68ch">
              {t("company.about.body")}
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Timeline chapters */}
      <SnapSection
        k="ch-2020"
        heading={t("company.timeline.2020.title")}
        sub={t("company.timeline.2020.desc")}
        media={
          <Image
            src="../../../images/rand/2020.png"
            alt="2020"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      <SnapSection
        k="ch-2021"
        heading={t("company.timeline.2021.title")}
        sub={t("company.timeline.2021.desc")}
        invert
        media={
          <Image
            src="../../../images/rand/2021.png"
            alt="2021"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      <SnapSection
        k="ch-2022"
        heading={t("company.timeline.2022.title")}
        sub={t("company.timeline.2022.desc")}
        media={
          <Image
            src="../../../images/rand/2022.png"
            alt="2022"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      <SnapSection
        k="ch-2023"
        heading={t("company.timeline.2023.title")}
        sub={t("company.timeline.2023.desc")}
        invert
        media={
          <Image
            src="../../../images/rand/2023.png"
            alt="2023"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      <SnapSection
        k="ch-2024"
        heading={t("company.timeline.2024.title")}
        sub={t("company.timeline.2024.desc")}
        media={
          <Image
            src="../../../images/rand/2024.png"
            alt="2024"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      <SnapSection
        k="ch-2025"
        heading={t("company.timeline.2025.title")}
        sub={t("company.timeline.2025.desc")}
        media={
          <Image
            src="../../../images/rand/2025.png"
            alt="2025"
            borderRadius="xl"
            border="1px solid"
            borderColor={GOLD}
            objectFit="cover"
            w="100%"
            h={{ base: "40vh", md: "60vh" }}
          />
        }
      />

      {/* "+ many more to come" */}
      <Box
        ref={moreRef}
        minH="100svh"
        position="relative"
        scrollSnapAlign="start"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 10 }}
      >
        <MotionBox
          aria-hidden
          position="absolute"
          left="70%"
          top="60%"
          transform="translate(-50%, -50%)"
          lineHeight="1"
          color={GOLD}
          zIndex={1}
          initial={{ opacity: 0.7, scale: 0.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          width={{ base: "75px", md: "75px" }}
          height={{ base: "75px", md: "75px" }}
          style={{ userSelect: "none", pointerEvents: "none", opacity: 0.4 }}
        >
          <img src="../../../logo.png" alt="Logo" />
        </MotionBox>

        <Container maxW="5xl">
          <MotionVStack
            align="center"
            textAlign="center"
            gap={4}
            initial={{ opacity: 0, y: 14 }}
            zIndex={2}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <Heading size={{ base: "lg", md: "2xl" }} color={GOLD}>
              {t("company.about.more.title")}
            </Heading>
            <Text color="text.muted" fontSize={{ base: "md", md: "lg" }} maxW="60ch">
              {t("company.about.more.subtitle")}
            </Text>
          </MotionVStack>
        </Container>
      </Box>

      {/* Closing CTA (footer shows when this is in view) */}
      <Box
        ref={ctaRef}
        minH="100svh"
        scrollSnapAlign="start"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 10 }}
      >
        <Container maxW="5xl">
          <VStack align="center" textAlign="center" gap={4}>
            <Heading size={{ base: "lg", md: "2xl" }}>{t("company.about.cta.title")}</Heading>
            <Text color="text.muted" maxW="60ch">
              {t("company.about.cta.subtitle")}
            </Text>
            <HStack gap={3} flexWrap="wrap" justify="center">
              <Link href="/products">
                <Button bg={GOLD} color="black" _hover={{ opacity: 0.92 }}>
                  {t("home.cta.primary") || "Browse Products"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" borderColor={GOLD} color={GOLD}>
                  {t("home.cta.secondary") || "Contact Us"}
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
