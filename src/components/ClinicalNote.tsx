'use client';
// ─── AMEXAN — ClinicalNote ───────────────────────────────────────────────────
import { useState } from 'react';
import { ClinicalNote as ClinicalNoteType } from '@/src/types';
import { formatSOAP } from '@/src/engine/summaryEngine';

interface Props {
  note: ClinicalNoteType;
  patientName?: string;
  onNewConsultation: () => void;
}

export function ClinicalNote({ note, patientName, onNewConsultation }: Props) {
  const [copied, setCopied] = useState(false);

  const soapText = formatSOAP(note, patientName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(soapText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityColor = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    severe:   'text-orange-600 bg-orange-50 border-orange-200',
    moderate: 'text-amber-600 bg-amber-50 border-amber-200',
    mild:     'text-green-600 bg-green-50 border-green-200',
  }[note.severity.level];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Clinical Note</h2>
          <p className="text-xs text-gray-400">
            Generated {note.timestamp.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {copied ? '✓ Copied' : '⎘ Copy SOAP'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ⎙ Print
          </button>
        </div>
      </div>

      {/* Severity badge */}
      <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border ${severityColor} w-fit`}>
        <span>Severity: {note.severity.level.toUpperCase()}</span>
        {note.severity.redFlags.length > 0 && (
          <span className="opacity-60">· {note.severity.redFlags.length} red flag{note.severity.redFlags.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* HPI */}
      <Section title="History of Presenting Illness">
        <p className="text-sm text-gray-700 leading-relaxed">{note.hpi}</p>
      </Section>

      {/* Differentials */}
      <Section title="Differential Diagnoses">
        <ol className="flex flex-col gap-2">
          {note.differentials.map((dx, i) => (
            <li key={dx.diseaseId} className="flex items-center gap-3 text-sm">
              <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
              <span className="font-medium text-gray-800">{dx.name}</span>
              <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                dx.confidence === 'high'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                dx.confidence === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                             'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {dx.confidence.toUpperCase()}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Investigations */}
      <Section title="Investigations">
        <ul className="flex flex-col gap-2">
          {note.investigations.map((inv, i) => {
            const isUrgent = inv.startsWith('[URGENT]');
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`shrink-0 mt-0.5 text-[10px] font-bold px-1 py-0.5 rounded ${
                  isUrgent ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isUrgent ? 'URGENT' : 'ROU'}
                </span>
                <span className="text-gray-700">{inv.replace(/^\[(URGENT|ROUTINE|IF_UNCERTAIN)\] /, '')}</span>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Management */}
      <Section title="Management Plan">
        <ul className="flex flex-col gap-3">
          {note.management.map((item, i) => {
            const [title, ...rest] = item.split(': ');
            return (
              <li key={i} className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-800">{title}</span>
                {rest.length > 0 && (
                  <span className="text-sm text-gray-600">{rest.join(': ')}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <p className="text-sm text-gray-700 leading-relaxed">{note.summary}</p>
      </Section>

      {/* New consultation */}
      <button
        onClick={onNewConsultation}
        className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        New Consultation
      </button>
    </div>
  );
}

// ─── Small section wrapper ────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}