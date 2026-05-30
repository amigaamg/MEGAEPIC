'use client';
import React from 'react';

export interface ActiveCase {
  id: string;
  patientName: string;
  encounterType: string;
  activePhase: string;
  status: string;
  createdAt: number;
  consultant?: string;
  ward?: string;
  bed?: string;
}

interface ActiveCaseCardProps {
  caseData: ActiveCase;
  onClick?: (caseData: ActiveCase) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'border-l-green-400',
  admitted: 'border-l-blue-400',
  'post-op': 'border-l-purple-400',
  discharged: 'border-l-gray-400',
};

export function ActiveCaseCard({ caseData, onClick }: ActiveCaseCardProps) {
  const timeAgo = caseData.createdAt
    ? Math.floor((Date.now() - caseData.createdAt) / (1000 * 60))
    : 0;
  const timeStr = timeAgo < 60
    ? `${timeAgo}m ago`
    : `${Math.floor(timeAgo / 60)}h ${timeAgo % 60}m ago`;

  return (
    <button
      onClick={() => onClick?.(caseData)}
      className={`w-full text-left p-3 border border-l-4 rounded-lg transition-shadow hover:shadow-md ${
        STATUS_COLORS[caseData.status] || 'border-l-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm text-gray-800">{caseData.patientName}</h4>
          <p className="text-xs text-gray-400">{caseData.encounterType?.replace(/_/g, ' ')}</p>
        </div>
        <span className="text-xs text-gray-400">{timeStr}</span>
      </div>

      <div className="flex items-center gap-2 mt-2 text-xs">
        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
          {caseData.activePhase?.replace(/_/g, ' ')}
        </span>
        <span className={`px-2 py-0.5 rounded-full ${
          caseData.status === 'active' ? 'bg-green-50 text-green-600'
          : caseData.status === 'admitted' ? 'bg-blue-50 text-blue-600'
          : caseData.status === 'post-op' ? 'bg-purple-50 text-purple-600'
          : 'bg-gray-100 text-gray-500'
        }`}>
          {caseData.status}
        </span>
      </div>

      {caseData.consultant && (
        <p className="text-xs text-gray-400 mt-1">Consultant: {caseData.consultant}</p>
      )}
    </button>
  );
}
