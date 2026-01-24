import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, Image } from '@chakra-ui/react';
import './App.css';
import Home from './pages/Home';
import CoursesList from './pages/Courses/List'; 
import CourseDetail from './pages/Courses/Detail';
import Checkout from './pages/Checkout';
import Enrolled from './pages/Enrolled';
import Learn from './pages/Learn';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminIndex from './pages/admin/Index';
import Verifications from './pages/admin/Verifications';
import ContentAdmin from './pages/admin/Content';
import RequireAdmin from './components/RequireAdmin';
import Account from './pages/Account';
import Header from './components/Header';
import Broker from "./pages/Broker";
import Footer from './components/Footer';
import RouteTracker from './components/RouteTracker';
import DocumentTitle from "./components/DocumentTitle";
import Contact from './pages/Contact';
import About from './pages/Company/About';
import Careers from './pages/Company/Careers';
import Terms from './pages/Legal/Terms';
import Policy from './pages/Legal/Policy';
import Resources from './pages/Learn/Resources';
import FAQ from './pages/Learn/FAQ';
import Apply from './pages/Apply';
import NotFound from "./pages/404";
import ScrollToTop from "./components/ScrollToTop";
import Crypto from './pages/Guide/Crypto';
import EnrollmentCelebration from './components/EnrollmentCelebration';
import AdminProgress from './pages/admin/Progress';
import TokenPage from './pages/Token';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Discord from './pages/Discord';
// import GlobalProtection from './components/GlobalProtection';
// import LightRays from "./components/LightRays";
import TokenCheckout from './pages/TokenCheckout';
import Hub from './pages/Hub';
import { useAuth } from './auth/AuthContext';

function App() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const { loading: authLoading } = useAuth();

  const [showSplash, setShowSplash] = React.useState(false);
  const splashStartRef = React.useRef<number | null>(null);
  const splashTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    // Initial app load: show splash while auth is resolving.
    if (authLoading) {
      splashStartRef.current = Date.now();
      setShowSplash(true);
      return;
    }

    // Ensure a minimum display time so it doesn't flash.
    const startedAt = splashStartRef.current;
    const elapsed = startedAt ? Date.now() - startedAt : 0;
    const minMs = 650;
    const delay = Math.max(0, minMs - elapsed);
    if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
    splashTimerRef.current = window.setTimeout(() => setShowSplash(false), delay);
  }, [authLoading]);

  React.useEffect(() => {
    // After auth success (login/signup), show splash once.
    const key = 'auth_splash_once';
    if (sessionStorage.getItem(key) === '1') {
      sessionStorage.removeItem(key);
      if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
      setShowSplash(true);
      splashTimerRef.current = window.setTimeout(() => setShowSplash(false), 900);
    }
  }, [location.pathname]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Analytics />
      <SpeedInsights />
        {showSplash && (
          <Box
            position="fixed"
            inset={0}
            zIndex={2000}
            bg="rgba(5, 8, 17, 0.92)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            <Image
              src={process.env.PUBLIC_URL + '/logo.gif'}
              alt="Loading"
              w={{ base: '160px', md: '220px' }}
              h="auto"
            />
          </Box>
        )}
        {/* Router is already provided ABOVE in index.tsx */}
        {/* <GlobalProtection /> */}
        <ScrollToTop />
        {/* <LightRays /> */}
        {!isChatPage && <Header />}
        <Box pb={isChatPage ? 0 : 16} flex="1" w="100%">
          <RouteTracker />
          <DocumentTitle />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<CoursesList />} />
            <Route path="/products/:id" element={<CourseDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/learn/:id" element={<Learn />} />
            <Route path="/enrolled" element={<Enrolled />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/path" element={<Hub />} />
            <Route path="/progress" element={<Hub />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/account" element={<Account />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminIndex />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <RequireAdmin>
                  <Verifications />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/content"
              element={
                <RequireAdmin>
                  <ContentAdmin />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/progress"
              element={
                <RequireAdmin>
                  <AdminProgress />
                </RequireAdmin>
              }
            />
            <Route path="/learn/resources" element={<Resources />} />
            <Route path="/learn/faq" element={<FAQ />} />
            <Route path="/legal/policy" element={<Policy />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/company/about" element={<About />} />
            <Route path="/company/careers" element={<Careers />} />
            <Route path="/guide/crypto" element={<Crypto />} />
            <Route path="/token" element={<TokenPage />} />
            <Route path="/token/checkout" element={<TokenCheckout />} />
            <Route path="/discord" element={<Discord />} />
            <Route path="/apply/:id" element={<Apply />} />
            <Route path="/broker" element={<Broker />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
        <EnrollmentCelebration />
        {!isChatPage && <Footer />}
    </Box>
  );
}

export default App;
