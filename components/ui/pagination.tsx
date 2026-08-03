// AMEXAN Universal Pagination Component
// Constitutional Principle: Navigation within data is a workflow, not a widget.
// Spec: touch targets >= 48px, keyboard operable, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface PaginationProps extends UniversalComponentProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblings?: number;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, pageCount, onPageChange, siblings = 1, className = '', testId, id, telemetry, disabled: _disabled, ...props }, ref) => {
    if (pageCount <= 1) return null;

    const pages = React.useMemo(() => {
      const result: (number | '…')[] = [];
      const start = Math.max(1, page - siblings);
      const end = Math.min(pageCount, page + siblings);
      if (start > 1) result.push(1);
      if (start > 2) result.push('…');
      for (let i = start; i <= end; i++) result.push(i);
      if (end < pageCount - 1) result.push('…');
      if (end < pageCount) result.push(pageCount);
      return result;
    }, [page, pageCount, siblings]);

    const goTo = (target: number) => {
      if (target < 1 || target > pageCount || target === page) return;
      emitTelemetry({ telemetry, testId }, 'pagination', 'navigate', { page: target });
      onPageChange(target);
    };

    const btnBase: React.CSSProperties = {
      minWidth: 48,
      minHeight: 48,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getRadius(8),
      border: `1px solid ${colorTokens.neutral[200]}`,
      background: colorTokens.secondary.DEFAULT,
      color: colorTokens.neutral[700],
      fontSize: typographyTokens.label.fontSize,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 150ms ease, color 150ms ease',
    };

    return (
      <nav ref={ref} aria-label="Pagination" data-testid={testId} {...componentDataAttr({ testId, id }, 'pagination')} {...props}>
        <ul style={{ display: 'flex', gap: spacingTokens[1], alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
          <li>
            <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => goTo(page - 1)} style={{ ...btnBase, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              ‹
            </button>
          </li>
          {pages.map((p, i) =>
            p === '…' ? (
              <li key={`gap-${i}`} style={{ color: colorTokens.neutral[400], padding: `0 ${spacingTokens[1]}` }}>
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`Page ${p}`}
                  onClick={() => goTo(p)}
                  style={{
                    ...btnBase,
                    background: p === page ? colorTokens.primary.DEFAULT : colorTokens.secondary.DEFAULT,
                    color: p === page ? '#ffffff' : colorTokens.neutral[700],
                    borderColor: p === page ? colorTokens.primary.DEFAULT : colorTokens.neutral[200],
                  }}
                >
                  {p}
                </button>
              </li>
            ),
          )}
          <li>
            <button type="button" aria-label="Next page" disabled={page === pageCount} onClick={() => goTo(page + 1)} style={{ ...btnBase, opacity: page === pageCount ? 0.4 : 1, cursor: page === pageCount ? 'not-allowed' : 'pointer' }}>
              ›
            </button>
          </li>
        </ul>
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
export default Pagination;
