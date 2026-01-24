// src/pages/404.tsx
import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Link,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";

// Crypto icons (tree-shaken)
import {
  TokenBTC,
  TokenETH,
  TokenUSDT,
  TokenBNB,
  TokenSOL,
  TokenXRP,
  TokenADA,
} from "@web3icons/react";

// Forex pair icons (same approach as your ForexMatrix)
import FinancialFlagIcon from "financial-flag-icons";

const GOLD = "#65a8bf";

// ===== Animations (same float vibe as your matrices)
const shimmer = keyframes`
  0% { background-position: 0% 50%; text-shadow: 0 0 6px rgba(182, 233, 255,0.35), 0 0 14px rgba(182, 233, 255,0.15); }
  50% { background-position: 100% 50%; text-shadow: 0 0 10px rgba(182, 233, 255,0.6), 0 0 22px rgba(182, 233, 255,0.25); }
  100% { background-position: 0% 50%; text-shadow: 0 0 6px rgba(182, 233, 255,0.35), 0 0 14px rgba(182, 233, 255,0.15); }
`;

// ===== Types & items
type CryptoItem = { name: string; Component: React.ComponentType<any> };
type FiatItem =
  | { name: string; type: "lib"; code: string }
  | { name: string; type: "img"; src: string };

const CRYPTO_ITEMS: CryptoItem[] = [
  { name: "Bitcoin", Component: TokenBTC },
  { name: "Ethereum", Component: TokenETH },
  { name: "Tether", Component: TokenUSDT },
  { name: "BNB", Component: TokenBNB },
  { name: "Solana", Component: TokenSOL },
  { name: "XRP", Component: TokenXRP },
  { name: "Cardano", Component: TokenADA },
];

const FOREX_ITEMS: FiatItem[] = [
  { name: "GBP/JPY", type: "lib", code: "gbpjpy" },
  { name: "EUR/USD", type: "lib", code: "eurusd" },
  { name: "GBP/USD", type: "lib", code: "gbpusd" },
  { name: "USD/CHF", type: "lib", code: "usdchf" },
  { name: "USD/JPY", type: "lib", code: "usdjpy" },
  { name: "AUD/USD", type: "lib", code: "audusd" },
];

// Mixed cloud of dancers
type Dancing =
  | { kind: "crypto"; key: string; Component: React.ComponentType<any> }
  | { kind: "fx"; key: string; item: FiatItem };

// Arabic-Indic digits conversion (for RTL Arabic)
const toArabicDigits = (s: string) => s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d, 10)]);

export default function NotFound() {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language?.startsWith("ar");
  const { search } = useLocation();

  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const code = params.get("code") || "404";
  const codeDisplay = isRTL ? toArabicDigits(code) : code;

  const retry = () => window.location.reload();

  const items: Dancing[] = React.useMemo(() => {
    const out: Dancing[] = [];
    CRYPTO_ITEMS.forEach((c, i) =>
      out.push({ kind: "crypto", key: `c-${i}`, Component: c.Component })
    );
    FOREX_ITEMS.forEach((f, i) => out.push({ kind: "fx", key: `f-${i}`, item: f }));
    return out;
  }, []);

  // Staggered delays like your matrices
  const delays = React.useMemo(() => items.map((_, i) => (i * 0.35) % 1.5), [items]);

  // Positions with a simple "keep-away" from the center so they dance AROUND, not behind/on top
  const positions = React.useMemo(() => {
    // center in %, and a no-go radius in % of container min-dimension
    const cx = 50;
    const cy = 50;
    const radius = 18; // tweak: bigger pushes items further from the 404
    return items.map((_, i) => {
      // base spread pattern (deterministic)
      let x = 8 + ((i * 19) % 84); // 8..92
      let y = 8 + ((i * 13) % 70); // 8..78

      // push away from the center if inside the radius
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const scale = radius / (dist || 0.001); // avoid division by zero
        x = cx + dx * scale;
        y = cy + dy * scale;
        // clamp to bounds
        x = Math.max(4, Math.min(96, x));
        y = Math.max(4, Math.min(96, y));
      }
      return { left: `${x}%`, top: `${y}%` };
    });
  }, [items]);

  const iconSize = 36; // px
  const fxSize = 24; // px for financial-flag-icons (slightly smaller looks nicer)

  return (
    <Box py={{ base: 8, md: 14 }} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="5xl">
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="2xl"
          bg="bg.muted"
          p={{ base: 8, md: 14 }}
          minH={{ base: "420px", md: "560px" }}
        >
          {/* Dancing layer — set a HIGHER z-index so they’re not hidden behind the 404 */}
          <Box position="absolute" inset={0} pointerEvents="none" zIndex={0}>
            {items.map((it, index) => (
              <motion.div
                key={it.key}
                style={{
                  position: "absolute",
                  left: positions[index].left,
                  top: positions[index].top,
                }}
                animate={{ y: [6, -8, 6], opacity: [0.85, 1, 0.9] }}
                transition={{
                  duration: 4,
                  delay: delays[index],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* No borders, no background — just clean floating glyphs */}
                {it.kind === "crypto" ? (
                  <Icon as={it.Component} boxSize={`${iconSize}px`} />
                ) : it.item.type === "lib" ? (
                  <FinancialFlagIcon
                    icon={it.item.code as any}
                    style={{ width: fxSize, height: fxSize }}
                  />
                ) : (
                  <img
                    src={it.item.src}
                    alt={it.item.name}
                    title={it.item.name}
                    style={{ width: iconSize, height: iconSize, objectFit: "contain" }}
                  />
                )}
              </motion.div>
            ))}
          </Box>

          {/* Centerpiece 404 (beneath dancers so they float around/over edges) */}
          <VStack position="relative" zIndex={100} spacing={4}>
            <Heading
              as="div"
              fontFamily="body" // same font as main content
              fontWeight="extrabold"
              textAlign="center"
              lineHeight="1"
              sx={{
                fontSize: "clamp(88px, 16vw, 240px)", // larger
                backgroundImage:
                  "linear-gradient(90deg, rgba(182, 233, 255,0.25), rgba(182, 233, 255,0.95), rgba(182, 233, 255,0.25))",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                animation: `${shimmer} 4.5s ease-in-out infinite`,
              }}
            >
              {codeDisplay}
            </Heading>

            <Text color="text.muted" textAlign="center" maxW="3xl" fontSize={{ base: "md", md: "lg" }}>
              {t("errors.404.subtitle") ||
                "The page you’re looking for isn’t available, or our servers had a brief hiccup."}
            </Text>

            {/* Actions */}
            <HStack gap={3} flexWrap="wrap" justify="center" mt={2}>
              <Button
                as={RouterLink}
                to="/"
                bg={GOLD}
                color="black"
                _hover={{ opacity: 0.9 }}
                borderRadius="xl"
              >
                {t("errors.404.cta_home") || "Go to Home"}
              </Button>
              <Button
                variant="outline"
                borderColor={GOLD}
                color={GOLD}
                _hover={{ bg: "blackAlpha.300" }}
                borderRadius="xl"
                onClick={retry}
              >
                {t("errors.404.cta_retry") || "Try Again"}
              </Button>
              <Link
                href={`mailto:${t("legal.common.support_email") || "support@promrkts.com"}`}
                _hover={{ textDecoration: "none", opacity: 0.9 }}
              >
                <Button variant="solid" borderRadius="xl" bg={GOLD} color="black" _hover={{ opacity: 0.9 }}>
                  {t("errors.404.cta_support") || "Contact Support"}
                </Button>
              </Link>
            </HStack>

            <Text color="text.muted" fontSize="sm" opacity={0.8} textAlign="center">
              {t("errors.404.helper") ||
                "If this keeps happening, include the error code or trace ID when contacting support."}
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
