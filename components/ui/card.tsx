// AMEXAN Universal Card Component
// Constitutional Principle: Cards follow Header, Body, Footer, Actions, Status, Metadata

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { radiusTokens, shadowTokens } from '@/lib/design/tokens/index';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: keyof typeof spacingTokens | number;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 4, hover = false, className = '', children, ...props }, ref) => {
    const paddingValue = typeof padding === 'number' ? spacingTokens[padding] : spacingTokens[padding];

    const baseStyles = {
      backgroundColor: colorTokens.secondary.DEFAULT,
      borderRadius: radiusTokens.medium,
      padding: paddingValue,
      border: '1px solid transparent',
      transition: 'all 150ms ease-out',
      boxShadow: 'none',
      cursor: 'default',
    };

    const variantStyles = {
      default: {
        backgroundColor: colorTokens.secondary.DEFAULT,
        borderColor: colorTokens.neutral[200],
        boxShadow: 'none',
      },
      elevated: {
        backgroundColor: colorTokens.secondary.DEFAULT,
        borderColor: colorTokens.neutral[200],
        boxShadow: shadowTokens.medium,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: colorTokens.neutral[300],
        boxShadow: 'none',
      },
      filled: {
        backgroundColor: colorTokens.neutral[50],
        borderColor: colorTokens.neutral[200],
        boxShadow: 'none',
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...(hover ? {
        '&:hover': {
          boxShadow: shadowTokens.high,
          transform: 'translateY(-2px)',
        }
      } : {}),
    };

    return (
      <div
        ref={ref}
        style={combinedStyles}
        className={`amexan-card ${variant} ${hover ? 'hover' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
