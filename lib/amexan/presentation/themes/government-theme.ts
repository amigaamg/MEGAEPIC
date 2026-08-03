// AMEXAN Theme - Government
// Constitutional Principle: Themes change tokens, never reasoning.

import { getThemeTokens } from '../registry/theme-registry';
import type { ThemeTokens } from '../registry/theme-registry';

export const governmentTheme = {
  id: 'government' as const,
  name: 'Government',
  light: (): ThemeTokens => getThemeTokens('government', 'light'),
  dark: (): ThemeTokens => getThemeTokens('government', 'dark'),
};
