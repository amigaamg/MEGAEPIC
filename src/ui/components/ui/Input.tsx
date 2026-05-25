'use client';
import React from 'react';
import { useTheme } from '../../themes/ThemeProvider';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => {
  const theme = useTheme();
  const style: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
    border: `1px solid ${theme.colors.border}`, background: theme.colors.surface,
    color: theme.colors.text, fontSize: 13, outline: 'none',
    fontFamily: theme.typography.font, transition: 'border-color 0.15s',
    ...props.style as React.CSSProperties,
  };
  return <input style={style} {...props} />;
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea: React.FC<TextAreaProps> = (props) => {
  const theme = useTheme();
  const style: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
    border: `1px solid ${theme.colors.border}`, background: theme.colors.surface,
    color: theme.colors.text, fontSize: 13, outline: 'none', fontFamily: theme.typography.font,
    minHeight: 64, resize: 'vertical', transition: 'border-color 0.15s',
    ...props.style as React.CSSProperties,
  };
  return <textarea style={style} {...props} />;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: {value: string; label: string}[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, placeholder, ...props }) => {
  const theme = useTheme();
  const style: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 8,
    border: `1px solid ${theme.colors.border}`, background: theme.colors.surface,
    color: theme.colors.text, fontSize: 13, outline: 'none', fontFamily: theme.typography.font,
    ...props.style as React.CSSProperties,
  };
  return (
    <select style={style} {...props}>
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
};
