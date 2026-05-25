export type PatientTheme = 'teal' | 'purple' | 'blue' | 'emerald' | 'rose' | 'amber' | 'light' | 'light-teal' | 'light-blue' | 'light-purple' | 'light-amber';

export interface PatientThemeDef {
  id: PatientTheme;
  label: string;
  icon: string;
  css: string;
  mode: 'dark' | 'light';
}

const PATIENT_THEMES: Record<PatientTheme, PatientThemeDef> = {
  teal: {
    id: 'teal', label: 'Teal', icon: '🩺', mode: 'dark',
    css: `--bg:#0b0f1a;--surface:#111827;--surface2:#1a2338;--surface3:#1e2a3d;--border:#243047;--border2:#2d3f58;--text:#e8edf5;--text2:#8b9bbf;--muted:#546382;--accent:#00e5cc;--accent2:#7c5af5;--accent3:#3b82f6;--green:#00d68f;--amber:#ffb020;--red:#ff4560;--shadow:0 1px 4px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2);--shadow-md:0 4px 20px rgba(0,0,0,0.4);--shadow-lg:0 16px 48px rgba(0,0,0,0.5)`,
  },
  purple: {
    id: 'purple', label: 'Purple', icon: '💜', mode: 'dark',
    css: `--bg:#0d0a1a;--surface:#15102a;--surface2:#1f1840;--surface3:#2a2055;--border:#2d2450;--border2:#3f3268;--text:#eae6f5;--text2:#9d8fc4;--muted:#6b5d94;--accent:#a78bfa;--accent2:#c084fc;--accent3:#818cf8;--green:#34d399;--amber:#fbbf24;--red:#fb7185;--shadow:0 1px 4px rgba(0,0,0,0.4),0 1px 2px rgba(0,0,0,0.3);--shadow-md:0 4px 20px rgba(0,0,0,0.5);--shadow-lg:0 16px 48px rgba(0,0,0,0.6)`,
  },
  blue: {
    id: 'blue', label: 'Blue', icon: '💙', mode: 'dark',
    css: `--bg:#0a1428;--surface:#0f1f3d;--surface2:#162952;--surface3:#1c3368;--border:#1f3a70;--border2:#295092;--text:#e0ecff;--text2:#8aadde;--muted:#5578aa;--accent:#60a5fa;--accent2:#38bdf8;--accent3:#818cf8;--green:#34d399;--amber:#fbbf24;--red:#f87171;--shadow:0 1px 4px rgba(0,0,0,0.4),0 1px 2px rgba(0,0,0,0.3);--shadow-md:0 4px 20px rgba(0,0,0,0.5);--shadow-lg:0 16px 48px rgba(0,0,0,0.6)`,
  },
  emerald: {
    id: 'emerald', label: 'Emerald', icon: '💚', mode: 'dark',
    css: `--bg:#091a12;--surface:#0f2a1e;--surface2:#153d2b;--surface3:#1a4f37;--border:#1d543c;--border2:#276e4f;--text:#e0f5ec;--text2:#80c0a4;--muted:#4f9a7a;--accent:#34d399;--accent2:#2dd4bf;--accent3:#22d3ee;--green:#34d399;--amber:#fbbf24;--red:#f87171;--shadow:0 1px 4px rgba(0,0,0,0.4),0 1px 2px rgba(0,0,0,0.3);--shadow-md:0 4px 20px rgba(0,0,0,0.5);--shadow-lg:0 16px 48px rgba(0,0,0,0.6)`,
  },
  rose: {
    id: 'rose', label: 'Rose', icon: '🌹', mode: 'dark',
    css: `--bg:#1a0d12;--surface:#2a1520;--surface2:#3d1c2e;--surface3:#4f233c;--border:#542842;--border2:#6e3355;--text:#f5e0ec;--text2:#c080aa;--muted:#9a4f7a;--accent:#fb7185;--accent2:#f472b6;--accent3:#e879f9;--green:#34d399;--amber:#fbbf24;--red:#f87171;--shadow:0 1px 4px rgba(0,0,0,0.4),0 1px 2px rgba(0,0,0,0.3);--shadow-md:0 4px 20px rgba(0,0,0,0.5);--shadow-lg:0 16px 48px rgba(0,0,0,0.6)`,
  },
  amber: {
    id: 'amber', label: 'Amber', icon: '🌟', mode: 'dark',
    css: `--bg:#141008;--surface:#241e0f;--surface2:#382d15;--surface3:#4c3b1a;--border:#50401d;--border2:#695427;--text:#f5ede0;--text2:#c0a880;--muted:#9a824f;--accent:#fbbf24;--accent2:#f59e0b;--accent3:#f97316;--green:#34d399;--amber:#fbbf24;--red:#fb7185;--shadow:0 1px 4px rgba(0,0,0,0.4),0 1px 2px rgba(0,0,0,0.3);--shadow-md:0 4px 20px rgba(0,0,0,0.5);--shadow-lg:0 16px 48px rgba(0,0,0,0.6)`,
  },
  light: {
    id: 'light', label: 'White', icon: '☀️', mode: 'light',
    css: `--bg:#f4f6f9;--surface:#ffffff;--surface2:#f0f2f5;--surface3:#e8ecf1;--border:#d1d5db;--border2:#9ca3af;--text:#111827;--text2:#4b5563;--muted:#6b7280;--accent:#6366f1;--accent2:#8b5cf6;--accent3:#3b82f6;--green:#059669;--amber:#d97706;--red:#dc2626;--shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);--shadow-md:0 4px 12px rgba(0,0,0,0.08);--shadow-lg:0 8px 30px rgba(0,0,0,0.1)`,
  },
  'light-teal': {
    id: 'light-teal', label: 'Teal Light', icon: '🌊', mode: 'light',
    css: `--bg:#f0fdfa;--surface:#ffffff;--surface2:#ecfdf5;--surface3:#d1fae5;--border:#a7f3d0;--border2:#6ee7b7;--text:#022c22;--text2:#065f46;--muted:#047857;--accent:#0d9488;--accent2:#14b8a6;--accent3:#0891b2;--green:#059669;--amber:#d97706;--red:#dc2626;--shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.03);--shadow-md:0 4px 12px rgba(0,0,0,0.06);--shadow-lg:0 8px 30px rgba(0,0,0,0.08)`,
  },
  'light-blue': {
    id: 'light-blue', label: 'Blue Light', icon: '🔷', mode: 'light',
    css: `--bg:#eff6ff;--surface:#ffffff;--surface2:#e0f2fe;--surface3:#bae6fd;--border:#93c5fd;--border2:#60a5fa;--text:#0c4a6e;--text2:#1e40af;--muted:#2563eb;--accent:#2563eb;--accent2:#3b82f6;--accent3:#06b6d4;--green:#059669;--amber:#d97706;--red:#dc2626;--shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.03);--shadow-md:0 4px 12px rgba(0,0,0,0.06);--shadow-lg:0 8px 30px rgba(0,0,0,0.08)`,
  },
  'light-purple': {
    id: 'light-purple', label: 'Purple Light', icon: '🔮', mode: 'light',
    css: `--bg:#f5f3ff;--surface:#ffffff;--surface2:#ede9fe;--surface3:#ddd6fe;--border:#c4b5fd;--border2:#a78bfa;--text:#2e1065;--text2:#5b21b6;--muted:#6d28d9;--accent:#7c3aed;--accent2:#8b5cf6;--accent3:#a78bfa;--green:#059669;--amber:#d97706;--red:#dc2626;--shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.03);--shadow-md:0 4px 12px rgba(0,0,0,0.06);--shadow-lg:0 8px 30px rgba(0,0,0,0.08)`,
  },
  'light-amber': {
    id: 'light-amber', label: 'Amber Light', icon: '🌅', mode: 'light',
    css: `--bg:#fffbeb;--surface:#ffffff;--surface2:#fef3c7;--surface3:#fde68a;--border:#fcd34d;--border2:#fbbf24;--text:#451a03;--text2:#92400e;--muted:#b45309;--accent:#d97706;--accent2:#f59e0b;--accent3:#f97316;--green:#059669;--amber:#d97706;--red:#dc2626;--shadow:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.03);--shadow-md:0 4px 12px rgba(0,0,0,0.06);--shadow-lg:0 8px 30px rgba(0,0,0,0.08)`,
  },
};

export const PATIENT_THEME_LIST: PatientThemeDef[] = Object.values(PATIENT_THEMES);

export function getStoredPatientTheme(): PatientTheme {
  if (typeof window === 'undefined') return 'teal';
  const stored = localStorage.getItem('amx-patient-theme') as PatientTheme | null;
  if (stored && stored in PATIENT_THEMES) return stored;
  return 'teal';
}

export function applyPatientTheme(theme: PatientTheme) {
  if (typeof document === 'undefined') return;
  const t = PATIENT_THEMES[theme];
  if (!t) return;
  const root = document.documentElement;
  t.css.split(';').forEach(decl => {
    const [prop, val] = decl.split(':');
    if (prop && val) root.style.setProperty(prop.trim(), val.trim());
  });
  localStorage.setItem('amx-patient-theme', theme);
}

export function initPatientTheme() {
  const t = getStoredPatientTheme();
  applyPatientTheme(t);
}

export { PATIENT_THEMES };
