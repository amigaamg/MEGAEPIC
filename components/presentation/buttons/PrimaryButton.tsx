"use client";

import React from 'react';
import { useTheme } from '@/lib/amexan/presentation/engine/theme-engine';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  size = 'md',
  fullWidth = false,
  loading = false,
}: PrimaryButtonProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const colorClasses = disabled
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 border border-blue-600';

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${widthClass}`}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      style={{
        '--tw-primary': theme.colors.primary.DEFAULT,
        '--tw-secondary': theme.colors.secondary.DEFAULT,
      } as any}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : children}
    </button>
  );
}