// AMEXAN Public Layout
// Constitutional Principle: The same intelligence. The appropriate interface.
// Kind: public. Full-width container, static navigation, centered content.

'use client';

import React from 'react';
import { useLayoutConfig, regionVisible } from './layout-shell';
import { colorTokens } from '@/lib/design/tokens/colors';

export interface PublicLayoutProps {
  themeId?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const PublicLayout = ({ themeId = 'clinical', header, footer, children }: PublicLayoutProps) => {
  const config = useLayoutConfig('public', themeId);
  const { maxWidth, padding } = config.container;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colorTokens.secondary.DEFAULT,
        color: colorTokens.neutral[900],
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {regionVisible(config, 'header') && header ? header : null}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: config.container.fullWidth ? '100%' : maxWidth,
          margin: '0 auto',
          padding,
        }}
      >
        {children}
      </main>
      {footer}
    </div>
  );
};

export default PublicLayout;
