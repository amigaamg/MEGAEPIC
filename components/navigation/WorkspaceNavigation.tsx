// AMEXAN Workspace Navigation Component
// Constitutional Principle: Navigation is generated from role + permissions, never hardcoded.
// Workspace layer of the 7-layer navigation. Consumes the NavigationEngine.

'use client';

import React from 'react';
import { navigationEngine } from '@/lib/design/navigation-engine';
import type { NavigationItem } from '@/lib/design/navigation-engine';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';

export interface WorkspaceNavigationProps {
  items: NavigationItem[];
  activeId?: string;
  collapsed?: boolean;
  onNavigate?: (item: NavigationItem) => void;
}

export const WorkspaceNavigation = ({ items, activeId, collapsed = false, onNavigate }: WorkspaceNavigationProps) => {
  const generated = React.useMemo(() => navigationEngine.generateWorkspaceNavigation(items), [items]);

  return (
    <nav aria-label="Workspace" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {generated.map((item) => {
        const isActive = item.id === activeId;
        return (
          <a
            key={item.id}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate?.(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacingTokens[2],
              minHeight: 44,
              padding: collapsed ? `0 ${spacingTokens[2]}` : `0 ${spacingTokens[3]}`,
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: getRadius(8),
              textDecoration: 'none',
              background: isActive ? colorTokens.primary.surface : 'transparent',
              color: isActive ? colorTokens.primary.DEFAULT : colorTokens.neutral[600],
              fontSize: typographyTokens.bodySmall.fontSize,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {item.icon ? <span style={{ display: 'inline-flex', flexShrink: 0, width: 20, justifyContent: 'center' }}>{item.icon}</span> : null}
            {!collapsed ? <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span> : null}
            {!collapsed && item.badge !== undefined ? (
              <span style={{ background: colorTokens.danger.DEFAULT, color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>{item.badge}</span>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
};

export default WorkspaceNavigation;
