// AMEXAN Universal Navbar Component
// Constitutional Principle: Navigation is generated, never hardcoded.
// Spec: global + org + user menu, mobile = top bar with menu trigger, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getElevation } from '@/lib/design/tokens/elevation';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface NavbarItem {
  id: string;
  label: string;
  href?: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export interface NavbarProps extends UniversalComponentProps {
  brand?: React.ReactNode;
  items?: NavbarItem[];
  right?: React.ReactNode;
  onMenuClick?: () => void;
  sticky?: boolean;
}

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ brand, items = [], right, onMenuClick, sticky = true, className = '', testId, id, telemetry, ...props }, ref) => {
    return (
      <header
        ref={ref}
        data-testid={testId}
        style={{
          position: sticky ? 'sticky' : 'static',
          top: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          height: 64,
          padding: `0 ${spacingTokens[4]}`,
          gap: spacingTokens[3],
          background: colorTokens.secondary.DEFAULT,
          borderBottom: `1px solid ${colorTokens.neutral[200]}`,
          boxShadow: getElevation(1),
        }}
        {...componentDataAttr({ testId, id }, 'navbar')}
        {...props}
      >
        {onMenuClick ? (
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => {
              emitTelemetry({ telemetry, testId }, 'navbar', 'menu-open');
              onMenuClick();
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44, background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', color: colorTokens.neutral[600] }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
        {brand ? <div style={{ display: 'flex', alignItems: 'center' }}>{brand}</div> : null}
        <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: spacingTokens[1], marginLeft: spacingTokens[2], overflowX: 'auto' }}>
          {items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              onClick={() => {
                emitTelemetry({ telemetry, testId }, 'navbar', 'item-click', { item: item.id });
                item.onClick?.();
              }}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: `0 ${spacingTokens[3]}`,
                borderRadius: 8,
                color: item.active ? colorTokens.primary.DEFAULT : colorTokens.neutral[600],
                fontWeight: 500,
                fontSize: typographyTokens.label.fontSize,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: item.active ? colorTokens.primary.surface : 'transparent',
              }}
            >
              {item.label}
              {item.badge !== undefined ? (
                <span style={{ marginLeft: 6, background: colorTokens.danger.DEFAULT, color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
                  {item.badge}
                </span>
              ) : null}
            </a>
          ))}
        </nav>
        {right ? <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: spacingTokens[2] }}>{right}</div> : null}
      </header>
    );
  },
);

Navbar.displayName = 'Navbar';
export default Navbar;
