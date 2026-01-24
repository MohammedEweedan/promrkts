/* eslint-disable no-mixed-operators */
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { Box, Container, Heading, Text, VStack, Input, Button, HStack } from '@chakra-ui/react';
import SpotlightCard from '../components/SpotlightCard';
import { useToast } from '@chakra-ui/react';

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation() as any;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [manualToken, setManualToken] = useState(token || '');
  const [showManualEntry, setShowManualEntry] = useState(!Boolean(token));
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [tokenErrorMsg, setTokenErrorMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const tokenToUse = token || manualToken;
    if (!tokenToUse) {
      setError(t('auth.no_token') || 'Missing reset token');
      return;
    }
    if (!password || password.length < 8) {
      setError(t('auth.password_min') || 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError(t('auth.password_mismatch') || 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${tokenToUse}`, { password });
      toast({
        status: 'success',
        title: t('auth.reset_success') || 'Password reset',
        description: t('auth.reset_success_desc') || 'Your password has been updated. Please sign in with your new password.',
      });
      navigate('/login');
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || t('auth.reset_error') || 'Failed to reset password';
      setError(msg);
      // Mark token as invalid/expired based on message or response code
      if (
        status === 404 ||
        status === 400 && (msg.toLowerCase().includes('validation failed') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) ||
        msg.toLowerCase().includes('invalid or expired token') ||
        msg.toLowerCase().includes('expired')
      ) {
        setTokenErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  async function resendLink() {
    if (!resendEmail) {
      setError(t('auth.email_required') || 'Email required to resend link');
      return;
    }
    setResendLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email: resendEmail });
      setTokenErrorMsg(null);
      toast({
        status: 'success',
        title: t('auth.forgot_sent') || 'Reset link sent',
        description: t('auth.forgot_sent_desc') || 'If that email exists, we sent a reset link. Check your inbox.',
      });
      navigate('/login');
    } catch (e: any) {
      setError(e?.response?.data?.message || t('auth.forgot_error') || 'Failed to send reset link');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Box bg="transparent" color="text.primary" minH="60vh" display="flex" alignItems="center" justifyContent="center" py={8}>
      <Container maxW="lg">
        <VStack gap={6} align="center">
          <VStack gap={1} textAlign="center" mt={6}>
            <Heading size="lg">{t('auth.reset_title') || 'Reset password'}</Heading>
            <Text color="text.muted">{t('auth.reset_subtitle') || 'Enter a new password for your account.'}</Text>
          </VStack>
          <SpotlightCard>
            <Box bg="bg.surface" borderRadius="lg" borderWidth="1px" borderColor="border.default" p={6}>
              {error && <Text mb={4} color="red.500">{error}</Text>}
              {tokenErrorMsg && (
                <Box mb={4}>
                  <Text mb={2} color="orange.400" fontWeight={600}>{tokenErrorMsg}</Text>
                  <Text fontSize="sm" color="text.muted">{t('auth.reset_token_expired_desc') || 'The reset token may be invalid or expired. You can request a new token below.'}</Text>
                  <Box mt={3} display="flex" gap={2} alignItems="center">
                    <Input placeholder={(t('auth.email') as string) || 'you@example.com'} value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} />
                    <Button onClick={resendLink} bg="#65a8bf" isLoading={resendLoading}>
                      {t('auth.forgot_cta') || 'Send reset link'}
                    </Button>
                  </Box>
                </Box>
              )}
              <form onSubmit={onSubmit}>
                <VStack align="stretch" gap={4}>
                  {/* Manual token entry */}
                  <Box>
                    <Text fontSize="sm" mb={1} color="text.muted">{t('auth.reset_token') || 'Reset token'}</Text>
                    <HStack>
                      <Input
                        type="text"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder={(t('auth.reset_token_placeholder') as string) || 'Paste the token here if not using link'}
                        readOnly={!showManualEntry && Boolean(token)}
                      />
                      <Button onClick={() => setShowManualEntry((v) => !v)} variant="ghost" size="sm">
                        {showManualEntry ? (t('auth.hide_token') || 'Hide') : (t('auth.enter_token') || 'Enter token')}
                      </Button>
                    </HStack>
                    {Boolean(token) && !showManualEntry && (
                      <Text fontSize="xs" color="text.muted">{t('auth.using_link_token') || 'Using token from link — you can enter a different one manually below.'}</Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontSize="sm" mb={1} color="text.muted">{t('auth.password') || 'New password'}</Text>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={(t('auth.password_placeholder') as string) || '••••••••'} required />
                  </Box>

                  <Box>
                    <Text fontSize="sm" mb={1} color="text.muted">{t('auth.password_confirm') || 'Confirm password'}</Text>
                    <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={(t('auth.password_placeholder') as string) || '••••••••'} required />
                  </Box>

                  <Button type="submit" variant="solid" minW="20rem" bg="#65a8bf" alignSelf="center" disabled={loading} isLoading={loading}>
                    {t('auth.reset_cta') || 'Reset password'}
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

export default ResetPassword;
