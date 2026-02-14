import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppThemeProvider from './themeProvider';
import './i18n';
import i18n from 'i18next';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './auth/AuthContext';
import * as Sentry from '@sentry/react';
const sentryTunnel =
  process.env.REACT_APP_SENTRY_TUNNEL ||
  (process.env.NODE_ENV === "development"
    ? `${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000/api"}/monitoring`
    : "");

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tunnel: sentryTunnel || undefined,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0 : 0.1,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  sendDefaultPii: true,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const AppShell = (
  <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
    <AppThemeProvider initialColorMode="light" direction={i18n.dir() as 'ltr' | 'rtl'}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </AppThemeProvider>
  </Sentry.ErrorBoundary>
);

root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>{AppShell}</React.StrictMode>
  ) : (
    AppShell
  )
);

// Set dir attribute for RTL/LTR based on current language
document.documentElement.setAttribute('dir', i18n.dir());
i18n.on('languageChanged', () => {
  document.documentElement.setAttribute('dir', i18n.dir());
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker for PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
