/**
 * PremiumButton - Consistent premium CTA button component
 * 
 * Features:
 * - Gradient background with brand colors
 * - Hover lift animation with glow
 * - Security lock icon option
 * - Multiple variants (primary, secondary, outline)
 * - Mobile responsive
 */
import React from 'react';
import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { Lock, ArrowRight } from 'lucide-react';

const BRAND = '#65a8bf';
const GOLD = '#b7a27d';

interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold';
  showLock?: boolean;
  showArrow?: boolean;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  showLock = false,
  showArrow = false,
  ...props
}) => {
  const variants = {
    primary: {
      bg: `linear-gradient(135deg, ${BRAND}, ${GOLD})`,
      color: 'white',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px rgba(101, 168, 191, 0.4)`,
      },
    },
    secondary: {
      bg: `linear-gradient(135deg, ${GOLD}, ${BRAND})`,
      color: 'white',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px rgba(183, 162, 125, 0.4)`,
      },
    },
    gold: {
      bg: GOLD,
      color: '#0a0f1a',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: `0 0 40px rgba(183, 162, 125, 0.4)`,
      },
    },
    outline: {
      bg: 'transparent',
      color: BRAND,
      border: '1px solid',
      borderColor: BRAND,
      _hover: {
        bg: `rgba(101, 168, 191, 0.1)`,
      },
    },
  };

  const variantStyles = variants[variant];

  return (
    <Button
      size="lg"
      fontWeight="700"
      borderRadius="xl"
      px={8}
      py={6}
      transition="all 0.2s"
      _active={{ transform: 'translateY(0)' }}
      leftIcon={showLock ? <Icon as={Lock} boxSize={4} /> : undefined}
      rightIcon={showArrow ? <Icon as={ArrowRight} boxSize={4} /> : undefined}
      {...variantStyles}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PremiumButton;
