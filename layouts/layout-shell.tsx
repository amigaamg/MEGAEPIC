// AMEXAN Layout Foundation
// Constitutional Principle: Layouts are standardized, not ad hoc.
// Shared primitives used by every layout kind. Tokens only, never hardcoded values.

import React from 'react';
import { getTheme } from '@/lib/design/theme-engine';
import { createLayoutConfig } from '@/lib/design/layout-engine';
import type { LayoutKind, LayoutConfig, WorkspaceRegion } from '@/lib/design/layout-engine';

export interface LayoutShellProps {
  kind?: LayoutKind;
  themeId?: string;
  header?: React.ReactNode;
  contextBar?: React.ReactNode;
  navigation?: React.ReactNode;
  workspace?: React.ReactNode;
  assistantPanel?: React.ReactNode;
  statusBar?: React.ReactNode;
  children?: React.ReactNode;
  content?: React.ReactNode;
}

export function useLayoutConfig(kind: LayoutKind, themeId = 'clinical'): LayoutConfig {
  const theme = getTheme(themeId);
  return React.useMemo(() => createLayoutConfig(theme, kind), [theme, kind]);
}

export const regionVisible = (config: LayoutConfig, region: WorkspaceRegion): boolean => {
  return config.regions[region]?.visible ?? false;
};

export const regionOrder = (config: LayoutConfig): WorkspaceRegion[] => {
  return (['header', 'contextBar', 'navigation', 'workspace', 'assistantPanel', 'statusBar'] as WorkspaceRegion[])
    .filter((r) => config.regions[r]?.visible)
    .sort((a, b) => (config.regions[a]?.order ?? 0) - (config.regions[b]?.order ?? 0));
};

export default useLayoutConfig;
