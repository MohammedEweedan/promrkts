/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/Hero.tsx
import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Select,
  Input,
  keyframes,
  Badge,
  Container,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useBreakpointValue,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  Tooltip,
} from "@chakra-ui/react";
import { SettingsIcon, AddIcon, DeleteIcon, CloseIcon, RepeatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useThemeMode } from "../themeProvider";
import { useCohortDeadline } from "../hooks/useCohortDeadline";
import api from "../api/client";
import TradingViewWidget, { TradingViewVariant } from "../components/TradingViewWidget";
import OptimizedImage from "../components/OptimizedImage";
import { Maximize2, Minimize2 } from "lucide-react";
import BreakingNewsTicker from "./BreakingNewsTicker";
import GridLayout, { Layout } from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
import SpinningWheel from "./SpinningWheel";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import GuestLanding from "./GuestLanding";

const ResponsiveGridLayout = WidthProvider(Responsive);

const BRAND = "#65a8bf";
const MotionBox = motion(Box);
const DEFAULT_TELEGRAM_URL = "https://t.me/promrkts";
const DASHBOARD_LAYOUT_KEY = "hero_dashboard_layout_v3";
const DASHBOARD_NAMED_LAYOUTS_KEY = "hero_dashboard_named_layouts_v1";
const DASHBOARD_ACTIVE_LAYOUT_KEY = "hero_dashboard_active_layout_name_v1";
const DASHBOARD_BACKEND_SYNC_KEY = "hero_dashboard_named_layouts_backend_v1";

const DEFAULT_X_HANDLE = "promrkts";

type NamedDashboardLayout = {
  name: string;
  widgets: DesktopWidgetConfig[];
  updatedAt: number;
};

const safeJsonParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const isTvWidgetKind = (kind: DesktopWidgetKind) => String(kind).startsWith("tv");

const getWidgetTheme = (mode: "dark" | "light") => {
  const BRAND = "#65a8bf";

  return {
    BRAND,

    // unified widget background (same idea as your SpotlightCard bg)
    cardBg:
      mode === "dark"
        ? "rgba(6, 10, 8, 0.94)" // almost-black green
        : "rgba(245, 246, 247, 0.96)", // soft white / near grey

    cardBorder: mode === "dark" ? "rgba(90, 130, 110, 0.35)" : "rgba(0, 0, 0, 0.08)",

    // inner row surfaces
    surface: mode === "dark" ? "rgba(15, 23, 42, 0.9)" : "rgba(0, 0, 0, 0.04)",

    // text rules:
    // ✅ light mode => black
    // ✅ dark mode => white
    textPrimary: mode === "dark" ? "white" : "black",
    textMuted: mode === "dark" ? "gray.300" : "gray.600",
    textSoft: mode === "dark" ? "gray.400" : "gray.500",

    divider: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  };
};

const flowingTextGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// ---------- DASHBOARD TYPES / CONSTANTS ----------

type DesktopWidgetKind =
  | "welcome"
  | "snapshot"
  | "courses"
  | "telegram"
  | "discord"
  | "xTimeline"
  | "tvEconomic"
  | "tvCryptoHeatmap"
  | "tvStockHeatmap"
  | "tvForexHeatmap"
  | "tvTechnical"
  | "tvMarketOverview"
  | "tvTickerTape"
  | "tvScreener"
  | "tvSymbolOverview"
  | "tvMiniSymbol"
  | "tvForexCrossRates"
  | "tvMarketQuotes"
  | "tvTimeline"
  | "tvSymbolInfo"
  | "tvMarketData"
  | "tvCryptoMarket";

type DesktopWidgetConfig = {
  id: string;
  kind: DesktopWidgetKind;
  symbols: string;
  accentColor: string;
  layout: Layout;
};

type HeroProps = {
  loading?: boolean;
  journey?: any;
  entitlements?: any;
  readiness?: any;
  stageProgress?: number;
  onOpenContact?: () => void;

  // allow any extra props Home is passing (prevents TS2322 immediately)
  [key: string]: any;
};

const SYMBOL_BASED_WIDGETS: DesktopWidgetKind[] = [
  "tvTechnical",
  "tvTickerTape",
  "tvSymbolOverview",
  "tvMiniSymbol",
  "tvSymbolInfo",
];

const XTimelineWidget: React.FC<{ handle: string }> = ({ handle }) => {
  const { mode } = useThemeMode();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const lastKeyRef = React.useRef<string>("");
  const [errorHint, setErrorHint] = React.useState<string>("");

  const safeHandle = React.useMemo(() => {
    return String(handle || "").replace(/^@/, "").trim() || DEFAULT_X_HANDLE;
  }, [handle]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const anyWin = window as any;

    const ensureTwitter = async (): Promise<any> => {
      if (anyWin?.twttr?.widgets) return anyWin.twttr;

      const existing = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (existing) {
        // wait briefly for twttr to attach
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 100));
          if (anyWin?.twttr?.widgets) return anyWin.twttr;
        }
        return anyWin?.twttr;
      }

      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://platform.twitter.com/widgets.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Twitter widgets"));
        document.body.appendChild(s);
      });

      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (anyWin?.twttr?.widgets) return anyWin.twttr;
      }
      return anyWin?.twttr;
    };

    const mount = async () => {
      if (!ref.current) return;
      const key = `${safeHandle}:${mode}`;
      if (lastKeyRef.current === key && status === "ready") return;

      setStatus("loading");
      setErrorHint("");

      // debounce mounts to avoid hammering X syndication (can trigger 429)
      await new Promise((r) => setTimeout(r, 250));
      if (!ref.current) return;
      if (lastKeyRef.current === key && status === "ready") return;

      ref.current.innerHTML = "";
      try {
        const twttr = await ensureTwitter();
        if (!twttr?.widgets?.createTimeline) {
          setStatus("error");
          setErrorHint("Twitter widgets blocked or not available.");
          return;
        }

        await twttr.widgets.createTimeline(
          {
            sourceType: "profile",
            screenName: safeHandle,
          },
          ref.current,
          {
            theme: mode,
            chrome: "noheader,nofooter,noborders,transparent",
            dnt: true,
          }
        );
        lastKeyRef.current = key;
        setStatus("ready");
      } catch (e: any) {
        const msg = String(e?.message || e || "");
        if (msg.includes("429")) {
          setErrorHint("Rate limited by X (429). Wait a bit and refresh.");
        } else {
          setErrorHint(msg || "Failed to load X timeline.");
        }
        setStatus("error");
      }
    };

    mount();
  }, [safeHandle, mode]);

  return (
    <Box w="100%" h="100%" overflow="hidden">
      {status === "loading" ? (
        <Text fontSize="xs" color="gray.400" px={2} pt={1}>
          Loading X timeline…
        </Text>
      ) : null}
      {status === "error" ? (
        <VStack align="start" spacing={1} px={2} pt={1}>
          <Text fontSize="xs" color="gray.400">
            {errorHint || "X widget failed to load (often blocked by adblock/CSP)."}
          </Text>
          <Button
            as="a"
            href={`https://twitter.com/${safeHandle}`}
            target="_blank"
            rel="noreferrer"
            size="xs"
            variant="outline"
            borderColor="gray.700"
          >
            Open @{safeHandle}
          </Button>
        </VStack>
      ) : null}
      <Box ref={ref} w="100%" h="100%" minH="420px" />
    </Box>
  );
};

const WIDGET_TITLES: Record<DesktopWidgetKind, string> = {
  welcome: "Welcome",
  snapshot: "Account Snapshot",
  courses: "Courses",
  telegram: "Telegram Room",
  discord: "Discord Hub",
  xTimeline: "X (Twitter)",
  tvEconomic: "Economic Calendar",
  tvCryptoHeatmap: "Crypto Heatmap",
  tvStockHeatmap: "Stock Heatmap",
  tvForexHeatmap: "Forex Heatmap",
  tvTechnical: "Technical Analysis",
  tvMarketOverview: "Market Overview",
  tvTickerTape: "Ticker Tape",
  tvScreener: "Screener",
  tvSymbolOverview: "Symbol Overview",
  tvMiniSymbol: "Mini Chart",
  tvForexCrossRates: "FX Cross Rates",
  tvMarketQuotes: "Market Quotes",
  tvTimeline: "Market Timeline",
  tvSymbolInfo: "Symbol Info",
  tvMarketData: "Market Data",
  tvCryptoMarket: "Cryptocurrency Market",
};

const ADDABLE_WIDGETS: DesktopWidgetKind[] = [
  "welcome",
  "snapshot",
  "courses",
  "telegram",
  "discord",
  "xTimeline",
  "tvEconomic",
  "tvCryptoHeatmap",
  "tvStockHeatmap",
  "tvForexHeatmap",
  "tvTechnical",
  "tvMarketOverview",
  "tvTickerTape",
  "tvScreener",
  "tvSymbolOverview",
  "tvMiniSymbol",
  "tvForexCrossRates",
  "tvMarketQuotes",
  "tvTimeline",
  "tvSymbolInfo",
];

// Free users only get basic widgets — no TradingView market data
const FREE_WIDGETS: DesktopWidgetKind[] = [
  "welcome",
  "snapshot",
  "courses",
  "telegram",
  "discord",
];

type DashboardPreset = "standard" | "markets" | "ai" | "community" | "minimal";

const PRESET_TITLES: Record<DashboardPreset, string> = {
  standard: "Standard",
  markets: "Markets Pro",
  ai: "AI Focus",
  community: "Community",
  minimal: "Minimal",
};

const MARKET_SYMBOL_GROUPS = [
  {
    label: "FX Majors",
    options: [
      { label: "EUR / USD", value: "FX:EURUSD" },
      { label: "GBP / USD", value: "FX:GBPUSD" },
      { label: "USD / JPY", value: "FX:USDJPY" },
      { label: "USD / CHF", value: "FX:USDCHF" },
      { label: "AUD / USD", value: "FX:AUDUSD" },
      { label: "NZD / USD", value: "FX:NZDUSD" },
      { label: "USD / CAD", value: "FX:USDCAD" },
      { label: "EUR / GBP", value: "FX:EURGBP" },
      { label: "EUR / JPY", value: "FX:EURJPY" },
      { label: "GBP / JPY", value: "FX:GBPJPY" },
    ],
  },
  {
    label: "Indices",
    options: [
      { label: "US 500", value: "FOREXCOM:SPXUSD" },
      { label: "US 100", value: "FOREXCOM:NSXUSD" },
      { label: "Dow Jones", value: "FOREXCOM:DJI" },
      { label: "DAX 40", value: "INDEX:DEU40" },
      { label: "FTSE 100", value: "OANDA:UK100GBP" },
      { label: "Nikkei 225", value: "INDEX:NKY" },
    ],
  },
  {
    label: "Commodities",
    options: [
      { label: "Gold", value: "OANDA:XAUUSD" },
      { label: "Silver", value: "OANDA:XAGUSD" },
      { label: "US Oil", value: "TVC:USOIL" },
      { label: "UK Oil", value: "TVC:UKOIL" },
      { label: "Natural Gas", value: "NYMEX:NG1!" },
    ],
  },
  {
    label: "Crypto",
    options: [
      { label: "Bitcoin / USD", value: "BITSTAMP:BTCUSD" },
      { label: "Ethereum / USD", value: "BITSTAMP:ETHUSD" },
      { label: "Solana / USDT", value: "BINANCE:SOLUSDT" },
      { label: "BNB / USDT", value: "BINANCE:BNBUSDT" },
      { label: "XRP / USDT", value: "BINANCE:XRPUSDT" },
      { label: "DOGE / USDT", value: "BINANCE:DOGEUSDT" },
      { label: "ADA / USDT", value: "BINANCE:ADAUSDT" },
    ],
  },
  {
    label: "US Tech Stocks",
    options: [
      { label: "NVIDIA", value: "NASDAQ:NVDA" },
      { label: "Apple", value: "NASDAQ:AAPL" },
      { label: "Tesla", value: "NASDAQ:TSLA" },
      { label: "Microsoft", value: "NASDAQ:MSFT" },
      { label: "Meta", value: "NASDAQ:META" },
      { label: "Amazon", value: "NASDAQ:AMZN" },
      { label: "Google (A)", value: "NASDAQ:GOOGL" },
    ],
  },
];

// ---------- EMBED WIDGETS ----------

type TelegramWidgetProps = {
  url?: string;
};

const TelegramMessagesWidget: React.FC<TelegramWidgetProps> = ({ url }) => {
  const { mode } = useThemeMode();
  const W = React.useMemo(() => getWidgetTheme(mode), [mode]);

  const channelEmbed = React.useMemo(() => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      const username = parts[0] === "s" ? parts[1] : parts[0];
      if (!username) return null;
      return `https://t.me/${username}?embed=1&mode=tme`;
    } catch {
      return null;
    }
  }, [url]);

  if (!channelEmbed) {
    return (
      <Box
        h="100%"
        w="100%"
        borderRadius="16px"
        border={`1px solid ${W.cardBorder}`}
        bg={W.cardBg}
        px={3}
        py={3}
      >
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" color={W.textPrimary} fontWeight="semibold">
            Telegram Room (promrkts)
          </Text>
          <Badge
            borderRadius="full"
            px={2}
            fontSize="0.6rem"
            bg={`${W.BRAND}20`}
            color={W.BRAND}
            border={`1px solid ${W.BRAND}60`}
          >
            Live
          </Badge>
        </HStack>

        <Text fontSize="xs" color={W.textMuted} mb={3}>
          This Telegram room can&apos;t be embedded here, but you can open it directly.
        </Text>

        {url && (
          <Button
            w="100%"
            borderRadius="full"
            bg={W.BRAND}
            color={mode === "dark" ? "#0b0f0d" : "#0b0f0d"}
            _hover={{ filter: "brightness(1.05)" }}
            onClick={() => window.open(url, "_blank", "noreferrer")}
          >
            Open Telegram Room
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box
      as="iframe"
      src={channelEmbed}
      width="100%"
      height="100%"
      border="0"
      frameBorder="0"
      scrolling="yes"
      sx={{ borderTop: `1px solid ${W.divider}` }}
    />
  );
};

type DiscordWidgetProps = {
  inviteUrl?: string;
};

const DISCORD_WIDGET_SERVER_ID = "144787997194610100007";

const DiscordServerWidget: React.FC<DiscordWidgetProps> = ({ inviteUrl }) => {
  const { mode } = useThemeMode();
  const W = React.useMemo(() => getWidgetTheme(mode), [mode]);

  const widgetSrc = React.useMemo(() => {
    if (DISCORD_WIDGET_SERVER_ID) {
      return `https://discord.com/widget?id=${DISCORD_WIDGET_SERVER_ID}&theme=dark`;
    }
    return "";
  }, []);

  if (!widgetSrc) {
    return (
      <Box
        h="100%"
        w="100%"
        borderRadius="16px"
        border={`1px solid ${W.cardBorder}`}
        bg={W.cardBg}
        px={3}
        py={3}
      >
        <Text fontSize="xs" color={W.textMuted} mb={3}>
          Discord server widget is not configured.
        </Text>

        {inviteUrl && (
          <Button
            w="100%"
            borderRadius="full"
            bg={W.BRAND}
            color={mode === "dark" ? "#0b0f0d" : "#0b0f0d"}
            _hover={{ filter: "brightness(1.05)" }}
            onClick={() => window.open(inviteUrl, "_blank", "noreferrer")}
          >
            Open Discord
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box
      as="iframe"
      src={widgetSrc}
      width="100%"
      height="100%"
      allowTransparency
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      sx={{ borderTop: `1px solid ${W.divider}` }}
    />
  );
};

// ---------- AI / ANALYTICS CARD ----------

type AiTradingCardMode = "momentum" | "movers" | "news";
type CardSize = "sm" | "md" | "lg";


const AiTradingCard: React.FC<{
  mode: AiTradingCardMode;
  size?: CardSize;
  config?: { symbols?: string[] };
  accent?: string;
}> = ({ mode, size = "md", config, accent }) => {
  const { t } = useTranslation() as any;
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint =
          mode === "momentum"
            ? "/analytics/ai/momentum"
            : mode === "movers"
            ? "/analytics/ai/movers"
            : "/analytics/ai/news";

        const params =
          config?.symbols && config.symbols.length
            ? { params: { symbols: config.symbols.join(",") } }
            : undefined;

        const res = await api.get(endpoint, params);
        if (!active) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        setData(arr);
      } catch {
        if (!active) return;
        setError(
          t("home.hero.ai_error", {
            defaultValue: "Unable to load live analytics.",
          }) as string
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [mode, JSON.stringify(config?.symbols)]);

  const title =
    mode === "momentum"
      ? t("home.hero.ai_momentum_title", {
          defaultValue: "AI Momentum Snapshot",
        })
      : mode === "movers"
      ? t("home.hero.ai_movers_title", {
          defaultValue: "AI Top Movers",
        })
      : t("home.hero.ai_news_title", {
          defaultValue: "AI News Calendar",
        });

  const badge =
    mode === "momentum"
      ? t("home.hero.ai_badge_flow", { defaultValue: "Price Action" })
      : mode === "movers"
      ? t("home.hero.ai_badge_vol", { defaultValue: "Volatility" })
      : t("home.hero.ai_badge_macro", { defaultValue: "Macro" });

  const maxRows = size === "sm" ? 3 : size === "lg" ? 8 : 5;
  const accentColor = accent || "#65a8bf";

  return (
    <Box
      borderRadius="16px"
      border="1px solid rgba(148,163,184,0.5)"
      boxShadow="0 14px 28px rgba(0,0,0,0.7)"
      backdropFilter="blur(18px)"
      px={3}
      py={3}
    >
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="semibold">
          {title}
        </Text>
        <Badge
          borderRadius="full"
          px={2}
          fontSize="0.6rem"
          bg={`${accentColor}20`}
          color={accentColor}
          border={`1px solid ${accentColor}60`}
        >
          {badge}
        </Badge>
      </HStack>

      {loading && (
        <VStack align="stretch" spacing={2}>
          {[0, 1, 2].map((i) => (
            <Box key={i} h="26px" borderRadius="md" bg="rgba(15,23,42,0.85)" />
          ))}
        </VStack>
      )}

      {!loading && error && (
        <Text fontSize="xs" color="red.300">
          {error}
        </Text>
      )}

      {!loading && !error && data.length === 0 && (
        <Text fontSize="xs" color="gray.500">
          {t("home.hero.ai_empty", {
            defaultValue: "No live signals right now.",
          })}
        </Text>
      )}

      {!loading && !error && data.length > 0 && (
        <>

        </>
      )}
    </Box>
  );
};

// ---------- SMALL UI HELPERS ----------

// Glass Card Component - replaces SpotlightCard with blurry glass thin bezel
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <Box
    w="100%"
    h="100%"
    bg="rgba(15, 23, 42, 0.4)"
    backdropFilter="blur(20px)"
    border="1px solid rgba(101, 168, 191, 0.2)"
    borderRadius="16px"
    overflow="hidden"
    style={style}
  >
    {children}
  </Box>
);

const DragHandle: React.FC<{ active: boolean; hideMobile?: boolean }> = ({ active, hideMobile = false }) => (
  <Box
    className="widget-drag-handle"
    cursor={active ? "grab" : "default"}
    display={{ base: hideMobile ? "none" : "grid", md: "grid" }}
    gridTemplateColumns="repeat(3, 4px)"
    gridGap="2px"
    p={1}
  >
    {Array.from({ length: 9 }).map((_, i) => (
      <Box
        key={i}
        w="3px"
        h="3px"
        borderRadius="full"
        bg="rgba(148,163,184,0.85)"
      />
    ))}
  </Box>
);

const LockedWidget: React.FC<{
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
  mode: "dark" | "light";
}> = ({ title, description, ctaLabel, onCta, mode }) => (
  <Box
    h="100%"
    w="100%"
    borderRadius="16px"
    border="1px solid rgba(148,163,184,0.35)"
    bg={mode === "dark" ? "rgba(15,23,42,0.72)" : "rgba(245,246,247,0.95)"}
    px={4}
    py={4}
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <VStack align="start" spacing={2}>
      <Badge
        borderRadius="full"
        px={2}
        fontSize="0.65rem"
        bg={mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
        color={mode === "dark" ? "white" : "black"}
        border="1px solid rgba(100,100,100,0.35)"
      >
        Locked
      </Badge>

      <Text fontSize="sm" fontWeight="bold" color={mode === "dark" ? "white" : "black"}>
        {title}
      </Text>

      <Text fontSize="xs" color={mode === "dark" ? "gray.300" : "gray.600"}>
        {description}
      </Text>
    </VStack>

    <Button
      mt={4}
      size="sm"
      borderRadius="full"
      bg="#65a8bf"
      color="black"
      _hover={{ filter: "brightness(1.05)" }}
      onClick={onCta}
    >
      {ctaLabel}
    </Button>
  </Box>
);

const SymbolSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  return (
    <Select
      size="xs"
      maxW="200px"
      value={value}
      bg="#65a8bf"
      onChange={(e) => onChange(e.target.value)}
      fontSize="xs"
    >
      <option value="">Select market / pair</option>
      {MARKET_SYMBOL_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
};

type WidgetSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  widget: DesktopWidgetConfig | null;
  updateWidget: (id: string, patch: Partial<DesktopWidgetConfig>) => void;
  removeWidget: (id: string) => void;
};

const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
  isOpen,
  onClose,
  widget,
  updateWidget,
  removeWidget,
}) => {
  const { t } = useTranslation() as any;
  const { mode } = useThemeMode();
  if (!widget) return null;

  const isSymbolBased = SYMBOL_BASED_WIDGETS.includes(widget.kind);
  const isX = widget.kind === "xTimeline";

  const quickSymbols =
    widget.kind === "tvTechnical"
      ? ["NASDAQ:NVDA", "NASDAQ:AAPL", "OANDA:XAUUSD", "OANDA:SPX500USD"]
      : ["FX:EURUSD", "FX:GBPUSD", "OANDA:XAUUSD", "BITSTAMP:BTCUSD"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent border="1px solid #1e293b">
        <ModalHeader fontSize="sm">
          {t("home.hero.widget_settings", {
            defaultValue: "Widget settings",
          })}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4} fontSize="xs">
            <Box>
              <Text mb={1} >
                Type
              </Text>
              <Select
                size="sm"
                
                value={widget.kind}
                onChange={(e) =>
                  updateWidget(widget.id, {
                    kind: e.target.value as DesktopWidgetKind,
                  })
                }
              >
                {(Object.keys(WIDGET_TITLES) as DesktopWidgetKind[]).map((k) => (
                  <option key={k} value={k}>
                    {WIDGET_TITLES[k]}
                  </option>
                ))}
              </Select>
            </Box>

            {isSymbolBased && (
              <Box>
                <Text mb={1} >
                  Symbols
                </Text>
                <Input
                  size="sm"
                  
                  placeholder={
                    widget.kind === "tvTechnical" ? "NASDAQ:NVDA" : "FX:EURUSD, OANDA:XAUUSD"
                  }
                  value={widget.symbols}
                  onChange={(e) => updateWidget(widget.id, { symbols: e.target.value })}
                />
                <HStack spacing={2} mt={2} flexWrap="wrap">
                  {quickSymbols.map((s) => (
                    <Button
                      key={s}
                      size="xs"
                      variant="outline"
                      borderColor="gray.700"
                      onClick={() => updateWidget(widget.id, { symbols: s })}
                    >
                      {s}
                    </Button>
                  ))}
                </HStack>
              </Box>
            )}

            {isX && (
              <Box>
                <Text mb={1}>X handle</Text>
                <Input
                  size="sm"
                  placeholder={`e.g. ${DEFAULT_X_HANDLE}`}
                  value={widget.symbols}
                  onChange={(e) => updateWidget(widget.id, { symbols: e.target.value })}
                />
                <Text mt={1} color="gray.500">
                  Enter an X username (with or without @).
                </Text>
              </Box>
            )}

            <Box>
              <Text mb={1} >
                Accent color
              </Text>
              <HStack>
                <Input
                  size="sm"
                  type="color"
                  w="60px"
                  p={0}
                  value={widget.accentColor}
                  onChange={(e) =>
                    updateWidget(widget.id, {
                      accentColor: e.target.value,
                    })
                  }
                />
                <Input
                  size="sm"
                  value={widget.accentColor}
                  onChange={(e) =>
                    updateWidget(widget.id, {
                      accentColor: e.target.value,
                    })
                  }
                />
              </HStack>
            </Box>

            <Box>
              <Text mb={1} >
                Width (columns)
              </Text>
              <Slider
                size="sm"
                min={2}
                max={12}
                value={widget.layout?.w ?? 4}
                onChange={(val) =>
                  updateWidget(widget.id, {
                    layout: {
                      ...(widget.layout || {
                        x: 0,
                        y: Infinity,
                        h: 4,
                        minW: 3,
                        minH: 3,
                      }),
                      i: widget.id,
                      w: val,
                    },
                  })
                }
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text mt={1} color="gray.500">
                {widget.layout?.w ?? 4} / 12
              </Text>
            </Box>

            <Box>
              <Text mb={1} >
                Height (rows)
              </Text>
              <Slider
                size="sm"
                min={2}
                max={14}
                value={widget.layout?.h ?? 4}
                onChange={(val) =>
                  updateWidget(widget.id, {
                    layout: {
                      ...(widget.layout || {
                        x: 0,
                        y: Infinity,
                        w: 4,
                        minW: 3,
                        minH: 3,
                      }),
                      i: widget.id,
                      h: val,
                    },
                  })
                }
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text mt={1} color="gray.500">
                {widget.layout?.h ?? 4} rows
              </Text>
            </Box>

            <Button
              size="xs"
              colorScheme="red"
              variant="outline"
              leftIcon={<DeleteIcon />}
              onClick={() => {
                removeWidget(widget.id);
                onClose();
              }}
            >
              Remove widget
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

type DashboardSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isEditingLayout: boolean;
  setIsEditingLayout: (next: boolean) => void;
  addWidget: (kind: DesktopWidgetKind) => void;
  applyPreset: (preset: DashboardPreset) => void;
  resetToStandard: () => void;

  // ✅ add
  canAddTelegram: boolean;
  canAddDiscord: boolean;

  isEnrolled: boolean;

  layouts: NamedDashboardLayout[];
  activeLayoutName: string;
  setActiveLayoutName: (name: string) => void;
  saveLayoutAs: (name: string) => void;
  renameLayout: (from: string, to: string) => void;
  deleteLayout: (name: string) => void;
};

const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  isEditingLayout,
  setIsEditingLayout,
  addWidget,
  applyPreset,
  resetToStandard,
  canAddTelegram,
  canAddDiscord,
  isEnrolled,
  layouts,
  activeLayoutName,
  setActiveLayoutName,
  saveLayoutAs,
  renameLayout,
  deleteLayout,
}) => {
  const { t } = useTranslation() as any;
  const [selectedKind, setSelectedKind] = React.useState<DesktopWidgetKind>("tvTechnical");
  const [preset, setPreset] = React.useState<DashboardPreset>("standard");
  const [layoutNameInput, setLayoutNameInput] = React.useState("");

  const handleAddWidget = () => {
    addWidget(selectedKind);
  };

  const gatedAddables = React.useMemo(() => {
    const allowed = isEnrolled ? ADDABLE_WIDGETS : FREE_WIDGETS;
    return allowed.filter((k) => {
      if (k === "telegram") return canAddTelegram;
      if (k === "discord") return canAddDiscord;
      return true;
    });
  }, [canAddTelegram, canAddDiscord, isEnrolled]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent border="1px solid #1e293b">
        <ModalHeader fontSize="sm">
          {t("home.hero.dashboard_settings", {
            defaultValue: "Dashboard settings",
          })}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4} fontSize="xs">
            <Box>
              <Text mb={1}>Saved layouts</Text>
              <HStack spacing={2} align="center">
                <Select
                  size="sm"
                  value={activeLayoutName}
                  onChange={(e) => setActiveLayoutName(e.target.value)}
                >
                  {layouts.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </HStack>

              <HStack spacing={2} mt={2}>
                <Input
                  size="sm"
                  placeholder="New layout name"
                  value={layoutNameInput}
                  onChange={(e) => setLayoutNameInput(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const n = layoutNameInput.trim();
                    if (!n) return;
                    saveLayoutAs(n);
                    setLayoutNameInput("");
                  }}
                >
                  Save as
                </Button>
              </HStack>

              <HStack spacing={2} mt={2}>
                <Button
                  size="xs"
                  onClick={() => {
                    const n = layoutNameInput.trim();
                    if (!n) return;
                    renameLayout(activeLayoutName, n);
                    setLayoutNameInput("");
                  }}
                >
                  Rename
                </Button>
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => deleteLayout(activeLayoutName)}
                  isDisabled={layouts.length <= 1}
                >
                  Delete
                </Button>
              </HStack>
            </Box>

            <Box>
              <Text mb={1}>Preset layouts</Text>
              <HStack spacing={2} align="center">
                <Select
                  size="sm"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as DashboardPreset)}
                >
                  {(Object.keys(PRESET_TITLES) as DashboardPreset[]).map((k) => (
                    <option key={k} value={k}>
                      {PRESET_TITLES[k]}
                    </option>
                  ))}
                </Select>
                <Button size="sm" onClick={() => applyPreset(preset)}>
                  Apply
                </Button>
              </HStack>
              <Button mt={2} size="xs" onClick={resetToStandard}>
                Reset to Standard
              </Button>
            </Box>

            <Box>
              <Text mb={1}>Layout</Text>
              <Button
                size="xs"
                variant="solid"
                onClick={() => setIsEditingLayout(!isEditingLayout)}
              >
                {isEditingLayout
                  ? t("home.hero.disable_layout_editing", {
                      defaultValue: "Disable layout editing",
                    })
                  : t("home.hero.enable_layout_editing", {
                      defaultValue: "Enable layout editing",
                    })}
              </Button>
            </Box>

            <Box>
              <Text mb={1}>Add widget</Text>
              <HStack spacing={2} align="center">
                <Select
                  size="sm"
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value as DesktopWidgetKind)}
                >
                  {gatedAddables.map((k) => (
                    <option key={k} value={k}>
                      {WIDGET_TITLES[k]}
                    </option>
                  ))}
                </Select>
                {(!canAddTelegram || !canAddDiscord) && (
                  <Text fontSize="xs" color="gray.400">
                    Some community widgets appear only after you unlock VIP access.
                  </Text>
                )}
                <Button size="sm" onClick={handleAddWidget}>
                  {t("home.hero.add_widget", { defaultValue: "Add" })}
                </Button>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// ---------- HERO COMPONENT ----------

export default function Hero(props: HeroProps) {
  const { loading, journey, entitlements, readiness, stageProgress, onOpenContact, isEnrolled: _isEnrolled, ...rest } =
    props;
  const isEnrolled = Boolean(_isEnrolled);
  const { t, i18n } = useTranslation() as any;
  const navigate = useNavigate();
  // Force dashboard layout to stay LTR regardless of language
  const dir: "ltr" | "rtl" = "ltr";
  const { mode } = useThemeMode();
  const W = React.useMemo(() => getWidgetTheme(mode), [mode]);
  const [showSpinButton, setShowSpinButton] = React.useState(false);
  
  // No splash delay - show dashboard instantly
  const [showSplash] = React.useState(false);

  const handleAnimationComplete = () => setShowSpinButton(true);

  const handleScrollDown = () => {
    if (typeof window === "undefined") return;
    const target = window.innerHeight || 0;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const makeStandardDesktopLayout = (): DesktopWidgetConfig[] => {
    const base: DesktopWidgetConfig[] = [
      {
        id: "welcome",
        kind: "welcome",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "welcome", x: 0, y: 0, w: 3, h: 4, minW: 1, minH: 1 },
      },
      {
        id: "snapshot",
        kind: "snapshot",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "snapshot", x: 3, y: 0, w: 3, h: 4, minW: 1, minH: 1 },
      },
      {
        id: "courses",
        kind: "courses",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "courses", x: 6, y: 0, w: 3, h: 4, minW: 1, minH: 1 },
      },
      {
        id: "tvTickerTape",
        kind: "tvTickerTape",
        symbols: "FX:EURUSD,OANDA:XAUUSD,BINANCE:BTCUSDT,NASDAQ:NVDA",
        accentColor: "#65a8bf",
        layout: { i: "tvTickerTape", x: 9, y: 0, w: 6, h: 3, minW: 1, minH: 1 },
      },
      {
        id: "tvMarketOverview",
        kind: "tvMarketOverview",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "tvMarketOverview", x: 0, y: 4, w: 6, h: 6, minW: 4, minH: 4 },
      },
      {
        id: "tvTechnical-main",
        kind: "tvTechnical",
        symbols: "NASDAQ:NVDA",
        accentColor: "#65a8bf",
        layout: {
          i: "tvTechnical-main",
          x: 6,
          y: 4,
          w: 6,
          h: 6,
          minW: 4,
          minH: 4,
        },
      },
      {
        id: "telegram",
        kind: "telegram",
        symbols: "",
        accentColor: "#65a8bf",
        layout: {
          i: "telegram",
          x: 0,
          y: 10,
          w: 6,
          h: 6,
          minW: 4,
          minH: 4,
        },
      },
      {
        id: "discord",
        kind: "discord",
        symbols: "",
        accentColor: "#65a8bf",
        layout: {
          i: "discord",
          x: 6,
          y: 10,
          w: 6,
          h: 6,
          minW: 4,
          minH: 4,
        },
      },
    ];
    // ensure layout.i === id
    return base.map((w) => ({
      ...w,
      layout: { ...w.layout, i: w.id },
    }));
  };

  // Free-user layout: no TradingView widgets, just basic info + community
  const makeFreeUserLayout = (): DesktopWidgetConfig[] => {
    const base: DesktopWidgetConfig[] = [
      {
        id: "welcome",
        kind: "welcome",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "welcome", x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      },
      {
        id: "snapshot",
        kind: "snapshot",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "snapshot", x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      },
      {
        id: "courses",
        kind: "courses",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "courses", x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      },
      {
        id: "telegram",
        kind: "telegram",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "telegram", x: 0, y: 4, w: 6, h: 6, minW: 4, minH: 4 },
      },
      {
        id: "discord",
        kind: "discord",
        symbols: "",
        accentColor: "#65a8bf",
        layout: { i: "discord", x: 6, y: 4, w: 6, h: 6, minW: 4, minH: 4 },
      },
    ];
    return base.map((w) => ({ ...w, layout: { ...w.layout, i: w.id } }));
  };

  const makePresetLayout = (preset: DashboardPreset): DesktopWidgetConfig[] => {
    if (!isEnrolled) return makeFreeUserLayout();
    if (preset === "standard") return makeStandardDesktopLayout();
    if (preset === "minimal") {
      const base: DesktopWidgetConfig[] = [
        {
          id: "welcome",
          kind: "welcome",
          symbols: "",
          accentColor: "#65a8bf",
          layout: { i: "welcome", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
        },
        {
          id: "tvTechnical-main",
          kind: "tvTechnical",
          symbols: "OANDA:XAUUSD",
          accentColor: "#65a8bf",
          layout: { i: "tvTechnical-main", x: 6, y: 0, w: 6, h: 10, minW: 4, minH: 4 },
        },
      ];
      return base.map((w) => ({ ...w, layout: { ...w.layout, i: w.id } }));
    }
    if (preset === "community") {
      const base: DesktopWidgetConfig[] = [
        {
          id: "telegram",
          kind: "telegram",
          symbols: "",
          accentColor: "#65a8bf",
          layout: { i: "telegram", x: 0, y: 0, w: 6, h: 10, minW: 4, minH: 6 },
        },
        {
          id: "discord",
          kind: "discord",
          symbols: "",
          accentColor: "#65a8bf",
          layout: { i: "discord", x: 6, y: 0, w: 6, h: 10, minW: 4, minH: 6 },
        },
        {
          id: "welcome",
          kind: "welcome",
          symbols: "",
          accentColor: "#65a8bf",
          layout: { i: "welcome", x: 0, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
        },
        {
          id: "snapshot",
          kind: "snapshot",
          symbols: "",
          accentColor: "#65a8bf",
          layout: { i: "snapshot", x: 6, y: 10, w: 6, h: 4, minW: 4, minH: 3 },
        },
      ];
      return base.map((w) => ({ ...w, layout: { ...w.layout, i: w.id } }));
    }
    // markets + ai: fallback to standard for now
    return makeStandardDesktopLayout();
  };

  function makeDefaultDesktopLayout(): DesktopWidgetConfig[] {
    return isEnrolled ? makeStandardDesktopLayout() : makeFreeUserLayout();
  }

  const loadNamedLayouts = React.useCallback((): { layouts: NamedDashboardLayout[]; activeName: string } => {
    if (typeof window === "undefined") {
      return {
        layouts: [{ name: "Standard", widgets: makeDefaultDesktopLayout(), updatedAt: Date.now() }],
        activeName: "Standard",
      };
    }

    const named = safeJsonParse<NamedDashboardLayout[]>(localStorage.getItem(DASHBOARD_NAMED_LAYOUTS_KEY));
    const active = (localStorage.getItem(DASHBOARD_ACTIVE_LAYOUT_KEY) || "").trim();
    if (Array.isArray(named) && named.length) {
      return { layouts: named, activeName: named.some((l) => l.name === active) ? active : named[0].name };
    }

    const legacy = safeJsonParse<DesktopWidgetConfig[]>(localStorage.getItem(DASHBOARD_LAYOUT_KEY));
    const legacyWidgets = Array.isArray(legacy) ? legacy : makeDefaultDesktopLayout();
    const initial: NamedDashboardLayout[] = [
      { name: "Standard", widgets: legacyWidgets, updatedAt: Date.now() },
    ];
    try {
      localStorage.setItem(DASHBOARD_NAMED_LAYOUTS_KEY, JSON.stringify(initial));
      localStorage.setItem(DASHBOARD_ACTIVE_LAYOUT_KEY, "Standard");
    } catch {
      // ignore
    }
    return { layouts: initial, activeName: "Standard" };
  }, []);

  const [namedLayouts, setNamedLayouts] = React.useState<NamedDashboardLayout[]>(() => loadNamedLayouts().layouts);
  const [activeLayoutName, setActiveLayoutNameState] = React.useState<string>(() => loadNamedLayouts().activeName);

  const persistNamedLayouts = React.useCallback(
    (next: NamedDashboardLayout[], activeName: string) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(DASHBOARD_NAMED_LAYOUTS_KEY, JSON.stringify(next));
        localStorage.setItem(DASHBOARD_ACTIVE_LAYOUT_KEY, activeName);
      } catch {
        // ignore
      }
    },
    []
  );

  function makeMobileLayoutFromWidgets(ws: DesktopWidgetConfig[]): Layout[] {
    // 1 column stack, keep each widget's height
    return ws.map((w, idx) => ({
      i: w.id,
      x: 0,
      y: idx * (w.layout?.h ?? 4),
      w: 1,
      h: w.layout?.h ?? 4,
      minW: 1,
      minH: w.layout?.minH ?? 3,
    }));
  }

  const normalizeWidget = (raw: any, index: number): DesktopWidgetConfig | null => {
    const id: string =
      typeof raw.id === "string"
        ? raw.id
        : typeof raw.layout?.i === "string"
        ? raw.layout.i
        : `widget-${index}`;
    const layoutRaw = raw.layout || {};
    const layout: Layout = {
      i: id,
      x: Number.isFinite(layoutRaw.x) ? layoutRaw.x : (index * 4) % 12,
      y: Number.isFinite(layoutRaw.y) ? layoutRaw.y : Infinity,
      w: Number.isFinite(layoutRaw.w) ? layoutRaw.w : 4,
      h: Number.isFinite(layoutRaw.h) ? layoutRaw.h : 4,
      minW: Number.isFinite(layoutRaw.minW) ? layoutRaw.minW : 3,
      minH: Number.isFinite(layoutRaw.minH) ? layoutRaw.minH : 3,
    };
    return {
      id,
      kind: raw.kind,
      symbols: typeof raw.symbols === "string" ? raw.symbols : "",
      accentColor: typeof raw.accentColor === "string" ? raw.accentColor : "#65a8bf",
      layout,
    };
  };

  // deadline (guest CTA)
  const storageKey = "cohort_deadline_ms";
  const saved = typeof window !== "undefined" ? Number(localStorage.getItem(storageKey)) : NaN;
  const initial =
    Number.isFinite(saved) && saved > Date.now() ? saved : Date.now() + 1 * 60 * 60 * 1000;
  const { deadline } = useCohortDeadline({
    hours: 1,
    storageKey,
    fixedDeadlineMs: initial,
  });

  const [remain, setRemain] = React.useState<number>(Math.max(0, deadline - Date.now()));
  const [expired, setExpired] = React.useState(remain <= 0);

  React.useEffect(() => {
    const savedNow = typeof window !== "undefined" ? Number(localStorage.getItem(storageKey)) : NaN;
    if (!savedNow || savedNow <= Date.now()) {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, String(deadline));
      }
    }
  }, [deadline]);

  React.useEffect(() => {
    const id = setInterval(() => {
      const ms = Math.max(0, deadline - Date.now());
      setRemain(ms);
      if (ms <= 0 && !expired) {
        setExpired(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, expired]);

  const [isMember, setIsMember] = React.useState(false);
  const [me, setMe] = React.useState<any>(null);
  const [recentCourses, setRecentCourses] = React.useState<any[]>([]);
  const [vipActive, setVipActive] = React.useState(false);
  const [vipEnd, setVipEnd] = React.useState<string | null>(null);
  const [telegramVipActive, setTelegramVipActive] = React.useState(false);
  const [discordVipActive, setDiscordVipActive] = React.useState(false);
  const [telegramVipEnd, setTelegramVipEnd] = React.useState<string | null>(null);
  const [discordVipEnd, setDiscordVipEnd] = React.useState<string | null>(null);
  const [tgLink, setTgLink] = React.useState<string>("");
  const [discordLink, setDiscordLink] = React.useState<string>("");
  const [enrolledCount, setEnrolledCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [spinOpen, setSpinOpen] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [st, mine, meResp, _coursesResp, subsResp] = await Promise.all([
          api.get("/community/status").catch(() => ({ data: null })),
          api.get("/purchase/mine").catch(() => ({ data: [] })),
          api.get("/users/me").catch(() => ({ data: null })),
          api.get("/courses").catch(() => ({ data: [] })),
          api.get("/subscriptions").catch(() => ({ data: [] })),
        ]);

        const vip = !!(st as any)?.data?.vip;
        const tg = !!(st as any)?.data?.telegram;
        const vipEndDate = (st as any)?.data?.vipEnd || null;

        const subs = Array.isArray(subsResp?.data) ? subsResp.data : [];

        const vipTelegramTier = subs.find((t: any) => t?.isVipProduct && t?.vipType === "telegram");
        const telegramUrl = vipTelegramTier?.telegramUrl || "";

        const discordTier = subs.find((t: any) => t?.isVipProduct && t?.vipType === "discord");
        const discordInviteUrl = discordTier?.discordInviteUrl || "";

        const list = Array.isArray((mine as any)?.data) ? (mine as any).data : [];
        const confirmed = list.filter(
          (p: any) => String(p.status || "").toUpperCase() === "CONFIRMED"
        );

        if (active) {
          setIsMember(vip || tg || confirmed.length > 0);
          setMe((meResp as any)?.data || null);
          setVipActive(!!vipTelegramTier || vip);
          setVipEnd(vipEndDate);
          setTelegramVipActive(!!vipTelegramTier);
          setDiscordVipActive(!!discordTier);
          setTelegramVipEnd(
            (vipTelegramTier as any)?.vipEnd || (vipEndDate as string | null) || null
          );
          setDiscordVipEnd((discordTier as any)?.vipEnd || (vipEndDate as string | null) || null);
          setTgLink(telegramUrl);
          setDiscordLink(discordInviteUrl);
          setEnrolledCount(confirmed.length);

          const recents = confirmed
            .sort(
              (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((p: any, idx: number) => ({
              id: p?.tier?.id ?? `course-${idx}`,
              name: p?.tier?.name || "Course",
              date: p.createdAt,
              tier: p?.tier,
            }));
          setRecentCourses(recents);
        }
      } catch {
        // silent fail
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const perms = React.useMemo(() => {
    const canTelegram = !!telegramVipActive || (!!vipActive && !!vipEnd);
    const canDiscord = !!discordVipActive || (!!vipActive && !!vipEnd);
    const canCommunity = canTelegram || canDiscord;

    // Optional: you can tune these rules
    const canEditLayout = true; // or !!vipActive if you want layout editing to be VIP-only
    const canAddTelegram = canTelegram;
    const canAddDiscord = canDiscord;

    return {
      canTelegram,
      canDiscord,
      canCommunity,
      canEditLayout,
      canAddTelegram,
      canAddDiscord,
    };
  }, [telegramVipActive, discordVipActive, vipActive, vipEnd]);

  const isLoggedIn = !!me;
  const [frozenWelcome, setFrozenWelcome] = React.useState<string>("");

  const backendSaveTimerRef = React.useRef<number | null>(null);
  const lastBackendPayloadRef = React.useRef<string>("");

  const persistNamedLayoutsToBackend = React.useCallback(
    (next: NamedDashboardLayout[], activeName: string) => {
      if (!isLoggedIn) return;
      const payload = JSON.stringify({ next, activeName });
      if (lastBackendPayloadRef.current === payload) return;
      lastBackendPayloadRef.current = payload;

      if (backendSaveTimerRef.current) {
        window.clearTimeout(backendSaveTimerRef.current);
      }

      backendSaveTimerRef.current = window.setTimeout(async () => {
        try {
          await api.put("/dashboard/hero-layouts", {
            layouts: next,
            activeName,
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(DASHBOARD_BACKEND_SYNC_KEY, String(Date.now()));
            } catch {
              // ignore
            }
          }
        } catch {
          // ignore
        }
      }, 900);
    },
    [isLoggedIn]
  );

  React.useEffect(() => {
    if (!isLoggedIn) {
      setFrozenWelcome("");
      return;
    }
    const initialWelcome = t("home.hero.welcome", {
      defaultValue: "Welcome, {{name}}",
      name: me?.name || me?.email || "Trader",
    });
    if (!frozenWelcome) setFrozenWelcome(initialWelcome);
  }, [isLoggedIn, t, i18n.language, me?.name, me?.email, frozenWelcome]);

  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const [gridWidth, setGridWidth] = React.useState<number>(1024);
  const gridWidthFullscreenRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateWidth = () => {
      const vw = window.innerWidth || 0;
      const isFs = !!document.fullscreenElement;
      gridWidthFullscreenRef.current = isFs;
      // In fullscreen mode, use full width with minimal margins
      // Otherwise reserve space for the left-side dock
      const leftDockOffset = isFs ? 16 : 96;
      const rightMargin = isFs ? 16 : 24;
      const next = Math.max(0, vw - leftDockOffset - rightMargin);
      setGridWidth(next);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    document.addEventListener("fullscreenchange", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      document.removeEventListener("fullscreenchange", updateWidth);
    };
  }, []);

  const [showTelegramWidget, setShowTelegramWidget] = React.useState(true);
  const [showDiscordWidget, setShowDiscordWidget] = React.useState(true);
  const [mobileShowDashboard, setMobileShowDashboard] = React.useState(false);

  React.useEffect(() => {
    if (!isLoggedIn) {
      setMobileShowDashboard(false);
      return;
    }
    if (isDesktop) {
      setMobileShowDashboard(true);
      return;
    }
    setMobileShowDashboard(false);
    const id = window.setTimeout(() => {
      setMobileShowDashboard(true);
    }, 1500);
    return () => window.clearTimeout(id);
  }, [isLoggedIn, isDesktop]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: ErrorEvent) => {
      if (event.message === "Script error." && !event.filename) {
        // Swallow generic cross-origin script errors from third-party widgets
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    };

    // Preserve any existing window.onerror
    const prevOnError = window.onerror;
    window.onerror = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
      if (message === "Script error." && !source) {
        // Returning true tells the browser the error was handled
        return true;
      }
      if (typeof prevOnError === "function") {
        return prevOnError(message, source, lineno, colno, error) as boolean;
      }
      return false;
    };

    // Use capture phase to intercept cross-origin "Script error." before React's error overlay.
    window.addEventListener("error", handler, true);
    return () => {
      window.removeEventListener("error", handler, true as any);
      window.onerror = prevOnError || null;
    };
  }, []);

  const [widgets, setWidgets] = React.useState<DesktopWidgetConfig[]>(() => {
    const { layouts, activeName } = loadNamedLayouts();
    const active = layouts.find((l) => l.name === activeName);
    const base = Array.isArray(active?.widgets) ? active!.widgets : makeDefaultDesktopLayout();
    const normalized = base
      .map((w: any, idx: number) => normalizeWidget(w, idx))
      .filter(Boolean) as DesktopWidgetConfig[];
    return normalized.length ? normalized : makeDefaultDesktopLayout();
  });

  const persistWidgets = (next: DesktopWidgetConfig[]) => {
    const fixed = next
      .map((w: any, idx: number) => normalizeWidget(w, idx))
      .filter(Boolean) as DesktopWidgetConfig[];
    setWidgets(fixed);

    setNamedLayouts((prev) => {
      const now = Date.now();
      const updated = prev.map((l) =>
        l.name === activeLayoutName ? { ...l, widgets: fixed, updatedAt: now } : l
      );
      persistNamedLayouts(updated, activeLayoutName);
      persistNamedLayoutsToBackend(updated, activeLayoutName);
      return updated;
    });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(fixed));
      } catch {
        // ignore
      }
    }
  };

  const setActiveLayoutName = React.useCallback(
    (name: string) => {
      const n = String(name || "").trim();
      if (!n) return;
      const target = namedLayouts.find((l) => l.name === n);
      if (!target) return;
      setActiveLayoutNameState(n);
      persistNamedLayouts(namedLayouts, n);
      persistNamedLayoutsToBackend(namedLayouts, n);
      const normalized = (target.widgets || [])
        .map((w: any, idx: number) => normalizeWidget(w, idx))
        .filter(Boolean) as DesktopWidgetConfig[];
      setWidgets(normalized);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(normalized));
        } catch {
          // ignore
        }
      }
    },
    [namedLayouts, persistNamedLayouts]
  );

  const saveLayoutAs = React.useCallback(
    (name: string) => {
      const n = String(name || "").trim();
      if (!n) return;
      setNamedLayouts((prev) => {
        if (prev.some((l) => l.name.toLowerCase() === n.toLowerCase())) return prev;
        const next = [...prev, { name: n, widgets, updatedAt: Date.now() }];
        persistNamedLayouts(next, n);
        persistNamedLayoutsToBackend(next, n);
        return next;
      });
      setActiveLayoutNameState(n);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(widgets));
        } catch {
          // ignore
        }
      }
    },
    [persistNamedLayouts, persistNamedLayoutsToBackend, widgets]
  );

  const renameLayout = React.useCallback(
    (from: string, to: string) => {
      const src = String(from || "").trim();
      const dst = String(to || "").trim();
      if (!src || !dst) return;
      setNamedLayouts((prev) => {
        if (prev.some((l) => l.name.toLowerCase() === dst.toLowerCase())) return prev;
        const next = prev.map((l) => (l.name === src ? { ...l, name: dst } : l));
        const nextActive = activeLayoutName === src ? dst : activeLayoutName;
        persistNamedLayouts(next, nextActive);
        persistNamedLayoutsToBackend(next, nextActive);
        return next;
      });
      if (activeLayoutName === src) setActiveLayoutNameState(dst);
    },
    [activeLayoutName, persistNamedLayouts, persistNamedLayoutsToBackend]
  );

  const deleteLayout = React.useCallback(
    (name: string) => {
      const n = String(name || "").trim();
      if (!n) return;
      setNamedLayouts((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((l) => l.name !== n);
        const nextActive = activeLayoutName === n ? next[0]?.name || "Standard" : activeLayoutName;
        persistNamedLayouts(next, nextActive);
        persistNamedLayoutsToBackend(next, nextActive);
        return next;
      });
      if (activeLayoutName === n) {
        const fallback = namedLayouts.find((l) => l.name !== n) || namedLayouts[0];
        if (fallback) setActiveLayoutName(fallback.name);
      }
    },
    [activeLayoutName, namedLayouts, persistNamedLayouts, persistNamedLayoutsToBackend, setActiveLayoutName]
  );

  React.useEffect(() => {
    if (!isLoggedIn) return;
    let alive = true;
    (async () => {
      try {
        const resp = await api.get("/dashboard/hero-layouts");
        if (!alive) return;
        const remoteLayouts = resp?.data?.layouts;
        const remoteActiveName = resp?.data?.activeName;
        if (!Array.isArray(remoteLayouts) || !remoteLayouts.length) return;

        setNamedLayouts(remoteLayouts as NamedDashboardLayout[]);
        const fallbackActive =
          typeof remoteActiveName === "string" && remoteLayouts.some((l: any) => l?.name === remoteActiveName)
            ? remoteActiveName
            : remoteLayouts[0].name;
        setActiveLayoutNameState(fallbackActive);
        persistNamedLayouts(remoteLayouts as NamedDashboardLayout[], fallbackActive);

        const active = (remoteLayouts as NamedDashboardLayout[]).find((l) => l.name === fallbackActive);
        const base = Array.isArray(active?.widgets) ? active!.widgets : makeDefaultDesktopLayout();
        const normalized = base
          .map((w: any, idx: number) => normalizeWidget(w, idx))
          .filter(Boolean) as DesktopWidgetConfig[];
        setWidgets(normalized.length ? normalized : makeDefaultDesktopLayout());
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(normalized));
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const activeLayoutIndex = React.useMemo(() => {
    return Math.max(0, namedLayouts.findIndex((l) => l.name === activeLayoutName));
  }, [namedLayouts, activeLayoutName]);

  const goPrevLayout = React.useCallback(() => {
    if (!namedLayouts.length) return;
    const nextIdx = (activeLayoutIndex - 1 + namedLayouts.length) % namedLayouts.length;
    setActiveLayoutName(namedLayouts[nextIdx].name);
  }, [activeLayoutIndex, namedLayouts, setActiveLayoutName]);

  const goNextLayout = React.useCallback(() => {
    if (!namedLayouts.length) return;
    const nextIdx = (activeLayoutIndex + 1) % namedLayouts.length;
    setActiveLayoutName(namedLayouts[nextIdx].name);
  }, [activeLayoutIndex, namedLayouts, setActiveLayoutName]);

  const updateWidget = (id: string, patch: Partial<DesktopWidgetConfig>) => {
    persistWidgets(
      widgets.map((w) =>
        w.id === id
          ? {
              ...w,
              ...patch,
              layout: {
                ...(w.layout || {
                  x: 0,
                  y: Infinity,
                  w: 4,
                  h: 4,
                  minW: 3,
                  minH: 3,
                }),
                ...(patch.layout || {}),
                i: id,
              },
            }
          : w
      )
    );
  };

  const removeWidget = (id: string) => {
    persistWidgets(widgets.filter((w) => w.id !== id));
  };

  const onLayoutChange = (newLayout: Layout[]) => {
    if (!Array.isArray(newLayout) || !newLayout.length) return;
    const layoutMap = new Map(newLayout.map((l) => [l.i, l]));
    const updated = widgets.map((w, idx) => {
      const l = layoutMap.get(w.id);
      const baseLayout = w.layout || {
        i: w.id,
        x: (idx * 4) % 12,
        y: Infinity,
        w: 4,
        h: 4,
        minW: 3,
        minH: 3,
      };
      return l
        ? { ...w, layout: { ...baseLayout, ...l, i: w.id } }
        : { ...w, layout: { ...baseLayout, i: w.id } };
    });
    persistWidgets(updated);
  };

  const addWidget = (kind: DesktopWidgetKind = "tvTechnical") => {
    if (kind === "telegram" && !perms.canAddTelegram) {
      navigate("/products");
      return;
    }
    if (kind === "discord" && !perms.canAddDiscord) {
      navigate("/products");
      return;
    }

    const id = `widget-${Date.now()}`;
    const next: DesktopWidgetConfig = {
      id,
      kind,
      symbols: kind === "tvTechnical" ? "NASDAQ:AAPL" : "",
      accentColor: "#65a8bf",
      layout: { i: id, x: 0, y: Infinity, w: 4, h: 4, minW: 1, minH: 1 },
    };
    persistWidgets([...widgets, next]);
  };

  const resetDashboardLayout = () => {
    persistWidgets(makeStandardDesktopLayout());
  };

  const applyPreset = (preset: DashboardPreset) => {
    persistWidgets(makePresetLayout(preset));
  };

  // Enable drag & drop editing by default
  const [isEditingLayout, setIsEditingLayout] = React.useState(perms.canEditLayout);
  const [editingWidgetId, setEditingWidgetId] = React.useState<string | null>(null);
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = React.useState(false);
  
  // Fullscreen mode state - YouTube-style fullscreen that covers entire screen
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  // Handle fullscreen toggle using Fullscreen API
  const toggleFullscreen = React.useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (dashboardRef.current) {
          await dashboardRef.current.requestFullscreen();
        }
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
      }
    } catch (err) {
      // Fallback for browsers that don't support fullscreen API
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Single listener for fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    setIsEditingLayout(perms.canEditLayout);
  }, [perms.canEditLayout]);

  const renderWidgetContent = (widget: DesktopWidgetConfig) => {
    const symbolsArray = widget.symbols
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const renderTradingView = (variant: TradingViewVariant, symbol?: string) => {
      return <TradingViewWidget variant={variant} symbol={symbol} />;
    };

    const WelcomeWidget: React.FC = () => {
      const buildVipRow = (label: string, color: string, end: string | null) => {
        if (!end) return null;
        const now = Date.now();
        const endMs = new Date(end).getTime();
        const msLeft = Math.max(0, endMs - now);
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysLeft = Math.max(0, Math.ceil(msLeft / msPerDay));
        const approxTotalDays = 30;
        const used = Math.max(0, approxTotalDays - daysLeft);
        const percentElapsed = Math.max(0, Math.min(100, (used / approxTotalDays) * 100));

        return (
          <Box w="100%" borderRadius="xl" border={`1px solid ${color}55`} px={3} py={3}>
            <HStack justify="space-between" mb={2}>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="xs" color="gray.300">
                  {label}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color={color}>
                  Ends on {new Date(end).toLocaleDateString()}
                </Text>
              </VStack>
              <VStack align="flex-end" spacing={0}>
                <Text fontSize="lg" fontWeight="bold" color={color}>
                  {daysLeft}
                </Text>
                <Text fontSize="10px" color="gray.400">
                  days left
                </Text>
              </VStack>
            </HStack>
            <Box h="5px" borderRadius="full" bg="rgba(30,41,59,0.9)">
              <Box
                h="5px"
                borderRadius="full"
                width={`${percentElapsed}%`}
                bg={`linear-gradient(90deg, ${color}, #65a8bf)`}
                transition="width 0.25s ease-out"
              />
            </Box>
          </Box>
        );
      };

      const displayName =
        me?.name || me?.email || t("home.hero.trader", { defaultValue: "Trader" });

      return (
        <VStack align="center" spacing={3} textAlign="center">
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="extrabold"
            bgGradient="linear(to-r, #65a8bf, #65a8bf)"
            bgClip="text"
            color="transparent"
            backgroundSize="200% 200%"
            animation={`${flowingTextGradient} 4s linear infinite`}
          >
            {t("home.hero.welcome_label", { defaultValue: "Welcome" })}
          </Text>

          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" color={mode === "dark" ? "white" : "black"}>
            {displayName}
          </Text>

          {(telegramVipActive || discordVipActive || (vipActive && vipEnd)) && (
            <VStack align="stretch" spacing={2} w="100%">
              {telegramVipActive &&
                buildVipRow("Telegram VIP", "#65a8bf", telegramVipEnd || vipEnd)}
              {discordVipActive && buildVipRow("Discord VIP", "#65a8bf", discordVipEnd || vipEnd)}
              {!telegramVipActive &&
                !discordVipActive &&
                vipActive &&
                vipEnd &&
                buildVipRow("VIP Access", "#65a8bf", vipEnd)}
            </VStack>
          )}
        </VStack>
      );
    };

    const SnapshotWidget: React.FC = () => (
      <VStack align="stretch" spacing={2} fontSize="xs">
        <HStack justify="space-between">
          <Text>{t("home.hero.identity", { defaultValue: "Email" })}</Text>
          <Text noOfLines={1}>{me?.email}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text>
            {t("home.hero.enrolled", {
              defaultValue: "Courses Enrolled",
            })}
          </Text>
          <Text color="teal.200" fontWeight="semibold">
            {enrolledCount}
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text>{t("home.hero.tier", { defaultValue: "Tier" })}</Text>
          <Text>
            {vipActive
              ? t("home.hero.tier_vip", { defaultValue: "VIP" })
              : t("home.hero.tier_standard", {
                  defaultValue: "Standard",
                })}
          </Text>
        </HStack>
        {vipActive && vipEnd && (
          <HStack justify="space-between">
            <Text>
              {t("home.hero.vip_ends", {
                defaultValue: "VIP Ends",
              })}
            </Text>
            <Text color={mode === "dark" ? "white" : "black"} fontWeight="bold">
              {new Date(vipEnd).toLocaleDateString()}
            </Text>
          </HStack>
        )}
      </VStack>
    );

    const CoursesWidget: React.FC = () => {
      if (enrolledCount === 0) {
        return (
          <Box backdropFilter="blur(18px)" px={4} py={4}>
            <Text fontSize="sm" color="gray.400">
              {t("home.hero.no_courses", {
                defaultValue: "No courses enrolled yet.",
              })}
            </Text>
          </Box>
        );
      }

      const count = recentCourses.length;
      const perPage = 3;
      const totalPages = Math.ceil(count / perPage);
      const safePage = currentPage >= totalPages ? Math.max(0, totalPages - 1) : currentPage;
      const startIdx = safePage * perPage;
      const endIdx = startIdx + perPage;
      const current = recentCourses.slice(startIdx, endIdx);

      const goPrev = () => setCurrentPage((p) => (p <= 0 ? 0 : p - 1));
      const goNext = () => setCurrentPage((p) => (p >= totalPages - 1 ? totalPages - 1 : p + 1));

      return (
        <>
          <HStack>
            {totalPages > 1 && (
              <HStack>
                <IconButton
                  aria-label="Previous"
                  icon={<Text fontSize="lg">{"←"}</Text>}
                  size="xs"
                  variant="solid"
                  borderRadius="full"
                  onClick={goPrev}
                  isDisabled={safePage === 0}
                />
                <IconButton
                  aria-label="Next"
                  icon={<Text fontSize="lg">{"→"}</Text>}
                  size="xs"
                  variant="solid"
                  borderRadius="full"
                  onClick={goNext}
                  isDisabled={safePage === totalPages - 1}
                />
              </HStack>
            )}
          </HStack>
          <VStack align="stretch">
            {current.map((c, i) => {
              const tier = c.tier;
              const productLink = tier?.telegramUrl || tier?.discordInviteUrl || `/learn/${c.id}`;
              return (
                <Box key={`${c.id ?? "course"}-dash-${i}`} p={3}>
                  <HStack justify="space-between" align="center" mb={1}>
                    <Text fontWeight="semibold" noOfLines={2} color={mode === "dark" ? "white" : "black"}>
                      {c.name}
                    </Text>
                    <Button
                      size="xs"
                      borderRadius="full"
                      bg={BRAND}
                      _hover={{ filter: "brightness(0.95)" }}
                      onClick={() => {
                        if (tier?.telegramUrl || tier?.discordInviteUrl) {
                          window.open(productLink, "_blank", "noreferrer");
                        } else {
                          navigate(productLink);
                        }
                      }}
                    >
                      {t("home.courses.access", {
                        defaultValue: "Access",
                      })}
                    </Button>
                  </HStack>
                  <Text fontSize="xs">{new Date(c.date).toLocaleDateString()}</Text>
                </Box>
              );
            })}
          </VStack>
        </>
      );
    };

    switch (widget.kind) {
      case "welcome":
        return <WelcomeWidget />;
      case "snapshot":
        return <SnapshotWidget />;
      case "courses":
        return <CoursesWidget />;
      case "telegram":
        return perms.canTelegram ? (
          <TelegramMessagesWidget url={tgLink || DEFAULT_TELEGRAM_URL} />
        ) : (
          <LockedWidget
            title="Telegram Room"
            description="This is a VIP community widget. Upgrade to unlock the Telegram room inside your dashboard."
            ctaLabel="Upgrade / View Plans"
            onCta={() => navigate("/products")}
            mode={mode}
          />
        );

      case "discord":
        return perms.canDiscord ? (
          <DiscordServerWidget inviteUrl={discordLink} />
        ) : (
          <LockedWidget
            title="Discord Hub"
            description="This widget is available for Discord VIP members. Upgrade to unlock access."
            ctaLabel="Upgrade / View Plans"
            onCta={() => navigate("/products")}
            mode={mode}
          />
        );

      case "xTimeline":
        return <XTimelineWidget handle={widget.symbols || DEFAULT_X_HANDLE} />;

      case "tvMarketOverview":
        return renderTradingView("market-overview");
      case "tvTickerTape":
        return renderTradingView(
          "ticker-tape",
          widget.symbols || "FX:EURUSD,OANDA:XAUUSD,BINANCE:BTCUSDT,NASDAQ:NVDA"
        );
      case "tvScreener":
        // symbol field is treated as market name by TradingViewWidget for this variant
        return renderTradingView("screener", widget.symbols || "forex");
      case "tvSymbolOverview":
        return renderTradingView("symbol-overview", widget.symbols || "NASDAQ:AAPL");
      case "tvMiniSymbol":
        return renderTradingView("mini-symbol-overview", widget.symbols || "NASDAQ:AAPL");
      case "tvForexCrossRates":
        return renderTradingView("forex-cross-rates");
      case "tvMarketQuotes":
        return renderTradingView("market-quotes");
      case "tvTimeline":
        return renderTradingView("timeline");
      case "tvMarketData":
        return renderTradingView("market-data");
      case "tvCryptoMarket":
        // Uses your crypto-screener config internally (stable embed script).
        return renderTradingView("cryptocurrency-market");
      case "tvSymbolInfo":
        return renderTradingView("symbol-info", widget.symbols || "NASDAQ:AAPL");
      case "tvEconomic":
        return <TradingViewWidget variant="economic-calendar" />;
      case "tvCryptoHeatmap":
        return <TradingViewWidget variant="crypto-heatmap" />;
      case "tvStockHeatmap":
        return <TradingViewWidget variant="stock-heatmap" />;
      case "tvForexHeatmap":
        return <TradingViewWidget variant="forex-heatmap" />;
      case "tvTechnical":
        return <TradingViewWidget variant="technical-analysis" symbol={symbolsArray[0] || "NASDAQ:AAPL"} />;
      default:
        return (
          <Text fontSize="xs" color="gray.500">
            Empty widget
          </Text>
        );
    }
  };

  const renderLoggedInMobile = () => {
    if (!mobileShowDashboard) {
      return (
        <VStack w="100%" spacing={6} align="center" textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            w="100%"
          ></MotionBox>
        </VStack>
      );
    }

    // Optional: filter TG/DC by toggles (keep your existing UX)
    const mobileWidgets = widgets.filter((w) => {
      if (w.kind === "telegram") return showTelegramWidget;
      if (w.kind === "discord") return showDiscordWidget;
      return true;
    });

    const mobileLayout = makeMobileLayoutFromWidgets(mobileWidgets);

    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        w="100%"
      >
        <VStack w="100%" spacing={3} align="stretch">
          <Box borderRadius="lg" overflow="hidden">
            <BreakingNewsTicker mode={mode as "dark" | "light"} />
          </Box>
          <Box w="100%" pt={4}>
            <ResponsiveGridLayout
              className="mobile-layout"
              layouts={{ lg: mobileLayout, md: mobileLayout, sm: mobileLayout, xs: mobileLayout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
              cols={{ lg: 1, md: 1, sm: 1, xs: 1 }}
              rowHeight={34}
              isDraggable={false}
              isResizable={false}
              compactType="vertical"
              margin={[12, 12]}
              containerPadding={[0, 0]}
              useCSSTransforms={true}
            >
              {mobileWidgets.map((widget) => {
                const isTvWidget = isTvWidgetKind(widget.kind);

                return (
                  <Box key={widget.id} h="100%" w="100%">
                    <GlassCard style={{ width: "100%", height: "100%", margin: 0, padding: 0 }}>
                      <Box
                        h="100%"
                        w="100%"
                        display="flex"
                        flexDirection="column"
                        color={mode === "dark" ? "white" : "black"}
                      >
                        <HStack
                          justify="space-between"
                          align="center"
                          px={3}
                          pt={2}
                          pb={2}
                          spacing={2}
                        >
                          <HStack spacing={2} align="center">
                            <DragHandle active={isEditingLayout} hideMobile={true} />
                            <Text fontSize="xs" fontWeight="semibold" color={mode === "dark" ? "white" : "black"}>
                              {WIDGET_TITLES[widget.kind]}
                            </Text>
                          </HStack>

                          <HStack spacing={2}>
                            {widget.kind === "tvTechnical" && (
                              <SymbolSelect
                                value={widget.symbols.split(",")[0]?.trim() ?? ""}
                                onChange={(val) => updateWidget(widget.id, { symbols: val })}
                              />
                            )}
                            <HStack spacing={1}>
                              <IconButton
                                aria-label="Edit widget"
                                icon={<SettingsIcon boxSize={3} />}
                                size="xs"
                                bg="#65a8bf"
                                color="black"
                                _hover={{ bg: "#5a9bb0" }}
                                onClick={() => setEditingWidgetId(widget.id)}
                              />
                              <IconButton
                                aria-label="Remove widget"
                                icon={<CloseIcon boxSize={3} />}
                                size="xs"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() => removeWidget(widget.id)}
                              />
                            </HStack>
                          </HStack>
                        </HStack>

                        <Box p={3} flex="1 1 auto" overflow="hidden">
                          {renderWidgetContent(widget)}
                        </Box>
                      </Box>
                    </GlassCard>
                  </Box>
                );
              })}
            </ResponsiveGridLayout>
          </Box>

          <WidgetSettingsModal
            isOpen={!!editingWidgetId}
            onClose={() => setEditingWidgetId(null)}
            widget={widgets.find((w) => w.id === editingWidgetId) || null}
            updateWidget={updateWidget}
            removeWidget={removeWidget}
          />
        </VStack>
      </MotionBox>
    );
  };

  return (
    <>
      {/* GIF Splash Overlay */}
      {showSplash && (
        <MotionBox
          position="fixed"
          inset={0}
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(5, 8, 17, 0.75)"
          backdropFilter="blur(20px)"
          initial={{ opacity: 1 }}
          animate={{ opacity: showSplash ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          pointerEvents={showSplash ? "auto" : "none"}
        >
          <Box w={{ base: "160px", md: "220px" }} h="auto">
            <OptimizedImage
              src={process.env.PUBLIC_URL + "/logo.gif"}
              alt="Loading"
              width="100%"
              height="auto"
              priority
              placeholder="none"
            />
          </Box>
        </MotionBox>
      )}

      <Box
        as="section"
        id="hero-section"
        position="relative"
        minH="100vh"
        dir={dir}
        bg="transparent"
      >
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
          minH={{ base: "calc(100vh - 120px)", md: "calc(100vh - 140px)" }}
        >
          <Box w="100%">
            {isLoggedIn ? (
              isDesktop ? (
                <>
                  <Box
                    position="absolute"
                    top={{ base: 4, md: 4 }}
                    right={{ base: 4, md: 8 }}
                    zIndex={3}
                  >
                    <HStack spacing={2}>
                      <Badge borderRadius="full" px={3} bg="blackAlpha.400" color={mode === "dark" ? "white" : "black"}>
                        {activeLayoutName}
                      </Badge>
                      <Tooltip label="Previous layout" placement="bottom" hasArrow>
                        <IconButton
                          aria-label="Previous layout"
                          icon={<Text fontSize="lg">{"←"}</Text>}
                          variant="ghost"
                          color={mode === "dark" ? "white" : "black"}
                          _hover={{ bg: "blackAlpha.300" }}
                          onClick={goPrevLayout}
                        />
                      </Tooltip>
                      <Tooltip label="Next layout" placement="bottom" hasArrow>
                        <IconButton
                          aria-label="Next layout"
                          icon={<Text fontSize="lg">{"→"}</Text>}
                          variant="ghost"
                          color={mode === "dark" ? "white" : "black"}
                          _hover={{ bg: "blackAlpha.300" }}
                          onClick={goNextLayout}
                        />
                      </Tooltip>
                      <Tooltip label="Dashboard settings" placement="bottom" hasArrow>
                        <IconButton
                          aria-label="Open dashboard settings"
                          icon={<SettingsIcon boxSize={3} />}
                          size="sm"
                          variant="solid"
                          color="black"
                          bg="#65a8bf"
                          _hover={{ bg: "#65a8bf" }}
                          onClick={() => setIsDashboardSettingsOpen(true)}
                          borderRadius="full"
                        />
                      </Tooltip>
                      <Tooltip label="Reset dashboard layout" placement="bottom" hasArrow>
                        <IconButton
                          aria-label="Reset dashboard layout"
                          icon={<RepeatIcon />}
                          variant="ghost"
                          color="red.500"
                          _hover={{ bg: "red.500", color: "white" }}
                          onClick={resetDashboardLayout}
                        />
                      </Tooltip>
                      <Tooltip label={isFullscreen ? "Exit fullscreen" : "Fullscreen mode"} placement="bottom" hasArrow>
                        <IconButton
                          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                          icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                          size="sm"
                          variant="solid"
                          color="white"
                          bg={isFullscreen ? "green.500" : "purple.500"}
                          _hover={{ bg: isFullscreen ? "green.600" : "purple.600" }}
                          onClick={toggleFullscreen}
                          borderRadius="full"
                        />
                      </Tooltip>
                    </HStack>
                  </Box>

                  <Box 
                    ref={dashboardRef}
                    pl={{ base: 2, lg: isFullscreen ? 4 : "50px" }} 
                    pr={{ base: 2, md: 4 }} 
                    overflow="hidden"
                    {...(isFullscreen ? {
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 9999,
                      bg: mode === "dark" ? "#0a0f1a" : "gray.50",
                      pt: 16,
                      pb: 4,
                      overflowY: "auto",
                    } : {})}
                  >
                    {/* Fullscreen header with logo and controls */}
                    {isFullscreen && (
                      <Box
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        zIndex={10000}
                        bg={mode === "dark" ? "rgba(10, 15, 26, 0.95)" : "rgba(255, 255, 255, 0.95)"}
                        backdropFilter="blur(10px)"
                        borderBottom="1px solid"
                        borderColor={mode === "dark" ? "whiteAlpha.100" : "blackAlpha.100"}
                        px={4}
                        py={2}
                      >
                        <HStack justify="space-between" align="center">
                          {/* Logo */}
                          <HStack spacing={3}>
                            <OptimizedImage
                              src={process.env.PUBLIC_URL + "/text-logo.png"}
                              alt="promrkts"
                              width="120px"
                              height="32px"
                              objectFit="contain"
                              priority
                              placeholder="none"
                            />
                          </HStack>

                          {/* Fullscreen controls */}
                          <HStack spacing={2}>
                            <Badge borderRadius="full" px={3} bg="blackAlpha.400" color={mode === "dark" ? "white" : "black"}>
                              {activeLayoutName}
                            </Badge>
                            <Tooltip label="Previous layout" placement="bottom" hasArrow>
                              <IconButton
                                aria-label="Previous layout"
                                icon={<Text fontSize="lg">{"←"}</Text>}
                                variant="ghost"
                                size="sm"
                                color={mode === "dark" ? "white" : "black"}
                                _hover={{ bg: "blackAlpha.300" }}
                                onClick={goPrevLayout}
                              />
                            </Tooltip>
                            <Tooltip label="Next layout" placement="bottom" hasArrow>
                              <IconButton
                                aria-label="Next layout"
                                icon={<Text fontSize="lg">{"→"}</Text>}
                                variant="ghost"
                                size="sm"
                                color={mode === "dark" ? "white" : "black"}
                                _hover={{ bg: "blackAlpha.300" }}
                                onClick={goNextLayout}
                              />
                            </Tooltip>
                            <Tooltip label="Dashboard settings" placement="bottom" hasArrow>
                              <IconButton
                                aria-label="Open dashboard settings"
                                icon={<SettingsIcon boxSize={3} />}
                                size="sm"
                                variant="solid"
                                color="black"
                                bg="#65a8bf"
                                _hover={{ bg: "#5a9bb0" }}
                                onClick={() => setIsDashboardSettingsOpen(true)}
                                borderRadius="full"
                              />
                            </Tooltip>
                            <Tooltip label="Reset dashboard layout" placement="bottom" hasArrow>
                              <IconButton
                                aria-label="Reset dashboard layout"
                                icon={<RepeatIcon />}
                                size="sm"
                                variant="ghost"
                                color="red.500"
                                _hover={{ bg: "red.500", color: "white" }}
                                onClick={resetDashboardLayout}
                              />
                            </Tooltip>
                            <Tooltip label="Exit fullscreen" placement="bottom" hasArrow>
                              <IconButton
                                aria-label="Exit fullscreen"
                                icon={<Minimize2 size={16} />}
                                size="sm"
                                variant="solid"
                                color="white"
                                bg="green.500"
                                _hover={{ bg: "green.600" }}
                                onClick={toggleFullscreen}
                                borderRadius="full"
                              />
                            </Tooltip>
                          </HStack>
                        </HStack>
                      </Box>
                    )}
                    {/* Breaking news ticker tape */}
                    <Box mb={2} borderRadius="xl" overflow="hidden">
                      <BreakingNewsTicker mode={mode as "dark" | "light"} />
                    </Box>
                    <GridLayout
                      className="layout"
                      layout={widgets.map((w, idx) => ({
                        i: w.id,
                        x: w.layout?.x ?? (idx * 4) % 12,
                        y: w.layout?.y ?? Infinity,
                        w: w.layout?.w ?? 4,
                        h: w.layout?.h ?? 4,
                        minW: w.layout?.minW ?? 3,
                        minH: w.layout?.minH ?? 3,
                      }))}
                      cols={12}
                      rowHeight={isFullscreen ? 45 : 38}
                      width={gridWidth}
                      isDraggable={isEditingLayout}
                      isResizable={isEditingLayout}
                      resizeHandles={["s", "e", "n", "w", "sw", "se", "nw", "ne"]}
                      draggableHandle=".widget-drag-handle"
                      compactType="vertical"
                      onLayoutChange={onLayoutChange}
                    >
                      {widgets.map((widget, idx) => {
                        const isSymbolBased = SYMBOL_BASED_WIDGETS.includes(widget.kind);
                        const isTvWidget = isTvWidgetKind(widget.kind);
                        const primarySymbol = widget.symbols.split(",")[0]?.trim() ?? "";

                        return (
                          <Box key={widget.id} h="100%" w="100%">
                            <GlassCard style={{ width: "100%", height: "100%", margin: 0, padding: 0 }}>
                              <Box
                                h="100%"
                                w="100%"
                                display="flex"
                                flexDirection="column"
                                color={mode === "dark" ? "white" : "black"}
                              >
                                <HStack
                                  justify="space-between"
                                  align="center"
                                  px={3}
                                  pt={2}
                                  pb={2}
                                  spacing={2}
                                >
                                  <HStack spacing={2} align="center">
                                    <DragHandle active={isEditingLayout} hideMobile={true} />
                                    <Text
                                      fontSize="xs"
                                      fontWeight="semibold"
                                      textTransform="capitalize"
                                      color={mode === "dark" ? "white" : "black"}
                                    >
                                      {WIDGET_TITLES[widget.kind]}
                                    </Text>
                                  </HStack>

                                  <HStack spacing={2}>
                                    {isTvWidget && widget.kind === "tvTechnical" ? (
                                      <SymbolSelect
                                        value={primarySymbol}
                                        onChange={(val) => updateWidget(widget.id, { symbols: val })}
                                      />
                                    ) : null}
                                    {!isTvWidget && isSymbolBased ? (
                                      <SymbolSelect
                                        value={primarySymbol}
                                        onChange={(val) => updateWidget(widget.id, { symbols: val })}
                                      />
                                    ) : null}

                                    <HStack spacing={1}>
                                      <IconButton
                                        aria-label="Edit widget"
                                        icon={<SettingsIcon boxSize={3} />}
                                        size="xs"
                                        bg="#65a8bf"
                                        color="black"
                                        _hover={{ bg: "#5a9bb0" }}
                                        onClick={() => setEditingWidgetId(widget.id)}
                                      />
                                      <IconButton
                                        aria-label="Remove widget"
                                        icon={<CloseIcon boxSize={3} />}
                                        size="xs"
                                        bg="red.500"
                                        color="white"
                                        _hover={{ bg: "red.600" }}
                                        onClick={() => removeWidget(widget.id)}
                                      />
                                    </HStack>
                                  </HStack>
                                </HStack>

                                <Box p={3} flex="1 1 auto" overflow="hidden">
                                  {renderWidgetContent(widget)}
                                </Box>
                              </Box>
                            </GlassCard>
                          </Box>
                        );
                      })}
                    </GridLayout>
                  </Box>

                  <WidgetSettingsModal
                    isOpen={!!editingWidgetId}
                    onClose={() => setEditingWidgetId(null)}
                    widget={widgets.find((w) => w.id === editingWidgetId) || null}
                    updateWidget={updateWidget}
                    removeWidget={removeWidget}
                  />
                  <DashboardSettingsModal
                    isOpen={isDashboardSettingsOpen}
                    onClose={() => setIsDashboardSettingsOpen(false)}
                    isEditingLayout={isEditingLayout}
                    setIsEditingLayout={setIsEditingLayout}
                    addWidget={addWidget}
                    applyPreset={applyPreset}
                    resetToStandard={resetDashboardLayout}
                    canAddTelegram={perms.canAddTelegram}
                    canAddDiscord={perms.canAddDiscord}
                    isEnrolled={isEnrolled}
                    layouts={namedLayouts}
                    activeLayoutName={activeLayoutName}
                    setActiveLayoutName={setActiveLayoutName}
                    saveLayoutAs={saveLayoutAs}
                    renameLayout={renameLayout}
                    deleteLayout={deleteLayout}
                  />
                </>
              ) : (
                renderLoggedInMobile()
              )
            ) : (
             <GuestLanding
                expired={false}
                onOpenSpin={() => setSpinOpen(true)}
                showSpinButton={showSpinButton}
                setShowSpinButton={setShowSpinButton}
              />
            )}
          </Box>
        </Container>
      </Box>

      <SpinningWheel isOpen={spinOpen} onClose={() => setSpinOpen(false)} />
    </>
  );
}
