'use client';
import React, { useState } from 'react';
import type { ImagingEntry } from '@/types/encounter';
import { getDiseaseById } from '@/engine/knowledge-graph';

interface ImagingPhaseProps {
  topDiseaseIds: string[];
  existingImages: ImagingEntry[];
  onOrder: (studyName: string) => Promise<void>;
  onResult: (studyName: string, finding: string, impression: string, positive: boolean) => Promise<void>;
  onComplete: () => void;
}

function extractImagingStudies(diseaseIds: string[]): string[] {
  const seen = new Set<string>();
  const studies: string[] = [];
  for (const did of diseaseIds) {
    const disease = getDiseaseById(did);
    if (!disease) continue;
    const inv = (disease as any).investigations;
    if (inv) {
      const img = inv.imaging || [];
      img.forEach((i: any) => {
        if (i.name && !seen.has(i.name)) { seen.add(i.name); studies.push(i.name); }
      });
    }
  }
  return studies;
}

export function ImagingPhase({ topDiseaseIds, existingImages, onOrder, onResult, onComplete }: ImagingPhaseProps) {
  const [studies] = useState(() => extractImagingStudies(topDiseaseIds));
  const [findingInputs, setFindingInputs] = useState<Record<string, string>>({});
  const [impressionInputs, setImpressionInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const orderedIds = new Set(existingImages.filter((i) => i.status === 'ordered').map((i) => i.studyName));

  const handleOrder = async (studyName: string) => {
    await onOrder(studyName);
  };

  const handleResult = async (studyName: string) => {
    const finding = findingInputs[studyName] || '';
    const impression = impressionInputs[studyName] || '';
    const positiveKeywords = ['dilated', 'enlarged', 'thickened', 'positive', 'abscess', 'mass', 'perforation', 'obstruction', 'stone', 'fluid'];
    const positive = positiveKeywords.some((kw) => finding.toLowerCase().includes(kw));
    await onResult(studyName, finding, impression, positive);
    setFindingInputs((prev) => ({ ...prev, [studyName]: '' }));
    setImpressionInputs((prev) => ({ ...prev, [studyName]: '' }));
  };

  const handleComplete = async () => {
    setSaving(true);
    onComplete();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {studies.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-lg mb-1">No imaging studies recommended</p>
          <p className="text-sm">Complete the DDX to see recommendations</p>
        </div>
      )}

      {studies.map((studyName) => {
        const isOrdered = orderedIds.has(studyName) || existingImages.some((i) => i.studyName === studyName && i.status === 'completed');
        const existing = existingImages.find((i) => i.studyName === studyName);

        return (
          <div key={studyName} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{studyName}</span>
              {!isOrdered && (
                <button onClick={() => handleOrder(studyName)}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  Order
                </button>
              )}
            </div>

            {isOrdered && !existing?.finding && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={findingInputs[studyName] || ''}
                  onChange={(e) => setFindingInputs((prev) => ({ ...prev, [studyName]: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border rounded"
                  placeholder="Radiology findings..."
                />
                <input
                  type="text"
                  value={impressionInputs[studyName] || ''}
                  onChange={(e) => setImpressionInputs((prev) => ({ ...prev, [studyName]: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs border rounded"
                  placeholder="Impression..."
                />
                <button onClick={() => handleResult(studyName)}
                  disabled={!findingInputs[studyName]}
                  className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50">
                  Save Findings
                </button>
              </div>
            )}

            {existing?.finding && (
              <div className="text-xs text-gray-600">
                <p><strong>Finding:</strong> {existing.finding}</p>
                <p><strong>Impression:</strong> {existing.impression}</p>
                <span className={`inline-block px-2 py-0.5 mt-1 rounded-full ${
                  existing.ddxImpact > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {existing.ddxImpact > 0 ? 'Supports diagnosis' : 'Non-contributory'}
                </span>
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
