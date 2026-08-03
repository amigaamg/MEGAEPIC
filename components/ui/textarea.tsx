// AMEXAN Universal Textarea Component
// Constitutional Principle: Every input is token-driven, accessible, and contract-checked.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type TextareaVariant = 'default' | 'filled' | 'danger';
export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<UniversalComponentProps, 'variant'> {
  variant?: TextareaVariant;
  textareaSize?: TextareaSize;
  label?: string;
  hint?: string;
  error?: string;
  autoResize?: boolean;
  maxRows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = 'default',
      textareaSize = 'md',
      label,
      hint,
      error,
      autoResize = false,
      maxRows = 6,
      loading = false,
      disabled = false,
      className = '',
      testId,
      id,
      telemetry,
      onChange,
      style,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const sizeStyles: Record<TextareaSize, React.CSSProperties> = {
      sm: { padding: `${spacingTokens[1]} ${spacingTokens[2]}`, fontSize: typographyTokens.bodySmall.fontSize },
      md: { padding: `${spacingTokens[2]} ${spacingTokens[3]}`, fontSize: typographyTokens.body.fontSize },
      lg: { padding: `${spacingTokens[3]} ${spacingTokens[4]}`, fontSize: typographyTokens.bodyLarge.fontSize },
    };

    const variantStyles: Record<TextareaVariant, React.CSSProperties> = {
      default: { backgroundColor: colorTokens.secondary.DEFAULT, borderColor: colorTokens.neutral[300] },
      filled: { backgroundColor: colorTokens.neutral[100], borderColor: 'transparent' },
      danger: { backgroundColor: colorTokens.danger.surface, borderColor: colorTokens.danger.DEFAULT },
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      emitTelemetry({ telemetry, testId }, 'textarea', 'change');
      if (autoResize) {
        e.currentTarget.style.height = 'auto';
        const lineHeight = parseInt(typographyTokens.body.lineHeight, 10) || 24;
        const lineHeightPx = lineHeight;
        e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, lineHeightPx * maxRows)}px`;
      }
      onChange?.(e);
    };

    return (
      <div style={{ width: '100%' }} data-testid={testId}>
        {label ? (
          <label
            htmlFor={id}
            style={{
              display: 'block',
              fontSize: typographyTokens.label.fontSize,
              fontWeight: typographyTokens.label.fontWeight,
              color: colorTokens.neutral[700],
              marginBottom: spacingTokens[1],
            }}
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={id}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-help` : undefined}
          disabled={disabled || loading}
          onChange={handleChange}
          style={{
            width: '100%',
            minHeight: 96,
            borderRadius: getRadius(8),
            border: `1px solid ${error ? colorTokens.danger.DEFAULT : variantStyles[variant].borderColor}`,
            backgroundColor: variantStyles[variant].backgroundColor,
            fontSize: sizeStyles[textareaSize].fontSize,
            padding: sizeStyles[textareaSize].padding,
            color: colorTokens.neutral[900],
            fontFamily: typographyTokens.body.fontFamily,
            outline: 'none',
            resize: 'vertical',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          {...componentDataAttr({ testId, id }, 'textarea')}
          {...props}
        />
        {error ? (
          <span id={`${id}-help`} role="alert" style={{ display: 'block', marginTop: spacingTokens[1], fontSize: typographyTokens.caption.fontSize, color: colorTokens.danger.DEFAULT }}>
            {error}
          </span>
        ) : hint ? (
          <span id={`${id}-help`} style={{ display: 'block', marginTop: spacingTokens[1], fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[500] }}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;
