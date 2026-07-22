'use client';
import React, { useState, useMemo } from 'react';
import { useEncounter } from '@/lib/amexan/encounter';
import type { SymptomId, StructuredSymptom } from '@/lib/amexan/encounter/encounterState';

const SUGGESTED_COMPLAINTS = [
  'Abdominal pain', 'Chest pain', 'Headache', 'Fever', 'Cough',
  'Shortness of breath', 'Nausea and vomiting', 'Diarrhea',
  'Vaginal bleeding', 'Seizures', 'Dizziness', 'Fainting',
  'Palpitations', 'Back pain', 'Painful urination', 'Rash',
  'Joint pain', 'Fatigue', 'Weight loss', 'Constipation',
  'Blood in stool', 'Jaundice', 'Abdominal swelling',
];

const COMPLAINT_TO_SYMPTOM: Record<string, SymptomId> = {
  'Abdominal pain': 'abdominal_pain',
  'Abdominal swelling': 'distension',
  'Back pain': 'back_pain',
  'Blood in stool': 'gi_bleeding',
  'Chest pain': 'chest_pain',
  'Constipation': 'constipation',
  'Cough': 'cough',
  'Diarrhea': 'diarrhea',
  'Dizziness': 'dizziness',
  'Fainting': 'syncope',
  'Fatigue': 'fatigue',
  'Fever': 'fever',
  'Headache': 'headache',
  'Jaundice': 'jaundice',
  'Joint pain': 'joint_pain',
  'Nausea and vomiting': 'nausea_vomiting',
  'Painful urination': 'dysuria',
  'Palpitations': 'palpitations',
  'Rash': 'rash',
  'Seizures': 'seizure',
  'Shortness of breath': 'dyspnea',
  'Vaginal bleeding': 'vaginal_bleeding',
  'Weight loss': 'weight_loss',
};

interface ComplaintPhaseProps {
  onComplete?: () => void;
}

export function ComplaintPhase({ onComplete }: ComplaintPhaseProps) {
  const { state, setChiefComplaint, activateSymptom } = useEncounter();
  const [complaint, setComplaint] = useState(state.chiefComplaint.text || '');
  const [duration, setDuration] = useState(state.chiefComplaint.duration || '');
  const [severity, setSeverity] = useState(state.chiefComplaint.severity || 5);
  const [customMode, setCustomMode] = useState(false);

  const handleSave = () => {
    if (!complaint.trim()) return;
    setChiefComplaint(complaint, duration, severity);

    // Auto-activate symptom schema based on chief complaint
    // Only set present:true — leave all fields undefined so the question engine asks them
    const symptomId = COMPLAINT_TO_SYMPTOM[complaint];
    if (symptomId && !state.symptoms[symptomId]) {
      activateSymptom({ id: symptomId, present: true } as StructuredSymptom);
    }

    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span className="text-lg">🗣️</span>
        <span className="text-sm font-semibold text-gray-700">Presenting Complaint</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">What is the main problem?</label>
          <button
            onClick={() => setCustomMode(!customMode)}
            className="text-[11px] text-blue-600 hover:text-blue-800"
          >
            {customMode ? 'Pick from list' : 'Type manually'}
          </button>
        </div>

        {customMode ? (
          <input
            type="text"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Enter the presenting complaint..."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_COMPLAINTS.map((c) => (
              <button
                key={c}
                onClick={() => setComplaint(c)}
                className={`px-3 py-2 text-sm rounded-lg border text-left transition-colors ${
                  complaint === c
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-lg text-sm"
            placeholder="e.g., 3 days, 6 hours"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Severity ({severity}/10)
          </label>
          <input
            type="range"
            min={1} max={10}
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value))}
            className="w-full h-1.5 accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Mild</span>
            <span>Severe</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={!complaint.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
