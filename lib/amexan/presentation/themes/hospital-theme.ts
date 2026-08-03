// AMEXAN Theme - Hospital
// Constitutional Principle: Themes change tokens, never reasoning.

import { getThemeTokens } from '../registry/theme-registry';
import type { ThemeTokens } from '../registry/theme-registry';

export const hospitalTheme = {
  id: 'hospital' as const,
  name: 'Hospital',
  light: (): ThemeTokens => getThemeTokens('hospital', 'light'),
  dark: (): ThemeTokens => getThemeTokens('hospital', 'dark'),
};
