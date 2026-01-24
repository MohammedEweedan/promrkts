import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

const Account: React.FC = () => {
  const { t } = useTranslation() as unknown as { t: (key: string, options?: any) => string };
  const { user } = useAuth();

  return (
    <Box bg="transparent" color="text.primary" py={10}>
        <VStack align="center" gap={4}>
          <Heading size="lg">{t('account.title')}</Heading>
          <Text color="text.muted">{t('account.subtitle')}</Text>
          <Box bg="bg.surface">
            {user ? (
              <>
                <Heading size="md" mb={2}>{t('header.hi', { name: user.name || user.email || 'Trader' })}</Heading>
                <Text color="text.muted">ID: {user.id}</Text>
                {user.email && <Text color="text.muted">Email: {user.email}</Text>}
              </>
            ) : (
              <Text color="text.muted">{t('auth.login_subtitle')}</Text>
            )}
          </Box>
        </VStack>
    </Box>
  );
};

export default Account;
