'use client';
import React, { useState } from 'react';
import type { InvestigationEntry } from '@/types/encounter';
import { getDiseaseById } from '@/engine/knowledge-graph';
import { interpretLabResult, type LabResult } from '@/engine/clinical-rules/auto-interpretation';

interface InvestigationsPhaseProps {
  topDiseaseIds: string[];
  existingInvestigations: InvestigationEntry[];
  onOrder: (testName: string) => Promise<void>;
  onResult: (testId: string, testName: string, value: number, unit: string, refLow: number, refHigh: number) => Promise<void>;
  onComplete: () => void;
}

function extractLabTests(diseaseIds: string[]): string[] {
  const seen = new Set<string>();
  const tests: string[] = [];
  for (const did of diseaseIds) {
    const disease = getDiseaseById(did);
    if (!disease) continue;
    const inv = (disease as any).investigations;
    if (inv) {
      if (Array.isArray(inv)) {
        inv.forEach((i: any) => { if (i.name && !seen.has(i.name)) { seen.add(i.name); tests.push(i.name); } });
      } else {
        const lab = inv.laboratory || inv.lab || [];
        lab.forEach((i: any) => { if (i.name && !seen.has(i.name)) { seen.add(i.name); tests.push(i.name); } });
      }
    }
  }
  return tests;
}

export function InvestigationsPhase({ topDiseaseIds, existingInvestigations, onOrder, onResult, onComplete }: InvestigationsPhaseProps) {
  const [tests] = useState(() => extractLabTests(topDiseaseIds));
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const orderedIds = new Set(existingInvestigations.filter((i) => i.status === 'ordered' || i.status === 'resulted').map((i) => i.testName));
  const resultedIds = new Set(existingInvestigations.filter((i) => i.status === 'resulted').map((i) => i.testName));

  const handleOrder = async (testName: string) => {
    await onOrder(testName);
  };

  const handleResult = async (testName: string) => {
    const val = parseFloat(resultInputs[testName]);
    if (isNaN(val)) return;
    await onResult(testName, testName, val, 'units', 0, 100);
    setResultInputs((prev) => ({ ...prev, [testName]: '' }));
  };

  const handleComplete = async () => {
    setSaving(true);
    onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {tests.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-1">No investigations recommended</p>
          <p className="text-sm">Complete the DDX to see recommended tests</p>
        </div>
      )}

      {tests.map((testName) => {
        const isOrdered = orderedIds.has(testName);
        const isResulted = resultedIds.has(testName);
        const existing = existingInvestigations.find((i) => i.testName === testName);

        return (
          <div key={testName} className="flex items-center gap-3 p-3 border rounded-lg">
            <span className="flex-1 text-sm font-medium text-gray-700">{testName}</span>

            {!isOrdered && (
              <button onClick={() => handleOrder(testName)}
                className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                Order
              </button>
            )}

            {isOrdered && !isResulted && (
              <div className="flex items-center gap-2">
                <input
                  type="number" step="0.1"
                  value={resultInputs[testName] || ''}
                  onChange={(e) => setResultInputs((prev) => ({ ...prev, [testName]: e.target.value }))}
                  className="w-20 px-2 py-1 text-xs border rounded"
                  placeholder="Result"
                />
                <button onClick={() => handleResult(testName)}
                  disabled={!resultInputs[testName]}
                  className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50">
                  Enter
                </button>
              </div>
            )}

            {isResulted && existing && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  existing.flag === 'critical' ? 'bg-red-100 text-red-700'
                  : existing.flag === 'abnormal' ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
                }`}>
                  {existing.flag}
                </span>
                <span className="text-sm font-mono">{JSON.stringify(existing.result)}</span>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-end pt-4 border-t">
        <button onClick={handleComplete} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          Continue
        </button>
      </div>
    </div>
  );
}
