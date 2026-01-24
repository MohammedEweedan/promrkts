import React, { forwardRef, HTMLAttributes } from 'react';
import { Box } from '@chakra-ui/react';
import './GlassCard.css';

export type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <Box ref={ref} bg="bg.surface" className={`glass-card ${className}`} {...rest}>
        <Box className="glass-card__inner">{children}</Box>
      </Box>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
