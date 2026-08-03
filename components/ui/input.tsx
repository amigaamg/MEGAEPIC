// AMEXAN Universal Input Component
// Constitutional Principle: Every input is token-driven, accessible, and contract-checked.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { motionDurationsSemantics, motionEasings } from '@/lib/design/tokens/motion';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type InputVariant = 'default' | 'filled' | 'danger' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'disabled'>,
    Omit<UniversalComponentProps, 'variant'> {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  validate?: (value: string) => string | undefined;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      label,
      hint,
      error,
      leadingIcon,
      trailingIcon,
      loading = false,
      disabled = false,
      className = '',
      testId,
      id,
      telemetry,
      validate,
      onChange,
      'aria-label': ariaLabel,
      theme,
      permissions,
      size: _size,
      ...props
    },
    ref,
  ) => {
    const [validationError, setValidationError] = React.useState<string | undefined>(undefined);
    const resolvedError = error || validationError;

    const sizeStyles: Record<InputSize, React.CSSProperties> = {
      sm: { padding: `${spacingTokens[1]} ${spacingTokens[2]}`, fontSize: typographyTokens.bodySmall.fontSize },
      md: { padding: `${spacingTokens[2]} ${spacingTokens[3]}`, fontSize: typographyTokens.body.fontSize },
      lg: { padding: `${spacingTokens[3]} ${spacingTokens[4]}`, fontSize: typographyTokens.bodyLarge.fontSize },
    };

    const variantStyles: Record<InputVariant, React.CSSProperties> = {
      default: {
        backgroundColor: colorTokens.secondary.DEFAULT,
        borderColor: colorTokens.neutral[300],
      },
      filled: {
        backgroundColor: colorTokens.neutral[100],
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: colorTokens.danger.surface,
        borderColor: colorTokens.danger.DEFAULT,
      },
      success: {
        backgroundColor: colorTokens.success.surface,
        borderColor: colorTokens.success.DEFAULT,
      },
    };

    const borderColor = resolvedError
      ? colorTokens.danger.DEFAULT
      : variantStyles[variant].borderColor;

    const baseStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minHeight: 48,
      borderRadius: getRadius(8),
      border: `1px solid ${borderColor}`,
      backgroundColor: variantStyles[variant].backgroundColor,
      transition: `border-color ${motionDurationsSemantics.fast}ms ${motionEasings.standard}, box-shadow ${motionDurationsSemantics.fast}ms ${motionEasings.standard}`,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (validate) setValidationError(validate(e.target.value));
      emitTelemetry({ telemetry, testId }, 'input', 'change');
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
        <div style={baseStyle} onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${colorTokens.primary.surface}`)} onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}>
          {leadingIcon ? (
            <span style={{ marginLeft: spacingTokens[2], display: 'inline-flex', color: colorTokens.neutral[400] }}>{leadingIcon}</span>
          ) : null}
          <input
            ref={ref}
            id={id}
            aria-label={ariaLabel || label}
            aria-invalid={!!resolvedError}
            aria-describedby={hint || resolvedError ? `${id}-help` : undefined}
            aria-busy={loading}
            disabled={disabled || loading}
            onChange={handleChange}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: sizeStyles[inputSize].fontSize,
              padding: sizeStyles[inputSize].padding,
              color: colorTokens.neutral[900],
              fontFamily: typographyTokens.body.fontFamily,
              minWidth: 0,
            }}
            {...componentDataAttr({ testId, id }, 'input')}
            {...props}
          />
          {trailingIcon ? (
            <span style={{ marginRight: spacingTokens[2], display: 'inline-flex', color: colorTokens.neutral[400] }}>{trailingIcon}</span>
          ) : null}
        </div>
        {resolvedError ? (
          <span id={`${id}-help`} role="alert" style={{ display: 'block', marginTop: spacingTokens[1], fontSize: typographyTokens.caption.fontSize, color: colorTokens.danger.DEFAULT }}>
            {resolvedError}
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

Input.displayName = 'Input';
export default Input;
