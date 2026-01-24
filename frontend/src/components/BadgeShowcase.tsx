import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Badge as ChakraBadge,
  Progress,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Image,
} from '@chakra-ui/react';
import { Award, Lock, Star, Zap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { resolveBackendAsset } from '../utils/backendOrigin';

const BACKEND_URL = resolveBackendAsset('');
const GOLD = '#65a8bf';

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: 'MILESTONE' | 'ACHIEVEMENT' | 'STREAK' | 'SPECIAL';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserBadge {
  id: string;
  badgeId: string;
  unlockedAt: string;
  badge: Badge;
}

interface BadgeProgress {
  badge: Badge;
  isUnlocked: boolean;
  current: number;
  required: number;
  progressPercentage: number;
}

const rarityColors: Record<string, string> = {
  common: 'gray',
  rare: 'blue',
  epic: 'purple',
  legendary: 'orange',
};

const categoryIcons: Record<string, any> = {
  MILESTONE: Target,
  ACHIEVEMENT: Award,
  STREAK: Zap,
  SPECIAL: Star,
};

export const BadgeShowcase: React.FC = () => {
  const { t } = useTranslation();
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [myBadgesRes, progressRes] = await Promise.all([
        api.get('/badges/my'),
        api.get('/badges/progress'),
      ]);
      setMyBadges(myBadgesRes.data);
      setBadgeProgress(progressRes.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>{t('common.loading', 'Loading...')}</Text>
      </Box>
    );
  }

  const unlockedBadges = badgeProgress.filter((bp) => bp.isUnlocked);
  const lockedBadges = badgeProgress.filter((bp) => !bp.isUnlocked);

  const renderBadgeCard = (badgeData: BadgeProgress, isUnlocked: boolean) => {
    const { badge, current, required, progressPercentage } = badgeData;
    const CategoryIcon = categoryIcons[badge.category] || Award;

    return (
      <Card
        key={badge.id}
        bg='bg.surface'
        borderColor={isUnlocked ? rarityColors[badge.rarity] : GOLD}
        borderWidth="2px"
        opacity={isUnlocked ? 1 : 0.6}
        position="relative"
        overflow="hidden"
        _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
        transition="all 0.2s"
      >
        <CardBody>
          <VStack spacing={3} align="center">
            {/* Badge Icon/Image */}
            <Box position="relative">
              {badge.imageUrl ? (
                <Image
                  src={badge.imageUrl.startsWith('http') ? badge.imageUrl : `${BACKEND_URL}${badge.imageUrl}`}
                  alt={badge.name}
                  boxSize="80px"
                  objectFit="contain"
                  filter={isUnlocked ? 'none' : 'grayscale(100%)'}
                  onError={(e) => {
                    console.error('Failed to load badge image:', badge.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Flex
                  w="80px"
                  h="80px"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <Icon
                    as={isUnlocked ? CategoryIcon : Lock}
                    boxSize={10}
                    color={isUnlocked ? `${rarityColors[badge.rarity]}.500` : 'gray.400'}
                  />
                </Flex>
              )}
              {!isUnlocked && (
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  <Icon as={Lock} boxSize={6} color="gray.500" />
                </Box>
              )}
            </Box>

            {/* Badge Name & Rarity */}
            <VStack spacing={1} align="center">
              <Text color="text.default" fontWeight="bold" textAlign="center" fontSize="sm">
                {badge.name}
              </Text>
              <ChakraBadge colorScheme={rarityColors[badge.rarity]} size="sm">
                {badge.rarity}
              </ChakraBadge>
            </VStack>

            {/* Description */}
            <Text fontSize="xs" color="text.default" textAlign="center" minH="40px">
              {badge.description}
            </Text>

            {/* Progress Bar (for locked badges) */}
            {!isUnlocked && required > 0 && (
              <Box w="full">
                <HStack justify="space-between" fontSize="xs" mb={1}>
                  <Text>
                    {current} / {required}
                  </Text>
                  <Text>{Math.round(progressPercentage)}%</Text>
                </HStack>
                <Progress
                  value={progressPercentage}
                  colorScheme={rarityColors[badge.rarity]}
                  size="sm"
                  borderRadius="full"
                />
              </Box>
            )}

            {/* Unlocked Date */}
            {isUnlocked && (
              <Text fontSize="xs">
                {t('badges.unlocked_at', 'Unlocked')}{' '}
                {myBadges.find((mb) => mb.badgeId === badge.id)?.unlockedAt
                  ? new Date(
                      myBadges.find((mb) => mb.badgeId === badge.id)!.unlockedAt
                    ).toLocaleDateString()
                  : ''}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4}>
            <Flex align="center">
              <Icon as={Award} mr={2} />
              {t('badges.title', 'Badges')} ({unlockedBadges.length} / {badgeProgress.length})
            </Flex>
          </Heading>

          <Tabs colorScheme="blue">
            <TabList>
              <Tab>
                <HStack>
                  <Text>{t('badges.unlocked', 'Unlocked')}</Text>
                  <ChakraBadge colorScheme="green">{unlockedBadges.length}</ChakraBadge>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Text>{t('badges.locked', 'Locked')}</Text>
                  <ChakraBadge>{lockedBadges.length}</ChakraBadge>
                </HStack>
              </Tab>
              <Tab>{t('badges.all', 'All')}</Tab>
            </TabList>

            <TabPanels>
              {/* Unlocked Badges */}
              <TabPanel>
                {unlockedBadges.length > 0 ? (
                  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                    {unlockedBadges.map((bp) => renderBadgeCard(bp, true))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Icon as={Lock} boxSize={12} mb={2} />
                    <Text>{t('badges.no_badges_yet', 'No badges unlocked yet')}</Text>
                    <Text fontSize="sm">
                      {t('badges.complete_lessons', 'Complete lessons and courses to earn badges!')}
                    </Text>
                  </Box>
                )}
              </TabPanel>

              {/* Locked Badges */}
              <TabPanel>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                  {lockedBadges.map((bp) => renderBadgeCard(bp, false))}
                </SimpleGrid>
              </TabPanel>

              {/* All Badges */}
              <TabPanel>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                  {badgeProgress.map((bp) => renderBadgeCard(bp, bp.isUnlocked))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default BadgeShowcase;
