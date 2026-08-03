// AMEXAN Universal Datagrid Component
// Constitutional Principle: Datagrids are work surfaces for high-volume clinical data.
// Spec: sorting, filtering, pagination, selection, virtualizable rows, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface DatagridColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DatagridProps<T> extends UniversalComponentProps {
  columns: DatagridColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pageSize?: number;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
}

export function Datagrid<T>({
  columns,
  rows,
  rowKey,
  pageSize = 10,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  className = '',
  testId,
  id,
  telemetry,
}: DatagridProps<T>) {
  const [page, setPage] = React.useState(0);
  const [sortCol, setSortCol] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) => {
      return columns.some((col) => {
        const v = col.accessor(row);
        return typeof v === 'string' && v.toLowerCase().includes(q);
      });
    });
  }, [rows, query, columns]);

  const sorted = React.useMemo(() => {
    if (!sortCol) return filtered;
    const col = columns.find((c) => c.id === sortCol);
    if (!col) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = col.accessor(a);
      const vb = col.accessor(b);
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return 0;
    });
    return arr;
  }, [filtered, sortCol, sortDir, columns]);

  const pageRows = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  const toggleSort = (colId: string) => {
    emitTelemetry({ telemetry, testId }, 'datagrid', 'sort', { col: colId });
    if (sortCol === colId) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colId);
      setSortDir('asc');
    }
  };

  const toggleSelect = (key: string) => {
    const next = selectedKeys.includes(key) ? selectedKeys.filter((k) => k !== key) : [...selectedKeys, key];
    emitTelemetry({ telemetry, testId }, 'datagrid', 'select', { key });
    onSelectionChange?.(next);
  };

  return (
    <div data-testid={testId} {...componentDataAttr({ testId, id }, 'datagrid')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacingTokens[2], marginBottom: spacingTokens[3] }}>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Filter…"
          aria-label="Filter rows"
          style={{
            minHeight: 44,
            padding: `${spacingTokens[2]} ${spacingTokens[3]}`,
            borderRadius: getRadius(8),
            border: `1px solid ${colorTokens.neutral[300]}`,
            fontSize: typographyTokens.bodySmall.fontSize,
            outline: 'none',
            fontFamily: typographyTokens.body.fontFamily,
          }}
        />
        <span style={{ marginLeft: 'auto', fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400] }}>
          {sorted.length} row{sorted.length === 1 ? '' : 's'}
        </span>
      </div>
      <div style={{ border: `1px solid ${colorTokens.neutral[200]}`, borderRadius: getRadius(12), overflow: 'hidden', background: colorTokens.secondary.DEFAULT }}>
        <div style={{ display: 'grid', gridTemplateColumns: `${selectable ? '48px ' : ''}repeat(${columns.length}, minmax(0, 1fr))`, background: colorTokens.neutral[50] }}>
          {selectable ? <div style={{ padding: spacingTokens[2] }} /> : null}
          {columns.map((col) => (
            <div
              key={col.id}
              onClick={() => col.sortable && toggleSort(col.id)}
              style={{
                padding: `${spacingTokens[2]} ${spacingTokens[3]}`,
                fontSize: typographyTokens.caption.fontSize,
                fontWeight: 600,
                color: colorTokens.neutral[500],
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: col.sortable ? 'pointer' : 'default',
                width: col.width,
              }}
            >
              {col.header}
              {sortCol === col.id ? <span style={{ marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span> : null}
            </div>
          ))}
        </div>
        {pageRows.map((row) => {
          const key = rowKey(row);
          return (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: `${selectable ? '48px ' : ''}repeat(${columns.length}, minmax(0, 1fr))`, borderTop: `1px solid ${colorTokens.neutral[100]}` }}>
              {selectable ? (
                <div style={{ padding: spacingTokens[2], display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" checked={selectedKeys.includes(key)} onChange={() => toggleSelect(key)} aria-label="Select row" style={{ width: 18, height: 18 }} />
                </div>
              ) : null}
              {columns.map((col) => (
                <div key={col.id} style={{ padding: `${spacingTokens[2]} ${spacingTokens[3]}`, fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[700], width: col.width }}>
                  {col.accessor(row)}
                </div>
              ))}
            </div>
          );
        })}
        {pageRows.length === 0 ? (
          <div style={{ padding: spacingTokens[6], textAlign: 'center', color: colorTokens.neutral[400], fontSize: typographyTokens.bodySmall.fontSize }}>No matching rows.</div>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacingTokens[2], marginTop: spacingTokens[3], justifyContent: 'flex-end' }}>
        <button type="button" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ minWidth: 44, minHeight: 44, cursor: 'pointer', borderRadius: getRadius(8), border: `1px solid ${colorTokens.neutral[200]}`, background: colorTokens.secondary.DEFAULT, opacity: page === 0 ? 0.4 : 1 }}>
          ‹
        </button>
        <span style={{ fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[500] }}>
          Page {page + 1} of {pageCount}
        </span>
        <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} style={{ minWidth: 44, minHeight: 44, cursor: 'pointer', borderRadius: getRadius(8), border: `1px solid ${colorTokens.neutral[200]}`, background: colorTokens.secondary.DEFAULT, opacity: page >= pageCount - 1 ? 0.4 : 1 }}>
          ›
        </button>
      </div>
    </div>
  );
}

export default Datagrid;
