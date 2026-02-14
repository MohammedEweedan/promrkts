// src/pages/Home.tsx — Premium AI Trading + Course Startup Redesign
import React from "react";
import "../styles/fonts.css";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Grid,
  Tabs,
  TabList,
  Tab,
  Link as ChakraLink,
  Image,
  Icon,
  Badge,
  useBreakpointValue,
  Stack,
  Select,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import api, { getMyPurchases } from "../api/client";
import BannerCarousel from "../components/BannerCarousel";
import { useThemeMode } from "../themeProvider";
import { Star, Trophy, Maximize2, Minimize2, Users, Award, Target, Bot, MessageCircle, BarChart3, Smartphone, Lock, CheckCircle, GraduationCap, Globe, BookOpen, Handshake, Search, Map as MapIcon, Landmark, Ruler, Crosshair, LineChart, Monitor } from "lucide-react";
import Hero from "../components/Hero";
import { useAuth } from "../auth/AuthContext";
import TimelineNewsTabs from "../components/TimelineNewsTabs";
import LeaderboardOnboarding from "../components/LeaderboardOnboarding";
import SpotlightCard from "../components/SpotlightCard";
import Leaderboard from "../components/Leaderboard";
import GuestLanding from "../components/GuestLanding";
import SpinningWheel from "../components/SpinningWheel";
import {
  fetchJourney,
  fetchEntitlements,
  fetchReadiness,
  Journey,
  Entitlements,
  ReadinessResponse,
  JOURNEY_STAGE_ORDER,
} from "../api/journey";

// ===== Animation helpers =====
const MotionBox = motion(Box);

// ===== UI Brand Tokens (Premium / Nfinite-inspired) =====
const UI = {
  bg: "#050811",
  surface: "rgba(15, 23, 42, 0.65)",
  surfaceStrong: "rgba(15, 23, 42, 0.88)",
  surfaceLight: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255,255,255,0.06)",
  borderAccent: "rgba(101, 168, 191, 0.2)",
  muted: "rgba(255,255,255,0.6)",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  accent: "#65a8bf",
  accentGold: "#b7a27d",
  gradient: "linear-gradient(135deg, #65a8bf 0%, #b7a27d 100%)",
  gradientReverse: "linear-gradient(135deg, #b7a27d 0%, #65a8bf 100%)",
  glow: "0 0 60px rgba(101, 168, 191, 0.15)",
  glowStrong: "0 0 80px rgba(101, 168, 191, 0.25)",
  cardShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  gradHero:
    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(101, 168, 191, 0.15), transparent)," +
    "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(183, 162, 125, 0.08), transparent)," +
    "linear-gradient(180deg, #050811 0%, #0a0f1a 100%)",
};


// ===== Prop Firm + Token (UI copy only; not financial advice) =====
const BRAND = {
  guidesLabel: "Guides",
  communitiesLabel: "Communities",
  tradingFloorLabel: "Trading Floor (Discord)",
  tokenLabel: "Tokens"
};

const ParallaxSection: React.FC<{ children: React.ReactNode; speed?: number }> = ({
  children,
  speed = 0.5,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80 * speed, -80 * speed]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0.7]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.98]);

  return (
    <Box ref={ref} position="relative" py={{ base: 6, md: 10 }}>
      <MotionBox style={{ y, opacity, scale }}>{children}</MotionBox>
    </Box>
  );
};

const TvSafe: React.FC<React.ComponentProps<typeof AdvancedRealTimeChart>> = React.memo((props) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <AdvancedRealTimeChart {...props} />;
});

// ===== MarketsBoard (Multi-monitor + Wall Fullscreen + UI Toggles) =====
const MarketsBoard: React.FC<{
  mode: string;
  accentColor: string;
  t: any;
  hideHeader?: boolean;
}> = React.memo(({ mode, accentColor, t, hideHeader = false }) => {
  // Default symbols: BTC, XAUUSD, EURUSD, OIL (as requested)
  const defaultSymbols = React.useMemo(
    () => [
      "COINBASE:BTCUSD",
      "OANDA:XAUUSD",
      "FX:EURUSD",
      "TVC:USOIL",
    ],
    []
  );

  const allSymbols = React.useMemo(
    () => [
      "COINBASE:BTCUSD",
      "OANDA:XAUUSD",
      "FX:EURUSD",
      "TVC:USOIL",
      "COINBASE:ETHUSD",
      "FX:GBPUSD",
      "FX:USDJPY",
      "BINANCE:SOLUSDT",
      "FX:USDCHF",
      "FX:AUDUSD",
      "FOREXCOM:SPXUSD",
      "FOREXCOM:NSXUSD",
      "FX:EURGBP",
      "FX:EURJPY",
      "COINBASE:XRPUSD",
      "FX:USDCAD",
    ],
    []
  );

  const themeRTW = React.useMemo(
    () => (mode === "dark" ? "dark" : "light") as "dark" | "light",
    [mode]
  );

  const paddingY = hideHeader ? { base: 0, md: 0 } : { base: 6, md: 10 };

  // Layout: 1x1 / 2x2 / 3x3 / 4x4 (default 1)
  const [gridN, setGridN] = React.useState<number>(() => {
    const stored = Number(localStorage.getItem("mbGridN") || 1);
    return [1, 2, 3, 4].includes(stored) ? stored : 1;
  });


  // UI toggles
  const [hideSidebar, setHideSidebar] = React.useState<boolean>(
    () => localStorage.getItem("mbHideSidebar") === "1"
  );
  const [hideVolume, setHideVolume] = React.useState<boolean>(
    () => localStorage.getItem("mbHideVolume") === "1"
  );
  const [hideTop, setHideTop] = React.useState<boolean>(
    () => localStorage.getItem("mbHideTop") === "1"
  );

  // Timeline / interval
  type TVInterval =
    | "1"
    | "3"
    | "5"
    | "15"
    | "30"
    | "45"
    | "60"
    | "120"
    | "180"
    | "240"
    | "D"
    | "W"
    | "M";

  const INTERVALS: { label: string; value: TVInterval }[] = [
    { label: "1m", value: "1" },
    { label: "3m", value: "3" },
    { label: "5m", value: "5" },
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "45m", value: "45" },
    { label: "1h", value: "60" },
    { label: "2h", value: "120" },
    { label: "3h", value: "180" },
    { label: "4h", value: "240" },
    { label: "1D", value: "D" },
    { label: "1W", value: "W" },
    { label: "1M", value: "M" },
  ];

  const [interval, setInterval] = React.useState<TVInterval>(() => {
    const v = (localStorage.getItem("mbInterval") as TVInterval) || "60";
    return INTERVALS.some((x) => x.value === v) ? v : "60";
  });

  // Indicators (best-effort for widget)
  type StudyKey = "RSI" | "MACD" | "BB";
  const STUDIES: { key: StudyKey; label: string; tvId: string }[] = [
    { key: "RSI", label: "RSI", tvId: "RSI@tv-basicstudies" },
    { key: "MACD", label: "MACD", tvId: "MACD@tv-basicstudies" },
    { key: "BB", label: "Bollinger Bands", tvId: "BB@tv-basicstudies" },
  ];

  const [studies, setStudies] = React.useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("mbStudies");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });

  const [indicatorsOpen, setIndicatorsOpen] = React.useState(false);

  React.useEffect(
    () => localStorage.setItem("mbHideSidebar", hideSidebar ? "1" : "0"),
    [hideSidebar]
  );
  React.useEffect(() => localStorage.setItem("mbHideVolume", hideVolume ? "1" : "0"), [hideVolume]);
  React.useEffect(() => localStorage.setItem("mbHideTop", hideTop ? "1" : "0"), [hideTop]);
  React.useEffect(() => localStorage.setItem("mbInterval", interval), [interval]);
  React.useEffect(() => localStorage.setItem("mbStudies", JSON.stringify(studies)), [studies]);

  React.useEffect(() => {
    localStorage.setItem("mbHideSidebar", hideSidebar ? "1" : "0");
  }, [hideSidebar]);

  React.useEffect(() => {
    localStorage.setItem("mbHideVolume", hideVolume ? "1" : "0");
  }, [hideVolume]);

  const count = gridN * gridN;

  const makeDefaultSymbols = React.useCallback(
    () => {
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const key = `mbSymbol_${gridN}_${i}`;
        const stored = localStorage.getItem(key);
        const fallback = defaultSymbols[i % defaultSymbols.length];
        out.push(stored && allSymbols.includes(stored) ? stored : fallback);
      }
      return out;
    },
    [count, gridN, defaultSymbols, allSymbols]
  );

  const [symbolsState, setSymbolsState] = React.useState<string[]>(() =>
    makeDefaultSymbols()
  );

  // When grid size changes, rebuild symbol arrays (and persist gridN)
  React.useEffect(() => {
    localStorage.setItem("mbGridN", String(gridN));
    setSymbolsState(makeDefaultSymbols());
  }, [gridN, makeDefaultSymbols]);

  // Fullscreen single chart
  const [fullscreen, setFullscreen] = React.useState<null | { idx: number }>(null);

  // Fullscreen the whole grid (wall)
  const [wallFullscreen, setWallFullscreen] = React.useState(false);

  const setSymbolFor = React.useCallback(
    (idx: number, v: string) => {
      setSymbolsState((prev) => {
        const next = [...prev];
        next[idx] = v;
        localStorage.setItem(`mbSymbol_${gridN}_${idx}`, v);
        return next;
      });
    },
    [gridN]
  );

  const ChartCell: React.FC<{
    idx: number;
    value: string;
    onChange: (v: string) => void;
    onFullscreen: () => void;
    isFullscreen?: boolean;
  }> = ({ idx, value, onChange, onFullscreen, isFullscreen }) => {
    const remountKey = `chart-${gridN}-${idx}-${themeRTW}-${hideSidebar ? 1 : 0}-${
      hideVolume ? 1 : 0
    }-${hideTop ? 1 : 0}-${interval}-${studies.join(",")}`;

    return (
      <Box position="relative" w="100%" h="100%" bg="rgba(5, 8, 17, 0.98)" overflow="hidden">
        {/* Pair selector dropdown */}
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="xs"
          position="absolute"
          top="8px"
          left="8px"
          zIndex={3}
          maxW="120px"
          bg="rgba(0,0,0,0.7)"
          borderColor="rgba(255,255,255,0.15)"
          color="white"
          fontSize="xs"
          borderRadius="md"
          _hover={{ borderColor: "rgba(255,255,255,0.3)" }}
          _focus={{ borderColor: UI.accent, boxShadow: "none" }}
        >
          {allSymbols.map((s) => (
            <option key={s} value={s} style={{ background: "#0a0a0a", color: "white" }}>
              {s.split(":")[1] || s}
            </option>
          ))}
        </Select>

        {/* Fullscreen toggle */}
        <IconButton
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          icon={<Icon as={isFullscreen ? Minimize2 : Maximize2} boxSize={3} />}
          onClick={onFullscreen}
          size="xs"
          position="absolute"
          top="8px"
          right="8px"
          zIndex={3}
          bg="rgba(0,0,0,0.7)"
          border="1px solid rgba(255,255,255,0.15)"
          color="white"
          _hover={{ bg: "rgba(0,0,0,0.9)" }}
        />

        {/* Chart */}
        <Box w="100%" h="100%">
          <TvSafe
            key={remountKey}
            symbol={value}
            interval={interval as any}
            theme={themeRTW as any}
            locale="en"
            withdateranges
            allow_symbol_change={false}
            save_image={false}
            autosize={true}
            width="100%"
            hide_side_toolbar={hideSidebar}
            hide_top_toolbar={hideTop}
            hide_legend={hideTop}
            {...({ hide_volume: hideVolume } as any)}
            {...({ studies } as any)}
            {...({ container_id: `tv-chart-${gridN}-${idx}` } as any)}
          />
        </Box>
      </Box>
    );
  };

  const GridHeader: React.FC<{ onFullscreenWall: () => void }> = ({ onFullscreenWall }) => (
    <Box mb={4}>
      {/* Main controls row */}
      <HStack
        justify="center"
        align="center"
        flexWrap="wrap"
        gap={2}
        p={3}
        bg="rgba(0,0,0,0.25)"
        borderRadius="xl"
        border="1px solid rgba(255,255,255,0.08)"
      >
        {/* Layout buttons */}
        <HStack gap={1} bg="rgba(0,0,0,0.3)" p={1} borderRadius="lg">
          {[1, 2, 3, 4].map((n) => (
            <Button
              key={n}
              size="xs"
              variant={gridN === n ? "solid" : "ghost"}
              bg={gridN === n ? UI.accent : "transparent"}
              color={gridN === n ? "black" : "white"}
              onClick={() => setGridN(n)}
              minW="32px"
              fontWeight="600"
              _hover={{ bg: gridN === n ? UI.accent : "rgba(255,255,255,0.1)" }}
            >
              {n === 1 ? "1" : `${n}×${n}`}
            </Button>
          ))}
        </HStack>

        {/* Divider */}
        <Box w="1px" h="20px" bg="rgba(255,255,255,0.15)" display={{ base: "none", md: "block" }} />

        {/* Timeframe */}
        <Select
          value={interval}
          onChange={(e) => setInterval(e.target.value as TVInterval)}
          size="xs"
          maxW="70px"
          bg="rgba(0,0,0,0.4)"
          borderColor="rgba(255,255,255,0.12)"
          color="white"
          borderRadius="md"
          fontSize="xs"
        >
          {INTERVALS.map((x) => (
            <option key={x.value} value={x.value} style={{ background: "#0a0a0a", color: "white" }}>
              {x.label}
            </option>
          ))}
        </Select>

        {/* Toggle buttons */}
        <HStack gap={1}>
          <Button
            size="xs"
            variant="ghost"
            color={!hideTop ? UI.accent : "gray.400"}
            onClick={() => setHideTop((v) => !v)}
            fontSize="xs"
            px={2}
          >
            Top
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color={!hideSidebar ? UI.accent : "gray.400"}
            onClick={() => setHideSidebar((v) => !v)}
            fontSize="xs"
            px={2}
          >
            Tools
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color={!hideVolume ? UI.accent : "gray.400"}
            onClick={() => setHideVolume((v) => !v)}
            fontSize="xs"
            px={2}
          >
            Vol
          </Button>
        </HStack>

        {/* Divider */}
        <Box w="1px" h="20px" bg="rgba(255,255,255,0.15)" display={{ base: "none", md: "block" }} />

        {/* Indicators */}
        <Button
          size="xs"
          variant={indicatorsOpen ? "solid" : "ghost"}
          bg={indicatorsOpen ? "rgba(101,168,191,0.2)" : "transparent"}
          color={indicatorsOpen ? UI.accent : "gray.300"}
          onClick={() => setIndicatorsOpen((v) => !v)}
          fontSize="xs"
          px={3}
        >
          Indicators
        </Button>

        {/* Fullscreen */}
        <IconButton
          aria-label="Fullscreen Wall"
          icon={<Icon as={Maximize2} boxSize={3.5} />}
          size="xs"
          bg={UI.accent}
          color="black"
          onClick={onFullscreenWall}
          _hover={{ opacity: 0.9 }}
        />
      </HStack>
    </Box>
  );

  const renderWall = (asFullscreenOverlay: boolean) => {
    return (
      <Box w="100%">
        {!asFullscreenOverlay && <GridHeader onFullscreenWall={() => setWallFullscreen(true)} />}

        {!asFullscreenOverlay && indicatorsOpen && (
          <Box
            mb={3}
            p={3}
            borderRadius="14px"
            border="1px solid rgba(255,255,255,0.10)"
            bg="rgba(0,0,0,0.35)"
          >
            <HStack wrap="wrap" gap={2}>
              {STUDIES.map((s) => {
                const active = studies.includes(s.tvId);
                return (
                  <Button
                    key={s.key}
                    size="sm"
                    variant={active ? "solid" : "outline"}
                    bg={active ? UI.accent : "transparent"}
                    color={active ? "black" : "white"}
                    borderColor="rgba(255,255,255,0.18)"
                    onClick={() => {
                      setStudies((prev) => {
                        if (prev.includes(s.tvId)) return prev.filter((x) => x !== s.tvId);
                        return [...prev, s.tvId];
                      });
                    }}
                  >
                    {s.label}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                borderColor="rgba(255,255,255,0.18)"
                color="white"
                onClick={() => setStudies([])}
              >
                Clear
              </Button>
            </HStack>
          </Box>
        )}

        <Grid
          w="100%"
          h={asFullscreenOverlay ? "100vh" : gridN === 1 ? { base: "50vh", md: "60vh" } : { base: "75vh", md: "70vh", lg: "70vh" }}
          minH={asFullscreenOverlay ? "100vh" : gridN === 1 ? "300px" : "360px"}
          templateColumns={{
            base: gridN === 1 ? "1fr" : `repeat(${Math.min(2, gridN)}, 1fr)`,
            md: `repeat(${gridN}, 1fr)`,
          }}
          templateRows={{ md: `repeat(${gridN}, 1fr)` }}
          gap={gridN === 1 ? 0 : 1}
          overflow="hidden"
          borderRadius={asFullscreenOverlay ? "0px" : "18px"}
          bg="rgba(5, 8, 17, 0.98)"
        >
          {Array.from({ length: count }).map((_, idx) => (
            <Box
              key={`chart-${idx}`}
              w="100%"
              h="100%"
              minH={asFullscreenOverlay ? "0px" : gridN === 1 ? "300px" : { base: "260px", md: "0px" }}
            >
              <ChartCell
                idx={idx}
                value={symbolsState[idx] || defaultSymbols[idx % defaultSymbols.length]}
                onChange={(v) => setSymbolFor(idx, v)}
                onFullscreen={() => setFullscreen({ idx })}
              />
            </Box>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderFullscreenSingle = () => {
    if (!fullscreen) return null;

    const idx = fullscreen.idx;
    const value = symbolsState[idx] || defaultSymbols[idx % defaultSymbols.length];

    return (
      <Box position="fixed" inset={0} zIndex={9999} bg="#000" overflow="hidden">
        <Box position="absolute" inset={0}>
          <ChartCell
            idx={idx}
            value={value}
            onChange={(v) => setSymbolFor(idx, v)}
            onFullscreen={() => setFullscreen(null)}
            isFullscreen
          />
        </Box>

        <IconButton
          aria-label="Exit fullscreen"
          icon={<Icon as={Minimize2} />}
          onClick={() => setFullscreen(null)}
          position="fixed"
          top="16px"
          right="16px"
          zIndex={10000}
          size="md"
          bg="rgba(0,0,0,0.65)"
          border="1px solid rgba(255,255,255,0.18)"
          color="white"
          _hover={{ bg: "rgba(0,0,0,0.85)" }}
        />
      </Box>
    );
  };

  const renderFullscreenWall = () => {
    if (!wallFullscreen) return null;

    return (
      <Box position="fixed" inset={0} zIndex={9998} bg="#000" overflow="hidden">
        {/* Wall */}
        <Box position="absolute" inset={0}>
          {renderWall(true)}
        </Box>

        {/* Floating controls */}
        <HStack
          position="fixed"
          top="12px"
          left="12px"
          zIndex={10000}
          gap={1}
          p={2}
          bg="rgba(0,0,0,0.7)"
          borderRadius="lg"
          border="1px solid rgba(255,255,255,0.1)"
        >
          {/* Layout */}
          {[1, 2, 3, 4].map((n) => (
            <Button
              key={n}
              size="xs"
              variant={gridN === n ? "solid" : "ghost"}
              bg={gridN === n ? UI.accent : "transparent"}
              color={gridN === n ? "black" : "white"}
              onClick={() => setGridN(n)}
              minW="28px"
            >
              {n === 1 ? "1" : `${n}×${n}`}
            </Button>
          ))}

          <Box w="1px" h="16px" bg="rgba(255,255,255,0.2)" mx={1} />

          <Select
            value={interval}
            onChange={(e) => setInterval(e.target.value as TVInterval)}
            size="xs"
            maxW="65px"
            bg="transparent"
            borderColor="rgba(255,255,255,0.15)"
            color="white"
          >
            {INTERVALS.map((x) => (
              <option key={x.value} value={x.value} style={{ background: "#0a0a0a" }}>
                {x.label}
              </option>
            ))}
          </Select>

          <Button
            size="xs"
            variant="ghost"
            color={!hideSidebar ? UI.accent : "gray.400"}
            onClick={() => setHideSidebar((v) => !v)}
          >
            Tools
          </Button>

          <Button
            size="xs"
            variant="ghost"
            color={!hideVolume ? UI.accent : "gray.400"}
            onClick={() => setHideVolume((v) => !v)}
          >
            Vol
          </Button>
        </HStack>

        <IconButton
          aria-label="Exit wall fullscreen"
          icon={<Icon as={Minimize2} />}
          onClick={() => setWallFullscreen(false)}
          position="fixed"
          top="12px"
          right="12px"
          zIndex={10000}
          size="sm"
          bg="rgba(0,0,0,0.7)"
          border="1px solid rgba(255,255,255,0.15)"
          color="white"
          _hover={{ bg: "rgba(0,0,0,0.9)" }}
        />
      </Box>
    );
  };

  return (
    <Box py={paddingY}>
      {!hideHeader && (
        <>
          <Heading textAlign="center" mb={3} color="#65a8bf" fontSize={{ base: "2xl", md: "3xl" }}>
            {t("home.enrolled.markets_title", { defaultValue: "AI-Enhanced Markets Overview" })}
          </Heading>
          <Text textAlign="center" opacity={0.85} mb={6}>
            {t("home.enrolled.markets_sub", {
              defaultValue: "Live charts + adaptive watchlists personalized to you",
            })}
          </Text>
        </>
      )}

      {/* Fullscreen overlays */}
      {renderFullscreenWall()}
      {renderFullscreenSingle()}

      {/* Charts wall */}
      {renderWall(false)}
    </Box>
  );
});

// ===== CONVERSION PSYCHOLOGY COMPONENTS =====

// Trust signals section
const TrustSignals: React.FC<{ t: any }> = ({ t }) => {
  const signals = [
    { icon: Lock, title: t("home.trust_signals.secure", { defaultValue: "Secure Payment" }), desc: "256-bit SSL encryption" },
    { icon: CheckCircle, title: t("home.trust_signals.guarantee", { defaultValue: "Money-Back Guarantee" }), desc: "30-day no questions asked" },
    { icon: GraduationCap, title: t("home.trust_signals.certified", { defaultValue: "Certified Instructors" }), desc: "10+ years experience" },
    { icon: Globe, title: t("home.trust_signals.global", { defaultValue: "Global Community" }), desc: "Students in 50+ countries" },
  ];

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} py={8}>
      {signals.map((signal, i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          viewport={{ once: true }}
        >
          <VStack 
            p={4} 
            borderRadius="16px" 
            bg={UI.surfaceLight}
            border="1px solid"
            borderColor={UI.border}
            spacing={2}
            align="center"
            _hover={{ borderColor: UI.borderAccent }}
            transition="all 0.3s"
          >
            <Icon as={signal.icon} boxSize={6} color={UI.accent} />
            <Text fontWeight="600" fontSize="sm" textAlign="center">{signal.title}</Text>
            <Text fontSize="xs" textAlign="center">{signal.desc}</Text>
          </VStack>
        </MotionBox>
      ))}
    </SimpleGrid>
  );
};

// Sticky CTA that appears on scroll
const StickyCTA: React.FC<{ t: any; onNavigate: () => void }> = ({ t, onNavigate }) => {
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (dismissed) return null;

  return (
    <MotionBox
      position="fixed"
      bottom={{ base: 4, md: 6 }}
      right={{ base: 4, md: "auto" }}
      left={{ base: "auto", md: "50%" }}
      transform={{ base: "none", md: "translateX(-50%)" }}
      zIndex={100}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Box position="relative">
        <Button
          position="absolute"
          top={{ base: "-10px", md: "-10px" }}
          left={{ base: "-10px", md: "auto" }}
          right={{ base: "auto", md: "50%" }}
          transform={{ base: "none", md: "translateX(50%)" }}
          size="xs"
          borderRadius="full"
          bg="rgba(239, 68, 68, 0.9)"
          color="white"
          minW="20px"
          h="20px"
          p={0}
          fontSize="10px"
          zIndex={101}
          onClick={() => setDismissed(true)}
          _hover={{ 
            bg: "rgba(239, 68, 68, 1)", 
            transform: { base: "scale(1.1)", md: "translateX(50%) scale(1.1)" }
          }}
          _active={{ transform: { base: "scale(0.95)", md: "translateX(50%) scale(0.95)" } }}
          transition="all 0.2s"
        >
          ✕
        </Button>
        <HStack
          bg="rgba(10, 15, 26, 0.95)"
          backdropFilter="blur(20px)"
          borderRadius="full"
          p={{ base: 2, md: 2 }}
          pl={{ base: 2, md: 6 }}
          spacing={{ base: 2, md: 4 }}
          boxShadow="0 20px 60px rgba(0,0,0,0.5)"
        >
        <VStack align="start" spacing={0} display={{ base: "none", md: "flex" }}>
          <Text fontSize="sm" fontWeight="600">
            {t("home.sticky.title", { defaultValue: "Ready to start?" })}
          </Text>
          <Text fontSize="xs">
            {t("home.sticky.subtitle", { defaultValue: "Join 12,000+ traders" })}
          </Text>
        </VStack>
        <Button
          bg={{ base: "transparent", md: UI.gradient }}
          color={{ base: "transparent", md: "white" }}
          bgGradient={{ base: UI.gradient, md: "none" }}
          bgClip={{ base: "text", md: "border-box" }}
          fontWeight="700"
          borderRadius="full"
          px={{ base: 5, md: 6 }}
          py={{ base: 2, md: "auto" }}
          size={{ base: "sm", md: "md" }}
          fontSize={{ base: "sm", md: "md" }}
          ml={{ base: 3, md: 0 }}
          _hover={{ transform: "scale(1.05)" }}
          transition="all 0.2s"
          onClick={onNavigate}
        >
          {t("home.sticky.cta", { defaultValue: "Get Started" })}
        </Button>
      </HStack>
      </Box>
    </MotionBox>
  );
};

// Value proposition section with benefits
const ValueProposition: React.FC<{ t: any }> = ({ t }) => {
  const benefits = [
    {
      icon: Target,
      title: t("home.value.benefit1_title", { defaultValue: "Proven Strategies" }),
      desc: t("home.value.benefit1_desc", { defaultValue: "Battle-tested methods used by professional traders worldwide" }),
    },
    {
      icon: Bot,
      title: t("home.value.benefit2_title", { defaultValue: "AI-Powered Learning" }),
      desc: t("home.value.benefit2_desc", { defaultValue: "Personalized curriculum that adapts to your skill level" }),
    },
    {
      icon: MessageCircle,
      title: t("home.value.benefit3_title", { defaultValue: "24/7 Community" }),
      desc: t("home.value.benefit3_desc", { defaultValue: "Never trade alone - get support from mentors and peers" }),
    },
    {
      icon: BarChart3,
      title: t("home.value.benefit4_title", { defaultValue: "Live Trading Rooms" }),
      desc: t("home.value.benefit4_desc", { defaultValue: "Watch experts trade in real-time and learn by doing" }),
    },
    {
      icon: Trophy,
      title: t("home.value.benefit5_title", { defaultValue: "Prop Firm Ready" }),
      desc: t("home.value.benefit5_desc", { defaultValue: "Get funded and trade with capital up to $200,000" }),
    },
    {
      icon: Smartphone,
      title: t("home.value.benefit6_title", { defaultValue: "Mobile Access" }),
      desc: t("home.value.benefit6_desc", { defaultValue: "Learn and trade anywhere with our mobile-first platform" }),
    },
  ];

  return (
    <Box py={{ base: 12, md: 20 }}>
      <VStack spacing={4} textAlign="center" mb={{ base: 10, md: 14 }}>
        <Heading 
          fontSize={{ base: "2.5rem", md: "3.5rem" }} 
          letterSpacing="-0.03em" 
          fontWeight="700"
          bgGradient="linear(to-r, #65a8bf, #b7a27d)" 
          bgClip="text"
        >
          {t("home.value.title", { defaultValue: "Why Traders Choose Us" })}
        </Heading>
        <Text maxW="xl" fontSize={{ base: "md", md: "lg" }}>
          {t("home.value.subtitle", { defaultValue: "Everything you need to become a consistently profitable trader" })}
        </Text>
      </VStack>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {benefits.map((benefit, i) => (
          <MotionBox
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <HStack
              p={6}
              borderRadius="20px"
              bg={UI.surfaceLight}
              border="1px solid"
              borderColor={UI.border}
              spacing={4}
              align="start"
              h="100%"
              _hover={{ borderColor: UI.borderAccent }}
              transition="all 0.3s"
            >
              <Box
                w="48px"
                h="48px"
                borderRadius="14px"
                bg={UI.gradient}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={benefit.icon} boxSize={6} color="#0a0f1a" />
              </Box>
              <VStack align="start" spacing={1}>
                <Text fontWeight="600">{benefit.title}</Text>
                <Text fontSize="sm" lineHeight="1.6">{benefit.desc}</Text>
              </VStack>
            </HStack>
          </MotionBox>
        ))}
      </SimpleGrid>
    </Box>
  );
};

// ===== CountUp =====
const CountUpNumber: React.FC<{
  end: number;
  duration?: number;
  suffix?: string;
  locale?: string;
}> = ({ end, duration = 2.0, suffix = "", locale }) => {
  const { i18n } = useTranslation() as any;
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const startedOnce = React.useRef(false);

  // When the number scrolls into view, start the animation
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedOnce.current) {
            startedOnce.current = true;
            setStarted(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animate from 0 -> end
  React.useEffect(() => {
    if (!started) return;

    let rafId = 0;
    const t0 = performance.now();

    const animate = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.floor(eased * end));
      if (p < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, end, duration]);

  const formatter = React.useMemo(() => {
    try {
      const loc = String(locale || i18n.language || "en");
      return new Intl.NumberFormat(loc);
    } catch {
      return new Intl.NumberFormat();
    }
  }, [locale, i18n.language]);

  return (
    <span ref={ref}>
      {formatter.format(value)} {suffix}
    </span>
  );
};

// ===== Review Card =====
type Review = {
  source: "Trustpilot" | "Forex Peace Army" | "CryptoCompare" | "Sitejabber" | "Other";
  rating: number;
  title: string;
  body: string;
  author: string;
  date?: string;
  url?: string;
  locale?: string;
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const { source, rating, title, body, author, date, url } = review;
  return (
    <Box
      bg="bg.surface"
      role="listitem"
      minW={{ base: "280px", md: "360px" }}
      maxW={{ base: "280px", md: "360px" }}
      px={5}
      py={4}
    >
      <HStack justify="space-between" align="center" mb={2} gap={3}>
        <HStack gap={2} align="center">
          {source !== "Other" && (
            <Image
              src={
                source === "Trustpilot"
                  ? "/images/logos/TP-White.png"
                  : source === "Forex Peace Army"
                  ? "/images/logos/fpa.png"
                  : source === "CryptoCompare"
                  ? "/images/logos/cryptocompare-darktext.png"
                  : source === "Sitejabber"
                  ? "/images/logos/sitejabber.png"
                  : "/images/logos/review-generic.svg"
              }
              h="16px"
              alt={source}
            />
          )}
        </HStack>
        <HStack gap={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              as={Star}
              boxSize={4}
              color={i < rating ? UI.accent : "gray.400"}
              fill={i < rating ? UI.accent : "none"}
            />
          ))}
        </HStack>
      </HStack>

      <Heading size="sm" mb={1} >
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
            <Button size="xs" variant="outline" >
              View
            </Button>
          </ChakraLink>
        )}
      </HStack>
    </Box>
  );
};

// ===== FAQ Row (Premium / Nfinite-inspired) =====
const FaqRow: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Box
      bg={open ? "rgba(101, 168, 191, 0.03)" : "transparent"}
      border="1px solid"
      borderColor={open ? UI.borderAccent : UI.border}
      borderRadius="20px"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{ borderColor: UI.borderAccent }}
    >
      <Button
        onClick={() => setOpen((v) => !v)}
        w="full"
        justifyContent="space-between"
        px={{ base: 5, md: 8 }}
        py={{ base: 5, md: 6 }}
        bg="transparent"
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
        borderRadius="20px"
        h="auto"
        minH="auto"
      >
        <HStack gap={4} flex="1">
          <Box
            w="32px"
            h="32px"
            borderRadius="10px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="700"
            transition="all 0.3s ease"
            flexShrink={0}
          >
            {index + 1}
          </Box>
          <Text textAlign="start" fontWeight="600" flex="1" fontSize={{ base: "sm", md: "md" }} lineHeight="1.5" color="#65a8bf">
            {q}
          </Text>
        </HStack>
        <Box
          as="span"
          w="32px"
          h="32px"
          borderRadius="full"
          bg={open ? "rgba(101, 168, 191, 0.2)" : "rgba(101, 168, 191, 0.1)"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="all 0.3s ease"
          transform={open ? "rotate(180deg)" : "rotate(0deg)"}
          color="#65a8bf"
          fontSize="lg"
        >
          ▾
        </Box>
      </Button>
      {open && (
        <MotionBox
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          overflow="hidden"
        >
          <Box
            px={{ base: 5, md: 8 }}
            pb={{ base: 5, md: 6 }}
            pt={0}
            ml={{ base: 0, md: "48px" }}
          >
            <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="inherit">
              {a}
            </Text>
          </Box>
        </MotionBox>
      )}
    </Box>
  );
};

// ===== Page =====
const Home: React.FC = () => {
  const { t, i18n } = useTranslation() as any;
  const isRTL = i18n?.language === "ar";
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  const pageRef = React.useRef<HTMLDivElement | null>(null);
  
  // App screenshot carousel state
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const screenshots = ["/1.PNG", "/2.PNG", "/3.PNG", "/4.PNG", "/5.PNG"];
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [screenshots.length]);

  const isDark = mode === "dark";

  const lang = String(i18n?.language || "en").toLowerCase();
  const isAR = lang.startsWith("ar");
  const isFR = lang.startsWith("fr");
  const accentColor = UI.accent;

  const [tiers, setTiers] = React.useState<any[]>([]);
  const [featuredTab, setFeaturedTab] = React.useState(0); // 0=guides, 1=communities
  const { user } = useAuth() as any;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLoggedIn = Boolean(user || token);
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [enrolledTiers, setEnrolledTiers] = React.useState<any[]>([]);
  const [isNewUser, setIsNewUser] = React.useState(false);

  const [showMarkets, setShowMarkets] = React.useState(true);
  const [showNews, setShowNews] = React.useState(true);
  const [showBadgesCard, setShowBadgesCard] = React.useState(true);

  const reviewsCarouselDuration = useBreakpointValue({ base: 9, md: 15 }) ?? 15;
  const [showOffersCard, setShowOffersCard] = React.useState(true);

  const [badges, setBadges] = React.useState<any[] | null>(null);
  const [offers, setOffers] = React.useState<any[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setLoadingPersonalization] = React.useState(false);
  const [spinOpen, setSpinOpen] = React.useState(false);
  const [showSpinButton, setShowSpinButton] = React.useState(false);

  const [journey, setJourney] = React.useState<Journey | null>(null);
  const [entitlements, setEntitlements] = React.useState<Entitlements | null>(null);
  const [readiness, setReadiness] = React.useState<ReadinessResponse | null>(null);
  const [loadingJourney, setLoadingJourney] = React.useState(false);

  const [platformStats, setPlatformStats] = React.useState<{
    totalLearners?: number;
    consistencyImprovedPercent?: number;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setLoadingPlatformStats] = React.useState(false);

  // Platform-level stats (optional; only show if backend returns real numbers)
  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoadingPlatformStats(true);

        const endpoints = ["/stats/public", "/public/stats", "/analytics/platform"];
        const results = await Promise.allSettled(endpoints.map((p) => api.get(p)));

        let payload: any = null;
        for (const r of results) {
          if (r.status === "fulfilled") {
            const d = (r as any).value?.data;
            if (d && typeof d === "object") {
              payload = d;
              break;
            }
          }
        }

        if (!mounted || !payload) return;

        const stats = {
          totalLearners:
            Number(payload?.totalLearners) ||
            Number(payload?.learners) ||
            Number(payload?.students) ||
            undefined,
          consistencyImprovedPercent:
            Number(payload?.consistencyImprovedPercent) ||
            Number(payload?.profitabilityImprovedPercent) ||
            undefined,
        };

        if (!stats.totalLearners && !stats.consistencyImprovedPercent) return;
        setPlatformStats(stats);
      } catch {
        if (!mounted) return;
        setPlatformStats(null);
      } finally {
        mounted && setLoadingPlatformStats(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!isLoggedIn) {
        if (!mounted) return;
        setJourney(null);
        setEntitlements(null);
        setReadiness(null);
        return;
      }

      try {
        setLoadingJourney(true);
        const [j, e, r] = await Promise.all([
          fetchJourney().catch(() => null),
          fetchEntitlements().catch(() => null),
          fetchReadiness().catch(() => null),
        ]);

        if (!mounted) return;
        setJourney(j);
        setEntitlements(e);
        setReadiness(r);
      } finally {
        mounted && setLoadingJourney(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setLearningStats] = React.useState<{
    activePrograms?: number;
    streakDays?: number;
    hoursLast30?: number;
    completionPercent?: number;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setLoadingStats] = React.useState(false);

  const stage = journey?.stage ?? "SIGNED_UP";
  const stageIndex = journey ? JOURNEY_STAGE_ORDER.indexOf(stage as any) : 0;
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

  const canUseDashboard = Boolean(entitlements?.canUseDashboard);
  // Optional: you can tighten these rules to your product logic
  const allowMarketsBoard = isEnrolled && canUseDashboard;
  const allowNews = isEnrolled; // or gate by stage if you want

  

  // Load courses + subscriptions
  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get("/courses").catch(() => ({ data: [] })),
      api.get("/subscriptions").catch(() => ({ data: [] })),
    ])
      .then(([coursesResp, subsResp]) => {
        if (mounted) {
          const courses = Array.isArray(coursesResp.data) ? coursesResp.data : [];
          const subs = Array.isArray(subsResp.data) ? subsResp.data : [];
          setTiers([...courses, ...subs]);
        }
      })
      .catch(() => mounted && setTiers([]));
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch purchases
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token && !user) return;
        const mine = await getMyPurchases({ ttlMs: 2 * 60 * 1000 }).catch(() => []);
        if (!mounted) return;
        const list = Array.isArray(mine) ? mine : [];
        const confirmed = list.filter((p: any) => String(p?.status).toUpperCase() === "CONFIRMED");
        setIsEnrolled(confirmed.length > 0);

        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const hasRecentEnrollment = confirmed.some(
          (p: any) => new Date(p.createdAt).getTime() > sevenDaysAgo
        );
        setIsNewUser(hasRecentEnrollment && confirmed.length <= 2);

        // map to tiers we already fetched
        const tiersMap = new Map(tiers.map((t: any) => [t.id, t]));
        const myTiers = confirmed.map((p: any) => tiersMap.get(p.tierId)).filter(Boolean);
        const uniqueTiers = Array.from(new Map(myTiers.map((t: any) => [t.id, t])).values());
        setEnrolledTiers(uniqueTiers);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [user, tiers]);

  // Badges & personalized offers (opportunistic fetch)
  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoadingPersonalization(true);

        const badgeEndpoints = ["/me/badges", "/badges/me", "/profile/badges", "/achievements"];
        const offerEndpoints = ["/offers/personalized", "/promos/eligible", "/promos/personalized"];

        const [badgeResults, offerResults] = await Promise.all([
          Promise.allSettled(badgeEndpoints.map((p) => api.get(p))),
          Promise.allSettled(offerEndpoints.map((p) => api.get(p))),
        ]);

        // ---- Badges ----
        let bData: any[] = [];
        for (const r of badgeResults) {
          if (r.status === "fulfilled") {
            const d = (r as any).value?.data;
            if (Array.isArray(d)) {
              bData = d;
              break;
            }
            if (Array.isArray(d?.items)) {
              bData = d.items;
              break;
            }
          }
        }

        // ---- Offers ----
        let oData: any[] = [];
        for (const r of offerResults) {
          if (r.status === "fulfilled") {
            const d = (r as any).value?.data;
            if (Array.isArray(d)) {
              oData = d;
              break;
            }
            if (Array.isArray(d?.items)) {
              oData = d.items;
              break;
            }
          }
        }

        // Fallback offers from tiers (based on discount / sale price)
        if (oData.length === 0 && Array.isArray(tiers) && tiers.length) {
          const fromTiers = tiers
            .map((t: any) => {
              const price = Number(t?.price_stripe ?? t?.price ?? t?.priceUsd ?? 0);
              const sale = Number(t?.salePrice ?? t?.priceSale ?? 0);
              const disc = Number(t?.discountPercent ?? 0);
              const hasDisc = (sale > 0 && price > 0 && sale < price) || disc > 0;
              if (!hasDisc) return null;

              const discountPercent =
                disc || (price > 0 ? Math.max(0, Math.round((1 - sale / price) * 100)) : 0);

              return {
                id: `tier-${t.id}`,
                title: t.name,
                description: t.description,
                discountPercent,
                tierId: t.id,
              };
            })
            .filter(Boolean) as any[];

          if (fromTiers.length) oData = fromTiers;
        }

        // New-user generic welcome offer
        if (oData.length === 0 && isNewUser) {
          oData = [
            {
              id: "welcome",
              title: t("home.offers.welcome_title", { defaultValue: "Welcome Offer" }),
              description: t("home.offers.welcome_desc", {
                defaultValue: "New student discount",
              }),
              discountPercent: 10,
              code: "WELCOME10",
              url: "/products",
            },
          ];
        }

        if (!mounted) return;
        setBadges(Array.isArray(bData) ? bData : []);
        setOffers(Array.isArray(oData) ? oData : []);
      } catch {
        if (!mounted) return;
        setBadges([]);
        setOffers([]);
      } finally {
        mounted && setLoadingPersonalization(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [user, tiers, isNewUser, t]);

  // Learning stats: streak, hours, completion (real data if backend exists, else derived)
  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoadingStats(true);

        const token = localStorage.getItem("token");
        if (!user && !token) {
          // Guest: derive from enrolledTiers only
          const derivedActive = enrolledTiers.length;
          const derivedCompletion = derivedActive
            ? Math.round(
                enrolledTiers.reduce((sum: number, tier: any) => {
                  const p = Number(
                    tier.progressPercent ?? tier.progress_percentage ?? tier.progress ?? 0
                  );
                  return sum + (Number.isFinite(p) ? p : 0);
                }, 0) / derivedActive
              )
            : 0;

          if (mounted) {
            setLearningStats({
              activePrograms: derivedActive,
              streakDays: 0,
              hoursLast30: derivedActive ? derivedActive * 6 : 0,
              completionPercent: derivedCompletion,
            });
          }
          return;
        }

        // Try several possible endpoints – use the first that works
        const endpoints = ["/me/learning-stats", "/learning/stats/me", "/me/dashboard/stats"];

        let payload: any = null;
        const results = await Promise.allSettled(endpoints.map((p) => api.get(p)));

        for (const r of results) {
          if (r.status === "fulfilled") {
            const d = (r as any).value?.data;
            if (d && typeof d === "object") {
              payload = d;
              break;
            }
          }
        }

        const derivedActive = enrolledTiers.length;
        const derivedCompletion = derivedActive
          ? Math.round(
              enrolledTiers.reduce((sum: number, tier: any) => {
                const p = Number(
                  tier.progressPercent ?? tier.progress_percentage ?? tier.progress ?? 0
                );
                return sum + (Number.isFinite(p) ? p : 0);
              }, 0) / derivedActive
            )
          : 0;

        const stats = {
          activePrograms:
            Number(payload?.activePrograms) || Number(payload?.programsActive) || derivedActive,
          streakDays: Number(payload?.streakDays) || Number(payload?.learningStreakDays) || 0,
          hoursLast30:
            Number(payload?.hoursLast30) ||
            Number(payload?.hoursLearnedLast30) ||
            (derivedActive ? derivedActive * 6 : 0),
          completionPercent:
            Number(payload?.completionPercent) ||
            Number(payload?.avgCompletionPercent) ||
            derivedCompletion,
        };

        if (!mounted) return;
        setLearningStats(stats);
      } catch {
        if (!mounted) return;

        const derivedActive = enrolledTiers.length;
        const derivedCompletion = derivedActive
          ? Math.round(
              enrolledTiers.reduce((sum: number, tier: any) => {
                const p = Number(
                  tier.progressPercent ?? tier.progress_percentage ?? tier.progress ?? 0
                );
                return sum + (Number.isFinite(p) ? p : 0);
              }, 0) / derivedActive
            )
          : 0;

        setLearningStats({
          activePrograms: derivedActive,
          streakDays: 0,
          hoursLast30: derivedActive ? derivedActive * 6 : 0,
          completionPercent: derivedCompletion,
        });
      } finally {
        mounted && setLoadingStats(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [user, enrolledTiers]);

  const { coursesOnly, subscriptionsOnly } = React.useMemo(() => {
    const courses = tiers.filter((t) => !t.isVipProduct);
    const subs = tiers.filter((t) => t.isVipProduct);
    return { coursesOnly: courses, subscriptionsOnly: subs };
  }, [tiers]);

  const activeTiers = featuredTab === 0 ? coursesOnly : subscriptionsOnly;
  const displayTiers = React.useMemo(
    () => (featuredTab === 0 ? activeTiers.slice(0, 4) : activeTiers.slice(0, 2)),
    [activeTiers, featuredTab]
  );

  // Reviews (fallback data if none available from tiers)
  const sampleReviews: Review[] = React.useMemo(() => [
    {
      source: "Trustpilot",
      rating: 5,
      title: "Trustpilot Verified",
      body: "Real students. Real outcomes.",
      author: "M. Ibrahim",
      date: "2025-09-18",
      url: "#",
    },
    {
      source: "Forex Peace Army",
      rating: 5,
      title: "Highly Rated by Learners",
      body: "Strong instructor ratings reported by students.",
      author: "FPA Member",
      date: "2025-09-09",
      url: "#",
    },
    {
      source: "CryptoCompare",
      rating: 5,
      title: "Trusted in MENA & Beyond",
      body: "Transparency you can count on.",
      author: "CC Reviewer",
      date: "2025-08-30",
      url: "#",
    },
    {
      source: "Sitejabber",
      rating: 4,
      title: "Learners Love the Coach",
      body: "Hundreds of verified reviews from real traders.",
      author: "A. Rahman",
      date: "2025-08-12",
      url: "#",
    },
  ], []);

  const courseReviews: Review[] = React.useMemo(() => {
    try {
      const out: Review[] = [];
      for (const tier of tiers) {
        const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
        for (const r of lr) {
          const rating = Math.max(1, Math.min(5, Number(r?.rating) || 0));
          const body = String(r?.comment || "").trim();
          if (!body) continue;
          out.push({
            source: "Other",
            rating,
            title: tier?.name || "Verified Review",
            body: body.length > 280 ? body.slice(0, 277) + "..." : body,
            author: r?.user?.name || "Student",
            date: r?.created_at,
            url: undefined,
            locale: i18n.language,
          });
        }
      }
      out.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      return out.slice(0, 20);
    } catch {
      return [];
    }
  }, [tiers, i18n.language]);

  const reviewsToShow: Review[] = React.useMemo(
    () => (courseReviews.length ? courseReviews : sampleReviews),
    [courseReviews, sampleReviews]
  );

  // Helpers for ratings
  const getAvgRating = (tier: any): { avg: number; count: number } => {
    const explicit = Number(tier?.rating);
    const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
    const count = lr.length;
    const fromReviews =
      count > 0 ? lr.reduce((s: number, r: any) => s + (Number(r?.rating) || 0), 0) / count : NaN;
    const avg =
      !Number.isNaN(explicit) && explicit > 0
        ? explicit
        : Number.isNaN(fromReviews)
        ? 0
        : fromReviews;
    return { avg, count };
  };

  const fmtAvg = (n: number) => (n ? (Math.round(n * 10) / 10).toFixed(1) : "0.0");

  // FAQ items
  const faqItems = (t("home.faq.items", { returnObjects: true }) as any[]) || [
    {
      q: t("home.faq.q1") || "Who are these programs for?",
      a:
        t("home.faq.a1") ||
        "Beginners to advanced learners looking for structured, outcome-focused training.",
    },
    {
      q: t("home.faq.q2") || "How are the courses delivered?",
      a:
        t("home.faq.a2") ||
        "Live cohorts and self-paced modules with community support and downloadable resources.",
    },
    {
      q: t("home.faq.q3") || "Do I get a certificate?",
      a:
        t("home.faq.a3") ||
        "Yes, you’ll receive a certificate of completion you can share on LinkedIn.",
    },
    {
      q: t("home.faq.q4") || "Can I try before committing?",
      a:
        t("home.faq.a4") ||
        "We offer previews and sample lessons so you can explore before you enroll.",
    },
  ];

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  React.useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const hero = document.getElementById("hero-section");
      const rect = hero?.getBoundingClientRect();
      const bottom = rect ? rect.bottom : Math.round(window.innerHeight * 0.94);
      const clampedBottom = Math.max(0, Math.min(window.innerHeight, bottom));
      root.style.setProperty("--hero-bottom", `${clampedBottom}px`);
      const out = Math.max(0, -bottom);
      const ratio = Math.max(0, Math.min(1, out / (window.innerHeight * 0.8)));
      root.style.setProperty("--dots-opacity", `${ratio}`);
      root.style.setProperty("--bg-top-alpha", `${Math.min(0.9, ratio)}`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true } as any);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update as any);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <MotionBox ref={pageRef}>
      <Box dir={isRTL ? "rtl" : "ltr"} minH="100vh" position="relative" overflow="hidden">
        <Box dir={isRTL ? "rtl" : "ltr"} position="relative">
          {/* Hero */}
          {isLoggedIn ? (
            <Hero
              loading={loadingJourney}
              journey={journey}
              entitlements={entitlements}
              readiness={readiness}
              stageProgress={stageProgress}
              readinessPercent={readinessPercent}
              allowMarketsBoard={allowMarketsBoard}
              allowNews={allowNews}
              isEnrolled={isEnrolled}
              onOpenPath={() => navigate("/path")}
              onOpenProgress={() => navigate("/progress")}
              onOpenDashboard={() => navigate("/")}
              onOpenProducts={() => navigate("/products")}
              onOpenContact={() => navigate("/contact")}
            />
          ) : (
            <GuestLanding
              expired={false}
              onOpenSpin={() => setSpinOpen(true)}
              showSpinButton={showSpinButton}
              setShowSpinButton={setShowSpinButton}
            />
          )}

          <Container maxW="container.xl">
            {isEnrolled ? (
              <>
                {/* ENROLLED DASHBOARD CARDS */}
                <Box mt={{ base: 6, md: 8 }}>
                  <VStack spacing={6} align="stretch">
                    {/* Markets (with show/hide toggle) */}
                    <SpotlightCard>
                      <HStack justify="space-between" align="center" mb={3}>
                        <Heading size="md" color="#65a8bf">
                          {t("home.enrolled.markets_title", {
                            defaultValue: "AI-Enhanced Markets Overview",
                          })}
                        </Heading>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={accentColor}
                          color={accentColor}
                          onClick={() => setShowMarkets((v) => !v)}
                        >
                          {showMarkets
                            ? t("common.hide", { defaultValue: "Hide" })
                            : t("common.show", { defaultValue: "Show" })}
                        </Button>
                      </HStack>
                      {showMarkets && (
                        <Box pt={1}>
                          {allowMarketsBoard ? (
                            <MarketsBoard mode={mode} accentColor={accentColor} t={t} hideHeader />
                          ) : (
                            <SpotlightCard>
                              <Box p={5}>
                                <Stack spacing={3}>
                                  <Heading size="sm">Locked</Heading>
                                  <Text opacity={0.85}>
                                    Unlock the trading workspace by confirming a course/subscription
                                    that enables dashboards.
                                  </Text>
                                  <HStack wrap="wrap" gap={3}>
                                    <Button
                                      variant="solid"
                                      bg={UI.accent}
                                      boxShadow={UI.glow}
                                      onClick={() => navigate("/products")}
                                    >
                                      View plans
                                    </Button>
                                    <Button
                                      variant="outline"
                                      borderColor={UI.accent}
                                      onClick={() => navigate("/path")}
                                    >
                                      View your path
                                    </Button>
                                  </HStack>
                                </Stack>
                              </Box>
                            </SpotlightCard>
                          )}
                        </Box>
                      )}
                    </SpotlightCard>

                    {/* AI News & Timeline (full-width, under markets) */}
                    <SpotlightCard>
                      <HStack justify="space-between" align="center" mb={3}>
                        <Heading size="md" color="#65a8bf">
                          {t("home.enrolled.news_title", {
                            defaultValue: "AI News & Timeline",
                          })}
                        </Heading>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor={accentColor}
                          color={accentColor}
                          onClick={() => setShowNews((v) => !v)}
                        >
                          {showNews
                            ? t("common.hide", { defaultValue: "Hide" })
                            : t("common.show", { defaultValue: "Show" })}
                        </Button>
                      </HStack>
                      {showNews && (
                        <Box pt={1}>
                          {allowNews ? (
                            <TimelineNewsTabs mode="dark" />
                          ) : (
                            <SpotlightCard>
                              <Box p={5}>
                                <Stack spacing={3}>
                                  <Heading size="sm">Locked</Heading>
                                  <Text opacity={0.85}>
                                    Confirm a program to unlock the live timeline and AI news tools.
                                  </Text>
                                  <HStack wrap="wrap" gap={3}>
                                    <Button
                                      variant="solid"
                                      bg={UI.accent}
                                      boxShadow={UI.glow}
                                      onClick={() => navigate("/products")}
                                    >
                                      Browse courses
                                    </Button>
                                    <Button
                                      variant="outline"
                                      borderColor={UI.accent}
                                      onClick={() => navigate("/contact")}
                                    >
                                      Contact support
                                    </Button>
                                  </HStack>
                                </Stack>
                              </Box>
                            </SpotlightCard>
                          )}
                        </Box>
                      )}
                    </SpotlightCard>

                    {/* Badges & Achievements (only if we have any) */}
                    {Array.isArray(badges) && badges.length > 0 && (
                      <SpotlightCard>
                        <Box p={{ base: 5, md: 6 }}>
                          <HStack justify="space-between" mb={4} align="center">
                            <Heading size="md" color={accentColor}>
                              {t("home.enrolled.badges_title", {
                                defaultValue: "Badges & Achievements",
                              })}
                            </Heading>
                            <HStack spacing={3}>
                              <Badge colorScheme="cyan">{badges.length}</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                borderColor={accentColor}
                                color={accentColor}
                                onClick={() => setShowBadgesCard((v) => !v)}
                              >
                                {showBadgesCard
                                  ? t("common.hide", { defaultValue: "Hide" })
                                  : t("common.show", { defaultValue: "Show" })}
                              </Button>
                            </HStack>
                          </HStack>

                          {showBadgesCard && (
                            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                              {badges.map((b: any) => (
                                <Box
                                  key={b.id || b.name}
                                  p={4}
                                  bg="bg.surface"
                                  borderRadius="lg"
                                  textAlign="center"
                                >
                                  <Box mb={2}>
                                    {b.icon ? <Text fontSize="28px">{b.icon}</Text> : <Icon as={Award} boxSize={7} color="#65a8bf" />}
                                  </Box>
                                  <Heading size="sm" color="#65a8bf" noOfLines={2}>
                                    {b.name || "Badge"}
                                  </Heading>
                                  {b.description && (
                                    <Text
                                      fontSize="xs"
                                      opacity={0.8}
                                      mt={1}
                                      noOfLines={2}
                                      color="#65a8bf"
                                    >
                                      {b.description}
                                    </Text>
                                  )}
                                  {b.earnedAt && (
                                    <Text fontSize="10px" opacity={0.6} mt={2} color="#65a8bf">
                                      {new Date(b.earnedAt).toLocaleDateString()}
                                    </Text>
                                  )}
                                </Box>
                              ))}
                            </SimpleGrid>
                          )}
                        </Box>
                      </SpotlightCard>
                    )}

                    {/* Personalized Offers & Discounts (only if available) */}
                    {Array.isArray(offers) && offers.length > 0 && (
                      <SpotlightCard>
                        <Box p={{ base: 5, md: 6 }}>
                          <HStack justify="space-between" mb={3} align="center">
                            <Heading size="md" color={accentColor}>
                              {t("home.enrolled.offers_title", {
                                defaultValue: "Personalized Offers & Discounts",
                              })}
                            </Heading>
                            <Button
                              size="sm"
                              variant="outline"
                              borderColor={accentColor}
                              color={accentColor}
                              onClick={() => setShowOffersCard((v) => !v)}
                            >
                              {showOffersCard
                                ? t("common.hide", { defaultValue: "Hide" })
                                : t("common.show", { defaultValue: "Show" })}
                            </Button>
                          </HStack>

                          {showOffersCard && (
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                              {offers.map((o: any) => (
                                <Box
                                  key={o.id || o.title}
                                  p={5}
                                  borderRadius="xl"
                                  borderWidth="1px"
                                  borderColor="rgba(104,165,191,0.35)"
                                  bg="rgba(15,23,42,0.9)"
                                  boxShadow="0 18px 40px rgba(15,23,42,0.9)"
                                >
                                  <VStack align="stretch" spacing={3} h="100%">
                                    <HStack justify="space-between" align="center" w="full" mb={1}>
                                      <HStack gap={2} wrap="wrap">
                                        {typeof o.discountPercent === "number" && (
                                          <Badge borderRadius="full" px={3} colorScheme="green">
                                            -{o.discountPercent}%
                                          </Badge>
                                        )}
                                      </HStack>
                                      {o.expiresAt && (
                                        <Text fontSize="xs" color="red.200" opacity={0.9}>
                                          {t("common.expires", {
                                            defaultValue: "Expires",
                                          })}
                                          : {new Date(o.expiresAt).toLocaleDateString()}
                                        </Text>
                                      )}
                                    </HStack>

                                    <Box>
                                      <Heading size="sm" color="#65a8bf" mb={1}>
                                        {o.title || t("common.offer", { defaultValue: "Offer" })}
                                      </Heading>
                                      {o.description && (
                                        <Text fontSize="sm" opacity={0.85} color="#65a8bf">
                                          {o.description}
                                        </Text>
                                      )}
                                    </Box>

                                    {o.code && (
                                      <Box
                                        mt={1}
                                        w="full"
                                        borderRadius="lg"
                                        borderWidth="1px"
                                        borderColor="rgba(104,165,191,0.35)"
                                        bg="rgba(15,23,42,0.9)"
                                        px={3}
                                        py={2}
                                      >
                                        <HStack justify="space-between" align="center" w="full">
                                          <Text fontSize="xs" opacity={0.8} color="#65a8bf">
                                            {t("home.enrolled.use_code", {
                                              defaultValue: "Use code",
                                            })}
                                          </Text>
                                          <Badge
                                            variant="outline"
                                            borderColor={accentColor}
                                            color={accentColor}
                                            borderRadius="full"
                                            px={3}
                                          >
                                            {o.code}
                                          </Badge>
                                        </HStack>
                                      </Box>
                                    )}

                                    <Box flex="1 1 auto" />

                                    <Button
                                      size="sm"
                                      w="full"
                                      mt={1}
                                      bg={accentColor}
                                      color="black"
                                      _hover={{ filter: "brightness(1.05)" }}
                                      onClick={() => {
                                        if (o.url) {
                                          window.open(o.url, "_self");
                                        } else if (o.tierId) {
                                          navigate(`/learn/${o.tierId}`);
                                        }
                                      }}
                                    >
                                      {o.ctaLabel ||
                                        t("common.view", {
                                          defaultValue: "View",
                                        })}
                                    </Button>
                                  </VStack>
                                </Box>
                              ))}
                            </SimpleGrid>
                          )}
                        </Box>
                      </SpotlightCard>
                    )}
                  </VStack>
                </Box>

              </>
            ) : (
              <>
                {/* Upgrade upsell for logged-in free users */}
                {isLoggedIn && (
                  <ParallaxSection speed={0.3}>
                    <Box
                      mt={{ base: 4, md: 6 }}
                      p={{ base: 6, md: 10 }}
                      borderRadius="28px"
                      position="relative"
                      overflow="hidden"
                      bg="linear-gradient(135deg, rgba(101, 168, 191, 0.08) 0%, rgba(183, 162, 125, 0.08) 100%)"
                      border="1px solid"
                      borderColor="rgba(101, 168, 191, 0.25)"
                      boxShadow="0 0 60px rgba(101, 168, 191, 0.08)"
                    >
                      <Box
                        position="absolute"
                        top="-30%"
                        right="-10%"
                        w="300px"
                        h="300px"
                        borderRadius="full"
                        bgGradient="radial(circle, rgba(101, 168, 191, 0.12), transparent 70%)"
                        pointerEvents="none"
                      />
                      <VStack spacing={4} align="center" textAlign="center" position="relative">
                        <Badge
                          bg="rgba(101, 168, 191, 0.15)"
                          color="#65a8bf"
                          px={4}
                          py={1.5}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.1em"
                        >
                          {t("home.upgrade.badge", { defaultValue: "Unlock Full Access" })}
                        </Badge>
                        <Heading
                          fontSize={{ base: "2xl", md: "3xl" }}
                          bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                          bgClip="text"
                          fontWeight="800"
                        >
                          {t("home.upgrade.title", { defaultValue: "Upgrade to Your Full Trading Terminal" })}
                        </Heading>
                        <Text maxW="lg" fontSize={{ base: "sm", md: "md" }} opacity={0.85}>
                          {t("home.upgrade.subtitle", { defaultValue: "Get live market charts, AI news feeds, advanced screeners, heatmaps, and the complete trading workspace. Everything you need to trade like a pro." })}
                        </Text>
                        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} maxW="700px" w="100%" mt={2}>
                          {[
                            { label: t("home.upgrade.charts", { defaultValue: "Live Charts" }), icon: BarChart3 },
                            { label: t("home.upgrade.ai_news", { defaultValue: "AI News" }), icon: Bot },
                            { label: t("home.upgrade.screeners", { defaultValue: "Screeners" }), icon: Search },
                            { label: t("home.upgrade.heatmaps", { defaultValue: "Heatmaps" }), icon: MapIcon },
                          ].map((f) => (
                            <Box
                              key={f.label}
                              p={3}
                              borderRadius="xl"
                              bg="rgba(101, 168, 191, 0.06)"
                              border="1px solid rgba(101, 168, 191, 0.15)"
                              textAlign="center"
                            >
                              <Icon as={f.icon} boxSize={5} color="#65a8bf" mb={1} />
                              <Text fontSize="xs" fontWeight="600" color="#65a8bf">{f.label}</Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                        <HStack spacing={4} pt={2}>
                          <Button
                            size="lg"
                            bg={UI.gradient}
                            color="#0a0f1a"
                            fontWeight="700"
                            px={8}
                            borderRadius="14px"
                            boxShadow={UI.glowStrong}
                            _hover={{ transform: "translateY(-2px)", boxShadow: "0 0 80px rgba(101, 168, 191, 0.35)" }}
                            transition="all 0.3s"
                            onClick={() => navigate("/products")}
                          >
                            {t("home.upgrade.cta", { defaultValue: "Browse Plans" })}
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </ParallaxSection>
                )}

                {/* Terminal GIF Showcase */}
                <Box py={{ base: 8, md: 12 }} position="relative" overflow="hidden">
                  <MotionBox
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <VStack spacing={5} textAlign="center" mb={{ base: 8, md: 12 }}>
                      <Badge
                        colorScheme="cyan"
                        variant="subtle"
                        px={4}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                      >
                        {t("home.terminal.badge", { defaultValue: "Your Trading Terminal" })}
                      </Badge>
                      <Heading
                        fontSize={{ base: "2rem", md: "3.2rem" }}
                        letterSpacing="-0.03em"
                        fontWeight="700"
                        bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                        bgClip="text"
                        lineHeight="1.15"
                      >
                        {t("home.terminal.title", { defaultValue: "The Most Customizable Terminal in the Industry" })}
                      </Heading>
                      <Text maxW="2xl" fontSize={{ base: "md", md: "lg" }} opacity={0.75} lineHeight="1.7">
                        {t("home.terminal.subtitle", { defaultValue: "Live charts, news feeds, market data, and your learning progress — all in one place. Built exactly the way you want it." })}
                      </Text>
                    </VStack>

                    <Box
                      maxW="1100px"
                      mx="auto"
                      borderRadius="2xl"
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                      boxShadow={isDark ? "0 40px 120px rgba(101, 168, 191, 0.08)" : "0 40px 120px rgba(0,0,0,0.08)"}
                      position="relative"
                      bg={isDark ? "gray.900" : "gray.100"}
                    >
                      {/* Placeholder for terminal GIF — replace src with your .gif */}
                      <Image
                        src="/terminal-preview.gif"
                        alt="promrkts Trading Terminal"
                        w="100%"
                        h="auto"
                        fallback={
                          <Box
                            w="100%"
                            h={{ base: "220px", md: "500px" }}
                            bg={isDark ? "gray.800" : "gray.200"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <VStack spacing={3} opacity={0.5}>
                              <Icon as={Monitor} boxSize={10} color="#65a8bf" />
                              <Text fontSize="sm" fontWeight="600">{t("home.terminal.placeholder", { defaultValue: "Terminal Preview" })}</Text>
                              <Text fontSize="xs" opacity={0.6}>{t("home.terminal.placeholder_hint", { defaultValue: "Add your .gif to /public/terminal-preview.gif" })}</Text>
                            </VStack>
                          </Box>
                        }
                      />
                      {/* Subtle gradient overlay at bottom */}
                      <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        h="80px"
                        bgGradient={isDark ? "linear(to-t, gray.900, transparent)" : "linear(to-t, gray.100, transparent)"}
                        pointerEvents="none"
                      />
                    </Box>
                  </MotionBox>
                </Box>

                {/* Used by Traders At — Logo Carousel */}
                <Box py={{ base: 10, md: 14 }} overflow="hidden">
                  <MotionBox
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <Text
                      textAlign="center"
                      fontSize={{ base: "xs", md: "sm" }}
                      textTransform="uppercase"
                      letterSpacing="0.15em"
                      fontWeight="600"
                      opacity={0.4}
                      mb={{ base: 6, md: 8 }}
                    >
                      {t("home.logos.title", { defaultValue: "Used by traders at" })}
                    </Text>

                    {/* Infinite scroll carousel */}
                    <Box position="relative">
                      {/* Fade edges */}
                      <Box position="absolute" left={0} top={0} bottom={0} w="80px" bgGradient={isDark ? "linear(to-r, #050811, transparent)" : "linear(to-r, white, transparent)"} zIndex={1} pointerEvents="none" />
                      <Box position="absolute" right={0} top={0} bottom={0} w="80px" bgGradient={isDark ? "linear(to-l, #050811, transparent)" : "linear(to-l, white, transparent)"} zIndex={1} pointerEvents="none" />

                      <Box
                        display="flex"
                        w="max-content"
                        sx={{
                          animation: "logoScroll 30s linear infinite",
                          "@keyframes logoScroll": {
                            "0%": { transform: "translateX(0)" },
                            "100%": { transform: "translateX(-50%)" },
                          },
                        }}
                      >
                        {/* Duplicate set for seamless loop */}
                        {[...Array(2)].map((_, setIdx) => (
                          <HStack key={setIdx} spacing={{ base: 10, md: 16 }} px={{ base: 5, md: 8 }} flexShrink={0} bg="white">
                            {[
                              { name: "MLP", logo: "/MLP.png" },
                              { name: "J.P. Morgan", logo: "/JPM.svg" },
                              { name: "Morgan Stanley", logo: "/MorganStanley.png" },
                              { name: "Citadel", logo: "/Citadel.png" },
                              { name: "Renaissance", logo: isDark ? "/rentec_white.jpg" : "/rentec.png" },
                              { name: "Bridgewater", logo: "/Bridgewater.png" },
                              { name: "Blackstone", logo: "/Blackstone.svg" },
                              { name: "Ares", logo: "/Ares.avif" },
                              { name: "Apollo", logo: "/Apollo.png" },
                            ].map((firm) => (
                              <Box
                                key={`${setIdx}-${firm.name}`}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                minW={{ base: "100px", md: "140px" }}
                                h={{ base: "40px", md: "50px" }}
                                opacity={isDark ? 0.5 : 0.4}
                                _hover={{ opacity: 0.8 }}
                                transition="opacity 0.3s"
                                flexShrink={0}
                              >
                                <Image
                                  src={`${process.env.PUBLIC_URL || ""}${firm.logo}`}
                                  alt={firm.name}
                                  maxH={{ base: "28px", md: "38px" }}
                                  maxW={{ base: "90px", md: "130px" }}
                                  objectFit="contain"
                                  filter={isDark ? "brightness(1.2)" : undefined}
                                  loading="lazy"
                                />
                              </Box>
                            ))}
                          </HStack>
                        ))}
                      </Box>
                    </Box>
                  </MotionBox>
                </Box>

                {/* Institutional-Grade Education Section */}
                <Box py={{ base: 8, md: 12 }}>
                  <MotionBox
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, md: 16 }} alignItems="center" maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
                      {/* Left — Copy */}
                      <VStack align="start" spacing={5}>
                        <Badge
                          colorScheme="yellow"
                          variant="subtle"
                          px={4}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="0.1em"
                        >
                          {t("home.institutional.badge", { defaultValue: "Institutional Knowledge" })}
                        </Badge>
                        <Heading
                          fontSize={{ base: "1.8rem", md: "2.6rem" }}
                          letterSpacing="-0.02em"
                          fontWeight="700"
                          lineHeight="1.2"
                        >
                          {t("home.institutional.title", { defaultValue: "The Same Strategies Taught at Top Funds" })}
                        </Heading>
                        <Text fontSize={{ base: "md", md: "lg" }} opacity={0.7} lineHeight="1.8">
                          {t("home.institutional.description", { defaultValue: "Our guides are built on the exact frameworks, risk models, and trade structures used by analysts and portfolio managers at the world's leading investment banks and hedge funds. No retail fluff — just the real playbook." })}
                        </Text>
                        <VStack align="start" spacing={3} pt={2}>
                          {[
                            { icon: Landmark, text: t("home.institutional.point1", { defaultValue: "Institutional-grade risk management frameworks" }) },
                            { icon: Ruler, text: t("home.institutional.point2", { defaultValue: "Quantitative analysis methods used at top desks" }) },
                            { icon: LineChart, text: t("home.institutional.point3", { defaultValue: "Real trade breakdowns from professional setups" }) },
                            { icon: Crosshair, text: t("home.institutional.point4", { defaultValue: "Position sizing models from fund managers" }) },
                          ].map((item, i) => (
                            <HStack key={i} spacing={3} align="start">
                              <Icon as={item.icon} boxSize={5} color="#65a8bf" mt="2px" flexShrink={0} />
                              <Text fontSize="sm" opacity={0.8} lineHeight="1.6">{item.text}</Text>
                            </HStack>
                          ))}
                        </VStack>
                        <Button
                          mt={3}
                          size="lg"
                          bg="#65a8bf"
                          color="white"
                          _hover={{ bg: "#5494a8", transform: "translateY(-2px)", boxShadow: "0 8px 30px rgba(101, 168, 191, 0.3)" }}
                          transition="all 0.3s"
                          borderRadius="xl"
                          onClick={() => navigate("/products")}
                        >
                          {t("home.institutional.cta", { defaultValue: "Explore Our Guides" })}
                        </Button>
                      </VStack>

                      {/* Right — Visual card stack */}
                      <VStack spacing={4}>
                        {[
                          { title: t("home.institutional.card1_title", { defaultValue: "Market Microstructure" }), sub: t("home.institutional.card1_sub", { defaultValue: "Order flow, liquidity, and price discovery — the way prop desks see it" }), tag: t("home.institutional.card1_tag", { defaultValue: "Advanced" }), colorScheme: "red" },
                          { title: t("home.institutional.card2_title", { defaultValue: "Risk & Portfolio Theory" }), sub: t("home.institutional.card2_sub", { defaultValue: "Kelly criterion, VaR, and the frameworks that protect institutional capital" }), tag: t("home.institutional.card2_tag", { defaultValue: "Core" }), colorScheme: "cyan" },
                          { title: t("home.institutional.card3_title", { defaultValue: "Technical Analysis Masterclass" }), sub: t("home.institutional.card3_sub", { defaultValue: "Price action, volume profile, and multi-timeframe analysis from the desk" }), tag: t("home.institutional.card3_tag", { defaultValue: "Foundation" }), colorScheme: "green" },
                        ].map((card, i) => (
                          <MotionBox
                            key={i}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            viewport={{ once: true }}
                            w="100%"
                          >
                            <Box
                              p={5}
                              borderRadius="xl"
                              borderWidth={1}
                              borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
                              bg={isDark ? "whiteAlpha.50" : "white"}
                              _hover={{ borderColor: "#65a8bf", transform: "translateY(-2px)", boxShadow: isDark ? "0 8px 30px rgba(101, 168, 191, 0.1)" : "0 8px 30px rgba(0,0,0,0.06)" }}
                              transition="all 0.3s"
                              cursor="pointer"
                              onClick={() => navigate("/products")}
                            >
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="700" fontSize="md">{card.title}</Text>
                                <Badge
                                  colorScheme={card.colorScheme}
                                  variant="subtle"
                                  borderRadius="full"
                                  fontSize="2xs"
                                  px={2}
                                >
                                  {card.tag}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" opacity={0.6} lineHeight="1.6">{card.sub}</Text>
                            </Box>
                          </MotionBox>
                        ))}
                      </VStack>
                    </SimpleGrid>
                  </MotionBox>
                </Box>

                {/* Featured Courses & Subscriptions — always shown for non-enrolled */}
                <ParallaxSection speed={0.3}>
                  <Box py={{ base: 12, md: 25 }} position="relative">
                    <MotionBox
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Heading
                        textAlign="center"
                        bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                        bgClip="text"
                        mb={6}
                        fontSize={{ base: "3xl", md: "4xl" }}
                      >
                        {t("home.courses.title") || "The Prop Desk Playbooks"}
                      </Heading>
                    </MotionBox>

                    <MotionBox
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Box maxW="400px" mx="auto" mb={8}>
                        <Tabs
                          index={featuredTab}
                          onChange={setFeaturedTab}
                          isFitted
                          variant="unstyled"
                          w="full"
                        >
                          <TabList w="full" bg={accentColor} borderRadius="xl" p="2" gap="2">
                            <Tab
                              borderRadius="md"
                              fontWeight="semibold"
                              _hover={{ bg: "rgba(0,0,0,0.08)" }}
                              _selected={{
                                bg: mode === "dark" ? "black" : "white",
                                color: accentColor,
                              }}
                            >
                              {t("courses.tab", { defaultValue: BRAND.guidesLabel })}
                            </Tab>
                            <Tab
                              borderRadius="md"
                              fontWeight="semibold"
                              _hover={{ bg: "rgba(0,0,0,0.08)" }}
                              _selected={{
                                bg: mode === "dark" ? "black" : "white",
                                color: accentColor,
                              }}
                            >
                              {t("subscriptions.tab", { defaultValue: BRAND.communitiesLabel })}
                            </Tab>
                          </TabList>
                        </Tabs>
                      </Box>
                    </MotionBox>

                    {/* Desktop product cards */}
                    <Box display={{ base: "none", md: "block" }}>
                      {displayTiers.length === 0 ? (
                        <Text textAlign="center" opacity={0.7} py={8}>
                          {featuredTab === 0
                            ? t("home.courses.no_courses", { defaultValue: "No guides available" })
                            : t("home.courses.no_subscriptions", {
                                defaultValue: "No communities available",
                              })}
                        </Text>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: featuredTab === 0 ? 4 : 2 }} gap={8}>
                          {displayTiers.map((tier, idx) => (
                            <MotionBox
                              key={tier.id || idx}
                              initial={{ opacity: 0, y: 50 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: idx * 0.1 }}
                              viewport={{ once: true, amount: 0.2 }}
                            >
                              <SpotlightCard>
                                <Box p={8} textAlign="center">
                                  <VStack gap={4}>
                                    <Heading size="lg" color="#65a8bf">
                                      {tier.name}
                                    </Heading>
                                    <Text fontSize="sm" color="#65a8bf">
                                      {tier.description}
                                    </Text>
                                    {(() => {
                                      const { avg, count } = getAvgRating(tier);
                                      if (!avg) return null;
                                      const rounded = Math.round(avg);
                                      return (
                                        <VStack gap={1}>
                                          <HStack justify="center" gap={1}>
                                            {Array.from({ length: 5 }).map((_, k) => (
                                              <Icon
                                                key={k}
                                                as={Star}
                                                boxSize={4}
                                                color={k < rounded ? accentColor : "gray.400"}
                                                fill={k < rounded ? accentColor : "none"}
                                              />
                                            ))}
                                          </HStack>
                                          <Text fontSize="xs" opacity={0.8}>
                                            {fmtAvg(avg)} • {count || 0}{" "}
                                            {t("common.reviews") || "reviews"}
                                          </Text>
                                        </VStack>
                                      );
                                    })()}
                                  </VStack>
                                </Box>
                                <Box p={8} pt={0}>
                                  <Button
                                    w="full"
                                    size="lg"
                                    bg={accentColor}
                                    boxShadow={UI.glow}
                                    _hover={{ transform: "scale(1.05)" }}
                                    transition="all 0.3s"
                                    onClick={() => navigate(`/products/${tier.id}`)}
                                  >
                                    {featuredTab === 0 ? "Open Guide" : "View Community"}
                                  </Button>
                                </Box>
                              </SpotlightCard>
                            </MotionBox>
                          ))}
                        </SimpleGrid>
                      )}
                    </Box>

                    {/* Mobile product cards */}
                    <Box display={{ base: "block", md: "none" }}>
                      <SimpleGrid columns={2} gap={4}>
                        {displayTiers.map((tier, idx) => (
                          <MotionBox
                            key={tier.id || idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true, amount: 0.2 }}
                          >
                            <SpotlightCard>
                              <Box p={4} textAlign="center">
                                <VStack gap={3}>
                                  <Heading size="md" color="#65a8bf">
                                    {tier.name}
                                  </Heading>
                                  <Text fontSize="sm" color="#65a8bf">
                                    {tier.description}
                                  </Text>
                                </VStack>
                              </Box>
                              <Box p={4} pt={0}>
                                <Button
                                  w="full"
                                  size="md"
                                  bg={accentColor}
                                  boxShadow={UI.glow}
                                  _hover={{ transform: "scale(1.05)" }}
                                  transition="all 0.3s"
                                  onClick={() => navigate(`/products/${tier.id}`)}
                                >
                                  {t("home.courses.view") || "View Curriculum"}
                                </Button>
                              </Box>
                            </SpotlightCard>
                          </MotionBox>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </Box>
                </ParallaxSection>

                {/* Services Stacking Cards — visible for ALL non-enrolled users */}
                <Box position="relative" py={{ base: 8, md: 14 }}>
                  <MotionBox
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.2 }}
                    mb={{ base: 8, md: 12 }}
                  >
                    <Heading
                      textAlign="center"
                      fontSize={{ base: "3xl", md: "5xl" }}
                      bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                      bgClip="text"
                      mb={4}
                    >
                      {t("home.services.title") || "How We Help Traders Succeed"}
                    </Heading>
                    <Text textAlign="center" maxW="600px" mx="auto" fontSize={{ base: "md", md: "lg" }}>
                      {t("home.services.subtitle") || "Our proven strategies have helped thousands of traders trade smarter and earn more."}
                    </Text>
                  </MotionBox>

                  <Container maxW="1000px" px={{ base: 4, md: 8 }}>
                    {[
                      { key: "education", icon: BookOpen },
                      { key: "strategies", icon: BarChart3 },
                      { key: "community", icon: Users },
                      { key: "support", icon: Target },
                    ].map((card, idx) => (
                      <Box
                        key={card.key}
                        position="sticky"
                        top={`${80 + idx * 30}px`}
                        zIndex={10 + idx}
                        mb={{ base: 6, md: 8 }}
                        transform={`scale(${1 - idx * 0.02})`}
                        transformOrigin="top center"
                      >
                        <MotionBox
                          initial={{ opacity: 0, y: 80 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: idx * 0.1 }}
                          viewport={{ once: true, amount: 0.2 }}
                        >
                          <Box
                            position="relative"
                            borderRadius="40px"
                            p="3px"
                            bgGradient="linear(135deg, #65a8bf 0%, #b7a27d 50%, #65a8bf 100%)"
                            boxShadow="0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(101, 168, 191, 0.15)"
                          >
                            <Box
                              bg="linear-gradient(135deg, #0a0f1a 0%, #111827 100%)"
                              borderRadius="38px"
                              p={{ base: 6, md: 10 }}
                              minH={{ base: "auto", md: "320px" }}
                            >
                              <VStack align="start" gap={{ base: 4, md: 5 }} w="100%">
                                <Box
                                  w={{ base: "60px", md: "80px" }}
                                  h={{ base: "60px", md: "80px" }}
                                  borderRadius="20px"
                                  bgGradient="linear(135deg, rgba(101, 168, 191, 0.2) 0%, rgba(183, 162, 125, 0.2) 100%)"
                                  border="2px solid"
                                  borderColor="rgba(101, 168, 191, 0.3)"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  flexShrink={0}
                                  boxShadow="0 0 30px rgba(101, 168, 191, 0.2)"
                                >
                                  <Icon as={card.icon} boxSize={{ base: 8, md: 10 }} color={UI.accent} />
                                </Box>
                                <VStack align="start" gap={{ base: 3, md: 4 }} w="100%">
                                  <Heading
                                    fontSize={{ base: "xl", md: "3xl" }}
                                    fontWeight="bold"
                                    bgGradient="linear(to-r, #ffffff, #e2e8f0)"
                                    bgClip="text"
                                  >
                                    {t(`home.services.${card.key}.title`) || card.key}
                                  </Heading>
                                  <Text
                                    fontSize={{ base: "sm", md: "lg" }}
                                    color="gray.400"
                                    lineHeight="1.8"
                                  >
                                    {t(`home.services.${card.key}.description`) || ""}
                                  </Text>
                                  <HStack gap={2} mt={2} flexWrap="wrap">
                                    {(t(`home.services.${card.key}.tags`, { returnObjects: true }) as string[] || []).map((tag: string, i: number) => (
                                      <Badge
                                        key={i}
                                        bg="rgba(101, 168, 191, 0.1)"
                                        color="#65a8bf"
                                        px={{ base: 3, md: 4 }}
                                        py={{ base: 1, md: 2 }}
                                        borderRadius="full"
                                        fontSize={{ base: "xs", md: "sm" }}
                                        fontWeight="500"
                                        border="1px solid"
                                        borderColor="rgba(101, 168, 191, 0.3)"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </HStack>
                                </VStack>
                              </VStack>
                            </Box>
                          </Box>
                        </MotionBox>
                      </Box>
                    ))}
                  </Container>
                </Box>

                {/* Full funnel — only for guests (not logged in) */}
                {!isLoggedIn && (<>
                <ParallaxSection speed={0.5}>
                  <SpotlightCard>
                    <Box p={6}>
                      <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, amount: 0.3 }}
                      >
                        <Heading textAlign="center" mb={6} fontSize={{ base: "2xl", md: "3xl" }} bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
                          {t("home.benefits.title") || "Experience a Premium, AI-Powered Journey"}
                        </Heading>
                      </MotionBox>
                      <SimpleGrid columns={{ base: 2, md: 4 }} gap={8} color="#65a8bf">
                        {[
                          {
                            title: t("home.benefits.one") || "Expert-Led Curriculum",
                            description:
                              t("home.benefits.one_desc") ||
                              "Structured paths from fundamentals to advanced strategies.",
                          },
                          {
                            title: t("home.benefits.two") || "Actionable Lessons",
                            description:
                              t("home.benefits.two_desc") ||
                              "Projects and case studies designed for real outcomes.",
                          },
                          {
                            title: t("home.benefits.three") || "Premium Community",
                            description:
                              t("home.benefits.three_desc") ||
                              "Access mentorship, events and private channels.",
                          },
                          {
                            title: t("home.benefits.four") || "Shariah-compliant",
                            description:
                              t("home.benefits.four_desc") ||
                              "All courses teach Shariah-compliant trading.",
                          },
                        ].map((feature, idx) => (
                          <MotionBox
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            viewport={{ once: true, amount: 0.3 }}
                          >
                            <Box p={6}>
                              <Grid
                                templateColumns={{ base: "1fr", md: "1fr" }}
                                gap={4}
                                alignItems="center"
                              >
                                <Box>
                                  <Heading size="md" mb={1}>
                                    {feature.title}
                                  </Heading>
                                  <Text fontSize="sm">{feature.description}</Text>
                                </Box>
                              </Grid>
                            </Box>
                          </MotionBox>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </SpotlightCard>
                </ParallaxSection>

                <ParallaxSection speed={0.6}>
                  <Box px={{ base: 4, md: 0 }} mt={{ base: 6, md: 12 }}>
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Image
                        src="/images/rand/many-platforms.webp"
                        maxW="container.lg"
                        w="100%"
                        mx="auto"
                        loading="lazy"
                      />
                    </MotionBox>
                  </Box>
                </ParallaxSection>

                {/* Stats Bar */}
                {platformStats &&
                  (platformStats.totalLearners || platformStats.consistencyImprovedPercent) && (
                    <ParallaxSection speed={0.4}>
                      <MotionBox
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, amount: 0.3 }}
                      >
                        <SpotlightCard>
                          <Box p={6}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} alignItems="center">
                              {platformStats.totalLearners && (
                                <VStack gap={1} textAlign="center">
                                  <Heading size="lg">
                                    <CountUpNumber
                                      end={platformStats.totalLearners}
                                      suffix="+"
                                      locale={i18n.language}
                                    />
                                  </Heading>
                                  <Text opacity={0.85}>
                                    {t("home.stats.students", { defaultValue: "Learners coached" })}
                                  </Text>
                                </VStack>
                              )}
                              {platformStats.consistencyImprovedPercent && (
                                <VStack gap={1} textAlign="center">
                                  <Heading size="lg">
                                    <CountUpNumber
                                      end={platformStats.consistencyImprovedPercent}
                                      suffix="%+"
                                      locale={i18n.language}
                                    />
                                  </Heading>
                                  <Text opacity={0.85}>
                                    {t("home.stats.profitability", {
                                      defaultValue: "Report improved consistency",
                                    })}
                                  </Text>
                                </VStack>
                              )}
                            </SimpleGrid>
                          </Box>
                        </SpotlightCard>
                      </MotionBox>
                    </ParallaxSection>
                  )}

                {/* Banner */}
                <ParallaxSection speed={0.35}>
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <BannerCarousel />
                  </MotionBox>
                </ParallaxSection>

                {/* Leaderboard */}
                <ParallaxSection speed={0.35}>
                  <SpotlightCard>
                    <Box p={6}>
                      <VStack spacing={6} align="stretch">
                        <MotionBox
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7 }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <VStack spacing={2} align="center">
                            <HStack>
                              <Icon as={Trophy} boxSize={8} color="#65a8bf" />
                              <Heading size="xl" bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
                                {t("leaderboard.title") || "Top Students"}
                              </Heading>
                            </HStack>
                            <Text fontSize="lg" textAlign="center" opacity={0.9} color="#65a8bf">
                              {t(
                                "leaderboard.subtitle",
                                "See who's leading the way in trading mastery"
                              )}
                            </Text>
                          </VStack>
                        </MotionBox>
                        <MotionBox
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <Box display="flex" justifyContent="center">
                            <LeaderboardOnboarding isNewUser={isNewUser} />
                          </Box>
                        </MotionBox>
                        <MotionBox
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: 0.3 }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <Leaderboard />
                        </MotionBox>
                      </VStack>
                    </Box>
                  </SpotlightCard>
                </ParallaxSection>

                {/* Reviews Carousel */}
                <ParallaxSection speed={0.4}>
                  <Box py={{ base: 10, md: 14 }}>
                    <MotionBox
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Heading
                        textAlign="center"
                        mb={6}
                        bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                        bgClip="text"
                        fontSize={{ base: "3xl", md: "4xl" }}
                      >
                        {t("home.trustpilot.title") ||
                          "Loved for the coaching — trusted for the reasoning"}
                      </Heading>
                    </MotionBox>

                    <MotionBox
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Box
                        bg="bg.surface"
                        border="1px solid"
                        borderColor="#65a8bf"
                        borderRadius="20px"
                        position="relative"
                        overflow="hidden"
                        px={{ base: 2, md: 4 }}
                        py={{ base: 4, md: 6 }}
                      >
                        <MotionBox
                          role="list"
                          display="flex"
                          gap={4}
                          animate={{ x: ["0%", "-50%"] }}
                          transition={{ duration: reviewsCarouselDuration, ease: "linear", repeat: Infinity }}
                          style={{ direction: "ltr", whiteSpace: "nowrap" }}
                        >
                          {[...reviewsToShow, ...reviewsToShow].map((r, i) => (
                            <Box key={i} style={{ display: "inline-block", direction: "ltr" }}>
                              <ReviewCard review={r} />
                            </Box>
                          ))}
                        </MotionBox>
                      </Box>
                    </MotionBox>
                  </Box>
                </ParallaxSection>

                {/* App Showcase Section */}
                <ParallaxSection speed={0.4}>
                  <Box py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      borderRadius="full"
                      bgGradient="radial(circle, rgba(101, 168, 191, 0.1) 0%, transparent 70%)"
                      pointerEvents="none"
                    />
                    
                    <Container maxW="1200px">
                      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 10, md: 16 }} alignItems="center">
                        <MotionBox
                          initial={{ opacity: 0, x: -50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8 }}
                          viewport={{ once: true, amount: 0.3 }}
                          textAlign={{ base: "center", lg: "left" }}
                        >
                          <Badge
                            bg="rgba(101, 168, 191, 0.15)"
                            color="#65a8bf"
                            px={4}
                            py={2}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="600"
                            mb={4}
                            mx={{ base: "auto", lg: 0 }}
                          >
                            {t("home.app.badge") || "Coming Soon"}
                          </Badge>
                          
                          <Heading
                            fontSize={{ base: "3xl", md: "5xl" }}
                            fontWeight="bold"
                            mb={6}
                            lineHeight="1.1"
                          >
                            <Text as="span" bgGradient="linear(to-r, #65a8bf, #b7a27d)" bgClip="text">
                              {t("home.app.title") || "The promrkts Companion App"}
                            </Text>
                          </Heading>
                          
                          <Text fontSize={{ base: "lg", md: "xl" }} mb={8} lineHeight="1.8">
                            {t("home.app.description") || "A revolutionary social platform built exclusively for traders. Connect, learn, and grow with our proprietary Fear & Greed Index, private chat rooms, and community-driven insights."}
                          </Text>
                          
                          <VStack align={{ base: "center", lg: "start" }} gap={4} mb={10}>
                            {[
                              { icon: BarChart3, key: "fearGreed", fallback: "Proprietary Fear & Greed Index — real-time market sentiment at your fingertips" },
                              { icon: MessageCircle, key: "chatRooms", fallback: "Private chat rooms & groups to discuss pairs and strategies" },
                              { icon: Handshake, key: "connect", fallback: "Revolutionary approach to connecting traders worldwide" },
                              { icon: Smartphone, key: "companion", fallback: "Your trading companion — alerts, journals, and insights on the go" },
                            ].map((feature, i) => (
                              <MotionBox
                                key={feature.key}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                              >
                                <HStack gap={4} align="flex-start" w="full" justify={{ base: "center", lg: "flex-start" }}>
                                  <Box
                                    w="50px"
                                    h="50px"
                                    borderRadius="xl"
                                    bg="rgba(101, 168, 191, 0.1)"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                  >
                                    <Icon as={feature.icon} boxSize={6} color={UI.accent} />
                                  </Box>
                                  <Text fontSize={{ base: "sm", md: "md" }} pt={2} textAlign="start">
                                    {t(`home.app.features.${feature.key}`) || feature.fallback}
                                  </Text>
                                </HStack>
                              </MotionBox>
                            ))}
                          </VStack>
                          
                          <HStack
                            gap={3}
                            w="100%"
                            maxW={{ base: "100%", md: "400px" }}
                            justify={{ base: "center", md: "space-between" }}
                            flexWrap="wrap"
                          >
                            <MotionBox
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChakraLink
                                href="#"
                                isExternal
                                _hover={{ textDecoration: "none" }}
                                display="block"
                              >
                                <Box
                                  w={{ base: "160px", md: "180px" }}
                                  h="60px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Image
                                    src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1705363200"
                                    alt="Download on the App Store"
                                    maxW="100%"
                                    maxH="100%"
                                    objectFit="contain"
                                  />
                                </Box>
                              </ChakraLink>
                            </MotionBox>
                            
                            <MotionBox
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChakraLink
                                href="#"
                                isExternal
                                _hover={{ textDecoration: "none" }}
                                display="block"
                              >
                                <Box
                                  w={{ base: "160px", md: "180px" }}
                                  h="60px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Image
                                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                                    alt="Get it on Google Play"
                                    maxW="100%"
                                    maxH="100%"
                                    objectFit="contain"
                                  />
                                </Box>
                              </ChakraLink>
                            </MotionBox>
                          </HStack>
                        </MotionBox>
                        
                        <MotionBox
                          initial={{ opacity: 0, x: 50, rotateY: -15 }}
                          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          viewport={{ once: true, amount: 0.3 }}
                          display="flex"
                          justifyContent="center"
                          position="relative"
                        >
                          <Box
                            position="relative"
                            w={{ base: "240px", md: "340px" }}
                            h={{ base: "520px", md: "736px" }}
                          >
                            <Box
                              position="absolute"
                              top="-20px"
                              left="-20px"
                              right="-20px"
                              bottom="-20px"
                              borderRadius="60px"
                              bgGradient="linear(135deg, #65a8bf 0%, #b7a27d 100%)"
                              opacity={0.2}
                              filter="blur(40px)"
                            />
                            
                            {/* iPhone 14 Pro Frame */}
                            <Box
                              position="relative"
                              w="100%"
                              h="100%"
                              borderRadius="45px"
                              bg="#1d1d1f"
                              p="8px"
                              boxShadow="0 50px 100px -20px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255,255,255,0.1)"
                            >
                              {/* Screen */}
                              <Box
                                w="100%"
                                h="100%"
                                borderRadius="38px"
                                bg="black"
                                overflow="hidden"
                                position="relative"
                              >
                                
                                {/* Screenshot Carousel */}
                                <Box
                                  w="100%"
                                  h="100%"
                                  bg="linear-gradient(180deg, #0a0f1a 0%, #050810 100%)"
                                  position="relative"
                                  overflow="hidden"
                                >
                                  {screenshots.map((src, idx) => (
                                    <MotionBox
                                      key={idx}
                                      position="absolute"
                                      top={0}
                                      left={0}
                                      w="100%"
                                      h="100%"
                                      initial={{ opacity: 0 }}
                                      animate={{ 
                                        opacity: currentSlide === idx ? 1 : 0,
                                        scale: currentSlide === idx ? 1 : 1.05,
                                      }}
                                      transition={{ duration: 0.7, ease: "easeInOut" }}
                                    >
                                      <Image
                                        src={src}
                                        alt={`promrkts app screenshot ${idx + 1}`}
                                        w="100%"
                                        h="100%"
                                        objectFit="contain"
                                        objectPosition="center"
                                        fallback={
                                          <Box
                                            w="100%"
                                            h="100%"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            p={6}
                                          >
                                            <VStack gap={4}>
                                              <Box
                                                w="80px"
                                                h="80px"
                                                borderRadius="2xl"
                                                bgGradient="linear(135deg, #65a8bf, #b7a27d)"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                boxShadow="0 10px 30px rgba(101, 168, 191, 0.3)"
                                              >
                                                <Text fontSize="3xl" fontWeight="bold" color="white">P</Text>
                                              </Box>
                                              <Text fontSize="sm" color="gray.600" textAlign="center">
                                                Screenshot {idx + 1}
                                              </Text>
                                            </VStack>
                                          </Box>
                                        }
                                      />
                                    </MotionBox>
                                  ))}
                                  
                                  {/* Carousel indicators */}
                                  <HStack
                                    position="absolute"
                                    bottom="20px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    gap={2}
                                    zIndex={5}
                                  >
                                    {screenshots.map((_, idx) => (
                                      <Box
                                        key={idx}
                                        w={currentSlide === idx ? "24px" : "8px"}
                                        h="8px"
                                        borderRadius="full"
                                        bg={currentSlide === idx ? "#65a8bf" : "rgba(255,255,255,0.3)"}
                                        transition="all 0.3s"
                                        cursor="pointer"
                                        onClick={() => setCurrentSlide(idx)}
                                      />
                                    ))}
                                  </HStack>
                                </Box>
                              </Box>
                              
                              {/* Side buttons */}
                              <Box
                                position="absolute"
                                left="-2px"
                                top="140px"
                                w="3px"
                                h="60px"
                                bg="#1d1d1f"
                                borderRadius="0 2px 2px 0"
                              />
                              <Box
                                position="absolute"
                                left="-2px"
                                top="210px"
                                w="3px"
                                h="60px"
                                bg="#1d1d1f"
                                borderRadius="0 2px 2px 0"
                              />
                              <Box
                                position="absolute"
                                right="-2px"
                                top="180px"
                                w="3px"
                                h="90px"
                                bg="#1d1d1f"
                                borderRadius="2px 0 0 2px"
                              />
                            </Box>
                          </Box>
                        </MotionBox>
                      </Grid>
                    </Container>
                  </Box>
                </ParallaxSection>

                {/* Value Proposition - Why Choose Us */}
                <ParallaxSection speed={0.3}>
                  <Container maxW="container.xl">
                    <ValueProposition t={t} />
                  </Container>
                </ParallaxSection>

                {/* Trust Signals */}
                <ParallaxSection speed={0.2}>
                  <Container maxW="container.xl">
                    <TrustSignals t={t} />
                  </Container>
                </ParallaxSection>

                {/* FAQ */}
                <ParallaxSection speed={0.3}>
                  <Box py={{ base: 16, md: 24 }}>
                    <MotionBox
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <VStack spacing={4} textAlign="center" mb={{ base: 12, md: 16 }}>
                        <Heading 
                          fontSize={{ base: "2.5rem", md: "3.5rem" }} 
                          letterSpacing="-0.03em" 
                          fontWeight="700"
                          bgGradient="linear(to-r, #65a8bf, #b7a27d)" 
                          bgClip="text"
                        >
                          {t("home.faq.title") || "Frequently Asked Questions"}
                        </Heading>
                        <Text maxW="xl" fontSize={{ base: "md", md: "lg" }}>
                          {t("home.faq.subtitle") ||
                            "Find quick answers below. Still stuck? Reach out — we're happy to help."}
                        </Text>
                      </VStack>
                    </MotionBox>
                    <VStack gap={4} align="stretch" maxW="800px" mx="auto">
                      {faqItems.map((item, idx) => (
                        <MotionBox
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.08 }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <FaqRow q={item.q} a={item.a} index={idx} />
                        </MotionBox>
                      ))}
                    </VStack>
                  </Box>
                </ParallaxSection>

                {/* Closing CTA - Premium */}
                <ParallaxSection speed={0.5}>
                  <Box py={{ base: 16, md: 24 }}>
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Box 
                        mb={{ base: 10, md: 14 }} 
                        px={{ base: 4, md: 0 }}
                        position="relative"
                      >
                        {/* Gradient glow behind image */}
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          w="80%"
                          h="80%"
                          bgGradient="radial(ellipse at center, rgba(101, 168, 191, 0.15), transparent 70%)"
                          filter="blur(60px)"
                          pointerEvents="none"
                        />
                        <Image
                          src={
                            isAR
                              ? "/images/rand/start-trading-cta-ar.png"
                              : isFR
                                ? "/images/rand/start-trading-cta-fr.png"
                                : "/images/rand/start-trading-cta.png"
                          }
                          alt={
                            isAR
                              ? "ابدأ التداول الآن — تعليم احترافي لكل المستويات"
                              : t("home.cta.image_alt") ||
                                "Start trading — premium education for every level"
                          }
                          w="60%"
                          maxW="container.md"
                          mx="auto"
                          objectFit="cover"
                          loading="lazy"
                          position="relative"
                        />
                      </Box>
                    </MotionBox>
                    <MotionBox
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeIn}
                    >
                      <VStack gap={8} align="center" textAlign="center" maxW="2xl" mx="auto">
                        <Text
                          color={UI.accent}
                          fontWeight="600"
                          fontSize={{ base: "sm", md: "md" }}
                          textTransform="uppercase"
                          letterSpacing="2px"
                        >
                          {t("home.cta.kicker") || "Ready to Learn?"}
                        </Text>
                        <Heading 
                          fontSize={{ base: "2.5rem", md: "3.5rem", lg: "4rem" }} 
                          letterSpacing="-0.03em"
                          fontWeight="700"
                          lineHeight="1.1"
                          bgGradient="linear(to-r, #65a8bf, #b7a27d)" 
                          bgClip="text"
                        >
                          {t("home.cta.title") || "Start Your Learning Journey Today"}
                        </Heading>
                        <Text fontSize={{ base: "md", md: "lg" }} maxW="xl" lineHeight="1.8">
                          {t("home.cta.subtitle") ||
                            "Join learners globally and access our premium course library."}
                        </Text>
                        <HStack gap={4} wrap="wrap" justify="center" pt={4}>
                          <Button
                            size="lg"
                            bg={UI.gradient}
                            color="#0a0f1a"
                            fontWeight="700"
                            px={8}
                            borderRadius="14px"
                            boxShadow={UI.glowStrong}
                            _hover={{ transform: "translateY(-2px)", boxShadow: "0 0 100px rgba(101, 168, 191, 0.35)" }}
                            transition="all 0.3s"
                            onClick={() => navigate("/products")}
                          >
                            {t("home.cta.primary") || "Browse Courses"}
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            borderColor={UI.borderAccent}
                            borderWidth="2px"
                            color={UI.accent}
                            fontWeight="600"
                            px={8}
                            borderRadius="14px"
                            _hover={{ transform: "translateY(-2px)", bg: "rgba(101, 168, 191, 0.08)" }}
                            transition="all 0.3s"
                            onClick={() => navigate("/contact")}
                          >
                            {t("home.cta.secondary") || "Contact Us"}
                          </Button>
                        </HStack>
                      </VStack>
                    </MotionBox>
                  </Box>
                </ParallaxSection>

                </>)}
              </>
            )}
          {/* TradingView Pro Indicator */}
          <Box my={{ base: 8, md: 14 }} px={{ base: 4, md: 0 }}>
            <Box
              p={{ base: 6, md: 10 }}
              borderRadius="28px"
              bg={UI.surfaceLight}
              border="1px solid"
              borderColor={UI.border}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-40%"
                right="-10%"
                w="60%"
                h="120%"
                bgGradient="radial(ellipse at center, rgba(101, 168, 191, 0.06), transparent 70%)"
                pointerEvents="none"
              />
              <VStack spacing={6} position="relative" align="stretch">
                <VStack spacing={2} textAlign="center">
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                    bgClip="text"
                    fontWeight="700"
                  >
                    {t("home.indicator.title", "promrkts TradingView Indicator")}
                  </Heading>
                  <Text maxW="2xl" fontSize={{ base: "sm", md: "md" }} opacity={0.85}>
                    {t("home.indicator.subtitle", "Our proprietary indicator applies the exact strategy we teach — built for TradingView, designed for precision. Choose the setting that matches your trading style.")}
                  </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                  {/* Swing */}
                  <Box
                    as="a"
                    href="/products/indicators?tab=swing"
                    p={5}
                    borderRadius="18px"
                    bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                    border="1px solid"
                    borderColor={UI.border}
                    _hover={{ borderColor: "#65a8bf", transform: "translateY(-2px)", cursor: "pointer" }}
                    transition="all 0.3s"
                    textDecoration="none"
                  >
                    <VStack spacing={3} align="start">
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <Box w="10px" h="10px" borderRadius="full" bg="#65a8bf" />
                          <Text fontWeight="700" fontSize="md">
                            {t("home.indicator.swing.title", "Swing")}
                          </Text>
                        </HStack>
                        <Badge bg="rgba(101, 168, 191, 0.15)" color="#65a8bf" fontSize="xs" borderRadius="full">
                          $39/mo
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("home.indicator.swing.desc", "Designed for traders who hold positions for days to weeks. Captures larger market moves with fewer signals, ideal for those who prefer a patient, high-conviction approach.")}
                      </Text>
                      <Badge colorScheme="blue" fontSize="xs" borderRadius="full">
                        {t("home.indicator.swing.timeframe", "4H — Weekly")}
                      </Badge>
                    </VStack>
                  </Box>

                  {/* Scalp */}
                  <Box
                    as="a"
                    href="/products/indicators?tab=scalp"
                    p={5}
                    borderRadius="18px"
                    bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                    border="1px solid"
                    borderColor={UI.border}
                    _hover={{ borderColor: "#b7a27d", transform: "translateY(-2px)", cursor: "pointer" }}
                    transition="all 0.3s"
                    textDecoration="none"
                  >
                    <VStack spacing={3} align="start">
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <Box w="10px" h="10px" borderRadius="full" bg="#b7a27d" />
                          <Text fontWeight="700" fontSize="md">
                            {t("home.indicator.scalp.title", "Scalp")}
                          </Text>
                        </HStack>
                        <Badge bg="rgba(183, 162, 125, 0.15)" color="#b7a27d" fontSize="xs" borderRadius="full">
                          $29/mo
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("home.indicator.scalp.desc", "Built for fast-paced traders targeting quick entries and exits. Generates frequent signals on lower timeframes for those who thrive in volatile, short-term conditions.")}
                      </Text>
                      <Badge colorScheme="orange" fontSize="xs" borderRadius="full">
                        {t("home.indicator.scalp.timeframe", "1M — 15M")}
                      </Badge>
                    </VStack>
                  </Box>

                  {/* Daily */}
                  <Box
                    as="a"
                    href="/products/indicators?tab=daily"
                    p={5}
                    borderRadius="18px"
                    bg={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                    border="1px solid"
                    borderColor={UI.border}
                    _hover={{ borderColor: "#65a8bf", transform: "translateY(-2px)", cursor: "pointer" }}
                    transition="all 0.3s"
                    textDecoration="none"
                  >
                    <VStack spacing={3} align="start">
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <Box w="10px" h="10px" borderRadius="full" bg="linear-gradient(135deg, #65a8bf, #b7a27d)" />
                          <Text fontWeight="700" fontSize="md">
                            {t("home.indicator.daily.title", "Daily")}
                          </Text>
                        </HStack>
                        <Badge bg="rgba(101, 168, 191, 0.15)" color="#65a8bf" fontSize="xs" borderRadius="full">
                          $34/mo
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" opacity={0.8}>
                        {t("home.indicator.daily.desc", "The balanced middle ground — one clean signal per day based on daily candle structure. Perfect for traders who want clarity without constant screen time.")}
                      </Text>
                      <Badge colorScheme="teal" fontSize="xs" borderRadius="full">
                        {t("home.indicator.daily.timeframe", "1H — Daily")}
                      </Badge>
                    </VStack>
                  </Box>
                </SimpleGrid>

                <VStack spacing={3} textAlign="center" pt={2}>
                  <Button
                    as="a"
                    href="/products/indicators"
                    size="lg"
                    bg={UI.gradient}
                    color="#0a0f1a"
                    fontWeight="700"
                    px={10}
                    borderRadius="14px"
                    boxShadow={UI.glow}
                    _hover={{ transform: "translateY(-2px)", boxShadow: UI.glowStrong }}
                    transition="all 0.3s"
                  >
                    {t("home.indicator.cta", "View All Indicators & Pricing")}
                  </Button>
                  <Text fontSize="xs" opacity={0.5} maxW="lg">
                    {t("home.indicator.note", "These indicators do not guarantee profits — they are tools to support your analysis using our methodology.")}
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>

          {/* Broker CTA — always at the very bottom */}
          <Box my={{ base: 8, md: 14 }} px={{ base: 4, md: 0 }}>
            <Box
              textAlign="center"
              p={{ base: 8, md: 12 }}
              borderRadius="28px"
              bg={UI.surfaceLight}
              border="1px solid"
              borderColor={UI.border}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-50%"
                left="50%"
                transform="translateX(-50%)"
                w="120%"
                h="100%"
                bgGradient="radial(ellipse at center, rgba(101, 168, 191, 0.08), transparent 60%)"
                pointerEvents="none"
              />
              <VStack spacing={4} position="relative">
                <Heading
                  size="lg"
                  bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                  bgClip="text"
                  fontWeight="700"
                >
                  {t("home.enrolled.broker_title", {
                    defaultValue: "Trade With Our Preferred Broker",
                  })}
                </Heading>
                <Text maxW="md" fontSize={{ base: "sm", md: "md" }}>
                  {t("home.enrolled.broker_sub", {
                    defaultValue: "Tight spreads, ECN execution, and fast withdrawals.",
                  })}
                </Text>
                <Button
                  size="lg"
                  bg={UI.gradient}
                  color="#0a0f1a"
                  fontWeight="700"
                  px={10}
                  borderRadius="14px"
                  boxShadow={UI.glow}
                  _hover={{ transform: "translateY(-2px)", boxShadow: UI.glowStrong }}
                  transition="all 0.3s"
                  onClick={() => window.open("/broker", "_self")}
                >
                  {t("home.enrolled.broker_cta", {
                    defaultValue: "Join Our Broker",
                  })}
                </Button>
              </VStack>
            </Box>
          </Box>

          </Container>
          <SpinningWheel isOpen={spinOpen} onClose={() => setSpinOpen(false)} />
          
          {/* Sticky CTA - appears on scroll for non-enrolled users */}
          {!isEnrolled && <StickyCTA t={t} onNavigate={() => navigate("/products")} />}
        </Box>
      </Box>
    </MotionBox>
  );
};

export default Home;
