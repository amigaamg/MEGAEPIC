// AMEXAN Presentation Registry - Theme Registry
// Constitutional Principle: Themes change tokens, never reasoning.
// White-label responsiveness: theme must never affect responsiveness.

import type { SemanticColor } from '../types';

export type ThemeId = 'amexan-default' | 'hospital' | 'university' | 'research' | 'government';

export interface ThemeTokens {
  colors: Record<'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'muted' | 'border', string>;
  semantics: Record<SemanticColor, string>;
  radius: { button: number; card: number; dialog: number; input: number; badge: number };
  spacingBase: number;
  typography: { sans: string; mono: string };
  motion: { fast: number; normal: number; slow: number };
  elevation: { none: string; low: string; medium: string; high: string; floating: string };
  density: 'comfortable' | 'compact' | 'spacious';
  iconStroke: number;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  brandName: string;
  description: string;
  light: ThemeTokens;
  dark: ThemeTokens;
  inherits?: ThemeId;
}

const AMEXAN_BLUE = '#2F80ED';

const defaultLight: ThemeTokens = {
  colors: {
    primary: AMEXAN_BLUE,
    secondary: '#FFFFFF',
    accent: AMEXAN_BLUE,
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    muted: '#94A3B8',
    border: '#E2E8F0',
  },
  semantics: {
    info: AMEXAN_BLUE,
    normal: '#22C55E',
    attention: '#EAB308',
    warning: '#F97316',
    critical: '#EF4444',
    education: '#7C3AED',
    inactive: '#94A3B8',
  },
  radius: { button: 16, card: 20, dialog: 24, input: 14, badge: 999 },
  spacingBase: 8,
  typography: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  motion: { fast: 100, normal: 200, slow: 500 },
  elevation: {
    none: 'none',
    low: '0 1px 2px rgba(15, 23, 42, 0.06)',
    medium: '0 8px 24px rgba(15, 23, 42, 0.08)',
    high: '0 16px 48px rgba(15, 23, 42, 0.12)',
    floating: '0 24px 80px rgba(15, 23, 42, 0.18)',
  },
  density: 'comfortable',
  iconStroke: 1.5,
};

const defaultDark: ThemeTokens = {
  colors: {
    primary: '#60A5FA',
    secondary: '#0B1424',
    accent: '#38BDF8',
    background: '#0B1424',
    surface: '#101C30',
    text: '#F1F5F9',
    muted: '#64748B',
    border: 'rgba(255, 255, 255, 0.10)',
  },
  semantics: {
    info: '#60A5FA',
    normal: '#4ADE80',
    attention: '#FBBF24',
    warning: '#FB923C',
    critical: '#F87171',
    education: '#A78BFA',
    inactive: '#94A3B8',
  },
  radius: { button: 16, card: 20, dialog: 24, input: 14, badge: 999 },
  spacingBase: 8,
  typography: { sans: 'Inter, system-ui, sans-serif', mono: 'JetBrains Mono, monospace' },
  motion: { fast: 100, normal: 200, slow: 500 },
  elevation: {
    none: 'none',
    low: '0 1px 2px rgba(0, 0, 0, 0.40)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.45)',
    high: '0 16px 48px rgba(0, 0, 0, 0.50)',
    floating: '0 24px 80px rgba(0, 0, 0, 0.60)',
  },
  density: 'comfortable',
  iconStroke: 1.5,
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'amexan-default': {
    id: 'amexan-default', name: 'AMEXAN Default', brandName: 'AMEXAN',
    description: 'The canonical AMEXAN clinical operating system theme.',
    light: defaultLight, dark: defaultDark,
  },
  hospital: {
    id: 'hospital', name: 'Hospital', brandName: 'Hospital',
    description: 'Hospital brand palette. Reasoning unchanged.',
    light: { ...defaultLight, colors: { ...defaultLight.colors, primary: AMEXAN_BLUE, accent: AMEXAN_BLUE }, semantics: { ...defaultLight.semantics, info: AMEXAN_BLUE } },
    dark: { ...defaultDark, colors: { ...defaultDark.colors, primary: '#60A5FA', accent: '#60A5FA' }, semantics: { ...defaultDark.semantics, info: '#60A5FA' } },
    inherits: 'amexan-default',
  },
  university: {
    id: 'university', name: 'University', brandName: 'University',
    description: 'Academic institution theme.',
    light: { ...defaultLight, colors: { ...defaultLight.colors, primary: '#7C3AED', accent: '#6D28D9' }, semantics: { ...defaultLight.semantics, info: '#7C3AED' } },
    dark: { ...defaultDark, colors: { ...defaultDark.colors, primary: '#A78BFA', accent: '#8B5CF6' }, semantics: { ...defaultDark.semantics, info: '#A78BFA' } },
    inherits: 'amexan-default',
  },
  research: {
    id: 'research', name: 'Research', brandName: 'Research',
    description: 'Research institute theme.',
    light: { ...defaultLight, colors: { ...defaultLight.colors, primary: '#6366F1', accent: '#4F46E5' }, semantics: { ...defaultLight.semantics, info: '#6366F1' } },
    dark: { ...defaultDark, colors: { ...defaultDark.colors, primary: '#A5B4FC', accent: '#818CF8' }, semantics: { ...defaultDark.semantics, info: '#A5B4FC' } },
    inherits: 'amexan-default',
  },
  government: {
    id: 'government', name: 'Government', brandName: 'Government',
    description: 'Public sector theme.',
    light: { ...defaultLight, colors: { ...defaultLight.colors, primary: '#0F766E', accent: '#115E59' }, semantics: { ...defaultLight.semantics, info: '#0F766E' } },
    dark: { ...defaultDark, colors: { ...defaultDark.colors, primary: '#5EEAD4', accent: '#2DD4BF' }, semantics: { ...defaultDark.semantics, info: '#5EEAD4' } },
    inherits: 'amexan-default',
  },
};

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES[id];
}

export function getThemeTokens(id: ThemeId, mode: 'light' | 'dark'): ThemeTokens {
  const theme = THEMES[id];
  return mode === 'dark' ? theme.dark : theme.light;
}

export function listThemes(): ThemeDefinition[] {
  return Object.values(THEMES);
}

export function themeIsWhiteLabelSafe(id: ThemeId): boolean {
  const theme = THEMES[id];
  const base = THEMES['amexan-default'];
  const radiusSame =
    theme.light.radius.button === base.light.radius.button &&
    theme.light.radius.card === base.light.radius.card &&
    theme.light.radius.input === base.light.radius.input;
  const spacingSame = theme.light.spacingBase === base.light.spacingBase;
  const motionSame = theme.light.motion.normal === base.light.motion.normal;
  return radiusSame && spacingSame && motionSame;
}

export function generateThemeCssVariables(id: ThemeId, mode: 'light' | 'dark'): Record<string, string> {
  const t = getThemeTokens(id, mode);
  return {
    '--brand-primary': t.colors.primary,
    '--brand-secondary': t.colors.secondary,
    '--brand-accent': t.colors.accent,
    '--color-background': t.colors.background,
    '--color-surface': t.colors.surface,
    '--color-text': t.colors.text,
    '--color-muted': t.colors.muted,
    '--color-border': t.colors.border,
    '--meaning-info': t.semantics.info,
    '--meaning-normal': t.semantics.normal,
    '--meaning-attention': t.semantics.attention,
    '--meaning-warning': t.semantics.warning,
    '--meaning-critical': t.semantics.critical,
    '--meaning-education': t.semantics.education,
    '--meaning-inactive': t.semantics.inactive,
    '--radius-button': `${t.radius.button}px`,
    '--radius-card': `${t.radius.card}px`,
    '--radius-dialog': `${t.radius.dialog}px`,
    '--radius-input': `${t.radius.input}px`,
    '--radius-badge': `${t.radius.badge}px`,
    '--font-sans': t.typography.sans,
    '--font-mono': t.typography.mono,
    '--motion-fast': `${t.motion.fast}ms`,
    '--motion-normal': `${t.motion.normal}ms`,
    '--motion-slow': `${t.motion.slow}ms`,
    '--shadow-none': t.elevation.none,
    '--shadow-low': t.elevation.low,
    '--shadow-medium': t.elevation.medium,
    '--shadow-high': t.elevation.high,
    '--shadow-floating': t.elevation.floating,
    '--density': t.density,
    '--icon-stroke': String(t.iconStroke),
  };
}

export const themeRegistry = {
  get: getTheme,
  tokens: getThemeTokens,
  list: listThemes,
  whiteLabelSafe: themeIsWhiteLabelSafe,
  css: generateThemeCssVariables,
};

export type ThemeRegistry = typeof themeRegistry;
