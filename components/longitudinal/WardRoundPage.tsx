'use client';

import React from 'react';
import type { WardRound, WardRoundPresentation, HospitalDay } from '@/lib/amexan/longitudinal/types';
import type { EncounterState } from '@/lib/amexan/encounter/encounterState';

interface Props {
  wardRound: WardRound;
  encounter: EncounterState;
  hospitalDay: HospitalDay;
  onEdit?: (section: string) => void;
  onComplete?: () => void;
}

export default function WardRoundPage({ wardRound, encounter, hospitalDay, onEdit, onComplete }: Props) {
  const pres = wardRound.presentationCard;
  const d = encounter.demographics;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ward Round — Hospital Day {wardRound.hospitalDay}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(wardRound.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500">Consultant: <span className="font-medium text-gray-800">{wardRound.consultant || 'Dr. Kamau'}</span></p>
            <p className="text-gray-500">Registrar: <span className="font-medium text-gray-800">{wardRound.registrar || 'Dr. Ochieng'}</span></p>
            <p className="text-gray-500">Team: <span className="text-gray-800">{wardRound.teamMembers.join(', ') || 'Intern, Student'}</span></p>
          </div>
        </div>

        {/* ── Today's Summary (generated) ─────────────────────────────── */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Today's Summary</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {wardRound.summary || 'Summary not yet generated.'}
          </p>
        </div>
      </div>

      {/* ── Round Presentation Card ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Round Presentation</h2>
          <button
            onClick={() => onEdit?.('presentation')}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
          <PresentationLine label="Patient" value={pres.identification || `${d.name}, ${d.ageYears > 0 ? d.ageYears : d.ageMonths} months, ${d.sex}`} />
          <PresentationLine label="Summary" value={pres.oneLineSummary || `${hospitalDay.soap.assessment || 'Clinically stable'}`} />
          <PresentationLine label="Diagnosis" value={pres.diagnosis || encounter.provisionalDiagnosis?.diagnosis || 'Undifferentiated'} />
          {pres.problems.length > 0 && <PresentationLine label="Problems" value={pres.problems.join('; ')} />}
          {pres.overnightEvents.length > 0 && (
            <PresentationLine label="Overnight Events" value={pres.overnightEvents.map(e => `• ${e}`).join('\n')} />
          )}
          <PresentationLine label="Vitals" value={pres.vitals || buildVitalsString(hospitalDay)} />
          <PresentationLine label="Medications" value={pres.medications || hospitalDay.medications.map(m => `${m.genericName} ${m.dosage}`).join(', ')} />
          {pres.labs && <PresentationLine label="Labs" value={pres.labs} />}
          {pres.imaging && <PresentationLine label="Imaging" value={pres.imaging} />}
          <PresentationLine label="Assessment" value={pres.assessment || hospitalDay.soap.assessment} />
          <PresentationLine label="Plan" value={pres.plan || hospitalDay.soap.plan} />
        </div>
      </div>

      {/* ── SOAP Note ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Today's SOAP Note</h2>
          <button
            onClick={() => onEdit?.('soap')}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'S — Subjective', content: hospitalDay.soap.subjective || wardRound.soap.subjective },
            { label: 'O — Objective', content: hospitalDay.soap.objective || wardRound.soap.objective },
            { label: 'A — Assessment', content: hospitalDay.soap.assessment || wardRound.soap.assessment },
            { label: 'P — Plan', content: hospitalDay.soap.plan || wardRound.soap.plan },
          ].map(section => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{section.label}</p>
              <div className="text-sm text-gray-800 leading-relaxed min-h-[2em] p-2 bg-gray-50 rounded border border-gray-100">
                {section.content || 'Click to document...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
          Generate PDF
        </button>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
        >
          Complete Ward Round
        </button>
      </div>
    </div>
  );
}

function PresentationLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="font-semibold text-gray-600 w-28 shrink-0">{label}:</span>
      <span className="text-gray-800 whitespace-pre-line">{value || '—'}</span>
    </div>
  );
}

function buildVitalsString(day: HospitalDay): string {
  const v = day.vitals;
  const parts: string[] = [];
  if (v.tempMin !== undefined) parts.push(`Temp ${v.tempMin}°C`);
  if (v.hrMin !== undefined) parts.push(`HR ${v.hrMin}/min`);
  if (v.rrMin !== undefined) parts.push(`RR ${v.rrMin}/min`);
  if (v.bpSystolicMin !== undefined && v.bpSystolicMax !== undefined)
    parts.push(`BP ${v.bpSystolicMin}/${v.bpSystolicMax !== undefined ? v.bpSystolicMax : ''}`);
  if (v.spo2Min !== undefined) parts.push(`SpO₂ ${v.spo2Min}%`);
  return parts.join(', ') || 'Not recorded';
}
