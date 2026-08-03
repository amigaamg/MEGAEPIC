// AMEXAN Global Navigation Component
// Constitutional Principle: Navigation is generated, never hardcoded.
// Consumes lib/navigation/navigation.config.ts. Global layer of the 7-layer navigation.

'use client';

import React from 'react';
import { NAV_ITEMS, getVisibleNavItems } from '@/lib/navigation/navigation.config';
import type { NavItem, NavVisibility } from '@/lib/navigation/navigation.config';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';

export interface GlobalNavigationProps {
  visibility?: NavVisibility;
  brand?: React.ReactNode;
  actions?: React.ReactNode;
  onItemClick?: (item: NavItem) => void;
}

export const GlobalNavigation = ({ visibility = 'public', brand, actions, onItemClick }: GlobalNavigationProps) => {
  const [openMega, setOpenMega] = React.useState<string | null>(null);

  const items = getVisibleNavItems(visibility);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 72,
        padding: `0 ${spacingTokens[5]}`,
        gap: spacingTokens[3],
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colorTokens.neutral[200]}`,
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {brand ? <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{brand}</div> : null}
      <nav aria-label="Global" style={{ display: 'flex', alignItems: 'center', gap: spacingTokens[1], marginLeft: spacingTokens[4], overflowX: 'auto' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{ position: 'relative' }}
            onMouseEnter={() => item.megaMenu && setOpenMega(item.id)}
            onMouseLeave={() => setOpenMega(null)}
          >
            <a
              href={item.route}
              onClick={(e) => {
                if (item.megaMenu) {
                  e.preventDefault();
                  setOpenMega(openMega === item.id ? null : item.id);
                }
                onItemClick?.(item);
              }}
              aria-expanded={item.megaMenu ? openMega === item.id : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: `0 ${spacingTokens[3]}`,
                borderRadius: 8,
                color: openMega === item.id ? colorTokens.primary.DEFAULT : colorTokens.neutral[700],
                fontWeight: 500,
                fontSize: typographyTokens.bodySmall.fontSize,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: openMega === item.id ? colorTokens.primary.surface : 'transparent',
              }}
            >
              {item.title}
              {item.megaMenu ? <span style={{ marginLeft: 4, fontSize: 10, color: colorTokens.neutral[400] }}>▾</span> : null}
            </a>
            {item.megaMenu && openMega === item.id ? (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  minWidth: 720,
                  background: colorTokens.secondary.DEFAULT,
                  border: `1px solid ${colorTokens.neutral[200]}`,
                  borderRadius: 16,
                  boxShadow: '0 24px 80px rgba(15,23,42,0.18)',
                  padding: spacingTokens[5],
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: spacingTokens[4],
                  zIndex: 50,
                }}
              >
                {item.megaMenu.columns.map((col) => (
                  <div key={col.title}>
                    <h3 style={{ margin: `0 0 ${spacingTokens[2]}`, fontSize: typographyTokens.caption.fontSize, fontWeight: 600, color: colorTokens.neutral[400], textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {col.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacingTokens[1] }}>
                      {col.links.map((link) => (
                        <a
                          key={link.id}
                          href={link.route}
                          onClick={() => onItemClick?.(item)}
                          style={{
                            display: 'block',
                            padding: `${spacingTokens[2]} ${spacingTokens[2]}`,
                            borderRadius: 8,
                            textDecoration: 'none',
                            color: colorTokens.neutral[700],
                            fontSize: typographyTokens.bodySmall.fontSize,
                          }}
                        >
                          <span style={{ display: 'block', fontWeight: 500, color: colorTokens.neutral[800] }}>{link.title}</span>
                          {link.description ? (
                            <span style={{ display: 'block', fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400], marginTop: 1 }}>{link.description}</span>
                          ) : null}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                {item.megaMenu.footer ? (
                  <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${colorTokens.neutral[100]}`, paddingTop: spacingTokens[3], marginTop: spacingTokens[2] }}>
                    <a href={item.megaMenu.footer.route} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: colorTokens.neutral[800], fontSize: typographyTokens.bodySmall.fontSize }}>{item.megaMenu.footer.title}</div>
                        <div style={{ fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400] }}>{item.megaMenu.footer.description}</div>
                      </div>
                      <span style={{ color: colorTokens.primary.DEFAULT, fontWeight: 600, fontSize: typographyTokens.bodySmall.fontSize }}>
                        {item.megaMenu.footer.cta} →
                      </span>
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </nav>
      {actions ? <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: spacingTokens[2], flexShrink: 0 }}>{actions}</div> : null}
    </header>
  );
};

export default GlobalNavigation;
