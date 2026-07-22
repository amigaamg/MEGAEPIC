'use client';

import React from 'react';
import type { MedicationStatus } from '@/lib/amexan/longitudinal/types';

interface Props {
  medications: MedicationStatus[];
}

const STATUS_STEPS: { key: MedicationStatus['status']; label: string; icon: string }[] = [
  { key: 'prescribed', label: 'Prescribed', icon: '📝' },
  { key: 'verified', label: 'Verified', icon: '✓' },
  { key: 'dispensed', label: 'Dispensed', icon: '💊' },
  { key: 'administering', label: 'Giving', icon: '💉' },
  { key: 'completed', label: 'Done', icon: '✅' },
];

const STATUS_COLORS: Record<string, string> = {
  prescribed: 'bg-blue-100 text-blue-700',
  verified: 'bg-indigo-100 text-indigo-700',
  dispensed: 'bg-purple-100 text-purple-700',
  administering: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  missed: 'bg-red-100 text-red-700',
  discontinued: 'bg-gray-100 text-gray-500',
};

const FREQ_DISPLAY: Record<string, string> = {
  stat: 'STAT',
  od: 'Once daily',
  bd: 'Twice daily',
  tds: 'Three times daily',
  qds: 'Four times daily',
  q4h: 'Every 4 hours',
  q6h: 'Every 6 hours',
  q8h: 'Every 8 hours',
  q12h: 'Every 12 hours',
  nocte: 'At night',
  prn: 'As needed',
};

export default function MedicationTimeline({ medications }: Props) {
  const active = medications.filter(m => m.status !== 'discontinued');

  if (!active.length) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">
        No active medications.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {active.map(med => {
        const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === med.status);
        const isMissed = med.missedDoses > 0;
        const isDueSoon = med.nextDue && med.nextDue < Date.now() + 3600000;

        return (
          <div
            key={med.id}
            className={`bg-white rounded-xl border p-4 ${
              isMissed ? 'border-red-200 bg-red-50/50'
              : isDueSoon ? 'border-amber-200 bg-amber-50/50'
              : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{med.genericName}</h3>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[med.status] || 'bg-gray-100'}`}>
                  {med.status}
                </span>
                {isMissed && (
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    {med.missedDoses} missed
                  </span>
                )}
              </div>
            </div>

            {/* Dosage info */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              <span className="font-mono">{med.dosage}</span>
              <span>{med.route.toUpperCase()}</span>
              <span>{FREQ_DISPLAY[med.frequency] || med.frequency}</span>
              {med.nextDue && (
                <span className={isDueSoon ? 'text-amber-600 font-medium' : ''}>
                  Next: {new Date(med.nextDue).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Timeline progress */}
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all
                        ${isCompleted ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}
                        ${isCurrent && isMissed ? 'ring-2 ring-red-300' : isCurrent ? 'ring-2 ring-sky-300' : ''}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[9px] mt-0.5 ${isCompleted ? 'text-sky-600' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-0.5 rounded
                        ${i < currentStepIndex ? 'bg-sky-300' : i === currentStepIndex ? 'bg-sky-200' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Last administered */}
            {med.lastAdministered && (
              <p className="text-[10px] text-gray-400 mt-2">
                Last given: {new Date(med.lastAdministered).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
                })}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
