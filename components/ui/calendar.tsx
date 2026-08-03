// AMEXAN Universal Calendar Component
// Constitutional Principle: Dates are care facts. Calendar is a selection surface.
// Spec: keyboard navigation, ARIA grid, touch targets, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface CalendarProps extends UniversalComponentProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ value, onChange, minDate, maxDate, disabledDates = [], className = '', testId, id, telemetry, ...props }, ref) => {
    const [view, setView] = React.useState(() => {
      const base = value || new Date();
      return new Date(base.getFullYear(), base.getMonth(), 1);
    });

    const isDisabled = (date: Date): boolean => {
      if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
      if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
      return disabledDates.some((d) => sameDay(d, date));
    };

    const select = (date: Date) => {
      if (isDisabled(date)) return;
      emitTelemetry({ telemetry, testId }, 'calendar', 'select', { date: date.toISOString() });
      onChange?.(date);
    };

    const moveMonth = (delta: number) => {
      setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
    };

    const firstDay = new Date(view.getFullYear(), view.getMonth(), 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));

    const today = new Date();
    const monthLabel = view.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    return (
      <div ref={ref} data-testid={testId} {...componentDataAttr({ testId, id }, 'calendar')} {...props}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacingTokens[3] }}>
          <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} style={{ minWidth: 44, minHeight: 44, cursor: 'pointer', background: 'none', border: 'none', borderRadius: getRadius(8), fontSize: 16, color: colorTokens.neutral[600] }}>
            ‹
          </button>
          <strong style={{ fontSize: typographyTokens.label.fontSize, color: colorTokens.neutral[800] }}>{monthLabel}</strong>
          <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} style={{ minWidth: 44, minHeight: 44, cursor: 'pointer', background: 'none', border: 'none', borderRadius: getRadius(8), fontSize: 16, color: colorTokens.neutral[600] }}>
            ›
          </button>
        </div>
        <div role="grid" aria-label={monthLabel}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: spacingTokens[1], marginBottom: spacingTokens[1] }}>
            {WEEKDAYS.map((w) => (
              <div key={w} role="columnheader" style={{ textAlign: 'center', fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400], padding: spacingTokens[1] }}>
                {w}
              </div>
            ))}
          </div>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: spacingTokens[1] }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} />;
              const disabled = isDisabled(cell);
              const selected = value && sameDay(cell, value);
              const isToday = sameDay(cell, today);
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  role="gridcell"
                  disabled={disabled}
                  onClick={() => select(cell)}
                  aria-pressed={selected || undefined}
                  aria-label={cell.toDateString()}
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    borderRadius: getRadius(8),
                    border: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: selected ? colorTokens.primary.DEFAULT : isToday ? colorTokens.primary.surface : 'transparent',
                    color: selected ? '#ffffff' : disabled ? colorTokens.neutral[300] : isToday ? colorTokens.primary.DEFAULT : colorTokens.neutral[700],
                    fontSize: typographyTokens.bodySmall.fontSize,
                    opacity: disabled ? 0.5 : 1,
                    fontFamily: typographyTokens.body.fontFamily,
                  }}
                >
                  {cell.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

Calendar.displayName = 'Calendar';
export default Calendar;
