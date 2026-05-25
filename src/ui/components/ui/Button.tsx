'use client';
import React from 'react';
import { useTheme } from '../../themes/ThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', children, ...props }) => {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const bg = isPrimary ? theme.colors.accent : isDanger ? theme.colors.danger : 'transparent';
  const color = isPrimary ? 'white' : isDanger ? 'white' : variant === 'ghost' ? theme.colors.textSub : theme.colors.text;
  const borderColor = variant === 'ghost' ? 'transparent' : theme.colors.border;
  const style: React.CSSProperties = {
    padding: '6px 14px', borderRadius: 8, border: `1px solid ${borderColor}`,
    background: bg, color, fontSize: 13, cursor: 'pointer',
    fontWeight: 600, fontFamily: theme.typography.font,
    transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
    whiteSpace: 'nowrap', ...props.style as React.CSSProperties,
  };
  return <button style={style} {...props}>{children}</button>;
};
