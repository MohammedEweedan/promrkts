/**
 * OnboardingChecklist - New user onboarding component
 * 
 * Guides new users through key activation steps:
 * 1. Complete profile
 * 2. Add first widget to dashboard
 * 3. Save a layout
 * 4. View a course
 * 
 * Brand colors: #65a8bf (primary), #b7a27d (gold accent)
 * Supports dark/light mode and mobile responsive
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Progress,
  IconButton,
  Collapse,
  useColorMode,
  useBreakpointValue,
  Badge,
  Button,
  Icon,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LayoutGrid, 
  Save, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onboardingTracking } from '../utils/tracking';
import api from '../api/client';

const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: () => void;
  actionLabel?: string;
  completed: boolean;
}

interface OnboardingState {
  profileCompleted: boolean;
  firstWidgetAdded: boolean;
  layoutSaved: boolean;
  courseViewed: boolean;
  completedAt: string | null;
  skippedAt: string | null;
  currentStep: number;
}

const MotionBox = motion(Box);

const OnboardingChecklist: React.FC = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [state, setState] = useState<OnboardingState>({
    profileCompleted: false,
    firstWidgetAdded: false,
    layoutSaved: false,
    courseViewed: false,
    completedAt: null,
    skippedAt: null,
    currentStep: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  // Fetch onboarding state from backend
  const fetchOnboardingState = useCallback(async () => {
    try {
      const { data } = await api.get('/progress/onboarding');
      if (data) {
        setState({
          profileCompleted: data.profileCompleted || false,
          firstWidgetAdded: data.firstWidgetAdded || false,
          layoutSaved: data.layoutSaved || false,
          courseViewed: data.courseViewed || false,
          completedAt: data.completedAt || null,
          skippedAt: data.skippedAt || null,
          currentStep: data.currentStep || 0,
        });
      }
    } catch {
      // Use local storage fallback
      const stored = localStorage.getItem('onboarding_state');
      if (stored) {
        try {
          setState(JSON.parse(stored));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnboardingState();
    onboardingTracking.started();
  }, [fetchOnboardingState]);

  // Save state to backend and localStorage
  const saveState = useCallback(async (newState: Partial<OnboardingState>) => {
    const updated = { ...state, ...newState };
    setState(updated);
    localStorage.setItem('onboarding_state', JSON.stringify(updated));
    
    try {
      await api.post('/progress/onboarding', updated);
    } catch {
      // Silently fail - localStorage backup exists
    }
  }, [state]);

  // Mark step as complete - exposed via window event listener
  useEffect(() => {
    const handleStepComplete = (e: CustomEvent<string>) => {
      const stepId = e.detail;
      const stepMap: Record<string, keyof OnboardingState> = {
        profile: 'profileCompleted',
        widget: 'firstWidgetAdded',
        layout: 'layoutSaved',
        course: 'courseViewed',
      };
      
      const key = stepMap[stepId];
      if (key && !state[key]) {
        const stepNumber = Object.keys(stepMap).indexOf(stepId) + 1;
        onboardingTracking.stepCompleted(stepNumber, stepId);
        
        saveState({ 
          [key]: true,
          currentStep: Math.max(state.currentStep, stepNumber),
        });
      }
    };
    
    window.addEventListener('onboardingStepCompleted', handleStepComplete as EventListener);
    return () => window.removeEventListener('onboardingStepCompleted', handleStepComplete as EventListener);
  }, [state, saveState]);

  // Skip onboarding
  const skipOnboarding = useCallback(async () => {
    onboardingTracking.skipped(state.currentStep);
    await saveState({ skippedAt: new Date().toISOString() });
    setDismissed(true);
  }, [state.currentStep, saveState]);

  // Calculate progress
  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your details to personalize your experience',
      icon: User,
      action: () => navigate('/account'),
      actionLabel: 'Go to Profile',
      completed: state.profileCompleted,
    },
    {
      id: 'widget',
      title: 'Add your first widget',
      description: 'Customize your dashboard with trading widgets',
      icon: LayoutGrid,
      action: () => {
        // Scroll to widget area or open widget picker
        const event = new CustomEvent('openWidgetPicker');
        window.dispatchEvent(event);
      },
      actionLabel: 'Add Widget',
      completed: state.firstWidgetAdded,
    },
    {
      id: 'layout',
      title: 'Save your layout',
      description: 'Save your dashboard configuration for quick access',
      icon: Save,
      action: () => {
        const event = new CustomEvent('saveLayout');
        window.dispatchEvent(event);
      },
      actionLabel: 'Save Layout',
      completed: state.layoutSaved,
    },
    {
      id: 'course',
      title: 'Explore a course',
      description: 'Start your trading education journey',
      icon: BookOpen,
      action: () => navigate('/products'),
      actionLabel: 'View Courses',
      completed: state.courseViewed,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;
  const allCompleted = completedCount === steps.length;

  // Celebrate when all complete
  useEffect(() => {
    if (allCompleted && !state.completedAt && !celebrating) {
      setCelebrating(true);
      onboardingTracking.completed();
      saveState({ completedAt: new Date().toISOString() });
      
      // Auto-dismiss after celebration
      setTimeout(() => {
        setDismissed(true);
      }, 3000);
    }
  }, [allCompleted, state.completedAt, celebrating, saveState]);

  // Don't show if completed, skipped, or dismissed
  if (loading || state.completedAt || state.skippedAt || dismissed) {
    return null;
  }

  // Styles
  const cardBg = isDark ? 'rgba(101, 168, 191, 0.08)' : 'rgba(101, 168, 191, 0.06)';
  const cardBorder = isDark ? 'rgba(101, 168, 191, 0.2)' : 'rgba(101, 168, 191, 0.3)';
  const stepBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  const stepBgHover = isDark ? 'rgba(101, 168, 191, 0.1)' : 'rgba(101, 168, 191, 0.08)';
  const textMuted = isDark ? 'whiteAlpha.700' : 'gray.600';

  return (
    <AnimatePresence>
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        mb={6}
      >
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          overflow="hidden"
          boxShadow={isDark ? 'lg' : 'md'}
        >
          {/* Header */}
          <HStack
            px={{ base: 4, md: 6 }}
            py={4}
            justify="space-between"
            cursor="pointer"
            onClick={onToggle}
            _hover={{ bg: stepBgHover }}
            transition="background 0.2s"
          >
            <HStack spacing={3}>
              <Box
                p={2}
                borderRadius="lg"
                bg={`linear-gradient(135deg, ${BRAND}, ${GOLD})`}
              >
                <Icon as={Sparkles} color="white" boxSize={5} />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack>
                  <Heading size="sm" fontWeight="600">
                    {celebrating ? '🎉 All Done!' : 'Get Started'}
                  </Heading>
                  <Badge
                    colorScheme={allCompleted ? 'green' : 'blue'}
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {completedCount}/{steps.length}
                  </Badge>
                </HStack>
                <Text fontSize="xs" color={textMuted}>
                  {celebrating 
                    ? "You've completed all onboarding steps!"
                    : 'Complete these steps to unlock your full potential'
                  }
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2}>
              {!isMobile && (
                <Box w="120px">
                  <Progress
                    value={progressPercent}
                    size="sm"
                    borderRadius="full"
                    bg={isDark ? 'whiteAlpha.100' : 'gray.200'}
                    sx={{
                      '& > div': {
                        background: `linear-gradient(90deg, ${BRAND}, ${GOLD})`,
                      },
                    }}
                  />
                </Box>
              )}
              <Tooltip label={isOpen ? 'Collapse' : 'Expand'}>
                <IconButton
                  aria-label="Toggle checklist"
                  icon={isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                />
              </Tooltip>
              <Tooltip label="Dismiss">
                <IconButton
                  aria-label="Dismiss onboarding"
                  icon={<X size={18} />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipOnboarding();
                  }}
                />
              </Tooltip>
            </HStack>
          </HStack>

          {/* Mobile progress bar */}
          {isMobile && (
            <Box px={4} pb={2}>
              <Progress
                value={progressPercent}
                size="sm"
                borderRadius="full"
                bg={isDark ? 'whiteAlpha.100' : 'gray.200'}
                sx={{
                  '& > div': {
                    background: `linear-gradient(90deg, ${BRAND}, ${GOLD})`,
                  },
                }}
              />
            </Box>
          )}

          {/* Steps */}
          <Collapse in={isOpen} animateOpacity>
            <VStack spacing={0} align="stretch" px={{ base: 2, md: 4 }} pb={4}>
              {steps.map((step, index) => (
                <MotionBox
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HStack
                    px={{ base: 3, md: 4 }}
                    py={3}
                    bg={stepBg}
                    borderRadius="lg"
                    mb={2}
                    justify="space-between"
                    opacity={step.completed ? 0.7 : 1}
                    _hover={{ bg: stepBgHover }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={3} flex="1">
                      {/* Step indicator */}
                      <Box
                        w={10}
                        h={10}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={step.completed 
                          ? `linear-gradient(135deg, ${BRAND}, ${GOLD})`
                          : isDark ? 'whiteAlpha.100' : 'gray.100'
                        }
                        border={step.completed ? 'none' : '2px solid'}
                        borderColor={BRAND}
                        flexShrink={0}
                      >
                        {step.completed ? (
                          <Icon as={Check} color="white" boxSize={5} />
                        ) : (
                          <Icon as={step.icon} color={BRAND} boxSize={5} />
                        )}
                      </Box>
                      
                      {/* Step content */}
                      <VStack align="start" spacing={0} flex="1">
                        <Text
                          fontWeight="500"
                          fontSize="sm"
                          textDecoration={step.completed ? 'line-through' : 'none'}
                          color={step.completed ? textMuted : 'inherit'}
                        >
                          {step.title}
                        </Text>
                        <Text fontSize="xs" color={textMuted} noOfLines={1}>
                          {step.description}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Action button */}
                    {!step.completed && step.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor={BRAND}
                        color={BRAND}
                        rightIcon={<ArrowRight size={14} />}
                        onClick={step.action}
                        _hover={{
                          bg: BRAND,
                          color: 'white',
                        }}
                        display={{ base: 'none', sm: 'flex' }}
                      >
                        {step.actionLabel}
                      </Button>
                    )}
                    
                    {/* Mobile action */}
                    {!step.completed && step.action && (
                      <IconButton
                        aria-label={step.actionLabel || 'Go'}
                        icon={<ArrowRight size={16} />}
                        size="sm"
                        variant="outline"
                        borderColor={BRAND}
                        color={BRAND}
                        onClick={step.action}
                        display={{ base: 'flex', sm: 'none' }}
                        _hover={{
                          bg: BRAND,
                          color: 'white',
                        }}
                      />
                    )}

                    {/* Completed checkmark for mobile */}
                    {step.completed && (
                      <Icon as={Check} color={BRAND} boxSize={5} />
                    )}
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          </Collapse>
        </Box>
      </MotionBox>
    </AnimatePresence>
  );
};

// Export helper to mark steps complete from other components
export const markOnboardingStep = async (stepId: string) => {
  const stored = localStorage.getItem('onboarding_state');
  if (!stored) return;
  
  try {
    const state = JSON.parse(stored);
    const stepMap: Record<string, string> = {
      profile: 'profileCompleted',
      widget: 'firstWidgetAdded',
      layout: 'layoutSaved',
      course: 'courseViewed',
    };
    
    const key = stepMap[stepId];
    if (key && !state[key]) {
      state[key] = true;
      localStorage.setItem('onboarding_state', JSON.stringify(state));
      
      // Also update backend
      try {
        await api.post('/progress/onboarding', state);
      } catch {}
      
      // Dispatch event for component to refresh
      window.dispatchEvent(new CustomEvent('onboardingStepCompleted', { detail: stepId }));
    }
  } catch {}
};

export default OnboardingChecklist;
