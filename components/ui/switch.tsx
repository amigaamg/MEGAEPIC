// AMEXAN Universal Switch Component
// Constitutional Principle: Every input is token-driven, accessible, and contract-checked.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type SwitchVariant = 'primary' | 'success' | 'warning';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    Omit<UniversalComponentProps, 'variant'> {
  variant?: SwitchVariant;
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
      warning: colorTokens.warning.DEFAULT,
    }[variant];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      emitTelemetry({ telemetry, testId }, 'switch', 'change', { checked: e.target.checked });
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
          role="switch"
          aria-checked={!!checked}
          style={{
            position: 'relative',
            display: 'inline-block',
            width: 44,
            height: 26,
            borderRadius: 999,
            backgroundColor: checked ? accent : colorTokens.neutral[300],
            transition: 'background-color 150ms ease',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: checked ? 21 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 150ms ease',
            }}
          />
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
          {...componentDataAttr({ testId, id }, 'switch')}
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  },
);

Switch.displayName = 'Switch';
export default Switch;
