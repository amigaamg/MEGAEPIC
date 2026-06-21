'use client';
import { useState, useMemo } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { getEducation, type DiseaseEducation } from '@/lib/history-engine/educationRegistry';

export default function EducationPanel() {
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const ddx = useHistoryStore(s => s.ddx);
  const provisional = useHistoryStore(s => s.provisionalDiagnosis);

  const educations = useMemo(() => {
    const ids = ddx.probabilities.map(p => p.diseaseId);
    return ids.map(id => getEducation(id)).filter(Boolean) as DiseaseEducation[];
  }, [ddx]);

  const selected = selectedDisease
    ? getEducation(selectedDisease)
    : educations[0];

  if (educations.length === 0 && !provisional) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">📚</div>
        <p className="text-[var(--text-primary)] font-medium">No educational content available yet.</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Complete the history and clinical reasoning to see relevant case education.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[var(--accent)]">📚 Case Education</h2>
          {provisional && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent)]">
              {provisional.diagnosis}
            </span>
          )}
        </div>
      </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — Disease list */}
          <div className="w-48 shrink-0 border-r border-[var(--border)] overflow-y-auto p-2 space-y-1">
            {educations.map(edu => (
              <button key={edu.diseaseId} onClick={() => setSelectedDisease(edu.diseaseId)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  selectedDisease === edu.diseaseId || (!selectedDisease && edu === educations[0])
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}>
                <div className="font-medium">{edu.diseaseName}</div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{edu.epidemiology.slice(0, 60)}...</div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selected && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{selected.diseaseName}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{selected.overview}</p>
                </div>

                <Section title="Epidemiology" text={selected.epidemiology} />
                <Section title="Risk Factors" items={selected.riskFactors} />
                <Section title="Typical Presentation" items={selected.typicalPresentation} />
                <Section title="Clinical Signs" items={selected.clinicalSigns} />
                <Section title="Diagnostic Criteria" text={selected.diagnosticCriteria} />
                <Section title="First-Line Treatment" text={selected.firstLineTreatment} />
                <Section title="Complications" items={selected.complications} />
                <Section title="Prognosis" text={selected.prognosis} />
                <Section title="Prevention" items={selected.prevention} />
                <Section title="Patient Education" items={selected.patientEducation} />
                <Section title="References" items={selected.references} />
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

function Section({ title, text, items }: { title: string; text?: string; items?: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-[var(--accent)] mb-1">{title}</h4>
      {text && <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{text}</p>}
      {items && (
        <ul className="space-y-0.5 mt-1">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
              <span className="text-[var(--accent)] mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
