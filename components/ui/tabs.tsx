// AMEXAN Universal Tabs Component
// Constitutional Principle: Tabs organize, they never hide critical paths.
// Spec: keyboard arrows, ARIA tablist/tab/tabpanel, telemetry.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends UniversalComponentProps {
  tabs: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  children?: React.ReactNode;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, activeId, onChange, className = '', testId, id, telemetry, children, ...props }, ref) => {
    const [internalActive, setInternalActive] = React.useState(activeId || tabs[0]?.id);
    const active = activeId !== undefined ? activeId : internalActive;
    const listRef = React.useRef<HTMLDivElement>(null);

    const select = (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab || tab.disabled) return;
      setInternalActive(tabId);
      emitTelemetry({ telemetry, testId }, 'tabs', 'select', { tab: tabId });
      onChange?.(tabId);
    };

    const onKeyDown = (e: React.KeyboardEvent, index: number) => {
      let next = index;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(index + 1, tabs.length - 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(index - 1, 0);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      select(tabs[next].id);
      const button = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
      button?.focus();
    };

    const activeContent = tabs.find((t) => t.id === active)?.content;

    return (
      <div ref={ref} data-testid={testId} {...componentDataAttr({ testId, id }, 'tabs')} {...props}>
        <div
          ref={listRef}
          role="tablist"
          aria-label="Tabs"
          style={{ display: 'flex', gap: spacingTokens[1], borderBottom: `1px solid ${colorTokens.neutral[200]}`, overflowX: 'auto' }}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${id || 'tab'}-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${id || 'tab'}-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => select(tab.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacingTokens[1],
                  padding: `${spacingTokens[2]} ${spacingTokens[4]}`,
                  minHeight: 48,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? colorTokens.primary.DEFAULT : 'transparent'}`,
                  color: isActive ? colorTokens.primary.DEFAULT : colorTokens.neutral[500],
                  fontWeight: 500,
                  fontSize: typographyTokens.label.fontSize,
                  cursor: tab.disabled ? 'not-allowed' : 'pointer',
                  opacity: tab.disabled ? 0.4 : 1,
                  whiteSpace: 'nowrap',
                  fontFamily: typographyTokens.body.fontFamily,
                }}
              >
                {tab.icon ? <span style={{ display: 'inline-flex' }}>{tab.icon}</span> : null}
                {tab.label}
              </button>
            );
          })}
        </div>
        {children !== undefined ? (
          children
        ) : activeContent !== undefined ? (
          <div role="tabpanel" id={`${id || 'tab'}-panel-${active}`} aria-labelledby={`${id || 'tab'}-${active}`} style={{ paddingTop: spacingTokens[4] }}>
            {activeContent}
          </div>
        ) : null}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
export default Tabs;
