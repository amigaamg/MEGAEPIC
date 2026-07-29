'use client';

import React from 'react';
import { usePresentationStore } from '@/lib/amexan/presentation/store';

export function ThemeInjector({ children }: { children: React.ReactNode }) {
  const theme = usePresentationStore((s) => s.theme);

  React.useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${key}`, value);
    }
    root.setAttribute('data-theme', theme.mode);
    if (theme.typography.fontScale > 1) root.style.setProperty('--font-scale', String(theme.typography.fontScale));
    root.style.setProperty('--font-size', `${theme.typography.fontSize}px`);
    root.style.setProperty('--border-radius', `${theme.layout.borderRadius}px`);
    root.style.setProperty('--min-touch-target', `${theme.accessibility.touchTarget}px`);
    root.style.setProperty('--focus-ring-width', `${theme.accessibility.focusRingWidth}px`);
  }, [theme]);

  return <>{children}</>;
}
