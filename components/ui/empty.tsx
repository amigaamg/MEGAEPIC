// AMEXAN Universal Empty State Component
// Constitutional Principle: Every empty state answers: What happened? Why? What next? Button.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr } from './types';
import type { UniversalComponentProps } from './types';

export interface EmptyStateProps extends UniversalComponentProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  whatNext?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, whatNext, className = '', testId, id, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-testid={testId}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: spacingTokens[8],
          borderRadius: getRadius(12),
          border: `1px dashed ${colorTokens.neutral[300]}`,
          background: colorTokens.neutral[50],
          gap: spacingTokens[2],
        }}
        {...componentDataAttr({ testId, id }, 'empty-state')}
        {...props}
      >
        {icon ? (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: colorTokens.primary.surface,
              color: colorTokens.primary.DEFAULT,
              marginBottom: spacingTokens[1],
            }}
          >
            {icon}
          </div>
        ) : null}
        <h3 style={{ margin: 0, fontSize: typographyTokens.h5.fontSize, fontWeight: typographyTokens.h5.fontWeight, color: colorTokens.neutral[800] }}>{title}</h3>
        {description ? (
          <p style={{ margin: 0, fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[500], maxWidth: 320 }}>{description}</p>
        ) : null}
        {whatNext ? (
          <p style={{ margin: 0, fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400] }}>{whatNext}</p>
        ) : null}
        {action ? <div style={{ marginTop: spacingTokens[2] }}>{action}</div> : null}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';
export default EmptyState;
