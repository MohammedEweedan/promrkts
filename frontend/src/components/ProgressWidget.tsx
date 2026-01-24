import React, { useEffect, useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Icon,
  Flex,
  Skeleton,
} from '@chakra-ui/react';
import { Trophy, Flame, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import SpotlightCard from './SpotlightCard';

const GOLD = '#65a8bf';
const XP_PER_LEVEL = 1000;

// Helper: Calculate level from XP (matches backend)
function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Helper: Calculate XP needed for next level
function xpToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const xpForNextLevel = (currentLevel) * XP_PER_LEVEL;
  return xpForNextLevel - xp;
}

// Helper: Calculate progress percentage to next level
function levelProgressPercentage(xp: number): number {
  const currentLevelXP = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = xp - currentLevelXP;
  return (xpInCurrentLevel / XP_PER_LEVEL) * 100;
}

interface ProgressWidgetProps {
  compact?: boolean;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ compact = false }) => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress/overview');
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}  borderRadius="md" borderWidth="1px" borderColor={GOLD}>
        <Skeleton height="80px" />
      </Box>
    );
  }

  if (!overview) return null;

  // Calculate level and progress using correct formula
  const currentLevel = calculateLevel(overview.totalXP);
  const xpNeeded = xpToNextLevel(overview.totalXP);
  const levelProgress = levelProgressPercentage(overview.totalXP);

  if (compact) {
    return (
      <Box
        p={4}
        bg="bg.surface"
        borderRadius="md"
        borderWidth="1px"
        borderColor={GOLD}
        cursor="pointer"
        onClick={() => navigate('/progress')}
      >
        <HStack spacing={4} justify="space-between">
          <HStack spacing={3}>
            <Flex
              w="40px"
              h="40px"
              borderRadius="full"
              bg="blue.100"
              align="center"
              justify="center"
            >
              <Icon as={Trophy} color="blue.500" boxSize={5} />
            </Flex>
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="bold">
                {t('progress.level', 'Level')} {currentLevel}
              </Text>
              <Text fontSize="xs">
                {xpNeeded} {t('progress.xp_to_next_level', 'XP to next level')}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            {overview.maxStreak > 0 && (
              <HStack spacing={1}>
                <Icon as={Flame} color="orange.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="bold">
                  {overview.maxStreak}
                </Text>
              </HStack>
            )}
            <HStack spacing={1}>
              <Icon as={Target} color="green.500" boxSize={4} />
              <Text fontSize="sm" fontWeight="bold">
                {overview.coursesCompleted}
              </Text>
            </HStack>
          </HStack>
        </HStack>

        <Progress
          value={levelProgress}
          colorScheme="blue"
          size="sm"
          borderRadius="full"
          mt={3}
        />
      </Box>
    );
  }

  return (
    <SpotlightCard>
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold" color="#65a8bf">
          {t('progress.title')}
        </Text>

        <HStack spacing={6}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={Trophy} color="blue.500" boxSize={5} />
              <Text fontSize="sm" color="#65a8bf">
                {t('progress.level')}
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="#65a8bf">
              {currentLevel}
            </Text>
            <Text fontSize="xs" color="#65a8bf">
              {xpNeeded} {t('progress.xp_to_next_level', 'XP to next level')}
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={Flame} color="orange.500" boxSize={5} />
              <Text fontSize="sm" color="#65a8bf">
                {t('progress.streak')}
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="#65a8bf">
              {overview.maxStreak}
            </Text>
            <Text fontSize="xs" color="#65a8bf">
              {t('progress.days_in_a_row')}
            </Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={Target} color="green.500" boxSize={5} />
              <Text fontSize="sm" color="#65a8bf">
                {t('progress.courses_completed')}
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="#65a8bf">
              {overview.coursesCompleted}
            </Text>
            <Text fontSize="xs" color="#65a8bf">
              {t('progress.out_of')} {overview.totalCourses}
            </Text>
          </VStack>
        </HStack>

        <Box>
          <Progress
            value={levelProgress}
            colorScheme="blue"
            size="md"
            borderRadius="full"
            height="8px"
          />
          <Text fontSize="xs" color="#65a8bf" mt={1}>
            {overview.totalXP.toLocaleString()} {t('progress.xp')}
          </Text>
        </Box>
      </VStack>
    </SpotlightCard>
  );
};

export default ProgressWidget;
