// AMEXAN Universal Loader Component
// Constitutional Principle: Loading is communicated, never decorative.
// Spec: prefers skeleton; loader allowed for micro/indeterminate progress.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { getIconSize } from '@/lib/design/tokens/icons';
import { componentDataAttr } from './types';
import type { UniversalComponentProps } from './types';

export type LoaderVariant = 'circular' | 'linear';
export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps extends UniversalComponentProps {
  loaderVariant?: LoaderVariant;
  loaderSize?: LoaderSize;
  label?: string;
}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ loaderVariant = 'circular', loaderSize = 'md', label, className = '', testId, id, variant: _variant, ...props }, ref) => {
    const size = { sm: 20, md: 28, lg: 40 }[loaderSize];

    if (loaderVariant === 'linear') {
      return (
        <div ref={ref} role="progressbar" aria-busy="true" aria-label={label} style={{ width: '100%', height: 4, borderRadius: 999, overflow: 'hidden', background: colorTokens.neutral[200] }} {...componentDataAttr({ testId, id }, 'loader')} {...props}>
          <div
            style={{
              width: '40%',
              height: '100%',
              borderRadius: 999,
              background: colorTokens.primary.DEFAULT,
              animation: 'amexan-linear-progress 1s ease-in-out infinite',
            }}
          />
        </div>
      );
    }

    return (
      <div ref={ref} role="progressbar" aria-busy="true" aria-label={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} {...componentDataAttr({ testId, id }, 'loader')} {...props}>
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'amexan-spin 0.8s linear infinite' }}>
          <circle cx="12" cy="12" r="10" fill="none" stroke={colorTokens.neutral[200]} strokeWidth="2.5" />
          <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke={colorTokens.primary.DEFAULT} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {label ? <span style={{ fontSize: 12, color: colorTokens.neutral[500] }}>{label}</span> : null}
      </div>
    );
  },
);

Loader.displayName = 'Loader';
export default Loader;

export const iconSize = getIconSize;
