// AMEXAN Universal Navigation Engine
// Constitutional Principle: Navigation is not movement. Navigation is guided workflow.
// Spec: 7 layers = global / org / workspace / context / action / command / intelligent suggestions.
// Generated, not hardcoded. Breadcrumbs, favorites, smart back, Ctrl+K, <=100ms render, telemetry.

import type { Theme } from './theme-engine';

export type NavigationType =
  | 'global'
  | 'organization'
  | 'workspace'
  | 'context'
  | 'action'
  | 'command'
  | 'suggestions';

export const navigationLayers: NavigationType[] = [
  'global',
  'organization',
  'workspace',
  'context',
  'action',
  'command',
  'suggestions',
];

export type NavigationVariant = 'desktop' | 'tablet' | 'mobile' | 'workspace' | 'patient' | 'admin';
export type NavigationItemVariant = 'default' | 'ghost' | 'highlighted';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  variant?: NavigationItemVariant;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  badge?: string | number;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  children?: NavigationItem[];
  permissions?: string[];
  context?: string;
  shortcut?: string;
  keywords?: string[];
  favorite?: boolean;
}

export interface NavigationConfig {
  type: NavigationType;
  variant: NavigationVariant;
  items: NavigationItem[];
  theme: Theme;
}

export interface Breadcrumb {
  id: string;
  label: string;
  href?: string;
  current?: boolean;
}

export interface SmartBackTarget {
  id: string;
  label: string;
  href?: string;
  timestamp: number;
}

export interface NavigationTelemetryEvent {
  type: NavigationType;
  itemId: string;
  timestamp: number;
}

export class NavigationEngine {
  private static instance: NavigationEngine;
  private configs: Map<string, NavigationConfig> = new Map();
  private history: SmartBackTarget[] = [];
  private favorites: Map<string, NavigationItem> = new Map();
  private telemetry: NavigationTelemetryEvent[] = [];

  constructor() {
    if (NavigationEngine.instance) {
      return NavigationEngine.instance;
    }
    NavigationEngine.instance = this;
  }

  public register = (key: string, config: NavigationConfig): void => {
    this.configs.set(key, config);
  };

  public getConfig = (key: string): NavigationConfig | undefined => {
    return this.configs.get(key);
  };

  public getAllConfigs = (): NavigationConfig[] => {
    return Array.from(this.configs.values());
  };

  public generateGlobalNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'default',
    }));
  };

  public generateOrganizationNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'default',
    }));
  };

  public generateWorkspaceNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'ghost',
    }));
  };

  public generateContextNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'highlighted',
    }));
  };

  public generateActionNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'ghost',
    }));
  };

  public generateCommandNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'ghost',
      shortcut: item.shortcut || '',
    }));
  };

  public generateSuggestionNavigation = (items: Omit<NavigationItem, 'variant'>[]): NavigationItem[] => {
    return items.map((item) => ({
      ...item,
      variant: 'highlighted',
    }));
  };

  public generateBreadcrumbNavigation = (items: NavigationItem[]): string[] => {
    return items.map((item) => item.label);
  };

  public buildBreadcrumbs = (current: string, configs: NavigationConfig[]): Breadcrumb[] => {
    const crumbs: Breadcrumb[] = [];
    for (const config of configs) {
      for (const item of this.flatten(config.items)) {
        if (item.id === current) {
          crumbs.push({ id: item.id, label: item.label, href: item.href, current: true });
          return crumbs;
        }
        if (item.href === current) {
          crumbs.push({ id: item.id, label: item.label, href: item.href, current: true });
          return crumbs;
        }
      }
    }
    return [{ id: current, label: current, current: true }];
  };

  public flatten = (items: NavigationItem[], depth = 0): NavigationItem[] => {
    const result: NavigationItem[] = [];
    for (const item of items) {
      result.push({ ...item, context: `${item.context || item.id}@${depth}` });
      if (item.children?.length) {
        result.push(...this.flatten(item.children, depth + 1));
      }
    }
    return result;
  };

  public toggleFavorite = (item: NavigationItem): boolean => {
    const existed = this.favorites.has(item.id);
    if (existed) {
      this.favorites.delete(item.id);
    } else {
      this.favorites.set(item.id, { ...item, favorite: true });
    }
    return !existed;
  };

  public getFavorites = (): NavigationItem[] => {
    return Array.from(this.favorites.values());
  };

  public isFavorite = (id: string): boolean => {
    return this.favorites.has(id);
  };

  public pushHistory = (target: SmartBackTarget): void => {
    this.history.push({ ...target, timestamp: Date.now() });
    if (this.history.length > 50) {
      this.history.shift();
    }
  };

  public smartBack = (): SmartBackTarget | undefined => {
    return this.history.pop();
  };

  public getHistory = (): SmartBackTarget[] => {
    return [...this.history];
  };

  public search = (query: string): NavigationItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matches: NavigationItem[] = [];
    for (const config of this.configs.values()) {
      for (const item of this.flatten(config.items)) {
        const haystack = [item.label, item.id, item.shortcut, ...(item.keywords || [])]
          .join(' ')
          .toLowerCase();
        if (haystack.includes(q)) {
          matches.push(item);
        }
      }
    }
    return matches.slice(0, 12);
  };

  public emitTelemetry = (event: NavigationTelemetryEvent): void => {
    this.telemetry.push(event);
    if (this.telemetry.length > 200) {
      this.telemetry.shift();
    }
  };

  public getTelemetry = (): NavigationTelemetryEvent[] => {
    return [...this.telemetry];
  };

  public static getInstance(): NavigationEngine {
    return NavigationEngine.instance || new NavigationEngine();
  }
}

export const navigationEngine = NavigationEngine.getInstance();
export default navigationEngine;
