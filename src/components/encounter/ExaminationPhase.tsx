'use client';
import React, { useState, useCallback } from 'react';
import type { ExamEntry } from '@/types/encounter';
import { getDiseaseById } from '@/engine/knowledge-graph';

interface ExaminationPhaseProps {
  topDiseaseIds: string[];
  existingFindings: ExamEntry[];
  onFindingChange: (findingId: string, findingText: string, present: boolean | null, value?: number, comment?: string) => Promise<void>;
  onComplete: () => void;
}

function loadFindingTemplates(diseaseIds: string[]): { id: string; finding: string; type: 'boolean' | 'numeric' }[] {
  const seen = new Set<string>();
  const findings: { id: string; finding: string; type: 'boolean' | 'numeric' }[] = [];
  for (const did of diseaseIds) {
    const disease = getDiseaseById(did);
    if (!disease) continue;
    const ef = disease.examFeatures || [];
    const legacy = (disease as any).examination_findings || [];
    const allF = ef.length > 0 ? ef : legacy;
    for (const f of allF) {
      const fText = (f as any).finding || f.signId?.replace(/_/g, ' ') || f.signId || '';
      const fId = f.signId || f.id || `finding_${fText}`;
      if (!seen.has(fId) && fText) {
        seen.add(fId);
        findings.push({ id: fId, finding: fText, type: (f as any).type || 'boolean' });
      }
    }
  }
  return findings;
}

const VITAL_SIGNS = [
  { id: 'bp_systolic', finding: 'Blood Pressure (Systolic)', type: 'numeric' as const },
  { id: 'heart_rate', finding: 'Heart Rate', type: 'numeric' as const },
  { id: 'respiratory_rate', finding: 'Respiratory Rate', type: 'numeric' as const },
  { id: 'temperature', finding: 'Temperature (°C)', type: 'numeric' as const },
  { id: 'spo2', finding: 'SpO2 (%)', type: 'numeric' as const },
];

export function ExaminationPhase({ topDiseaseIds, existingFindings, onFindingChange, onComplete }: ExaminationPhaseProps) {
  const [templates] = useState(() => loadFindingTemplates(topDiseaseIds));
  const [findings, setFindings] = useState<Record<string, { present: boolean | null; value?: number; comment?: string }>>(() => {
    const map: Record<string, any> = {};
    existingFindings.forEach((f) => { map[f.findingId] = { present: f.present, value: f.value, comment: f.comment }; });
    return map;
  });
  const [saving, setSaving] = useState(false);

  const updateFinding = useCallback(async (id: string, finding: string, present: boolean | null, value?: number, comment?: string) => {
    setFindings((prev) => ({ ...prev, [id]: { present, value, comment } }));
    await onFindingChange(id, finding, present, value, comment);
  }, [onFindingChange]);

  const handleComplete = async () => {
    setSaving(true);
    for (const t of templates) {
      if (findings[t.id] === undefined) {
        await onFindingChange(t.id, t.finding, null);
      }
    }
    for (const v of VITAL_SIGNS) {
      if (findings[v.id] === undefined) {
        await onFindingChange(v.id, v.finding, null);
      }
    }
    onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Vital Signs</h4>
        <div className="grid grid-cols-3 gap-3">
          {VITAL_SIGNS.map((v) => (
            <div key={v.id} className="p-3 border rounded-lg">
              <label className="block text-xs font-medium text-gray-600 mb-1">{v.finding}</label>
              <input
                type="number"
                value={findings[v.id]?.value ?? ''}
                onChange={(e) => updateFinding(v.id, v.finding, true, parseFloat(e.target.value) || undefined)}
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Value"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-3">Systematic Examination</h4>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {templates.map((t) => {
            const f = findings[t.id];
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="flex-1 text-sm text-gray-700">{t.finding}</span>
                <div className="flex gap-1">
                  {(['present', 'absent', 'not_examined'] as const).map((state) => {
                    const isActive = state === 'present' ? f?.present === true
                      : state === 'absent' ? f?.present === false
                      : f?.present === null || f?.present === undefined;
                    return (
                      <button
                        key={state}
                        onClick={() => updateFinding(
                          t.id, t.finding,
                          state === 'present' ? true : state === 'absent' ? false : null,
                          f?.value,
                          f?.comment,
                        )}
                        className={`px-2 py-1 text-xs rounded ${
                          isActive
                            ? state === 'present' ? 'bg-green-100 text-green-700'
                              : state === 'absent' ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-500'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {state === 'present' ? 'Present' : state === 'absent' ? 'Absent' : 'N/E'}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={f?.comment || ''}
                  onChange={(e) => updateFinding(t.id, t.finding, f?.present ?? null, f?.value, e.target.value)}
                  className="w-28 px-2 py-1 text-xs border rounded"
                  placeholder="Comment"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button onClick={handleComplete} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? 'Saving...' : 'Complete Examination'}
        </button>
      </div>
    </div>
  );
}
