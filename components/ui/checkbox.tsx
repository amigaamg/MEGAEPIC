// AMEXAN Universal Checkbox Component
// Constitutional Principle: Every input is token-driven, accessible, and contract-checked.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type CheckboxVariant = 'primary' | 'success' | 'danger';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    Omit<UniversalComponentProps, 'variant'> {
  variant?: CheckboxVariant;
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      variant = 'primary',
      label,
      indeterminate = false,
      loading = false,
      disabled = false,
      className = '',
      testId,
      id,
      telemetry,
      onChange,
      checked,
      theme,
      permissions,
      size: _size,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const accent = {
      primary: colorTokens.primary.DEFAULT,
      success: colorTokens.success.DEFAULT,
      danger: colorTokens.danger.DEFAULT,
    }[variant];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      emitTelemetry({ telemetry, testId }, 'checkbox', 'change', { checked: e.target.checked });
      onChange?.(e);
    };

    return (
      <label
        htmlFor={id}
        data-testid={testId}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: spacingTokens[2],
          minHeight: 48,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          fontSize: typographyTokens.body.fontSize,
          color: colorTokens.neutral[800],
          userSelect: 'none',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: getRadius(6),
            border: `2px solid ${checked || indeterminate ? accent : colorTokens.neutral[400]}`,
            backgroundColor: checked || indeterminate ? accent : colorTokens.secondary.DEFAULT,
            transition: 'background-color 150ms ease, border-color 150ms ease',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            {indeterminate ? (
              <path d="M3 7H11" stroke="white" strokeWidth="2" strokeLinecap="round" />
            ) : checked ? (
              <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
          </svg>
        </span>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled || loading}
          onChange={handleChange}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          aria-label={label}
          {...componentDataAttr({ testId, id }, 'checkbox')}
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
