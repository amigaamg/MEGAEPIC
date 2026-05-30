'use client';
import React, { useState } from 'react';
import type { RegistrationData } from '@/types/encounter';

interface RegistrationPhaseProps {
  onSave: (data: RegistrationData) => Promise<void>;
  onComplete: () => void;
  initialData?: Partial<RegistrationData>;
}

export function RegistrationPhase({ onSave, onComplete, initialData }: RegistrationPhaseProps) {
  const [form, setForm] = useState<RegistrationData>({
    encounterType: initialData?.encounterType || 'emergency',
    referringFacility: initialData?.referringFacility || '',
    consultant: initialData?.consultant || '',
    ward: initialData?.ward || '',
    bed: initialData?.bed || '',
    surgicalRisk: initialData?.surgicalRisk || {
      bloodGroup: '',
      allergies: [],
      anticoagulants: [],
      previousSurgery: false,
    },
  });
  const [saving, setSaving] = useState(false);
  const [allergyInput, setAllergyInput] = useState('');
  const [anticoagulantInput, setAnticoagulantInput] = useState('');

  const update = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addItem = (field: 'allergies' | 'anticoagulants', value: string) => {
    if (!value.trim()) return;
    setForm((prev) => ({
      ...prev,
      surgicalRisk: {
        ...prev.surgicalRisk!,
        [field]: [...(prev.surgicalRisk?.[field] || []), value.trim()],
      },
    }));
    field === 'allergies' ? setAllergyInput('') : setAnticoagulantInput('');
  };

  const removeItem = (field: 'allergies' | 'anticoagulants', index: number) => {
    setForm((prev) => ({
      ...prev,
      surgicalRisk: {
        ...prev.surgicalRisk!,
        [field]: (prev.surgicalRisk?.[field] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Encounter Type</label>
          <select value={form.encounterType} onChange={(e) => update('encounterType', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="emergency">Emergency</option>
            <option value="inpatient">Inpatient Admission</option>
            <option value="outpatient">Outpatient</option>
            <option value="elective">Elective Surgery</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referring Facility</label>
          <input type="text" value={form.referringFacility} onChange={(e) => update('referringFacility', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Aga Khan Hospital" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Consultant</label>
          <input type="text" value={form.consultant} onChange={(e) => update('consultant', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Consultant name" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
            <input type="text" value={form.ward} onChange={(e) => update('ward', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Surgical Ward" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bed</label>
            <input type="text" value={form.bed} onChange={(e) => update('bed', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="12" />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-800 mb-3">Surgical Risk Assessment</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select value={form.surgicalRisk?.bloodGroup || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, surgicalRisk: { ...prev.surgicalRisk!, bloodGroup: e.target.value } }))}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous Surgery</label>
            <select value={form.surgicalRisk?.previousSurgery ? 'yes' : 'no'}
              onChange={(e) => setForm((prev) => ({ ...prev, surgicalRisk: { ...prev.surgicalRisk!, previousSurgery: e.target.value === 'yes' } }))}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
          <div className="flex gap-2 mb-1">
            <input type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('allergies', allergyInput)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Add allergy and press Enter" />
            <button type="button" onClick={() => addItem('allergies', allergyInput)}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Add</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(form.surgicalRisk?.allergies || []).map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                {a}
                <button onClick={() => removeItem('allergies', i)} className="hover:text-red-900">&times;</button>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Anticoagulants</label>
          <div className="flex gap-2 mb-1">
            <input type="text" value={anticoagulantInput} onChange={(e) => setAnticoagulantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('anticoagulants', anticoagulantInput)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Add anticoagulant" />
            <button type="button" onClick={() => addItem('anticoagulants', anticoagulantInput)}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">Add</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(form.surgicalRisk?.anticoagulants || []).map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                {a}
                <button onClick={() => removeItem('anticoagulants', i)} className="hover:text-amber-900">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}
