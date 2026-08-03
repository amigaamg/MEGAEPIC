// AMEXAN Universal Error State Component
// Constitutional Principle: Every error answers: Problem / Reason / Recovery / Retry / Support.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type ErrorStateVariant = 'error' | 'warning' | 'critical';

export interface ErrorStateProps extends Omit<UniversalComponentProps, 'variant'> {
  variant?: ErrorStateVariant;
  problem: string;
  reason?: string;
  recovery?: string;
  onRetry?: () => void;
  supportLabel?: string;
  onSupport?: () => void;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      variant = 'error',
      problem,
      reason,
      recovery,
      onRetry,
      supportLabel,
      onSupport,
      className = '',
      testId,
      id,
      telemetry,
      ...props
    },
    ref,
  ) => {
    const accent = {
      error: colorTokens.danger,
      warning: colorTokens.warning,
      critical: colorTokens.danger,
    }[variant];

    const buttonBase: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      padding: `${spacingTokens[2]} ${spacingTokens[4]}`,
      borderRadius: getRadius(8),
      fontSize: typographyTokens.label.fontSize,
      fontWeight: typographyTokens.label.fontWeight,
      cursor: 'pointer',
      border: '1px solid transparent',
      transition: 'background-color 150ms ease',
    };

    return (
      <div
        ref={ref}
        role="alert"
        data-testid={testId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacingTokens[2],
          padding: spacingTokens[6],
          borderRadius: getRadius(12),
          border: `1px solid ${accent.border}`,
          background: accent.surface,
          alignItems: 'flex-start',
        }}
        {...componentDataAttr({ testId, id }, 'error-state')}
        {...props}
      >
        <strong style={{ fontSize: typographyTokens.h5.fontSize, color: accent.text }}>{problem}</strong>
        {reason ? <p style={{ margin: 0, fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[600] }}>{reason}</p> : null}
        {recovery ? <p style={{ margin: 0, fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[600] }}>{recovery}</p> : null}
        {onRetry || onSupport ? (
          <div style={{ display: 'flex', gap: spacingTokens[2], marginTop: spacingTokens[1], flexWrap: 'wrap' }}>
            {onRetry ? (
              <button
                type="button"
                style={{ ...buttonBase, background: accent.DEFAULT, color: accent.contrast }}
                onClick={() => {
                  emitTelemetry({ telemetry, testId }, 'error-state', 'retry');
                  onRetry();
                }}
              >
                Retry
              </button>
            ) : null}
            {onSupport ? (
              <button
                type="button"
                style={{ ...buttonBase, background: 'transparent', color: colorTokens.neutral[600], borderColor: colorTokens.neutral[300] }}
                onClick={() => {
                  emitTelemetry({ telemetry, testId }, 'error-state', 'support');
                  onSupport();
                }}
              >
                {supportLabel || 'Contact Support'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

ErrorState.displayName = 'ErrorState';
export default ErrorState;
