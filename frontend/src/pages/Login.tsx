import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { loginFunnel, identify } from '../utils/tracking';
import { Box, Container, Heading, Text, VStack, HStack, Input, Button, chakra, Icon, useColorMode } from '@chakra-ui/react';
import { useAuth } from '../auth/AuthContext';
import SpotlightCard from '../components/SpotlightCard';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import TrustBadges, { SocialProofBanner } from '../components/TrustBadges';

const MotionBox = motion(Box);
const CCheckbox = chakra('input');

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation() as any;
  const { refresh, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasTrackedStart = useRef(false);

  // Track login started on mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      loginFunnel.started();
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password, remember });
      const user = data?.data?.user || data?.user;
      const token = data?.data?.accessToken || data?.accessToken || data?.token || '';
      if (token) localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('authUser', JSON.stringify(user));
        setUser(user);
        // Track successful login and identify user
        identify(user.id || email, { email, name: user.name });
        loginFunnel.completed(user.id || email);
      } else {
        await refresh();
        loginFunnel.completed(email);
      }
      try { sessionStorage.setItem('auth_splash_once', '1'); } catch {}
      navigate('/dashboard');
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || t('auth.login_error') || 'Login failed';
      setError(errorMsg);
      loginFunnel.failed(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box bg="transparent" color="text.primary" minH="60vh" display="flex" alignItems="center" justifyContent="center" py={{ base: 8, md: 12 }}>
      <Container maxW="md">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack gap={6} align="center">
            {/* Premium Header */}
            <VStack gap={3} textAlign="center" mt={8}>
              <HStack
                bg={isDark ? 'whiteAlpha.100' : 'blackAlpha.50'}
                border="1px solid"
                borderColor={isDark ? 'whiteAlpha.200' : 'blackAlpha.100'}
                borderRadius="full"
                px={4}
                py={2}
                spacing={2}
              >
                <Icon as={Sparkles} boxSize={4} color="#b7a27d" />
                <Text fontSize="sm" fontWeight="500">
                  {t('auth.premium_access') || 'Premium Trading Access'}
                </Text>
              </HStack>
              
              <Heading
                size="xl"
                bgGradient="linear(to-r, #65a8bf, #b7a27d)"
                bgClip="text"
                fontWeight="800"
              >
                {t('auth.login_title') || 'Welcome Back'}
              </Heading>
              <Text color="text.muted" fontSize="md">
                {t('auth.login_subtitle') || 'Continue your journey to financial mastery'}
              </Text>
              <SocialProofBanner enrolledCount={2847} />
            </VStack>

            <SpotlightCard>
              {error && (
                <Box
                  mb={4}
                  p={3}
                  bg="red.500"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="red.300"
                >
                  <Text color="white" fontSize="sm">{error}</Text>
                </Box>
              )}
              <form onSubmit={onSubmit}>
                <VStack align="stretch" gap={5}>
                  <Box>
                    <Text fontSize="sm" mb={2} fontWeight="500" color="#65a8bf">
                      {t('auth.email') || 'Email'}
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={(t('auth.email_placeholder') as string) || 'you@example.com'}
                      required
                      size="lg"
                      borderRadius="xl"
                      borderColor="rgba(101, 168, 191, 0.3)"
                      _focus={{ borderColor: '#65a8bf', boxShadow: '0 0 0 1px #65a8bf' }}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" mb={2} fontWeight="500" color="#65a8bf">
                      {t('auth.password') || 'Password'}
                    </Text>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={(t('auth.password_placeholder') as string) || '••••••••'}
                      required
                      size="lg"
                      borderRadius="xl"
                      borderColor="rgba(101, 168, 191, 0.3)"
                      _focus={{ borderColor: '#65a8bf', boxShadow: '0 0 0 1px #65a8bf' }}
                    />
                  </Box>

                  <HStack justify="space-between" align="center">
                    <HStack>
                      <CCheckbox
                        type="checkbox"
                        checked={remember}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
                        aria-label="remember me"
                      />
                      <Text fontSize="sm">{t('auth.remember_me') || 'Remember me'}</Text>
                    </HStack>
                    <RouterLink to="/forgot-password" style={{ color: '#65a8bf', fontSize: '14px' }}>
                      {t('auth.forgot_password') || 'Forgot password?'}
                    </RouterLink>
                  </HStack>

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    bg="linear-gradient(135deg, #65a8bf, #b7a27d)"
                    color="white"
                    fontWeight="700"
                    py={6}
                    rightIcon={<ArrowRight size={18} />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(101, 168, 191, 0.4)',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                    disabled={loading}
                    borderRadius="xl"
                  >
                    <Icon as={Lock} boxSize={4} mr={2} />
                    {loading ? (t('auth.login_loading') || 'Signing you in…') : (t('auth.login_cta') || 'Sign In Securely')}
                  </Button>
                </VStack>
              </form>
            </SpotlightCard>

            {/* Trust Badges */}
            <TrustBadges variant="compact" showGuarantee={false} />

            <Text color="#65a8bf" textAlign="center">
              {t('auth.no_account') || "Don't have an account?"}{' '}
              <RouterLink to="/register" style={{ color: '#b7a27d', fontWeight: '600' }}>
                {t('auth.join_us') || 'Join the Trading Elite'}
              </RouterLink>
            </Text>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Login;
