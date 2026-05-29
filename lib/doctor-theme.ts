'use client';

export type AmxDoctorTheme = 'forest' | 'midnight' | 'ivory' | 'slate' | 'ocean' | 'rose';

export const DOCTOR_THEMES: Record<AmxDoctorTheme, {
  id: AmxDoctorTheme;
  label: string;
  icon: string;
  css: string;
}> = {
  forest: {
    id: 'forest',
    label: 'Forest',
    icon: '🌿',
    css: `
      --bg:#f0f4f8; --bg2:#e8edf4; --white:#ffffff; --surface:#ffffff;
      --border:#e2e9f3; --border2:#d0dae8;
      --text:#0d1b2a; --text-2:#4a5568; --text-3:#94a3b8; --muted:#8fa3bd;
      --accent:#0F766E; --accent-2:#0B5E58; --accent-3:#14A89D;
      --accent-dim:rgba(15,118,110,.09); --accent-glow:rgba(15,118,110,.2);
      --green:#0F766E; --green-2:#059669; --green-dim:rgba(15,118,110,.09);
      --amber:#D97706; --amber-2:#F59E0B; --amber-dim:rgba(217,119,6,.09); --amber-glow:rgba(245,158,11,.15);
      --red:#DC2626; --red-2:#EF4444; --red-dim:rgba(220,38,38,.09);
      --indigo:#6366F1; --indigo-dim:rgba(99,102,241,.09);
      --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
      --glow:rgba(15,118,110,.18); --glow-2:rgba(15,118,110,.08);
      --sidebar-bg:#ffffff; --sidebar-border:var(--border);
      --header-bg:rgba(255,255,255,.94);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --hero-from:#0d1b2a; --hero-via:#0c3326; --hero-to:#093d28;
    `,
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    icon: '🌙',
    css: `
      --bg:#0f172a; --bg2:#1e293b; --white:#1e293b; --surface:#1e293b;
      --border:#334155; --border2:#475569;
      --text:#f1f5f9; --text-2:#94a3b8; --text-3:#64748b; --muted:#64748b;
      --accent:#3B82F6; --accent-2:#2563EB; --accent-3:#60A5FA;
      --accent-dim:rgba(59,130,246,.12); --accent-glow:rgba(59,130,246,.25);
      --green:#34d399; --green-2:#10b981; --green-dim:rgba(52,211,153,.12);
      --amber:#FBBF24; --amber-2:#F59E0B; --amber-dim:rgba(251,191,36,.12); --amber-glow:rgba(251,191,36,.2);
      --red:#FB7185; --red-2:#F43F5E; --red-dim:rgba(251,113,133,.12);
      --indigo:#818CF8; --indigo-dim:rgba(129,140,248,.12);
      --shadow:0 1px 4px rgba(0,0,0,.2); --shadow-md:0 4px 18px rgba(0,0,0,.3); --shadow-lg:0 16px 48px rgba(0,0,0,.4);
      --glow:rgba(59,130,246,.35); --glow-2:rgba(59,130,246,.15);
      --sidebar-bg:#1e293b; --sidebar-border:var(--border);
      --header-bg:rgba(30,41,59,.94);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --hero-from:#0d1b2a; --hero-via:#1e293b; --hero-to:#0f172a;
    `,
  },
  ivory: {
    id: 'ivory',
    label: 'Ivory',
    icon: '🕊',
    css: `
      --bg:#f5f0e8; --bg2:#ede7dc; --white:#ffffff; --surface:#ffffff;
      --border:#e4ddd0; --border2:#d6cdbc;
      --text:#1a1a2e; --text-2:#5c5c6e; --text-3:#9c9cae; --muted:#9c9cae;
      --accent:#E07A5F; --accent-2:#C96A50; --accent-3:#F0A88E;
      --accent-dim:rgba(224,122,95,.09); --accent-glow:rgba(224,122,95,.18);
      --green:#C96A50; --green-2:#B85C42; --green-dim:rgba(201,106,80,.09);
      --amber:#D97706; --amber-2:#F59E0B; --amber-dim:rgba(217,119,6,.09); --amber-glow:rgba(245,158,11,.12);
      --red:#DC2626; --red-2:#EF4444; --red-dim:rgba(220,38,38,.09);
      --indigo:#5a67d8; --indigo-dim:rgba(90,103,216,.09);
      --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
      --glow:rgba(224,122,95,.18); --glow-2:rgba(224,122,95,.08);
      --sidebar-bg:#ffffff; --sidebar-border:var(--border);
      --header-bg:rgba(255,255,255,.94);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --hero-from:#1a1a2e; --hero-via:#2d1f1a; --hero-to:#1a1a2e;
    `,
  },
  slate: {
    id: 'slate',
    label: 'Slate',
    icon: '◇',
    css: `
      --bg:#f1f5f9; --bg2:#e2e8f0; --white:#ffffff; --surface:#ffffff;
      --border:#e2e8f0; --border2:#cbd5e1;
      --text:#0f172a; --text-2:#475569; --text-3:#94a3b8; --muted:#94a3b8;
      --accent:#6366F1; --accent-2:#4F46E5; --accent-3:#818CF8;
      --accent-dim:rgba(99,102,241,.09); --accent-glow:rgba(99,102,241,.2);
      --green:#059669; --green-2:#10b981; --green-dim:rgba(5,150,105,.09);
      --amber:#D97706; --amber-2:#F59E0B; --amber-dim:rgba(217,119,6,.09); --amber-glow:rgba(245,158,11,.12);
      --red:#DC2626; --red-2:#EF4444; --red-dim:rgba(220,38,38,.09);
      --indigo:#6366F1; --indigo-dim:rgba(99,102,241,.09);
      --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
      --glow:rgba(99,102,241,.22); --glow-2:rgba(99,102,241,.1);
      --sidebar-bg:#ffffff; --sidebar-border:var(--border);
      --header-bg:rgba(255,255,255,.94);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --hero-from:#0f172a; --hero-via:#1e1b4b; --hero-to:#0f172a;
    `,
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    icon: '🌊',
    css: `
      --bg:#eef2ff; --bg2:#e0e7ff; --white:#ffffff; --surface:#ffffff;
      --border:#c7d2fe; --border2:#a5b4fc;
      --text:#0f172a; --text-2:#4338ca; --text-3:#6366f1; --muted:#818cf8;
      --accent:#4338CA; --accent-2:#3730A3; --accent-3:#6366F1;
      --accent-dim:rgba(67,56,202,.09); --accent-glow:rgba(67,56,202,.18);
      --green:#059669; --green-2:#10b981; --green-dim:rgba(5,150,105,.09);
      --amber:#D97706; --amber-2:#F59E0B; --amber-dim:rgba(217,119,6,.09); --amber-glow:rgba(245,158,11,.12);
      --red:#DC2626; --red-2:#EF4444; --red-dim:rgba(220,38,38,.09);
      --indigo:#4338CA; --indigo-dim:rgba(67,56,202,.09);
      --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
      --glow:rgba(67,56,202,.18); --glow-2:rgba(67,56,202,.08);
      --sidebar-bg:#ffffff; --sidebar-border:var(--border);
      --header-bg:rgba(255,255,255,.94);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --hero-from:#0f172a; --hero-via:#1e1b4b; --hero-to:#0f172a;
    `,
  },
  rose: {
    id: 'rose',
    label: 'Rose',
    icon: '🌹',
    css: `
      --bg:#fff1f2; --bg2:#ffe4e6; --white:#ffffff; --surface:#ffffff;
      --border:#fecdd3; --border2:#fda4af;
      --text:#1a0e0e; --text-2:#881337; --text-3:#be185d; --muted:#e11d48;
      --accent:#BE185D; --accent-2:#9D174D; --accent-3:#DB2777;
      --accent-dim:rgba(190,24,93,.09); --accent-glow:rgba(190,24,93,.18);
      --green:#059669; --green-2:#10b981; --green-dim:rgba(5,150,105,.09);
      --amber:#D97706; --amber-2:#F59E0B; --amber-dim:rgba(217,119,6,.09); --amber-glow:rgba(245,158,11,.12);
      --red:#BE123C; --red-2:#E11D48; --red-dim:rgba(190,18,60,.09);
      --indigo:#7C3AED; --indigo-dim:rgba(124,58,237,.09);
      --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
      --glow:rgba(190,24,93,.18); --glow-2:rgba(190,24,93,.08);
      --sidebar-bg:#ffffff; --sidebar-border:var(--border);
      --header-bg:rgba(255,255,255,.94);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --hero-from:#1a0e0e; --hero-via:#2d0f1a; --hero-to:#1a0e0e;
    `,
  },
};

export const DOCTOR_THEME_LIST = Object.values(DOCTOR_THEMES).map(t => ({
  id: t.id,
  label: t.label,
  icon: t.icon,
}));

const STORAGE_KEY = 'amx-theme';

export function getStoredTheme(): AmxDoctorTheme {
  if (typeof window === 'undefined') return 'forest';
  const v = localStorage.getItem(STORAGE_KEY);
  if (DOCTOR_THEMES[v as AmxDoctorTheme]) return v as AmxDoctorTheme;
  return 'forest';
}

export function applyDoctorTheme(theme: AmxDoctorTheme) {
  if (typeof document === 'undefined') return;
  const t = DOCTOR_THEMES[theme];
  if (!t) return;
  const root = document.documentElement;
  root.style.cssText += t.css;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function initDoctorTheme() {
  const theme = getStoredTheme();
  applyDoctorTheme(theme);
  return theme;
}

// Apply unified theme variables on top for compatibility
export function applyUnifiedThemeVars(theme: AmxDoctorTheme) {
  if (typeof document === 'undefined') return;
  const { applyUnifiedTheme } = require('./unified-theme');
  applyUnifiedTheme(theme);
}
