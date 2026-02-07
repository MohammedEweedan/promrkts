// src/components/TradingViewWidget.tsx
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

/**
 * TradingView Widgets now come in two formats:
 *  - "iframe widgets" (legacy): <script src="https://s3.tradingview.com/external-embedding/embed-widget-*.js">{JSON}</script>
 *  - "web components" (new): <script type="module" src="https://www.tradingview-widget.com/w/en/<tv-tag>.js"></script> + <tv-... ... />
 *
 * This component supports BOTH and lets you fully override scripts/options/attributes.
 */

/** ----------------------------- Theme handling ----------------------------- */

export type TVTheme = "dark" | "light";

function readDomTheme(): TVTheme {
  if (typeof document === "undefined") return "dark";
  const v = document.documentElement.getAttribute("data-theme");
  return v === "light" ? "light" : "dark";
}

function safeJson(v: any): string {
  try {
    return JSON.stringify(v ?? null);
  } catch {
    return "null";
  }
}

function useResolvedTheme(controlledTheme?: TVTheme): TVTheme {
  const [domTheme, setDomTheme] = useState<TVTheme>(() => readDomTheme());
  const resolvedTheme = useMemo(() => controlledTheme ?? domTheme, [controlledTheme, domTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (controlledTheme) return;

    const el = document.documentElement;
    const obs = new MutationObserver(() => setDomTheme(readDomTheme()));
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });

    setDomTheme(readDomTheme());
    return () => obs.disconnect();
  }, [controlledTheme]);

  return resolvedTheme;
}

/** ----------------------------- Deep merge ----------------------------- */

function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T extends Record<string, any>>(base: T, patch?: Record<string, any>): T {
  if (!patch) return base;
  const out: any = Array.isArray(base) ? [...base] : { ...base };

  for (const [k, v] of Object.entries(patch)) {
    if (isPlainObject(out[k]) && isPlainObject(v)) out[k] = deepMerge(out[k], v);
    else out[k] = v;
  }
  return out;
}

/** ----------------------------- Widget registry ----------------------------- */
/**
 * IMPORTANT:
 * TradingView evolves widget script names over time.
 * For maximum future-proofing, every widget below allows:
 *  - scriptSrcOverride (iframe widgets)
 *  - moduleSrcOverride (web components)
 *
 * If TradingView changes a filename, you can override without changing this file.
 */

type IframeWidgetDef = {
  kind: "iframe";
  scriptSrc: string; // s3 external-embedding embed-widget-*.js
  buildDefaults: (ctx: {
    theme: TVTheme;
    symbol?: string;
    symbols?: string[];
    locale: string;
  }) => Record<string, any>;
};

type WebComponentWidgetDef = {
  kind: "web-component";
  tagName: string; // e.g. tv-ticker-tape
  moduleSrc: (locale: string) => string; // e.g. https://www.tradingview-widget.com/w/en/tv-ticker-tape.js
  buildAttrs: (ctx: {
    theme: TVTheme;
    symbol?: string;
    symbols?: string[];
    locale: string;
  }) => Record<string, string>;
};

type WidgetDef = IframeWidgetDef | WebComponentWidgetDef;

export type TradingViewVariant =
  | "economic-calendar"
  | "crypto-heatmap"
  | "stock-heatmap"
  | "forex-heatmap"
  | "technical-analysis"
  | "market-overview"
  | "ticker-tape"
  | "screener"
  | "symbol-overview"
  | "mini-symbol-overview"
  | "forex-cross-rates"
  | "market-quotes"
  | "timeline"
  | "symbol-info"
  | "market-data"
  | "cryptocurrency-market";

  type LegacyProps = {
    variant: TradingViewVariant;
    symbol?: string; // could be a single symbol OR a comma list for ticker-tape
    theme?: TVTheme;
    locale?: string;
    className?: string;
    style?: React.CSSProperties;
    onError?: (err: Error) => void;

    // allow customization even in legacy mode:
    options?: Record<string, any>;
    attrs?: Record<string, string | number | boolean | null | undefined>;
    scriptSrcOverride?: string;
    moduleSrcOverride?: string;
  };

  function mapVariantToWidget(variant: TradingViewVariant): TradingViewWidgetId {
    switch (variant) {
      case "economic-calendar":
        return "economic-calendar";
      case "crypto-heatmap":
        return "crypto-heatmap";
      case "stock-heatmap":
        return "stock-heatmap";
      case "forex-heatmap":
        return "forex-heatmap";
      case "technical-analysis":
        return "technical-analysis";
      case "market-overview":
        return "market-overview";
      case "ticker-tape":
        return "ticker-tape";
      case "screener":
        return "screener";
      case "symbol-overview":
        return "symbol-overview";
      case "mini-symbol-overview":
        return "mini-symbol-overview";
      case "forex-cross-rates":
        return "forex-cross-rates";
      case "market-quotes":
        return "market-quotes";
      case "timeline":
        return "top-stories"; // your old "timeline" is essentially the timeline/news widget
      case "symbol-info":
        return "symbol-info";
      case "market-data":
        return "market-quotes";

      // ✅ NEW: Cryptocurrency Market is the Screener configured for crypto
      case "cryptocurrency-market":
        return "crypto-screener";

      default:
        return "technical-analysis";
    }
  }

/**
 * Full widget collection categories (per TradingView widget docs navigation):
 * Charts, Watchlists, Tickers, Heatmaps, Screeners, Symbol Details, News,
 * Calendars, Brokers, Economics.
 */
export type TradingViewWidgetId =
  // Charts
  | "advanced-chart"
  | "symbol-overview"
  | "mini-symbol-overview"
  | "mini-chart" // web component (new)
  // Watchlists
  | "market-summary" // web component (new)
  | "market-overview"
  | "stock-market"
  | "market-quotes"
  // Tickers
  | "ticker-tape" // web component (new)
  | "ticker-tag" // web component (new)
  | "single-ticker"
  | "ticker"
  // Heatmaps
  | "stock-heatmap"
  | "crypto-heatmap"
  | "forex-cross-rates"
  | "etf-heatmap"
  | "forex-heatmap"
  // Screeners
  | "screener"
  | "crypto-screener"
  // Symbol details
  | "symbol-info"
  | "technical-analysis"
  | "fundamental-data"
  | "company-profile"
  // News
  | "top-stories"
  // Calendars
  | "economic-calendar"
  // Brokers
  | "broker-rating"
  | "broker-reviews"
  // Economics
  | "economic-map";

/**
 * NOTE on web-component module URL pattern:
 * TradingView's web component docs show examples like:
 *   https://www.tradingview-widget.com/w/en/tv-ticker-tape.js
 */
function tvModule(locale: string, tagName: string) {
  const lang = (locale || "en").toLowerCase();
  return `https://www.tradingview-widget.com/w/${lang}/${tagName}.js`;
}

const WIDGETS: Record<TradingViewWidgetId, WidgetDef> = {
  /** ------------------ Charts ------------------ */
  "advanced-chart": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      autosize: true,
      symbol: symbol || "NASDAQ:AAPL",
      interval: "D",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale,
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    }),
  },

  "symbol-overview": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      symbols: [[symbol || "NASDAQ:AAPL"]],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale,
      colorTheme: theme,
      autosize: true,
      showVolume: true,
      showMA: true,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
    }),
  },

  "mini-symbol-overview": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      symbol: symbol || "NASDAQ:AAPL",
      width: "100%",
      height: "100%",
      locale,
      dateRange: "12M",
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    }),
  },

  // New "Mini Chart" web-component widget (separate from legacy mini-symbol-overview)
  "mini-chart": {
    kind: "web-component",
    tagName: "tv-mini-chart",
    moduleSrc: (locale) => tvModule(locale, "tv-mini-chart"),
    buildAttrs: ({ theme, symbol, locale }) => ({
      symbol: symbol || "NASDAQ:AAPL",
      theme,
      locale,
    }),
  },

  /** ------------------ Watchlists ------------------ */
  "market-summary": {
    kind: "web-component",
    tagName: "tv-market-summary",
    moduleSrc: (locale) => tvModule(locale, "tv-market-summary"),
    buildAttrs: ({ theme, locale }) => ({
      theme,
      locale,
    }),
  },

  "market-overview": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      dateRange: "12M",
      showChart: true,
      locale,
      width: "100%",
      height: "100%",
      isTransparent: true,
      largeChartUrl: "",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" },
            { s: "FOREXCOM:DJI", d: "Dow" },
          ],
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
          ],
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "BTC" },
            { s: "BINANCE:ETHUSDT", d: "ETH" },
            { s: "BINANCE:SOLUSDT", d: "SOL" },
          ],
        },
      ],
    }),
  },

  "stock-market": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      dateRange: "3M",
      exchange: "US",
      showChart: true,
      locale,
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: "100%",
      height: "100%",
    }),
  },

  "market-quotes": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js",
    buildDefaults: ({ theme, locale }) => ({
      width: "100%",
      height: "100%",
      isTransparent: true,
      colorTheme: theme,
      locale,
      showSymbolLogo: true,
      symbolsGroups: [
        {
          name: "Forex",
          originalName: "Forex",
          symbols: [
            { name: "FX:EURUSD", displayName: "EUR/USD" },
            { name: "FX:GBPUSD", displayName: "GBP/USD" },
            { name: "FX:USDJPY", displayName: "USD/JPY" },
          ],
        },
        {
          name: "Crypto",
          originalName: "Crypto",
          symbols: [
            { name: "BINANCE:BTCUSDT", displayName: "BTC" },
            { name: "BINANCE:ETHUSDT", displayName: "ETH" },
            { name: "BINANCE:SOLUSDT", displayName: "SOL" },
          ],
        },
      ],
    }),
  },

  /** ------------------ Tickers ------------------ */
  "ticker-tape": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",
    buildDefaults: ({ theme, symbols, locale }) => ({
      symbols: (symbols?.length
        ? symbols
        : ["NASDAQ:AAPL", "NASDAQ:NVDA", "FX:EURUSD", "BINANCE:BTCUSDT", "OANDA:GBPUSD", "OANDA:XAUUSD", "OANDA:EURJPY"]
      ).map((s) => ({ proName: s, title: s.split(":")[1] || s })),
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: theme,
      locale,
    }),
  },

  "ticker-tag": {
    kind: "web-component",
    tagName: "tv-ticker-tag",
    moduleSrc: (locale) => tvModule(locale, "tv-ticker-tag"),
    buildAttrs: ({ theme, symbol, locale }) => ({
      theme,
      locale,
      symbol: symbol || "NASDAQ:AAPL",
    }),
  },

  "single-ticker": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      symbol: symbol || "NASDAQ:AAPL",
      width: "100%",
      isTransparent: true,
      colorTheme: theme,
      locale,
    }),
  },

  ticker: {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-tickers.js",
    buildDefaults: ({ theme, symbols, locale }) => ({
      symbols: (symbols?.length ? symbols : ["FOREXCOM:SPXUSD", "FX:EURUSD", "BINANCE:BTCUSDT"])
        .slice(0, 15)
        .map((s) => ({
          proName: s,
          title: s,
        })),
      colorTheme: theme,
      isTransparent: true,
      showSymbolLogo: true,
      locale,
      width: "100%",
      height: "100%",
    }),
  },

  /** ------------------ Heatmaps ------------------ */
  "stock-heatmap": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js",
    buildDefaults: ({ theme, locale }) => ({
      dataSource: "SPX500",
      blockSize: "market_cap_basic",
      blockColor: "change",
      grouping: "sector",
      locale,
      symbolUrl: "",
      colorTheme: theme,
      exchanges: [],
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: "100%",
    }),
  },

  "crypto-heatmap": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js",
    buildDefaults: ({ theme, locale }) => ({
      dataSource: "Crypto",
      blockSize: "market_cap_calc",
      blockColor: "24h_close_change|5",
      locale,
      symbolUrl: "",
      colorTheme: theme,
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: "100%",
    }),
  },

  "forex-cross-rates": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js",
    buildDefaults: ({ theme, locale }) => ({
      width: "100%",
      height: "100%",
      currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
      isTransparent: true,
      colorTheme: theme,
      locale,
    }),
  },

  "etf-heatmap": {
    kind: "iframe",
    // TradingView may rename this file in the future; you can override via scriptSrcOverride.
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-etf-heatmap.js",
    buildDefaults: ({ theme, locale }) => ({
      locale,
      colorTheme: theme,
      width: "100%",
      height: "100%",
    }),
  },

  "forex-heatmap": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD", "CNY"],
      width: "100%",
      height: "100%",
    }),
  },

  /** ------------------ Screeners ------------------ */
  screener: {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-screener.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      width: "100%",
      height: "100%",
      defaultColumn: "overview",
      market: "forex",
    }),
  },

  "crypto-screener": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-screener.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      width: "100%",
      height: "100%",
      defaultColumn: "overview",
      market: "crypto",
    }),
  },

  /** ------------------ Symbol Details ------------------ */
  "symbol-info": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      symbol: symbol || "NASDAQ:AAPL",
      width: "100%",
      height: "100%",
      locale,
      colorTheme: theme,
      isTransparent: true,
    }),
  },

  "technical-analysis": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      colorTheme: theme,
      displayMode: "single",
      isTransparent: true,
      locale,
      interval: "15m",
      disableInterval: false,
      width: "100%",
      height: "100%",
      symbol: symbol || "NASDAQ:AAPL",
      showIntervalTabs: true,
    }),
  },

  "fundamental-data": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-financials.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      largeChartUrl: "",
      displayMode: "adaptive",
      width: "100%",
      height: "100%",
      symbol: symbol || "NASDAQ:AAPL",
      locale,
    }),
  },

  "company-profile": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      width: "100%",
      height: "100%",
      colorTheme: theme,
      isTransparent: true,
      symbol: symbol || "NASDAQ:AAPL",
      locale,
    }),
  },

  /** ------------------ News ------------------ */
  "top-stories": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js",
    buildDefaults: ({ theme, symbol, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      locale,
      feedMode: symbol ? "symbol" : "all_symbols",
      symbol: symbol || undefined,
    }),
  },

  /** ------------------ Calendars ------------------ */
  "economic-calendar": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-events.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      countryFilter: "us,eu,gb,jp,cn",
      importanceFilter: "0,1",
      width: "100%",
      height: "100%",
    }),
  },

  /** ------------------ Brokers ------------------ */
  "broker-rating": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-broker-rating.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      width: "100%",
      height: "100%",
    }),
  },

  "broker-reviews": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-broker-reviews.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      width: "100%",
      height: "100%",
    }),
  },

  /** ------------------ Economics ------------------ */
  "economic-map": {
    kind: "iframe",
    scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-economic-map.js",
    buildDefaults: ({ theme, locale }) => ({
      colorTheme: theme,
      isTransparent: true,
      locale,
      width: "100%",
      height: "100%",
    }),
  },
};

/** ----------------------------- Props & component ----------------------------- */

type CommonProps = {
  widget: TradingViewWidgetId;

  /** For widgets that take a single symbol (e.g., NASDAQ:AAPL, FX:EURUSD, BINANCE:BTCUSDT) */
  symbol?: string;

  /** For widgets that take multiple symbols (ticker/ticker-tape/etc) */
  symbols?: string[];

  /** Defaults to "en" */
  locale?: string;

  /**
   * Optional. If omitted, reads html[data-theme] ("dark"/"light") and live-updates.
   */
  theme?: TVTheme;

  /**
   * For iframe widgets: merged into TradingView's JSON config (deep merge).
   * Use this to fully customize every widget option.
   */
  options?: Record<string, any>;

  /**
   * For web components: merged into HTML attributes (stringified).
   * Use this to fully customize every widget attribute.
   */
  attrs?: Record<string, string | number | boolean | null | undefined>;

  /** Override script/module source if TradingView changes URLs. */
  scriptSrcOverride?: string;
  moduleSrcOverride?: string;

  className?: string;
  style?: React.CSSProperties;

  /** Called if script fails to load. */
  onError?: (err: Error) => void;
};

function toAttrString(v: any): string {
  if (v === true) return "true";
  if (v === false) return "false";
  if (v === null || v === undefined) return "";
  return String(v);
}

function loadModuleOnce(src: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[data-tv-module="${src}"]`);
  if (existing?.dataset.loaded === "1") return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }

    const s = document.createElement("script");
    s.type = "module";
    s.src = src;
    s.async = true;
    s.dataset.tvModule = src;

    s.addEventListener("load", () => {
      s.dataset.loaded = "1";
      resolve();
    });
    s.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));

    document.head.appendChild(s);
  });
}

type TradingViewWidgetProps = CommonProps | LegacyProps;

const TradingViewWidget: React.FC<TradingViewWidgetProps> = (props) => {
  // normalize props (legacy → new)
  const isLegacy = (props as any).variant !== undefined;

  const widget: TradingViewWidgetId = isLegacy
    ? mapVariantToWidget((props as LegacyProps).variant)
    : (props as CommonProps).widget;

  const theme = props.theme;
  const locale = props.locale ?? "en";
  const className = props.className;
  const style = props.style;
  const onError = props.onError;

  const scriptSrcOverride = props.scriptSrcOverride;
  const moduleSrcOverride = props.moduleSrcOverride;
  

  // legacy "symbol" handling:
  const legacySymbol = isLegacy ? (props as LegacyProps).symbol : undefined;

  const symbol = !isLegacy ? (props as CommonProps).symbol : undefined;
  const symbols = !isLegacy ? (props as CommonProps).symbols : undefined;

  // If legacy ticker-tape passes comma list in `symbol`, convert to `symbols[]`
  const normalizedSymbols =
    isLegacy && (props as LegacyProps).variant === "ticker-tape"
      ? String(legacySymbol || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 20)
      : symbols;

  // screener legacy used symbol as "market" string; map it into options.market
  const legacyOptionsPatch =
    isLegacy && (props as LegacyProps).variant === "screener"
      ? { market: (legacySymbol || "forex").toLowerCase() }
      : undefined;

  const options = isLegacy
    ? deepMerge(legacyOptionsPatch || {}, (props as LegacyProps).options)
    : (props as CommonProps).options;

  const attrs = isLegacy ? (props as LegacyProps).attrs : (props as CommonProps).attrs;

  const symbolsKey = useMemo(() => safeJson(normalizedSymbols ?? []), [normalizedSymbols]);
  const optionsKey = useMemo(() => safeJson(options ?? {}), [options]);
  const attrsKey = useMemo(() => safeJson(attrs ?? {}), [attrs]);

  // pick a single symbol for single-symbol widgets in legacy mode
  const normalizedSymbol = isLegacy ? legacySymbol : symbol;
  const resolvedTheme = useResolvedTheme(theme);
  const def = WIDGETS[widget];

  // For iframe widgets we inject into this container
  const iframeContainerRef = useRef<HTMLDivElement | null>(null);

  // For web component widgets we render a placeholder <div> then replace it with the custom element
  const webComponentHostRef = useRef<HTMLDivElement | null>(null);

  /** Iframe widgets */
  useEffect(() => {
    if (def.kind !== "iframe") return;
    if (typeof window === "undefined") return;
    if (!iframeContainerRef.current) return;

    const container = iframeContainerRef.current;
    container.innerHTML = "";

    const tvConfigBase = def.buildDefaults({
      theme: resolvedTheme,
      symbol: normalizedSymbol,
      symbols: normalizedSymbols,
      locale,
    });

    const finalConfig = deepMerge(tvConfigBase, options);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = scriptSrcOverride || def.scriptSrc;
    script.innerHTML = JSON.stringify(finalConfig);

    script.onerror = () => {
      const err = new Error(`TradingView widget failed to load: ${script.src}`);
      onError?.(err);
    };

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [def, widget, resolvedTheme, normalizedSymbol, locale, scriptSrcOverride, optionsKey, symbolsKey, onError, normalizedSymbols, options]);

  useEffect(() => {
    if (def.kind !== "web-component") return;
    if (typeof window === "undefined") return;
    if (!webComponentHostRef.current) return;

    const host = webComponentHostRef.current;

    const moduleSrc = moduleSrcOverride || def.moduleSrc(locale);

    const defaultAttrs = def.buildAttrs({
      theme: resolvedTheme,
      symbol: normalizedSymbol,
      symbols: normalizedSymbols,
      locale,
    });

    const mergedAttrs: Record<string, any> = { ...defaultAttrs, ...(attrs || {}) };

    console.log(`[TradingView ${widget}] Loading web component:`, {
      moduleSrc,
      tagName: def.tagName,
      normalizedSymbols,
      mergedAttrs,
    });

    let cancelled = false;

    (async () => {
      try {
        console.log(`[TradingView ${widget}] Loading module: ${moduleSrc}`);
        await loadModuleOnce(moduleSrc);
        if (cancelled) return;

        console.log(`[TradingView ${widget}] Module loaded, creating element`);
        host.innerHTML = "";
        const el = document.createElement(def.tagName);

        for (const [k, v] of Object.entries(mergedAttrs)) {
          if (v === undefined || v === null) continue;
          el.setAttribute(k, toAttrString(v));
        }

        console.log(`[TradingView ${widget}] Element created with attributes:`, mergedAttrs);

        // Optional fallback content while loading (or if JS blocked)
        if (!el.childNodes.length) {
          const placeholder = document.createElement("div");
          placeholder.style.padding = "8px";
          placeholder.style.fontSize = "12px";
          placeholder.style.opacity = "0.7";
          placeholder.textContent = "Loading market data…";
          el.appendChild(placeholder);
        }

        host.appendChild(el);
        console.log(`[TradingView ${widget}] Element appended to host`);
      } catch (e: any) {
        console.error(`[TradingView ${widget}] Error loading web component:`, e);
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    })();

    return () => {
      cancelled = true;
      host.innerHTML = "";
    };
  }, [def, widget, resolvedTheme, normalizedSymbol, locale, moduleSrcOverride, attrsKey, symbolsKey, onError, normalizedSymbols, attrs]);


  if (def.kind === "iframe") {
    return (
      <div
        className={
          className ? `tradingview-widget-container ${className}` : "tradingview-widget-container"
        }
        style={{ width: "100%", height: "100%", ...style }}
        ref={iframeContainerRef}
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    );
  }

  // web-component host
  return (
    <div
      className={
        className ? `tradingview-widget-container ${className}` : "tradingview-widget-container"
      }
      style={{ width: "100%", height: "100%", ...style }}
      ref={webComponentHostRef}
    />
  );
};

export default memo(TradingViewWidget);

/** ----------------------------- Symbol Search (pairs + market parent) ----------------------------- */

export type TVSymbolType =
  | "stock"
  | "index"
  | "forex"
  | "crypto"
  | "futures"
  | "bond"
  | "fund"
  | "cfd"
  | "economic"
  | string;

export type TVSymbolSearchItem = {
  symbol: string; // short symbol
  full_name: string; // e.g. "NASDAQ:AAPL"
  description?: string;
  exchange?: string;
  type?: string; // e.g. "stock", "forex", "crypto"
};

export type GroupedSymbolResults = Record<
  string, // parent market, e.g. "forex" / "crypto" / "stock"
  Record<string, TVSymbolSearchItem[]> // exchange -> items
>;

/**
 * TradingView symbol search endpoint:
 *   https://symbol-search.tradingview.com/symbol_search/?text=...&type=...
 *
 * If you hit CORS in the browser, proxy this through your backend.
 */
export async function searchTradingViewSymbols(params: {
  text: string;
  type?: TVSymbolType;
  signal?: AbortSignal;
}): Promise<TVSymbolSearchItem[]> {
  const q = params.text.trim();
  if (!q) return [];

  const url =
    `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(q)}` +
    (params.type ? `&type=${encodeURIComponent(params.type)}` : "");

  const res = await fetch(url, { method: "GET", signal: params.signal });
  if (!res.ok) throw new Error(`Symbol search failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as any[];

  // The API returns array objects that typically include:
  // symbol, full_name, description, exchange, type
  return (data || []).map((x) => ({
    symbol: String(x.symbol ?? ""),
    full_name: String(x.full_name ?? x.ticker ?? ""),
    description: x.description ? String(x.description) : undefined,
    exchange: x.exchange ? String(x.exchange) : undefined,
    type: x.type ? String(x.type) : undefined,
  }));
}

export function groupSymbolsByMarketAndExchange(items: TVSymbolSearchItem[]): GroupedSymbolResults {
  const out: GroupedSymbolResults = {};
  for (const it of items) {
    const market = (it.type || "unknown").toLowerCase();
    const exch = (it.exchange || "Unknown").trim() || "Unknown";
    out[market] ||= {};
    out[market][exch] ||= [];
    out[market][exch].push(it);
  }
  return out;
}
