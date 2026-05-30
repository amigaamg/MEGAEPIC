'use client';
import React from 'react';
import { calculateAlvarado, type AlvaradoInput } from '@/engine/clinical-rules/alvarado';

interface BedsideScorePhaseProps {
  onSave: (scoreName: string, totalPoints: number, maxPoints: number, riskCategory: string, components: any[]) => Promise<void>;
  onComplete: () => void;
  existingHpi: Record<string, boolean | string>;
  existingExam: Record<string, boolean | null>;
}

export function BedsideScorePhase({ onSave, onComplete, existingHpi, existingExam }: BedsideScorePhaseProps) {
  const [saving, setSaving] = React.useState(false);

  const alvaradoInput: AlvaradoInput = {
    migratoryPain: existingHpi['migratory_rlq'] === true || existingHpi['pain_migration'] === true,
    anorexia: existingHpi['anorexia'] === true,
    nauseaVomiting: existingHpi['nausea_vomiting'] === true,
    rlqTenderness: existingExam['rlq_tenderness'] === true,
    reboundPain: existingExam['rebound_tenderness'] === true,
    fever: (existingHpi['fever'] === true) || false,
    leukocytosis: false,
    leftShift: false,
  };

  const alvarado = calculateAlvarado(alvaradoInput);

  const handleSave = async () => {
    setSaving(true);
    await onSave('Alvarado Score', alvarado.totalPoints, 10, alvarado.riskCategory, alvarado.components);
    onComplete();
    setSaving(false);
  };

  const colorMap: Record<string, string> = {
    low: 'bg-green-50 border-green-300 text-green-700',
    moderate: 'bg-amber-50 border-amber-300 text-amber-700',
    high: 'bg-orange-50 border-orange-300 text-orange-700',
    very_high: 'bg-red-50 border-red-300 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-gray-50">
        <h4 className="font-medium text-gray-800 mb-1">Alvarado Score (Appendicitis)</h4>
        <p className={`text-sm px-3 py-2 rounded border ${colorMap[alvarado.riskCategory] || ''}`}>
          <strong>{alvarado.totalPoints}/10</strong> — {alvarado.riskCategory.replace(/_/g, ' ').toUpperCase()} risk
        </p>
        <p className="text-sm text-gray-600 mt-1">{alvarado.recommendation}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 text-sm">Score Components</h4>
        {alvarado.components.map((c, i) => (
          <div key={i} className="flex items-center gap-3 p-2 border rounded text-sm">
            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
              c.met ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {c.met ? '✓' : '○'}
            </span>
            <span className="flex-1">{c.name}</span>
            <span className="text-gray-400 font-mono">{c.met ? `+${c.points}` : '0'}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? 'Saving...' : 'Save Scores & Continue'}
        </button>
      </div>
    </div>
  );
}
