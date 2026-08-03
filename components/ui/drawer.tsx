// AMEXAN Universal Drawer Component
// Constitutional Principle: Drawers are momentary context. Never homes for workflows.
// Spec: slide from any edge, ESC close, overlay click, bottom-sheet on mobile, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { getElevation } from '@/lib/design/tokens/elevation';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps extends UniversalComponentProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  title?: string;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ open, onClose, side = 'right', title, width = 320, children, footer, className = '', testId, id, telemetry, ...props }, ref) => {
    React.useEffect(() => {
      if (!open) return;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', onKey);
      };
    }, [open, onClose]);

    if (!open) return null;

    const isVertical = side === 'top' || side === 'bottom';

    const placementStyle: React.CSSProperties =
      side === 'left'
        ? { left: 0, top: 0, bottom: 0, width, borderTopRightRadius: getRadius(16), borderBottomRightRadius: getRadius(16) }
        : side === 'right'
          ? { right: 0, top: 0, bottom: 0, width, borderTopLeftRadius: getRadius(16), borderBottomLeftRadius: getRadius(16) }
          : side === 'top'
            ? { top: 0, left: 0, right: 0, maxHeight: '80vh', borderBottomLeftRadius: getRadius(16), borderBottomRightRadius: getRadius(16) }
            : { bottom: 0, left: 0, right: 0, maxHeight: '80vh', borderTopLeftRadius: getRadius(16), borderTopRightRadius: getRadius(16) };

    const slideKey = side === 'left' ? 'amexan-drawer-left' : side === 'right' ? 'amexan-drawer-right' : side === 'top' ? 'amexan-drawer-top' : 'amexan-drawer-bottom';

    return (
      <div role="presentation" data-testid={testId} onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15, 23, 42, 0.45)', animation: 'amexan-fade-in 150ms ease-out both' }} {...props}>
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            background: colorTokens.secondary.DEFAULT,
            boxShadow: getElevation(5),
            animation: `${slideKey} 200ms ease-out both`,
            ...placementStyle,
          }}
          {...componentDataAttr({ testId, id }, 'drawer')}
        >
          {title ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: spacingTokens[4], borderBottom: `1px solid ${colorTokens.neutral[200]}` }}>
              <h2 style={{ margin: 0, fontSize: typographyTokens.h5.fontSize, fontWeight: 500, color: colorTokens.neutral[800] }}>{title}</h2>
              <button type="button" aria-label="Close drawer" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: colorTokens.neutral[400], padding: spacingTokens[1], minWidth: 44, minHeight: 44 }}>
                ×
              </button>
            </div>
          ) : null}
          <div style={{ flex: 1, overflowY: 'auto', padding: spacingTokens[4] }}>{children}</div>
          {footer ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacingTokens[2], padding: spacingTokens[3], borderTop: `1px solid ${colorTokens.neutral[200]}` }}>
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

Drawer.displayName = 'Drawer';
export default Drawer;
