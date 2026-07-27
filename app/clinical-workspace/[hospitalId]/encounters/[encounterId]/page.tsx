'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { EncounterProvider, useEncounter, WORKFLOW_ORDER } from '@/lib/amexan/encounter';
import type { WorkflowStep } from '@/lib/amexan/encounter/encounterState';
import type { InvestigationEntry, TreatmentEntry, ExamEntry, WardRoundEntry } from '@/types/encounter';
import { ComplaintPhase } from '@/src/components/encounter/ComplaintPhase';
import { HPIPhase } from '@/src/components/encounter/HPIPhase';
import { DDXPhase } from '@/src/components/encounter/DDXPhase';
import { InvestigationsPhase } from '@/src/components/encounter/InvestigationsPhase';
import { TreatmentPhase } from '@/src/components/encounter/TreatmentPhase';
import { ExaminationPhase as RichExaminationPhase } from '@/src/components/encounter/ExaminationPhase';
import { WardRoundPhase } from '@/src/components/encounter/WardRoundPhase';
import { HandoverPhase } from '@/src/components/encounter/HandoverPhase';
import type { HandoverData } from '@/src/components/encounter/HandoverPhase';
import { DischargeSummaryPhase } from '@/src/components/encounter/DischargeSummaryPhase';
import { buildHPINarrative } from '@/lib/amexan/encounter/engines/narrativeEngine';

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
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Patient Intake</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Patient Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)' }}
            placeholder="Enter patient name..." />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Age (years)</label>
          <input type="number" value={ageYears} onChange={(e) => {
            const y = parseInt(e.target.value) || 0;
            setAgeYears(y);
            setAgeMonths(y * 12);
          }} className="w-full px-3 py-2 border rounded-lg text-sm"
          style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)' }} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sex</label>
          <div className="flex gap-3">
            {(['male', 'female', 'other'] as const).map((s) => (
              <button key={s} onClick={() => setSex(s)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  sex === s ? 'text-white' : ''
                }`}
                style={sex === s ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: 'white' } : { borderColor: 'var(--surface-border)', color: 'var(--text-secondary)' }}>
                {s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
        <button onClick={handleSave} disabled={!name.trim()}
          className="btn-primary text-xs" style={{ opacity: name.trim() ? 1 : 0.5 }}>
          Save & Continue
        </button>
      </div>
    </div>
  );
}

function ExaminationPhase({ onComplete }: { onComplete?: () => void }) {
  const { state, dispatch } = useEncounter();

  const topDiseaseIds = state.assessment.differentials.map(d => d.diseaseId);

  const existingFindings: ExamEntry[] = [];

  const handleFindingChange = async (findingId: string, findingText: string, present: boolean | null, value?: number, comment?: string) => {
    dispatch({
      type: 'UPDATE_EXAM',
      section: 'general',
      payload: { [findingId]: present ?? false },
    });
  };

  const vitals = state.examination.vitals;
  if (vitals.spo2) existingFindings.push({ id: 'vitals', findingId: 'spo2', findingText: 'SpO2', present: null, value: vitals.spo2, timestamp: vitals.recordedAt });
  if (vitals.hr) existingFindings.push({ id: 'vitals_hr', findingId: 'heart_rate', findingText: 'Heart Rate', present: null, value: vitals.hr, timestamp: vitals.recordedAt });
  if (vitals.bpSystolic) existingFindings.push({ id: 'vitals_bp', findingId: 'bp_systolic', findingText: 'Blood Pressure (Systolic)', present: null, value: vitals.bpSystolic, timestamp: vitals.recordedAt });

  return (
    <RichExaminationPhase
      topDiseaseIds={topDiseaseIds}
      existingFindings={existingFindings}
      onFindingChange={handleFindingChange}
      onComplete={() => { if (onComplete) onComplete(); }}
    />
  );
}

function InvestigationsPhaseWrapper({ onComplete }: { onComplete: () => void }) {
  const { state, dispatch } = useEncounter();

  const topDiseaseIds = state.assessment.differentials.map(d => d.diseaseId);

  const existingInvestigations: InvestigationEntry[] = state.investigations.labs.map(lab => ({
    id: lab.testId,
    testId: lab.testId,
    testName: lab.testName,
    status: lab.status === 'resulted' ? 'resulted' : lab.status === 'ordered' ? 'ordered' : 'pending',
    result: lab.result,
    interpretation: lab.interpretation || '',
    flag: (lab.flag === 'critical' ? 'critical' : lab.flag === 'abnormal' ? 'abnormal' : 'normal') as 'normal' | 'abnormal' | 'critical',
    timestamp: lab.orderedAt,
  }));

  const handleOrder = async (testName: string) => {
    dispatch({
      type: 'ORDER_LAB',
      payload: {
        testId: testName,
        testName,
        status: 'ordered',
        result: null,
        unit: '',
        referenceRange: '',
        interpretation: '',
        flag: null,
        orderedAt: Date.now(),
        resultedAt: null,
      },
    });
  };

  const handleResult = async (testId: string, testName: string, value: number, unit: string, refLow: number, refHigh: number) => {
    const flag: 'normal' | 'abnormal' | 'critical' | null =
      value < refLow || value > refHigh ? 'abnormal' : 'normal';
    dispatch({
      type: 'UPDATE_LAB_RESULT',
      testId,
      payload: {
        status: 'resulted',
        result: value,
        unit,
        referenceRange: `${refLow}-${refHigh}`,
        interpretation: flag === 'abnormal' ? 'Outside reference range' : 'Within reference range',
        flag,
        resultedAt: Date.now(),
      },
    });
  };

  return (
    <InvestigationsPhase
      topDiseaseIds={topDiseaseIds}
      existingInvestigations={existingInvestigations}
      onOrder={handleOrder}
      onResult={handleResult}
      onComplete={onComplete}
    />
  );
}

function TreatmentPhaseWrapper({ onComplete: _onComplete }: { onComplete: () => void }) {
  const { state, dispatch } = useEncounter();

  const topDiseaseIds = state.assessment.differentials.map(d => d.diseaseId);

  const existingTreatments: TreatmentEntry[] = state.plan.treatments.map((t, i) => ({
    id: `tx_${i}`,
    planType: (t.condition === 'definitive' ? 'definitive' : 'initial') as 'initial' | 'definitive' | 'postop',
    items: [t.step],
    timestamp: Date.now(),
  }));

  const handleSave = async (planType: string, items: string[], definitiveProcedure?: string) => {
    items.forEach(item => {
      dispatch({
        type: 'ADD_TREATMENT',
        payload: { step: item, detail: '', condition: planType },
      });
    });
  };

  return (
    <TreatmentPhase
      topDiseaseIds={topDiseaseIds}
      existingTreatments={existingTreatments}
      onSave={handleSave}
      onComplete={() => {}}
    />
  );
}

type CompleteTab = 'summary' | 'ward_round' | 'handover' | 'discharge';

function CompletePhase() {
  const { state, dispatch } = useEncounter();
  const narrative = buildClinicalNarrative(state);
  const hpiNarrative = buildHPINarrative(state);

  const [activeTab, setActiveTab] = useState<CompleteTab>('summary');
  const [wardRounds, setWardRounds] = useState<WardRoundEntry[]>([]);
  const [handoverNotes, setHandoverNotes] = useState<HandoverData[]>([]);

  const tabs: { key: CompleteTab; label: string; icon: string }[] = [
    { key: 'summary', label: 'Summary', icon: '✅' },
    { key: 'ward_round', label: 'Ward Round', icon: '🏥' },
    { key: 'handover', label: 'Handover', icon: '⚡' },
    { key: 'discharge', label: 'Discharge', icon: '🚪' },
  ];

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span className="text-lg">✅</span>
        <span className="text-sm font-semibold text-gray-700">Encounter Summary</span>
      </div>

      <div className="p-4 rounded-lg" style={{ background: 'var(--sky-50)', border: '1px solid var(--sky-200)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--sky-700)' }}>All phases completed</p>
      </div>

      {hpiNarrative && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>History of Present Illness</h4>
          <div className="p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap"
            style={{ background: 'var(--sky-50)', border: '1px solid var(--sky-100)', color: 'var(--text-primary)' }}>
            {hpiNarrative}
          </div>
        </div>
      )}

      {narrative && !hpiNarrative && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Clinical Summary</h4>
          <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {narrative}
          </div>
        </div>
      )}

      {state.plan.treatments.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Management Plan</h4>
          <ul className="space-y-1">
            {state.plan.treatments.map((t, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{t.step}{t.detail ? ` — ${t.detail}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.plan.medications.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Medications</h4>
          <ul className="space-y-1">
            {state.plan.medications.map((m, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{m.name} {m.dose} {m.route} {m.frequency} {m.duration ? `for ${m.duration}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.plan.followUp && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Follow-up</h4>
          <p className="text-sm text-gray-600">{state.plan.followUp}</p>
        </div>
      )}

      {wardRounds.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ward Rounds ({wardRounds.length})</h4>
          <div className="space-y-1">
            {wardRounds.map((r, i) => (
              <p key={r.id} className="text-xs text-gray-500">Round #{r.version} — {r.assessment}</p>
            ))}
          </div>
        </div>
      )}

      {handoverNotes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Handovers ({handoverNotes.length})</h4>
          <div className="space-y-1">
            {handoverNotes.map((h, i) => (
              <p key={i} className="text-xs text-gray-500">Handover {i + 1} — {h.currentStatus?.slice(0, 60)}</p>
            ))}
          </div>
        </div>
      )}

      {state.plan.admissionDecision === 'discharge' && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Disposition</h4>
          <p className="text-sm text-gray-600">Discharged. Use the Discharge tab to generate the discharge summary.</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-4">
        Encounter created {new Date(state.createdAt).toLocaleString()}
      </p>
    </div>
  );

  const renderWardRound = () => (
    <WardRoundPhase
      existingRounds={wardRounds}
      onSave={async (data) => {
        const newRound: WardRoundEntry = {
          ...data,
          id: `wr_${Date.now()}`,
          version: wardRounds.length + 1,
        };
        setWardRounds(prev => [...prev, newRound]);
      }}
      onComplete={() => {}}
      authorName={state.demographics.name || 'Dr. Clinician'}
      patientName={state.demographics.name}
      patientId={state.id}
      unitSlug={state.id}
      timeSinceSurgery={undefined}
    />
  );

  const renderHandover = () => (
    <HandoverPhase
      patientName={state.demographics.name || 'Patient'}
      patientId={state.id}
      unitSlug={state.id}
      diagnosis={state.chiefComplaint.text}
      encounterStatus={state.plan.admissionDecision}
      onSave={async (data) => {
        setHandoverNotes(prev => [...prev, data]);
      }}
      onComplete={() => {}}
    />
  );

  const renderDischarge = () => {
    const procedures = state.plan.treatments
      .filter(t => t.condition === 'definitive')
      .map(t => t.step);

    return (
      <DischargeSummaryPhase
        patientName={state.demographics.name || 'Patient'}
        patientId={state.id}
        unitSlug={state.id}
        diagnosis={state.chiefComplaint.text}
        procedures={procedures}
        admissionDate={state.createdAt}
        onSave={async () => {}}
        onComplete={() => {}}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <span className="text-lg">✅</span>
        <span className="text-sm font-semibold text-gray-700">Complete</span>
      </div>

      <div className="flex gap-1.5 pb-2 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'ward_round' && renderWardRound()}
        {activeTab === 'handover' && renderHandover()}
        {activeTab === 'discharge' && renderDischarge()}
      </div>
    </div>
  );
}

function PastHistorySection() {
  const { state, dispatch } = useEncounter();

  const [pmh, setPmh] = useState({
    conditions: state.history.pmh.conditions.join(', '),
    surgeries: state.history.pmh.surgeries.join(', '),
    diabetes: state.history.pmh.diabetes,
    hypertension: state.history.pmh.hypertension,
    asthma: state.history.pmh.asthma,
    sickleCell: state.history.pmh.sickleCell,
    hiv: state.history.pmh.hiv,
    otherChronic: state.history.pmh.otherChronic.join(', '),
  });

  const [meds, setMeds] = useState({
    name: '', dose: '', frequency: '', route: '', indication: '',
  });
  const [allergy, setAllergy] = useState({ drug: '', reaction: '', severity: '' });

  const [family, setFamily] = useState(state.history.family);
  const [social, setSocial] = useState(state.history.social);
  const [ros, setRos] = useState(state.history.ros);

  const [showPmh, setShowPmh] = useState(false);
  const [showMeds, setShowMeds] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showRos, setShowRos] = useState(false);

  const savePmh = () => {
    dispatch({
      type: 'SET_PMH',
      payload: {
        conditions: pmh.conditions.split(',').map(s => s.trim()).filter(Boolean),
        surgeries: pmh.surgeries.split(',').map(s => s.trim()).filter(Boolean),
        diabetes: pmh.diabetes,
        hypertension: pmh.hypertension,
        asthma: pmh.asthma,
        sickleCell: pmh.sickleCell,
        hiv: pmh.hiv as any,
        otherChronic: pmh.otherChronic.split(',').map(s => s.trim()).filter(Boolean),
      },
    });
  };

  const saveFamily = () => {
    dispatch({ type: 'SET_FAMILY_HISTORY', payload: family });
  };

  const saveSocial = () => {
    dispatch({ type: 'SET_SOCIAL_HISTORY', payload: social });
  };

  const saveRos = () => {
    dispatch({ type: 'UPDATE_ROS', payload: ros });
  };

  return (
    <div className="mt-6 space-y-3 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Additional History</p>

      {/* PMH */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
        <button onClick={() => setShowPmh(!showPmh)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          <span>Past Medical History</span>
          <span className={`transition-transform ${showPmh ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
        </button>
        {showPmh && (
          <div className="px-4 py-3 border-t space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pmh.diabetes} onChange={e => setPmh(p => ({ ...p, diabetes: e.target.checked }))} className="rounded" /> Diabetes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pmh.hypertension} onChange={e => setPmh(p => ({ ...p, hypertension: e.target.checked }))} className="rounded" /> Hypertension
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pmh.asthma} onChange={e => setPmh(p => ({ ...p, asthma: e.target.checked }))} className="rounded" /> Asthma
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pmh.sickleCell} onChange={e => setPmh(p => ({ ...p, sickleCell: e.target.checked }))} className="rounded" /> Sickle Cell
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">HIV Status</label>
                <select value={pmh.hiv} onChange={e => setPmh(p => ({ ...p, hiv: e.target.value as 'unknown' | 'positive' | 'negative' }))}
                  className="w-full px-2 py-1.5 border rounded text-sm">
                  <option value="unknown">Unknown</option>
                  <option value="negative">Negative</option>
                  <option value="positive">Positive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Other Conditions (comma-separated)</label>
                <input type="text" value={pmh.otherChronic} onChange={e => setPmh(p => ({ ...p, otherChronic: e.target.value }))}
                  className="w-full px-2 py-1.5 border rounded text-sm" placeholder="e.g. CKD, heart disease" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Surgeries (comma-separated)</label>
              <input type="text" value={pmh.surgeries} onChange={e => setPmh(p => ({ ...p, surgeries: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm" placeholder="e.g. Appendicectomy, Cholecystectomy" />
            </div>
            <button onClick={savePmh} className="px-3 py-1.5 text-xs rounded"
              style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>Save PMH</button>
          </div>
        )}
      </div>

      {/* Medications */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
        <button onClick={() => setShowMeds(!showMeds)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          <span>Medications & Allergies</span>
          <span className={`transition-transform ${showMeds ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
        </button>
        {showMeds && (
          <div className="px-4 py-3 border-t space-y-3">
            <div className="grid grid-cols-5 gap-2">
              <input type="text" placeholder="Drug" value={meds.name} onChange={e => setMeds(p => ({ ...p, name: e.target.value }))}
                className="px-2 py-1.5 border rounded text-sm col-span-2" />
              <input type="text" placeholder="Dose" value={meds.dose} onChange={e => setMeds(p => ({ ...p, dose: e.target.value }))}
                className="px-2 py-1.5 border rounded text-sm" />
              <input type="text" placeholder="Frequency" value={meds.frequency} onChange={e => setMeds(p => ({ ...p, frequency: e.target.value }))}
                className="px-2 py-1.5 border rounded text-sm" />
              <button onClick={() => { dispatch({ type: 'ADD_MEDICATION', payload: meds }); setMeds({ name: '', dose: '', frequency: '', route: '', indication: '' }); }}
                className="px-2 py-1.5 text-sm rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>Add</button>
            </div>
            {state.history.medications.current.length > 0 && (
              <div className="text-xs text-gray-500">
                Current: {state.history.medications.current.map((m: any) => `${m.name} ${m.dose} ${m.frequency}`).join(', ')}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Allergen" value={allergy.drug} onChange={e => setAllergy(p => ({ ...p, drug: e.target.value }))}
                className="px-2 py-1.5 border rounded text-sm" />
              <input type="text" placeholder="Reaction" value={allergy.reaction} onChange={e => setAllergy(p => ({ ...p, reaction: e.target.value }))}
                className="px-2 py-1.5 border rounded text-sm" />
              <button onClick={() => { dispatch({ type: 'ADD_ALLERGY', payload: allergy }); setAllergy({ drug: '', reaction: '', severity: '' }); }}
                className="px-2 py-1.5 text-sm rounded" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Add Allergy</button>
            </div>
            {state.history.medications.allergies.length > 0 && (
              <div className="text-xs text-gray-500">
                Allergies: {state.history.medications.allergies.map((a: any) => `${a.drug} (${a.reaction})`).join('; ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Family & Social */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
        <button onClick={() => setShowFamily(!showFamily)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          <span>Family & Social History</span>
          <span className={`transition-transform ${showFamily ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
        </button>
        {showFamily && (
          <div className="px-4 py-3 border-t space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(['tb', 'asthma', 'atopy', 'sickleCell', 'diabetes', 'hypertension'] as const).map(f => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(family as any)[f]} onChange={e => setFamily(p => ({ ...p, [f]: e.target.checked }))} className="rounded" />
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Smoking</label>
              <select value={social.smoking} onChange={e => setSocial(p => ({ ...p, smoking: e.target.value as any }))}
                className="w-full px-2 py-1.5 border rounded text-sm">
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alcohol</label>
              <input type="text" value={social.alcohol} onChange={e => setSocial(p => ({ ...p, alcohol: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm" placeholder="e.g. None, Occasional, Daily" />
            </div>
            <div className="flex gap-2">
              <button onClick={saveFamily} className="px-3 py-1.5 text-xs rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>Save Family</button>
              <button onClick={saveSocial} className="px-3 py-1.5 text-xs rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>Save Social</button>
            </div>
          </div>
        )}
      </div>

      {/* ROS */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--surface-border)' }}>
        <button onClick={() => setShowRos(!showRos)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          <span>Review of Systems</span>
          <span className={`transition-transform ${showRos ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>▼</span>
        </button>
        {showRos && (
          <div className="px-4 py-3 border-t space-y-3">
            {Object.entries(ros).map(([system, fields]) => (
              <div key={system} className="border rounded p-2">
                <p className="text-xs font-medium text-gray-600 capitalize mb-1">{system.replace(/([A-Z])/g, ' $1')}</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(fields as Record<string, any>).map(([field, val]) => (
                    <label key={field} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input type="checkbox" checked={!!val} onChange={e => setRos(prev => ({
                        ...prev,
                        [system]: { ...(prev as any)[system], [field]: e.target.checked },
                      }))} className="rounded" />
                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={saveRos} className="px-3 py-1.5 text-xs rounded" style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>Save ROS</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DispositionSection({ onComplete }: { onComplete: () => void }) {
  const { state, dispatch } = useEncounter();
  const [decision, setDecision] = useState<'discharge' | 'admit_ward' | 'admit_hdu' | 'admit_icu' | 'transfer'>(
    state.plan.admissionDecision || 'discharge'
  );
  const [followUp, setFollowUp] = useState(state.plan.followUp || '');
  const [safetyNetting, setSafetyNetting] = useState(state.plan.safetyNetting || '');

  const handleSave = () => {
    dispatch({
      type: 'SET_MANAGEMENT_PLAN',
      payload: {
        admissionDecision: decision,
        followUp,
        safetyNetting,
      },
    });
    onComplete();
  };

  return (
    <div className="mt-6 space-y-4 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Disposition</p>

      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Admission Decision</label>
        <div className="flex flex-wrap gap-2">
          {([{ v: 'discharge', l: 'Discharge', c: 'var(--green-bg)', tc: 'var(--green)', bc: 'var(--green-border)' },
             { v: 'admit_ward', l: 'Admit to Ward', c: 'var(--sky-50)', tc: 'var(--sky-600)', bc: 'var(--sky-200)' },
             { v: 'admit_hdu', l: 'Admit to HDU', c: 'var(--amber-bg)', tc: 'var(--amber)', bc: 'var(--amber-border)' },
             { v: 'admit_icu', l: 'Admit to ICU', c: 'var(--red-bg)', tc: 'var(--red)', bc: 'var(--red-border)' },
             { v: 'transfer', l: 'Transfer', c: 'var(--purple-bg)', tc: 'var(--purple)', bc: 'var(--purple-border)' }] as const).map(opt => (
            <button key={opt.v} onClick={() => setDecision(opt.v)}
              className="px-3 py-1.5 text-xs rounded-lg border transition-colors font-medium"
              style={decision === opt.v ? { background: opt.c, color: opt.tc, borderColor: opt.bc } : { borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}>{opt.l}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Follow-up Plan</label>
        <textarea value={followUp} onChange={e => setFollowUp(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm" rows={2}
          style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)' }}
          placeholder="e.g. Review in surgical outpatients in 2 weeks, wound check at local clinic..." />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Safety Netting / Red Flags</label>
        <textarea value={safetyNetting} onChange={e => setSafetyNetting(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm" rows={2}
          style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-card)', color: 'var(--text-primary)' }}
          placeholder="e.g. Return if fever, worsening pain, unable to tolerate oral intake..." />
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave}
          className="btn-primary text-xs">
          Save Disposition & Finish
        </button>
      </div>
    </div>
  );
}

function buildClinicalNarrative(state: any): string {
  const parts: string[] = [];
  const name = state.demographics?.name || 'The patient';
  const complaint = state.chiefComplaint?.text || '';
  const age = state.demographics?.ageYears || '';

  if (complaint) {
    parts.push(`${name}, ${age}, presents with ${complaint}.`);
  }

  const symptoms = Object.values(state.symptoms).filter((s: any) => s?.present);
  if (symptoms.length > 0) {
    const symptomTexts = symptoms.map((s: any) => s.label || s.symptomId?.replace(/_/g, ' ') || '').filter(Boolean);
    if (symptomTexts.length > 0) {
      parts.push(`Associated symptoms: ${symptomTexts.join(', ')}.`);
    }
  }

  const vitals = state.examination?.vitals;
  if (vitals) {
    const v: string[] = [];
    if (vitals.hr) v.push(`HR ${vitals.hr}/min`);
    if (vitals.rr) v.push(`RR ${vitals.rr}/min`);
    if (vitals.spo2) v.push(`SpO2 ${vitals.spo2}%`);
    if (vitals.bpSystolic) v.push(`BP ${vitals.bpSystolic}/${vitals.bpDiastolic || '?'}`);
    if (vitals.temp) v.push(`Temp ${vitals.temp}°C`);
    if (v.length > 0) parts.push(`Vitals: ${v.join(', ')}.`);
  }

  const diffs = state.assessment?.differentials;
  if (diffs && diffs.length > 0) {
    const top = diffs.slice(0, 3).map((d: any) => d.diseaseName).filter(Boolean);
    if (top.length > 0) parts.push(`Differential diagnoses: ${top.join(', ')}.`);
  }

  const treatments = state.plan?.treatments;
  if (treatments && treatments.length > 0) {
    const steps = treatments.map((t: any) => t.step).filter(Boolean);
    parts.push(`Plan: ${steps.join('; ')}.`);
  }

  return parts.join('\n\n');
}

const STEP_LABELS: Record<string, { icon: string; label: string; desc: string }> = {
  intake: { icon: '📋', label: 'Intake', desc: 'Patient demographics' },
  chief_complaint: { icon: '🗣️', label: 'Complaint', desc: 'Presenting complaint' },
  history: { icon: '📝', label: 'History', desc: 'Symptom exploration & past history' },
  examination: { icon: '🩺', label: 'Exam', desc: 'Vitals & physical exam' },
  investigations: { icon: '🧪', label: 'Labs', desc: 'Investigations & imaging' },
  assessment: { icon: '🧠', label: 'DDX', desc: 'Differential diagnosis' },
  plan: { icon: '💊', label: 'Plan', desc: 'Management & disposition' },
  complete: { icon: '✅', label: 'Complete', desc: 'Clinical summary & documentation' },
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
        return (
          <div>
            <HPIPhase onComplete={handleAdvance} />
            <PastHistorySection />
          </div>
        );
      case 'examination':
        return <ExaminationPhase onComplete={handleAdvance} />;
      case 'investigations':
        return <InvestigationsPhaseWrapper onComplete={handleAdvance} />;
      case 'assessment':
        return <DDXPhase onComplete={handleAdvance} />;
      case 'plan':
        return (
          <div>
            <TreatmentPhaseWrapper onComplete={() => {}} />
            <DispositionSection onComplete={handleAdvance} />
          </div>
        );
      case 'complete':
        return <CompletePhase />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      <div className="card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--sky-50)', color: 'var(--sky-600)' }}>
            {state.demographics.name ? state.demographics.name.charAt(0).toUpperCase() : '#'}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {state.demographics.name || 'New Patient'}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {state.demographics.ageYears}y {state.demographics.sex}
              {state.chiefComplaint.text ? ` \u00b7 ${state.chiefComplaint.text}` : ''}
            </p>
          </div>
          {state.plan.admissionDecision && (
            <span className="text-[10px] px-2 py-1 rounded-full font-medium"
              style={{
                background: state.plan.admissionDecision === 'discharge' ? 'var(--green-bg)' : state.plan.admissionDecision === 'admit_icu' ? 'var(--red-bg)' : 'var(--blue-bg)',
                color: state.plan.admissionDecision === 'discharge' ? 'var(--green)' : state.plan.admissionDecision === 'admit_icu' ? 'var(--red)' : 'var(--blue)',
              }}>
              {state.plan.admissionDecision.replace(/_/g, ' ')}
            </span>
          )}
        </div>

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
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border whitespace-nowrap transition-all"
                style={{
                  background: isActive ? 'var(--sky-50)' : isCompleted ? 'var(--green-bg)' : 'transparent',
                  borderColor: isActive ? 'var(--sky-200)' : isCompleted ? 'var(--green-border)' : isAvailable ? 'var(--surface-border)' : 'var(--surface-border)',
                  color: isActive ? 'var(--sky-700)' : isCompleted ? 'var(--green)' : isAvailable ? 'var(--text-secondary)' : 'var(--text-muted)',
                  opacity: isAvailable ? 1 : 0.4,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                }}
              >
                <span>{isCompleted ? '\u2713' : info.icon}</span>
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {STEP_LABELS[activeTab]?.desc || activeTab}
          </p>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'var(--surface-elevated)' }}>
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
