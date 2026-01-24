// src/components/TimelineNewsTabs.tsx
/* eslint-disable */
import * as React from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  mode: "light" | "dark";
  accentColor?: string;
  height?: number;
};

// Build a single unified TradingView Timeline URL (no market/symbol, no i18n detection)
function tvTimelineAllNewsUrl(theme: "light" | "dark") {
  const base = "https://s.tradingview.com/embed-widget/timeline/";
  const query = `?locale=en`; // force EN, no i18n detection
  const cfg = encodeURIComponent(
    JSON.stringify({
      // No market / symbol keys -> unified/general news feed
      colorTheme: theme,
      isTransparent: true,
      displayMode: "adaptive",
    })
  );
  return `${base}${query}#${cfg}`;
}

const TimelineNewsTabs: React.FC<Props> = ({ mode, accentColor = "#65a8bf", height = 540 }) => {
  const src = React.useMemo(() => tvTimelineAllNewsUrl(mode), [mode]);

  return (
    <Box
      borderRadius="xl"
      p={2}
      color="#65a8bf"
    >
      <iframe
        key={`tv-all-${mode}`}
        title="Market News"
        src={src}
        style={{ border: 0, width: "100%", height }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="clipboard-write; fullscreen"
      />
    </Box>
  );
};

export default TimelineNewsTabs;
