// AMEXAN Universal Table Component
// Constitutional Principle: Tables are communication. Cards are communication. Context decides.
// Spec: tables -> cards on phone. Sorting, filtering, selection, keyboard, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  hideOnMobile?: boolean;
}

export interface TableProps<T> extends UniversalComponentProps {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  asCardsOnMobile?: boolean;
  density?: 'compact' | 'comfortable' | 'spacious';
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  asCardsOnMobile = true,
  density = 'comfortable',
  className = '',
  testId,
  id,
  telemetry,
}: TableProps<T>) {
  const cellPadding = { compact: spacingTokens[2], comfortable: spacingTokens[3], spacious: spacingTokens[4] }[density];

  const paddingStyle: React.CSSProperties = {
    padding: `${cellPadding} ${spacingTokens[4]}`,
    borderBottom: `1px solid ${colorTokens.neutral[100]}`,
  };

  const handleRowClick = (row: T) => {
    emitTelemetry({ telemetry, testId }, 'table', 'row-click');
    onRowClick?.(row);
  };

  return (
    <div data-testid={testId} {...componentDataAttr({ testId, id }, 'table')}>
      <div
        role="table"
        aria-label="Data table"
        style={{
          borderRadius: getRadius(12),
          border: `1px solid ${colorTokens.neutral[200]}`,
          overflow: 'hidden',
          background: colorTokens.secondary.DEFAULT,
        }}
      >
        <div
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            background: colorTokens.neutral[50],
          }}
        >
          {columns.map((col) => (
            <div
              key={col.id}
              role="columnheader"
              style={{
                ...paddingStyle,
                fontSize: typographyTokens.caption.fontSize,
                fontWeight: 600,
                color: colorTokens.neutral[500],
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textAlign: col.align || 'left',
              }}
            >
              {col.header}
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            role="row"
            onClick={() => handleRowClick(row)}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background-color 100ms ease',
            }}
          >
            {columns.map((col) => (
              <div
                key={col.id}
                role="cell"
                style={{ ...paddingStyle, textAlign: col.align || 'left', fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[700] }}
              >
                {col.accessor(row)}
              </div>
            ))}
          </div>
        ))}
        {rows.length === 0 ? (
          <div role="row" style={{ padding: spacingTokens[6], textAlign: 'center', color: colorTokens.neutral[400], fontSize: typographyTokens.bodySmall.fontSize }}>
            No rows to display.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Table;
