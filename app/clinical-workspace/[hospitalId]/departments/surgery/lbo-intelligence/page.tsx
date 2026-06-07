/**
 * LBO Master Encounter — Clinical Operating System
 *
 * Complete 10-step clinical workflow:
 *   1. Registration  2. History  3. Examination
 *   4. Investigations  5. Imaging  6. Clinical Reasoning
 *   7. Management  8. Operative Note  9. Discharge  10. Documentation
 *
 * Features:
 *   - Stateful multi-step wizard with stepper navigation
 *   - localStorage-based record storage
 *   - Full LBO engine integration via API
 *   - PDF document generation and viewing
 *   - Timeline / audit trail
 *   - Clinical decision explanations
 */
'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { LboPatientData } from '@/src/engine/domains/lbo/lbo-reasoning-engine';
import type { LboApiOutput } from '@/src/engine/domains/lbo/api/lbo-api';
import {
  createRecord, updateRecord, getRecord, getAllRecords,
  setActiveRecordId, getActiveRecordId, addTimelineEvent,
  buildEngineInput,
} from '@/src/engine/domains/lbo/lbo-records';
import type { LboFullRecord, LboClinicalFacts, RegistrationData, HistoryData, ExamData, InvestigationsData, ImagingData } from '@/src/engine/domains/lbo/lbo-records';
import { RegistrationStep, HistoryStep, ExaminationStep, InvestigationsStep, ImagingStep, DocumentationStep } from './steps/ClinicalSteps';
import { ReasoningStep, ManagementStep, OperativeNoteStep, DischargeStep } from './steps/ReasoningSteps';
import ReasoningPanel from './components/ReasoningPanel';
import PostOpDashboard from './components/PostOpDashboard';
import type { PostOpMonitoringData } from '@/src/engine/domains/lbo/lbo-records';
import { EMPTY_POSTOP } from './components/PostOpDashboard';

// ── Types ───────────────────────────────────────────────────────────────────

interface StepDef {
  id: string; label: string; icon: string; desc: string;
}
const STEPS: StepDef[] = [
  { id: 'registration', label: 'Registration', icon: '📋', desc: 'Patient demographics & encounter info' },
  { id: 'history', label: 'History', icon: '📝', desc: 'Full structured history & HPI' },
  { id: 'examination', label: 'Examination', icon: '🩺', desc: 'Vitals, abdominal exam, DRE' },
  { id: 'investigations', label: 'Investigations', icon: '🧪', desc: 'Labs, ABG, crossmatch' },
  { id: 'imaging', label: 'Imaging', icon: '🖼️', desc: 'AXR & CT findings' },
  { id: 'reasoning', label: 'Clinical Reasoning', icon: '🧠', desc: 'Run engine, see diagnosis & alerts' },
  { id: 'management', label: 'Management', icon: '💊', desc: 'Plan, resuscitation, operative decision' },
  { id: 'operative', label: 'Operative Note', icon: '🔪', desc: 'Surgical documentation' },
  { id: 'discharge', label: 'Discharge', icon: '🚪', desc: 'Summary & follow-up plan' },
  { id: 'documentation', label: 'Documents', icon: '📄', desc: 'Clerking, operative & discharge PDFs' },
];

const STEP_IDS = STEPS.map(s => s.id);

// ── Empty Defaults ─────────────────────────────────────────────────────────

const EMPTY_REG: RegistrationData = { patientName: '', mrn: '', age: 0, sex: 'male', encounterDate: new Date().toISOString().split('T')[0], encounterType: 'emergency', referringFacility: '', consultant: '', ward: '', bed: '', surgeon: '', bloodGroup: '', allergies: [], anticoagulants: [], previousSurgery: '' };

// ── Component ───────────────────────────────────────────────────────────────

export default function LboMasterEncounterPage() {
  const params = useParams();
  const hospitalId = params?.hospitalId as string || 'hospital';

  // ── Core State ──────────────────────────────────────────────────────────
  const [records, setRecords] = useState<LboFullRecord[]>([]);
  const [activeRecordId, setActiveRecordIdState] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [engineOutput, setEngineOutput] = useState<LboApiOutput | null>(null);
  const [engineLoading, setEngineLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecords, setShowRecords] = useState(false);
  const [recordsTab, setRecordsTab] = useState<'list' | 'active'>('active');
  const outputRef = useRef<HTMLDivElement>(null);

  // ── Clinical Data State ──────────────────────────────────────────────────
  const [registration, setRegistration] = useState<RegistrationData>(EMPTY_REG);
  const [history, setHistory] = useState<HistoryData>({
    presentingComplaint: '', complaintDuration: '', complaintSeverity: 5,
    hpiOnset: '', hpiDuration: '', hpiProgression: '', hpiPainCharacter: '',
    hpiPainLocation: '', hpiPainRadiation: '', hpiAssociatedVomiting: false,
    hpiVomitingFrequency: '', hpiVomitContent: '', hpiFlatusStatus: 'unknown',
    hpiBowelStatus: 'open', hpiLastBowelDays: 0, hpiWeightLoss: false,
    hpiWeightLossAmount: '', hpiBleeding: false, hpiBleedingType: '',
    hpiPreviousEpisodes: false,
    deniesNausea: false, deniesVomiting: false, deniesFever: false,
    deniesWeightLoss: false, deniesRectalBleeding: false,
    deniesPreviousEpisodes: false, deniesAbdominalSurgery: false,
    deniesChronicConstipation: false, deniesFamilyHistoryCRC: false,
    deniesSmoking: false, deniesAlcohol: false, deniesAnticoagulants: false,
    deniesSteroids: false, deniesNSAIDs: false,
    pmh: '', surgicalHistory: '', drugHistory: '', allergies_text: '',
    familyHistory: '', socialHistory: '',
    rosFever: false, rosWeightLoss: false, rosNightSweats: false, rosFatigue: false,
    rosNausea: false, rosDysphagia: false, rosEarlySatiety: false,
    rosAbdominalPain: false, rosChangeBowelHabit: false,
    rosPalpitations: false,
    rosUrinarySymptoms: false, rosChestPain: false, rosDyspnoea: false,
    rosCough: false, rosHeadache: false, rosDizziness: false,
    rosSyncope: false, rosRash: false, rosJointPain: false, rosBackPain: false,
    contextAtOnset: '', firstSensation: '', functionalImpact: '',
    eatingImpact: 'normal', sleepImpact: 'normal', workCapacity: 'normal',
  });
  const [exam, setExam] = useState<ExamData>({
    vitals: { heartRate: 80, systolicBP: 120, diastolicBP: 80, temperature: 37.0, respiratoryRate: 16, spO2: 98, gcs: 15 },
    generalAppearance: '', hydrationStatus: '', distressLevel: '',
    abdominalInspection: '', distensionSeverity: 'none', abdominalMass: false,
    scars: '', hernialOrifices: '', abdominalTenderness: 'none',
    tendernessLocation: '', peritonism: false, guarding: false, rigidity: false,
    reboundTenderness: false, percussionTympanic: false, percussionDull: false,
    bowelSounds: 'normal', drePerformed: false, dreFinding: '',
    dreStoolColour: '', dreMass: false, dreBlood: false,
  });
  const [investigations, setInvestigations] = useState<InvestigationsData>({
    wbc: 0, hemoglobin: 0, platelets: 0, neutrophils: 0, crp: 0, lactate: 0,
    sodium: 0, potassium: 0, creatinine: 0, urea: 0, glucose: 0, bicarbonate: 0,
    gcs: 15, ph: 7.4, baseExcess: 0, crossmatch: false, ecg: '',
  });
  const [imaging, setImaging] = useState<ImagingData>({
    axrCoffeeBeanSign: false, axrBentInnerTubeSign: false, axrFreeAir: false,
    axrColonicDilationCm: 0, axrAirFluidLevels: false, axrHaustraPattern: 'haustra',
    ctTransitionPoint: false, ctTransitionLevel: 'none', ctMesentericSwirl: false,
    ctBirdBeakSign: false, ctAppleCoreLesion: false, ctColonicWallThickening: false,
    ctPneumatosis: false, ctPortalVenousGas: false, ctFreeFluid: false,
    ctFreeAir: false, ctTargetLesion: false, ctCecalDilationCm: 0,
  });
  const [postOp, setPostOp] = useState<PostOpMonitoringData>(EMPTY_POSTOP);
  const [patientStable, setPatientStable] = useState(true);
  const [comorbidities, setComorbidities] = useState('');

  // ── Management State ────────────────────────────────────────────────────
  const [management, setManagement] = useState<Record<string, any>>({});
  const [operativeNote, setOperativeNote] = useState<Record<string, any>>({});
  const [discharge, setDischarge] = useState<Record<string, any>>({});

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setRecords(getAllRecords());
    const activeId = getActiveRecordId();
    if (activeId) {
      setActiveRecordIdState(activeId);
      const rec = getRecord(activeId);
      if (rec) loadRecord(rec);
    }
  }, []);

  function loadRecord(rec: LboFullRecord) {
    if (!rec) return;
    const cf = rec.clinicalFacts;
    setRegistration(cf.registration);
    setHistory(cf.history);
    setExam(cf.exam);
    setInvestigations(cf.investigations);
    setImaging(cf.imaging);
    if (cf.postOp) setPostOp(cf.postOp);
    if (rec.engineOutput) setEngineOutput(rec.engineOutput);
  }

  // ── Record Management ────────────────────────────────────────────────────

  function buildFacts(): LboClinicalFacts {
    return { registration, history, exam, investigations, imaging, postOp };
  }

  function saveCurrentRecord(status?: string) {
    const facts = buildFacts();
    const engineInput = buildEngineInput(facts);
    const meta = {
      patientName: registration.patientName,
      mrn: registration.mrn,
      age: registration.age,
      encounterType: registration.encounterType,
      status: (status || 'active') as any,
    };
    let rec: LboFullRecord;
    if (activeRecordId) {
      const existing = getRecord(activeRecordId);
      if (!existing) { rec = createRecord(meta); }
      else {
        updateRecord(activeRecordId, { clinicalFacts: facts, engineInput, engineOutput: engineOutput || undefined, documents: { clerkingPdf: engineOutput?.documentation.clerkingPdf || '', operativeNotePdf: engineOutput?.documentation.operativeNotePdf, dischargePdf: engineOutput?.documentation.dischargePdf }, ...meta });
        rec = getRecord(activeRecordId)!;
      }
    } else {
      rec = createRecord(meta);
      setActiveRecordIdState(rec.id);
    }
    rec = updateRecord(rec.id, { clinicalFacts: facts, engineInput, engineOutput: engineOutput || undefined, documents: { clerkingPdf: engineOutput?.documentation.clerkingPdf || '', operativeNotePdf: engineOutput?.documentation.operativeNotePdf, dischargePdf: engineOutput?.documentation.dischargePdf } })!;
    setRecords(getAllRecords());
    return rec;
  }

  function handleNewEncounter() {
    setActiveRecordIdState(null);
    setEngineOutput(null);
    setError(null);
    setCurrentStep(0);
    setRegistration(EMPTY_REG);
    setHistory({ presentingComplaint: '', complaintDuration: '', complaintSeverity: 5, hpiOnset: '', hpiDuration: '', hpiProgression: '', hpiPainCharacter: '', hpiPainLocation: '', hpiPainRadiation: '', hpiAssociatedVomiting: false, hpiVomitingFrequency: '', hpiVomitContent: '', hpiFlatusStatus: 'unknown', hpiBowelStatus: 'open', hpiLastBowelDays: 0, hpiWeightLoss: false, hpiWeightLossAmount: '', hpiBleeding: false, hpiBleedingType: '', hpiPreviousEpisodes: false, deniesNausea: false, deniesVomiting: false, deniesFever: false, deniesWeightLoss: false, deniesRectalBleeding: false, deniesPreviousEpisodes: false, deniesAbdominalSurgery: false, deniesChronicConstipation: false, deniesFamilyHistoryCRC: false, deniesSmoking: false, deniesAlcohol: false, deniesAnticoagulants: false, deniesSteroids: false, deniesNSAIDs: false, pmh: '', surgicalHistory: '', drugHistory: '', allergies_text: '', familyHistory: '', socialHistory: '', rosFever: false, rosWeightLoss: false, rosNightSweats: false, rosFatigue: false, rosNausea: false, rosDysphagia: false, rosEarlySatiety: false,
    rosAbdominalPain: false, rosChangeBowelHabit: false,
    rosPalpitations: false,
    rosUrinarySymptoms: false, rosChestPain: false, rosDyspnoea: false,
    rosCough: false, rosHeadache: false, rosDizziness: false,
    rosSyncope: false, rosRash: false, rosJointPain: false, rosBackPain: false,
    contextAtOnset: '', firstSensation: '', functionalImpact: '',
    eatingImpact: 'normal', sleepImpact: 'normal', workCapacity: 'normal',
    painEvolution: { hasBecomeContinuous: false, hasGeneralized: false, severityInitial: 5, severityCurrent: 5, worseWithMovement: false, betterWithPosition: false },
    distensionEvolution: { progressionRate: 'slow_days', affectingBreathing: false, painWithDistension: false, distensionRelievedByVomiting: false },
    vomitingEvolution: { contentProgression: [], contentCurrent: 'food', nauseaBeforeVomiting: false, vomitingRelievesPain: false, frequencyIncreasing: false },
    bowelFunction: { lastNormalStoolDays: 0, lastStoolDays: 0, lastFlatusDays: 0, stoolCaliberReduced: false, alternatingConstipationDiarrhea: false, progressiveConstipationMonths: false, straining: false, incompleteEvacuation: false },
    ischemiaPerforation: { painNowConstant: false, painWorseThanBefore: false, fever: false, rigors: false, confusion: false, reducedUrine: false, unableToStand: false, severeWeakness: false, tachycardia: false, hypotension: false },
    cancerScreening: { weightLoss: false, weightLossAmount: '', appetiteLoss: false, bloodPerRectum: false, pencilStools: false, progressiveConstipation: false, familyHistoryCRC: false },
    volvulusRisk: { previousAttacks: false, chronicConstipation: false, highFiberDiet: false, psychiatricDisease: false, parkinsons: false, institutionalized: false },
    dehydrationRenal: { thirst: false, dryMouth: false, dizziness: false, reducedUrine: false, darkUrine: false, syncope: false },
    });
    setExam({ vitals: { heartRate: 80, systolicBP: 120, diastolicBP: 80, temperature: 37.0, respiratoryRate: 16, spO2: 98, gcs: 15 }, generalAppearance: '', hydrationStatus: '', distressLevel: '', jaundice: false, anaemia: false, lymphadenopathy: false, systemic: { cvs: { jvp: '', heartSounds: '', murmurs: '', peripheralOedema: 'none', capillaryRefill: '', peripheralPulses: '' }, respiratory: { chestWall: '', breathSounds: '', addedSounds: '', percussion: '', accessoryMuscleUse: false }, cns: { alertness: 'alert', gcs: 15, power: '', sensation: '', speech: '' }, msk: { spineTenderness: false, jointSwelling: '', deformity: '', mobility: 'independent' } }, abdominalInspection: '', distensionSeverity: 'none', abdominalMass: false, massLocation: '', scars: '', hernialOrifices: '', abdominalTenderness: 'none', tendernessLocation: '', peritonism: false, guarding: false, rigidity: false, reboundTenderness: false, murphySign: false, rovsingSign: false, percussionTympanic: false, percussionDull: false, bowelSounds: 'normal', drePerformed: false, dreSphincterTone: '', dreFinding: '', dreStoolColour: '', dreMass: false, dreBlood: false });
    setInvestigations({ wbc: 0, hemoglobin: 0, platelets: 0, neutrophils: 0, crp: 0, lactate: 0, sodium: 0, potassium: 0, creatinine: 0, urea: 0, glucose: 0, bicarbonate: 0, gcs: 15, ph: 7.4, baseExcess: 0, crossmatch: false, ecg: '' });
    setImaging({ axrCoffeeBeanSign: false, axrBentInnerTubeSign: false, axrFreeAir: false, axrColonicDilationCm: 0, axrAirFluidLevels: false, axrHaustraPattern: 'haustra', ctTransitionPoint: false, ctTransitionLevel: 'none', ctMesentericSwirl: false, ctBirdBeakSign: false, ctAppleCoreLesion: false, ctColonicWallThickening: false, ctPneumatosis: false, ctPortalVenousGas: false, ctFreeFluid: false, ctFreeAir: false, ctTargetLesion: false, ctCecalDilationCm: 0 });
    setPostOp(EMPTY_POSTOP);
    setManagement({}); setOperativeNote({}); setDischarge({});
    setPatientStable(true); setComorbidities('');
  }

  function handleSelectRecord(id: string) {
    const rec = getRecord(id);
    if (!rec) return;
    setActiveRecordIdState(id);
    setActiveRecordId(id);
    loadRecord(rec);
    setShowRecords(false);
    setCurrentStep(STEP_IDS.indexOf('reasoning') >= 0 ? STEP_IDS.indexOf('reasoning') : 0);
  }

  // ── Engine ───────────────────────────────────────────────────────────────

  const handleRunEngine = useCallback(async () => {
    const engineInput: LboPatientData = {
      age: registration.age || 0,
      comorbidities: comorbidities.split(',').map(s => s.trim()).filter(Boolean),
      patientStable,
      vitals: { heartRate: exam.vitals.heartRate || undefined, systolicBP: exam.vitals.systolicBP || undefined, temperature: exam.vitals.temperature || undefined, respiratoryRate: exam.vitals.respiratoryRate || undefined, spO2: exam.vitals.spO2 || undefined },
      labs: { wbc: investigations.wbc || undefined, lactate: investigations.lactate || undefined, crp: investigations.crp || undefined, creatinine: investigations.creatinine || undefined },
      exam: { distensionSeverity: exam.distensionSeverity, constipationDays: history.hpiLastBowelDays, painConstant: history.hpiPainCharacter === 'constant', vomiting: history.hpiAssociatedVomiting, previousEpisodes: history.hpiPreviousEpisodes, peritonism: exam.peritonism, guarding: exam.guarding, rigidity: exam.rigidity, absentBowelSounds: exam.bowelSounds === 'absent', massPalpable: exam.abdominalMass },
      axrFindings: { coffeeBeanSign: imaging.axrCoffeeBeanSign, bentInnerTubeSign: imaging.axrBentInnerTubeSign, freeAir: imaging.axrFreeAir, colonicDilationCm: imaging.axrColonicDilationCm, airFluidLevels: imaging.axrAirFluidLevels, haustraPattern: imaging.axrHaustraPattern },
      ctFindings: { transitionPoint: imaging.ctTransitionPoint, transitionLevel: imaging.ctTransitionLevel as any, mesentericSwirl: imaging.ctMesentericSwirl, birdBeakSign: imaging.ctBirdBeakSign, appleCoreLesion: imaging.ctAppleCoreLesion, colonicWallThickening: imaging.ctColonicWallThickening, pneumatosis: imaging.ctPneumatosis, portalVenousGas: imaging.ctPortalVenousGas, freeFluid: imaging.ctFreeFluid, freeAir: imaging.ctFreeAir, targetLesion: imaging.ctTargetLesion, cecalDilationCm: imaging.ctCecalDilationCm },
    };

    setEngineLoading(true); setError(null);
    try {
      const fullPayload = {
        ...engineInput,
        _fullData: {
          registration,
          history,
          exam,
          investigations,
          imaging,
        },
      };
      const res = await fetch('/api/clinical/domains/lbo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fullPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Engine request failed');
      setEngineOutput(data.data);
      const rec = saveCurrentRecord();
      addTimelineEvent(rec.id, 'reasoning', 'LBO Engine run', `Diagnosis: ${data.data.reasoning.diagnosis} (${(data.data.reasoning.probability * 100).toFixed(1)}%)`);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setEngineLoading(false);
    }
  }, [registration, history, exam, investigations, imaging, comorbidities, patientStable]);

  // ── Navigation ──────────────────────────────────────────────────────────

  const handleStepComplete = (stepId: string) => {
    const rec = saveCurrentRecord();
    addTimelineEvent(rec.id, stepId, `${stepId} completed`, 'Clinical data saved');
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const canGoNext = currentStep < STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/clinical-workspace/${hospitalId}/departments/surg`} className="text-gray-400 hover:text-gray-600 transition">← Surgery</Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-bold text-gray-800">🫁 Large Bowel Obstruction — Master Encounter</h1>
          </div>
          <div className="flex items-center gap-2">
            {activeRecordId && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-mono">{activeRecordId}</span>}
            <button onClick={handleNewEncounter} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 font-medium">+ New</button>
            <button onClick={() => { setShowRecords(!showRecords); setRecords(getAllRecords()); }} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 font-medium">{showRecords ? 'Close Records' : '📁 Records'}</button>
          </div>
        </div>
      </header>

      {/* Records Panel */}
      {showRecords && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => setRecordsTab('active')} className={`text-xs font-medium px-3 py-1 rounded-full ${recordsTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Active Record</button>
              <button onClick={() => setRecordsTab('list')} className={`text-xs font-medium px-3 py-1 rounded-full ${recordsTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All Records</button>
            </div>
            {recordsTab === 'active' && activeRecordId && (() => {
              const rec = getRecord(activeRecordId);
              if (!rec) return <p className="text-sm text-gray-400">No active record</p>;
              return (
                <div className="text-sm bg-gray-50 rounded-lg p-3">
                  <p><b>Patient:</b> {rec.patientName} | <b>MRN:</b> {rec.mrn} | <b>Age:</b> {rec.age}</p>
                  <p><b>Status:</b> {rec.status} | <b>Diagnosis:</b> {rec.diagnosis || 'Pending'} | <b>Last Modified:</b> {new Date(rec.lastModified).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1"><b>Timeline ({rec.timeline.length} events):</b> {rec.timeline.slice(-3).map(t => `[${t.phase}] ${t.action}`).join(' → ')}</p>
                </div>
              );
            })()}
            {recordsTab === 'list' && (
              <div className="max-h-48 overflow-auto space-y-1">
                {records.map(r => (
                  <div key={r.id} className={`flex items-center justify-between text-sm p-2 rounded-lg cursor-pointer ${r.id === activeRecordId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => handleSelectRecord(r.id)}>
                    <div>
                      <span className="font-medium">{r.patientName}</span>
                      <span className="text-gray-400 ml-2">MRN: {r.mrn}</span>
                      <span className="text-gray-400 ml-2">{r.encounterType}</span>
                      <span className="ml-2">{r.diagnosis ? `🧠 ${r.diagnosis}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                      <span className="text-xs text-gray-400">{new Date(r.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {records.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No records yet. Start a new encounter.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max">
            {STEPS.map((s, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <button key={s.id} onClick={() => setCurrentStep(i)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                    isActive ? 'border-blue-600 text-blue-700 bg-blue-50' : isDone ? 'border-green-400 text-green-600 hover:bg-gray-50' : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>{isDone ? '✓' : i + 1}</span>
                  <span className="hidden sm:inline">{s.icon}</span>
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content — Three-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left + Center: Step content */}
        <div className="flex-1 min-w-0">
          {/* Step Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">{step.icon} {step.label}</h2>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </div>

          {/* Error */}
          {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl text-sm">{error}</div>}

          {/* Step Content */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 min-h-[400px]">
            {(() => {
              switch (step.id) {
                case 'registration':
                  return <RegistrationStep data={registration} onChange={setRegistration} />;
                case 'history':
                  return <HistoryStep data={history} onChange={setHistory} registration={registration} />;
                case 'examination':
                  return <ExaminationStep data={exam} onChange={setExam} registration={registration} history={history} />;
                case 'investigations':
                  return <InvestigationsStep data={investigations} onChange={setInvestigations} />;
                case 'imaging':
                  return <ImagingStep data={imaging} onChange={setImaging} />;
                case 'reasoning':
                  return (
                    <div>
                      <div className="mb-6 flex items-center gap-3">
                        <button onClick={handleRunEngine} disabled={engineLoading}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold text-sm flex items-center gap-2 shadow-sm">
                          {engineLoading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Running...</> : '▶ Run LBO Clinical Reasoning Engine'}
                        </button>
                        {engineOutput && <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">Engine complete</span>}
                      </div>
                      <div ref={outputRef}>
                        <ReasoningStep output={engineOutput} loading={engineLoading} />
                      </div>
                      {/* Post-Op Monitoring Dashboard */}
                      {engineOutput && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <h3 className="text-base font-bold text-gray-800 mb-4">🩺 Post-Operative Monitoring Dashboard</h3>
                          <PostOpDashboard data={postOp} onChange={setPostOp} />
                        </div>
                      )}
                    </div>
                  );
                case 'management':
                  return (
                    <ManagementStep
                      management={engineOutput?.reasoning.managementPlan.urgency || 'Awaiting engine'}
                      operativeRecommended={engineOutput?.operativeDecision?.recommendedProcedure?.procedure || 'Awaiting engine'}
                      stomaLikelihood={engineOutput?.reasoning.managementPlan.stomaLikelihood || 'unknown'}
                      icuRequired={engineOutput?.operativeDecision?.urgency === 'emergency' || engineOutput?.operativeDecision?.urgency === 'immediate'}
                      onSave={(data) => { setManagement(data); handleStepComplete('management'); }}
                      initial={management as any}
                    />
                  );
                case 'operative':
                  return <OperativeNoteStep onSave={(d) => { setOperativeNote(d as any); handleStepComplete('operative'); }} initial={operativeNote as any} />;
                case 'discharge':
                  return <DischargeStep onSave={(d) => { setDischarge(d as any); const rec = saveCurrentRecord('discharged'); addTimelineEvent(rec.id, 'discharge', 'Patient discharged', 'Discharge summary completed'); handleStepComplete('discharge'); }} initial={discharge as any} />;
                case 'documentation':
                  return <DocumentationStep
                    registration={registration}
                    history={history}
                    exam={exam}
                    investigations={investigations}
                    imaging={imaging}
                    engineOutput={engineOutput}
                    postOp={postOp}
                    clerkingPdf={engineOutput?.documentation.clerkingPdf || ''}
                    operativeNotePdf={engineOutput?.documentation.operativeNotePdf}
                    dischargePdf={engineOutput?.documentation.dischargePdf}
                  />;
                default:
                  return <p className="text-gray-400">Unknown step: {step.id}</p>;
              }
            })()}
          </div>

          {/* Navigation */}
          {step.id !== 'reasoning' && step.id !== 'documentation' && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                ← Previous: {currentStep > 0 ? STEPS[currentStep - 1].label : '...'}
              </button>
              <button onClick={() => handleStepComplete(step.id)}
                className="px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                {isLastStep ? 'Complete' : `Save & Continue → ${canGoNext ? STEPS[currentStep + 1].label : ''}`}
              </button>
            </div>
          )}

          {/* Reasoning nav */}
          {step.id === 'reasoning' && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setCurrentStep(currentStep - 1)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                ← Previous: {STEPS[currentStep - 1].label}
              </button>
              {engineOutput && (
                <button onClick={() => setCurrentStep(currentStep + 1)} className="px-6 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm">
                  Proceed to Management →
                </button>
              )}
            </div>
          )}

          {/* Docs nav */}
          {step.id === 'documentation' && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setCurrentStep(currentStep - 1)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                ← Previous
              </button>
              <button onClick={() => saveCurrentRecord('completed')} className="px-6 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm">
                Complete & Save Final Record
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar — Live Reasoning Panel */}
        <aside className="w-80 shrink-0 hidden lg:block">
          <div className="sticky top-20">
            <ReasoningPanel
              stepId={step.id}
              registration={registration}
              history={history}
              exam={exam}
              investigations={investigations}
              imaging={imaging}
              engineOutput={engineOutput}
              engineLoading={engineLoading}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
