import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Heading,
  Badge as ChakraBadge,
  SimpleGrid,
  Flex,
  Spinner,
  Progress,
  Image,
  Icon,
} from '@chakra-ui/react';
import { Award, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/client';
import { resolveBackendAsset } from '../../utils/backendOrigin';

const GOLD = '#65a8bf';
const BACKEND_URL = resolveBackendAsset('');

interface BadgeStats {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeRarity: string;
  badgeCategory: string;
  badgeImageUrl?: string;
  unlockedCount: number;
  totalUsers: number;
  unlockPercentage: number;
}

export const BadgeLeaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [badgeStats, setBadgeStats] = useState<BadgeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadgeStats();
  }, []);

  const fetchBadgeStats = async () => {
    try {
      const [badgesRes, usersRes] = await Promise.all([
        api.get('/badges'),
        api.get('/admin/users'),
      ]);

      const badges = badgesRes.data;
      const totalUsers = usersRes.data.length;

      const stats: BadgeStats[] = [];

      for (const badge of badges) {
        try {
          // Count how many users have this badge
          const userBadgesRes = await api.get(`/admin/badge-holders/${badge.id}`);
          const unlockedCount = userBadgesRes.data.length || 0;

          stats.push({
            badgeId: badge.id,
            badgeName: badge.name,
            badgeDescription: badge.description,
            badgeRarity: badge.rarity,
            badgeCategory: badge.category,
            badgeImageUrl: badge.imageUrl,
            unlockedCount,
            totalUsers,
            unlockPercentage: totalUsers > 0 ? (unlockedCount / totalUsers) * 100 : 0,
          });
        } catch (error) {
          // Badge has no holders yet
          stats.push({
            badgeId: badge.id,
            badgeName: badge.name,
            badgeDescription: badge.description,
            badgeRarity: badge.rarity,
            badgeCategory: badge.category,
            badgeImageUrl: badge.imageUrl,
            unlockedCount: 0,
            totalUsers,
            unlockPercentage: 0,
          });
        }
      }

      // Sort by unlock count
      stats.sort((a, b) => b.unlockedCount - a.unlockedCount);

      setBadgeStats(stats);
    } catch (error) {
      console.error('Error fetching badge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'gray';
      case 'rare':
        return 'blue';
      case 'epic':
        return 'purple';
      case 'legendary':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const mostPopularBadge = badgeStats[0];
  const rarestBadge = badgeStats[badgeStats.length - 1];

  return (
    <VStack spacing={6} align="stretch">
      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={Award} color="blue.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="bold">
                  {t('admin.badge_stats.total_badges', 'Total Badges')}
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold">
                {badgeStats.length}
              </Text>
              <Text fontSize="xs">
                {t('admin.badge_stats.available', 'Available to unlock')}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={TrendingUp} color="green.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="bold">
                  {t('admin.badge_stats.most_popular', 'Most Popular')}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold">
                {mostPopularBadge?.badgeName}
              </Text>
              <Text fontSize="xs">
                {mostPopularBadge?.unlockedCount} {t('admin.badge_stats.students', 'students')} ({Math.round(mostPopularBadge?.unlockPercentage || 0)}%)
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={Award} color="orange.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="bold">
                  {t('admin.badge_stats.rarest', 'Rarest Badge')}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold">
                {rarestBadge?.badgeName}
              </Text>
              <Text fontSize="xs">
                {rarestBadge?.unlockedCount} {t('admin.badge_stats.students', 'students')} ({Math.round(rarestBadge?.unlockPercentage || 0)}%)
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Badge Stats Table */}
      <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4}>
            {t('admin.badge_stats.unlock_stats', 'Badge Unlock Statistics')}
          </Heading>

          <VStack spacing={3} align="stretch">
            {badgeStats.map((badge, index) => (
              <Box
                key={badge.badgeId}
                p={4}
                borderWidth="1px"
                borderColor={GOLD}
                borderRadius="md"
              >
                <HStack justify="space-between" align="start">
                  <HStack spacing={4} flex={1}>
                    {/* Badge Icon/Image */}
                    <Flex
                      w="50px"
                      h="50px"
                      borderRadius="full"
                      bg={`${getRarityColor(badge.badgeRarity)}.100`}
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      {badge.badgeImageUrl ? (
                        <Image
                          src={badge.badgeImageUrl.startsWith('http') ? badge.badgeImageUrl : `${BACKEND_URL}${badge.badgeImageUrl}`}
                          alt={badge.badgeName}
                          boxSize="40px"
                          objectFit="contain"
                        />
                      ) : (
                        <Icon
                          as={Award}
                          boxSize={6}
                          color={`${getRarityColor(badge.badgeRarity)}.500`}
                        />
                      )}
                    </Flex>

                    {/* Badge Info */}
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Text fontWeight="bold">{badge.badgeName}</Text>
                        <ChakraBadge colorScheme={getRarityColor(badge.badgeRarity)} size="sm">
                          {badge.badgeRarity}
                        </ChakraBadge>
                        <ChakraBadge variant="outline" size="sm">
                          {badge.badgeCategory}
                        </ChakraBadge>
                      </HStack>
                      <Text fontSize="sm">
                        {badge.badgeDescription}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Stats */}
                  <VStack align="end" spacing={2} minW="200px">
                    <HStack>
                      <Text fontSize="2xl" fontWeight="bold">
                        {badge.unlockedCount}
                      </Text>
                      <Text fontSize="sm">
                        / {badge.totalUsers}
                      </Text>
                    </HStack>
                    <Box w="full">
                      <Progress
                        value={badge.unlockPercentage}
                        colorScheme={getRarityColor(badge.badgeRarity)}
                        size="sm"
                        borderRadius="full"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1} textAlign="right">
                        {Math.round(badge.unlockPercentage)}% unlocked
                      </Text>
                    </Box>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>

          {badgeStats.length === 0 && (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No badges found</Text>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

export default BadgeLeaderboard;
