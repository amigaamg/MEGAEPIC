'use client';
import React from 'react';

interface FactDisplayProps {
  label: string;
  value: string | boolean | number | undefined | null;
  unit?: string;
  flag?: 'normal' | 'abnormal' | 'critical';
}

export function FactDisplay({ label, value, unit, flag }: FactDisplayProps) {
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value ?? '—';
  const flagColors: Record<string, string> = {
    normal: 'text-green-600 bg-green-50',
    abnormal: 'text-amber-600 bg-amber-50',
    critical: 'text-red-600 bg-red-50',
  };

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${flag ? flagColors[flag] : 'bg-gray-50'}`}>
      <span className="font-medium text-gray-700">{label}</span>
      <span className="font-mono">
        {displayValue}
        {unit && <span className="text-gray-400 ml-1">{unit}</span>}
      </span>
    </div>
  );
}
