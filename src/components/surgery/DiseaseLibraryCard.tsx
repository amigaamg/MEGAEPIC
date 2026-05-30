'use client';
import React from 'react';
import type { DiseaseNode } from '@/engine/knowledge-graph/types';

interface DiseaseLibraryCardProps {
  disease: DiseaseNode;
  onClick?: (disease: DiseaseNode) => void;
}

export function DiseaseLibraryCard({ disease, onClick }: DiseaseLibraryCardProps) {
  const emergencyColor = disease.emergencyPriority === 'high'
    ? 'border-l-red-400 bg-red-50'
    : disease.mustNotMiss
    ? 'border-l-amber-400 bg-amber-50'
    : 'border-l-gray-300 bg-gray-50';

  return (
    <button
      onClick={() => onClick?.(disease)}
      className={`w-full text-left p-3 border border-l-4 rounded-lg transition-shadow hover:shadow-md ${emergencyColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm text-gray-800">{disease.name}</h4>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{disease.id}</p>
        </div>
        {disease.emergencyPriority === 'high' && (
          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded font-medium">HIGH</span>
        )}
        {disease.mustNotMiss && disease.emergencyPriority !== 'high' && (
          <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded font-medium">MUST NOT MISS</span>
        )}
      </div>

      {(disease as any).presentingComplaints && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(disease as any).presentingComplaints.slice(0, 3).map((pc: string) => (
            <span key={pc} className="px-1.5 py-0.5 text-xs bg-white border rounded-full text-gray-500">
              {pc}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
        <span>Weight: {(disease.prevalenceWeight * 100).toFixed(0)}%</span>
        {disease.subtypes && <span>{disease.subtypes.length} subtypes</span>}
        {(disease as any).investigations && <span>Has investigations</span>}
      </div>
    </button>
  );
}
