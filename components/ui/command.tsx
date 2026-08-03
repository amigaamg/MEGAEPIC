// AMEXAN Universal Command Palette Component
// Constitutional Principle: Ctrl+K is universal access to action.
// Spec: keyboard navigable, fuzzy-ish search, telemetry, ESC close.

import React from 'react';
import { colorTokens } from '@/lib/design/tokens/colors';
import { typographyTokens } from '@/lib/design/tokens/typography';
import { spacingTokens } from '@/lib/design/tokens/spacing';
import { getRadius } from '@/lib/design/tokens/radius';
import { getElevation } from '@/lib/design/tokens/elevation';
import { componentDataAttr, emitTelemetry } from './types';
import type { UniversalComponentProps } from './types';

export interface CommandAction {
  id: string;
  label: string;
  keywords?: string[];
  icon?: React.ReactNode;
  shortcut?: string;
  group?: string;
  onExecute: () => void;
  disabled?: boolean;
}

export interface CommandPaletteProps extends UniversalComponentProps {
  open: boolean;
  onClose: () => void;
  actions: CommandAction[];
  placeholder?: string;
  groups?: string[];
}

export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ open, onClose, actions, placeholder = 'Type a command or search…', groups, className = '', testId, id, telemetry, ...props }, ref) => {
    const [query, setQuery] = React.useState('');
    const [activeIndex, setActiveIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const filtered = React.useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return actions;
      return actions.filter((a) => {
        if (a.label.toLowerCase().includes(q)) return true;
        return (a.keywords || []).some((k) => k.toLowerCase().includes(q));
      });
    }, [actions, query]);

    const grouped = React.useMemo(() => {
      if (!groups || groups.length === 0) return [{ label: undefined as string | undefined, items: filtered }];
      return groups.map((g) => ({
        label: g,
        items: filtered.filter((a) => (a.group || 'General') === g),
      }));
    }, [filtered, groups]);

    React.useEffect(() => {
      if (!open) return;
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const execute = (action: CommandAction, index: number) => {
      emitTelemetry({ telemetry, testId }, 'command', 'execute', { action: action.id });
      action.onExecute();
      onClose();
      void index;
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filtered[activeIndex];
        if (action && !action.disabled) execute(action, activeIndex);
      }
    };

    if (!open) return null;

    let globalIndex = -1;

    return (
      <div role="presentation" data-testid={testId} onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }} {...props}>
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          style={{
            width: '100%',
            maxWidth: 560,
            background: colorTokens.secondary.DEFAULT,
            borderRadius: getRadius(16),
            boxShadow: getElevation(5),
            overflow: 'hidden',
            animation: 'amexan-modal-in 200ms ease-out both',
          }}
          {...componentDataAttr({ testId, id }, 'command')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacingTokens[2], padding: spacingTokens[3], borderBottom: `1px solid ${colorTokens.neutral[200]}` }}>
            <span style={{ color: colorTokens.neutral[400], display: 'inline-flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-label="Command search"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: typographyTokens.body.fontSize, background: 'transparent', color: colorTokens.neutral[800], fontFamily: typographyTokens.body.fontFamily }}
            />
            <kbd style={{ fontSize: 10, color: colorTokens.neutral[400], border: `1px solid ${colorTokens.neutral[200]}`, borderRadius: 4, padding: '2px 6px', background: colorTokens.neutral[50] }}>ESC</kbd>
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto', padding: spacingTokens[2] }}>
            {grouped.map((group, gi) => {
              if (group.items.length === 0) return null;
              return (
                <div key={group.label || gi}>
                  {group.label ? <div style={{ padding: `${spacingTokens[1]} ${spacingTokens[2]}`, fontSize: typographyTokens.caption.fontSize, fontWeight: 600, color: colorTokens.neutral[400], textTransform: 'uppercase', letterSpacing: '0.04em' }}>{group.label}</div> : null}
                  {group.items.map((action) => {
                    globalIndex += 1;
                    const idx = globalIndex;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        disabled={action.disabled}
                        onClick={() => execute(action, idx)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacingTokens[2],
                          width: '100%',
                          minHeight: 44,
                          padding: `${spacingTokens[2]} ${spacingTokens[3]}`,
                          borderRadius: getRadius(8),
                          border: 'none',
                          background: idx === activeIndex ? colorTokens.primary.surface : 'transparent',
                          color: idx === activeIndex ? colorTokens.primary.DEFAULT : colorTokens.neutral[700],
                          cursor: action.disabled ? 'not-allowed' : 'pointer',
                          fontSize: typographyTokens.bodySmall.fontSize,
                          textAlign: 'left',
                          fontFamily: typographyTokens.body.fontFamily,
                          opacity: action.disabled ? 0.4 : 1,
                        }}
                      >
                        {action.icon ? <span style={{ display: 'inline-flex', color: colorTokens.neutral[400] }}>{action.icon}</span> : null}
                        <span style={{ flex: 1 }}>{action.label}</span>
                        {action.shortcut ? <kbd style={{ fontSize: 10, color: colorTokens.neutral[400], border: `1px solid ${colorTokens.neutral[200]}`, borderRadius: 4, padding: '2px 6px' }}>{action.shortcut}</kbd> : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <div style={{ padding: spacingTokens[5], textAlign: 'center', color: colorTokens.neutral[400], fontSize: typographyTokens.bodySmall.fontSize }}>No commands match “{query}”.</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

CommandPalette.displayName = 'CommandPalette';
export default CommandPalette;
