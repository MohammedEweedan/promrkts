'use client';
import { createTheme } from '@mui/material/styles';

const GOLD = '#b7a27d';
const BLUE = '#65a8bf';

export function buildTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: BLUE },
      secondary: { main: GOLD },
      background: {
        default: mode === 'dark' ? '#0a0f1a' : '#f5f5f5',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e4e4e7' : '#1a1a2e',
        secondary: mode === 'dark' ? '#9ca3af' : '#6b7280',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(101,168,191,0.12)' : 'rgba(101,168,191,0.08)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(101,168,191,0.18)' : 'rgba(101,168,191,0.14)',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
    },
  });
}
