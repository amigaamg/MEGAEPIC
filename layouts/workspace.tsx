// AMEXAN Workspace Layout
// Constitutional Principle: Workspaces are where clinicians think. Context is the patient.
// Kind: workspace. Header / Context Bar / Navigation / Workspace / Assistant Panel / Status Bar.

'use client';

import React from 'react';
import { useLayoutConfig, regionVisible } from './layout-shell';
import { colorTokens } from '@/lib/design/tokens/colors';
import { spacingTokens } from '@/lib/design/tokens/spacing';

export interface WorkspaceLayoutProps {
  themeId?: string;
  header?: React.ReactNode;
  contextBar?: React.ReactNode;
  navigation?: React.ReactNode;
  assistantPanel?: React.ReactNode;
  statusBar?: React.ReactNode;
  children: React.ReactNode;
}

export const WorkspaceLayout = ({ themeId = 'clinical', header, contextBar, navigation, assistantPanel, statusBar, children }: WorkspaceLayoutProps) => {
  const config = useLayoutConfig('workspace', themeId);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colorTokens.secondary.DEFAULT,
        color: colorTokens.neutral[900],
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {regionVisible(config, 'header') && header ? (
        <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>{header}</div>
      ) : null}
      {regionVisible(config, 'contextBar') && contextBar ? <div>{contextBar}</div> : null}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {regionVisible(config, 'navigation') && navigation ? (
          <div style={{ width: config.regions.navigation?.width || 240, flexShrink: 0 }}>{navigation}</div>
        ) : null}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: spacingTokens[5] }}>{children}</main>
        {regionVisible(config, 'assistantPanel') && assistantPanel ? (
          <aside style={{ width: config.regions.assistantPanel?.width || 320, flexShrink: 0, borderLeft: `1px solid ${colorTokens.neutral[200]}`, background: colorTokens.neutral[50], overflowY: 'auto' }}>
            {assistantPanel}
          </aside>
        ) : null}
      </div>
      {regionVisible(config, 'statusBar') && statusBar ? (
        <div style={{ borderTop: `1px solid ${colorTokens.neutral[200]}`, height: config.regions.statusBar?.height || 28, display: 'flex', alignItems: 'center', padding: `0 ${spacingTokens[3]}`, background: colorTokens.neutral[50], fontSize: 11, color: colorTokens.neutral[500] }}>
          {statusBar}
        </div>
      ) : null}
    </div>
  );
};

export default WorkspaceLayout;
