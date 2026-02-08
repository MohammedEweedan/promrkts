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
import { ExternalLink, Newspaper, TrendingUp, Radio, Zap } from "lucide-react";

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
    isTransparent: true,
    displayMode: "adaptive",
  };
  if (market) config.market = market;
  const cfg = encodeURIComponent(JSON.stringify(config));
  return `${base}${query}#${cfg}`;
}

// ===== RSS Feed Sources =====
const RSS_SOURCES = [
  {
    name: "Investing.com",
    url: "https://www.investing.com/rss/news.rss",
    tag: "Markets",
    color: "blue",
  },
  {
    name: "FX Street",
    url: "https://www.fxstreet.com/rss",
    tag: "Forex",
    color: "green",
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    tag: "Crypto",
    color: "purple",
  },
  {
    name: "CNBC Markets",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    tag: "Finance",
    color: "orange",
  },
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/news/rssindex",
    tag: "Markets",
    color: "cyan",
  },
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
    const resp = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}&count=15`);
    if (!resp.ok) return [];
    const data = await resp.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) return [];
    return data.items.map((item: any) => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || "",
      source: sourceName,
      tag,
      tagColor,
      description: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    }));
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
  const isRecent = Date.now() - new Date(item.pubDate).getTime() < 3600000; // < 1 hour

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
        borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
        _hover={{
          bg: isDark ? "whiteAlpha.50" : "blackAlpha.50",
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
              color={isDark ? "white" : "gray.800"}
            >
              {isRecent && <Icon as={Zap} boxSize={3} color="red.400" mr={1} />}
              {item.title}
            </Text>
            {item.description && (
              <Text fontSize="xs" noOfLines={1} opacity={0.6}>
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
            <Text fontSize="0.65rem" opacity={0.5} whiteSpace="nowrap">
              {timeAgo(item.pubDate)}
            </Text>
          </VStack>
        </HStack>
        <HStack mt={1} spacing={2}>
          <Text fontSize="0.6rem" opacity={0.4} fontWeight="500">
            {item.source}
          </Text>
          <Icon as={ExternalLink} boxSize={2.5} opacity={0.3} />
        </HStack>
      </Box>
    </Link>
  );
};

// ===== RSS Feed Panel =====
const RssFeedPanel: React.FC<{ mode: string; height: number; sources?: typeof RSS_SOURCES }> = ({
  mode,
  height,
  sources = RSS_SOURCES,
}) => {
  const [items, setItems] = React.useState<RssItem[]>([]);
  const [loading, setLoading] = React.useState(true);

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
      // Sort by date descending
      all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setItems(all);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [sources]);

  if (loading) {
    return (
      <VStack spacing={3} p={4} align="stretch">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height="60px" borderRadius="md" startColor="gray.700" endColor="gray.600" />
        ))}
      </VStack>
    );
  }

  if (items.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text opacity={0.5} fontSize="sm">No news available at the moment.</Text>
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
        "&::-webkit-scrollbar-thumb": { bg: "whiteAlpha.200", borderRadius: "full" },
      }}
    >
      {items.map((item, idx) => (
        <NewsItem key={`${item.link}-${idx}`} item={item} mode={mode} />
      ))}
    </Box>
  );
};

// ===== Main Component =====
const TimelineNewsTabs: React.FC<Props> = ({ mode, accentColor = "#65a8bf", height = 540 }) => {
  const tvAllSrc = React.useMemo(() => tvTimelineUrl(mode), [mode]);
  const tvForexSrc = React.useMemo(() => tvTimelineUrl(mode, "forex"), [mode]);
  const tvCryptoSrc = React.useMemo(() => tvTimelineUrl(mode, "crypto"), [mode]);
  const isDark = mode === "dark";

  return (
    <Box borderRadius="xl" overflow="hidden">
      <Tabs variant="unstyled" isLazy>
        <TabList
          bg={isDark ? "rgba(15, 23, 42, 0.8)" : "gray.50"}
          borderBottom="1px solid"
          borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
          px={2}
          pt={2}
          gap={1}
          overflowX="auto"
          sx={{
            "&::-webkit-scrollbar": { height: "0px" },
          }}
        >
          {[
            { label: "All News", icon: Newspaper },
            { label: "TradingView", icon: TrendingUp },
            { label: "Forex", icon: TrendingUp },
            { label: "Crypto", icon: Radio },
          ].map((tab, idx) => (
            <Tab
              key={tab.label}
              fontSize="xs"
              fontWeight="600"
              px={4}
              py={2}
              borderRadius="lg"
              color={isDark ? "gray.400" : "gray.500"}
              _selected={{
                bg: accentColor,
                color: "white",
                boxShadow: `0 0 12px ${accentColor}40`,
              }}
              _hover={{
                bg: isDark ? "whiteAlpha.100" : "blackAlpha.50",
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
          {/* All News — Combined RSS feeds */}
          <TabPanel p={0}>
            <RssFeedPanel mode={mode} height={height} />
          </TabPanel>

          {/* TradingView General Timeline */}
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

          {/* TradingView Forex Timeline */}
          <TabPanel p={0}>
            <iframe
              key={`tv-forex-${mode}`}
              title="Forex News"
              src={tvForexSrc}
              style={{ border: 0, width: "100%", height }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="clipboard-write; fullscreen"
            />
          </TabPanel>

          {/* TradingView Crypto Timeline */}
          <TabPanel p={0}>
            <iframe
              key={`tv-crypto-${mode}`}
              title="Crypto News"
              src={tvCryptoSrc}
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
