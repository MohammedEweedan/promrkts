/* eslint-disable */
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Divider,
  Icon,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  Tab,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  Select,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import SpotlightCard from "../components/SpotlightCard";
import { useThemeMode } from "../themeProvider";
import { ShieldCheck, Clock, Coins, Layers, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CopyIcon } from "@chakra-ui/icons";
import api from "../api/client";
import {
  getTokenInfo,
  getMyTokenPurchases,
  marketBuy,
  marketSell,
  unstakeTokens,
  getMyWallet,
  linkUsdtWallet,
} from "../api/tokens";

import {
  createChart,
  ColorType,
  IChartApi,
  UTCTimestamp,
  CandlestickSeries,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import ConnectWalletButton from "../components/ConnectWalletButton";
import { ethers } from "ethers";
import { useInjectedWallet } from "../web3/useInjectedWallet";

const MotionBox = motion(Box);

const AI = {
  accent: "#65a8bf",
  edge: "rgba(104, 165, 191, .5)",
  glow: "0 0 40px rgba(104, 165, 191, .35)",
};

// -------------------- Real SVG token icons (inline, no external URLs) --------------------
const SvgWrap: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 22 }) => (
  <Box w={`${size}px`} h={`${size}px`} display="inline-flex" alignItems="center" justifyContent="center">
    {children}
  </Box>
);

const UsdtIcon = ({ size = 22 }: { size?: number }) => (
  <SvgWrap size={size}>
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-label="USDT">
      <circle cx="32" cy="32" r="30" fill="#26A17B" />
      <path
        d="M37 18H47v8H37v6.1c6.3.5 11 2 11 3.9 0 2.4-7.2 4.3-16 4.3s-16-1.9-16-4.3c0-1.9 4.7-3.4 11-3.9V26H17v-8h10V14h10v4zm-10 18.1c1.5.1 3.1.2 5 .2s3.5-.1 5-.2v-6c-1.5.1-3.1.2-5 .2s-3.5-.1-5-.2v6z"
        fill="#fff"
      />
    </svg>
  </SvgWrap>
);

const BtcIcon = ({ size = 22 }: { size?: number }) => (
  <SvgWrap size={size}>
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-label="BTC">
      <circle cx="32" cy="32" r="30" fill="#F7931A" />
      <path
        d="M36.8 29.6c2.2-.6 3.8-2 3.5-4.6-.4-3.3-3.4-4.4-7.3-4.6V16h-3v4.3h-2.4V16h-3v4.4h-6v3.2h3.3c.6 0 1 .4 1 1v14.8c0 .6-.4 1-1 1h-3.3v3.2h6V48h3v-4.3H30V48h3v-4.3c5.1-.3 8.7-1.6 9.1-6.4.4-3.1-1.2-5.1-5.3-5.7zM27 23.7h5.1c2.1 0 4.7.6 4.7 2.9 0 2.6-3 2.9-5.3 2.9H27v-5.8zm5.6 16.1H27v-6.4h5.9c2.5 0 5.9.7 5.9 3.2 0 3-3.6 3.2-6.2 3.2z"
        fill="#fff"
      />
    </svg>
  </SvgWrap>
);

const EthIcon = ({ size = 22 }: { size?: number }) => (
  <SvgWrap size={size}>
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-label="ETH">
      <circle cx="32" cy="32" r="30" fill="#1B1F2A" />
      <path d="M32 10l14 23-14 8-14-8L32 10z" fill="#C9D1D9" />
      <path d="M32 41l14-8-14 21-14-21 14 8z" fill="#8B949E" />
    </svg>
  </SvgWrap>
);

const SolIcon = ({ size = 22 }: { size?: number }) => (
  <SvgWrap size={size}>
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-label="SOL">
      <defs>
        <linearGradient id="solg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#0B1222" />
      <path
        d="M18 22c.7-.7 1.7-1.2 2.7-1.2h26.8c1.5 0 2.2 1.8 1.2 2.8l-3.4 3.4c-.7.7-1.7 1.2-2.7 1.2H15.8c-1.5 0-2.2-1.8-1.2-2.8L18 22z"
        fill="url(#solg)"
      />
      <path
        d="M18 36c.7-.7 1.7-1.2 2.7-1.2h26.8c1.5 0 2.2 1.8 1.2 2.8l-3.4 3.4c-.7.7-1.7 1.2-2.7 1.2H15.8c-1.5 0-2.2-1.8-1.2-2.8L18 36z"
        fill="url(#solg)"
        opacity="0.9"
      />
      <path
        d="M18 29c.7-.7 1.7-1.2 2.7-1.2h26.8c1.5 0 2.2 1.8 1.2 2.8l-3.4 3.4c-.7.7-1.7 1.2-2.7 1.2H15.8c-1.5 0-2.2-1.8-1.2-2.8L18 29z"
        fill="url(#solg)"
        opacity="0.75"
      />
    </svg>
  </SvgWrap>
);

const PmkxIcon = ({ size = 22 }: { size?: number }) => (
  <SvgWrap size={size}>
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-label="PMKX">
      <defs>
        <radialGradient id="pmg" cx="30%" cy="30%" r="80%">
          <stop offset="0" stopColor="#1BFF9E" />
          <stop offset="1" stopColor="#65a8bf" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#pmg)" />
      <path
        d="M18 40V24h8.2c5 0 7.6 2.2 7.6 6.2 0 4-2.6 6.2-7.6 6.2H24v3.6h-6zm6-8h2c1.5 0 2.4-.6 2.4-1.8 0-1.2-.9-1.8-2.4-1.8h-2V32zm17.2 8-3.6-5.3-2.1 2.2V40h-5.6V24h5.6v6.1l5.2-6.1H47l-5.7 6.6L48 40h-6.8z"
        fill="#0B1222"
        opacity="0.95"
      />
    </svg>
  </SvgWrap>
);

// -------------------- Exchange-style asset tile --------------------
type AssetTileProps = {
  icon: React.ReactNode;
  symbol: string;
  sub?: string;
  balance: number;
  priceUsdt?: number | null;
  dpBal?: number;
  dpPrice?: number;
};

const AssetTile: React.FC<AssetTileProps> = ({ icon, symbol, sub, balance, priceUsdt, dpBal = 6, dpPrice = 2 }) => {
  const val = (Number.isFinite(balance) ? balance : 0) * (Number.isFinite(priceUsdt || 0) ? Number(priceUsdt) : 0);

  return (
    <Box
      p={4}
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.10)"
      bg="rgba(7,12,24,0.35)"
      _hover={{ borderColor: "rgba(0,191,99,0.55)", transform: "translateY(-1px)" }}
      transition="all 180ms ease"
    >
      <HStack justify="space-between" align="start" mb={2}>
        <HStack spacing={3}>
          {icon}
          <VStack spacing={0} align="start">
            <Text color="#65a8bf" fontWeight="700" lineHeight="1">
              {symbol}
            </Text>
            <Text fontSize="xs" color="rgba(255,255,255,0.55)">
              {sub || " "}
            </Text>
          </VStack>
        </HStack>

        <VStack spacing={0} align="end">
          <Text color="white" fontWeight="700" lineHeight="1">
            {formatNum(balance, dpBal)}
          </Text>
          <Text fontSize="xs" color="rgba(255,255,255,0.55)">
            {priceUsdt ? `${formatNum(priceUsdt, dpPrice)} USDT` : "—"}
          </Text>
        </VStack>
      </HStack>

      <Divider borderColor="rgba(255,255,255,0.08)" my={2} />

      <HStack justify="space-between">
        <Text fontSize="xs" color="rgba(255,255,255,0.55)">
          Value
        </Text>
        <Text fontSize="sm" color="#65a8bf" fontWeight="700">
          {priceUsdt ? `${formatNum(val, 2)} USDT` : "—"}
        </Text>
      </HStack>
    </Box>
  );
};

const TOKEN = {
  symbol: "PMKX",
  pair: "PMKX/USDT",
  totalSupply: 20_000_000_000,
  initialPriceUsdt: 0.1,
  stakingLockMonths: 12,
  distribution: [
    { label: "Community Rewards", pct: 35, note: "Planned incentives & engagement" },
    { label: "Liquidity & Market Making", pct: 20, note: "Single initial pair (planned)" },
    { label: "Treasury / Ecosystem", pct: 20, note: "Growth, partnerships, ops" },
    { label: "Team (Vested)", pct: 15, note: "Long-term alignment (planned vesting)" },
    { label: "Advisors / Partners", pct: 10, note: "Strategic expansion" },
  ],
  utilities: [
    {
      title: "Trading Floor Access",
      body: "Unlock Discord floor rooms, live reviews, and role-based channels.",
      icon: ShieldCheck,
    },
    {
      title: "Community Rewards",
      body: "Planned rewards model for activity, learning streaks, and performance reviews (subject to policy).",
      icon: BadgeCheck,
    },
    {
      title: "Staking (Locked)",
      body: "Planned staking lock: 12 months from stake date. Terms may evolve with compliance.",
      icon: Clock,
    },
    {
      title: "Guides + Communities Boost",
      body: "Discounts, early access, and perks across Guides and Communities (planned).",
      icon: Layers,
    },
  ],
  complianceNote:
    "This page is product/roadmap information only. It is not financial advice, not an offer to sell, and all terms may change subject to legal/compliance review.",
};

type PricePoint = { t: number; price: number };
type Candle = CandlestickData<Time>;

const formatNum = (n: number, dp = 2) => {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: dp,
    minimumFractionDigits: dp,
  }).format(n);
};

const formatInt = (n: number) => {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
};

const safeBigInt = (v: any) => {
  try {
    return BigInt(v ?? "0");
  } catch {
    return BigInt(0);
  }
};

const safeToNumber = (v: bigint) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b);

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

type MarketSide = "BUY" | "SELL";
type InputMode = "TOKENS" | "USDT";

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <Box py={{ base: 8, md: 12 }}>
    <VStack spacing={3} textAlign="center" mb={6}>
      <Heading color={AI.accent} fontSize={{ base: "3xl", md: "4xl" }}>
        {title}
      </Heading>
      {subtitle && (
        <Text opacity={0.85} maxW="3xl">
          {subtitle}
        </Text>
      )}
    </VStack>
    {children}
  </Box>
);

// -------------------- Candlestick chart (client-aggregated OHLC) --------------------
const intervalMsMap: Record<string, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "15m": 15 * 60_000,
  "1h": 60 * 60_000,
};

function buildCandles(points: PricePoint[], bucketMs: number): Candle[] {
  if (!Array.isArray(points) || points.length === 0) return [];
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const out: Candle[] = [];

  let curBucket = -1;
  let open = 0,
    high = 0,
    low = 0,
    close = 0;
  let bucketStart = 0;

  for (const p of sorted) {
    const price = Number(p.price || 0);
    if (!Number.isFinite(price) || price <= 0) continue;

    const b = Math.floor(p.t / bucketMs);
    if (b !== curBucket) {
      if (curBucket !== -1) {
        out.push({
          time: Math.floor(bucketStart / 1000) as any,
          open,
          high,
          low,
          close,
        });
      }
      curBucket = b;
      bucketStart = b * bucketMs;
      open = price;
      high = price;
      low = price;
      close = price;
    } else {
      high = Math.max(high, price);
      low = Math.min(low, price);
      close = price;
    }
  }

  if (curBucket !== -1) {
    out.push({
      time: Math.floor(bucketStart / 1000) as any,
      open,
      high,
      low,
      close,
    });
  }

  return out;
}

const CandleChart: React.FC<{
  candles: Candle[];
  height?: number | string;
}> = ({ candles, height = 320 }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ReturnType<IChartApi["addSeries"]> | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    // cleanup old
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const el = ref.current;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "rgba(11,19,34,0.0)" },
        textColor: "rgba(255,255,255,0.75)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.10)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.10)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.20)", width: 1 },
        horzLine: { color: "rgba(255,255,255,0.20)", width: 1 },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const candlesSeries = chart.addSeries(CandlestickSeries, {
      upColor: "rgba(104,165,191,1)",
      downColor: "rgba(183,162,125,1)",
      wickUpColor: "rgba(104,165,191,1)",
      wickDownColor: "rgba(183,162,125,1)",
      borderVisible: false,
    });

    seriesRef.current = candlesSeries;

    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      chart.applyOptions({
        width: Math.max(10, Math.floor(width)),
        height: Math.max(10, Math.floor(height)),
      });
      chart.timeScale().fitContent();
    });
    ro.observe(el);

    candlesSeries.setData((candles || []) as any);
    chart.timeScale().fitContent();

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData((candles || []) as any);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <Box
      ref={ref as any}
      w="100%"
      h={height}
      borderRadius="xl"
      border="1px solid rgba(255,255,255,0.08)"
      position="relative"
    />
  );
};

// -------------------- Market Order Modal --------------------
const MarketOrderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  side: MarketSide;
  symbol: string;
  price: number;
  maxSellTokens: number;
  onSubmit: (payload: { tokens?: number; usdt?: number }) => Promise<void>;
}> = ({ isOpen, onClose, side, symbol, price, maxSellTokens, onSubmit }) => {
  const { t } = useTranslation() as any;
  const toast = useToast();
  const [mode, setMode] = React.useState<InputMode>("TOKENS");
  const [tokens, setTokens] = React.useState<string>("");
  const [usdt, setUsdt] = React.useState<string>("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const p = Number.isFinite(price) && price > 0 ? price : 0;

  const tokensN = React.useMemo(() => {
    const n = toNum(tokens);
    return n > 0 ? n : 0;
  }, [tokens]);

  const usdtN = React.useMemo(() => {
    const n = toNum(usdt);
    return n > 0 ? n : 0;
  }, [usdt]);

  // keep the other field in sync
  React.useEffect(() => {
    if (!isOpen) return;
    if (!p) return;

    if (mode === "TOKENS") {
      const u = tokensN * p;
      setUsdt(tokens ? String(Number.isFinite(u) ? u : 0) : "");
    } else {
      const tt = p > 0 ? usdtN / p : 0;
      setTokens(usdt ? String(Number.isFinite(tt) ? tt : 0) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tokens, usdt, p, isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setMode("TOKENS");
      setTokens("");
      setUsdt("");
      setConfirmOpen(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  const effectiveTokens = mode === "TOKENS" ? tokensN : p > 0 ? usdtN / p : 0;
  const effectiveUsdt = mode === "USDT" ? usdtN : tokensN * p;

  const sellTooMuch = side === "SELL" && effectiveTokens > maxSellTokens + 1e-9;

  const canContinue = p > 0 && effectiveTokens > 0 && effectiveUsdt > 0 && !sellTooMuch;

  const title =
    side === "BUY" ? t("token.order.buyTitle", { symbol }) : t("token.order.sellTitle", { symbol });

  const handleConfirm = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    try {
      const payload =
        mode === "TOKENS" ? { tokens: Number(effectiveTokens) } : { usdt: Number(effectiveUsdt) };

      await onSubmit(payload);
      toast({
        title: side === "BUY" ? t("token.order.buySubmitted") : t("token.order.sellSubmitted"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      toast({
        title: t("token.order.orderFailed"),
        description: e?.response?.data?.message || e?.message || t("common.requestFailed"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent bg="rgba(11,19,34,0.98)" border={`1px solid ${AI.edge}`} borderRadius="xl">
          <ModalHeader color="#65a8bf">{title}</ModalHeader>
          <ModalCloseButton color="#65a8bf" />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text color="#65a8bf" opacity={0.7} fontSize="sm">
                  {t("token.order.price")}
                </Text>
                <Heading size="md" color="#65a8bf">
                  ${Number(p || 0).toFixed(4)} {t("token.order.usdt")}
                </Heading>
              </Box>

              <Tabs
                index={mode === "TOKENS" ? 0 : 1}
                onChange={(i) => setMode(i === 0 ? "TOKENS" : "USDT")}
                variant="soft-rounded"
                colorScheme="cyan"
              >
                <TabList>
                  <Tab>{t("token.order.inputTokens")}</Tab>
                  <Tab>{t("token.order.inputUsdt")}</Tab>
                </TabList>
              </Tabs>

              {mode === "TOKENS" ? (
                <InputGroup>
                  <Input
                    value={tokens}
                    onChange={(e) => setTokens(e.target.value)}
                    placeholder={t("token.order.tokensPlaceholder")}
                    color="#65a8bf"
                    borderColor="rgba(255,255,255,0.15)"
                  />
                  <InputRightElement width="auto" pr={3}>
                    <Text color="#65a8bf" opacity={0.7}>
                      {symbol}
                    </Text>
                  </InputRightElement>
                </InputGroup>
              ) : (
                <InputGroup>
                  <Input
                    value={usdt}
                    onChange={(e) => setUsdt(e.target.value)}
                    placeholder={t("token.order.usdtPlaceholder")}
                    color="#65a8bf"
                    borderColor="rgba(255,255,255,0.15)"
                  />
                  <InputRightElement width="auto" pr={3}>
                    <Text color="#65a8bf" opacity={0.7}>
                      {t("token.order.usdt")}
                    </Text>
                  </InputRightElement>
                </InputGroup>
              )}

              <Box p={3} borderRadius="lg" border="1px solid rgba(255,255,255,0.10)">
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.75}>
                    {t("token.order.estimatedTokens")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    {formatNum(effectiveTokens, 6)} {symbol}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.75}>
                    {t("token.order.estimatedValue")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    {formatNum(effectiveUsdt, 2)} {t("token.order.usdt")}
                  </Text>
                </HStack>
                {side === "SELL" && (
                  <Text
                    mt={2}
                    fontSize="sm"
                    color={sellTooMuch ? "red.300" : "white"}
                    opacity={sellTooMuch ? 1 : 0.7}
                  >
                    {t("token.order.maxSellable", { amount: formatNum(maxSellTokens, 0), symbol })}
                  </Text>
                )}
              </Box>

              {sellTooMuch && (
                <Text color="red.300" fontSize="sm">
                  {t("token.order.sellTooMuch")}
                </Text>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack w="100%" justify="flex-end">
              <Button variant="ghost" color="#65a8bf" onClick={onClose} isDisabled={submitting}>
                {t("common.cancel")}
              </Button>
              <Button
                bg={AI.accent}
                color="black"
                onClick={() => setConfirmOpen(true)}
                isDisabled={!canContinue || submitting}
              >
                {t("common.continue")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent bg="rgba(11,19,34,0.98)" border={`1px solid ${AI.edge}`} borderRadius="xl">
          <ModalHeader color="#65a8bf">
            {t("token.order.confirmTitle", {
              side: side === "BUY" ? t("token.order.buy") : t("token.order.sell"),
            })}
          </ModalHeader>
          <ModalCloseButton color="#65a8bf" />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text color="#65a8bf" opacity={0.85}>
                {t("token.order.confirmDesc", {
                  side: side === "BUY" ? t("token.order.buyLower") : t("token.order.sellLower"),
                })}
              </Text>
              <Box p={3} borderRadius="lg" border="1px solid rgba(255,255,255,0.10)">
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.7}>
                    {t("token.order.tokens")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    {formatNum(effectiveTokens, 6)} {symbol}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.7}>
                    {t("token.order.usdtEst")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    {formatNum(effectiveUsdt, 2)} {t("token.order.usdt")}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.7}>
                    {t("token.order.price")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    ${Number(p || 0).toFixed(4)}
                  </Text>
                </HStack>
              </Box>
              <Text color="#65a8bf" opacity={0.6} fontSize="sm">
                {t("token.order.marketNote")}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack w="100%" justify="flex-end">
              <Button
                variant="ghost"
                color="#65a8bf"
                onClick={() => setConfirmOpen(false)}
                isDisabled={submitting}
              >
                {t("common.back")}
              </Button>
              <Button
                bg={side === "BUY" ? AI.accent : "#65a8bf"}
                color="black"
                onClick={handleConfirm}
                isLoading={submitting}
              >
                {t("token.order.confirmBtn", {
                  side: side === "BUY" ? t("token.order.buy") : t("token.order.sell"),
                })}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

// -------------------- Page --------------------
const TokenPage: React.FC = () => {
  const { t } = useTranslation() as any;
  const { mode } = useThemeMode();
  const { isConnected, address, provider } = useInjectedWallet();
  const navigate = useNavigate();
  const toast = useToast();
  const [prices, setPrices] = React.useState<{
    btc?: number;
    eth?: number;
    sol?: number;
    usdt?: number;
  }>({});
  const [pricesLoading, setPricesLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const fetchPrices = async () => {
      setPricesLoading(true);
      try {
        // CoinGecko simple prices (USD ~= USDT for display)
        const r = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd"
        ).then((x) => x.json());

        if (cancelled) return;

        setPrices({
          btc: Number(r?.bitcoin?.usd || 0),
          eth: Number(r?.ethereum?.usd || 0),
          sol: Number(r?.solana?.usd || 0),
          usdt: Number(r?.tether?.usd || 1),
        });
      } catch {
        if (!cancelled) setPrices({});
      } finally {
        if (!cancelled) setPricesLoading(false);
      }
    };

    fetchPrices();
    const id = window.setInterval(fetchPrices, 30_000); // refresh every 30s

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const PMKX_ADDRESS = "0xYourTokenAddress";
  const USDT_ADDRESS = "0xYourUsdtAddress";
  const PMKX_DECIMALS = 18;
  const USDT_DECIMALS = 6;

  const RPC_SOL = "https://api.mainnet-beta.solana.com"; // you can swap to a faster provider if needed
  const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
  ] as const;

  const shortAddr = (a?: string | null) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

  const [pmkxBalFmt, setPmkxBalFmt] = React.useState("0");
  const [usdtBalFmt, setUsdtBalFmt] = React.useState("0");
  const [ethBalFmt, setEthBalFmt] = React.useState("0");
  const [solBalFmt, setSolBalFmt] = React.useState("0");
  const [btcBalFmt, setBtcBalFmt] = React.useState("0"); // NOTE: only works if wallet supports it (rare)
  const [chainLoading, setChainLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!provider || !address) {
        setPmkxBalFmt("0");
        setUsdtBalFmt("0");
        setEthBalFmt("0");
        setSolBalFmt("0");
        setBtcBalFmt("0");
        return;
      }

      setChainLoading(true);

      try {
        // --- ERC20 balances (PMKX + USDT) ---
        const pmkx = new ethers.Contract(PMKX_ADDRESS, ERC20_ABI, provider);
        const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);

        const [pmkxRaw, usdtRaw] = await Promise.all([
          pmkx.balanceOf(address),
          usdt.balanceOf(address),
        ]);

        // --- ETH balance (native) ---
        const ethWei = await provider.getBalance(address);
        const ethFmt = ethers.utils.formatEther(ethWei);
        const pmkxFmt = ethers.utils.formatUnits(pmkxRaw, PMKX_DECIMALS);
        const usdtFmt = ethers.utils.formatUnits(usdtRaw, USDT_DECIMALS);

        // --- SOL balance (public RPC) ---
        // This is a best-effort display; it is NOT the same wallet as EVM.
        // If you want true multi-chain holdings per user, you need addresses per chain.
        let solFmt = "0";
        try {
          const body = {
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [address], // will fail unless the address is a Solana pubkey
          };
          const r = await fetch(RPC_SOL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }).then((x) => x.json());

          const lamports = Number(r?.result?.value || 0);
          solFmt = String(lamports / 1e9);
        } catch {
          solFmt = "0";
        }

        // --- BTC balance ---
        // BTC is not readable from an EVM address. Showing 0 unless you add a BTC address.
        const btcFmt = "0";

        if (cancelled) return;

        setEthBalFmt(ethFmt);
        setPmkxBalFmt(pmkxFmt);
        setUsdtBalFmt(usdtFmt);
        setSolBalFmt(solFmt);
        setBtcBalFmt(btcFmt);
      } catch {
        if (!cancelled) {
          setPmkxBalFmt("0");
          setUsdtBalFmt("0");
          setEthBalFmt("0");
          setSolBalFmt("0");
          setBtcBalFmt("0");
        }
      } finally {
        if (!cancelled) setChainLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [provider, address]);

  const [me, setMe] = React.useState<any | null>(null);
  const [info, setInfo] = React.useState<any | null>(null);
  const [mine, setMine] = React.useState<any[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = React.useState(true);

  // market raw points -> candles
  const [market, setMarket] = React.useState<PricePoint[]>([]);
  const [marketLoading, setMarketLoading] = React.useState(false);
  const [tf, setTf] = React.useState<"1m" | "5m" | "15m" | "1h">("5m");

  // wallet link
  const [wallet, setWallet] = React.useState<any | null>(null);
  const [linkWalletOpen, setLinkWalletOpen] = React.useState(false);
  const [usdtNet, setUsdtNet] = React.useState<"ERC20" | "TRC20">("TRC20");
  const [usdtAddr, setUsdtAddr] = React.useState("");
  const [linking, setLinking] = React.useState(false);

  // market order modal
  const [orderOpen, setOrderOpen] = React.useState(false);
  const [orderSide, setOrderSide] = React.useState<MarketSide>("BUY");

  // unstake modal
  const [unstakeLoading, setUnstakeLoading] = React.useState(false);
  const [unstakeOpen, setUnstakeOpen] = React.useState(false);
  const [unstakeMode, setUnstakeMode] = React.useState<"NORMAL" | "EARLY">("NORMAL");
  const [unstakeAmount, setUnstakeAmount] = React.useState<string>("");

  const refreshPortfolio = React.useCallback(async () => {
    const [i, p, w] = await Promise.all([
      getTokenInfo().catch(() => null),
      getMyTokenPurchases().catch(() => []),
      getMyWallet().catch(() => null),
    ]);
    setInfo(i);
    setMine(Array.isArray(p) ? p : []);
    setWallet(w);
  }, []);

  React.useEffect(() => {
    (async () => {
      setLoadingPortfolio(true);
      try {
        const meResp = await api.get("/users/me").catch(() => ({ data: null }));
        const u = meResp.data;
        setMe(u);

        if (!u?.id) {
          setInfo(null);
          setMine([]);
          setWallet(null);
          return;
        }

        await refreshPortfolio();
      } finally {
        setLoadingPortfolio(false);
      }
    })();
  }, [refreshPortfolio]);

  const fetchMarket = React.useCallback(async () => {
    const resp = await api.get("/tokens/market?limit=300");
    const arr = resp.data?.data || [];
    return (Array.isArray(arr) ? arr : []).map((x: any) => ({
      t: new Date(x.t).getTime(),
      price: Number(x.price || 0),
    }));
  }, []);

  React.useEffect(() => {
    (async () => {
      setMarketLoading(true);
      try {
        const pts = await fetchMarket().catch(() => []);
        setMarket(pts);
      } finally {
        setMarketLoading(false);
      }
    })();
  }, [fetchMarket]);

  const userTokens = React.useMemo(() => safeBigInt(info?.userTokens), [info?.userTokens]);
  const totalSupply = React.useMemo(
    () => safeBigInt(info?.totalSupply ?? TOKEN.totalSupply),
    [info?.totalSupply]
  );
  const profitSharePct = Number(info?.profitSharePct ?? 0.1);

  const hasHoldings = !!me?.id && userTokens > BigInt(0);
  const symbol = info?.symbol || TOKEN.symbol;

  const userPctPool = React.useMemo(() => {
    const totalN = safeToNumber(totalSupply);
    const userN = safeToNumber(userTokens);
    return totalN > 0 ? userN / totalN : 0;
  }, [totalSupply, userTokens]);

  const earnedUsdt = React.useMemo(() => {
    const v = info?.earnedUsdtEstimate ?? info?.earnedUsdt ?? null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [info]);

  const unlockAt = React.useMemo(() => {
    if (info?.unlockAt) return new Date(info.unlockAt);
    const confirmed = (mine || []).filter(
      (x) => String(x?.status || "").toUpperCase() === "CONFIRMED"
    );
    if (!confirmed.length) return null;
    const earliest = confirmed
      .map((x) => new Date(x?.confirmedAt || x?.createdAt || Date.now()).getTime())
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)[0];
    if (!earliest) return null;
    const months = Number(info?.stakingLockMonths ?? TOKEN.stakingLockMonths);
    const d = new Date(earliest);
    d.setMonth(d.getMonth() + (Number.isFinite(months) ? months : TOKEN.stakingLockMonths));
    return d;
  }, [info?.unlockAt, info?.stakingLockMonths, mine]);

  const isUnlockedNow = React.useMemo(() => {
    if (!unlockAt) return true;
    return Date.now() >= unlockAt.getTime();
  }, [unlockAt]);

  const maxTok = safeToNumber(userTokens);
  const feePct = 0.1;
  const amountN = Math.max(0, Number(unstakeAmount || 0));
  const clampedAmount = clamp(amountN, 0, maxTok);
  const feeTokens = unstakeMode === "EARLY" && !isUnlockedNow ? clampedAmount * feePct : 0;
  const receiveTokens = Math.max(0, clampedAmount - feeTokens);

  const lastPrice = React.useMemo(() => {
    const p = market.length
      ? market[market.length - 1].price
      : Number(info?.priceUsdtPerTok ?? TOKEN.initialPriceUsdt);
    return Number.isFinite(p) && p > 0 ? p : TOKEN.initialPriceUsdt;
  }, [market, info?.priceUsdtPerTok]);

  const candles = React.useMemo(
    () => buildCandles(market, intervalMsMap[tf] || intervalMsMap["5m"]),
    [market, tf]
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  const openBuy = () => {
    setOrderSide("BUY");
    setOrderOpen(true);
  };

  const openSell = () => {
    setOrderSide("SELL");
    setOrderOpen(true);
  };

  const handleOrderSubmit = async (payload: { tokens?: number; usdt?: number }) => {
    if (orderSide === "SELL" && !isUnlockedNow) {
      throw new Error(
        t("token.holdings.lockedUntil", { date: unlockAt?.toLocaleDateString?.() || "" })
      );
    }

    if (orderSide === "BUY") await marketBuy(payload);
    else await marketSell(payload);

    await refreshPortfolio();
    const pts = await fetchMarket().catch(() => []);
    setMarket(pts);
  };

  // -------------------- Content --------------------
  let content: React.ReactNode;

  if (loadingPortfolio && me?.id) {
    content = (
      <Container maxW="container.xl" py={{ base: 10, md: 14 }}>
        <HStack spacing={3}>
          <Spinner />
          <Text>{t("token.loadingPortfolio")}</Text>
        </HStack>
      </Container>
    );
  } else if (hasHoldings) {
    const positionValue = safeToNumber(userTokens) * (Number(lastPrice) || 0);
    const maxSellTokens = safeToNumber(userTokens);

    content = (
      <Container maxW="container.xl" py={{ base: 10, md: 14 }}>
        <SpotlightCard>
          <Box p={{ base: 5, md: 7 }}>
            <HStack justify="space-between" flexWrap="wrap" gap={3} mb={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="#65a8bf">
                  {t("token.holdings.title", { symbol })}
                </Heading>
                <Text opacity={0.85} color="#65a8bf">
                  {t("token.holdings.poolShare")} <b>{(userPctPool * 100).toFixed(6)}%</b>
                </Text>
              </VStack>

              <HStack gap={2} flexWrap="wrap">
                <ConnectWalletButton />

                <Button
                  variant="outline"
                  borderColor={AI.accent}
                  color={AI.accent}
                  onClick={() => window.open("/discord", "_self")}
                >
                  {t("token.holdings.enterTradingFloor")}
                </Button>
              </HStack>
            </HStack>
            {/* Exchange-style Wallet Card (TOP) */}
            {isConnected && address && (
              <Box mb={6}>
                <SpotlightCard>
                  <Box
                    p={{ base: 5, md: 6 }}
                    borderRadius="2xl"
                    bg="linear-gradient(135deg, rgba(0,191,99,0.10) 0%, rgba(11,19,34,0.85) 40%, rgba(7,12,24,0.65) 100%)"
                  >
                    <HStack justify="space-between" flexWrap="wrap" gap={4} mb={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" letterSpacing="0.12em" color="rgba(255,255,255,0.55)">
                          WALLET OVERVIEW
                        </Text>

                        <HStack spacing={3}>
                          <HStack spacing={2}>
                            <Box
                              w="10px"
                              h="10px"
                              borderRadius="full"
                              bg={chainLoading ? "#b7a27d" : "#65a8bf"}
                            />
                            <Text color="white" fontWeight="800">
                              {shortAddr(address)}
                            </Text>
                          </HStack>

                          <Button
                            size="xs"
                            variant="ghost"
                            color="#65a8bf"
                            leftIcon={<CopyIcon />}
                            onClick={() => {
                              navigator.clipboard.writeText(address);
                              toast({ title: "Copied address", status: "success", duration: 1200 });
                            }}
                          >
                            Copy
                          </Button>
                        </HStack>

                        {/* Portfolio total */}
                        <Text fontSize="sm" color="rgba(255,255,255,0.70)">
                          Portfolio (est.)
                          <Text as="span" ml={2} color="#65a8bf" fontWeight="800">
                            {(() => {
                              const usdtB = Number(usdtBalFmt) || 0;
                              const pmkxB = Number(pmkxBalFmt) || 0;
                              const ethB = Number(ethBalFmt) || 0;
                              const solB = Number(solBalFmt) || 0;
                              const btcB = Number(btcBalFmt) || 0;

                              const total =
                                usdtB * (prices.usdt || 1) +
                                pmkxB * (Number(lastPrice) || 0) +
                                ethB * (prices.eth || 0) +
                                solB * (prices.sol || 0) +
                                btcB * (prices.btc || 0);

                              return total > 0 ? `${formatNum(total, 2)} USDT` : "—";
                            })()}
                          </Text>
                        </Text>
                      </VStack>

                      {/* Trade actions only live here */}
                      <HStack gap={2} flexWrap="wrap">
                        <Button bg={AI.accent} color="black" onClick={openBuy}>
                          {t("token.holdings.marketBuy")}
                        </Button>

                        <Button
                          bg="#b7a27d"
                          color="black"
                          onClick={openSell}
                          isDisabled={!isUnlockedNow}
                          title={!isUnlockedNow ? t("token.holdings.lockedNote") : ""}
                        >
                          {t("token.holdings.marketSell")}
                        </Button>

                        <Button
                          variant="outline"
                          borderColor={AI.accent}
                          color={AI.accent}
                          onClick={() => setUnstakeOpen(true)}
                          isDisabled={safeToNumber(userTokens) <= 0}
                        >
                          {t("token.unstake.openBtn")}
                        </Button>
                      </HStack>
                    </HStack>

                    {chainLoading || pricesLoading ? (
                      <HStack>
                        <Spinner size="sm" />
                        <Text color="rgba(255,255,255,0.70)">Loading balances & prices…</Text>
                      </HStack>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        <AssetTile
                          icon={<UsdtIcon />}
                          symbol="USDT"
                          sub="Tether"
                          balance={Number(usdtBalFmt) || 0}
                          priceUsdt={prices.usdt || 1}
                          dpBal={2}
                          dpPrice={4}
                        />
                        <AssetTile
                          icon={<PmkxIcon />}
                          symbol="PMKX"
                          sub="Your token"
                          balance={Number(pmkxBalFmt) || 0}
                          priceUsdt={Number(lastPrice) || 0}
                          dpBal={2}
                          dpPrice={6}
                        />
                        <AssetTile
                          icon={<EthIcon />}
                          symbol="ETH"
                          sub="Ethereum"
                          balance={Number(ethBalFmt) || 0}
                          priceUsdt={prices.eth || 0}
                          dpBal={6}
                          dpPrice={2}
                        />
                        <AssetTile
                          icon={<SolIcon />}
                          symbol="SOL"
                          sub="Solana"
                          balance={Number(solBalFmt) || 0}
                          priceUsdt={prices.sol || 0}
                          dpBal={4}
                          dpPrice={2}
                        />
                        <AssetTile
                          icon={<BtcIcon />}
                          symbol="BTC"
                          sub="Bitcoin"
                          balance={Number(btcBalFmt) || 0}
                          priceUsdt={prices.btc || 0}
                          dpBal={6}
                          dpPrice={2}
                        />
                        <AssetTile
                          icon={<PmkxIcon />}
                          symbol="PMKX (Platform)"
                          sub="Locked / profit pool"
                          balance={safeToNumber(userTokens) || 0}
                          priceUsdt={Number(lastPrice) || 0}
                          dpBal={0}
                          dpPrice={6}
                        />
                      </SimpleGrid>
                    )}

                    <Text mt={4} fontSize="xs" color="rgba(255,255,255,0.50)">
                      SOL/BTC balances are best-effort unless you store per-chain addresses for the
                      user.
                    </Text>
                  </Box>
                </SpotlightCard>
              </Box>
            )}

            {/* Chart */}
            <Box mb={6} p={4} border="1px solid rgba(255,255,255,0.08)" borderRadius="xl">
              <HStack justify="space-between" flexWrap="wrap" gap={2} mb={3}>
                <VStack align="start" spacing={0}>
                  <Text color="#65a8bf" opacity={0.7} fontSize="sm">
                    {t("token.chart.title")}
                  </Text>
                  <Heading size="md" color="#65a8bf">
                    ${Number(lastPrice || 0).toFixed(4)} {t("token.order.usdt")}
                  </Heading>
                </VStack>

                <HStack gap={2}>
                  <Badge
                    borderRadius="full"
                    px={3}
                    py={1}
                    variant="outline"
                    borderColor={AI.accent}
                    color={AI.accent}
                  >
                    {TOKEN.pair}
                  </Badge>
                  <Select
                    value={tf}
                    onChange={(e) => setTf(e.target.value as any)}
                    size="sm"
                    bg="rgba(11,19,34,0.65)"
                    color="#65a8bf"
                    borderColor="rgba(255,255,255,0.15)"
                    w="110px"
                  >
                    <option value="1m">{t("token.chart.tf1m")}</option>
                    <option value="5m">{t("token.chart.tf5m")}</option>
                    <option value="15m">{t("token.chart.tf15m")}</option>
                    <option value="1h">{t("token.chart.tf1h")}</option>
                  </Select>
                </HStack>
              </HStack>

              {marketLoading ? (
                <HStack>
                  <Spinner />
                  <Text color="#65a8bf">{t("token.chart.loading")}</Text>
                </HStack>
              ) : candles.length ? (
                <CandleChart candles={candles} height={320} />
              ) : (
                <Text color="#65a8bf" opacity={0.7}>
                  {t("token.chart.noData")}
                </Text>
              )}
            </Box>

            {/* Metrics */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Box p={4} border="1px solid rgba(255,255,255,0.08)" borderRadius="xl">
                <Text color="#65a8bf" opacity={0.8}>
                  {t("token.holdings.tokensOwned")}
                </Text>
                <Heading size="md" color="#65a8bf">
                  {formatInt(safeToNumber(userTokens))}
                </Heading>
              </Box>

              <Box p={4} border="1px solid rgba(255,255,255,0.08)" borderRadius="xl">
                <Text color="#65a8bf" opacity={0.8}>
                  {t("token.holdings.positionValue")}
                </Text>
                <Heading size="md" color="#65a8bf">
                  ${formatNum(positionValue, 2)}
                </Heading>
              </Box>

              <Box p={4} border="1px solid rgba(255,255,255,0.08)" borderRadius="xl">
                <Text color="#65a8bf" opacity={0.8}>
                  {t("token.holdings.unlockDate")}
                </Text>
                <Heading size="md" color="#65a8bf">
                  {unlockAt ? unlockAt.toLocaleDateString() : "—"}
                </Heading>
                {!isUnlockedNow && (
                  <Text mt={1} fontSize="xs" color="#65a8bf" opacity={0.6}>
                    {t("token.holdings.lockedNote")}
                  </Text>
                )}
              </Box>

              <Box p={4} border="1px solid rgba(255,255,255,0.08)" borderRadius="xl">
                <Text color="#65a8bf" opacity={0.8}>
                  {t("token.holdings.earnedEstimate")}
                </Text>
                <Heading size="md" color="#65a8bf">
                  {earnedUsdt == null
                    ? "—"
                    : `${formatNum(earnedUsdt, 2)} ${t("token.order.usdt")}`}
                </Heading>
                <Text fontSize="xs" color="#65a8bf" opacity={0.55} mt={1}>
                  {t("token.holdings.earnedFormula", { pct: formatNum(profitSharePct * 100, 2) })}
                </Text>
              </Box>
            </SimpleGrid>

            <Divider my={6} borderColor="rgba(255,255,255,0.08)" />

            <Heading size="md" color="#65a8bf" mb={3}>
              {t("token.holdings.purchasesTitle")}
            </Heading>

            <VStack align="stretch" spacing={3}>
              {(mine || []).slice(0, 20).map((p) => (
                <Box key={p.id} p={4} border="1px solid rgba(255,255,255,0.08)" borderRadius="xl">
                  <HStack justify="space-between" flexWrap="wrap" gap={2}>
                    <Text color="#65a8bf">
                      {t("token.holdings.purchaseLine", {
                        tokens: formatInt(Number(p.tokens || 0)),
                        usdt: String(p.usdtDue ?? ""),
                      })}
                    </Text>
                    <Badge
                      colorScheme={
                        p.status === "CONFIRMED"
                          ? "green"
                          : p.status === "FAILED"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {String(p.status || "")}
                    </Badge>
                  </HStack>
                  <Text color="#65a8bf" opacity={0.7} fontSize="sm" mt={1}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </Text>
                </Box>
              ))}
            </VStack>

            {/* Market order modal */}
            <MarketOrderModal
              isOpen={orderOpen}
              onClose={() => setOrderOpen(false)}
              side={orderSide}
              symbol={symbol}
              price={lastPrice}
              maxSellTokens={maxSellTokens}
              onSubmit={handleOrderSubmit}
            />
          </Box>
        </SpotlightCard>
      </Container>
    );
  } else {
    content = (
      <Box>
        <Box py={{ base: 12, md: 18 }} borderBottom="1px solid rgba(255,255,255,0.06)">
          <Container maxW="container.xl">
            <MotionBox initial="hidden" animate="visible" variants={fadeIn}>
              <VStack align="start" spacing={5}>
                <HStack spacing={3} wrap="wrap">
                  <Badge borderRadius="full" px={4} py={1} colorScheme="cyan">
                    {t("token.landing.plannedBadge", { symbol: TOKEN.symbol })}
                  </Badge>
                  <Badge
                    borderRadius="full"
                    px={4}
                    py={1}
                    variant="outline"
                    borderColor={AI.accent}
                    color={AI.accent}
                  >
                    {TOKEN.pair}
                  </Badge>
                  <Badge
                    borderRadius="full"
                    px={4}
                    py={1}
                    variant="outline"
                    borderColor="#65a8bf"
                    color="#65a8bf"
                  >
                    {t("token.landing.totalSupply", { total: TOKEN.totalSupply.toLocaleString() })}
                  </Badge>
                </HStack>

                <Heading fontSize={{ base: "3xl", md: "5xl" }} color="#65a8bf">
                  {t("token.hero.title", { defaultValue: "The Desk Token for Traders" })}
                </Heading>

                <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9} color="#65a8bf" maxW="3xl">
                  {t("token.hero.sub", {
                    defaultValue:
                      "Built to power the Trading Floor experience: perks, rewards, and community access — with compliance-first rollout.",
                  })}
                </Text>

                <HStack spacing={3} wrap="wrap">
                  <Button
                    bg={AI.accent}
                    color="black"
                    boxShadow={AI.glow}
                    onClick={() => window.open("/discord", "_self")}
                  >
                    {t("token.landing.enterTradingFloor")}
                  </Button>
                  <Button
                    variant="outline"
                    borderColor={AI.accent}
                    color={AI.accent}
                    onClick={() => navigate("/products")}
                  >
                    {t("token.landing.explore")}
                  </Button>
                  <Button
                    variant="outline"
                    borderColor="#65a8bf"
                    color="#65a8bf"
                    onClick={() => navigate("/token/checkout")}
                  >
                    {t("token.landing.buyTokens")}
                  </Button>
                </HStack>

                <Box
                  mt={3}
                  p={4}
                  borderRadius="xl"
                  border="1px solid rgba(255,255,255,0.08)"
                  bg="rgba(15,23,42,0.6)"
                >
                  <Text fontSize="sm" color="#65a8bf" opacity={0.85}>
                    {t("token.landing.complianceNote", { defaultValue: TOKEN.complianceNote })}
                  </Text>
                </Box>
              </VStack>
            </MotionBox>
          </Container>
        </Box>

        <Container maxW="container.xl">
          <Section
            title={t("token.metrics.title", { defaultValue: "Token Snapshot" })}
            subtitle={t("token.metrics.sub", {
              defaultValue: "Simple, transparent initial parameters for the planned rollout.",
            })}
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {[
                {
                  labelKey: "token.metrics.initialPrice",
                  value: `$${TOKEN.initialPriceUsdt} USDT`,
                  icon: Coins,
                },
                { labelKey: "token.metrics.onlyPair", value: TOKEN.pair, icon: Layers },
                {
                  labelKey: "token.metrics.lock",
                  value: t("token.metrics.lockValue", { months: TOKEN.stakingLockMonths }),
                  icon: Clock,
                },
              ].map((m) => (
                <SpotlightCard key={m.labelKey}>
                  <Box p={6}>
                    <HStack spacing={3} mb={2}>
                      <Icon as={m.icon as any} boxSize={6} color={AI.accent} />
                      <Heading size="md" color="#65a8bf">
                        {m.value}
                      </Heading>
                    </HStack>
                    <Text opacity={0.85} color="#65a8bf">
                      {t(m.labelKey)}
                    </Text>
                  </Box>
                </SpotlightCard>
              ))}
            </SimpleGrid>
          </Section>

          <Section
            title={t("token.utilities.title", { defaultValue: "Utilities (Planned)" })}
            subtitle={t("token.utilities.sub", {
              defaultValue: "Designed to improve learning outcomes and community accountability.",
            })}
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {TOKEN.utilities.map((u) => (
                <SpotlightCard key={u.title}>
                  <Box p={6}>
                    <HStack spacing={3} mb={2}>
                      <Icon as={u.icon as any} boxSize={6} color={AI.accent} />
                      <Heading size="md" color="#65a8bf">
                        {t(`token.utilities.items.${u.title}.title`, { defaultValue: u.title })}
                      </Heading>
                    </HStack>
                    <Text opacity={0.9} color="#65a8bf">
                      {t(`token.utilities.items.${u.title}.body`, { defaultValue: u.body })}
                    </Text>
                  </Box>
                </SpotlightCard>
              ))}
            </SimpleGrid>
          </Section>

          <Section
            title={t("token.dist.title", { defaultValue: "Distribution (Draft)" })}
            subtitle={t("token.dist.sub", {
              defaultValue:
                "A transparent draft allocation model. Final allocations may change with compliance.",
            })}
          >
            <SpotlightCard>
              <Box p={{ base: 5, md: 6 }}>
                <VStack align="stretch" spacing={4}>
                  {TOKEN.distribution.map((d) => (
                    <Box key={d.label}>
                      <HStack justify="space-between" mb={1}>
                        <Text color="#65a8bf" fontWeight="semibold">
                          {t(`token.dist.items.${d.label}.label`, { defaultValue: d.label })}
                        </Text>
                        <Text color="#65a8bf" opacity={0.85}>
                          {d.pct}%
                        </Text>
                      </HStack>
                      <Box
                        w="100%"
                        bg="rgba(255,255,255,0.06)"
                        borderRadius="md"
                        h="10px"
                        overflow="hidden"
                      >
                        <Box w={`${d.pct}%`} h="10px" bg={AI.accent} />
                      </Box>
                      <Text fontSize="sm" color="#65a8bf" opacity={0.75} mt={1}>
                        {t(`token.dist.items.${d.label}.note`, { defaultValue: d.note })}
                      </Text>
                    </Box>
                  ))}
                </VStack>

                <Divider my={5} borderColor="rgba(255,255,255,0.08)" />
                <Text fontSize="sm" color="#65a8bf" opacity={0.75}>
                  {t("token.dist.footnote", {
                    defaultValue: "* Distribution shown is a draft for UI/roadmap context only.",
                  })}
                </Text>
              </Box>
            </SpotlightCard>
          </Section>

          <Box py={{ base: 10, md: 14 }}>
            <SpotlightCard>
              <Box p={{ base: 6, md: 8 }} textAlign="center">
                <Heading color={AI.accent} mb={2}>
                  {t("token.cta.title", { defaultValue: "Get started" })}
                </Heading>
                <Text opacity={0.9} color="#65a8bf" mb={5}>
                  {t("token.cta.sub", {
                    defaultValue:
                      "Buy tokens to unlock benefits and participate in the profit-share pool.",
                  })}
                </Text>
                <HStack justify="center" spacing={3} wrap="wrap">
                  <Button
                    bg={AI.accent}
                    color="black"
                    boxShadow={AI.glow}
                    onClick={() => navigate("/token/checkout")}
                  >
                    {t("token.cta.buyTokens", { defaultValue: "Buy Tokens" })}
                  </Button>
                  <Button
                    variant="outline"
                    borderColor={AI.accent}
                    color={AI.accent}
                    onClick={() => window.open("/discord", "_self")}
                  >
                    {t("token.cta.enterDiscord", { defaultValue: "Enter Discord" })}
                  </Button>
                </HStack>
              </Box>
            </SpotlightCard>
          </Box>
        </Container>
      </Box>
    );
  }

  // -------------------- Shared Modals (rendered for BOTH views) --------------------
  return (
    <Box position="relative">
      {content}

      {/* Unstake / Unlock */}
      <Modal isOpen={unstakeOpen} onClose={() => setUnstakeOpen(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent bg="rgba(11,19,34,0.98)" border={`1px solid ${AI.edge}`} borderRadius="xl">
          <ModalHeader color="#65a8bf">{t("token.unstake.title")}</ModalHeader>
          <ModalCloseButton color="#65a8bf" />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text color="#65a8bf" opacity={0.75} fontSize="sm">
                  {t("token.unstake.available")}
                </Text>
                <Text color="#65a8bf" fontWeight="bold">
                  {formatNum(maxTok, 0)} {symbol}
                </Text>
              </Box>

              {!isUnlockedNow && (
                <Box p={3} borderRadius="lg" border="1px solid rgba(255,255,255,0.10)">
                  <Text color="#65a8bf" fontSize="sm" fontWeight="bold">
                    {t("token.unstake.lockedHoldings")}
                  </Text>
                  <Text color="#65a8bf" opacity={0.75} fontSize="sm">
                    {t("token.unstake.unlockDate")} {unlockAt ? unlockAt.toLocaleDateString() : "—"}
                  </Text>
                  <Text mt={2} color="#65a8bf" fontSize="sm" fontWeight="bold">
                    {t("token.unstake.earlyWarningShort")}
                  </Text>
                </Box>
              )}

              <Tabs
                index={!isUnlockedNow && unstakeMode === "EARLY" ? 1 : 0}
                onChange={(i) => setUnstakeMode(i === 1 ? "EARLY" : "NORMAL")}
                variant="soft-rounded"
                colorScheme="cyan"
              >
                <TabList>
                  <Tab isDisabled={!isUnlockedNow}>{t("token.unstake.modeNormal")}</Tab>
                  <Tab isDisabled={isUnlockedNow}>{t("token.unstake.modeEarly")}</Tab>
                </TabList>
              </Tabs>

              <InputGroup>
                <Input
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder={t("token.unstake.placeholder")}
                  color="#65a8bf"
                  borderColor="rgba(255,255,255,0.15)"
                />
                <InputRightElement width="auto" pr={3}>
                  <Text color="#65a8bf" opacity={0.7}>
                    {symbol}
                  </Text>
                </InputRightElement>
              </InputGroup>

              <Box p={3} borderRadius="lg" border="1px solid rgba(255,255,255,0.10)">
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.75}>
                    {t("token.unstake.fee")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    {formatNum(feeTokens, 6)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="#65a8bf" opacity={0.75}>
                    {t("token.unstake.receive")}
                  </Text>
                  <Text color="#65a8bf" fontWeight="bold">
                    {formatNum(receiveTokens, 6)}
                  </Text>
                </HStack>

                {!isUnlockedNow && unstakeMode === "EARLY" && (
                  <Text mt={2} fontSize="sm" color="red.300">
                    {t("token.unstake.earlyForfeit")}
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack w="100%" justify="flex-end">
              <Button variant="ghost" color="#65a8bf" onClick={() => setUnstakeOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                bg={AI.accent}
                color="black"
                isLoading={unstakeLoading}
                isDisabled={clampedAmount <= 0 || clampedAmount > maxTok}
                onClick={async () => {
                  setUnstakeLoading(true);
                  try {
                    await unstakeTokens({
                      tokens: clampedAmount,
                      earlyUnlock: !isUnlockedNow && unstakeMode === "EARLY",
                    });
                    await refreshPortfolio();
                    setUnstakeOpen(false);
                    setUnstakeAmount("");
                    toast({
                      title: t("token.unstake.success"),
                      status: "success",
                      duration: 2500,
                      isClosable: true,
                    });
                  } catch (e: any) {
                    toast({
                      title: t("token.unstake.failTitle"),
                      description:
                        e?.response?.data?.message || e?.message || t("common.requestFailed"),
                      status: "error",
                      duration: 4000,
                      isClosable: true,
                    });
                  } finally {
                    setUnstakeLoading(false);
                  }
                }}
              >
                {t("token.unstake.confirm")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Link USDT Wallet */}
      <Modal isOpen={linkWalletOpen} onClose={() => setLinkWalletOpen(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent bg="rgba(11,19,34,0.98)" border={`1px solid ${AI.edge}`} borderRadius="xl">
          <ModalHeader color="#65a8bf">{t("token.wallet.title")}</ModalHeader>
          <ModalCloseButton color="#65a8bf" />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Tabs
                index={usdtNet === "TRC20" ? 0 : 1}
                onChange={(i) => setUsdtNet(i === 0 ? "TRC20" : "ERC20")}
                variant="soft-rounded"
                colorScheme="cyan"
              >
                <TabList>
                  <Tab>{t("token.wallet.trc20")}</Tab>
                  <Tab>{t("token.wallet.erc20")}</Tab>
                </TabList>
              </Tabs>

              <Input
                value={usdtAddr}
                onChange={(e) => setUsdtAddr(e.target.value)}
                placeholder={
                  usdtNet === "TRC20"
                    ? t("token.wallet.placeholderTrc")
                    : t("token.wallet.placeholderErc")
                }
                color="#65a8bf"
                borderColor="rgba(255,255,255,0.15)"
              />

              <Text color="#65a8bf" opacity={0.65} fontSize="sm">
                {t("token.wallet.note")}
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack w="100%" justify="flex-end">
              <Button
                variant="ghost"
                color="#65a8bf"
                onClick={() => setLinkWalletOpen(false)}
                isDisabled={linking}
              >
                {t("common.cancel")}
              </Button>
              <Button
                bg={AI.accent}
                color="black"
                isLoading={linking}
                onClick={async () => {
                  setLinking(true);
                  try {
                    await linkUsdtWallet({ address: usdtAddr.trim(), network: usdtNet });
                    await refreshPortfolio();
                    setLinkWalletOpen(false);
                    toast({
                      title: t("token.wallet.success"),
                      status: "success",
                      duration: 2500,
                      isClosable: true,
                    });
                  } catch (e: any) {
                    toast({
                      title: t("token.wallet.failTitle"),
                      description:
                        e?.response?.data?.message || e?.message || t("common.requestFailed"),
                      status: "error",
                      duration: 4000,
                      isClosable: true,
                    });
                  } finally {
                    setLinking(false);
                  }
                }}
              >
                {t("common.save")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TokenPage;
