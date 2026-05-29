'use client';
import { useMemo, useState } from 'react';
import AMEXANLayout from '@/components/amexan/AMEXANLayout';
import TherapeuticLifeTimeline, { buildTherapyEvents } from '@/components/visual-intelligence/TherapeuticLifeTimeline';
import DrugResponseGraph from '@/components/visual-intelligence/DrugResponseGraph';
import TSHEETS from '@/components/visual-intelligence/TSHEETS';
import ClinicalResponseBoard from '@/components/visual-intelligence/ClinicalResponseBoard';
import MedicationEvolutionMap, { buildTherapyTree } from '@/components/visual-intelligence/MedicationEvolutionMap';
import PharmacyWallet from '@/components/visual-intelligence/PharmacyWallet';
import PatientMobileJourney from '@/components/visual-intelligence/PatientMobileJourney';
import LifetimeTherapeuticMemory from '@/components/visual-intelligence/LifetimeTherapeuticMemory';

const PATIENT = { name: 'Marcus Chen', age: 55, diagnosis: 'Type 2 Diabetes Mellitus', mrn: 'MRN-44921' };

function makeDate(yearsAgo: number, monthsOffset = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() + monthsOffset);
  return d;
}

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

const today = new Date();
const mockData = {
  prescriptions: [
    // Year 1: Diagnosis → Metformin
    { id: 'rx-1', medicationName: 'Metformin', dose: '500mg', dosage: '500mg', frequency: 'BID', route: 'PO', indication: 'Type 2 Diabetes', condition: 'Diabetes', startDate: makeDate(10), actualStopDate: makeDate(9, 9), stopReason: 'Dose escalation', switchedTo: 'Metformin 1000mg', switchedAt: makeDate(9, 9), effectivenessScore: 6, doseChanges: [{ previousDose: '500mg', newDose: '1000mg', date: makeDate(9, 9), reason: 'HbA1c still >8%' }] },
    // Year 1-2: Metformin 1000mg
    { id: 'rx-2', medicationName: 'Metformin', dose: '1000mg', dosage: '1000mg', frequency: 'BID', route: 'PO', indication: 'Type 2 Diabetes', condition: 'Diabetes', startDate: makeDate(9, 9), actualStopDate: makeDate(7, 6), stopReason: 'GI intolerance', switchedTo: 'Metformin ER', switchedAt: makeDate(7, 6), effectivenessScore: 7, doseChanges: [] },
    // Year 2: Add Sitagliptin
    { id: 'rx-3', medicationName: 'Sitagliptin', dose: '100mg', dosage: '100mg', frequency: 'Daily', route: 'PO', indication: 'Type 2 Diabetes', condition: 'Diabetes', startDate: makeDate(8), actualStopDate: makeDate(6), stopReason: 'Insufficient response', switchedTo: 'Lantus', switchedAt: makeDate(6), effectivenessScore: 5, doseChanges: [] },
    // Year 4: Insulin Lantus
    { id: 'rx-4', medicationName: 'Lantus (Insulin Glargine)', dose: '10U → 25U', dosage: '25U', frequency: 'Bedtime', route: 'SC', indication: 'Type 2 Diabetes', condition: 'Diabetes', startDate: makeDate(6), actualStopDate: makeDate(4), stopReason: 'Formulary change', switchedTo: 'Tresiba', switchedAt: makeDate(4), effectivenessScore: 7, doseChanges: [{ previousDose: '10U', newDose: '15U', date: makeDate(5, 10), reason: 'Titration' }, { previousDose: '15U', newDose: '25U', date: makeDate(5, 4), reason: 'Titration' }] },
    // Year 5: Atorvastatin
    { id: 'rx-5', medicationName: 'Atorvastatin', dose: '20mg', dosage: '20mg', frequency: 'Bedtime', route: 'PO', indication: 'Dyslipidemia', condition: 'Dyslipidemia', startDate: makeDate(5), actualStopDate: undefined, stopReason: undefined, switchedTo: undefined, switchedAt: undefined, effectivenessScore: 8, doseChanges: [] },
    // Year 6: Tresiba
    { id: 'rx-6', medicationName: 'Tresiba (Insulin Degludec)', dose: '25U', dosage: '25U', frequency: 'Daily', route: 'SC', indication: 'Type 2 Diabetes', condition: 'Diabetes', startDate: makeDate(4), actualStopDate: undefined, stopReason: undefined, switchedTo: undefined, switchedAt: undefined, effectivenessScore: 8, doseChanges: [{ previousDose: '25U', newDose: '30U', date: makeDate(2), reason: 'Worsening glycemic control' }] },
    // Year 7: Metformin ER
    { id: 'rx-7', medicationName: 'Metformin ER', dose: '2000mg', dosage: '2000mg', frequency: 'Daily', route: 'PO', indication: 'Type 2 Diabetes', condition: 'Diabetes', startDate: makeDate(7, 6), actualStopDate: undefined, stopReason: undefined, switchedTo: undefined, switchedAt: undefined, effectivenessScore: 7, doseChanges: [] },
    // Year 7: Gabapentin
    { id: 'rx-8', medicationName: 'Gabapentin', dose: '300mg', dosage: '300mg', frequency: 'TID', route: 'PO', indication: 'Diabetic Neuropathy', condition: 'Neuropathy', startDate: makeDate(3), actualStopDate: undefined, stopReason: undefined, switchedTo: undefined, switchedAt: undefined, effectivenessScore: 8, doseChanges: [] },
  ],
  sideEffects: [
    { id: 'se-1', medicationName: 'Metformin', drug: 'Metformin', sideEffect: 'GI upset, nausea', symptom: 'Nausea and bloating', severity: 'moderate', onset: makeDate(8, 6) },
    { id: 'se-2', medicationName: 'Metformin', drug: 'Metformin', sideEffect: 'Diarrhea', symptom: 'Frequent loose stools', severity: 'moderate', onset: makeDate(8, 3) },
    { id: 'se-3', medicationName: 'Metformin ER', drug: 'Metformin ER', sideEffect: 'Mild GI discomfort', symptom: 'Occasional bloating', severity: 'mild', onset: makeDate(6) },
    { id: 'se-4', medicationName: 'Sitagliptin', drug: 'Sitagliptin', sideEffect: 'Joint pain', symptom: 'Mild arthralgia', severity: 'mild', onset: makeDate(7) },
    { id: 'se-5', medicationName: 'Lantus (Insulin Glargine)', drug: 'Lantus', sideEffect: 'Hypoglycemia (2 episodes)', symptom: 'Diaphoresis, confusion', severity: 'severe', onset: makeDate(5, 3) },
  ],
};

const monthlyData = (() => {
  const data: { date: string; effect: number; severity: number; event?: string }[] = [];
  for (let i = 120; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7) + '-01';
    const yearsOut = i / 12;
    const severity = Math.max(1, 10.2 - (10.2 - 6.8) * (1 - Math.exp(-yearsOut / 3)) + (Math.random() - 0.5) * 0.8);
    const effect = Math.min(9.5, 2 + (10.2 - severity) * 0.9 + (Math.random() - 0.5) * 0.5);
    data.push({ date: monthStr, effect: Math.round(effect * 10) / 10, severity: Math.round(severity * 10) / 10 });
  }
  // Add key event annotations
  data[data.length - 121]!.event = 'Diagnosis: HbA1c 10.2%';
  data[data.length - 109]!.event = 'Metformin increased to 1000mg';
  data[data.length - 97]!.event = 'Sitagliptin added';
  data[data.length - 73]!.event = 'Lantus insulin started';
  data[data.length - 61]!.event = 'Atorvastatin started';
  data[data.length - 49]!.event = 'Switched to Tresiba';
  data[data.length - 37]!.event = 'Gabapentin for neuropathy';
  data[data.length - 12]!.event = 'HbA1c 7.0% — good control';
  data[data.length - 1]!.event = 'HbA1c 6.8% — stable';
  return data;
})();

const clinicalEntries = (() => {
  const entries: any[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(); d.setMonth(d.getMonth() - i * 5);
    entries.push({
      id: `resp-${i}`,
      drug: i % 3 === 0 ? 'Metformin ER' : i % 3 === 1 ? 'Tresiba' : 'Gabapentin',
      dose: i % 3 === 0 ? '2000mg' : i % 3 === 1 ? '30U' : '300mg',
      date: d,
      effectivenessScore: Math.round((6 + Math.random() * 3) * 10) / 10,
      symptomScore: Math.round((1 + Math.random() * 3) * 10) / 10,
      sideEffectBurden: Math.round((1 + Math.random() * 4) * 10) / 10,
      patientReported: ['Feeling good', 'Mild neuropathy', 'Stable', 'Energy good', 'No issues', 'Better control'][i % 6],
      labValue: 7.2 + Math.random() * 0.8,
    });
  }
  return entries;
})();

const mockSchedules: { id: string; drug: string; dose: string; route: string; frequency: string; indication: string; color: string; doses: { id: string; scheduledTime: Date; dose: string; status: 'pending' | 'held' | 'refused' | 'taken' | 'delayed' | 'missed' | 'adjusted' }[] }[] = [
  { id: 'sch-1', drug: 'Metformin ER', dose: '2000mg', route: 'PO', frequency: 'Daily with dinner', indication: 'T2DM', color: '#00d68f', doses: [] },
  { id: 'sch-2', drug: 'Tresiba', dose: '30U', route: 'SC', frequency: 'Daily before bed', indication: 'T2DM', color: '#7c5af5', doses: [] },
  { id: 'sch-3', drug: 'Atorvastatin', dose: '20mg', route: 'PO', frequency: 'Bedtime', indication: 'Dyslipidemia', color: '#ffb020', doses: [] },
  { id: 'sch-4', drug: 'Gabapentin', dose: '300mg', route: 'PO', frequency: 'TID', indication: 'Neuropathy', color: '#3b82f6', doses: [] },
];

const STATUSES = ['taken', 'delayed', 'missed', 'refused', 'adjusted', 'held', 'pending'] as const;
mockSchedules.forEach((sch) => {
  const hours = sch.id === 'sch-1' ? [8, 20] : sch.id === 'sch-2' ? [22] : sch.id === 'sch-3' ? [22] : [8, 14, 20];
  sch.doses = hours.map((h, i) => ({
    id: `${sch.id}-d${i}`,
    scheduledTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, 0),
    dose: sch.dose,
    status: STATUSES[Math.floor(Math.random() * 4)] as 'pending' | 'held' | 'refused' | 'taken' | 'delayed' | 'missed' | 'adjusted',
  }));
});

const inventoryItems = [
  { id: 'inv-1', drug: 'Metformin ER', dose: '2000mg', currentStock: 60, unit: 'tablets', dailyConsumption: 1, reorderPoint: 14, lastFilled: makeDate(0, -1), nextRefillDue: makeDate(0, 1), pharmacyName: 'CVS #4281', pharmacyDistance: 1.2 },
  { id: 'inv-2', drug: 'Tresiba FlexTouch', dose: '30U', currentStock: 3, unit: 'pens', dailyConsumption: 1, reorderPoint: 2, lastFilled: makeDate(0, -1), nextRefillDue: makeDate(0, 0.5), pharmacyName: 'CVS #4281', price: 75 },
  { id: 'inv-3', drug: 'Atorvastatin', dose: '20mg', currentStock: 45, unit: 'tablets', dailyConsumption: 1, reorderPoint: 14, lastFilled: makeDate(0, -2), nextRefillDue: makeDate(0, 1.5), pharmacyName: 'Walgreens #3119', pharmacyDistance: 2.1 },
  { id: 'inv-4', drug: 'Gabapentin', dose: '300mg', currentStock: 5, unit: 'tablets', dailyConsumption: 3, reorderPoint: 14, lastFilled: makeDate(0, -1), nextRefillDue: makeDate(0, 0.3), pharmacyName: 'CVS #4281' },
  { id: 'inv-5', drug: 'Lancets', dose: '28g', currentStock: 20, unit: 'pieces', dailyConsumption: 1, reorderPoint: 10, lastFilled: makeDate(0, -2), nextRefillDue: makeDate(0, 2), pharmacyName: 'Amazon Pharmacy' },
  { id: 'inv-6', drug: 'Test Strips', dose: 'Box 50', currentStock: 2, unit: 'boxes', dailyConsumption: 0.3, reorderPoint: 2, lastFilled: makeDate(0, -3), nextRefillDue: makeDate(0, 1), pharmacyName: 'Amazon Pharmacy', price: 35 },
];

const dailyTasks = [
  { id: 't-1', time: '07:30', label: 'Check blood glucose', type: 'measurement' as const, detail: 'Fasting glucose', done: true, icon: '🩸' },
  { id: 't-2', time: '08:00', label: 'Metformin ER 2000mg', type: 'medication' as const, detail: 'With breakfast', done: true, icon: '💊' },
  { id: 't-3', time: '09:00', label: 'Morning walk', type: 'activity' as const, detail: '30 minutes moderate pace', done: true, icon: '🚶' },
  { id: 't-4', time: '12:00', label: 'Check blood glucose', type: 'measurement' as const, detail: 'Pre-lunch', done: false, icon: '🩸' },
  { id: 't-5', time: '14:00', label: 'Gabapentin 300mg', type: 'medication' as const, detail: 'Afternoon dose', done: false, icon: '💊' },
  { id: 't-6', time: '18:00', label: 'Evening meal log', type: 'check-in' as const, detail: 'Record carbohydrate intake', done: false, icon: '📝' },
  { id: 't-7', time: '20:00', label: 'Gabapentin 300mg', type: 'medication' as const, detail: 'With dinner', done: false, icon: '💊' },
  { id: 't-8', time: '20:00', label: 'Metformin ER 2000mg', type: 'medication' as const, detail: 'With dinner', done: false, icon: '💊' },
  { id: 't-9', time: '22:00', label: 'Tresiba 30U', type: 'medication' as const, detail: 'Bedtime injection', done: false, icon: '💉' },
  { id: 't-10', time: '22:00', label: 'Atorvastatin 20mg', type: 'medication' as const, detail: 'Bedtime', done: false, icon: '💊' },
];

export default function DiabeticJourneyDemo() {
  const [activeTab, setActiveTab] = useState('timeline');

  const therapyEvents = useMemo(() =>
    buildTherapyEvents(mockData.prescriptions, mockData.sideEffects, [PATIENT.diagnosis]),
    [],
  );

  const therapyBranches = useMemo(
    () => buildTherapyTree(mockData.prescriptions, PATIENT.diagnosis, PATIENT.name),
    [],
  );

  const tabs = [
    { id: 'timeline', label: '🧬 Timeline', icon: '🧬' },
    { id: 'response', label: '📊 Response', icon: '📊' },
    { id: 'schedule', label: '💊 Schedule', icon: '💊' },
    { id: 'clinical', label: '📋 Clinical', icon: '📋' },
    { id: 'evolution', label: '🌳 Evolution', icon: '🌳' },
    { id: 'pharmacy', label: '🏪 Pharmacy', icon: '🏪' },
    { id: 'mobile', label: '📱 Mobile', icon: '📱' },
    { id: 'memory', label: '🧠 Memory', icon: '🧠' },
  ];

  return (
    <AMEXANLayout
      title="Diabetic Journey Demo"
      patientName={PATIENT.name}
      activeItem="demo"
      alertCount={2}
    >
      {/* Hero */}
      <div className="glass-card overflow-hidden mb-4">
        <div className="relative px-5 py-4 bg-gradient-to-r from-[var(--surface-elevated)] via-transparent to-[var(--surface-base)]">
          <div className="absolute right-4 top-4 w-48 h-48 rounded-full bg-[rgba(0,214,143,0.03)] blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-[1]">
            <div>
              <div className="text-[9px] font-extrabold text-[var(--teal)] tracking-[0.2em] uppercase mb-1">
                AMEXAN · Therapeutic Intelligence Demo
              </div>
              <h1 className="text-xl font-extrabold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                {PATIENT.name}
              </h1>
              <div className="flex gap-3 mt-1.5 text-[10px]">
                <span className="text-[var(--text-secondary)]">{PATIENT.age} years · {PATIENT.diagnosis}</span>
                <span className="text-[var(--text-muted)]">{PATIENT.mrn}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-[rgba(0,214,143,0.1)] border border-[rgba(0,214,143,0.25)] text-[var(--green)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] inline-block mr-1 shadow-[0_0_6px_var(--green)]" />
                10-Year Journey
              </div>
              <div className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-[rgba(0,229,204,0.1)] border border-[rgba(0,229,204,0.2)] text-[var(--teal)]">
                ⚡ Interactive Demo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer
              ${activeTab === tab.id
                ? 'bg-[rgba(0,229,204,0.1)] text-[var(--teal)] border border-[rgba(0,229,204,0.25)] shadow-[0_0_12px_rgba(0,229,204,0.08)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent'}`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'timeline' && (
          <TherapeuticLifeTimeline
            events={therapyEvents}
            patientName={PATIENT.name}
            patientAge={PATIENT.age}
          />
        )}

        {activeTab === 'response' && (
          <DrugResponseGraph
            entries={monthlyData}
            targetRangeMin={3}
            targetRangeMax={7}
            drug="HbA1c / Medication Effect"
            title="Glycemic Response · 10-Year History"
          />
        )}

        {activeTab === 'schedule' && (
          <TSHEETS
            schedules={mockSchedules}
            date={today}
          />
        )}

        {activeTab === 'clinical' && (
          <ClinicalResponseBoard
            entries={clinicalEntries}
            patientName={PATIENT.name}
            diagnosis={PATIENT.diagnosis}
          />
        )}

        {activeTab === 'evolution' && (
          <MedicationEvolutionMap
            rootDiagnosis={PATIENT.diagnosis}
            branches={therapyBranches}
            patientName={PATIENT.name}
          />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyWallet items={inventoryItems} />
        )}

        {activeTab === 'mobile' && (
          <PatientMobileJourney
            patientName={PATIENT.name}
            date={today}
            tasks={dailyTasks}
            adherenceRate={85}
            nextAppointment={makeDate(0, -0.5)}
          />
        )}

        {activeTab === 'memory' && (
          <LifetimeTherapeuticMemory
            events={therapyEvents}
            patientName={PATIENT.name}
          />
        )}
      </div>

      {/* Summary footer */}
      <div className="glass-card mt-4 px-4 py-3 text-[10px] text-[var(--text-muted)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shadow-[0_0_6px_var(--teal)]" />
          <span className="font-bold text-[var(--teal)]">AMEXAN Clinical Summary</span>
        </div>
        <div className="flex gap-6">
          <span>🧬 <strong className="text-[var(--text-secondary)]">Diagnosis:</strong> T2DM (2016)</span>
          <span>💊 <strong className="text-[var(--text-secondary)]">Active Rx:</strong> 4</span>
          <span>📈 <strong className="text-[var(--text-secondary)]">HbA1c Trend:</strong> 10.2% → 6.8%</span>
          <span>⚠ <strong className="text-[var(--text-secondary)]">Complications:</strong> Neuropathy (mild)</span>
          <span>🏆 <strong className="text-[var(--text-secondary)]">Status:</strong> Stable</span>
        </div>
      </div>
    </AMEXANLayout>
  );
}
