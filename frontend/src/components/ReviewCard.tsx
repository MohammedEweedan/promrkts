import React, { useRef, useEffect, useMemo } from "react";
import {
  Box,
  HStack,
  Image,
  Heading,
  Text,
  Link as ChakraLink,
  Button,
  Icon,
} from "@chakra-ui/react";
import { Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";

// If you already have this type, remove and import yours instead.
export interface Review {
  source: "Trustpilot" | "Forex Peace Army" | "CryptoCompare" | "Sitejabber" | string;
  rating: number; // 0..5
  title: string;
  body: string;
  author: string;
  date?: string | number | Date;
  url?: string;
}

type Props = {
  review: Review;
  accentColor: string;
  ctaLabel?: string; // optional pre-translated label (e.g., t("home.courses.cta"))
};

const ReviewCard: React.FC<Props> = ({ review, accentColor, ctaLabel = "View" }) => {
  const { source, rating, title, body, author, date, url } = review;
  const prefersReduced = useReducedMotion();

  // --- Dark mode detection without Chakra hooks ---
  const isDark = useMemo(() => {
    if (typeof window === "undefined") return false; // SSR: assume light
    const html = document.documentElement;
    const dataTheme = html.getAttribute("data-theme");
    if (dataTheme) return dataTheme === "dark";
    // fallback to media query if no data-theme found
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  }, []);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  // Flip X influence in RTL so AR behaves the same as EN
  const getIsRTL = (el: HTMLElement | null) => {
    if (!el) return false;
    return window.getComputedStyle(el).direction === "rtl";
  };

  const scheduleTransform = (x: number, y: number) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;

      const cx = x - 0.5; // -0.5..0.5
      const cy = y - 0.5;
      const dirFactor = getIsRTL(el) ? -1 : 1;

      const MAX_TILT = prefersReduced ? 0 : 10; // deg
      const MAX_MOVE = prefersReduced ? 0 : 8; // px

      const rx = -cy * MAX_TILT; // rotateX
      const ry = cx * dirFactor * MAX_TILT; // rotateY
      const tx = cx * dirFactor * MAX_MOVE; // translateX
      const ty = cy * MAX_MOVE;

      el.style.transformOrigin = "center";
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  };

  const resetTransform = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "translate3d(0,0,0) rotateX(0deg) rotateY(0deg)";
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    scheduleTransform(x, y);
  };

  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    resetTransform();
  };

  useEffect(() => {
    resetTransform();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReduced]);

  const logoSrc =
    source === "Trustpilot"
      ? isDark
        ? "/images/logos/TP-White.png"
        : "/images/logos/TP-Black.png"
      : source === "Forex Peace Army"
      ? "/images/logos/fpa.png"
      : source === "CryptoCompare"
      ? isDark
        ? "/images/logos/cryptocom-dark.png"
        : "/images/logos/cryptocompare-darktext.png"
      : source === "Sitejabber"
      ? "/images/logos/sitejabber.png"
      : "/images/logos/review-generic.svg";

  return (
    <Box
      role="listitem"
      minW={{ base: "280px", md: "360px" }}
      maxW={{ base: "280px", md: "360px" }}
      border="1px solid"
      borderColor={accentColor}
      borderRadius="xl"
      px={5}
      py={4}
      boxShadow="md"
      bg="transparent"
      style={{ perspective: "800px" }}
    >
      <Box
        ref={cardRef}
        borderRadius="xl"
        willChange="transform"
        transition="transform 140ms ease-out"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onTouchMove={(e) => {
          const t0 = e.touches?.[0];
          const el = cardRef.current;
          if (!t0 || !el) return;
          const rect = el.getBoundingClientRect();
          const x = (t0.clientX - rect.left) / rect.width;
          const y = (t0.clientY - rect.top) / rect.height;
          scheduleTransform(x, y);
        }}
        onTouchEnd={resetTransform}
      >
        <HStack justify="space-between" align="center" mb={2} gap={3}>
          <HStack gap={2} align="center">
            <Image src={logoSrc} h="16px" alt={source} />
          </HStack>
          <HStack gap={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                as={Star}
                boxSize={4}
                color={i < rating ? accentColor : "gray.400"}
                fill={i < rating ? accentColor : "none"}
              />
            ))}
          </HStack>
        </HStack>

        <Heading size="sm" mb={1}>
          {title}
        </Heading>
        <Text fontSize="sm" opacity={0.9} mb={3}>
          {body}
        </Text>

        <HStack justify="space-between" align="center" gap={2}>
          <Text fontSize="xs" opacity={0.7}>
            {author}
            {date ? ` • ${new Date(date).toLocaleDateString()}` : ""}
          </Text>
          {url && (
            <ChakraLink href={url} _hover={{ textDecoration: "none" }}>
              <Button size="xs" variant="outline" borderColor={accentColor} color={accentColor}>
                {ctaLabel}
              </Button>
            </ChakraLink>
          )}
        </HStack>
      </Box>
    </Box>
  );
};

export default ReviewCard;
