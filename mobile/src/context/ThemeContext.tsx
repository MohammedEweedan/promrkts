import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceSecondary: '#EEEEEE',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#E0E0E0',
    primary: '#65a8bf',
    primaryDark: '#4a8a9f',
    accent: '#65a8bf',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    card: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,0.08)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E0E0E0',
    inputBg: '#F5F5F5',
  },
  dark: {
    background: '#050811',
    surface: 'rgba(15, 23, 42, 0.72)',
    surfaceSecondary: 'rgba(15, 23, 42, 0.92)',
    text: '#EAFBF2',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: 'rgba(255,255,255,0.45)',
    border: 'rgba(255,255,255,0.08)',
    primary: '#65a8bf',
    primaryDark: '#4a8a9f',
    accent: '#65a8bf',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    card: 'rgba(15, 23, 42, 0.72)',
    cardBorder: 'rgba(255,255,255,0.08)',
    tabBar: 'rgba(5, 8, 17, 0.95)',
    tabBarBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(15, 23, 42, 0.9)',
  },
};

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof colors.dark;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@promrkts_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setMode(stored);
      }
    } catch (e) {
      console.log('Failed to load theme:', e);
    }
  };

  const setTheme = async (newMode: ThemeMode) => {
    setMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.log('Failed to save theme:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    mode,
    isDark: mode === 'dark',
    colors: colors[mode],
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
