// AMEXAN Presentation Engine - Branding Engine
// Constitutional Principle: No hardcoded values. Everything token driven.
// The engine computes the theme surface for a given identity, role, and device.

import type { SemanticColor, DeviceInfo } from '../types';
import { getThemeTokens, getTheme, themeIsWhiteLabelSafe, generateThemeCssVariables } from '../registry/theme-registry';
import type { ThemeId } from '../registry/theme-registry';
import { getColor } from '../color-constitution';
import { getBrandColor } from '../constitution/colors.constitution';
import type { ColorRole } from '../constitution/colors.constitution';

export interface BrandSurface {
  themeId: ThemeId;
  brandName: string;
  tokens: ReturnType<typeof getThemeTokens>;
  cssVariables: Record<string, string>;
  semanticColor: (semantic: SemanticColor, variant?: 'base' | 'light' | 'dark' | 'contrast' | 'bg' | 'border' | 'hover') => string;
  brandColor: (role: ColorRole, scheme?: 'light' | 'dark') => string;
  whiteLabelSafe: boolean;
  density: 'comfortable' | 'compact' | 'spacious';
  iconStroke: number;
}

export interface BrandRequest {
  themeId: ThemeId;
  device: DeviceInfo;
  mode?: 'light' | 'dark';
  brandName?: string;
}

export function computeBrandSurface(request: BrandRequest): BrandSurface {
  const mode = request.mode ?? request.device.colorScheme;
  const theme = getTheme(request.themeId);
  const tokens = getThemeTokens(request.themeId, mode);
  return {
    themeId: request.themeId,
    brandName: request.brandName ?? theme.brandName,
    tokens,
    cssVariables: generateThemeCssVariables(request.themeId, mode),
    semanticColor: (semantic, variant) => getColor(semantic, request.device, variant),
    brandColor: (role, scheme) => getBrandColor(role, scheme ?? mode),
    whiteLabelSafe: themeIsWhiteLabelSafe(request.themeId),
    density: tokens.density,
    iconStroke: tokens.iconStroke,
  };
}

export function brandIsWhiteLabelSafe(surface: BrandSurface): boolean {
  return surface.whiteLabelSafe;
}

export function effectiveTheme(identity: { organizationType?: 'hospital' | 'university' | 'research' | 'government'; themePreference?: ThemeId }): ThemeId {
  if (identity.themePreference) return identity.themePreference;
  const byOrg: Record<string, ThemeId> = {
    hospital: 'hospital',
    university: 'university',
    research: 'research',
    government: 'government',
  };
  return byOrg[identity.organizationType ?? ''] ?? 'amexan-default';
}

export const brandingEngine = {
  surface: computeBrandSurface,
  whiteLabelSafe: brandIsWhiteLabelSafe,
  effective: effectiveTheme,
};

export type BrandingEngine = typeof brandingEngine;
