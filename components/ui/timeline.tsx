// AMEXAN Universal Timeline Component
// Constitutional Principle: Time is the primary axis of care. Chronology is sacred.
// Spec: used for encounters, events, medications, vitals over time. Telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: React.ReactNode;
  timestamp: string | Date;
  status?: 'normal' | 'info' | 'warning' | 'critical';
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface TimelineProps extends UniversalComponentProps {
  events: TimelineEvent[];
  newestFirst?: boolean;
}

const STATUS_COLOR: Record<NonNullable<TimelineEvent['status']>, string> = {
  normal: colorTokens.success.DEFAULT,
  info: colorTokens.accent.DEFAULT,
  warning: colorTokens.warning.DEFAULT,
  critical: colorTokens.danger.DEFAULT,
};

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ events, newestFirst = false, className = '', testId, id, telemetry, ...props }, ref) => {
    const sorted = newestFirst ? [...events].reverse() : events;
    return (
      <div ref={ref} data-testid={testId} {...componentDataAttr({ testId, id }, 'timeline')} {...props}>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {sorted.map((event, index) => {
            const color = STATUS_COLOR[event.status || 'info'];
            const isLast = index === sorted.length - 1;
            return (
              <li key={event.id} style={{ display: 'flex', gap: spacingTokens[3] }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: color,
                      marginTop: 4,
                      flexShrink: 0,
                    }}
                  />
                  {!isLast ? (
                    <span style={{ width: 2, flex: 1, background: colorTokens.neutral[200], minHeight: 20 }} />
                  ) : null}
                </div>
                <div
                  onClick={() => {
                    emitTelemetry({ telemetry, testId }, 'timeline', 'event-click', { event: event.id });
                    event.onClick?.();
                  }}
                  style={{
                    flex: 1,
                    paddingBottom: isLast ? 0 : spacingTokens[4],
                    cursor: event.onClick ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacingTokens[2], flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[800], fontWeight: 500 }}>{event.title}</strong>
                    <span style={{ fontSize: typographyTokens.caption.fontSize, color: colorTokens.neutral[400] }}>
                      {typeof event.timestamp === 'string' ? event.timestamp : event.timestamp.toLocaleString()}
                    </span>
                  </div>
                  {event.description ? (
                    <div style={{ fontSize: typographyTokens.bodySmall.fontSize, color: colorTokens.neutral[600], marginTop: 2 }}>{event.description}</div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
);

Timeline.displayName = 'Timeline';
export default Timeline;
