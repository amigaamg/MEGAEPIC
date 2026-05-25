export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textSub: string;
  textMuted: string;
  accent: string;
  accentBg: string;
  accentText: string;
  danger: string;
  dangerBg: string;
  warn: string;
  warnBg: string;
  success: string;
  successBg: string;
  sidebar: string;
  sidebarBorder: string;
  pill: string;
  pillText: string;
  header: string;
}

export interface ThemeTypography {
  font: string;
  mono: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
}

export const THEMES: Record<string, Theme> = {
  light: {
    id: "light", name: "Light",
    colors: {
      bg: "#f7f8fc", surface: "#ffffff", surfaceAlt: "#f0f2f8",
      border: "#dde1ee", borderStrong: "#c5ccdf",
      text: "#0d1117", textSub: "#1e293b", textMuted: "#475569",
      accent: "#2563eb", accentBg: "rgba(37,99,235,0.08)", accentText: "#1d4ed8",
      danger: "#dc2626", dangerBg: "#fef2f2",
      warn: "#d97706", warnBg: "#fffbeb",
      success: "#059669", successBg: "#f0fdf4",
      sidebar: "#ffffff", sidebarBorder: "#dde1ee",
      pill: "#e8edf5", pillText: "#4a5568",
      header: "#ffffff",
    },
    typography: { font: '"DM Sans", system-ui, sans-serif', mono: '"JetBrains Mono", "Fira Code", monospace' },
  },
  dark: {
    id: "dark", name: "Dark",
    colors: {
      bg: "#0d1117", surface: "#161b22", surfaceAlt: "#1c2333",
      border: "#30363d", borderStrong: "#484f58",
      text: "#e6edf3", textSub: "#8b949e", textMuted: "#484f58",
      accent: "#58a6ff", accentBg: "rgba(88,166,255,0.1)", accentText: "#58a6ff",
      danger: "#f85149", dangerBg: "rgba(248,81,73,0.1)",
      warn: "#e3b341", warnBg: "rgba(227,179,65,0.1)",
      success: "#3fb950", successBg: "rgba(63,185,80,0.1)",
      sidebar: "#161b22", sidebarBorder: "#21262d",
      pill: "#21262d", pillText: "#8b949e",
      header: "#161b22",
    },
    typography: { font: '"DM Sans", system-ui, sans-serif', mono: '"JetBrains Mono", "Fira Code", monospace' },
  },
  ocean: {
    id: "ocean", name: "Ocean",
    colors: {
      bg: "#e8f0fe", surface: "#ffffff", surfaceAlt: "#dbeafe",
      border: "#bfdbfe", borderStrong: "#93c5fd",
      text: "#0c1a3e", textSub: "#0f2640", textMuted: "#1e3a6e",
      accent: "#1d4ed8", accentBg: "rgba(29,78,216,0.1)", accentText: "#1d4ed8",
      danger: "#be123c", dangerBg: "#fff1f2",
      warn: "#b45309", warnBg: "#fffbeb",
      success: "#047857", successBg: "#ecfdf5",
      sidebar: "#dbeafe", sidebarBorder: "#bfdbfe",
      pill: "#dbeafe", pillText: "#1e3a6e",
      header: "#ffffff",
    },
    typography: { font: '"DM Sans", system-ui, sans-serif', mono: '"JetBrains Mono", "Fira Code", monospace' },
  },
  forest: {
    id: "forest", name: "Forest",
    colors: {
      bg: "#f0fdf4", surface: "#ffffff", surfaceAlt: "#dcfce7",
      border: "#bbf7d0", borderStrong: "#86efac",
      text: "#052e16", textSub: "#14532d", textMuted: "#4ade80",
      accent: "#16a34a", accentBg: "rgba(22,163,74,0.1)", accentText: "#15803d",
      danger: "#dc2626", dangerBg: "#fef2f2",
      warn: "#d97706", warnBg: "#fffbeb",
      success: "#047857", successBg: "#ecfdf5",
      sidebar: "#dcfce7", sidebarBorder: "#bbf7d0",
      pill: "#dcfce7", pillText: "#14532d",
      header: "#ffffff",
    },
    typography: { font: '"DM Sans", system-ui, sans-serif', mono: '"JetBrains Mono", "Fira Code", monospace' },
  },
  midnight: {
    id: "midnight", name: "Midnight",
    colors: {
      bg: "#0f172a", surface: "#1e293b", surfaceAlt: "#334155",
      border: "#475569", borderStrong: "#64748b",
      text: "#f1f5f9", textSub: "#cbd5e1", textMuted: "#94a3b8",
      accent: "#38bdf8", accentBg: "rgba(56,189,248,0.15)", accentText: "#38bdf8",
      danger: "#fb7185", dangerBg: "rgba(251,113,133,0.15)",
      warn: "#fbbf24", warnBg: "rgba(251,191,36,0.15)",
      success: "#34d399", successBg: "rgba(52,211,153,0.15)",
      sidebar: "#1e293b", sidebarBorder: "#334155",
      pill: "#334155", pillText: "#cbd5e1",
      header: "#1e293b",
    },
    typography: { font: '"Inter", system-ui, sans-serif', mono: '"JetBrains Mono", monospace' },
  },
  highcontrast: {
    id: "highcontrast", name: "High Contrast",
    colors: {
      bg: "#ffffff", surface: "#ffffff", surfaceAlt: "#f0f0f0",
      border: "#000000", borderStrong: "#000000",
      text: "#000000", textSub: "#1a1a1a", textMuted: "#333333",
      accent: "#0044cc", accentBg: "rgba(0,68,204,0.1)", accentText: "#0044cc",
      danger: "#cc0000", dangerBg: "#fff0f0",
      warn: "#cc6600", warnBg: "#fff8f0",
      success: "#006600", successBg: "#f0fff0",
      sidebar: "#ffffff", sidebarBorder: "#000000",
      pill: "#e0e0e0", pillText: "#000000",
      header: "#ffffff",
    },
    typography: { font: '"DM Sans", system-ui, sans-serif', mono: '"JetBrains Mono", "Fira Code", monospace' },
  },
};
