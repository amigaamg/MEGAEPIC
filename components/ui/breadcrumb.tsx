// AMEXAN Universal Breadcrumb Component
// Constitutional Principle: Breadcrumbs are context, not history. Contextual hierarchy.
// Spec: AMEXAN → Hospital → Department → Ward → Patient → Encounter. Current crumb is never a link.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends UniversalComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '›', className = '', testId, id, telemetry, ...props }, ref) => {
    return (
      <nav ref={ref} aria-label="Breadcrumb" data-testid={testId} {...componentDataAttr({ testId, id }, 'breadcrumb')} {...props}>
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacingTokens[1],
            margin: 0,
            padding: 0,
            listStyle: 'none',
            fontSize: typographyTokens.bodySmall.fontSize,
          }}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                  {isLast ? (
                    <span aria-current="page" style={{ color: colorTokens.neutral[700], fontWeight: 500 }}>
                      {item.label}
                    </span>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => emitTelemetry({ telemetry, testId }, 'breadcrumb', 'click', { label: item.label })}
                      style={{ color: colorTokens.primary.DEFAULT, textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
                {!isLast ? (
                  <li aria-hidden="true" style={{ color: colorTokens.neutral[400], margin: `0 ${spacingTokens[1]}` }}>
                    {separator}
                  </li>
                ) : null}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';
export default Breadcrumb;
