'use client';

export type UnifiedThemeId = 'forest' | 'midnight' | 'ivory' | 'slate' | 'ocean' | 'rose' | 'light' | 'dark' | 'highcontrast';

export interface UnifiedThemeVars {
  bg: string; bg2: string; white: string; surface: string;
  border: string; border2: string;
  text: string; text2: string; text3: string; muted: string;
  accent: string; accent2: string; accent3: string;
  accentDim: string; accentGlow: string;
  green: string; green2: string; greenDim: string;
  amber: string; amber2: string; amberDim: string; amberGlow: string;
  red: string; red2: string; redDim: string;
  indigo: string; indigoDim: string;
  shadow: string; shadowMd: string; shadowLg: string;
  glow: string; glow2: string;
  sidebarBg: string; sidebarBorder: string;
  headerBg: string;
}

const THEMES: Record<string, UnifiedThemeVars> = {
  forest: {
    bg: '#f0f4f8', bg2: '#e8edf4', white: '#ffffff', surface: '#ffffff',
    border: '#e2e9f3', border2: '#d0dae8',
    text: '#0d1b2a', text2: '#4a5568', text3: '#94a3b8', muted: '#8fa3bd',
    accent: '#0F766E', accent2: '#0B5E58', accent3: '#14A89D',
    accentDim: 'rgba(15,118,110,.09)', accentGlow: 'rgba(15,118,110,.2)',
    green: '#0F766E', green2: '#059669', greenDim: 'rgba(15,118,110,.09)',
    amber: '#D97706', amber2: '#F59E0B', amberDim: 'rgba(217,119,6,.09)', amberGlow: 'rgba(245,158,11,.15)',
    red: '#DC2626', red2: '#EF4444', redDim: 'rgba(220,38,38,.09)',
    indigo: '#6366F1', indigoDim: 'rgba(99,102,241,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
    glow: 'rgba(15,118,110,.18)', glow2: 'rgba(15,118,110,.08)',
    sidebarBg: '#ffffff', sidebarBorder: '#e2e9f3',
    headerBg: 'rgba(255,255,255,.94)',
  },
  midnight: {
    bg: '#0f172a', bg2: '#1e293b', white: '#1e293b', surface: '#1e293b',
    border: '#334155', border2: '#475569',
    text: '#f1f5f9', text2: '#94a3b8', text3: '#64748b', muted: '#64748b',
    accent: '#3B82F6', accent2: '#2563EB', accent3: '#60A5FA',
    accentDim: 'rgba(59,130,246,.12)', accentGlow: 'rgba(59,130,246,.25)',
    green: '#34d399', green2: '#10b981', greenDim: 'rgba(52,211,153,.12)',
    amber: '#FBBF24', amber2: '#F59E0B', amberDim: 'rgba(251,191,36,.12)', amberGlow: 'rgba(251,191,36,.2)',
    red: '#FB7185', red2: '#F43F5E', redDim: 'rgba(251,113,133,.12)',
    indigo: '#818CF8', indigoDim: 'rgba(129,140,248,.12)',
    shadow: '0 1px 4px rgba(0,0,0,.2)', shadowMd: '0 4px 18px rgba(0,0,0,.3)', shadowLg: '0 16px 48px rgba(0,0,0,.4)',
    glow: 'rgba(59,130,246,.35)', glow2: 'rgba(59,130,246,.15)',
    sidebarBg: '#1e293b', sidebarBorder: '#334155',
    headerBg: 'rgba(30,41,59,.94)',
  },
  ivory: {
    bg: '#f5f0e8', bg2: '#ede7dc', white: '#ffffff', surface: '#ffffff',
    border: '#e4ddd0', border2: '#d6cdbc',
    text: '#1a1a2e', text2: '#5c5c6e', text3: '#9c9cae', muted: '#9c9cae',
    accent: '#E07A5F', accent2: '#C96A50', accent3: '#F0A88E',
    accentDim: 'rgba(224,122,95,.09)', accentGlow: 'rgba(224,122,95,.18)',
    green: '#C96A50', green2: '#B85C42', greenDim: 'rgba(201,106,80,.09)',
    amber: '#D97706', amber2: '#F59E0B', amberDim: 'rgba(217,119,6,.09)', amberGlow: 'rgba(245,158,11,.12)',
    red: '#DC2626', red2: '#EF4444', redDim: 'rgba(220,38,38,.09)',
    indigo: '#5a67d8', indigoDim: 'rgba(90,103,216,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
    glow: 'rgba(224,122,95,.18)', glow2: 'rgba(224,122,95,.08)',
    sidebarBg: '#ffffff', sidebarBorder: '#e4ddd0',
    headerBg: 'rgba(255,255,255,.94)',
  },
  slate: {
    bg: '#f1f5f9', bg2: '#e2e8f0', white: '#ffffff', surface: '#ffffff',
    border: '#e2e8f0', border2: '#cbd5e1',
    text: '#0f172a', text2: '#475569', text3: '#94a3b8', muted: '#94a3b8',
    accent: '#6366F1', accent2: '#4F46E5', accent3: '#818CF8',
    accentDim: 'rgba(99,102,241,.09)', accentGlow: 'rgba(99,102,241,.2)',
    green: '#059669', green2: '#10b981', greenDim: 'rgba(5,150,105,.09)',
    amber: '#D97706', amber2: '#F59E0B', amberDim: 'rgba(217,119,6,.09)', amberGlow: 'rgba(245,158,11,.12)',
    red: '#DC2626', red2: '#EF4444', redDim: 'rgba(220,38,38,.09)',
    indigo: '#6366F1', indigoDim: 'rgba(99,102,241,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
    glow: 'rgba(99,102,241,.22)', glow2: 'rgba(99,102,241,.1)',
    sidebarBg: '#ffffff', sidebarBorder: '#e2e8f0',
    headerBg: 'rgba(255,255,255,.94)',
  },
  ocean: {
    bg: '#eef2ff', bg2: '#e0e7ff', white: '#ffffff', surface: '#ffffff',
    border: '#c7d2fe', border2: '#a5b4fc',
    text: '#0f172a', text2: '#4338ca', text3: '#6366f1', muted: '#818cf8',
    accent: '#4338CA', accent2: '#3730A3', accent3: '#6366F1',
    accentDim: 'rgba(67,56,202,.09)', accentGlow: 'rgba(67,56,202,.18)',
    green: '#059669', green2: '#10b981', greenDim: 'rgba(5,150,105,.09)',
    amber: '#D97706', amber2: '#F59E0B', amberDim: 'rgba(217,119,6,.09)', amberGlow: 'rgba(245,158,11,.12)',
    red: '#DC2626', red2: '#EF4444', redDim: 'rgba(220,38,38,.09)',
    indigo: '#4338CA', indigoDim: 'rgba(67,56,202,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
    glow: 'rgba(67,56,202,.18)', glow2: 'rgba(67,56,202,.08)',
    sidebarBg: '#ffffff', sidebarBorder: '#c7d2fe',
    headerBg: 'rgba(255,255,255,.94)',
  },
  rose: {
    bg: '#fff1f2', bg2: '#ffe4e6', white: '#ffffff', surface: '#ffffff',
    border: '#fecdd3', border2: '#fda4af',
    text: '#1a0e0e', text2: '#881337', text3: '#be185d', muted: '#e11d48',
    accent: '#BE185D', accent2: '#9D174D', accent3: '#DB2777',
    accentDim: 'rgba(190,24,93,.09)', accentGlow: 'rgba(190,24,93,.18)',
    green: '#059669', green2: '#10b981', greenDim: 'rgba(5,150,105,.09)',
    amber: '#D97706', amber2: '#F59E0B', amberDim: 'rgba(217,119,6,.09)', amberGlow: 'rgba(245,158,11,.12)',
    red: '#BE123C', red2: '#E11D48', redDim: 'rgba(190,18,60,.09)',
    indigo: '#7C3AED', indigoDim: 'rgba(124,58,237,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
    glow: 'rgba(190,24,93,.18)', glow2: 'rgba(190,24,93,.08)',
    sidebarBg: '#ffffff', sidebarBorder: '#fecdd3',
    headerBg: 'rgba(255,255,255,.94)',
  },
  light: {
    bg: '#f7f8fc', bg2: '#f0f2f8', white: '#ffffff', surface: '#ffffff',
    border: '#dde1ee', border2: '#c5ccdf',
    text: '#0d1117', text2: '#1e293b', text3: '#475569', muted: '#475569',
    accent: '#2563eb', accent2: '#1d4ed8', accent3: '#3b82f6',
    accentDim: 'rgba(37,99,235,0.08)', accentGlow: 'rgba(37,99,235,0.18)',
    green: '#059669', green2: '#10b981', greenDim: 'rgba(5,150,105,.09)',
    amber: '#D97706', amber2: '#F59E0B', amberDim: 'rgba(217,119,6,.09)', amberGlow: 'rgba(245,158,11,.12)',
    red: '#DC2626', red2: '#EF4444', redDim: 'rgba(220,38,38,.09)',
    indigo: '#6366F1', indigoDim: 'rgba(99,102,241,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
    glow: 'rgba(37,99,235,0.18)', glow2: 'rgba(37,99,235,0.08)',
    sidebarBg: '#ffffff', sidebarBorder: '#dde1ee',
    headerBg: 'rgba(255,255,255,.94)',
  },
  dark: {
    bg: '#0d1117', bg2: '#161b22', white: '#161b22', surface: '#161b22',
    border: '#30363d', border2: '#484f58',
    text: '#e6edf3', text2: '#8b949e', text3: '#484f58', muted: '#484f58',
    accent: '#58a6ff', accent2: '#1f6feb', accent3: '#79c0ff',
    accentDim: 'rgba(88,166,255,0.1)', accentGlow: 'rgba(88,166,255,0.2)',
    green: '#3fb950', green2: '#2ea043', greenDim: 'rgba(63,185,80,0.1)',
    amber: '#e3b341', amber2: '#d29922', amberDim: 'rgba(227,179,65,0.1)', amberGlow: 'rgba(227,179,65,0.15)',
    red: '#f85149', red2: '#da3633', redDim: 'rgba(248,81,73,0.1)',
    indigo: '#818CF8', indigoDim: 'rgba(129,140,248,0.1)',
    shadow: '0 1px 4px rgba(0,0,0,.3)', shadowMd: '0 4px 18px rgba(0,0,0,.4)', shadowLg: '0 16px 48px rgba(0,0,0,.5)',
    glow: 'rgba(88,166,255,0.3)', glow2: 'rgba(88,166,255,0.15)',
    sidebarBg: '#161b22', sidebarBorder: '#30363d',
    headerBg: 'rgba(22,27,34,.94)',
  },
  highcontrast: {
    bg: '#ffffff', bg2: '#f0f0f0', white: '#ffffff', surface: '#ffffff',
    border: '#000000', border2: '#333333',
    text: '#000000', text2: '#1a1a1a', text3: '#333333', muted: '#333333',
    accent: '#0044cc', accent2: '#0033a0', accent3: '#0055ee',
    accentDim: 'rgba(0,68,204,0.1)', accentGlow: 'rgba(0,68,204,0.2)',
    green: '#006600', green2: '#008800', greenDim: 'rgba(0,102,0,0.1)',
    amber: '#cc6600', amber2: '#ee7700', amberDim: 'rgba(204,102,0,0.1)', amberGlow: 'rgba(204,102,0,0.15)',
    red: '#cc0000', red2: '#ee0000', redDim: 'rgba(204,0,0,0.1)',
    indigo: '#0000cc', indigoDim: 'rgba(0,0,204,0.1)',
    shadow: '0 1px 4px rgba(0,0,0,.1)', shadowMd: '0 4px 18px rgba(0,0,0,.15)', shadowLg: '0 16px 48px rgba(0,0,0,.2)',
    glow: 'rgba(0,68,204,0.2)', glow2: 'rgba(0,68,204,0.1)',
    sidebarBg: '#ffffff', sidebarBorder: '#000000',
    headerBg: 'rgba(255,255,255,.94)',
  },
};

export const UNIFIED_THEME_LIST = Object.entries(THEMES).map(([id, t]) => ({
  id, name: id.charAt(0).toUpperCase() + id.slice(1),
  accent: t.accent, bg: t.bg,
}));

const CANONICAL_VARS = [
  ['--bg', 'bg'], ['--bg2', 'bg2'], ['--white', 'white'], ['--surface', 'surface'],
  ['--border', 'border'], ['--border2', 'border2'],
  ['--text', 'text'], ['--text-2', 'text2'], ['--text-3', 'text3'], ['--muted', 'muted'],
  ['--accent', 'accent'], ['--accent-2', 'accent2'], ['--accent-3', 'accent3'],
  ['--accent-dim', 'accentDim'], ['--accent-glow', 'accentGlow'],
  ['--green', 'green'], ['--green-2', 'green2'], ['--green-dim', 'greenDim'],
  ['--amber', 'amber'], ['--amber-2', 'amber2'], ['--amber-dim', 'amberDim'], ['--amber-glow', 'amberGlow'],
  ['--red', 'red'], ['--red-2', 'red2'], ['--red-dim', 'redDim'],
  ['--indigo', 'indigo'], ['--indigo-dim', 'indigoDim'],
  ['--shadow', 'shadow'], ['--shadow-md', 'shadowMd'], ['--shadow-lg', 'shadowLg'],
  ['--glow', 'glow'], ['--glow-2', 'glow2'],
  ['--sidebar-bg', 'sidebarBg'], ['--sidebar-border', 'sidebarBorder'],
  ['--header-bg', 'headerBg'],
] as const;

export function applyUnifiedTheme(theme: UnifiedThemeId) {
  if (typeof document === 'undefined') return;
  const vars = THEMES[theme];
  if (!vars) return;
  const root = document.documentElement;
  CANONICAL_VARS.forEach(([cssVar, key]) => {
    root.style.setProperty(cssVar, (vars as any)[key]);
  });
  root.style.setProperty('--hero-from', vars.text);
  root.style.setProperty('--hero-via', vars.bg2);
  root.style.setProperty('--hero-to', vars.bg);
  localStorage.setItem('amx-theme', theme);
}

export function getStoredUnifiedTheme(): UnifiedThemeId {
  if (typeof window === 'undefined') return 'forest';
  const stored = localStorage.getItem('amx-theme');
  if (stored && THEMES[stored]) return stored as UnifiedThemeId;
  return 'forest';
}

export function initUnifiedTheme() {
  const t = getStoredUnifiedTheme();
  applyUnifiedTheme(t);
  return t;
}
