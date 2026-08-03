// AMEXAN Shell Layout
// Constitutional Principle: The shell is the platform, pages are content.
// Kind: shell. The root application frame.

'use client';

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';

export interface ShellLayoutProps {
  themeId?: string;
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  children: React.ReactNode;
}

export const ShellLayout = ({ themeId = 'clinical', header, navigation, children }: ShellLayoutProps) => {
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
      {header ? <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>{header}</div> : null}
      <div style={{ display: 'flex', flex: 1 }}>
        {navigation ? <div style={{ flexShrink: 0 }}>{navigation}</div> : null}
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
};

export default ShellLayout;
