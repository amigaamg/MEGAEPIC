'use client';

import React from 'react';
import type { ClinicalSnapshot, PatientStatus } from '@/lib/amexan/longitudinal/types';

interface Props {
  snapshot: ClinicalSnapshot;
}

const STATUS_BADGES: Record<PatientStatus, { label: string; color: string }> = {
  stable: { label: 'Stable', color: 'bg-emerald-100 text-emerald-700 ring-emerald-300' },
  improving: { label: 'Improving', color: 'bg-blue-100 text-blue-700 ring-blue-300' },
  deteriorating: { label: 'Deteriorating', color: 'bg-amber-100 text-amber-700 ring-amber-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 ring-red-300' },
  transfer: { label: 'Transfer', color: 'bg-purple-100 text-purple-700 ring-purple-300' },
  discharge_ready: { label: 'Ready', color: 'bg-teal-100 text-teal-700 ring-teal-300' },
};

const WARNING_COLORS = {
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  critical: 'bg-red-50 border-red-200 text-red-700',
};

export default function ClinicalSnapshotCard({ snapshot }: Props) {
  const badge = STATUS_BADGES[snapshot.diagnosisStatus];

  return (
    <div className="space-y-4">
      {/* ── DIAGNOSIS ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Diagnosis</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-base font-medium text-gray-900">{snapshot.diagnosis}</p>
      </div>

      {/* ── PROBLEMS ────────────────────────────────────────────────────── */}
      {snapshot.problems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Problems</h3>
          <div className="space-y-2">
            {snapshot.problems.map(problem => (
              <div key={problem.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    problem.status === 'active' ? 'bg-amber-400'
                    : problem.status === 'improving' ? 'bg-blue-400'
                    : problem.status === 'resolved' ? 'bg-emerald-400'
                    : problem.status === 'worsening' ? 'bg-red-400'
                    : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-800">{problem.problem}</span>
                </div>
                <span className="text-xs text-gray-500 capitalize">{problem.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WARNINGS ────────────────────────────────────────────────────── */}
      {snapshot.warnings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Warnings</h3>
          <div className="space-y-2">
            {snapshot.warnings.map((w, i) => (
              <div key={i} className={`px-3 py-2 rounded-lg border text-sm ${WARNING_COLORS[w.severity]}`}>
                <div className="font-medium">{w.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                <div className="text-xs mt-0.5">{w.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── OUTSTANDING RESULTS ─────────────────────────────────────────── */}
      {snapshot.outstandingResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Outstanding Results</h3>
          <div className="space-y-2">
            {snapshot.outstandingResults.map((result, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MEDICATION ISSUES ───────────────────────────────────────────── */}
      {snapshot.medicationIssues.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Medication Issues</h3>
          <div className="space-y-2">
            {snapshot.medicationIssues.map((mi, i) => (
              <div key={i} className={`px-3 py-2 rounded-lg border text-sm ${
                mi.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700'
                : mi.severity === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <div className="font-medium">{mi.medication}</div>
                <div className="text-xs mt-0.5">{mi.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DISCHARGE READINESS ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Discharge Readiness</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            snapshot.dischargeReadiness === 'ready' ? 'bg-teal-100 text-teal-700'
            : snapshot.dischargeReadiness === 'nearly_ready' ? 'bg-amber-100 text-amber-700'
            : snapshot.dischargeReadiness === 'discharged' ? 'bg-gray-100 text-gray-500'
            : 'bg-gray-100 text-gray-500'
          }`}>
            {snapshot.dischargeReadiness.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        </div>
        {snapshot.nextDueAction && (
          <p className="text-sm text-gray-600 mt-2">Next: {snapshot.nextDueAction}</p>
        )}
      </div>
    </div>
  );
}
