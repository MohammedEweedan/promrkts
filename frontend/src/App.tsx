import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, Image, Spinner, VStack } from '@chakra-ui/react';
import './App.css';

// Eagerly loaded (critical path)
import Header from './components/Header';
import Footer from './components/Footer';
import RouteTracker from './components/RouteTracker';
import DocumentTitle from "./components/DocumentTitle";
import ScrollToTop from "./components/ScrollToTop";
// import GlobalProtection from './components/GlobalProtection';
import EnrollmentCelebration from './components/EnrollmentCelebration';
import PWABottomTabBar from './components/PWABottomTabBar';
import PixelSnow from './components/PixelSnow';
import RequireAdmin from './components/RequireAdmin';
import PageSkeleton from './components/PageSkeleton';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useAuth } from './auth/AuthContext';

// Lazy-loaded pages (code splitting for faster initial load)
const Home = lazy(() => import('./pages/Home'));
const CoursesList = lazy(() => import('./pages/Courses/List'));
const CourseDetail = lazy(() => import('./pages/Courses/Detail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Enrolled = lazy(() => import('./pages/Enrolled'));
const Learn = lazy(() => import('./pages/Learn'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminIndex = lazy(() => import('./pages/admin/Index'));
const Verifications = lazy(() => import('./pages/admin/Verifications'));
const ContentAdmin = lazy(() => import('./pages/admin/Content'));
const AdminProgress = lazy(() => import('./pages/admin/Progress'));
const Account = lazy(() => import('./pages/Account'));
const Broker = lazy(() => import('./pages/Broker'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/Company/About'));
const Careers = lazy(() => import('./pages/Company/Careers'));
const Terms = lazy(() => import('./pages/Legal/Terms'));
const Policy = lazy(() => import('./pages/Legal/Policy'));
const Resources = lazy(() => import('./pages/Learn/Resources'));
const FAQ = lazy(() => import('./pages/Learn/FAQ'));
const Apply = lazy(() => import('./pages/Apply'));
const NotFound = lazy(() => import('./pages/404'));
const Status = lazy(() => import('./pages/Status'));
const Crypto = lazy(() => import('./pages/Guide/Crypto'));
const TokenPage = lazy(() => import('./pages/Token'));
const Discord = lazy(() => import('./pages/Discord'));
const TokenCheckout = lazy(() => import('./pages/TokenCheckout'));
const Hub = lazy(() => import('./pages/Hub'));
const Indicators = lazy(() => import('./pages/Indicators'));
const GitHubCallback = lazy(() => import('./pages/GitHubCallback'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));

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
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Suspense fallback={<PageSkeleton variant="course" />}><CoursesList /></Suspense>} />
              <Route path="/products/indicators" element={<Suspense fallback={<PageSkeleton variant="course" />}><Indicators /></Suspense>} />
              <Route path="/products/:id" element={<Suspense fallback={<PageSkeleton variant="course" />}><CourseDetail /></Suspense>} />
              <Route path="/checkout" element={<Suspense fallback={<PageSkeleton variant="checkout" />}><Checkout /></Suspense>} />
              <Route path="/learn/:id" element={<Learn />} />
              <Route path="/enrolled" element={<Enrolled />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Suspense fallback={<PageSkeleton variant="auth" />}><Login /></Suspense>} />
              <Route path="/auth/github/callback" element={<Suspense fallback={<PageSkeleton variant="auth" />}><GitHubCallback /></Suspense>} />
              <Route path="/auth/google/callback" element={<Suspense fallback={<PageSkeleton variant="auth" />}><GoogleCallback /></Suspense>} />
              <Route path="/forgot-password" element={<Suspense fallback={<PageSkeleton variant="auth" />}><ForgotPassword /></Suspense>} />
              <Route path="/reset-password/:token" element={<Suspense fallback={<PageSkeleton variant="auth" />}><ResetPassword /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<PageSkeleton variant="auth" />}><Register /></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<PageSkeleton variant="dashboard" />}><Dashboard /></Suspense>} />
              <Route path="/path" element={<Hub />} />
              <Route path="/progress" element={<Hub />} />
              <Route path="/hub" element={<Hub />} />
              <Route path="/account" element={<Account />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Suspense fallback={<PageSkeleton variant="dashboard" />}><AdminIndex /></Suspense>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/verifications"
                element={
                  <RequireAdmin>
                    <Suspense fallback={<PageSkeleton variant="dashboard" />}><Verifications /></Suspense>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/content"
                element={
                  <RequireAdmin>
                    <Suspense fallback={<PageSkeleton variant="dashboard" />}><ContentAdmin /></Suspense>
                  </RequireAdmin>
                }
              />
              <Route
                path="/admin/progress"
                element={
                  <RequireAdmin>
                    <Suspense fallback={<PageSkeleton variant="dashboard" />}><AdminProgress /></Suspense>
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
              <Route path="/token/checkout" element={<Suspense fallback={<PageSkeleton variant="checkout" />}><TokenCheckout /></Suspense>} />
              <Route path="/discord" element={<Discord />} />
              <Route path="/apply/:id" element={<Apply />} />
              <Route path="/broker" element={<Broker />} />
              <Route path="/status" element={<Status />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Box>
        <EnrollmentCelebration />
        {!isChatPage && <Footer />}
        <PWABottomTabBar />
    </Box>
  );
}

export default App;
