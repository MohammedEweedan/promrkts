import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, Image, Spinner, VStack } from '@chakra-ui/react';
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
import GlobalProtection from './components/GlobalProtection';
import TokenCheckout from './pages/TokenCheckout';
import Hub from './pages/Hub';
import { useAuth } from './auth/AuthContext';
import PixelSnow from './components/PixelSnow';

function App() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const { loading: authLoading } = useAuth();

  // Only show splash on initial app load (auth resolving), not on every page
  const [showSplash, setShowSplash] = React.useState(false);
  const hasShownInitialSplash = React.useRef(false);
  const splashTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    // Only show splash on initial auth load, not subsequent navigations
    if (authLoading && !hasShownInitialSplash.current) {
      setShowSplash(true);
      return;
    }

    // Auth finished loading - hide splash after short delay
    if (!authLoading && showSplash) {
      hasShownInitialSplash.current = true;
      if (splashTimerRef.current) window.clearTimeout(splashTimerRef.current);
      // Shorter duration - 400ms
      splashTimerRef.current = window.setTimeout(() => setShowSplash(false), 400);
    }
  }, [authLoading, showSplash]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <PixelSnow density={60} speed={0.8} color="#65a8bf" />
      <Analytics />
      <SpeedInsights />
        {showSplash && (
          <Box
            position="fixed"
            inset={0}
            zIndex={2000}
            bg="rgba(5, 8, 17, 0.96)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
          >
            <VStack spacing={6}>
              <Image
                src={process.env.PUBLIC_URL + '/logo.gif'}
                alt="Loading"
                w={{ base: '140px', md: '180px' }}
                h="auto"
              />
              <Spinner
                size="md"
                color="#65a8bf"
                thickness="3px"
                speed="0.8s"
                emptyColor="rgba(255,255,255,0.1)"
              />
            </VStack>
          </Box>
        )}
        {/* <GlobalProtection /> */}
        <ScrollToTop />
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
