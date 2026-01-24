import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { Box, Container, Heading, Text, VStack, Input, Button } from '@chakra-ui/react';
import SpotlightCard from '../components/SpotlightCard';
import { useToast } from '@chakra-ui/react';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation() as any;
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      toast({
        status: 'success',
        title: t('auth.forgot_sent') || 'Reset link sent',
        description: t('auth.forgot_sent_desc') || 'If that email exists, we sent a reset link. Check your inbox.',
      });
      // Optionally redirect to login
      navigate('/login');
    } catch (e: any) {
      setError(e?.response?.data?.message || t('auth.forgot_error') || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="transparent" color="text.primary" minH="60vh" display="flex" alignItems="center" justifyContent="center" py={8}>
      <Container maxW="lg">
        <VStack gap={6} align="center">
          <VStack gap={1} textAlign="center" mt={6}>
            <Heading size="lg">{t('auth.forgot_title') || 'Forgot password'}</Heading>
            <Text color="text.muted">{t('auth.forgot_subtitle') || 'Enter your email and we will send a password reset link.'}</Text>
          </VStack>
          <SpotlightCard>
            <Box bg="bg.surface" borderRadius="lg" borderWidth="1px" borderColor="border.default" p={6}>
              {error && <Text mb={4} color="red.500">{error}</Text>}
              <form onSubmit={onSubmit}>
                <VStack align="stretch" gap={4}>
                  <Box>
                    <Text fontSize="sm" mb={1} color="text.muted">{t('auth.email') || 'Email'}</Text>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={(t('auth.email_placeholder') as string) || 'you@example.com'} required />
                  </Box>

                  <Button type="submit" variant="solid" minW="20rem" bg="#65a8bf" alignSelf="center" disabled={loading || !email} isLoading={loading}>
                    {t('auth.forgot_cta') || 'Send reset link'}
                  </Button>
                </VStack>
              </form>
            </Box>
          </SpotlightCard>
        </VStack>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
