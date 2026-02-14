'use client';
import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { buildTheme } from './theme';

type Mode = 'light' | 'dark';

interface ThemeCtx {
  mode: Mode;
  toggleMode: () => void;
}

const Ctx = createContext<ThemeCtx>({ mode: 'dark', toggleMode: () => {} });

export const useThemeMode = () => useContext(Ctx);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('admin-theme') as Mode) || 'dark';
    }
    return 'dark';
  });

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') localStorage.setItem('admin-theme', next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <Ctx.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </Ctx.Provider>
  );
}
