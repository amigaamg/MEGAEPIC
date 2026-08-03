// AMEXAN Universal Select Component
// Constitutional Principle: Every input is token-driven, accessible, and contract-checked.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type SelectVariant = 'default' | 'filled' | 'danger';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size' | 'disabled'>,
    Omit<UniversalComponentProps, 'variant'> {
  variant?: SelectVariant;
  selectSize?: SelectSize;
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = 'default',
      selectSize = 'md',
      label,
      hint,
      error,
      options = [],
      placeholder,
      loading = false,
      disabled = false,
      className = '',
      testId,
      id,
      telemetry,
      onChange,
      'aria-label': ariaLabel,
      theme,
      permissions,
      size: _size,
      ...props
    },
    ref,
  ) => {
    const sizeStyles: Record<SelectSize, React.CSSProperties> = {
      sm: { padding: `${spacingTokens[1]} ${spacingTokens[2]}`, fontSize: typographyTokens.bodySmall.fontSize },
      md: { padding: `${spacingTokens[2]} ${spacingTokens[3]}`, fontSize: typographyTokens.body.fontSize },
      lg: { padding: `${spacingTokens[3]} ${spacingTokens[4]}`, fontSize: typographyTokens.bodyLarge.fontSize },
    };

    const variantStyles: Record<SelectVariant, React.CSSProperties> = {
      default: { backgroundColor: colorTokens.secondary.DEFAULT, borderColor: colorTokens.neutral[300] },
      filled: { backgroundColor: colorTokens.neutral[100], borderColor: 'transparent' },
      danger: { backgroundColor: colorTokens.danger.surface, borderColor: colorTokens.danger.DEFAULT },
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      emitTelemetry({ telemetry, testId }, 'select', 'change', { value: e.target.value });
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
        <select
          ref={ref}
          id={id}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-help` : undefined}
          disabled={disabled || loading}
          onChange={handleChange}
          style={{
            width: '100%',
            minHeight: 48,
            borderRadius: getRadius(8),
            border: `1px solid ${error ? colorTokens.danger.DEFAULT : variantStyles[variant].borderColor}`,
            backgroundColor: variantStyles[variant].backgroundColor,
            fontSize: sizeStyles[selectSize].fontSize,
            padding: sizeStyles[selectSize].padding,
            color: colorTokens.neutral[900],
            fontFamily: typographyTokens.body.fontFamily,
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          {...componentDataAttr({ testId, id }, 'select')}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
export default Select;
