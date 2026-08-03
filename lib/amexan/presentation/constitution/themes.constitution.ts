// AMEXAN Presentation Constitution - Themes
// Version 1.0 (Frozen)
// Constitutional Principle: Theme is never CSS. Theme is data. Hospitals customize branding without editing components.

export const themesConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Theme is never CSS. Theme is data.',
};

export const themeSections = [
  'identity',
  'logo',
  'brand',
  'palette',
  'typography',
  'spacing',
  'corners',
  'elevation',
  'icons',
  'illustrations',
  'charts',
  'status_colors',
  'navigation',
  'footer',
  'tables',
  'forms',
  'animations',
  'motion',
  'accessibility_overrides',
] as const;

export type ThemeSection = (typeof themeSections)[number];

export interface ThemeDocument {
  id: string
  name: string
  base?: string
  sections: Partial<Record<ThemeSection, unknown>>
  overrides?: Record<string, string>
}

export const customizationLevels = {
  0: 'AMEXAN default',
  1: 'country',
  2: 'hospital',
  3: 'department',
  4: 'role',
  5: 'individual',
} as const;

export type CustomizationLevel = keyof typeof customizationLevels;

export const baseThemeId = 'amexan-base-theme';

export function isThemeInheritanceValid(theme: ThemeDocument, knownBaseIds: string[]): boolean {
  return !theme.base || knownBaseIds.includes(theme.base);
}

export const whiteLabelGuarantees = {
  noComponentEdits: true,
  noForkRequired: true,
  themeAsData: true,
  inheritance: true,
} as const;
