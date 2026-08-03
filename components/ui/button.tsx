// AMEXAN Universal Button Component
// Constitutional Principle: Every component has variants, sizes, states, and accessibility

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { radiusTokens } from '@/lib/design/tokens/index';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false,
    disabled,
    onClick,
    className = '',
    children,
    ...props 
  }, ref) => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: typographyTokens.label.fontWeight,
      transition: 'all 150ms ease-out',
      border: '1px solid transparent',
      cursor: disabled ? 'default-cursor' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
    };

    const variantStyles = {
      primary: {
        backgroundColor: colorTokens.primary.DEFAULT,
        color: colorTokens.primary.contrast,
        borderColor: colorTokens.primary.DEFAULT,
        '&:hover': {
          backgroundColor: colorTokens.primary.hover,
          borderColor: colorTokens.primary.hover,
        },
      },
      secondary: {
        backgroundColor: colorTokens.secondary.DEFAULT,
        color: colorTokens.secondary.text,
        borderColor: colorTokens.secondary.DEFAULT,
        '&:hover': {
          backgroundColor: colorTokens.secondary.hover,
          borderColor: colorTokens.secondary.border,
        },
      },
      outline: {
        backgroundColor: 'transparent',
        color: colorTokens.primary.DEFAULT,
        borderColor: colorTokens.primary.DEFAULT,
        '&:hover': {
          backgroundColor: colorTokens.primary.surface,
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colorTokens.neutral[700],
        borderColor: 'transparent',
        '&:hover': {
          backgroundColor: colorTokens.neutral[100],
        },
      },
      danger: {
        backgroundColor: colorTokens.danger.DEFAULT,
        color: colorTokens.danger.contrast,
        borderColor: colorTokens.danger.DEFAULT,
        '&:hover': {
          backgroundColor: colorTokens.danger.hover,
          borderColor: colorTokens.danger.hover,
        },
      },
      success: {
        backgroundColor: colorTokens.success.DEFAULT,
        color: colorTokens.success.contrast,
        borderColor: colorTokens.success.DEFAULT,
        '&:hover': {
          backgroundColor: colorTokens.success.hover,
          borderColor: colorTokens.success.hover,
        },
      },
    };

    const sizeStyles = {
      xs: {
        padding: `${spacingTokens[1]} ${spacingTokens[2]}`,
        fontSize: typographyTokens.caption.fontSize,
        lineHeight: typographyTokens.caption.lineHeight,
        borderRadius: radiusTokens.small,
      },
      sm: {
        padding: `${spacingTokens[2]} ${spacingTokens[3]}`,
        fontSize: typographyTokens.bodySmall.fontSize,
        lineHeight: typographyTokens.bodySmall.lineHeight,
        borderRadius: radiusTokens.medium,
      },
      md: {
        padding: `${spacingTokens[3]} ${spacingTokens[4]}`,
        fontSize: typographyTokens.body.fontSize,
        lineHeight: typographyTokens.body.lineHeight,
        borderRadius: radiusTokens.medium,
      },
      lg: {
        padding: `${spacingTokens[4]} ${spacingTokens[6]}`,
        fontSize: typographyTokens.bodyLarge.fontSize,
        lineHeight: typographyTokens.bodyLarge.lineHeight,
        borderRadius: radiusTokens.large,
      },
      xl: {
        padding: `${spacingTokens[5]} ${spacingTokens[7]}`,
        fontSize: typographyTokens.h4.fontSize,
        lineHeight: typographyTokens.h4.lineHeight,
        borderRadius: radiusTokens.large,
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        style={combinedStyles}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`amexan-button ${variant} ${size} ${className}`}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="amexan-button__loading">
            <svg 
              className="amexan-button__spinner" 
              viewBox="0 0 24 24" 
              width="16" 
              height="16"
            >
              <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2"></circle>
            </svg>
          </span>
        ) : null}
        {leftIcon && !loading && <span className="amexan-button__left-icon">{leftIcon}</span>}
        <span className="amexan-button__content">{children}</span>
        {rightIcon && !loading && <span className="amexan-button__right-icon">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
