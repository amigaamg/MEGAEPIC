// AMEXAN Authentication Layout
// Constitutional Principle: Auth surfaces are calm, focused, and never busy.
// Kind: auth. Narrow centered card, no navigation chrome.

'use client';

import React from 'react';
import { useLayoutConfig, regionVisible } from './layout-shell';
import { colorTokens } from '@/lib/design/tokens/colors';
import { spacingTokens } from '@/lib/design/tokens/spacing';

export interface AuthLayoutProps {
  themeId?: string;
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const AuthLayout = ({ themeId = 'clinical', brand, footer, children }: AuthLayoutProps) => {
  const config = useLayoutConfig('auth', themeId);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacingTokens[6]} ${spacingTokens[4]}`,
        background: `linear-gradient(135deg, ${colorTokens.primary.surface} 0%, ${colorTokens.secondary.DEFAULT} 100%)`,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {brand ? <div style={{ marginBottom: spacingTokens[6] }}>{brand}</div> : null}
      <main
        style={{
          width: '100%',
          maxWidth: config.content.maxWidth,
          margin: '0 auto',
          padding: spacingTokens[6],
          background: colorTokens.secondary.DEFAULT,
          borderRadius: 24,
          border: `1px solid ${colorTokens.neutral[200]}`,
          boxShadow: '0 24px 80px rgba(15,23,42,0.12)',
        }}
      >
        {children}
      </main>
      {footer ? <div style={{ marginTop: spacingTokens[5] }}>{footer}</div> : null}
      {regionVisible(config, 'statusBar') && !footer ? <div style={{ height: 24 }} /> : null}
    </div>
  );
};

export default AuthLayout;
