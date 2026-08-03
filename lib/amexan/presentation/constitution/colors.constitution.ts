// AMEXAN Presentation Constitution - Colors
// Version 1.0 (Frozen)
// Constitutional Principle: No page chooses colors. Pages choose semantic meaning.
// Semantic colors inherit from the color-constitution engine. Brand colors are data, never inline hex.

import { SEMANTIC_COLORS } from '../color-constitution';
import type { SemanticColor } from '../types';

export const colorConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'No page chooses colors. Pages choose semantic meaning.',
};

export const semanticColorNames: SemanticColor[] = [
  'info',
  'normal',
  'attention',
  'warning',
  'critical',
  'education',
  'inactive',
];

export const colorRoles = {
  primary: 'info',
  secondary: 'normal',
  accent: 'education',
  success: 'normal',
  warning: 'warning',
  danger: 'critical',
  info: 'info',
  muted: 'inactive',
} as const;

export type ColorRole = keyof typeof colorRoles;

export interface BrandColorSet {
  primary: string
  primaryHover: string
  primarySoft: string
  primarySurface: string
  secondary: string
  accent: string
  danger: string
  warning: string
  success: string
  info: string
  background: string
  surface: string
  border: string
  muted: string
  heading: string
  paragraph: string
  disabled: string
}

export const semanticColorPalette: Record<SemanticColor, { base: string; contrast: string; bg: string }> = {
  info: { base: SEMANTIC_COLORS.info.base, contrast: SEMANTIC_COLORS.info.contrast, bg: SEMANTIC_COLORS.info.bg },
  normal: { base: SEMANTIC_COLORS.normal.base, contrast: SEMANTIC_COLORS.normal.contrast, bg: SEMANTIC_COLORS.normal.bg },
  attention: { base: SEMANTIC_COLORS.attention.base, contrast: SEMANTIC_COLORS.attention.contrast, bg: SEMANTIC_COLORS.attention.bg },
  warning: { base: SEMANTIC_COLORS.warning.base, contrast: SEMANTIC_COLORS.warning.contrast, bg: SEMANTIC_COLORS.warning.bg },
  critical: { base: SEMANTIC_COLORS.critical.base, contrast: SEMANTIC_COLORS.critical.contrast, bg: SEMANTIC_COLORS.critical.bg },
  education: { base: SEMANTIC_COLORS.education.base, contrast: SEMANTIC_COLORS.education.contrast, bg: SEMANTIC_COLORS.education.bg },
  inactive: { base: SEMANTIC_COLORS.inactive.base, contrast: SEMANTIC_COLORS.inactive.contrast, bg: SEMANTIC_COLORS.inactive.bg },
};

// The AMEXAN Base Theme palette. Hospitals inherit this and override only their own tokens.
export const baseColorTokens: BrandColorSet = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primarySoft: '#3b82f6',
  primarySurface: '#eff6ff',
  secondary: '#0e7490',
  accent: '#7c3aed',
  danger: '#dc2626',
  warning: '#f59e0b',
  success: '#16a34a',
  info: '#0ea5e9',
  background: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  muted: '#64748b',
  heading: '#0f172a',
  paragraph: '#334155',
  disabled: '#cbd5e1',
};

export const getBrandColor = (role: ColorRole, scheme: 'light' | 'dark'): string => {
  const semantic = colorRoles[role];
  const palette = semanticColorPalette[semantic];
  if (scheme === 'dark') {
    const overrides: Partial<Record<SemanticColor, string>> = {
      info: '#60a5fa',
      normal: '#4ade80',
      attention: '#fbbf24',
      warning: '#fb923c',
      critical: '#f87171',
      education: '#a78bfa',
      inactive: '#94a3b8',
    };
    return overrides[semantic] ?? palette.base;
  }
  return palette.base;
};
