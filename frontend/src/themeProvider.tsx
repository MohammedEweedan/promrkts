// src/theme/ThemeProvider.tsx
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import "./styles/fonts.css";
import system from "./theme";

/**
 * AppThemeProvider
 *
 * Wrap your app with <AppThemeProvider direction={i18n.dir()} initialColorMode="light">.
 * - sets direction (ltr/rtl) on the html element
 * - uses Chakra's ChakraProvider with the system theme (Chakra System API)
 *
 * Note: This provider focuses on theming via the System API. If you need color-mode toggling,
 * you can manage a data-theme attribute on <html> (e.g., 'light' | 'dark') and rely on semantic tokens.
 */
interface AppThemeProviderProps {
  children: ReactNode;
  direction?: "ltr" | "rtl";
  initialColorMode?: "light" | "dark";
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
  direction = "ltr",
  initialColorMode = "light",
}) => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return initialColorMode;
    return (localStorage.getItem("themeMode") as "light" | "dark") || initialColorMode;
  });

  // Attach direction and data-theme to <html> and persist mode
  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const body = document.body;
      html.dir = direction;
      // Set attributes on both html and body for maximum compatibility
      html.setAttribute("data-theme", mode);
      body?.setAttribute("data-theme", mode);
      // Toggle Chakra dark/light classes on both html and body
      if (mode === 'dark') {
        html.classList.add('chakra-ui-dark');
        html.classList.remove('chakra-ui-light');
        body?.classList.add('chakra-ui-dark');
        body?.classList.remove('chakra-ui-light');
      } else {
        html.classList.add('chakra-ui-light');
        html.classList.remove('chakra-ui-dark');
        body?.classList.add('chakra-ui-light');
        body?.classList.remove('chakra-ui-dark');
      }
    }
    try {
      localStorage.setItem("themeMode", mode);
    } catch {}
  }, [direction, mode]);

  const toggle = useCallback(() => {
    setMode((m) => (m === "light" ? "dark" : "light"));
  }, []);

  const ctxValue = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return (
    <ThemeModeContext.Provider value={ctxValue}>
      <ChakraProvider theme={system}>{children}</ChakraProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppThemeProvider;

// Theme mode context/hook
type ThemeModeContextType = { mode: "light" | "dark"; toggle: () => void };
const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within AppThemeProvider");
  return ctx;
};
