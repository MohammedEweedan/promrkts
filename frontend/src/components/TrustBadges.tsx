/**
 * TrustBadges - Security and trust indicators for checkout/registration
 * 
 * Displays payment security badges, guarantees, and social proof
 * to increase conversion confidence
 */
import React, { useEffect, useState } from 'react';
import {
  HStack,
  VStack,
  Text,
  Icon,
  Box,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react';
import { Shield, Lock, CreditCard, RefreshCw, Award, CheckCircle } from 'lucide-react';
import api from '../api/client';

const BRAND = '#65a8bf';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical' | 'compact';
  showGuarantee?: boolean;
  showSecure?: boolean;
  showPayments?: boolean;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = 'horizontal',
  showGuarantee = true,
  showSecure = true,
  showPayments = true,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const textMuted = isDark ? 'whiteAlpha.600' : 'gray.500';
  const badgeBg = isDark ? 'whiteAlpha.50' : 'gray.50';

  const badges = [
    ...(showSecure ? [{
      icon: Lock,
      label: 'SSL Secured',
      tooltip: '256-bit SSL encryption protects your data',
      color: 'green.500',
    }] : []),
    ...(showGuarantee ? [{
      icon: Shield,
      label: 'Money-Back',
      tooltip: '30-day money-back guarantee',
      color: BRAND,
    }] : []),
    ...(showPayments ? [{
      icon: CreditCard,
      label: 'Safe Payments',
      tooltip: 'Stripe & USDT accepted',
      color: 'purple.500',
    }] : []),
  ];

  if (variant === 'compact') {
    return (
      <HStack spacing={4} justify="center" flexWrap="wrap">
        {badges.map((badge, idx) => (
          <Tooltip key={idx} label={badge.tooltip} hasArrow>
            <HStack spacing={1} color={textMuted} cursor="help">
              <Icon as={badge.icon} boxSize={4} color={badge.color} />
              <Text fontSize="xs" fontWeight="500">{badge.label}</Text>
            </HStack>
          </Tooltip>
        ))}
      </HStack>
    );
  }

  if (variant === 'vertical') {
    return (
      <VStack spacing={3} align="stretch">
        {badges.map((badge, idx) => (
          <Tooltip key={idx} label={badge.tooltip} hasArrow placement="left">
            <HStack
              spacing={3}
              p={3}
              bg={badgeBg}
              borderRadius="lg"
              cursor="help"
              _hover={{ bg: isDark ? 'whiteAlpha.100' : 'gray.100' }}
              transition="background 0.2s"
            >
              <Box
                p={2}
                borderRadius="full"
                bg={`${badge.color}20`}
              >
                <Icon as={badge.icon} boxSize={5} color={badge.color} />
              </Box>
              <Text fontSize="sm" fontWeight="500">{badge.label}</Text>
            </HStack>
          </Tooltip>
        ))}
      </VStack>
    );
  }

  return (
    <HStack spacing={6} justify="center" flexWrap="wrap" py={4}>
      {badges.map((badge, idx) => (
        <Tooltip key={idx} label={badge.tooltip} hasArrow>
          <VStack spacing={1} cursor="help">
            <Box
              p={3}
              borderRadius="full"
              bg={badgeBg}
              border="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
            >
              <Icon as={badge.icon} boxSize={6} color={badge.color} />
            </Box>
            <Text fontSize="xs" fontWeight="500" color={textMuted}>
              {badge.label}
            </Text>
          </VStack>
        </Tooltip>
      ))}
    </HStack>
  );
};

export const SocialProofBanner: React.FC<{
  enrolledCount?: number;
  recentPurchases?: number;
  useLiveCount?: boolean;
}> = ({ enrolledCount, recentPurchases, useLiveCount = true }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    if (!useLiveCount) return;
    
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/public');
        if (res.data?.users) {
          setLiveCount(res.data.users);
        }
      } catch {
        // Silently fail - will use fallback enrolledCount
      }
    };
    
    fetchStats();
  }, [useLiveCount]);

  // Use live count if available, otherwise fallback to prop
  const displayCount = liveCount ?? enrolledCount;

  if (!displayCount && !recentPurchases) return null;

  return (
    <HStack
      spacing={4}
      justify="center"
      py={2}
      px={4}
      bg={isDark ? 'rgba(101, 168, 191, 0.1)' : 'rgba(101, 168, 191, 0.08)'}
      borderRadius="full"
      flexWrap="wrap"
    >
      {displayCount && displayCount > 0 && (
        <HStack spacing={1}>
          <Icon as={Award} boxSize={4} color={BRAND} />
          <Text fontSize="sm" fontWeight="500">
            <Text as="span" fontWeight="700" color={BRAND}>
              {displayCount.toLocaleString()}+
            </Text>{' '}
            students enrolled
          </Text>
        </HStack>
      )}
      {recentPurchases && recentPurchases > 0 && (
        <HStack spacing={1}>
          <Icon as={RefreshCw} boxSize={4} color="green.500" />
          <Text fontSize="sm" fontWeight="500">
            <Text as="span" fontWeight="700" color="green.500">
              {recentPurchases}
            </Text>{' '}
            purchased today
          </Text>
        </HStack>
      )}
    </HStack>
  );
};

export const VerifiedBadge: React.FC<{ text?: string }> = ({ text = 'Verified Purchase' }) => {
  return (
    <HStack spacing={1} color="green.500">
      <Icon as={CheckCircle} boxSize={4} />
      <Text fontSize="xs" fontWeight="600">{text}</Text>
    </HStack>
  );
};

export default TrustBadges;
