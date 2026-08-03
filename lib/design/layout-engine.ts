// AMEXAN Universal Layout Engine
// Constitutional Principle: Layouts are standardized, not ad hoc
// Spec: 7 layouts = shell / public / auth / dashboard / workspace / fullscreen / operations.
// Workspace structure = Header / Context Bar / Navigation / Workspace / Assistant Panel / Status Bar.

import type { Theme } from './theme-engine';
import { breakpointOrder } from './tokens/breakpoints';
import type { Breakpoint } from './tokens/index';

export type LayoutKind = 'shell' | 'public' | 'auth' | 'dashboard' | 'workspace' | 'fullscreen' | 'operations';

export const layoutKinds: LayoutKind[] = [
  'shell',
  'public',
  'auth',
  'dashboard',
  'workspace',
  'fullscreen',
  'operations',
];

export type WorkspaceRegion =
  | 'header'
  | 'contextBar'
  | 'navigation'
  | 'workspace'
  | 'assistantPanel'
  | 'statusBar';

export const workspaceRegions: WorkspaceRegion[] = [
  'header',
  'contextBar',
  'navigation',
  'workspace',
  'assistantPanel',
  'statusBar',
];

export interface LayoutConfig {
  kind: LayoutKind;
  container: {
    maxWidth: string;
    padding: number;
    fullWidth: boolean;
  };
  grid: {
    columns: number;
    gap: number;
    responsive: Record<string, { columns: number; gap: number }>;
  };
  panel: {
    background: string;
    border: { width: string; style: string; color: string };
    padding: number;
    radius: string;
    shadow: string;
  };
  navigation: {
    height: number;
    position: 'static' | 'fixed' | 'sticky';
    background: string;
    zIndex: number;
  };
  content: {
    maxWidth: string;
    gutter: number;
    alignment: 'left' | 'center' | 'right';
  };
  responsive: {
    enable: boolean;
    mobileFirst: boolean;
    hideOnBreakpoint: Breakpoint[];
    showOnBreakpoint: Breakpoint[];
  };
  spacing: {
    unit: string;
    scale: string[];
  };
  regions: Partial<Record<WorkspaceRegion, { visible: boolean; order: number; height?: number; width?: number }>>;
  theme: Theme;
}

const GRID_RESPONSIVE = {
  nano: { columns: 1, gap: 1 },
  xs: { columns: 4, gap: 1 },
  sm: { columns: 6, gap: 3 },
  md: { columns: 8, gap: 4 },
  lg: { columns: 12, gap: 5 },
  xl: { columns: 12, gap: 6 },
  xl2: { columns: 12, gap: 6 },
  xl3: { columns: 16, gap: 6 },
  xl4: { columns: 16, gap: 8 },
  xl5: { columns: 20, gap: 8 },
  xl6: { columns: 20, gap: 8 },
  xl7: { columns: 24, gap: 8 },
  xl8: { columns: 24, gap: 8 },
};

const DEFAULT_REGIONS: LayoutConfig['regions'] = {
  header: { visible: true, order: 0, height: 64 },
  contextBar: { visible: false, order: 1, height: 48 },
  navigation: { visible: true, order: 2, width: 240 },
  workspace: { visible: true, order: 3 },
  assistantPanel: { visible: false, order: 4, width: 320 },
  statusBar: { visible: true, order: 5, height: 28 },
};

export const createLayoutConfig = (theme: Theme, kind: LayoutKind = 'shell'): LayoutConfig => {
  const base: LayoutConfig = {
    kind,
    container: {
      maxWidth: kind === 'fullscreen' ? '100%' : '1280px',
      padding: kind === 'auth' ? 6 : 4,
      fullWidth: kind === 'fullscreen' || kind === 'operations' || kind === 'workspace',
    },
    grid: {
      columns: 12,
      gap: 4,
      responsive: GRID_RESPONSIVE,
    },
    panel: {
      background: theme.colors.secondary.DEFAULT,
      border: {
        width: '1px',
        style: 'solid',
        color: theme.colors.neutral[200],
      },
      padding: kind === 'auth' ? 8 : 4,
      radius: theme.radius.medium,
      shadow: theme.shadows.medium,
    },
    navigation: {
      height: kind === 'operations' ? 56 : 64,
      position: kind === 'shell' || kind === 'public' ? 'static' : 'fixed',
      background: theme.colors.secondary.DEFAULT,
      zIndex: 1000,
    },
    content: {
      maxWidth: kind === 'fullscreen' ? '100%' : kind === 'auth' ? '480px' : '1024px',
      gutter: kind === 'auth' ? 4 : 6,
      alignment: kind === 'auth' ? 'center' : 'left',
    },
    responsive: {
      enable: true,
      mobileFirst: true,
      hideOnBreakpoint: kind === 'workspace' ? ['nano', 'xs'] : [],
      showOnBreakpoint: [],
    },
    spacing: {
      unit: '16px',
      scale: ['0', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px'],
    },
    regions: { ...DEFAULT_REGIONS },
    theme,
  };

  switch (kind) {
    case 'auth':
      base.regions.navigation = { visible: false, order: 2, width: 0 };
      base.regions.contextBar = { visible: false, order: 1, height: 0 };
      base.regions.statusBar = { visible: true, order: 5, height: 24 };
      break;
    case 'fullscreen':
      base.regions.navigation = { visible: false, order: 2, width: 0 };
      base.regions.header = { visible: true, order: 0, height: 0 };
      base.regions.statusBar = { visible: false, order: 5, height: 0 };
      break;
    case 'workspace':
      base.regions.contextBar = { visible: true, order: 1, height: 48 };
      base.regions.assistantPanel = { visible: true, order: 4, width: 320 };
      break;
    case 'operations':
      base.regions.contextBar = { visible: true, order: 1, height: 40 };
      base.regions.navigation = { visible: true, order: 2, width: 200 };
      break;
    case 'public':
    case 'shell':
    default:
      break;
  }

  return base;
};

export class LayoutEngine {
  private static instance: LayoutEngine;
  private config: LayoutConfig;

  constructor(theme: Theme, kind: LayoutKind = 'shell') {
    if (LayoutEngine.instance) {
      return LayoutEngine.instance;
    }
    this.config = createLayoutConfig(theme, kind);
    LayoutEngine.instance = this;
  }

  public getConfig(): LayoutConfig {
    return this.config;
  }

  public getKind(): LayoutKind {
    return this.config.kind;
  }

  public setConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public switchKind(kind: LayoutKind): LayoutConfig {
    this.config = createLayoutConfig(this.config.theme, kind);
    return this.config;
  }

  public getPanelStyle(): React.CSSProperties {
    const { background, border, padding, radius, shadow } = this.config.panel;
    return {
      backgroundColor: background,
      border: `${border.width} ${border.style} ${border.color}`,
      padding,
      borderRadius: radius,
      boxShadow: shadow,
    };
  }

  public getGridStyle(breakpoint: Breakpoint): React.CSSProperties {
    const bpStyle = this.config.grid.responsive[breakpoint] || this.config.grid.responsive.lg;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${bpStyle.columns}, 1fr)`,
      gap: bpStyle.gap,
    };
  }

  public getContainerStyle(): React.CSSProperties {
    const { maxWidth, padding, fullWidth } = this.config.container;
    return {
      maxWidth: fullWidth ? '100%' : maxWidth,
      margin: '0 auto',
      padding,
    };
  }

  public getRegion = (region: WorkspaceRegion): LayoutConfig['regions'][WorkspaceRegion] => {
    return this.config.regions[region];
  };

  public isRegionVisible = (region: WorkspaceRegion): boolean => {
    return this.config.regions[region]?.visible ?? false;
  };

  public static getInstance(theme?: Theme): LayoutEngine {
    if (!LayoutEngine.instance && theme) {
      return new LayoutEngine(theme);
    }
    return LayoutEngine.instance;
  }

  public static reset(): void {
    LayoutEngine.instance = undefined as unknown as LayoutEngine;
  }
}

export default LayoutEngine;

export const layoutOrder = layoutKinds;
export const breakpointOrderForLayout = breakpointOrder;
