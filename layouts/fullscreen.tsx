// AMEXAN Fullscreen Layout
// Constitutional Principle: Fullscreen is for focus. Nothing competes.
// Kind: fullscreen. No chrome, no borders, 100% viewport.

'use client';

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';

export interface FullscreenLayoutProps {
  themeId?: string;
  children: React.ReactNode;
}

export const FullscreenLayout = ({ themeId = 'clinical', children }: FullscreenLayoutProps) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: colorTokens.secondary.DEFAULT,
        color: colorTokens.neutral[900],
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
};

export default FullscreenLayout;
