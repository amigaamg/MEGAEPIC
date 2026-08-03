// AMEXAN Theme - Research
// Constitutional Principle: Themes change tokens, never reasoning.

import { getThemeTokens } from '../registry/theme-registry';
import type { ThemeTokens } from '../registry/theme-registry';

export const researchTheme = {
  id: 'research' as const,
  name: 'Research',
  light: (): ThemeTokens => getThemeTokens('research', 'light'),
  dark: (): ThemeTokens => getThemeTokens('research', 'dark'),
};
