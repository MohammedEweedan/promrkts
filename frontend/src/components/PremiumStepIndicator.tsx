/**
 * PremiumStepIndicator - Sleek multi-step progress indicator
 * 
 * Features:
 * - Animated step transitions
 * - Brand color gradients
 * - Mobile responsive
 * - Dark/light mode support
 */
import React from 'react';
import {
  HStack,
  VStack,
  Box,
  Text,
  Icon,
  useColorMode,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

interface Step {
  label: string;
  icon?: React.ElementType;
}

interface PremiumStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const MotionBox = motion(Box);

const PremiumStepIndicator: React.FC<PremiumStepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const completedBg = `linear-gradient(135deg, ${BRAND}, ${GOLD})`;
  const activeBg = BRAND;
  const inactiveBg = isDark ? 'whiteAlpha.200' : 'gray.200';
  const lineComplete = `linear-gradient(90deg, ${BRAND}, ${GOLD})`;
  const lineIncomplete = isDark ? 'whiteAlpha.200' : 'gray.200';

  return (
    <HStack
      spacing={0}
      justify="center"
      w="full"
      py={4}
      px={{ base: 2, md: 4 }}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isClickable = onStepClick && stepNumber <= currentStep;

        return (
          <React.Fragment key={index}>
            {/* Step circle */}
            <VStack spacing={2} flex="0 0 auto">
              <MotionBox
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive
                    ? `0 0 20px ${BRAND}40`
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
                w={{ base: 10, md: 12 }}
                h={{ base: 10, md: 12 }}
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={isCompleted ? completedBg : isActive ? activeBg : inactiveBg}
                cursor={isClickable ? 'pointer' : 'default'}
                onClick={() => isClickable && onStepClick?.(stepNumber)}
                _hover={isClickable ? { transform: 'scale(1.05)' } : {}}
              >
                {isCompleted ? (
                  <Icon as={Check} color="white" boxSize={5} />
                ) : step.icon ? (
                  <Icon
                    as={step.icon}
                    color={isActive ? 'white' : isDark ? 'whiteAlpha.500' : 'gray.400'}
                    boxSize={5}
                  />
                ) : (
                  <Text
                    fontWeight="700"
                    fontSize={{ base: 'sm', md: 'md' }}
                    color={isActive ? 'white' : isDark ? 'whiteAlpha.500' : 'gray.400'}
                  >
                    {stepNumber}
                  </Text>
                )}
              </MotionBox>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? BRAND : isDark ? 'whiteAlpha.600' : 'gray.500'}
                textAlign="center"
                maxW={{ base: '60px', md: '80px' }}
                noOfLines={1}
              >
                {step.label}
              </Text>
            </VStack>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <Box
                flex="1"
                h="3px"
                mx={{ base: 1, md: 2 }}
                mt={{ base: -6, md: -6 }}
                borderRadius="full"
                bg={isCompleted ? lineComplete : lineIncomplete}
                position="relative"
                overflow="hidden"
              >
                {isActive && (
                  <MotionBox
                    position="absolute"
                    top={0}
                    left={0}
                    h="full"
                    bg={lineComplete}
                    initial={{ width: '0%' }}
                    animate={{ width: '50%' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </Box>
            )}
          </React.Fragment>
        );
      })}
    </HStack>
  );
};

export default PremiumStepIndicator;
