// AMEXAN Bottom Navigation Component
// Constitutional Principle: Mobile navigation is a thumb-first surface, not a shrunk sidebar.
// Spec: max 4 items, touch >= 48px, only the critical actions.

'use client';

import React from 'react';
import type { NavigationItem } from '@/lib/design/navigation-engine';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';

export interface BottomNavigationProps {
  items: NavigationItem[];
  activeId?: string;
  onNavigate?: (item: NavigationItem) => void;
}

export const BottomNavigation = ({ items, activeId, onNavigate }: BottomNavigationProps) => {
  const primary = items.slice(0, 4);

  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'stretch',
        borderTop: `1px solid ${colorTokens.neutral[200]}`,
        background: colorTokens.secondary.DEFAULT,
        zIndex: 40,
      }}
    >
      {primary.map((item) => {
        const isActive = item.id === activeId;
        return (
          <a
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate?.(item)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              minHeight: 56,
              textDecoration: 'none',
              color: isActive ? colorTokens.primary.DEFAULT : colorTokens.neutral[500],
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'inline-flex', fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
