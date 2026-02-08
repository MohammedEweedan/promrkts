/**
 * PremiumCheckoutCard - Sleek order summary card for checkout
 * 
 * Features:
 * - Premium glass morphism design
 * - Trust signals and security badges
 * - Animated price display
 * - Urgency indicators
 * - Social proof elements
 */
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Divider,
  Icon,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Shield, Lock, Star, Users, Clock, CheckCircle, Zap } from 'lucide-react';

const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

interface PremiumCheckoutCardProps {
  tierName: string;
  tierLevel?: string;
  originalPrice: number;
  finalPrice: number;
  discount?: number;
  currency?: string;
  features?: string[];
  enrolledCount?: number;
  rating?: number;
  isBundle?: boolean;
  bundleItems?: string[];
  urgencyText?: string;
}

const MotionBox = motion(Box);

const PremiumCheckoutCard: React.FC<PremiumCheckoutCardProps> = ({
  tierName,
  tierLevel,
  originalPrice,
  finalPrice,
  discount,
  currency = 'USD',
  features = [],
  enrolledCount,
  rating,
  isBundle,
  bundleItems = [],
  urgencyText,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const hasDiscount = discount && discount > 0;
  const savingsPercent = hasDiscount ? Math.round((discount / originalPrice) * 100) : 0;

  const cardBg = isDark
    ? 'linear-gradient(135deg, rgba(101, 168, 191, 0.08) 0%, rgba(183, 162, 125, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(101, 168, 191, 0.06) 0%, rgba(183, 162, 125, 0.03) 100%)';
  const cardBorder = isDark ? 'rgba(101, 168, 191, 0.3)' : 'rgba(101, 168, 191, 0.4)';
  const textMuted = isDark ? 'whiteAlpha.700' : 'gray.600';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow={isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'}
        backdropFilter="blur(10px)"
      >
        {/* Header with tier info */}
        <Box
          bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
          px={6}
          py={4}
        >
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="white" fontWeight="700">
                {tierName}
              </Heading>
              {tierLevel && (
                <Badge
                  bg="whiteAlpha.200"
                  color="white"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {tierLevel}
                </Badge>
              )}
            </VStack>
            {isBundle && (
              <Badge
                bg="white"
                color={BRAND}
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="600"
              >
                BUNDLE
              </Badge>
            )}
          </HStack>
        </Box>

        <VStack align="stretch" spacing={4} p={6}>
          {/* Social proof */}
          {(enrolledCount || rating) && (
            <HStack spacing={4} justify="center" flexWrap="wrap">
              {enrolledCount && enrolledCount > 0 && (
                <HStack spacing={1} color={textMuted}>
                  <Icon as={Users} boxSize={4} color={BRAND} />
                  <Text fontSize="sm" fontWeight="500">
                    {enrolledCount.toLocaleString()}+ enrolled
                  </Text>
                </HStack>
              )}
              {rating && rating > 0 && (
                <HStack spacing={1} color={textMuted}>
                  <Icon as={Star} boxSize={4} color={GOLD} fill={GOLD} />
                  <Text fontSize="sm" fontWeight="500">
                    {rating.toFixed(1)} rating
                  </Text>
                </HStack>
              )}
            </HStack>
          )}

          {/* Urgency banner */}
          {urgencyText && (
            <MotionBox
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
            >
              <HStack
                bg={isDark ? 'rgba(239, 68, 68, 0.15)' : 'red.50'}
                border="1px solid"
                borderColor="red.300"
                borderRadius="lg"
                px={4}
                py={2}
                justify="center"
              >
                <Icon as={Clock} boxSize={4} color="red.500" />
                <Text fontSize="sm" fontWeight="600" color="red.500">
                  {urgencyText}
                </Text>
              </HStack>
            </MotionBox>
          )}

          {/* Bundle items */}
          {isBundle && bundleItems.length > 0 && (
            <Box
              bg={isDark ? 'whiteAlpha.50' : 'gray.50'}
              borderRadius="lg"
              p={4}
            >
              <Text fontSize="sm" fontWeight="600" mb={2} color={BRAND}>
                Includes:
              </Text>
              <VStack align="start" spacing={1}>
                {bundleItems.map((item, idx) => (
                  <HStack key={idx} spacing={2}>
                    <Icon as={CheckCircle} boxSize={4} color="green.500" />
                    <Text fontSize="sm">{item}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Features list */}
          {features.length > 0 && (
            <VStack align="start" spacing={2}>
              {features.slice(0, 4).map((feature, idx) => (
                <HStack key={idx} spacing={2}>
                  <Icon as={Zap} boxSize={4} color={GOLD} />
                  <Text fontSize="sm">{feature}</Text>
                </HStack>
              ))}
            </VStack>
          )}

          <Divider borderColor={cardBorder} />

          {/* Price section */}
          <VStack spacing={2}>
            {hasDiscount && (
              <HStack spacing={2}>
                <Text
                  fontSize="lg"
                  color={textMuted}
                  textDecoration="line-through"
                >
                  ${originalPrice.toFixed(2)}
                </Text>
                <Badge
                  bg="green.500"
                  color="white"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontWeight="600"
                >
                  SAVE {savingsPercent}%
                </Badge>
              </HStack>
            )}
            <HStack align="baseline" spacing={1}>
              <Text fontSize="sm" color={textMuted}>
                {currency}
              </Text>
              <Heading
                size="2xl"
                bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`}
                bgClip="text"
                fontWeight="800"
              >
                {finalPrice <= 0 ? 'FREE' : `$${finalPrice.toFixed(2)}`}
              </Heading>
            </HStack>
            {finalPrice > 0 && (
              <Text fontSize="xs" color={textMuted}>
                One-time payment • Lifetime access
              </Text>
            )}
          </VStack>

          <Divider borderColor={cardBorder} />

          {/* Trust signals */}
          <VStack spacing={3}>
            <HStack spacing={6} justify="center" flexWrap="wrap">
              <Tooltip label="256-bit SSL encryption">
                <HStack spacing={1} color={textMuted}>
                  <Icon as={Lock} boxSize={4} color="green.500" />
                  <Text fontSize="xs">Secure</Text>
                </HStack>
              </Tooltip>
              <Tooltip label="Money-back guarantee">
                <HStack spacing={1} color={textMuted}>
                  <Icon as={Shield} boxSize={4} color={BRAND} />
                  <Text fontSize="xs">Protected</Text>
                </HStack>
              </Tooltip>
            </HStack>
            <Text fontSize="xs" color={textMuted} textAlign="center">
              🔒 Your payment is secured with bank-level encryption
            </Text>
          </VStack>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default PremiumCheckoutCard;
