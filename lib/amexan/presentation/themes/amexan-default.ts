// AMEXAN Theme - Default
// Constitutional Principle: The same intelligence. The appropriate interface.

import { getThemeTokens } from '../registry/theme-registry';
import type { ThemeTokens } from '../registry/theme-registry';

export const amexanDefaultTheme = {
  id: 'amexan-default' as const,
  name: 'AMEXAN Default',
  light: (): ThemeTokens => getThemeTokens('amexan-default', 'light'),
  dark: (): ThemeTokens => getThemeTokens('amexan-default', 'dark'),
};
