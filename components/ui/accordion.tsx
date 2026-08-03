// AMEXAN Universal Accordion Component
// Constitutional Principle: Accordions are progressive disclosure, never information hiding.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends UniversalComponentProps {
  items: AccordionItemData[];
  multiple?: boolean;
  defaultOpenIds?: string[];
  onChange?: (openIds: string[]) => void;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, multiple = false, defaultOpenIds = [], onChange, className = '', testId, id, telemetry, ...props }, ref) => {
    const [openIds, setOpenIds] = React.useState<string[]>(defaultOpenIds);

    const toggle = (itemId: string) => {
      setOpenIds((prev) => {
        let next: string[];
        if (multiple) {
          next = prev.includes(itemId) ? prev.filter((i) => i !== itemId) : [...prev, itemId];
        } else {
          next = prev.includes(itemId) ? [] : [itemId];
        }
        emitTelemetry({ telemetry, testId }, 'accordion', 'toggle', { item: itemId, open: next.includes(itemId) });
        onChange?.(next);
        return next;
      });
    };

    return (
      <div ref={ref} data-testid={testId} {...componentDataAttr({ testId, id }, 'accordion')} {...props}>
        {items.map((item) => {
          const isOpen = openIds.includes(item.id);
          return (
            <div key={item.id} style={{ marginBottom: spacingTokens[2], border: `1px solid ${colorTokens.neutral[200]}`, borderRadius: getRadius(8), overflow: 'hidden' }}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id || 'acc'}-${item.id}-panel`}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  minHeight: 48,
                  padding: `${spacingTokens[3]} ${spacingTokens[4]}`,
                  background: isOpen ? colorTokens.primary.surface : colorTokens.secondary.DEFAULT,
                  border: 'none',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  fontSize: typographyTokens.label.fontSize,
                  fontWeight: 500,
                  color: colorTokens.neutral[800],
                  opacity: item.disabled ? 0.4 : 1,
                  fontFamily: typographyTokens.body.fontFamily,
                }}
              >
                <span>{item.title}</span>
                <span style={{ color: colorTokens.neutral[400], transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease', fontSize: 12 }}>▾</span>
              </button>
              <div
                id={`${id || 'acc'}-${item.id}-panel`}
                role="region"
                hidden={!isOpen}
                style={{
                  padding: isOpen ? `${spacingTokens[3]} ${spacingTokens[4]}` : '0',
                  fontSize: typographyTokens.bodySmall.fontSize,
                  color: colorTokens.neutral[600],
                  maxHeight: isOpen ? undefined : 0,
                  overflow: 'hidden',
                  transition: 'padding 200ms ease',
                }}
              >
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';
export default Accordion;
