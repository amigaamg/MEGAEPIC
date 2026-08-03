// AMEXAN Universal Skeleton Component
// Constitutional Principle: Skeletons communicate loading. Never spinners alone.
// Spec: skeleton > spinner. Shimmer approved.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr } from './types';
import type { UniversalComponentProps } from './types';

export interface SkeletonProps extends UniversalComponentProps {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  lines?: number;
  lastLineWidth?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width = '100%', height = 14, circle = false, lines = 0, lastLineWidth = '60%', className = '', testId, id, ...props }, ref) => {
    const base: React.CSSProperties = {
      display: 'block',
      width,
      height,
      borderRadius: circle ? '50%' : getRadius(4),
      background: `linear-gradient(90deg, ${colorTokens.neutral[100]} 25%, ${colorTokens.neutral[200]} 37%, ${colorTokens.neutral[100]} 63%)`,
      backgroundSize: '400% 100%',
      animation: 'amexan-shimmer 1.4s ease infinite',
      flexShrink: 0,
    };

    if (lines > 0) {
      return (
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 8 }} {...componentDataAttr({ testId, id }, 'skeleton')} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              style={{
                ...base,
                width: i === lines - 1 ? lastLineWidth : width,
                height,
              }}
            />
          ))}
        </div>
      );
    }

    return <div ref={ref} style={base} {...componentDataAttr({ testId, id }, 'skeleton')} {...props} />;
  },
);

Skeleton.displayName = 'Skeleton';
export default Skeleton;
