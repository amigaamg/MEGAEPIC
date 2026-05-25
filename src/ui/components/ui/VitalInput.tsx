'use client';
import React from 'react';
import { useTheme } from '../../themes/ThemeProvider';
import { Input } from './Input';

interface VitalInputProps {
  label: string;
  unit: string;
  value: string;
  onChange: (val: string) => void;
  warnFn?: (val: number) => string | null;
}

export const VitalInput: React.FC<VitalInputProps> = ({ label, unit, value, onChange, warnFn }) => {
  const theme = useTheme();
  const num = parseFloat(value);
  const warning = warnFn && !isNaN(num) ? warnFn(num) : null;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSub, marginBottom: 5 }}>
        {label} <span style={{ fontWeight: 400, color: theme.colors.textMuted }}>({unit})</span>
      </div>
      <Input type="number" value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        style={warning ? { borderColor: theme.colors.warn } as React.CSSProperties : undefined} />
      {warning && <div style={{ fontSize: 11, color: theme.colors.warn, marginTop: 3 }}>⚠ {warning}</div>}
    </div>
  );
};
