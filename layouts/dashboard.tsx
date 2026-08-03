// AMEXAN Dashboard Layout
// Constitutional Principle: Dashboards are decision surfaces, not decoration.
// Kind: dashboard. Sidebar navigation + top header + grid workspace.

'use client';

import React from 'react';
import { useLayoutConfig, regionVisible } from './layout-shell';
import { colorTokens } from '@/lib/design/tokens/colors';
import { spacingTokens } from '@/lib/design/tokens/spacing';

export interface DashboardLayoutProps {
  themeId?: string;
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  contextBar?: React.ReactNode;
  statusBar?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout = ({ themeId = 'clinical', header, navigation, contextBar, statusBar, children }: DashboardLayoutProps) => {
  const config = useLayoutConfig('dashboard', themeId);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colorTokens.neutral[50],
        color: colorTokens.neutral[900],
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {regionVisible(config, 'header') && header ? (
        <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>{header}</div>
      ) : null}
      <div style={{ display: 'flex', flex: 1 }}>
        {regionVisible(config, 'navigation') && navigation ? (
          <div style={{ width: config.regions.navigation?.width || 240, flexShrink: 0 }}>{navigation}</div>
        ) : null}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {regionVisible(config, 'contextBar') && contextBar ? <div>{contextBar}</div> : null}
          <main style={{ flex: 1, padding: spacingTokens[5], overflowY: 'auto' }}>{children}</main>
        </div>
      </div>
      {regionVisible(config, 'statusBar') && statusBar ? <div>{statusBar}</div> : null}
    </div>
  );
};

export default DashboardLayout;
