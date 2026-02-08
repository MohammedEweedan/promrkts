/**
 * PremiumHeroSection - High-converting hero section for products page
 * 
 * Features:
 * - Compelling headline with gradient text
 * - Value proposition bullets
 * - Social proof stats
 * - Primary CTA
 * - Animated elements
 */
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Icon,
  SimpleGrid,
  useColorMode,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

interface StatItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface PremiumHeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  stats?: StatItem[];
  showStats?: boolean;
}

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);

const defaultStats: StatItem[] = [
  { value: '100,007+', label: 'Students', icon: Users },
  { value: '4.9★', label: 'Rating', icon: Award },
  { value: '$50K+', label: 'Avg. Profit', icon: TrendingUp },
  { value: '100%', label: 'Secure', icon: Shield },
];

const PremiumHeroSection: React.FC<PremiumHeroSectionProps> = ({
  title = 'Master the Markets. Build Your Wealth.',
  subtitle = 'Join thousands of successful traders who transformed their financial future with our proven strategies and expert guidance.',
  ctaText = 'Start Your Journey',
  ctaLink = '/register',
  stats = defaultStats,
  showStats = true,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const heroBg = isDark
    ? 'linear-gradient(135deg, rgba(101, 168, 191, 0.08) 0%, rgba(183, 162, 125, 0.05) 50%, rgba(20, 20, 30, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(101, 168, 191, 0.06) 0%, rgba(183, 162, 125, 0.03) 50%, rgba(255, 255, 255, 0.95) 100%)';

  return (
    <Box
      position="relative"
      overflow="hidden"
      py={{ base: 12, md: 20 }}
      px={{ base: 4, md: 8 }}
    >
      {/* Background gradient */}
      <Box
        position="absolute"
        inset={0}
        bg={heroBg}
        zIndex={0}
      />

      {/* Animated background elements */}
      <MotionBox
        position="absolute"
        top="10%"
        right="5%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${BRAND}20 0%, transparent 70%)`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        zIndex={0}
      />
      <MotionBox
        position="absolute"
        bottom="20%"
        left="10%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${GOLD}15 0%, transparent 70%)`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        zIndex={0}
      />

      <VStack
        position="relative"
        zIndex={1}
        spacing={{ base: 8, md: 12 }}
        maxW="5xl"
        mx="auto"
        textAlign="center"
      >
        {/* Badge */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HStack
            bg={isDark ? 'whiteAlpha.100' : 'blackAlpha.50'}
            border="1px solid"
            borderColor={isDark ? 'whiteAlpha.200' : 'blackAlpha.100'}
            borderRadius="full"
            px={4}
            py={2}
            spacing={2}
          >
            <Icon as={Sparkles} boxSize={4} color={GOLD} />
            <Text fontSize="sm" fontWeight="500">
              Premium Trading Education
            </Text>
          </HStack>
        </MotionBox>

        {/* Main headline */}
        <MotionHeading
          as="h1"
          size={{ base: 'xl', md: '3xl' }}
          fontWeight="800"
          lineHeight="shorter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Text
            as="span"
            bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`}
            bgClip="text"
          >
            {title.split('.')[0]}.
          </Text>
          {title.split('.').slice(1).join('.')}
        </MotionHeading>

        {/* Subtitle */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            color={isDark ? 'whiteAlpha.800' : 'gray.600'}
            maxW="3xl"
            lineHeight="tall"
          >
            {subtitle}
          </Text>
        </MotionBox>

        {/* CTA Button */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            as={RouterLink}
            to={ctaLink}
            size="lg"
            bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
            color="white"
            fontWeight="700"
            px={10}
            py={7}
            fontSize="lg"
            rightIcon={<ArrowRight size={20} />}
            _hover={{
              transform: 'translateY(-3px)',
              boxShadow: `0 12px 35px rgba(101, 168, 191, 0.4)`,
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s"
          >
            {ctaText}
          </Button>
        </MotionBox>

        {/* Stats */}
        {showStats && (
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            w="full"
          >
            <SimpleGrid
              columns={{ base: 2, md: 4 }}
              gap={{ base: 4, md: 8 }}
              maxW="4xl"
              mx="auto"
              pt={8}
            >
              {stats.map((stat, idx) => (
                <VStack
                  key={idx}
                  p={4}
                  bg={isDark ? 'whiteAlpha.50' : 'blackAlpha.30'}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={isDark ? 'whiteAlpha.100' : 'blackAlpha.50'}
                  spacing={2}
                >
                  <Icon as={stat.icon} boxSize={6} color={BRAND} />
                  <Text
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="800"
                    bgGradient={`linear(to-r, ${BRAND}, ${GOLD})`}
                    bgClip="text"
                  >
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color={isDark ? 'whiteAlpha.700' : 'gray.600'}>
                    {stat.label}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </MotionBox>
        )}
      </VStack>
    </Box>
  );
};

export default PremiumHeroSection;
