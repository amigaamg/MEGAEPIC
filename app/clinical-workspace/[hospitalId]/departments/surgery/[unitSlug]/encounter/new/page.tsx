'use client';
import React, { useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createEncounter } from '@/src/services/encounterService';
import { RegistrationPhase } from '@/src/components/encounter/RegistrationPhase';
import type { RegistrationData } from '@/src/types/encounter';

const MOCK_PATIENTS = [
  { id: 'P001', name: 'Amara Nwosu', gender: 'F', age: 34 },
  { id: 'P002', name: 'John Kamau', gender: 'M', age: 58 },
  { id: 'P003', name: 'Mary Wanjiku', gender: 'F', age: 42 },
  { id: 'P004', name: 'Baby Ochieng', gender: 'M', age: 2 },
  { id: 'P005', name: 'James Otieno', gender: 'M', age: 67 },
  { id: 'P006', name: 'Grace Mwangi', gender: 'F', age: 29 },
  { id: 'P007', name: 'Samuel Kiprop', gender: 'M', age: 45 },
  { id: 'P008', name: 'Faith Akinyi', gender: 'F', age: 31 },
];

export default function NewSurgeryEncounterPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hospitalId = params?.hospitalId as string;
  const unitSlug = params?.unitSlug as string;

  const presetType = searchParams?.get('type') || 'emergency';
  const presetDisease = searchParams?.get('disease') || '';

  const [step, setStep] = useState<'patient' | 'registration'>('patient');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return [];
    const q = patientSearch.toLowerCase();
    return MOCK_PATIENTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [patientSearch]);

  const handleRegistrationComplete = async (regData: RegistrationData) => {
    if (!selectedPatient) return;
    setCreating(true);
    try {
      const encounterId = await createEncounter({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        departmentSlug: 'SURG',
        unitSlug,
        encounterType: regData.encounterType,
        consultant: regData.consultant,
        ward: regData.ward,
        bed: regData.bed,
        createdBy: 'dr_current',
      });
      router.push(
        `/clinical-workspace/${hospitalId}/departments/surgery/${unitSlug}/encounter/${encounterId}`
      );
    } catch (err) {
      console.error('Failed to create encounter:', err);
      setCreating(false);
    }
  };

  if (step === 'patient') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">New Encounter</h1>
          <p className="text-sm text-gray-500">Select a patient to begin</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Patient</label>
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
            placeholder="Search by name or MRN..."
            className="w-full px-4 py-2.5 border rounded-lg text-sm"
            autoFocus
          />
          {patientSearch && !selectedPatient && (
            <div className="mt-2 border rounded-lg overflow-hidden">
              {filteredPatients.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">No patients found</p>
              ) : (
                filteredPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setPatientSearch(p.name); }}
                    className="w-full text-left px-4 py-3 text-sm border-b last:border-b-0 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="font-mono text-xs text-blue-600">{p.id}</span>
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.gender}, {p.age}y</span>
                  </button>
                ))
              )}
            </div>
          )}
          {selectedPatient && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium text-gray-800">{selectedPatient.name}</span>
              <span className="text-xs text-gray-400 font-mono">{selectedPatient.id}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setStep('registration')}
            disabled={!selectedPatient}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            Continue to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep('patient')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Patient Registration</h1>
          <p className="text-sm text-gray-500">
            {selectedPatient?.name} · {unitSlug?.replace(/-/g, ' ')}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <RegistrationPhase
          onSave={handleRegistrationComplete}
          onComplete={() => {}}
          initialData={{ encounterType: presetType === 'inpatient' ? 'inpatient' : presetType === 'emergency' ? 'emergency' : 'outpatient' }}
        />
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-sm text-gray-600">Creating encounter...</p>
          </div>
        </div>
      )}
    </div>
  );
}
