// AMEXAN Universal Modal Component
// Constitutional Principle: Modals are focused conversations, never containers of workflows.
// Spec: ESC to close, focus trap, overlay click, fullscreen on mobile, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { getElevation } from '@/lib/design/tokens/elevation';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface ModalProps extends UniversalComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  children: React.ReactNode;
}

const SIZES = { sm: 400, md: 560, lg: 720, xl: 960 };

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, title, footer, size = 'md', closeOnOverlay = true, className = '', testId, id, telemetry, children, ...props }, ref) => {
    const dialogRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!open) return;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          emitTelemetry({ telemetry, testId }, 'modal', 'dismiss', { method: 'escape' });
          onClose();
        }
      };
      window.addEventListener('keydown', onKey);
      setTimeout(() => dialogRef.current?.focus(), 0);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', onKey);
      };
    }, [open, onClose, telemetry, testId]);

    if (!open) return null;

    return (
      <div
        role="presentation"
        data-testid={testId}
        onMouseDown={(e) => {
          if (closeOnOverlay && e.target === e.currentTarget) {
            emitTelemetry({ telemetry, testId }, 'modal', 'dismiss', { method: 'overlay' });
            onClose();
          }
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.55)',
          padding: spacingTokens[4],
          animation: 'amexan-fade-in 150ms ease-out both',
        }}
        {...props}
      >
        <div
          ref={(el) => {
            dialogRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          style={{
            width: '100%',
            maxWidth: SIZES[size],
            maxHeight: '85vh',
            overflowY: 'auto',
            background: colorTokens.secondary.DEFAULT,
            borderRadius: getRadius(16),
            boxShadow: getElevation(5),
            animation: 'amexan-modal-in 200ms ease-out both',
            outline: 'none',
          }}
          {...componentDataAttr({ testId, id }, 'modal')}
        >
          {title ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacingTokens[4]} ${spacingTokens[5]}`, borderBottom: `1px solid ${colorTokens.neutral[200]}` }}>
              <h2 style={{ margin: 0, fontSize: typographyTokens.h5.fontSize, fontWeight: typographyTokens.h5.fontWeight, color: colorTokens.neutral[800] }}>{title}</h2>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => {
                  emitTelemetry({ telemetry, testId }, 'modal', 'dismiss', { method: 'button' });
                  onClose();
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: colorTokens.neutral[400], padding: spacingTokens[1], minWidth: 44, minHeight: 44 }}
              >
                ×
              </button>
            </div>
          ) : null}
          <div style={{ padding: spacingTokens[5] }}>{children}</div>
          {footer ? <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacingTokens[2], padding: `${spacingTokens[3]} ${spacingTokens[5]}`, borderTop: `1px solid ${colorTokens.neutral[200]}` }}>{footer}</div> : null}
        </div>
      </div>
    );
  },
);

Modal.displayName = 'Modal';
export default Modal;
