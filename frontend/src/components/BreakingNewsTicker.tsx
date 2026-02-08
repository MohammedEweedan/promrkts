// src/components/BreakingNewsTicker.tsx
// Breaking news ticker tape for high-impact financial events
/* eslint-disable */
import React from "react";
import { Box, HStack, Text, Icon, keyframes } from "@chakra-ui/react";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";

const ACCENT = "#65a8bf";

const scrollLeft = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

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

// RSS2JSON proxy for fetching economic calendar / breaking news
const RSS2JSON_API = "https://api.rss2json.com/v1/api.json";

const TICKER_SOURCES = [
  {
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    name: "CNBC",
  },
  {
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    name: "MarketWatch",
  },
  {
    url: "https://feeds.reuters.com/reuters/businessNews",
    name: "Reuters",
  },
];

async function fetchTickerItems(): Promise<TickerItem[]> {
  const items: TickerItem[] = [];

  const results = await Promise.allSettled(
    TICKER_SOURCES.map(async (source) => {
      try {
        const resp = await fetch(
          `${RSS2JSON_API}?rss_url=${encodeURIComponent(source.url)}&count=10`
        );
        if (!resp.ok) return [];
        const data = await resp.json();
        if (data.status !== "ok" || !Array.isArray(data.items)) return [];
        return data.items.map((item: any) => {
          const title = (item.title || "").trim();
          const pubDate = item.pubDate || "";
          const link = item.link || "";
          const highImpact = /breaking|urgent|flash|alert|crash|surge|plunge|emergency|war|rate.*(decision|cut|hike)|nfp|fomc|cpi|gdp/i.test(title);
          const medImpact = /report|data|release|update|forecast|expect/i.test(title);
          return {
            text: title,
            impact: highImpact ? "high" : medImpact ? "medium" : "low",
            source: source.name,
            time: pubDate,
            link,
          } as TickerItem;
        });
      } catch {
        return [];
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  // Sort: high impact first, then by recency
  items.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const diff = impactOrder[a.impact] - impactOrder[b.impact];
    if (diff !== 0) return diff;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  return items.slice(0, 20);
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

const BreakingNewsTicker: React.FC<Props> = ({ mode }) => {
  const [items, setItems] = React.useState<TickerItem[]>(FALLBACK_ITEMS);
  const isDark = mode === "dark";

  React.useEffect(() => {
    let cancelled = false;
    fetchTickerItems().then((fetched) => {
      if (cancelled) return;
      if (fetched.length > 0) setItems(fetched);
    });
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchTickerItems().then((fetched) => {
        if (cancelled) return;
        if (fetched.length > 0) setItems(fetched);
      });
    }, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const hasHighImpact = items.some((i) => i.impact === "high");

  // Duplicate items for seamless scroll
  const doubled = [...items, ...items];

  return (
    <Box
      w="100%"
      overflow="hidden"
      bg={isDark
        ? hasHighImpact
          ? "rgba(220, 38, 38, 0.08)"
          : "rgba(6, 10, 20, 0.95)"
        : hasHighImpact
          ? "rgba(220, 38, 38, 0.05)"
          : "rgba(248, 250, 252, 0.95)"
      }
      borderBottom="1px solid"
      borderColor={
        hasHighImpact
          ? "rgba(220, 38, 38, 0.3)"
          : isDark
            ? "whiteAlpha.100"
            : "blackAlpha.100"
      }
      py={1.5}
      position="relative"
      zIndex={100}
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
            animation="pulse 2s infinite"
            sx={{
              "@keyframes pulse": {
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

      {/* Scrolling content */}
      <Box
        display="flex"
        animation={{
          base: `${scrollLeft} ${Math.max(12, items.length * 1.5)}s linear infinite`,
          md: `${scrollLeft} ${Math.max(18, items.length * 2)}s linear infinite`,
        }}
        _hover={{ animationPlayState: "paused" }}
        pl="80px"
      >
        {doubled.map((item, idx) => (
          <HStack
            key={`${item.text}-${idx}`}
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
                  : isDark
                    ? "gray.300"
                    : "gray.700"
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
