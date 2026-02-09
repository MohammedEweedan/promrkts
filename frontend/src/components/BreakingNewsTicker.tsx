// src/components/BreakingNewsTicker.tsx
// Breaking news ticker tape — JS-based scroll (no CSS animation restart glitch)
/* eslint-disable */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Box, HStack, Text, Icon } from "@chakra-ui/react";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";

const ACCENT = "#65a8bf";

type TickerItem = {
  text: string;
  impact: "high" | "medium" | "low";
  source: string;
  time: string;
  link: string;
};

type Props = {
  mode: "dark" | "light";
};

// ===== Massive list of free RSS sources =====
const RSS2JSON_API = "https://api.rss2json.com/v1/api.json";

const TICKER_SOURCES = [
  // --- Financial / Markets ---
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", name: "CNBC" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", name: "CNBC Markets" },
  { url: "https://feeds.marketwatch.com/marketwatch/topstories/", name: "MarketWatch" },
  { url: "https://feeds.marketwatch.com/marketwatch/marketpulse/", name: "MW Pulse" },
  { url: "https://feeds.reuters.com/reuters/businessNews", name: "Reuters" },
  { url: "https://feeds.reuters.com/reuters/companyNews", name: "Reuters Corp" },
  { url: "https://feeds.bloomberg.com/markets/news.rss", name: "Bloomberg" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", name: "Yahoo Finance" },
  { url: "https://www.investing.com/rss/news.rss", name: "Investing.com" },
  { url: "https://seekingalpha.com/market_currents.xml", name: "Seeking Alpha" },
  { url: "https://www.ft.com/?format=rss", name: "Financial Times" },
  // --- Crypto ---
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", name: "CoinDesk" },
  { url: "https://cointelegraph.com/rss", name: "CoinTelegraph" },
  { url: "https://decrypt.co/feed", name: "Decrypt" },
  { url: "https://bitcoinmagazine.com/.rss/full/", name: "Bitcoin Mag" },
  // --- Forex / Commodities ---
  { url: "https://www.forexlive.com/feed/news", name: "ForexLive" },
  { url: "https://www.fxstreet.com/rss/news", name: "FXStreet" },
  { url: "https://www.dailyfx.com/feeds/market-news", name: "DailyFX" },
  // --- World / General ---
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC Business" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NYT Business" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NYT World" },
  { url: "https://feeds.washingtonpost.com/rss/business", name: "WaPo Business" },
  { url: "https://feeds.washingtonpost.com/rss/world", name: "WaPo World" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  { url: "https://rss.app/feeds/v1.1/tGXWfDFCYDkSZhkl.xml", name: "AP News" },
  { url: "https://www.theguardian.com/world/rss", name: "Guardian World" },
  { url: "https://www.theguardian.com/business/rss", name: "Guardian Biz" },
  // --- Tech / Economy ---
  { url: "https://feeds.arstechnica.com/arstechnica/index", name: "Ars Technica" },
  { url: "https://techcrunch.com/feed/", name: "TechCrunch" },
  { url: "https://www.economist.com/finance-and-economics/rss.xml", name: "Economist" },
];

async function fetchTickerItems(): Promise<TickerItem[]> {
  const items: TickerItem[] = [];

  // Fetch all sources in parallel, 15 items each
  const results = await Promise.allSettled(
    TICKER_SOURCES.map(async (source) => {
      try {
        const resp = await fetch(
          `${RSS2JSON_API}?rss_url=${encodeURIComponent(source.url)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!resp.ok) return [];
        const data = await resp.json();
        if (data.status !== "ok" || !Array.isArray(data.items)) return [];
        return data.items.map((item: any) => {
          const title = (item.title || "").trim();
          if (!title) return null;
          const pubDate = item.pubDate || "";
          const link = item.link || "";
          const highImpact = /breaking|urgent|flash|alert|crash|surge|plunge|emergency|war|rate.*(decision|cut|hike)|nfp|fomc|cpi|gdp|recession|default|bankrupt|sanctions|invasion|missile|nuclear/i.test(title);
          const medImpact = /report|data|release|update|forecast|expect|earnings|profit|loss|inflation|unemployment|fed |ecb |boj |rba /i.test(title);
          return {
            text: title,
            impact: highImpact ? "high" : medImpact ? "medium" : "low",
            source: source.name,
            time: pubDate,
            link,
          } as TickerItem;
        }).filter(Boolean) as TickerItem[];
      } catch {
        return [];
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = item.text.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: high impact first, then by recency
  unique.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const diff = impactOrder[a.impact] - impactOrder[b.impact];
    if (diff !== 0) return diff;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  // Return ALL items — no cap
  return unique;
}

// Fallback headlines when RSS fails
const FALLBACK_ITEMS: TickerItem[] = [
  { text: "Markets open — Track live prices on your dashboard", impact: "low", source: "promrkts", time: "", link: "" },
  { text: "Gold, Forex, Crypto & Indices — All in one terminal", impact: "low", source: "promrkts", time: "", link: "" },
  { text: "Upgrade to unlock full market data & AI news", impact: "medium", source: "promrkts", time: "", link: "" },
];

const impactIcon = (impact: string) => {
  if (impact === "high") return AlertTriangle;
  if (impact === "medium") return TrendingUp;
  return Zap;
};

const impactColor = (impact: string) => {
  if (impact === "high") return "red.400";
  if (impact === "medium") return "orange.300";
  return ACCENT;
};

// ===== JS-based marquee: never restarts on re-render =====
const BreakingNewsTicker: React.FC<Props> = ({ mode }) => {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_ITEMS);
  const isDark = mode === "dark";

  const scrollRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const hoveredRef = useRef(false);
  const speedRef = useRef(1.2); // px per frame — fast

  // Fetch on mount + every 3 minutes
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchTickerItems().then((fetched) => {
        if (cancelled || fetched.length === 0) return;
        setItems(fetched);
      });
    };
    load();
    const interval = setInterval(load, 3 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // rAF scroll loop — survives re-renders without restart
  useEffect(() => {
    const tick = () => {
      if (!hoveredRef.current && scrollRef.current) {
        offsetRef.current += speedRef.current;
        const half = scrollRef.current.scrollWidth / 2;
        if (half > 0 && offsetRef.current >= half) {
          offsetRef.current -= half;
        }
        scrollRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const hasHighImpact = items.some((i) => i.impact === "high");

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <Box
      w="100%"
      overflow="hidden"
      bg={isDark
        ? hasHighImpact ? "rgba(220, 38, 38, 0.08)" : "rgba(6, 10, 20, 0.95)"
        : hasHighImpact ? "rgba(220, 38, 38, 0.05)" : "rgba(248, 250, 252, 0.95)"
      }
      borderBottom="1px solid"
      borderColor={
        hasHighImpact
          ? "rgba(220, 38, 38, 0.3)"
          : isDark ? "whiteAlpha.100" : "blackAlpha.100"
      }
      py={1.5}
      position="relative"
      zIndex={9999}
    >
      {/* LIVE badge */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        zIndex={2}
        display="flex"
        alignItems="center"
        px={3}
        bg={isDark
          ? "linear-gradient(90deg, rgba(6, 10, 20, 1) 70%, transparent)"
          : "linear-gradient(90deg, rgba(248, 250, 252, 1) 70%, transparent)"
        }
      >
        <HStack spacing={1.5}>
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={hasHighImpact ? "red.400" : "green.400"}
            boxShadow={`0 0 6px ${hasHighImpact ? "rgba(220,38,38,0.6)" : "rgba(34,197,94,0.6)"}`}
            sx={{
              animation: "tickerPulse 2s infinite",
              "@keyframes tickerPulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
          <Text
            fontSize="0.6rem"
            fontWeight="800"
            textTransform="uppercase"
            letterSpacing="0.1em"
            color={hasHighImpact ? "red.400" : ACCENT}
          >
            {hasHighImpact ? "BREAKING" : "LIVE"}
          </Text>
        </HStack>
      </Box>

      {/* Scrolling content — JS driven, no CSS animation */}
      <Box
        ref={scrollRef}
        display="flex"
        willChange="transform"
        pl="80px"
        onMouseEnter={() => { hoveredRef.current = true; }}
        onMouseLeave={() => { hoveredRef.current = false; }}
      >
        {doubled.map((item, idx) => (
          <HStack
            key={`${idx}-${item.text.slice(0, 20)}`}
            as={item.link ? "a" : "div"}
            {...(item.link ? { href: item.link, target: "_blank", rel: "noopener noreferrer" } : {})}
            spacing={1.5}
            flexShrink={0}
            px={4}
            cursor={item.link ? "pointer" : "default"}
            _hover={item.link ? { opacity: 0.8 } : {}}
            transition="opacity 0.15s"
          >
            <Icon
              as={impactIcon(item.impact)}
              boxSize={3}
              color={impactColor(item.impact)}
            />
            <Text
              fontSize="xs"
              fontWeight={item.impact === "high" ? "bold" : "medium"}
              color={
                item.impact === "high"
                  ? "red.300"
                  : isDark ? "gray.300" : "gray.700"
              }
              whiteSpace="nowrap"
              textDecoration="none"
            >
              {item.text}
            </Text>
            <Text fontSize="0.55rem" opacity={0.4} whiteSpace="nowrap">
              {item.source}
            </Text>
            <Box
              w="4px"
              h="4px"
              borderRadius="full"
              bg={isDark ? "whiteAlpha.200" : "blackAlpha.200"}
              flexShrink={0}
            />
          </HStack>
        ))}
      </Box>

      {/* Right fade */}
      <Box
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="40px"
        bg={isDark
          ? "linear-gradient(270deg, rgba(6, 10, 20, 1), transparent)"
          : "linear-gradient(270deg, rgba(248, 250, 252, 1), transparent)"
        }
        zIndex={2}
        pointerEvents="none"
      />
    </Box>
  );
};

export default BreakingNewsTicker;
