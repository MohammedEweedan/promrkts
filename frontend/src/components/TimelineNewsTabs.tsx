// src/components/TimelineNewsTabs.tsx
/* eslint-disable */
import * as React from "react";
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  HStack,
  Text,
  Badge,
  Skeleton,
  Link,
  Icon,
} from "@chakra-ui/react";
import { ExternalLink, Newspaper, TrendingUp, Radio, Zap, Globe, DollarSign, Cpu } from "lucide-react";

type Props = {
  mode: "light" | "dark";
  accentColor?: string;
  height?: number;
};

// ===== TradingView Timeline embed =====
function tvTimelineUrl(theme: "light" | "dark", market?: string) {
  const base = "https://s.tradingview.com/embed-widget/timeline/";
  const query = `?locale=en`;
  const config: any = {
    colorTheme: theme,
    isTransparent: false,
    displayMode: "adaptive",
  };
  if (market) config.market = market;
  const cfg = encodeURIComponent(JSON.stringify(config));
  return `${base}${query}#${cfg}`;
}

// ===== RSS Feed Sources — comprehensive list =====
type FeedSource = {
  name: string;
  url: string;
  tag: string;
  color: string;
  category: "finance" | "crypto" | "forex" | "world" | "tech";
};

const ALL_RSS_SOURCES: FeedSource[] = [
  // --- Financial / Markets ---
  { name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", tag: "Finance", color: "orange", category: "finance" },
  { name: "CNBC Markets", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", tag: "Markets", color: "orange", category: "finance" },
  { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", tag: "Markets", color: "blue", category: "finance" },
  { name: "MW Pulse", url: "https://feeds.marketwatch.com/marketwatch/marketpulse/", tag: "Markets", color: "blue", category: "finance" },
  { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews", tag: "Business", color: "teal", category: "finance" },
  { name: "Reuters Corp", url: "https://feeds.reuters.com/reuters/companyNews", tag: "Business", color: "teal", category: "finance" },
  { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss", tag: "Finance", color: "purple", category: "finance" },
  { name: "Yahoo Finance", url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", tag: "Finance", color: "purple", category: "finance" },
  { name: "Investing.com", url: "https://www.investing.com/rss/news.rss", tag: "Markets", color: "green", category: "finance" },
  { name: "Seeking Alpha", url: "https://seekingalpha.com/market_currents.xml", tag: "Markets", color: "orange", category: "finance" },
  { name: "Financial Times", url: "https://www.ft.com/?format=rss", tag: "Finance", color: "pink", category: "finance" },
  { name: "Economist", url: "https://www.economist.com/finance-and-economics/rss.xml", tag: "Economy", color: "red", category: "finance" },
  // --- Crypto ---
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", tag: "Crypto", color: "purple", category: "crypto" },
  { name: "CoinTelegraph", url: "https://cointelegraph.com/rss", tag: "Crypto", color: "blue", category: "crypto" },
  { name: "Decrypt", url: "https://decrypt.co/feed", tag: "Crypto", color: "cyan", category: "crypto" },
  { name: "Bitcoin Mag", url: "https://bitcoinmagazine.com/.rss/full/", tag: "Bitcoin", color: "orange", category: "crypto" },
  // --- Forex / Commodities ---
  { name: "ForexLive", url: "https://www.forexlive.com/feed/news", tag: "Forex", color: "green", category: "forex" },
  { name: "FXStreet", url: "https://www.fxstreet.com/rss/news", tag: "Forex", color: "teal", category: "forex" },
  { name: "DailyFX", url: "https://www.dailyfx.com/feeds/market-news", tag: "Forex", color: "blue", category: "forex" },
  // --- World / General ---
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", tag: "World", color: "red", category: "world" },
  { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", tag: "Business", color: "red", category: "world" },
  { name: "NYT Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", tag: "Business", color: "gray", category: "world" },
  { name: "NYT World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", tag: "World", color: "gray", category: "world" },
  { name: "WaPo Business", url: "https://feeds.washingtonpost.com/rss/business", tag: "Business", color: "gray", category: "world" },
  { name: "WaPo World", url: "https://feeds.washingtonpost.com/rss/world", tag: "World", color: "gray", category: "world" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", tag: "World", color: "orange", category: "world" },
  { name: "AP News", url: "https://rss.app/feeds/v1.1/tGXWfDFCYDkSZhkl.xml", tag: "World", color: "red", category: "world" },
  { name: "Guardian World", url: "https://www.theguardian.com/world/rss", tag: "World", color: "blue", category: "world" },
  { name: "Guardian Biz", url: "https://www.theguardian.com/business/rss", tag: "Business", color: "blue", category: "world" },
  // --- Tech ---
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", tag: "Tech", color: "orange", category: "tech" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", tag: "Tech", color: "green", category: "tech" },
];

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  tag: string;
  tagColor: string;
  description?: string;
};

const RSS2JSON_API = "https://api.rss2json.com/v1/api.json";

async function fetchRssFeed(feedUrl: string, sourceName: string, tag: string, tagColor: string): Promise<RssItem[]> {
  try {
    const resp = await fetch(
      `${RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) return [];
    return data.items.map((item: any) => ({
      title: (item.title || "").trim(),
      link: item.link || "",
      pubDate: item.pubDate || "",
      source: sourceName,
      tag,
      tagColor,
      description: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    })).filter((i: RssItem) => i.title);
  } catch {
    return [];
  }
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

// ===== News Item Component =====
const NewsItem: React.FC<{ item: RssItem; mode: string }> = ({ item, mode }) => {
  const isDark = mode === "dark";
  const isRecent = Date.now() - new Date(item.pubDate).getTime() < 3600000;

  return (
    <Link
      href={item.link}
      isExternal
      _hover={{ textDecoration: "none" }}
      display="block"
    >
      <Box
        px={4}
        py={3}
        borderBottom="1px solid"
        borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
        _hover={{
          bg: isDark ? "whiteAlpha.50" : "gray.50",
        }}
        transition="background 0.15s"
        position="relative"
      >
        {isRecent && (
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="3px"
            bg="red.400"
            borderRadius="full"
          />
        )}
        <HStack justify="space-between" align="flex-start" spacing={3}>
          <VStack align="start" spacing={1} flex={1}>
            <Text
              fontSize="sm"
              fontWeight={isRecent ? "bold" : "semibold"}
              noOfLines={2}
              lineHeight="1.4"
              color={isDark ? "white" : "gray.900"}
            >
              {isRecent && <Icon as={Zap} boxSize={3} color="red.400" mr={1} />}
              {item.title}
            </Text>
            {item.description && (
              <Text fontSize="xs" noOfLines={1} color={isDark ? "gray.400" : "gray.600"}>
                {item.description}
              </Text>
            )}
          </VStack>
          <VStack align="end" spacing={1} flexShrink={0}>
            <Badge
              fontSize="0.6rem"
              colorScheme={item.tagColor}
              variant="subtle"
              borderRadius="full"
              px={2}
            >
              {item.tag}
            </Badge>
            <Text fontSize="0.65rem" color={isDark ? "gray.500" : "gray.500"} whiteSpace="nowrap">
              {timeAgo(item.pubDate)}
            </Text>
          </VStack>
        </HStack>
        <HStack mt={1} spacing={2}>
          <Text fontSize="0.6rem" color={isDark ? "gray.500" : "gray.500"} fontWeight="500">
            {item.source}
          </Text>
          <Icon as={ExternalLink} boxSize={2.5} color={isDark ? "gray.600" : "gray.400"} />
        </HStack>
      </Box>
    </Link>
  );
};

// ===== RSS Feed Panel =====
const RssFeedPanel: React.FC<{ mode: string; height: number; sources: FeedSource[] }> = ({
  mode,
  height,
  sources,
}) => {
  const isDark = mode === "dark";
  const [items, setItems] = React.useState<RssItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Stable key so we don't refetch on every render
  const sourceKey = React.useMemo(() => sources.map((s) => s.url).join("|"), [sources]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled(
      sources.map((s) => fetchRssFeed(s.url, s.name, s.tag, s.color))
    ).then((results) => {
      if (cancelled) return;
      const all: RssItem[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") all.push(...r.value);
      }
      // Deduplicate
      const seen = new Set<string>();
      const unique = all.filter((item) => {
        const key = item.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(unique);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [sourceKey]);

  if (loading) {
    return (
      <VStack spacing={3} p={4} align="stretch">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            height="60px"
            borderRadius="md"
            startColor={isDark ? "gray.700" : "gray.200"}
            endColor={isDark ? "gray.600" : "gray.300"}
          />
        ))}
      </VStack>
    );
  }

  if (items.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color={isDark ? "gray.400" : "gray.600"} fontSize="sm">
          No news available at the moment.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxH={`${height}px`}
      overflowY="auto"
      sx={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { bg: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bg: isDark ? "whiteAlpha.200" : "blackAlpha.200",
          borderRadius: "full",
        },
      }}
    >
      {items.map((item, idx) => (
        <NewsItem key={`${item.link}-${idx}`} item={item} mode={mode} />
      ))}
    </Box>
  );
};

// ===== Filtered source lists =====
const FINANCE_SOURCES = ALL_RSS_SOURCES.filter((s) => s.category === "finance");
const CRYPTO_SOURCES = ALL_RSS_SOURCES.filter((s) => s.category === "crypto");
const FOREX_SOURCES = ALL_RSS_SOURCES.filter((s) => s.category === "forex");
const WORLD_SOURCES = ALL_RSS_SOURCES.filter((s) => s.category === "world");

// ===== Main Component =====
const TimelineNewsTabs: React.FC<Props> = ({ mode, accentColor = "#65a8bf", height = 540 }) => {
  const tvAllSrc = React.useMemo(() => tvTimelineUrl(mode), [mode]);
  const isDark = mode === "dark";

  const tabs = [
    { label: "All News", icon: Newspaper },
    { label: "Finance", icon: DollarSign },
    { label: "Crypto", icon: Radio },
    { label: "Forex", icon: TrendingUp },
    { label: "World", icon: Globe },
    { label: "Tech", icon: Cpu },
    { label: "TradingView", icon: TrendingUp },
  ];

  return (
    <Box borderRadius="xl" overflow="hidden" bg={isDark ? "rgba(15, 23, 42, 0.9)" : "white"}>
      <Tabs variant="unstyled" isLazy defaultIndex={0}>
        <TabList
          bg={isDark ? "rgba(15, 23, 42, 0.8)" : "white"}
          borderBottom="1px solid"
          borderColor={isDark ? "whiteAlpha.100" : "gray.200"}
          px={2}
          pt={2}
          gap={1}
          overflowX="auto"
          sx={{
            "&::-webkit-scrollbar": { height: "0px" },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              fontSize="xs"
              fontWeight="600"
              px={3}
              py={2}
              borderRadius="lg"
              color={isDark ? "gray.400" : "gray.600"}
              _selected={{
                bg: accentColor,
                color: "white",
                boxShadow: `0 0 12px ${accentColor}40`,
              }}
              _hover={{
                bg: isDark ? "whiteAlpha.100" : "gray.100",
              }}
              transition="all 0.2s"
              whiteSpace="nowrap"
            >
              <HStack spacing={1.5}>
                <Icon as={tab.icon} boxSize={3.5} />
                <Text>{tab.label}</Text>
              </HStack>
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {/* All News — every RSS source */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} sources={ALL_RSS_SOURCES} />
          </TabPanel>

          {/* Finance */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} sources={FINANCE_SOURCES} />
          </TabPanel>

          {/* Crypto */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} sources={CRYPTO_SOURCES} />
          </TabPanel>

          {/* Forex */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} sources={FOREX_SOURCES} />
          </TabPanel>

          {/* World */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} sources={WORLD_SOURCES} />
          </TabPanel>

          {/* Tech */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} sources={ALL_RSS_SOURCES.filter((s) => s.category === "tech")} />
          </TabPanel>

          {/* TradingView (kept as last tab) */}
          <TabPanel p={0}>
            <iframe
              key={`tv-all-${mode}`}
              title="TradingView Market News"
              src={tvAllSrc}
              style={{ border: 0, width: "100%", height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write; fullscreen"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TimelineNewsTabs;
