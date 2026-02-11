// src/theme/index.ts (Chakra v2)
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

/** ---- Color scales ---- */
const colors = {
  brand: {
    50:"#65a8bf",100:"#65a8bf",200:"#65a8bf",300:"#65a8bf",400:"#65a8bf",
    500:"#65a8bf",600:"#65a8bf",700:"#65a8bf",800:"#65a8bf",900:"#65a8bf",
  },
  accent: {
    50:"#65a8bf",100:"#65a8bf",200:"#65a8bf",300:"#65a8bf",400:"#65a8bf",
    500:"#65a8bf",600:"#65a8bf",700:"#65a8bf",800:"#65a8bf",900:"#65a8bf",
  },
  sand: {
    50:"#faf7f2",100:"#f3ede2",200:"#e8dcc5",300:"#decdaa",400:"#cdb688",
    500:"#65a8bf",600:"#9e8d69",700:"#7f7153",800:"#5f5740",900:"#3f3a2b",
  },
  gray: {
    50:"#F7FAFC",100:"#EDF2F7",200:"#E2E8F0",300:"#CBD5E0",400:"#A0AEC0",
    500:"#718096",600:"#4A5568",700:"#2D3748",800:"#1F2937",900:"#111827",
  },
};

/** ---- Base font stacks (overridden by dir-specific globals) ---- */
const fonts = {
  heading:
    "'FuturaCustom', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  body:
    "'FuturaCustom', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

/** ---- Semantic tokens ---- */
const semanticTokens = {
  colors: {
    "bg.canvas":   { default: "sand.50",  _dark: "black" },
    "bg.surface":  { default: "white",    _dark: "black" },
    "text.primary":{ default: "gray.900", _dark: "white" },
    "text.muted":  { default: "gray.600", _dark: "gray.400" },
    "border.default": { default: "gray.200", _dark: "gray.700" },
    "accent.solid":{ default: "accent.500", _dark: "accent.400" },
    "accent.on":   { default: "white",       _dark: "gray.900" },
    "grad.blue.1": { default: "brand.400", _dark: "brand.500" },
    "grad.blue.2": { default: "brand.600", _dark: "brand.700" },
    "grad.gold.1": { default: "accent.400", _dark: "accent.500" },
    "grad.gold.2": { default: "accent.600", _dark: "accent.700" },
  },
};

/** ---- Global styles (dir-aware font families + utilities) ---- */
const styles = {
  global: {
    ":root": {
      "--hero-bottom": "60vh",
      "--dots-opacity": "0",
      "--dots-fade": "12vh",
      "--bg-top-alpha": "0",
    },
    /* Base canvas and stacking */
    "html, body": {
      height: "100%",
      background: "bg.canvas",
      color: "text.primary",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    /* Important: keep #root transparent and above the decorative layers */
    "#root": {
      height: "100%",
      background: "transparent !important",
      position: "relative",
      zIndex: 3, // content baseline
    },

    /* ------------------------------------------------------
       Pixel Snow background animation (replaces dots)
       ------------------------------------------------------ */
    "@keyframes pixelSnowFall": {
      "0%": {
        transform: "translateY(-100vh)",
        opacity: 0,
      },
      "10%": {
        opacity: 1,
      },
      "90%": {
        opacity: 1,
      },
      "100%": {
        transform: "translateY(100vh)",
        opacity: 0,
      },
    },
    "@keyframes pixelSnowShimmer": {
      "0%, 100%": {
        opacity: 0.3,
      },
      "50%": {
        opacity: 0.8,
      },
    },

    /* === Dir-aware base font === */
    "html[dir='ltr'] body": {
      fontFamily:
        "'FuturaCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji' !important",
    },
    "html[dir='rtl'] body": {
      fontFamily:
        "'Hacen-Liner-Print-Out', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji' !important",
      fontWeight: 400,
    },

    /* === Headings default === */
    ".chakra-heading": {
      fontFamily:
        "'FuturaCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial !important",
    },
    "html[dir='rtl'] .chakra-heading": {
      fontFamily: "'Hacen-Liner-Print-Out' !important",
      fontWeight: 400,
    },

    a: { color: "accent.500", _hover: { color: "accent.600", textDecoration: "none" } },
    "p, span, div, h1, h2, h3, h4, h5, h6, .chakra-text, .chakra-heading": { color: "inherit" },
    "h1, .chakra-heading[data-level='1']": { fontWeight: 800, letterSpacing: "-0.02em" },
    "h2, .chakra-heading[data-level='2']": { fontWeight: 700, letterSpacing: "-0.01em" },
    p: { lineHeight: 1.6 },

    "input, select, textarea": {
      color: "text.primary",
      background: "bg.surface",
      borderColor: "border.default",
      _placeholder: { color: "text.muted" },
    },
    ".chakra-input, .chakra-select, .chakra-textarea": {
      color: "text.primary",
      background: "bg.surface",
      borderColor: "border.default",
      _placeholder: { color: "text.muted" },
    },
    ".chakra-button": { _hover: { transform: "translateY(-1px)" } },

    /* === Optional section heading underline === */
    ".section-heading": {
      fontFamily:
        "'FuturaCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji' !important",
      fontWeight: 500,
      letterSpacing: "0.02em",
      lineHeight: 1.02,
      position: "relative",
      display: "inline-block",
    },
    ".section-heading::after": {
      content: "''",
      position: "absolute",
      left: 0,
      right: 0,
      bottom: "-6px",
      height: "2px",
      background: "#65a8bf",
      borderRadius: "9999px",
    },
    "html[dir='rtl'] .section-heading, body[dir='rtl'] .section-heading": {
      fontFamily: "'Hacen-Liner-Print-Out' !important",
      fontWeight: 400,
    },
  },
};

/** ---- Component-level: Heading variant for section titles ---- */
const components = {
  Heading: {
    variants: {
      section: {
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.02,
        display: "inline-block",
        position: "relative",
        _after: {
          content: "''",
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "-6px",
          height: "2px",
          bg: "accent.solid",
          borderRadius: "full",
        },
      },
    },
  },
};

/** ---- Theme config ---- */
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
  // direction is handled by i18n toggling <html dir="rtl"> when Arabic
};

/** ---- Build theme ---- */
const theme = extendTheme({
  config,
  colors,
  fonts,
  semanticTokens,
  styles,
  components,
});

export default theme;
