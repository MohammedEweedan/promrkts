import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { Box, Container, Heading, Text, VStack, HStack, Input, Button, chakra } from '@chakra-ui/react';
import { useAuth } from '../auth/AuthContext';
import SpotlightCard from '../components/SpotlightCard';
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
      } else {
        await refresh();
      }
      try { sessionStorage.setItem('auth_splash_once', '1'); } catch {}
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message || t('auth.login_error') || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="transparent" color="text.primary" minH="10vh" display="flex" alignItems="center" justifyContent="center" paddingY={8}>
      <Container maxW="100%">
        <VStack gap={6} align="center">
          <VStack gap={1} textAlign="center" marginTop={"2rem"}>
            <Heading size="lg">{t('auth.login_title') || 'Welcome back'}</Heading>
            <Text color="text.muted">{t('auth.login_subtitle') || 'Access premium fares, curated stays, and dedicated support'}</Text>
          </VStack>
            <SpotlightCard>
            {error && (
              <Text mb={4} color="red.500">{error}</Text>
            )}
            <form onSubmit={onSubmit}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Text fontSize="sm" mb={1} color="text.muted">{t('auth.email') || 'Email'}</Text>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={(t('auth.email_placeholder') as string) || 'you@example.com'} required />
                </Box>
                <Box>
                  <Text fontSize="sm" mb={1} color="text.muted">{t('auth.password') || 'Password'}</Text>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={(t('auth.password_placeholder') as string) || '8+ characters'} required />
                </Box>

                <HStack justify="space-between" align="center">
                  <HStack>
                    <CCheckbox
                      type="checkbox"
                      checked={remember}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
                      aria-label="remember me"
                    />
                    <Text>{t('auth.remember_me') || 'Remember me'}</Text>
                  </HStack>
                  <RouterLink to="/forgot-password" style={{ color: 'var(--chakra-colors-accent-500)' }}>
                    {t('auth.forgot_password') || 'Forgot password?'}
                  </RouterLink>
                </HStack>

                <Button type="submit" variant="solid" minW="20rem" bg="#65a8bf" alignSelf="center" disabled={loading}>
                  {loading ? (t('auth.login_loading') || 'Signing you in…') : (t('auth.login_cta') || 'Sign in')}
                </Button>
              </VStack>
            </form>
            </SpotlightCard>

          <Text color="#65a8bf" textAlign="center" mt={4}>
            {t('auth.no_account') || "Don't have an account?"}{' '}
            <RouterLink to="/register" style={{ color: 'var(--chakra-colors-accent-500)' }}>
              {t('auth.join_us') || 'Join promrkts'}
            </RouterLink>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login;
