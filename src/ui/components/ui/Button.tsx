'use client';
import React from 'react';
import { useTheme } from '../../themes/ThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'secondary', size = 'md', children, ...props }) => {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: 11 },
    md: { padding: '6px 14px', fontSize: 13 },
    lg: { padding: '10px 20px', fontSize: 15 },
  };

  const bg = isPrimary ? theme.colors.accent : isDanger ? theme.colors.danger : 'transparent';
  const color = isPrimary ? '#fff' : isDanger ? '#fff' : isGhost ? theme.colors.textSub : theme.colors.text;
  const borderColor = isGhost ? 'transparent' : theme.colors.border;

  const style: React.CSSProperties = {
    ...sizeStyles[size],
    borderRadius: 8, border: `1px solid ${borderColor}`,
    background: bg, color, cursor: 'pointer',
    fontWeight: 600, fontFamily: theme.typography.font,
    transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
    whiteSpace: 'nowrap', lineHeight: 1.4,
    ...props.style as React.CSSProperties,
  };
  return <button style={style} {...props}>{children}</button>;
};
