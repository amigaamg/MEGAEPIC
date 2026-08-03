// AMEXAN Universal Badge Component
// Constitutional Principle: Badges communicate status

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { radiusTokens } from '@/lib/design/tokens/index';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', dot = false, className = '', children, ...props }, ref) => {
    const variantStyles = {
      primary: {
        backgroundColor: colorTokens.primary.surface,
        color: colorTokens.primary.DEFAULT,
        borderColor: colorTokens.primary.border,
      },
      secondary: {
        backgroundColor: colorTokens.secondary.surface,
        color: colorTokens.neutral[600],
        borderColor: colorTokens.neutral[200],
      },
      success: {
        backgroundColor: colorTokens.success.surface,
        color: colorTokens.success.DEFAULT,
        borderColor: colorTokens.success.border,
      },
      warning: {
        backgroundColor: colorTokens.warning.surface,
        color: colorTokens.warning.DEFAULT,
        borderColor: colorTokens.warning.border,
      },
      danger: {
        backgroundColor: colorTokens.danger.surface,
        color: colorTokens.danger.DEFAULT,
        borderColor: colorTokens.danger.border,
      },
      info: {
        backgroundColor: colorTokens.accent.surface,
        color: colorTokens.accent.DEFAULT,
        borderColor: colorTokens.accent.border,
      },
      neutral: {
        backgroundColor: colorTokens.neutral[100],
        color: colorTokens.neutral[600],
        borderColor: colorTokens.neutral[200],
      },
    };

    const sizeStyles = {
      xs: {
        padding: `${spacingTokens[1]} ${spacingTokens[2]}`,
        fontSize: typographyTokens.caption.fontSize,
        lineHeight: '1',
      },
      sm: {
        padding: `${spacingTokens[1]} ${spacingTokens[3]}`,
        fontSize: typographyTokens.caption.fontSize,
        lineHeight: '1.25',
      },
      md: {
        padding: `${spacingTokens[2]} ${spacingTokens[4]}`,
        fontSize: typographyTokens.bodySmall.fontSize,
        lineHeight: '1.5',
      },
      lg: {
        padding: `${spacingTokens[3]} ${spacingTokens[5]}`,
        fontSize: typographyTokens.body.fontSize,
        lineHeight: '1.5',
      },
    };

    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: radiusTokens.pill,
      fontWeight: typographyTokens.label.fontWeight,
      transition: 'all 150ms ease-out',
      whiteSpace: 'nowrap',
    };

    if (dot) {
      return (
        <span
          ref={ref}
          style={{
            ...baseStyles,
            ...variantStyles[variant],
            width: size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px',
            height: size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px',
            padding: 0,
            borderRadius: radiusTokens.circle,
          }}
          className={`amexan-badge ${variant} ${size} dot ${className}`}
          {...props}
        />
      );
    }

    return (
      <span
        ref={ref}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...sizeStyles[size],
        }}
        className={`amexan-badge ${variant} ${size} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
export default Badge;
