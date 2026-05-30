'use client';
import React, { useState } from 'react';
import type { TreatmentEntry } from '@/types/encounter';
import { getDiseaseById } from '@/engine/knowledge-graph';

interface TreatmentPhaseProps {
  topDiseaseIds: string[];
  existingTreatments: TreatmentEntry[];
  onSave: (planType: string, items: string[], definitiveProcedure?: string) => Promise<void>;
  onComplete: () => void;
}

function extractManagement(diseaseIds: string[]): { initial: string[]; definitive: string[]; postop: string[] } {
  const result = { initial: [] as string[], definitive: [] as string[], postop: [] as string[] };
  const seen = { initial: new Set<string>(), definitive: new Set<string>(), postop: new Set<string>() };

  for (const did of diseaseIds) {
    const disease = getDiseaseById(did);
    if (!disease) continue;
    const mgmt = disease.management;
    if (mgmt?.pathways) {
      for (const p of mgmt.pathways) {
        if (typeof p.treatment === 'string') {
          const items = p.treatment.split('.').map((s) => s.trim()).filter(Boolean);
          for (const item of items) {
            if (p.severity.includes('non') || p.severity.includes('mild')) {
              if (!seen.initial.has(item)) { seen.initial.add(item); result.initial.push(item); }
            } else {
              if (!seen.definitive.has(item)) { seen.definitive.add(item); result.definitive.push(item); }
            }
          }
        }
      }
    }
    const legacy = (disease as any).management;
    if (Array.isArray(legacy)) {
      legacy.forEach((m: any) => {
        if (m.steps) {
          m.steps.forEach((s: string) => {
            if (!seen.initial.has(s)) { seen.initial.add(s); result.initial.push(s); }
          });
        }
      });
    }
  }

  return result;
}

const DEFAULT_PROCEDURES = [
  'Laparoscopic appendicectomy',
  'Open appendicectomy',
  'Laparoscopic cholecystectomy',
  'Open cholecystectomy',
  'Exploratory laparotomy',
  'Hernia repair (open)',
  'Hernia repair (laparoscopic)',
  'Bowel resection and anastomosis',
  'Colostomy formation',
  'Abscess drainage',
];

export function TreatmentPhase({ topDiseaseIds, existingTreatments, onSave, onComplete }: TreatmentPhaseProps) {
  const [plan] = useState(() => extractManagement(topDiseaseIds));
  const [activeTab, setActiveTab] = useState<'initial' | 'definitive' | 'postop'>('initial');
  const [items, setItems] = useState<Record<string, string[]>>({
    initial: existingTreatments.find((t) => t.planType === 'initial')?.items || plan.initial,
    definitive: existingTreatments.find((t) => t.planType === 'definitive')?.items || plan.definitive,
    postop: existingTreatments.find((t) => t.planType === 'postop')?.items || plan.postop,
  });
  const [definitiveProcedure, setDefinitiveProcedure] = useState(
    existingTreatments.find((t) => t.planType === 'definitive')?.definitiveProcedure || '',
  );
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], newItem.trim()] }));
    setNewItem('');
  };

  const removeItem = (index: number) => {
    setItems((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((_, i) => i !== index) }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    await onSave('initial', items.initial);
    await onSave('definitive', items.definitive, definitiveProcedure);
    await onSave('postop', items.postop);
    onComplete();
    setSaving(false);
  };

  const tabs = [
    { id: 'initial' as const, label: 'Initial Management' },
    { id: 'definitive' as const, label: 'Definitive Procedure' },
    { id: 'postop' as const, label: 'Post-op Care' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items[activeTab].map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 border rounded text-sm">
            <span className="flex-1">{item}</span>
            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">&times;</button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          placeholder="Add management item..."
        />
        <button onClick={addItem} className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
          Add
        </button>
      </div>

      {activeTab === 'definitive' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Definitive Procedure</label>
          <select
            value={definitiveProcedure}
            onChange={(e) => setDefinitiveProcedure(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Select procedure...</option>
            {DEFAULT_PROCEDURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <button onClick={handleSaveAll} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? 'Saving...' : 'Save All Plans & Continue'}
        </button>
      </div>
    </div>
  );
}
