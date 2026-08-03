"use client";

import React from 'react';
import { useTheme } from '@/lib/amexan/presentation/engine/theme-engine';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'info' | 'success' | 'research' | 'education' | 'analytics';
  onClick?: () => void;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  onClick,
  className = '',
}: DashboardCardProps) {
  const theme = useTheme();

  const getColorClasses = () => {
    const colors = {
      primary: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        trend: 'text-blue-600',
      },
      secondary: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        trend: 'text-indigo-600',
      },
      accent: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        trend: 'text-emerald-600',
      },
      warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        trend: 'text-amber-600',
      },
      danger: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        trend: 'text-red-600',
      },
      info: {
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-700',
        trend: 'text-sky-600',
      },
      success: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        trend: 'text-green-600',
      },
      research: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        trend: 'text-purple-600',
      },
      education: {
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        text: 'text-teal-700',
        trend: 'text-teal-600',
      },
      analytics: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        trend: 'text-orange-600',
      },
    };
    return colors[color];
  };

  const colorClasses = getColorClasses();

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={`p-5 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${colorClasses.bg} ${colorClasses.border} ${className} ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`font-semibold text-lg ${colorClasses.text}`}>{title}</h3>
          <p className="text-3xl font-bold mt-2 ${colorClasses.text}">{value}</p>
        </div>
        {icon && <div className={`${colorClasses.text}`}>{icon}</div>}
      </div>

      {trend && (
        <div className="flex items-center mt-4 text-sm">
          <span className={`${trend.isPositive ? 'text-green-600' : 'text-red-600'} mr-1`}>\n            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">({trend.period})</span>
        </div>
      )}
    </div>
  );
}