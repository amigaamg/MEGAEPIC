// AMEXAN Theme - University
// Constitutional Principle: Themes change tokens, never reasoning.

import { getThemeTokens } from '../registry/theme-registry';
import type { ThemeTokens } from '../registry/theme-registry';

export const universityTheme = {
  id: 'university' as const,
  name: 'University',
  light: (): ThemeTokens => getThemeTokens('university', 'light'),
  dark: (): ThemeTokens => getThemeTokens('university', 'dark'),
};
