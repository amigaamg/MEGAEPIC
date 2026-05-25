'use client';
import { useEffect, useState, useCallback } from 'react';
import { applyDashboardTheme, type AmxDashboardTheme } from '@/lib/theme.config';

const STORAGE_KEY = 'amx-theme';

function getStored(): AmxDashboardTheme | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'forest' || v === 'midnight' || v === 'ivory' || v === 'slate') return v;
  return null;
}

export function DashboardThemeInjector() {
  useEffect(() => {
    const theme = getStored();
    if (theme) applyDashboardTheme(theme);
  }, []);
  return null;
}

export function ThemeSwatches({ style }: { style?: React.CSSProperties }) {
  const [current, setCurrent] = useState<AmxDashboardTheme>(getStored() ?? 'forest');

  const setTheme = useCallback((t: AmxDashboardTheme) => {
    localStorage.setItem(STORAGE_KEY, t);
    applyDashboardTheme(t);
    setCurrent(t);
  }, []);

  const themes: { id: AmxDashboardTheme; color: string }[] = [
    { id: 'forest',   color: '#0F766E' },
    { id: 'midnight', color: '#3B82F6' },
    { id: 'ivory',    color: '#E07A5F' },
    { id: 'slate',    color: '#6366F1' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
          style={{
            width: current === t.id ? 22 : 16,
            height: current === t.id ? 22 : 16,
            borderRadius: '50%',
            border: current === t.id ? '2.5px solid var(--text, #0d1b2a)' : `1.5px solid ${t.color}`,
            background: t.color,
            cursor: 'pointer',
            transition: 'all .18s ease',
            boxShadow: current === t.id ? `0 0 0 3px ${t.color}33` : 'none',
            padding: 0,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
