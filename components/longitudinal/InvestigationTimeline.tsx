'use client';

import React from 'react';
import type { InvestigationStatus } from '@/lib/amexan/longitudinal/types';

interface Props {
  investigations: InvestigationStatus[];
  onReview?: (id: string) => void;
}

const STATUS_STEPS: { key: InvestigationStatus['status']; label: string; icon: string }[] = [
  { key: 'ordered', label: 'Ordered', icon: '📋' },
  { key: 'collected', label: 'Collected', icon: '🧪' },
  { key: 'processing', label: 'Processing', icon: '⚙️' },
  { key: 'resulted', label: 'Resulted', icon: '📊' },
  { key: 'reviewed', label: 'Reviewed', icon: '👁️' },
  { key: 'acted', label: 'Acted On', icon: '✅' },
  { key: 'closed', label: 'Closed', icon: '🔒' },
];

const FLAG_STYLES: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-700',
  abnormal: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

export default function InvestigationTimeline({ investigations, onReview }: Props) {
  const sorted = [...investigations].sort((a, b) => b.orderedAt - a.orderedAt);

  if (!sorted.length) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        No investigations ordered.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map(inv => {
        const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === inv.status);
        const resultDisplay = inv.result !== undefined
          ? `${inv.result}${inv.unit ? ` ${inv.unit}` : ''}${inv.referenceRange ? ` [${inv.referenceRange}]` : ''}`
          : null;

        return (
          <div
            key={inv.id}
            className={`bg-white rounded-xl border p-5 transition-all hover:shadow-sm ${
              inv.flag === 'critical' ? 'border-red-300 ring-1 ring-red-100'
              : inv.flag === 'abnormal' ? 'border-amber-300'
              : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{inv.testName}</h3>
                <p className="text-xs text-gray-500 capitalize">{inv.category}</p>
              </div>
              {inv.flag && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FLAG_STYLES[inv.flag] || 'bg-gray-100 text-gray-600'}`}>
                  {inv.flag}
                </span>
              )}
            </div>

            {/* Result */}
            {resultDisplay && (
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{resultDisplay}</p>
                {inv.interpretation && (
                  <p className="text-xs text-gray-500 mt-0.5">{inv.interpretation}</p>
                )}
                {inv.action && (
                  <p className="text-xs text-sky-600 mt-0.5">Action: {inv.action}</p>
                )}
              </div>
            )}

            {/* Timeline progress bar */}
            <div className="flex items-center gap-1 mb-2">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all
                        ${isCompleted ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-400'}
                        ${isCurrent ? 'ring-2 ring-sky-300' : ''}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[10px] mt-0.5 whitespace-nowrap
                        ${isCompleted ? 'text-sky-600 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded
                        ${i < currentStepIndex ? 'bg-sky-300' : i === currentStepIndex ? 'bg-sky-200' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Timestamps */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2">
              <span>Ordered: {new Date(inv.orderedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              {inv.collectedAt && <span>Collected: {new Date(inv.collectedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
              {inv.resultedAt && <span>Result: {new Date(inv.resultedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>

            {/* Action button */}
            {inv.status === 'resulted' && onReview && (
              <button
                onClick={() => onReview(inv.id)}
                className="mt-3 w-full py-1.5 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-100 transition-colors"
              >
                Review Result
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
