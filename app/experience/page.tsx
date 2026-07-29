'use client';

import React from 'react';
import { usePresentationStore } from '@/lib/amexan/presentation/store';
import { ACTORS, JOURNEYS } from '@/lib/amexan/constitution/books/book-II-experience';

export default function ExperienceHome() {
  const setActor = usePresentationStore((s) => s.setActor);
  const setPatient = usePresentationStore((s) => s.setPatient);
  const setJourney = usePresentationStore((s) => s.setJourney);
  const navigateToPhase = usePresentationStore((s) => s.navigateToPhase);
  const [patientId, setPatientId] = React.useState('P001');
  const [selectedActor, setSelectedActor] = React.useState('doctor');
  const [selectedJourney, setSelectedJourney] = React.useState('clinical_care');
  const [initialized, setInitialized] = React.useState(false);

  const handleStart = () => {
    setActor(selectedActor as any);
    setPatient(patientId);
    setJourney(selectedJourney as any);
    setInitialized(true);
    setTimeout(() => navigateToPhase(''), 100);
  };

  if (initialized) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">Launching Experience</h2>
          <p className="text-sm text-gray-500 mb-6">
            {ACTORS[selectedActor as keyof typeof ACTORS]?.label} &rarr; {JOURNEYS[selectedJourney as keyof typeof JOURNEYS]?.label}
          </p>
          <a
            href={`/experience/${selectedJourney}/_first`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            Enter {JOURNEYS[selectedJourney as keyof typeof JOURNEYS]?.label || 'Journey'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="text-4xl font-bold text-gray-900 mb-2">AMEXAN Experience Engine</div>
        <p className="text-gray-500">Configure your actor, patient, and journey to begin</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Actor</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(ACTORS).slice(0, 16).map(([id, def]) => (
              <button
                key={id}
                onClick={() => setSelectedActor(id)}
                className={`p-3 rounded-xl border text-center transition-all ${selectedActor === id ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
              >
                <div className="text-lg font-bold text-gray-700 mb-0.5">{def.label.charAt(0)}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{def.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Journey</label>
          <select
            value={selectedJourney}
            onChange={(e) => setSelectedJourney(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {Object.entries(JOURNEYS).map(([id, def]) => (
              <option key={id} value={id}>{def.label} ({def.actors.join(', ')})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="e.g. P001"
          />
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Launch Experience
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{Object.keys(ACTORS).length}</div>
          <div className="text-[11px] text-gray-500">Actors</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{Object.keys(JOURNEYS).length}</div>
          <div className="text-[11px] text-gray-500">Journeys</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">22+</div>
          <div className="text-[11px] text-gray-500">Card Types</div>
        </div>
      </div>
    </div>
  );
}