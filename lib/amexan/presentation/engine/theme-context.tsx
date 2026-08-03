// AMEXAN Theme Context - Backward-compatible re-export
// Constitutional Principle: Theme is never CSS. Theme is data.
// Single source of truth lives in ./theme-engine (React context) backed by @/lib/design/theme-engine (data).

export { ThemeProvider, useTheme } from './theme-engine';
export type { ThemeContextType } from './theme-engine';
export { default } from './theme-engine';
