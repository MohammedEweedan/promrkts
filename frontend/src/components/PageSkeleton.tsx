/**
 * PageSkeleton - Loading skeleton for lazy-loaded pages
 * Provides a smooth loading experience during code splitting
 */
import React from 'react';
import { Box, Container, Skeleton, SkeletonText, VStack, HStack, useColorMode } from '@chakra-ui/react';

type SkeletonVariant = 'default' | 'dashboard' | 'course' | 'checkout' | 'auth';

interface PageSkeletonProps {
  variant?: SkeletonVariant;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ variant = 'default' }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  const skeletonStart = isDark ? 'rgba(101, 168, 191, 0.1)' : 'rgba(101, 168, 191, 0.15)';
  const skeletonEnd = isDark ? 'rgba(183, 162, 125, 0.15)' : 'rgba(183, 162, 125, 0.2)';

  if (variant === 'dashboard') {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="7xl">
          <VStack spacing={6} align="stretch">
            {/* Header skeleton */}
            <HStack justify="space-between">
              <Skeleton height="40px" width="200px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
              <HStack spacing={3}>
                <Skeleton height="36px" width="100px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                <Skeleton height="36px" width="100px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
              </HStack>
            </HStack>
            
            {/* Widget grid skeleton */}
            <HStack spacing={4} align="stretch" wrap="wrap">
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  flex="1"
                  minW={{ base: '100%', md: '45%', lg: '22%' }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
                  p={4}
                >
                  <Skeleton height="20px" width="60%" mb={3} startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                  <Skeleton height="120px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                </Box>
              ))}
            </HStack>
            
            {/* Main content skeleton */}
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
              p={6}
            >
              <Skeleton height="300px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="lg" />
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (variant === 'course') {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="7xl">
          <VStack spacing={6} align="stretch">
            <Skeleton height="48px" width="300px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
            <HStack spacing={6} align="start" flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  flex="1"
                  minW={{ base: '100%', md: '300px' }}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
                  p={5}
                >
                  <Skeleton height="160px" mb={4} startColor={skeletonStart} endColor={skeletonEnd} borderRadius="lg" />
                  <SkeletonText noOfLines={3} spacing={3} startColor={skeletonStart} endColor={skeletonEnd} />
                  <Skeleton height="40px" mt={4} startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                </Box>
              ))}
            </HStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (variant === 'checkout') {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="4xl">
          <VStack spacing={6} align="stretch">
            <Skeleton height="40px" width="250px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
              p={6}
            >
              <VStack spacing={4} align="stretch">
                <Skeleton height="80px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                <HStack spacing={4}>
                  <Skeleton height="50px" flex="1" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                  <Skeleton height="50px" flex="1" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                </HStack>
                <Skeleton height="120px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                <Skeleton height="48px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (variant === 'auth') {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" py={8}>
        <Container maxW="md">
          <VStack spacing={6} align="center">
            <Skeleton height="36px" width="200px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
            <Box
              w="100%"
              borderRadius="xl"
              border="1px solid"
              borderColor={isDark ? 'whiteAlpha.100' : 'gray.200'}
              p={6}
            >
              <VStack spacing={4} align="stretch">
                <Skeleton height="44px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                <Skeleton height="44px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
                <Skeleton height="44px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Default skeleton
  return (
    <Box minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          <Skeleton height="48px" width="300px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="md" />
          <SkeletonText noOfLines={4} spacing={4} startColor={skeletonStart} endColor={skeletonEnd} />
          <Skeleton height="200px" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="xl" />
          <HStack spacing={4}>
            <Skeleton height="100px" flex="1" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="lg" />
            <Skeleton height="100px" flex="1" startColor={skeletonStart} endColor={skeletonEnd} borderRadius="lg" />
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default PageSkeleton;
