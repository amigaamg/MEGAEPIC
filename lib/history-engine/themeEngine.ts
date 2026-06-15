// ── THEME ENGINE ──
// Light/dark mode management with CSS variables

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'amexan_theme';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark';
}

export function setStoredTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
}

export function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(mode: ThemeMode): void {
  const theme = getEffectiveTheme(mode);
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// ── CSS Variable Tokens (injected via <style> on app load) ──
export const THEME_STYLES = `
:root {
  --bg-primary: #0b1230;
  --bg-secondary: #071029;
  --bg-card: #0f1839;
  --bg-hover: #1a2550;
  --border: #1e2d5a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent: #14b8a6;
  --accent-hover: #0d9488;
  --accent-dim: rgba(20, 184, 166, 0.15);
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --info: #3b82f6;
  --code-bg: #1a2550;
}

[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #f1f5f9;
  --bg-card: #ffffff;
  --bg-hover: #e2e8f0;
  --border: #cbd5e1;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --accent: #0d9488;
  --accent-hover: #0f766e;
  --accent-dim: rgba(13, 148, 136, 0.1);
  --code-bg: #f1f5f9;
}
`;
