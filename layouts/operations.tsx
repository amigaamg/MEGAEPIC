// AMEXAN Operations Layout
// Constitutional Principle: Operations are command surfaces. Density by default.
// Kind: operations. Compact navigation, always-visible context bar.

'use client';

import React from 'react';
import { useLayoutConfig, regionVisible } from './layout-shell';
import { colorTokens } from '@/lib/design/tokens/colors';
import { spacingTokens } from '@/lib/design/tokens/spacing';

export interface OperationsLayoutProps {
  themeId?: string;
  header?: React.ReactNode;
  contextBar?: React.ReactNode;
  navigation?: React.ReactNode;
  children: React.ReactNode;
}

export const OperationsLayout = ({ themeId = 'clinical', header, contextBar, navigation, children }: OperationsLayoutProps) => {
  const config = useLayoutConfig('operations', themeId);

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
      {regionVisible(config, 'header') && header ? <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>{header}</div> : null}
      {regionVisible(config, 'contextBar') && contextBar ? <div>{contextBar}</div> : null}
      <div style={{ display: 'flex', flex: 1 }}>
        {regionVisible(config, 'navigation') && navigation ? (
          <div style={{ width: config.regions.navigation?.width || 200, flexShrink: 0 }}>{navigation}</div>
        ) : null}
        <main style={{ flex: 1, minWidth: 0, padding: spacingTokens[4], overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  );
};

export default OperationsLayout;
