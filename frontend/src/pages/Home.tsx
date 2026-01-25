// src/pages/Home.tsx — Premium AI Trading + Course Startup Redesign
/* eslint-disable */
import React from "react";
import "../styles/fonts.css";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
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
  TabPanels,
  Tab,
  TabPanel,
  Link as ChakraLink,
  Image,
  Icon,
  Badge,
  useToast,
  Stack,
  Select,
  Input,
  FormControl,
  FormErrorMessage,
  IconButton, // ✅ add this
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import api, { getMyPurchases } from "../api/client";
import BannerCarousel from "../components/BannerCarousel";
import { useThemeMode } from "../themeProvider";
import { Star, Trophy, Maximize2, Minimize2 } from "lucide-react";
import Hero from "../components/Hero";
import { useSessionMemory } from "../hooks/useSessionMemory";
import CryptoMatrix from "../components/CryptoMatrix";
import ForexMatrix from "../components/ForexMatrix";
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

const FloatingEmojiLayer: React.FC<{ count?: number; mode: string }> = ({ count = 18, mode }) => {
  const items = React.useMemo(() => {
    const emojis = ["📈", "💹", "🪙", "💰", "🔥", "⚡️", "🚀", "📉", "💵"];
    return Array.from({ length: count }).map((_, i) => {
      const emoji = emojis[i % emojis.length];
      const left = Math.random() * 100;
      const size = 14 + Math.random() * 22;
      const duration = 10 + Math.random() * 10;
      const delay = Math.random() * 8;
      const drift = (Math.random() - 0.5) * 80;
      return { id: i, emoji, left, size, duration, delay, drift };
    });
  }, [count]);

  const opacity = mode === "dark" ? 0.32 : 0.18;

  return (
    <Box position="absolute" inset={0} zIndex={0} pointerEvents="none" overflow="hidden">
      {items.map((it) => (
        <MotionBox
          key={it.id}
          position="absolute"
          left={`${it.left}%`}
          bottom="-10vh"
          fontSize={`${it.size}px`}
          style={{ opacity, filter: mode === "dark" ? "blur(0px)" : "blur(0.2px)" }}
          animate={{
            y: ["0vh", "-125vh"],
            x: [0, it.drift],
            rotate: [0, 6, -6, 0],
          }}
          transition={{
            duration: it.duration,
            delay: it.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {it.emoji}
        </MotionBox>
      ))}
    </Box>
  );
};

type AppleRevealOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];
const APPLE_REVEAL_DEFAULT_OFFSET: AppleRevealOffset = ["start 100%", "end 70%"]; 

const AppleReveal: React.FC<{ children: React.ReactNode; offset?: AppleRevealOffset }> = ({ children, offset }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: offset ?? APPLE_REVEAL_DEFAULT_OFFSET });

  const y = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [2.5, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 1], [0, 1, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  const filter = useTransform(blur, (b: number) => `blur(${b}px)`);

  return (
    <Box ref={ref}>
      <MotionBox style={{ y, opacity, scale, filter }}>
        {children}
      </MotionBox>
    </Box>
  );
};

// ===== UI Brand Tokens =====
const UI = {
  bg: "#050811",
  surface: "rgba(15, 23, 42, 0.72)", // glass
  surfaceStrong: "rgba(15, 23, 42, 0.92)",
  border: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.65)",
  text: "#EAFBF2",
  accent: "#65a8bf", // your brand green
  glow: "0 0 40px rgba(0,191,99,0.22)",
  gradHero:
    "radial-gradient(1000px 600px at 10% 10%, rgba(0,191,99,0.20), transparent 60%)," +
    "radial-gradient(900px 500px at 90% 20%, rgba(0,191,99,0.20), transparent 55%)," +
    "radial-gradient(800px 500px at 50% 90%, rgba(59,130,246,0.12), transparent 60%)," +
    "linear-gradient(180deg, #050811 0%, #050811 100%)",
};


// ===== Prop Firm + Token (UI copy only; not financial advice) =====
const BRAND = {
  guidesLabel: "Guides",
  communitiesLabel: "Communities",
  tradingFloorLabel: "Trading Floor (Discord)",
  tokenLabel: "Tokens"
};

const HomeSection: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, subtitle, children, id }) => (
  <Box py={{ base: 14, md: 18 }} id={id}>
    <VStack spacing={3} textAlign="center" mb={{ base: 10, md: 12 }}>
      <Heading fontSize={{ base: "3xl", md: "5xl" }} letterSpacing="-0.045em" fontWeight="650">
        {title}
      </Heading>
      {subtitle && (
        <Text opacity={0.72} maxW="3xl" fontSize={{ base: "md", md: "lg" }} lineHeight="1.7">
          {subtitle}
        </Text>
      )}
    </VStack>
    {children}
  </Box>
);

const StickyStory: React.FC<{
  title: string;
  steps: { title: string; body: string }[];
}> = ({ title, steps }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const active = useTransform(scrollYProgress, [0, 1], [0, steps.length - 1]);
  const rotateY = useTransform(scrollYProgress, (p: number) => `${(p - 0.5) * 12}deg`);
  const rotateX = useTransform(scrollYProgress, (p: number) => `${(0.5 - p) * 8}deg`);
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const unsub = scrollYProgress.on("change", (p: number) => {
      const idx = Math.round(p * Math.max(0, steps.length - 1));
      setActiveStep(Math.max(0, Math.min(steps.length - 1, idx)));
    });
    return () => {
      unsub();
    };
  }, [scrollYProgress, steps.length]);

  return (
    <Box ref={ref} position="relative" py={{ base: 16, md: 24 }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 10, md: 14 }} alignItems="start">
        {/* Sticky visual */}
        <Box position={{ base: "relative", md: "sticky" }} top={{ md: "14vh" }}>
          <TiltCard>
            <Heading size="lg" letterSpacing="-0.04em">
              {title}
            </Heading>
            <Text mt={2} opacity={0.8}>
              A single visual that evolves as you scroll.
            </Text>

            {/* “3D” mock visual */}
            <MotionBox
              mt={6}
              h={{ base: "260px", md: "380px" }}
              borderRadius="20px"
              bg="rgba(0,191,99,0.10)"
              border="1px solid rgba(0,191,99,0.25)"
              style={{
                transformStyle: "preserve-3d",
                rotateY,
                rotateX,
              }}
            />
          </TiltCard>
        </Box>

        {/* Steps */}
        <VStack align="stretch" spacing={4}>
          {steps.map((s, i) => (
            <MotionBox
              key={s.title}
              animate={{ opacity: activeStep === i ? 1 : 0.45, scale: activeStep === i ? 1 : 0.98 }}
              transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
            >
              <Box
                p={5}
                borderRadius="20px"
                border="1px solid rgba(255,255,255,0.10)"
                bg="rgba(15,23,42,0.55)"
              >
                <Heading size="md" mb={1}>
                  {s.title}
                </Heading>
                <Text opacity={0.85}>{s.body}</Text>
              </Box>
            </MotionBox>
          ))}
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

const TiltCard: React.FC<{
  children: React.ReactNode;
  strength?: number;
  bg?: string;
  border?: string;
}> = ({ children, strength = 12, bg = UI.surface, border = UI.border }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const scale = useMotionValue(1);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    ry.set((px - 0.5) * strength);
    rx.set(-(py - 0.5) * strength);
  };

  const onEnter = () => scale.set(1.02);
  const onLeave = () => {
    scale.set(1);
    rx.set(0);
    ry.set(0);
  };

  return (
    <MotionBox
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        scale,
        transformStyle: "preserve-3d",
      }}
      transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      borderRadius="24px"
      bg={bg}
      border="1px solid"
      borderColor={border}
      boxShadow="0 20px 50px rgba(0,0,0,0.35)"
      p={{ base: 5, md: 6 }}
    >
      <Box style={{ transform: "translateZ(20px)" }}>{children}</Box>
    </MotionBox>
  );
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

const GradualFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 50, 0]);

  return (
    <MotionBox ref={ref} style={{ opacity, y }}>
      {children}
    </MotionBox>
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
  const symbolsFX = React.useMemo(
    () => [
      "OANDA:XAUUSD",
      "FX:EURUSD",
      "FX:GBPUSD",
      "FX:USDJPY",
      "FX:USDCHF",
      "FX:USDCAD",
      "FX:AUDUSD",
      "FX:NZDUSD",
      "FX:EURGBP",
      "FX:EURJPY",
      "FX:EURCHF",
      "FX:EURCAD",
      "FX:EURAUD",
      "FX:EURNZD",
      "FOREXCOM:SPXUSD",
      "FOREXCOM:NSXUSD",
    ],
    []
  );

  const symbolsCR = React.useMemo(
    () => ["COINBASE:BTCUSD", "COINBASE:ETHUSD", "BINANCE:SOLUSDT", "COINBASE:XRPUSD"],
    []
  );

  const themeRTW = React.useMemo(
    () => (mode === "dark" ? "dark" : "light") as "dark" | "light",
    [mode]
  );

  const paddingY = hideHeader ? { base: 0, md: 0 } : { base: 6, md: 10 };

  // Layout: 2x2 / 3x3 / 4x4
  const [gridN, setGridN] = React.useState<number>(() => {
    const stored = Number(localStorage.getItem("mbGridN") || 2);
    return stored === 3 || stored === 4 ? stored : 2;
  });

  const [tabIndex, setTabIndex] = React.useState(() =>
    Number(localStorage.getItem("mbTabIndex") || 0)
  );

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
    (symbols: string[], prefix: string) => {
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const key = `${prefix}_${gridN}_${i}`;
        const stored = localStorage.getItem(key);
        const fallback = symbols[i % symbols.length];
        out.push(stored && symbols.includes(stored) ? stored : fallback);
      }
      return out;
    },
    [count, gridN]
  );

  const [fxSymbolsState, setFxSymbolsState] = React.useState<string[]>(() =>
    makeDefaultSymbols(symbolsFX, "mbFxSymbol")
  );

  const [crSymbolsState, setCrSymbolsState] = React.useState<string[]>(() =>
    makeDefaultSymbols(symbolsCR, "mbCrSymbol")
  );

  // When grid size changes, rebuild symbol arrays (and persist gridN)
  React.useEffect(() => {
    localStorage.setItem("mbGridN", String(gridN));
    setFxSymbolsState(makeDefaultSymbols(symbolsFX, "mbFxSymbol"));
    setCrSymbolsState(makeDefaultSymbols(symbolsCR, "mbCrSymbol"));
  }, [gridN, makeDefaultSymbols, symbolsFX, symbolsCR]);

  // Fullscreen single chart
  const [fullscreen, setFullscreen] = React.useState<null | { tab: "fx" | "cr"; idx: number }>(
    null
  );

  // Fullscreen the whole grid (wall)
  const [wallFullscreen, setWallFullscreen] = React.useState(false);

  const setSymbolFor = React.useCallback(
    (tab: "fx" | "cr", idx: number, v: string) => {
      if (tab === "fx") {
        setFxSymbolsState((prev) => {
          const next = [...prev];
          next[idx] = v;
          localStorage.setItem(`mbFxSymbol_${gridN}_${idx}`, v);
          return next;
        });
      } else {
        setCrSymbolsState((prev) => {
          const next = [...prev];
          next[idx] = v;
          localStorage.setItem(`mbCrSymbol_${gridN}_${idx}`, v);
          return next;
        });
      }
    },
    [gridN]
  );

  const ChartCell: React.FC<{
    tab: "fx" | "cr";
    idx: number;
    symbols: string[];
    value: string;
    onChange: (v: string) => void;
    onFullscreen: () => void;
    isFullscreen?: boolean;
  }> = ({ tab, idx, symbols, value, onChange, onFullscreen, isFullscreen }) => {
    // IMPORTANT:
    // TradingView embed widgets often need a remount to apply config changes like hide_side_toolbar/hide_volume.
    const remountKey = `${tab}-${gridN}-${idx}-${themeRTW}-${hideSidebar ? 1 : 0}-${
      hideVolume ? 1 : 0
    }-${hideTop ? 1 : 0}-${interval}-${studies.join(",")}`;

    return (
      <Box position="relative" w="100%" h="100%" bg="rgba(5, 8, 17, 0.98)" overflow="hidden">
        {/* Selector overlay */}
        <Box position="absolute" top="10px" left="10px" zIndex={3} maxW="70%">
          <Select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size="sm"
            bg="rgba(0,0,0,0.55)"
            borderColor="rgba(255,255,255,0.12)"
            color="white"
            _hover={{ borderColor: "rgba(255,255,255,0.22)" }}
            _focus={{ borderColor: UI.accent, boxShadow: "0 0 0 1px rgba(0,191,99,0.35)" }}
          >
            {symbols.map((s) => (
              <option key={s} value={s} style={{ background: "#050811", color: "white" }}>
                {s.split(":")[1] || s}
              </option>
            ))}
          </Select>
        </Box>

        {/* Fullscreen toggle overlay */}
        <IconButton
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          icon={<Icon as={isFullscreen ? Minimize2 : Maximize2} />}
          onClick={onFullscreen}
          size="sm"
          position="absolute"
          top="10px"
          right="10px"
          zIndex={3}
          bg="rgba(0,0,0,0.55)"
          border="1px solid rgba(255,255,255,0.12)"
          color="white"
          _hover={{ bg: "rgba(0,0,0,0.75)" }}
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
            hide_legend={hideTop} // optional: keeps it clean when top is hidden
            {...({ hide_volume: hideVolume } as any)}
            {...({ studies } as any)}
            {...({ container_id: `tv-${tab}-${gridN}-${idx}` } as any)}
          />
        </Box>
      </Box>
    );
  };

  const GridHeader: React.FC<{ onFullscreenWall: () => void }> = ({ onFullscreenWall }) => (
    <HStack
      justify="space-between"
      align="center"
      flexWrap="wrap"
      gap={3}
      mb={3}
      w="100%"
      justifyContent="center"
    >
      {/* Layout */}
      <HStack gap={2} wrap="wrap" justify="center">
        {[2, 3, 4].map((n) => (
          <Button
            key={n}
            size="sm"
            variant={gridN === n ? "solid" : "outline"}
            bg={gridN === n ? UI.accent : "transparent"}
            color={gridN === n ? "black" : UI.accent}
            borderColor={UI.accent}
            onClick={() => setGridN(n)}
          >
            {n}×{n}
          </Button>
        ))}
      </HStack>

      {/* UI toggles */}
      <HStack gap={2} wrap="wrap" justify="center">
        <Button
          size="sm"
          variant={hideTop ? "solid" : "outline"}
          bg={hideTop ? UI.accent : "transparent"}
          color={hideTop ? "black" : UI.accent}
          borderColor={UI.accent}
          onClick={() => setHideTop((v) => !v)}
        >
          {hideTop ? "Top: Off" : "Top: On"}
        </Button>

        <Button
          size="sm"
          variant={hideSidebar ? "solid" : "outline"}
          bg={hideSidebar ? UI.accent : "transparent"}
          color={hideSidebar ? "black" : UI.accent}
          borderColor={UI.accent}
          onClick={() => setHideSidebar((v) => !v)}
        >
          {hideSidebar ? "Sidebar: Off" : "Sidebar: On"}
        </Button>

        <Button
          size="sm"
          variant={hideVolume ? "solid" : "outline"}
          bg={hideVolume ? UI.accent : "transparent"}
          color={hideVolume ? "black" : UI.accent}
          borderColor={UI.accent}
          onClick={() => setHideVolume((v) => !v)}
        >
          {hideVolume ? "Volume: Off" : "Volume: On"}
        </Button>

        {/* Timeline dropdown */}
        <Select
          value={interval}
          onChange={(e) => setInterval(e.target.value as TVInterval)}
          size="sm"
          maxW="130px"
          bg="rgba(0,0,0,0.35)"
          borderColor="rgba(255,255,255,0.14)"
          color="white"
        >
          {INTERVALS.map((x) => (
            <option key={x.value} value={x.value} style={{ background: "#050811", color: "white" }}>
              {x.label}
            </option>
          ))}
        </Select>

        {/* Indicators */}
        <Button
          size="sm"
          variant="outline"
          borderColor={UI.accent}
          color={UI.accent}
          onClick={() => setIndicatorsOpen((v) => !v)}
        >
          Indicators
        </Button>

        <Button
          size="sm"
          bg={UI.accent}
          color="black"
          boxShadow={UI.glow}
          onClick={onFullscreenWall}
        >
          Fullscreen Wall
        </Button>
      </HStack>
    </HStack>
  );

  const renderWall = (tab: "fx" | "cr", asFullscreenOverlay: boolean) => {
    const symbols = tab === "fx" ? symbolsFX : symbolsCR;
    const values = tab === "fx" ? fxSymbolsState : crSymbolsState;

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

            <Text mt={2} fontSize="xs" opacity={0.75}>
              Note: studies support depends on the TradingView widget wrapper. If these don’t
              appear, you’ll need the licensed Charting Library for full indicator UI.
            </Text>
          </Box>
        )}

        <Grid
          w="100%"
          h={asFullscreenOverlay ? "100vh" : { base: "75vh", md: "70vh", lg: "70vh" }}
          minH={asFullscreenOverlay ? "100vh" : "360px"}
          templateColumns={{
            base: `repeat(${Math.min(2, gridN)}, 1fr)`,
            md: `repeat(${gridN}, 1fr)`,
          }}
          templateRows={{ md: `repeat(${gridN}, 1fr)` }}
          gap={0}
          overflow="hidden"
          borderRadius={asFullscreenOverlay ? "0px" : "18px"}
          bg="rgba(5, 8, 17, 0.98)"
        >
          {Array.from({ length: count }).map((_, idx) => (
            <Box
              key={`${tab}-${idx}`}
              w="100%"
              h="100%"
              minH={asFullscreenOverlay ? "0px" : { base: "260px", md: "0px" }}
            >
              <ChartCell
                tab={tab}
                idx={idx}
                symbols={symbols}
                value={values[idx] || symbols[0]}
                onChange={(v) => setSymbolFor(tab, idx, v)}
                onFullscreen={() => setFullscreen({ tab, idx })}
              />
            </Box>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderFullscreenSingle = () => {
    if (!fullscreen) return null;

    const tab = fullscreen.tab;
    const idx = fullscreen.idx;
    const symbols = tab === "fx" ? symbolsFX : symbolsCR;
    const value = tab === "fx" ? fxSymbolsState[idx] : crSymbolsState[idx];

    return (
      <Box position="fixed" inset={0} zIndex={9999} bg="#000" overflow="hidden">
        <Box position="absolute" inset={0}>
          <ChartCell
            tab={tab}
            idx={idx}
            symbols={symbols}
            value={value || symbols[0]}
            onChange={(v) => setSymbolFor(tab, idx, v)}
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

    // fullscreen the currently selected tab wall
    const tab = tabIndex === 0 ? "fx" : "cr";

    return (
      <Box position="fixed" inset={0} zIndex={9998} bg="#000" overflow="hidden">
        {/* Wall */}
        <Box position="absolute" inset={0}>
          {renderWall(tab, true)}
        </Box>

        {/* Floating controls */}
        <HStack position="fixed" top="14px" left="14px" zIndex={10000} gap={2} wrap="wrap">
          <Button
            size="sm"
            variant={hideSidebar ? "solid" : "outline"}
            bg={hideSidebar ? UI.accent : "rgba(0,0,0,0.55)"}
            color={hideSidebar ? "black" : "white"}
            borderColor="rgba(255,255,255,0.18)"
            onClick={() => setHideSidebar((v) => !v)}
          >
            {hideSidebar ? "Sidebar: Off" : "Sidebar: On"}
          </Button>

          <Button
            size="sm"
            variant={hideVolume ? "solid" : "outline"}
            bg={hideVolume ? UI.accent : "rgba(0,0,0,0.55)"}
            color={hideVolume ? "black" : "white"}
            borderColor="rgba(255,255,255,0.18)"
            onClick={() => setHideVolume((v) => !v)}
          >
            {hideVolume ? "Volume: Off" : "Volume: On"}
          </Button>
          <Select
            value={interval}
            onChange={(e) => setInterval(e.target.value as TVInterval)}
            size="sm"
            maxW="120px"
            bg="rgba(0,0,0,0.55)"
            borderColor="rgba(255,255,255,0.18)"
            color="white"
          >
            {INTERVALS.map((x) => (
              <option
                key={x.value}
                value={x.value}
                style={{ background: "#050811", color: "white" }}
              >
                {x.label}
              </option>
            ))}
          </Select>

          <Button
            size="sm"
            variant="outline"
            borderColor="rgba(255,255,255,0.18)"
            color="white"
            onClick={() => setIndicatorsOpen((v) => !v)}
          >
            Indicators
          </Button>

          {[2, 3, 4].map((n) => (
            <Button
              key={n}
              size="sm"
              variant={gridN === n ? "solid" : "outline"}
              bg={gridN === n ? UI.accent : "rgba(0,0,0,0.55)"}
              color={gridN === n ? "black" : "white"}
              borderColor="rgba(255,255,255,0.18)"
              onClick={() => setGridN(n)}
            >
              {n}×{n}
            </Button>
          ))}
        </HStack>

        <IconButton
          aria-label="Exit wall fullscreen"
          icon={<Icon as={Minimize2} />}
          onClick={() => setWallFullscreen(false)}
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

      <Tabs
        index={tabIndex}
        onChange={(i) => {
          setTabIndex(i);
          localStorage.setItem("mbTabIndex", String(i));
        }}
        isFitted
        color="#65a8bf"
        variant="solid"
      >
        <TabList>
          <Tab
            _hover={{ bg: "rgba(104, 165, 191, .18)" }}
            _selected={{ bg: "rgba(104, 165, 191, .18)" }}
            borderWidth={"1px"}
            borderRadius={"2xl"}
          >
            Forex
          </Tab>
          <Tab
            _hover={{ bg: "rgba(104, 165, 191, .18)" }}
            _selected={{ bg: "rgba(104, 165, 191, .18)" }}
            borderWidth={"1px"}
            borderRadius={"2xl"}
          >
            Crypto
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={3}>{renderWall("fx", false)}</TabPanel>
          <TabPanel p={3}>{renderWall("cr", false)}</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
});

// ===== How It Works =====
const HowItWorks: React.FC<{ t: any }> = ({ t }) => (
  <Box py={{ base: 10, md: 14 }}>
    <Heading textAlign="center" mb={8}  fontSize={{ base: "2xl", md: "3xl" }}>
      {t("ai.how.title") || "How It Works"}
    </Heading>
    <SimpleGrid columns={{ base: 1, md: 4 }} gap={6} color="#65a8bf">
      {[
        {
          step: "01",
          title: t("ai.how.step1") || "Profile & Goals",
          desc: t("ai.how.step1_desc") || "Tell us your time, risk comfort, and objectives.",
        },
        {
          step: "02",
          title: t("ai.how.step2") || "Adaptive Lessons",
          desc: t("ai.how.step2_desc") || "Bite-size modules tuned to your pace in AR/FR/EN.",
        },
        {
          step: "03",
          title: t("ai.how.step3") || "Simulate & Practice",
          desc: t("ai.how.step3_desc") || "Run strategy sims with guided debriefs.",
        },
        {
          step: "04",
          title: t("ai.how.step4") || "Go Live (Optional)",
          desc: t("ai.how.step4_desc") || "Bridge to compliant brokers. Keep journaling with AI.",
        },
      ].map((s, i) =>
        i % 2 === 0 ? (
          <SpotlightCard key={i} spotlightColor={i === 0 ? "rgba(101, 168, 191, 0.22)" : "rgba(101, 168, 191, 0.14)"}>
            <Box p={6}>
              <VStack align="start" gap={2}>
                <Badge variant="outline" borderWidth="1px" borderColor="#65a8bf" color="#65a8bf">
                  {s.step}
                </Badge>
                <Heading size="md" color="#65a8bf">
                  {s.title}
                </Heading>
                <Text opacity={0.9}>{s.desc}</Text>
              </VStack>
            </Box>
          </SpotlightCard>
        ) : (
          <Box key={i} p={6} borderRadius="2xl" bg={UI.surface} border="1px solid" borderColor={UI.border}>
            <VStack align="start" gap={2}>
              <Badge variant="outline" borderWidth="1px" borderColor="#65a8bf" color="#65a8bf">
                {s.step}
              </Badge>
              <Heading size="md" color="#65a8bf">
                {s.title}
              </Heading>
              <Text opacity={0.9}>{s.desc}</Text>
            </VStack>
          </Box>
        )
      )}
    </SimpleGrid>
  </Box>
);

const FeaturePuzzle: React.FC<{
  title: string;
  subtitle?: string;
  mode: string;
  items: {
    title: string;
    body: string;
    emoji?: string;
    imageSrc?: string;
    colSpan?: { base?: number; md?: number };
  }[];
}> = ({ title, subtitle, mode, items }) => {
  const isDark = mode === "dark";
  return (
    <Box py={{ base: 14, md: 18 }}>
      <VStack spacing={3} textAlign="center" mb={{ base: 10, md: 12 }}>
        <Heading fontSize={{ base: "3xl", md: "5xl" }} letterSpacing="-0.045em" fontWeight="650">
          {title}
        </Heading>
        {subtitle && (
          <Text opacity={0.72} maxW="3xl" fontSize={{ base: "md", md: "lg" }} lineHeight="1.7">
            {subtitle}
          </Text>
        )}
      </VStack>

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(12, 1fr)" }}
        gap={{ base: 4, md: 5 }}
        alignItems="stretch"
      >
        {items.map((it, idx) => (
          <Box
            key={idx}
            gridColumn={{ base: "auto", md: `span ${it.colSpan?.md ?? 4}` }}
            borderRadius="24px"
            bg={isDark ? "rgba(15, 23, 42, 0.62)" : "rgba(255,255,255,0.65)"}
            border="1px solid"
            borderColor={isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}
            overflow="hidden"
          >
            <Box p={{ base: 5, md: 6 }}>
              <HStack justify="space-between" align="start" mb={3}>
                <Heading size="md" letterSpacing="-0.02em" color={isDark ? "white" : "gray.900"}>
                  {it.title}
                </Heading>
                {it.emoji && (
                  <Box fontSize={{ base: "22px", md: "26px" }} opacity={0.9} lineHeight={1}>
                    {it.emoji}
                  </Box>
                )}
              </HStack>
              <Text opacity={0.85} color={isDark ? "gray.200" : "gray.700"}>
                {it.body}
              </Text>
            </Box>

            {it.imageSrc ? (
              <Image src={it.imageSrc} alt={it.title} w="full" h={{ base: "180px", md: "220px" }} objectFit="cover" />
            ) : (
              <Box
                mx={{ base: 5, md: 6 }}
                mb={{ base: 5, md: 6 }}
                h={{ base: "180px", md: "220px" }}
                borderRadius="20px"
                bg={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
                border="1px dashed"
                borderColor={isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.14)"}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="sm" opacity={0.75}>
                  Drop screenshot here
                </Text>
              </Box>
            )}
          </Box>
        ))}
      </Grid>
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

// ===== FAQ Row =====
const FaqRow: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Box bg="bg.surface">
      <Button
        onClick={() => setOpen((v) => !v)}
        w="full"
        justifyContent="space-between"
        px={4}
        py={4}
        borderRadius="0"
      >
        <Box textAlign="start" fontWeight="semibold" flex="1" pr={3}>
          {q}
        </Box>
        <Box
          as="span"
          transition="transform 0.2s"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </Box>
      </Button>
      {open && (
        <MotionBox
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          overflow="hidden"
          borderTop="1px solid"
          borderColor={UI.glow}
          color="#65a8bf"
          bg="rgba(182, 233, 255,0.04)"
        >
          <Box px={4} py={4}>
            <Text>{a}</Text>
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

  // progress: 0 at top of Home, 1 near bottom of Home
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  const isDark = mode === "dark";

  // solid start color
  const startBg = isDark ? "rgba(5, 8, 17, 1)" : "rgba(255, 255, 255, 1)";

  // fully transparent end color (same RGB, alpha 0)
  const endBg = isDark ? "rgba(5, 8, 17, 0)" : "rgba(255, 255, 255, 0)";

  const bgFade = useTransform(scrollYProgress, [0, 0.75, 1], [startBg, endBg, endBg]);

  const toast = useToast();
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
  const { session } = useSessionMemory();

  const [showMarkets, setShowMarkets] = React.useState(true);
  const [showNews, setShowNews] = React.useState(true);
  const [showContinue, setShowContinue] = React.useState(true);
  const [showBadgesCard, setShowBadgesCard] = React.useState(true);
  const [showOffersCard, setShowOffersCard] = React.useState(true);

  const [badges, setBadges] = React.useState<any[] | null>(null);
  const [offers, setOffers] = React.useState<any[] | null>(null);
  const [loadingPersonalization, setLoadingPersonalization] = React.useState(false);
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
  const [loadingPlatformStats, setLoadingPlatformStats] = React.useState(false);

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

  const [learningStats, setLearningStats] = React.useState<{
    activePrograms?: number;
    streakDays?: number;
    hoursLast30?: number;
    completionPercent?: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(false);

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
  const canBuyEval = Boolean(entitlements?.canBuyEval);

  // Optional: you can tighten these rules to your product logic
  const allowMarketsBoard = isEnrolled && canUseDashboard;
  const allowNews = isEnrolled; // or gate by stage if you want

  // Lead magnet state
  const [lead, setLead] = React.useState({ name: "", email: "", phone: "", method: "email" });
  const [submitting, setSubmitting] = React.useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim());
  const phoneValid = /^\+?[0-9\s\-]{7,15}$/.test(lead.phone.trim());

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
  const sampleReviews: Review[] = [
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
  ];

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
    [courseReviews]
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

  const getPositiveComments = (tier: any, limit = 3): any[] => {
    const lr = Array.isArray(tier?.latestReviews) ? tier.latestReviews : [];
    const scored = lr
      .filter(
        (r: any) => (Number(r?.rating) || 0) >= 4 && String(r?.comment || "").trim().length > 0
      )
      .map((r: any) => ({
        ...r,
        __score:
          (Number(r?.rating) || 0) * 1000 +
          (r?.created_at ? new Date(r.created_at).getTime() / 1e11 : 0) +
          Math.min(String(r?.comment || "").length, 180) / 180,
      }))
      .sort((a: any, b: any) => b.__score - a.__score);
    return scored.slice(0, limit);
  };

  const getTierProgressValue = (tier: any): number | null => {
    const raw = Number(
      tier?.progressPercent ??
        tier?.progress_percentage ??
        tier?.progress ??
        tier?.completionPercent ??
        0
    );

    if (!Number.isFinite(raw) || raw <= 0) return null;
    return Math.max(0, Math.min(100, raw));
  };

  const fmtAvg = (n: number) => (n ? (Math.round(n * 10) / 10).toFixed(1) : "0.0");

  // Submit lead
  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.name.trim()) {
      toast({ status: "warning", title: t("lead.name_required") || "Please enter your name." });
      return;
    }
    if (lead.method === "email" && !emailValid) {
      toast({ status: "warning", title: t("lead.email_invalid") || "Please enter a valid email." });
      return;
    }
    if (lead.method === "phone" && !phoneValid) {
      toast({
        status: "warning",
        title: t("lead.phone_invalid") || "Please enter a valid phone number.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const message = [
        "Lead Magnet Submission",
        `Name: ${lead.name}`,
        `Contact: ${lead.method === "email" ? lead.email : lead.phone}`,
        `Locale: ${i18n.language}`,
        session?.utm ? `UTM: ${JSON.stringify(session.utm)}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      await api.post("/communications", {
        name: lead.name,
        email: lead.method === "email" ? lead.email : undefined,
        phone: lead.method === "phone" ? lead.phone : undefined,
        message,
        locale: i18n.language,
        url: window.location.href,
        utm: session?.utm || undefined,
      });

      toast({ status: "success", title: t("lead.success") || "Thank you for your interest!" });
      setLead({ name: "", email: "", phone: "", method: "email" });
    } catch (err) {
      toast({
        status: "error",
        title: t("lead.error") || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

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

  const isLight = mode === "light";

  const ProductTile: React.FC<{
    title: string;
    desc: string;
    tag?: string;
    cta: string;
    href: string;
  }> = ({ title, desc, tag, cta, href }) => (
    <Box
      p={6}
      borderRadius="2xl"
      bg={UI.surface}
      border="1px solid"
      borderColor={UI.border}
      boxShadow="0 18px 40px rgba(0,0,0,0.35)"
      _hover={{ transform: "translateY(-2px)", borderColor: "rgba(0,191,99,0.35)" }}
      transition="all .18s ease"
    >
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full">
          <Heading size="md" color={UI.text}>
            {title}
          </Heading>
          {tag ? (
            <Badge borderRadius="full" px={3} bg="rgba(0,191,99,0.12)" color={UI.accent}>
              {tag}
            </Badge>
          ) : null}
        </HStack>

        <Text opacity={0.85}>{desc}</Text>

        <Button
          mt={2}
          size="sm"
          bg={UI.accent}
          color="black"
          boxShadow={UI.glow}
          _hover={{ filter: "brightness(1.05)" }}
          onClick={() => window.open(href, "_self")}
        >
          {cta}
        </Button>
      </VStack>
    </Box>
  );

  const ChallengeCard: React.FC<{
    name: string;
    account: string;
    target: string;
    maxDD: string;
    fee: string;
  }> = ({ name, account, target, maxDD, fee }) => (
    <Box p={6} bg={UI.surface} border="1px solid" borderColor={UI.border} borderRadius="2xl">
      <VStack align="start" spacing={3}>
        <Heading size="md">{name}</Heading>

        <SimpleGrid columns={2} spacing={3} w="full">
          {[
            ["Account", account],
            ["Profit Target", target],
            ["Max Drawdown", maxDD],
            ["Fee", fee],
          ].map(([k, v]) => (
            <Box key={k} p={3} border="1px solid" borderColor={UI.border} borderRadius="xl">
              <Text fontSize="xs" opacity={0.7}>
                {k}
              </Text>
              <Text fontWeight="800">{v}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Button
          bg={UI.accent}
          color="black"
          boxShadow={UI.glow}
          onClick={() => window.open("/challenges", "_self")}
        >
          Start now
        </Button>
      </VStack>
    </Box>
  );

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
              onOpenPath={() => navigate("/path")}
              onOpenProgress={() => navigate("/progress")}
              onOpenDashboard={() => navigate("/")}
              onOpenProducts={() => navigate("/products")}
              onOpenContact={() => navigate("/contact")}
            />
          ) : (
            <>
              <Box as="section" id="hero-section" position="relative" minH="100vh" bg="transparent">
                <Container
                  maxW="100vw"
                  w="100%"
                  px={{ base: 2, md: 4 }}
                  py={{ base: 10, md: 12 }}
                  position="relative"
                  zIndex={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minH={{ base: "calc(100vh - 100px)", md: "calc(100vh - 140px)" }}
                >
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    w="full"
                  >
                    <GuestLanding
                      expired={false}
                      onOpenSpin={() => setSpinOpen(true)}
                      showSpinButton={showSpinButton}
                      setShowSpinButton={setShowSpinButton}
                    />
                  </MotionBox>
                </Container>
              </Box>
            </>
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
                                  <Box fontSize="28px" mb={2}>
                                    {b.icon || "🏅"}
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

                {/* Broker CTA */}
                <Box textAlign="center" p={{ base: 5, md: 6 }}>
                  <Heading size="md" mb={2} color={accentColor}>
                    {t("home.enrolled.broker_title", {
                      defaultValue: "Trade With Our Preferred Broker",
                    })}
                  </Heading>
                  <Text opacity={0.9} mb={4} color="#65a8bf">
                    {t("home.enrolled.broker_sub", {
                      defaultValue: "Tight spreads, ECN execution, and fast withdrawals.",
                    })}
                  </Text>
                  <Button
                    size="lg"
                    bg={accentColor}
                    boxShadow={UI.glow}
                    onClick={() => window.open("/broker", "_self")}
                  >
                    {t("home.enrolled.broker_cta", {
                      defaultValue: "Join Our Broker",
                    })}
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <ParallaxSection speed={0.5}>
                  <SpotlightCard>
                    <Box p={6}>
                      <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, amount: 0.3 }}
                      >
                        <Heading textAlign="center" mb={6} fontSize={{ base: "2xl", md: "2xl" }}>
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
                        src="/images/rand/iphones-chart.webp"
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

                {/* Featured Courses & Subscriptions */}
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
                        color={accentColor}
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
                                {(() => {
                                  const positives = getPositiveComments(tier, 3);
                                  if (positives.length === 0) return null;
                                  return (
                                    <Box px={8} pt={0} pb={4}>
                                      <VStack align="stretch" gap={3}>
                                        {positives.map((r: any, i: number) => (
                                          <Box key={r.id || i} p={3}>
                                            <HStack justify="space-between" mb={1}>
                                              <HStack gap={1}>
                                                {Array.from({ length: 5 }).map((_, k) => (
                                                  <Icon
                                                    key={k}
                                                    as={Star}
                                                    boxSize={3.5}
                                                    color={
                                                      k < (Number(r.rating) || 0)
                                                        ? accentColor
                                                        : "gray.400"
                                                    }
                                                    fill={
                                                      k < (Number(r.rating) || 0)
                                                        ? accentColor
                                                        : "none"
                                                    }
                                                  />
                                                ))}
                                              </HStack>
                                              <Text fontSize="xs" opacity={0.7} color="#65a8bf">
                                                {r?.user?.name ||
                                                  t("common.anonymous") ||
                                                  "Student"}{" "}
                                                •{" "}
                                                {r?.created_at
                                                  ? new Date(r.created_at).toLocaleDateString()
                                                  : ""}
                                              </Text>
                                            </HStack>
                                            <Text
                                              fontSize="sm"
                                              style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: "3",
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                              }}
                                            >
                                              {String(r.comment).slice(0, 240) +
                                                (String(r.comment).length > 240 ? "..." : "")}
                                            </Text>
                                          </Box>
                                        ))}
                                      </VStack>
                                    </Box>
                                  );
                                })()}
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

                    {/* Mobile 2x2 grid */}
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
                                  {(() => {
                                    const { avg, count } = getAvgRating(tier);
                                    if (!avg) return null;
                                    const full = Math.round(avg);
                                    return (
                                      <VStack gap={1}>
                                        <HStack justify="center" gap={1}>
                                          {Array.from({ length: 5 }).map((_, k) => (
                                            <Icon
                                              key={k}
                                              as={Star}
                                              boxSize={3.5}
                                              color={k < full ? accentColor : "gray.400"}
                                              fill={k < full ? accentColor : "none"}
                                            />
                                          ))}
                                        </HStack>
                                        <Text fontSize="xs" opacity={0.8} color="#65a8bf">
                                          {fmtAvg(avg)} • {count || 0}{" "}
                                          {t("common.reviews") || "reviews"}
                                        </Text>
                                      </VStack>
                                    );
                                  })()}
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
                              <Icon as={Trophy} boxSize={8} color={accentColor} />
                              <Heading size="xl" color={accentColor}>
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
                        color={accentColor}
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
                          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
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

                {/* How It Works */}
                <HowItWorks t={t} />

                {/* FAQ */}
                <ParallaxSection speed={0.3}>
                  <Box py={{ base: 10, md: 16 }}>
                    <MotionBox
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Heading textAlign="center" mb={6} fontSize={{ base: "3xl", md: "4xl" }}>
                        {t("home.faq.title") || "Frequently Asked Questions"}
                      </Heading>
                      <Text textAlign="center" mb={8} opacity={0.9}>
                        {t("home.faq.subtitle") ||
                          "Find quick answers below. Still stuck? Reach out — we're happy to help."}
                      </Text>
                    </MotionBox>
                    <VStack gap={4} align="stretch" color="#65a8bf">
                      {faqItems.map((item, idx) => (
                        <MotionBox
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          viewport={{ once: true, amount: 0.3 }}
                        >
                          <FaqRow q={item.q} a={item.a} />
                        </MotionBox>
                      ))}
                    </VStack>
                  </Box>
                </ParallaxSection>

                {/* Closing CTA */}
                <ParallaxSection speed={0.5}>
                  <Box>
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <Box mb={{ base: 8, md: 12 }} px={{ base: 4, md: 0 }}>
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
                          w="70%"
                          maxW="container.lg"
                          mx="auto"
                          objectFit="cover"
                          loading="lazy"
                        />
                      </Box>
                    </MotionBox>
                    <MotionBox
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeIn}
                    >
                      <VStack gap={6} align="center" textAlign="center">
                        <Text
                          color={accentColor}
                          fontWeight="bold"
                          fontSize={{ base: "3xl", md: "4xl" }}
                        >
                          {t("home.cta.kicker") || "Ready to Learn?"}
                        </Text>
                        <Heading fontSize={{ base: "3xl", md: "4xl" }}>
                          {t("home.cta.title") || "Start Your Learning Journey Today"}
                        </Heading>
                        <Text fontSize="lg">
                          {t("home.cta.subtitle") ||
                            "Join learners globally and access our premium course library."}
                        </Text>
                        <HStack gap={6} wrap="wrap" justify="center">
                          <Button
                            bg={accentColor}
                            boxShadow={UI.glow}
                            _hover={{ transform: "scale(1.05)" }}
                            transition="all 0.3s"
                            onClick={() => navigate("/products")}
                          >
                            {t("home.cta.primary") || "Browse Courses"}
                          </Button>
                          <Button
                            variant="outline"
                            borderColor={accentColor}
                            color={accentColor}
                            _hover={{ transform: "scale(1.05)", bg: "rgba(0,191,99,0.1)" }}
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

                {/* Lead Magnet */}
                <GradualFooter>
                  <Box my={{ base: 10, md: 16 }} px={{ base: 4, md: 0 }}>

                    {/* Broker CTA */}
                    <Box textAlign="center" p={{ base: 5, md: 6 }}>
                      <Heading size="md" mb={2} color={accentColor}>
                        {t("home.enrolled.broker_title", {
                          defaultValue: "Trade With Our Preferred Broker",
                        })}
                      </Heading>
                      <Text opacity={0.9} mb={4} color="#65a8bf">
                        {t("home.enrolled.broker_sub", {
                          defaultValue: "Tight spreads, ECN execution, and fast withdrawals.",
                        })}
                      </Text>
                      <Button
                        size="lg"
                        bg={accentColor}
                        boxShadow={UI.glow}
                        onClick={() => window.open("/broker", "_self")}
                      >
                        {t("home.enrolled.broker_cta", {
                          defaultValue: "Join Our Broker",
                        })}
                      </Button>
                    </Box>
                  </Box>
                </GradualFooter>
              </>
            )}
          </Container>
          <SpinningWheel isOpen={spinOpen} onClose={() => setSpinOpen(false)} />
        </Box>
      </Box>
    </MotionBox>
  );
};

export default Home;
