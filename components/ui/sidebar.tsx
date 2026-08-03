// AMEXAN Universal Sidebar Component
// Constitutional Principle: Sidebars are generated from role + permissions. Never hardcoded.
// Spec: permanent / collapsible / drawer per breakpoint. Telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  children?: SidebarItem[];
  permission?: string;
  onClick?: () => void;
}

export interface SidebarProps extends UniversalComponentProps {
  items: SidebarItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  permissions?: string[];
  width?: number;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ items, header, footer, collapsed = false, onToggle, permissions = [], width = 240, className = '', testId, id, telemetry, ...props }, ref) => {
    const visible = (item: SidebarItem): boolean => !item.permission || permissions.includes(item.permission);

    const itemBase: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: spacingTokens[2],
      minHeight: 44,
      padding: collapsed ? `0 ${spacingTokens[2]}` : `0 ${spacingTokens[3]}`,
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderRadius: getRadius(8),
      color: colorTokens.neutral[600],
      fontSize: typographyTokens.bodySmall.fontSize,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: 'background-color 100ms ease, color 100ms ease',
    };

    return (
      <aside
        ref={ref}
        data-testid={testId}
        aria-label="Sidebar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: collapsed ? 64 : width,
          height: '100%',
          background: colorTokens.secondary.DEFAULT,
          borderRight: `1px solid ${colorTokens.neutral[200]}`,
          transition: 'width 200ms ease',
          overflow: 'hidden',
        }}
        {...componentDataAttr({ testId, id }, 'sidebar')}
        {...props}
      >
        {header ? <div style={{ padding: spacingTokens[3], display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>{header}</div> : null}
        <nav aria-label="Sidebar" style={{ flex: 1, padding: spacingTokens[2], overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.filter(visible).map((item) => {
            const isActive = item.active;
            return (
              <a
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  emitTelemetry({ telemetry, testId }, 'sidebar', 'item-click', { item: item.id });
                  item.onClick?.();
                }}
                style={{
                  ...itemBase,
                  background: isActive ? colorTokens.primary.surface : 'transparent',
                  color: isActive ? colorTokens.primary.DEFAULT : colorTokens.neutral[600],
                }}
              >
                {item.icon ? <span style={{ display: 'inline-flex', flexShrink: 0 }}>{item.icon}</span> : null}
                {!collapsed ? <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span> : null}
                {!collapsed && item.badge !== undefined ? (
                  <span style={{ background: colorTokens.primary.DEFAULT, color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>{item.badge}</span>
                ) : null}
              </a>
            );
          })}
        </nav>
        {footer ? (
          <div style={{ padding: spacingTokens[2], borderTop: `1px solid ${colorTokens.neutral[200]}` }}>
            {collapsed && onToggle ? (
              <button type="button" aria-label="Expand sidebar" onClick={onToggle} style={{ ...itemBase, width: '100%', background: 'none', border: 'none', justifyContent: 'center' }}>
                ›
              </button>
            ) : (
              footer
            )}
          </div>
        ) : null}
      </aside>
    );
  },
);

Sidebar.displayName = 'Sidebar';
export default Sidebar;
