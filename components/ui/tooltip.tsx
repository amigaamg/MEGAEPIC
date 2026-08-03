// AMEXAN Universal Tooltip Component
// Constitutional Principle: Tooltips never carry critical information. Accessible by keyboard + hover.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { getElevation } from '@/lib/design/tokens/elevation';
import { componentDataAttr } from './types';
import type { UniversalComponentProps } from './types';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends UniversalComponentProps {
  content: string;
  position?: TooltipPosition;
  children: React.ReactElement;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, position = 'top', children, delay = 150, className = '', testId, id }) => {
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const positionStyles: Record<TooltipPosition, React.CSSProperties> = {
    top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
  };

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMounted(true);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => setMounted(false), 150);
  };

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...componentDataAttr({ testId, id }, 'tooltip')}
    >
      {children}
      {mounted ? (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 50,
            padding: `${spacingTokens[1]} ${spacingTokens[2]}`,
            borderRadius: getRadius(6),
            background: colorTokens.neutral[900],
            color: '#ffffff',
            fontSize: typographyTokens.caption.fontSize,
            whiteSpace: 'nowrap',
            boxShadow: getElevation(3),
            opacity: visible ? 1 : 0,
            transition: 'opacity 150ms ease',
            pointerEvents: 'none',
            ...positionStyles[position],
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
};

Tooltip.displayName = 'Tooltip';
export default Tooltip;
