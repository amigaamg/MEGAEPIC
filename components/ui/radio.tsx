// AMEXAN Universal Radio Component
// Constitutional Principle: Every input is token-driven, accessible, and contract-checked.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type RadioVariant = 'primary' | 'success' | 'danger';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    Omit<UniversalComponentProps, 'variant'> {
  variant?: RadioVariant;
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      variant = 'primary',
      label,
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
    const accent = {
      primary: colorTokens.primary.DEFAULT,
      success: colorTokens.success.DEFAULT,
      danger: colorTokens.danger.DEFAULT,
    }[variant];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      emitTelemetry({ telemetry, testId }, 'radio', 'change', { checked: e.target.checked });
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
            borderRadius: '50%',
            border: `2px solid ${checked ? accent : colorTokens.neutral[400]}`,
            backgroundColor: colorTokens.secondary.DEFAULT,
            transition: 'border-color 150ms ease',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: checked ? accent : 'transparent',
              transition: 'background-color 150ms ease',
            }}
          />
        </span>
        <input
          ref={ref}
          id={id}
          type="radio"
          checked={checked}
          disabled={disabled || loading}
          onChange={handleChange}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
          aria-label={label}
          {...componentDataAttr({ testId, id }, 'radio')}
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  },
);

Radio.displayName = 'Radio';
export default Radio;
