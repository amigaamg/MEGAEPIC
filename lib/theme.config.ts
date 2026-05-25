export type AmxDashboardTheme = 'forest' | 'midnight' | 'ivory' | 'slate';

export const AMX_THEME_LIST: { id: AmxDashboardTheme; label: string; accent: string; bg: string }[] = [
  { id: 'forest',   label: 'Forest',   accent: '#0F766E', bg: '#f0f4f8' },
  { id: 'midnight', label: 'Midnight', accent: '#3B82F6', bg: '#0f172a' },
  { id: 'ivory',    label: 'Ivory',    accent: '#E07A5F', bg: '#f5f0e8' },
  { id: 'slate',    label: 'Slate',    accent: '#6366F1', bg: '#f1f5f9' },
];

export interface DashboardThemeVars {
  bg: string; white: string; surface: string; border: string;
  text: string; text2: string; muted: string;
  accent: string; accent2: string; accentDim: string;
  green: string; greenDim: string;
  amber: string; amberDim: string;
  red: string; redDim: string;
  indigo: string; indigoDim: string;
  shadow: string; shadowMd: string; shadowLg: string;
}

export const DASHBOARD_THEMES: Record<AmxDashboardTheme, DashboardThemeVars> = {
  forest: {
    bg: '#f0f4f8', white: '#ffffff', surface: '#ffffff', border: '#e2e9f3',
    text: '#0d1b2a', text2: '#4a5568', muted: '#8fa3bd',
    accent: '#0F766E', accent2: '#0B5E58', accentDim: 'rgba(15,118,110,.09)',
    green: '#0F766E', greenDim: 'rgba(15,118,110,.09)',
    amber: '#f59e0b', amberDim: 'rgba(245,158,11,.09)',
    red: '#e53e3e', redDim: 'rgba(229,62,62,.09)',
    indigo: '#5a67d8', indigoDim: 'rgba(90,103,216,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
  },
  midnight: {
    bg: '#0f172a', white: '#1e293b', surface: '#1e293b', border: '#334155',
    text: '#f1f5f9', text2: '#94a3b8', muted: '#64748b',
    accent: '#3B82F6', accent2: '#2563EB', accentDim: 'rgba(59,130,246,.12)',
    green: '#34d399', greenDim: 'rgba(52,211,153,.12)',
    amber: '#fbbf24', amberDim: 'rgba(251,191,36,.12)',
    red: '#fb7185', redDim: 'rgba(251,113,133,.12)',
    indigo: '#818cf8', indigoDim: 'rgba(129,140,248,.12)',
    shadow: '0 1px 4px rgba(0,0,0,.2)', shadowMd: '0 4px 18px rgba(0,0,0,.3)', shadowLg: '0 16px 48px rgba(0,0,0,.4)',
  },
  ivory: {
    bg: '#f5f0e8', white: '#ffffff', surface: '#ffffff', border: '#e4ddd0',
    text: '#1a1a2e', text2: '#5c5c6e', muted: '#9c9cae',
    accent: '#E07A5F', accent2: '#C96A50', accentDim: 'rgba(224,122,95,.09)',
    green: '#E07A5F', greenDim: 'rgba(224,122,95,.09)',
    amber: '#d97706', amberDim: 'rgba(217,119,6,.09)',
    red: '#e53e3e', redDim: 'rgba(229,62,62,.09)',
    indigo: '#5a67d8', indigoDim: 'rgba(90,103,216,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
  },
  slate: {
    bg: '#f1f5f9', white: '#ffffff', surface: '#ffffff', border: '#e2e8f0',
    text: '#0f172a', text2: '#475569', muted: '#94a3b8',
    accent: '#6366F1', accent2: '#4F46E5', accentDim: 'rgba(99,102,241,.09)',
    green: '#6366F1', greenDim: 'rgba(99,102,241,.09)',
    amber: '#f59e0b', amberDim: 'rgba(245,158,11,.09)',
    red: '#e53e3e', redDim: 'rgba(229,62,62,.09)',
    indigo: '#6366F1', indigoDim: 'rgba(99,102,241,.09)',
    shadow: '0 1px 4px rgba(0,0,0,.06)', shadowMd: '0 4px 18px rgba(0,0,0,.09)', shadowLg: '0 16px 48px rgba(0,0,0,.14)',
  },
};

export function applyDashboardTheme(theme: AmxDashboardTheme) {
  if (typeof document === 'undefined') return;
  const t = DASHBOARD_THEMES[theme];
  if (!t) return;
  const r = document.documentElement.style;
  r.setProperty('--bg', t.bg);
  r.setProperty('--white', t.white);
  r.setProperty('--surface', t.surface);
  r.setProperty('--border', t.border);
  r.setProperty('--text', t.text);
  r.setProperty('--text-2', t.text2);
  r.setProperty('--muted', t.muted);
  r.setProperty('--accent', t.accent);
  r.setProperty('--accent-2', t.accent2);
  r.setProperty('--accent-dim', t.accentDim);
  r.setProperty('--green', t.green);
  r.setProperty('--green-dim', t.greenDim);
  r.setProperty('--amber', t.amber);
  r.setProperty('--amber-dim', t.amberDim);
  r.setProperty('--red', t.red);
  r.setProperty('--red-dim', t.redDim);
  r.setProperty('--indigo', t.indigo);
  r.setProperty('--indigo-dim', t.indigoDim);
  r.setProperty('--shadow', t.shadow);
  r.setProperty('--shadow-md', t.shadowMd);
  r.setProperty('--shadow-lg', t.shadowLg);
}
