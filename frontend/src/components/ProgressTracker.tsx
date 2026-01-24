
import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge as ChakraBadge,
  Icon,
  Tooltip,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { Trophy, Target, Flame, Star, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

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

interface CourseProgress {
  tierId: string;
  tierName: string;
  level: number;
  xp: number;
  streak: number;
  completedAt: Date | null;
  lessonsCompleted: number;
  videosWatched: number;
  pdfsViewed: number;
  completionPercentage: number;
}

interface ProgressOverview {
  totalXP: number;
  totalLevel: number;
  maxStreak: number;
  coursesCompleted: number;
  coursesInProgress: number;
  totalCourses: number;
  courses: CourseProgress[];
}

export const ProgressTracker: React.FC = () => {
  const { t } = useTranslation();
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const accentColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    fetchProgressOverview();
  }, []);

  const fetchProgressOverview = async () => {
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
      <Box p={6}>
        <Text>{t('progress.loading', 'Loading progress...')}</Text>
      </Box>
    );
  }

  if (!overview) {
    return (
      <Box p={6}>
        <Text>{t('progress.no_data', 'No progress data available')}</Text>
      </Box>
    );
  }

  // Calculate level and progress using correct formula
  const currentLevel = calculateLevel(overview.totalXP);
  const xpNeeded = xpToNextLevel(overview.totalXP);
  const levelProgress = levelProgressPercentage(overview.totalXP);

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={Trophy} color={accentColor} boxSize={5} mr={2} />
                <StatLabel>Level</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{currentLevel}</StatNumber>
              <StatHelpText>{xpNeeded} {t('progress.xp_to_next_level', 'XP to next level')}</StatHelpText>
              <Progress
                value={levelProgress}
                colorScheme="blue"
                size="sm"
                borderRadius="full"
                mt={2}
              />
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={Flame} color="orange.500" boxSize={5} mr={2} />
                <StatLabel>{t('progress.streak', 'Streak')}</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{overview.maxStreak}</StatNumber>
              <StatHelpText>{t('progress.days_in_a_row', 'days in a row')}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={Target} color="green.500" boxSize={5} mr={2} />
                <StatLabel>{t('progress.courses_completed', 'Courses Completed')}</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{overview.coursesCompleted}</StatNumber>
              <StatHelpText>{t('progress.out_of', 'out of')} {overview.totalCourses}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={Star} color="yellow.500" boxSize={5} mr={2} />
                <StatLabel>{t('progress.total_xp', 'Total XP')}</StatLabel>
              </Flex>
              <StatNumber fontSize="3xl">{overview.totalXP.toLocaleString()}</StatNumber>
              <StatHelpText>{t('progress.xp', 'experience points')}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Course Progress */}
      <Card bg="bg.surface" borderColor={GOLD} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4}>
            <Flex align="center">
              <Icon as={TrendingUp} mr={2} />
              Course Progress
            </Flex>
          </Heading>
          <VStack spacing={4} align="stretch">
            {overview.courses.map((course) => (
              <Box
                key={course.tierId}
                p={4}
                borderWidth="1px"
                borderColor={GOLD}
                borderRadius="md"
              >
                <HStack justify="space-between" mb={2}>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{course.tierName}</Text>
                    <HStack spacing={2} fontSize="sm" color="gray.500">
                      <Text>Level {course.level}</Text>
                      <Text>•</Text>
                      <Text>{course.xp} XP</Text>
                    </HStack>
                  </VStack>
                  <HStack>
                    {course.streak > 0 && (
                      <Tooltip label={`${course.streak} day streak`}>
                        <HStack spacing={1}>
                          <Icon as={Flame} color="orange.500" boxSize={4} />
                          <Text fontSize="sm" fontWeight="bold">
                            {course.streak}
                          </Text>
                        </HStack>
                      </Tooltip>
                    )}
                    {course.completedAt && (
                      <ChakraBadge colorScheme="green">Completed</ChakraBadge>
                    )}
                  </HStack>
                </HStack>

                <Progress
                  value={course.completionPercentage}
                  colorScheme="blue"
                  size="sm"
                  borderRadius="full"
                  mb={2}
                />

                <HStack justify="space-between" fontSize="sm" color="gray.600">
                  <Text>{Math.round(course.completionPercentage)}% complete</Text>
                  <HStack spacing={4}>
                    <Text>📚 {course.lessonsCompleted} lessons</Text>
                    <Text>🎥 {course.videosWatched} videos</Text>
                    <Text>📄 {course.pdfsViewed} PDFs</Text>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ProgressTracker;
