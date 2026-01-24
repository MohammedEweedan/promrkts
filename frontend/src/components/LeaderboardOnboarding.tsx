import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Collapse,
  Badge,
} from '@chakra-ui/react';
import { Trophy, Zap, Award, TrendingUp, CheckCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LeaderboardOnboardingProps {
  isNewUser?: boolean;
}

export const LeaderboardOnboarding: React.FC<LeaderboardOnboardingProps> = ({ isNewUser = false }) => {
  const { t } = useTranslation();
  const [showHint, setShowHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const borderColor = useColorModeValue('#65a8bf', '#65a8bf');
  const accentColor = useColorModeValue('#65a8bf', '#65a8bf');

  useEffect(() => {
    // Check if user has seen the onboarding
    const hasSeenOnboarding = localStorage.getItem('leaderboard_onboarding_seen');
    
    if (!hasSeenOnboarding && isNewUser) {
      setShowHint(true);
    }
  }, [isNewUser]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowHint(false);
    localStorage.setItem('leaderboard_onboarding_seen', 'true');
  };

  const handleToggle = () => {
    setShowHint(!showHint);
  };

  if (dismissed && !showHint) {
    return (
      <Button
        size="sm"
        variant="outline"
        colorScheme="#65a8bf"
        leftIcon={<Icon as={Trophy} />}
        onClick={handleToggle}
      >
        {t('leaderboard.how_to_compete', 'How to Compete')}
      </Button>
    );
  }

  return (
    <Box alignItems="center">
      {!dismissed && (
        <Button
          size="sm"
          variant="solid"
          bg="#65a8bf"
          leftIcon={<Icon as={Trophy} />}
          onClick={handleToggle}
          mb={showHint ? 4 : 0}
        >
          {showHint ? t('common.hide', 'Hide') : t('leaderboard.how_to_compete', 'How to Compete')}
        </Button>
      )}

      <Collapse in={showHint} animateOpacity>
        <Alert
          status="info"
          variant="center"
          flexDirection="column"
          alignItems="center"
          borderRadius="lg"
          bg="bg.surface"
          borderColor={borderColor}
          borderWidth="1px"
          p={6}
        >
          <HStack w="full" justify="center" mb={4}>
            <HStack>
              <AlertIcon color={accentColor} as={Trophy} boxSize={6} />
              <AlertTitle fontSize="lg">
                {t('leaderboard.onboarding.title', 'Climb the Leaderboard!')}
              </AlertTitle>
            </HStack>
            <CloseButton onClick={handleDismiss} />
          </HStack>

          <AlertDescription w="full">
            <VStack align="stretch" spacing={4}>
              <Text>
                {t(
                  'leaderboard.onboarding.description',
                  'Compete with other students and earn your place at the top! Here\'s how to earn XP and climb the ranks:'
                )}
              </Text>

              <List spacing={3}>
                <ListItem>
                  <HStack align="center">
                    <ListIcon as={CheckCircle} color={accentColor} mt={1} />
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Icon as={Zap} boxSize={4} color="orange.500" />
                        <Text fontWeight="bold">
                          {t('leaderboard.onboarding.watch_videos', 'Watch Videos')}
                        </Text>
                        <Badge colorScheme="orange">+50 XP</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {t('leaderboard.onboarding.watch_videos_desc', 'Complete video lessons to earn experience')}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>

                <ListItem>
                  <HStack align="center">
                    <ListIcon as={CheckCircle} color={accentColor} mt={1} />
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Icon as={Award} boxSize={4} color="blue.500" />
                        <Text fontWeight="bold">
                          {t('leaderboard.onboarding.read_pdfs', 'Read PDFs')}
                        </Text>
                        <Badge colorScheme="blue">+30 XP</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {t('leaderboard.onboarding.read_pdfs_desc', 'Study course materials and resources')}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>

                <ListItem>
                  <HStack align="center">
                    <ListIcon as={CheckCircle} color={accentColor} mt={1} />
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Icon as={TrendingUp} boxSize={4} color="green.500" />
                        <Text fontWeight="bold">
                          {t('leaderboard.onboarding.complete_lessons', 'Complete Lessons')}
                        </Text>
                        <Badge colorScheme="green">+100 XP</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {t('leaderboard.onboarding.complete_lessons_desc', 'Finish entire lessons to level up faster')}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>

                <ListItem>
                  <HStack align="center">
                    <ListIcon as={CheckCircle} color={accentColor} mt={1} />
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Icon as={Trophy} boxSize={4} color="purple.500" />
                        <Text fontWeight="bold">
                          {t('leaderboard.onboarding.complete_courses', 'Complete Courses')}
                        </Text>
                        <Badge colorScheme="purple">+500 XP</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {t('leaderboard.onboarding.complete_courses_desc', 'Finish full courses for massive XP boosts')}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>

                <ListItem>
                  <HStack align="center">
                    <ListIcon as={CheckCircle} color={accentColor} mt={1} />
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Icon as={Star} boxSize={4} color="yellow.500" />
                        <Text fontWeight="bold">
                          {t('leaderboard.onboarding.maintain_streak', 'Maintain Your Streak')}
                        </Text>
                        <Badge colorScheme="yellow">+20 XP/day</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {t('leaderboard.onboarding.maintain_streak_desc', 'Learn every day to earn streak bonuses')}
                      </Text>
                    </VStack>
                  </HStack>
                </ListItem>
              </List>

              <Box
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <HStack spacing={2} mb={2}>
                  <Icon as={Trophy} color="gold" />
                  <Text fontWeight="bold" color={accentColor}>
                    {t('leaderboard.onboarding.pro_tip', 'Pro Tip:')}
                  </Text>
                </HStack>
                <Text fontSize="sm">
                  {t(
                    'leaderboard.onboarding.pro_tip_desc',
                    'Unlock badges by reaching milestones! Badges showcase your achievements and dedication. Check your progress page to see which badges you can unlock next.'
                  )}
                </Text>
              </Box>

              <HStack justify="space-between" pt={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  {t('common.got_it', 'Got it, thanks!')}
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  color="#65a8bf"
                  rightIcon={<Icon as={TrendingUp} />}
                  onClick={() => {
                    handleDismiss();
                    window.location.href = '/progress';
                  }}
                >
                  {t('leaderboard.onboarding.view_progress', 'View My Progress')}
                </Button>
              </HStack>
            </VStack>
          </AlertDescription>
        </Alert>
      </Collapse>
    </Box>
  );
};

export default LeaderboardOnboarding;
