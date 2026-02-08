import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { loginFunnel, identify } from '../utils/tracking';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  chakra,
  Icon,
  useColorMode,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { useAuth } from '../auth/AuthContext';
import SpotlightCard from '../components/SpotlightCard';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, Shield, Zap, CheckCircle } from 'lucide-react';
import OAuthButtons from '../components/OAuthButtons';

const MotionBox = motion(Box);
const CCheckbox = chakra('input');
const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation() as any;
  const { refresh, setUser } = useAuth();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasTrackedStart = useRef(false);

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

  const inputStyles = {
    size: 'lg' as const,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: isDark ? 'whiteAlpha.200' : 'gray.200',
    bg: isDark ? 'rgba(255,255,255,0.03)' : 'white',
    _hover: { borderColor: isDark ? 'whiteAlpha.300' : 'gray.300' },
    _focus: { borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` },
    _placeholder: { color: isDark ? 'whiteAlpha.400' : 'gray.400' },
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 6, md: 12 }}
      px={{ base: 4, md: 0 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="600px"
        h="600px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${BRAND}08 0%, transparent 70%)`}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-15%"
        left="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${GOLD}06 0%, transparent 70%)`}
        pointerEvents="none"
      />

      <Container maxW="460px" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} align="stretch">
            {/* Premium Header */}
            <VStack spacing={3} textAlign="center" pt={{ base: 4, md: 8 }}>
              <Box
                w={14}
                h={14}
                borderRadius="2xl"
                bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow={`0 8px 32px ${BRAND}40`}
                mx="auto"
              >
                <Icon as={Lock} boxSize={6} color="white" />
              </Box>
              <Heading
                size="xl"
                bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`}
                bgClip="text"
                fontWeight="800"
              >
                {t('auth.login_title') || 'Welcome Back'}
              </Heading>
            </VStack>

            {/* OAuth Buttons */}
            <OAuthButtons
              mode="login"
              onError={(msg) => setError(msg)}
            />

            {/* Login Form Card */}
            <SpotlightCard>
              {error && (
                <Box
                  mb={4}
                  p={3}
                  bg={isDark ? 'rgba(229, 62, 62, 0.15)' : 'red.50'}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={isDark ? 'rgba(229, 62, 62, 0.3)' : 'red.200'}
                >
                  <Text color={isDark ? 'red.300' : 'red.600'} fontSize="sm" fontWeight="500">{error}</Text>
                </Box>
              )}
              <form onSubmit={onSubmit}>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="600"
                      color={isDark ? 'whiteAlpha.700' : 'gray.600'}
                    >
                      {t('auth.email') || 'Email'}
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={(t('auth.email_placeholder') as string) || 'you@example.com'}
                      required
                      {...inputStyles}
                    />
                  </Box>

                  <Box>
                    <Text
                      fontSize="sm"
                      mb={2}
                      fontWeight="600"
                      color={isDark ? 'whiteAlpha.700' : 'gray.600'}
                    >
                      {t('auth.password') || 'Password'}
                    </Text>
                    <InputGroup size="lg">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={(t('auth.password_placeholder') as string) || '••••••••'}
                        required
                        {...inputStyles}
                        pr="3rem"
                      />
                      <InputRightElement h="full">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          variant="ghost"
                          size="sm"
                          color={isDark ? 'whiteAlpha.500' : 'gray.400'}
                          _hover={{ color: BRAND }}
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </Box>

                  <HStack justify="space-between" align="center">
                    <HStack spacing={2}>
                      <CCheckbox
                        type="checkbox"
                        checked={remember}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
                        aria-label="remember me"
                        style={{ accentColor: BRAND }}
                      />
                      <Text fontSize="sm" color={isDark ? 'whiteAlpha.600' : 'gray.500'}>
                        {t('auth.remember_me') || 'Remember me'}
                      </Text>
                    </HStack>
                    <RouterLink to="/forgot-password">
                      <Text fontSize="sm" color={BRAND} fontWeight="500" _hover={{ color: GOLD }}>
                        {t('auth.forgot_password') || 'Forgot password?'}
                      </Text>
                    </RouterLink>
                  </HStack>

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
                    color="white"
                    fontWeight="700"
                    h="52px"
                    rightIcon={<ArrowRight size={18} />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 30px ${BRAND}50`,
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                    isLoading={loading}
                    loadingText={t('auth.login_loading') || 'Signing you in…'}
                    borderRadius="xl"
                    mt={2}
                  >
                    {t('auth.login_cta') || 'Sign In Securely'}
                  </Button>
                </VStack>
              </form>
            </SpotlightCard>

            {/* Trust indicators */}
            <HStack justify="center" spacing={6} flexWrap="wrap" py={2}>
              <HStack spacing={1.5}>
                <Icon as={Shield} boxSize={3.5} color="green.500" />
                <Text fontSize="xs" color={isDark ? 'whiteAlpha.500' : 'gray.400'} fontWeight="500">
                  SSL Secured
                </Text>
              </HStack>
              <HStack spacing={1.5}>
                <Icon as={Zap} boxSize={3.5} color={BRAND} />
                <Text fontSize="xs" color={isDark ? 'whiteAlpha.500' : 'gray.400'} fontWeight="500">
                  Instant Access
                </Text>
              </HStack>
              <HStack spacing={1.5}>
                <Icon as={CheckCircle} boxSize={3.5} color={GOLD} />
                <Text fontSize="xs" color={isDark ? 'whiteAlpha.500' : 'gray.400'} fontWeight="500">
                  Verified Platform
                </Text>
              </HStack>
            </HStack>

            {/* Sign up link */}
            <Text textAlign="center" fontSize="sm" color={isDark ? 'whiteAlpha.600' : 'gray.500'}>
              {t('auth.no_account') || "Don't have an account?"}{' '}
              <RouterLink to="/register">
                <Text
                  as="span"
                  color={GOLD}
                  fontWeight="700"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {t('auth.join_us') || 'Create Free Account'}
                </Text>
              </RouterLink>
            </Text>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Login;
