'use client';
import React from 'react';
import { useTheme } from '../../themes/ThemeProvider';

interface PillOption { value: string; label: string; warn?: boolean; }

interface PillGroupProps {
  options: (string | PillOption)[];
  value: string;
  onChange: (val: string) => void;
}

export const PillGroup: React.FC<PillGroupProps> = ({ options, value, onChange }) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const warn = typeof opt === 'object' && opt.warn;
        const selected = value === v;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            border: `1px solid ${selected ? (warn ? theme.colors.danger : theme.colors.accent) : (warn ? theme.colors.danger : theme.colors.border)}`,
            background: selected ? (warn ? theme.colors.dangerBg : theme.colors.accent) : 'transparent',
            color: selected ? (warn ? theme.colors.danger : 'white') : (warn ? theme.colors.danger : theme.colors.textSub),
            fontWeight: selected ? 600 : 400, transition: 'all 0.12s', fontFamily: theme.typography.font,
          }}>{label}</button>
        );
      })}
    </div>
  );
};

interface BoolChipProps {
  label: string; value: boolean; onChange: (val: boolean) => void; warn?: boolean;
}

export const BoolChip: React.FC<BoolChipProps> = ({ label, value, onChange, warn }) => {
  const theme = useTheme();
  const activeColor = warn ? theme.colors.danger : theme.colors.accent;
  const activeBg = warn ? theme.colors.dangerBg : theme.colors.accentBg;
  return (
    <button onClick={() => onChange(!value)} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8,
      border: `1px solid ${value ? activeColor : (warn ? `${theme.colors.danger}50` : theme.colors.border)}`,
      background: value ? activeBg : 'transparent',
      color: value ? (warn ? theme.colors.danger : theme.colors.accentText) : (warn ? theme.colors.danger : theme.colors.textSub),
      fontSize: 13, cursor: 'pointer', transition: 'all 0.12s', whiteSpace: 'nowrap', fontFamily: theme.typography.font,
    }}>
      <span style={{
        width: 15, height: 15, borderRadius: 4, flexShrink: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${value ? activeColor : theme.colors.borderStrong}`,
        background: value ? activeColor : 'transparent', color: 'white', fontSize: 9, fontWeight: 700,
      }}>{value ? '✓' : ''}</span>
      {label}
    </button>
  );
};
