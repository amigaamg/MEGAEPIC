'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { EncounterProvider, useEncounter, WORKFLOW_ORDER } from '@/lib/amexan/encounter';
import type { WorkflowStep } from '@/lib/amexan/encounter/encounterState';
import { ComplaintPhase } from '@/src/components/encounter/ComplaintPhase';
import { HPIPhase } from '@/src/components/encounter/HPIPhase';
import { DDXPhase } from '@/src/components/encounter/DDXPhase';

function IntakePhase({ onComplete }: { onComplete: () => void }) {
  const { state, setPatientInfo } = useEncounter();
  const [name, setName] = useState(state.demographics.name || '');
  const [ageYears, setAgeYears] = useState(state.demographics.ageYears || 30);
  const [ageMonths, setAgeMonths] = useState(state.demographics.ageMonths || 360);
  const [sex, setSex] = useState<'male' | 'female' | 'other'>(state.demographics.sex || 'male');

  const handleSave = () => {
    setPatientInfo({ name, ageYears, ageMonths, sex, mrn: `MRN-${Date.now()}` });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span className="text-lg">📋</span>
        <span className="text-sm font-semibold text-gray-700">Patient Intake</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Patient Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Enter patient name..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Age (years)</label>
          <input type="number" value={ageYears} onChange={(e) => {
            const y = parseInt(e.target.value) || 0;
            setAgeYears(y);
            setAgeMonths(y * 12);
          }} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sex</label>
          <div className="flex gap-3">
            {(['male', 'female', 'other'] as const).map((s) => (
              <button key={s} onClick={() => setSex(s)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  sex === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button onClick={handleSave} disabled={!name.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          Save & Continue
        </button>
      </div>
    </div>
  );
}

function ExaminationPhase({ onComplete }: { onComplete?: () => void }) {
  const { state, dispatch } = useEncounter();
  const [vitals, setVitals] = useState({
    spo2: state.examination.vitals.spo2 ?? '',
    rr: state.examination.vitals.rr ?? '',
    hr: state.examination.vitals.hr ?? '',
    temp: state.examination.vitals.temp ?? '',
    bpSystolic: state.examination.vitals.bpSystolic ?? '',
    bpDiastolic: state.examination.vitals.bpDiastolic ?? '',
    weight: state.examination.vitals.weight ?? '',
    avpu: state.examination.vitals.avpu,
  });

  const handleSave = () => {
    dispatch({
      type: 'SET_VITALS',
      payload: {
        spo2: vitals.spo2 ? Number(vitals.spo2) : undefined,
        rr: vitals.rr ? Number(vitals.rr) : undefined,
        hr: vitals.hr ? Number(vitals.hr) : undefined,
        temp: vitals.temp ? Number(vitals.temp) : undefined,
        bpSystolic: vitals.bpSystolic ? Number(vitals.bpSystolic) : undefined,
        bpDiastolic: vitals.bpDiastolic ? Number(vitals.bpDiastolic) : undefined,
        weight: vitals.weight ? Number(vitals.weight) : undefined,
        avpu: vitals.avpu || 'alert',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span className="text-lg">🩺</span>
        <span className="text-sm font-semibold text-gray-700">Examination & Vitals</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">SpO2 (%)</label>
          <input type="number" value={vitals.spo2} onChange={(e) => setVitals(p => ({ ...p, spo2: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">RR (/min)</label>
          <input type="number" value={vitals.rr} onChange={(e) => setVitals(p => ({ ...p, rr: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">HR (/min)</label>
          <input type="number" value={vitals.hr} onChange={(e) => setVitals(p => ({ ...p, hr: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Temp (°C)</label>
          <input type="number" step="0.1" value={vitals.temp} onChange={(e) => setVitals(p => ({ ...p, temp: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">BP Systolic</label>
          <input type="number" value={vitals.bpSystolic} onChange={(e) => setVitals(p => ({ ...p, bpSystolic: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">BP Diastolic</label>
          <input type="number" value={vitals.bpDiastolic} onChange={(e) => setVitals(p => ({ ...p, bpDiastolic: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
          <input type="number" value={vitals.weight} onChange={(e) => setVitals(p => ({ ...p, weight: e.target.value }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">AVPU</label>
          <select value={vitals.avpu} onChange={(e) => setVitals(p => ({ ...p, avpu: e.target.value as any }))}
            className="w-full px-3 py-1.5 border rounded-lg text-sm">
            <option value="alert">Alert</option>
            <option value="voice">Responds to Voice</option>
            <option value="pain">Responds to Pain</option>
            <option value="unresponsive">Unresponsive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Save Vitals
        </button>
        <button onClick={() => { if (onComplete) onComplete(); }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          Continue
        </button>
      </div>
    </div>
  );
}

const STEP_LABELS: Record<string, { icon: string; label: string; desc: string }> = {
  intake: { icon: '📋', label: 'Intake', desc: 'Patient demographics' },
  chief_complaint: { icon: '🗣️', label: 'Complaint', desc: 'Presenting complaint' },
  history: { icon: '📝', label: 'History', desc: 'Symptom exploration' },
  examination: { icon: '🩺', label: 'Exam', desc: 'Vitals & physical exam' },
  investigations: { icon: '🧪', label: 'Labs', desc: 'Investigations & imaging' },
  assessment: { icon: '🧠', label: 'DDX', desc: 'Differential diagnosis' },
  plan: { icon: '💊', label: 'Plan', desc: 'Management plan' },
  complete: { icon: '✅', label: 'Complete', desc: 'Encounter summary' },
};

function EncounterWorkspace() {
  const { state, dispatch, advanceStep } = useEncounter();
  const [activeTab, setActiveTab] = useState<WorkflowStep>(state.workflow.currentStep);

  const currentIdx = WORKFLOW_ORDER.indexOf(activeTab);

  const handleStepClick = (step: WorkflowStep) => {
    const targetIdx = WORKFLOW_ORDER.indexOf(step);
    if (targetIdx <= currentIdx + 1) {
      setActiveTab(step);
    }
  };

  const handleAdvance = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < WORKFLOW_ORDER.length) {
      const nextStep = WORKFLOW_ORDER[nextIdx];
      advanceStep(nextStep);
      setActiveTab(nextStep);
    }
  };

  const renderPhase = () => {
    switch (activeTab) {
      case 'intake':
        return <IntakePhase onComplete={handleAdvance} />;
      case 'chief_complaint':
        return <ComplaintPhase onComplete={handleAdvance} />;
      case 'history':
        return <HPIPhase onComplete={handleAdvance} />;
      case 'examination':
        return <ExaminationPhase onComplete={handleAdvance} />;
      case 'investigations':
        return (
          <div className="p-8 text-center text-sm text-gray-500">
            <p>Investigations module — coming soon</p>
          </div>
        );
      case 'assessment':
        return <DDXPhase onComplete={handleAdvance} />;
      case 'plan':
        return (
          <div className="p-8 text-center text-sm text-gray-500">
            <p>Management plan — coming soon</p>
          </div>
        );
      case 'complete':
        return (
          <div className="p-8 text-center">
            <p className="text-lg font-semibold text-green-700 mb-2">✅ Encounter Complete</p>
            <p className="text-sm text-gray-500">All phases have been completed.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      {/* Patient header */}
      <div className="frost-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/12 text-cyan-400 flex items-center justify-center text-lg font-bold">
            {state.demographics.name ? state.demographics.name.charAt(0) : '#'}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-100">
              {state.demographics.name || 'New Patient'}
            </h1>
            <p className="text-xs text-gray-500">
              {state.demographics.ageYears}y {state.demographics.sex}
              {state.chiefComplaint.text ? ` · ${state.chiefComplaint.text}` : ''}
            </p>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {WORKFLOW_ORDER.map((step, i) => {
            const info = STEP_LABELS[step];
            const isActive = activeTab === step;
            const isCompleted = state.workflow.completedSteps.includes(step) || i < currentIdx;
            const isAvailable = i <= currentIdx + 1;

            return (
              <button
                key={step}
                onClick={() => handleStepClick(step)}
                disabled={!isAvailable}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 font-medium'
                    : isCompleted
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : isAvailable
                        ? 'text-gray-500 border-gray-700/30 hover:border-gray-500'
                        : 'text-gray-600 border-gray-800/20 cursor-not-allowed opacity-40'
                }`}
              >
                <span>{isCompleted ? '✓' : info.icon}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step description */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            {STEP_LABELS[activeTab]?.desc || activeTab}
          </p>
        </div>

        {/* Phase content */}
        <div className="bg-gray-850 rounded-lg p-4">
          {renderPhase()}
        </div>
      </div>
    </div>
  );
}

export default function EncounterDetailPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string;
  const encounterId = params?.encounterId as string;

  return (
    <EncounterProvider>
      <EncounterWorkspace />
    </EncounterProvider>
  );
}
