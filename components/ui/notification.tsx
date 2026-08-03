// AMEXAN Universal Notification (Toast) Component
// Constitutional Principle: Feedback is a constitutional contract. Motion is communication.
// Spec: max 3 toasts visible. Auto-dismiss. Never decorative.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { getElevation } from '@/lib/design/tokens/elevation';
import { componentDataAttr } from './types';
import type { UniversalComponentProps } from './types';

export type NotificationVariant = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationProps extends UniversalComponentProps {
  variant?: NotificationVariant;
  title?: string;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ variant = 'info', title, message, duration, onDismiss, actionLabel, onAction, className = '', testId, id, ...props }, ref) => {
    const accent = {
      info: colorTokens.accent,
      success: colorTokens.success,
      warning: colorTokens.warning,
      danger: colorTokens.danger,
    }[variant];

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        data-testid={testId}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: spacingTokens[2],
          padding: `${spacingTokens[3]} ${spacingTokens[4]}`,
          borderRadius: getRadius(12),
          background: colorTokens.secondary.DEFAULT,
          border: `1px solid ${accent.border}`,
          borderLeft: `4px solid ${accent.DEFAULT}`,
          boxShadow: getElevation(3),
          minWidth: 280,
          maxWidth: 420,
          animation: 'amexan-toast-in 150ms ease-out both',
        }}
        {...componentDataAttr({ testId, id }, 'notification')}
        {...props}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent.DEFAULT, marginTop: 6, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          {title ? (
            <strong style={{ display: 'block', fontSize: typographyTokens.label.fontSize, color: colorTokens.neutral[800] }}>{title}</strong>
          ) : null}
          <p style={{ margin: 0, fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[600] }}>{message}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              style={{
                marginTop: spacingTokens[1],
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: typographyTokens.label.fontSize,
                fontWeight: 600,
                color: accent.DEFAULT,
              }}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colorTokens.neutral[400],
              fontSize: 16,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        ) : null}
      </div>
    );
  },
);

Notification.displayName = 'Notification';
export default Notification;
