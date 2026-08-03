"use client";

import React from 'react';
import { useTheme } from '@/lib/amexan/presentation/engine/theme-engine';

interface PatientCardProps {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  mrn?: string;
  address?: string;
  phone?: string;
  email?: string;
  doctor?: string;
  status?: 'active' | 'inactive' | 'pending' | 'critical';
  vitals?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    oxygenSaturation?: number;
  };
  onClick?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export function PatientCard({
  id,
  name,
  age,
  gender,
  mrn,
  address,
  phone,
  email,
  doctor,
  status = 'active',
  vitals,
  onClick,
  onSelect,
}: PatientCardProps) {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-50 border-green-200 text-green-800',
      inactive: 'bg-gray-50 border-gray-200 text-gray-600',
      pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      critical: 'bg-red-50 border-red-200 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return '👨';
      case 'female': return '👩';
      default: return '👤';
    }
  };

  const getVitalsStatus = () => {
    if (!vitals) return { label: 'No vitals', color: 'text-gray-500', icon: '—' };

    const issues: string[] = [];
    if (vitals.temperature && (vitals.temperature < 36 || vitals.temperature > 38)) {
      issues.push('temp');
    }
    if (vitals.heartRate && (vitals.heartRate < 60 || vitals.heartRate > 100)) {
      issues.push('hr');
    }
    if (vitals.oxygenSaturation && vitals.oxygenSaturation < 94) {
      issues.push('o2');
    }

    if (issues.length === 0) {
      return { label: 'Normal', color: 'text-green-600', icon: '✅' };
    }
    return { label: issues.join(', '), color: 'text-red-600', icon: '⚠️' };
  };

  const handleClick = () => {
    if (onClick) onClick(id);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(id);
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${getStatusColor(status)} ${onClick ? 'hover:bg-opacity-80' : ''}`}
      onClick={handleClick}
      style={{
        '--tw-primary': theme.colors.primary.DEFAULT,
        '--tw-surface': theme.colors.secondary.DEFAULT,
      } as any}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getGenderIcon(gender || 'other')}</span>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm opacity-70">
              {age && `${age} years`} {gender && `• ${gender.charAt(0).toUpperCase() + gender.slice(1)}`}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {mrn && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">MRN:</span>
            <span className="font-medium">{mrn}</span>
          </div>
        )}
        {doctor && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Doctor:</span>
            <span className="font-medium">{doctor}</span>
          </div>
        )}
        {phone && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Phone:</span>
            <span className="font-medium">{phone}</span>
          </div>
        )}
        {address && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Address:</span>
            <span className="font-medium">{address}</span>
          </div>
        )}
      </div>

      {vitals && (
        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2">Vitals:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {vitals.temperature && (
              <div className="flex justify-between">
                <span className="opacity-70">Temp:</span>
                <span className="font-medium">{vitals.temperature}°C</span>
              </div>
            )}
            {vitals.heartRate && (
              <div className="flex justify-between">
                <span className="opacity-70">HR:</span>
                <span className="font-medium">{vitals.heartRate} bpm</span>
              </div>
            )}
            {vitals.bloodPressure && (
              <div className="flex justify-between">
                <span className="opacity-70">BP:</span>
                <span className="font-medium">{vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}</span>
              </div>
            )}
            {vitals.oxygenSaturation && (
              <div className="flex justify-between">
                <span className="opacity-70">O2 Sat:</span>
                <span className="font-medium">{vitals.oxygenSaturation}%</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs">
            <span className="mr-1">{getVitalsStatus().icon}</span>
            <span className={`${getVitalsStatus().color}`}>{getVitalsStatus().label}</span>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t flex justify-end">
        <button
          onClick={handleSelect}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
}