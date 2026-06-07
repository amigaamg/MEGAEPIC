/**
 * LBO Master Encounter — Clinical Step Components
 *
 * Enhanced with:
 *   - Explicit negative history capture (tick "No" for excluded symptoms)
 *   - Auto-generated history summary
 *   - Extended review of systems
 *   - Exam impression with history linkage
 */
'use client';
import React, { useState } from 'react';
import type { RegistrationData, HistoryData, ExamData, InvestigationsData, ImagingData, PostOpMonitoringData, SymptomStream } from '@/src/engine/domains/lbo/lbo-records';
import type { PmhConditionEntry } from '@/src/engine/domains/lbo/lbo-records';
import { synthesizeStreamsFromHistory, syncHistoryFromStreams } from '@/src/engine/domains/lbo/lbo-records';
import TimelineHistoryStep from '../components/TimelineHistoryStep';
import type { LboApiOutput } from '@/src/engine/domains/lbo/api/lbo-api';
import { reasonHistory } from '@/src/engine/domains/lbo/reasoning/lbo-history-reasoning';
import { reasonExam } from '@/src/engine/domains/lbo/reasoning/lbo-exam-reasoning';
import { generateCasePresentationPdf, downloadPdf } from '@/src/engine/domains/lbo/reasoning/lbo-pdf-generator';
import GynaeSection from '../components/GynaeSection';
import DrugRiskAnalyzer from '../components/DrugRiskAnalyzer';
import { PmhGrid, DEFAULT_CONDITIONS } from '../components/PmhGrid';
import type { PmhCondition } from '../components/PmhGrid';

// ── Shared UI Helpers ──────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-1 mb-3">{title}</h3>
      {desc && <p className="text-xs text-gray-500 mb-2">{desc}</p>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-3 mb-2">
      <span className="text-sm text-gray-600 w-36 shrink-0 font-medium">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}

function Input({ value, onChange, type = 'text', step, placeholder, className = '' }: {
  value: string | number; onChange: (v: string) => void;
  type?: string; step?: string; placeholder?: string; className?: string;
}) {
  return (
    <input type={type} step={step} value={value ?? ''} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition ${className}`} />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Checkbox({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function NegCheckbox({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-50">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-400 text-red-500 focus:ring-red-400" />
      <span className="text-xs text-gray-500"><span className="font-medium text-gray-400">Denies</span> {label}</span>
    </label>
  );
}

function TextArea({ value, onChange, rows = 3, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-y" />
  );
}

function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-x-6`}>{children}</div>;
}

function InfoBox({ title, children, variant = 'blue' }: { title: string; children: React.ReactNode; variant?: 'blue' | 'green' | 'amber' }) {
  const colors = { blue: 'bg-blue-50 border-blue-200 text-blue-800', green: 'bg-green-50 border-green-200 text-green-800', amber: 'bg-amber-50 border-amber-200 text-amber-800' };
  return (
    <div className={`border rounded-xl p-4 text-sm ${colors[variant]}`}>
      <p className="font-bold mb-1">{title}</p>
      <div className="whitespace-pre-wrap leading-relaxed">{children}</div>
    </div>
  );
}

// ── Live History Summary ────────────────────────────────────────────────────

function HistorySummary({ history, registration }: { history: HistoryData; registration: RegistrationData }) {
  const hasData = history.presentingComplaint || history.hpiOnset || history.hpiPainCharacter || history.hpiAssociatedVomiting;
  if (!hasData) return null;

  try {
    const result = reasonHistory(history, registration);
    const [expandedDdx, setExpandedDdx] = React.useState<string | null>(null);
    return (
      <Section title="📋 Auto-Generated History Summary">
        <InfoBox title="Narrative Summary" variant="green">
          {result.summary}
        </InfoBox>
        {result.riskFactors.present.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Risk Factors Identified</p>
            <div className="flex flex-wrap gap-1">
              {result.riskFactors.present.map((rf, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${rf.significance === 'major' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {rf.factor}
                </span>
              ))}
            </div>
          </div>
        )}
        {result.complicationScreening.filter(c => c.suspicion === 'high' || c.suspicion === 'moderate').length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Complication Screening</p>
            {result.complicationScreening.filter(c => c.suspicion === 'high' || c.suspicion === 'moderate').map((c, i) => (
              <div key={i} className={`text-xs p-2 rounded mb-1 ${c.suspicion === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                <span className="font-bold">{c.complication}:</span> <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold text-white ${c.suspicion === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}>{c.suspicion}</span>
                <p className="text-gray-600 mt-0.5 text-[10px]">Triggers: {c.triggerFindings.join('; ')}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">DDX — Scientific Reasoning from History</p>
          {result.ddxClues.sort((a, b) => b.netScore - a.netScore).map((ddx, i) => {
            const isExpanded = expandedDdx === ddx.diagnosis;
            return (
              <div key={i} className="border border-gray-100 rounded-lg mb-1 overflow-hidden">
                <button onClick={() => setExpandedDdx(isExpanded ? null : ddx.diagnosis)}
                  className="w-full flex items-center justify-between p-2 hover:bg-gray-50 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      ddx.netScore > 10 ? 'bg-green-500' : ddx.netScore > 0 ? 'bg-amber-500' : 'bg-red-400'
                    }`}>
                      {ddx.netScore > 0 ? '+' : ''}{ddx.netScore}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{ddx.diagnosis}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-green-600 text-xs font-medium">{ddx.inFavor.length} for</span>
                    <span className="text-red-500 text-xs font-medium">{ddx.against.length} against</span>
                    <span className="text-gray-300 text-sm ml-1">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2 bg-gray-50/50">
                    {ddx.inFavor.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase mt-1">✓ In Favor</p>
                        {ddx.inFavor.map((f, fi) => (
                          <div key={fi} className="bg-green-50 border border-green-100 rounded p-2 mt-1">
                            <p className="text-xs text-green-800 font-medium">{f.finding} <span className="text-green-500 font-normal">(+{f.weight})</span></p>
                            <p className="text-[11px] text-green-700 mt-0.5 italic">{f.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {ddx.against.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-red-600 uppercase mt-1">✗ Against</p>
                        {ddx.against.map((a, ai) => (
                          <div key={ai} className="bg-red-50 border border-red-100 rounded p-2 mt-1">
                            <p className="text-xs text-red-700 font-medium">{a.finding} <span className="text-red-500 font-normal">(-{a.weight})</span></p>
                            <p className="text-[11px] text-red-600 mt-0.5 italic">{a.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <p className="text-gray-400 text-xs mt-1">Click each diagnosis to see the clinical reasoning behind the score</p>
        </div>
      </Section>
    );
  } catch {
    return null;
  }
}

// ── Live Exam Impression ────────────────────────────────────────────────────

function ExamImpression({ exam, history, registration }: { exam: ExamData; history: HistoryData; registration: RegistrationData }) {
  const hasData = exam.distensionSeverity !== 'none' || exam.vitals.heartRate !== 80 || exam.abdominalTenderness !== 'none';
  if (!hasData) return null;

  try {
    const result = reasonExam(exam, history, registration);
    return (
      <Section title="📋 Clinical Impression">
        <InfoBox title="Impression" variant="blue">
          {result.impression}
        </InfoBox>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Key Positive Findings</p>
            {result.keyPositiveFindings.map((f, i) => (
              <p key={i} className={`text-xs mb-0.5 ${f.significance === 'critical' ? 'text-red-600 font-bold' : f.significance === 'major' ? 'text-amber-700' : 'text-gray-600'}`}>
                {f.significance === 'critical' ? '🚨 ' : '• '}{f.finding}
              </p>
            ))}
            {result.keyPositiveFindings.length === 0 && <p className="text-xs text-gray-400">No significant positive findings</p>}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Key Negative Findings</p>
            {result.keyNegativeFindings.map((f, i) => (
              <p key={i} className="text-xs text-green-700 mb-0.5">✓ {f.finding}</p>
            ))}
            {result.keyNegativeFindings.length === 0 && <p className="text-xs text-gray-400">No significant negatives</p>}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Urgency Assessment</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
            result.urgencyAssessment.level === 'immediate' ? 'bg-red-600' :
            result.urgencyAssessment.level === 'emergency' ? 'bg-orange-500' :
            result.urgencyAssessment.level === 'urgent' ? 'bg-amber-500' : 'bg-blue-500'
          }`}>
            {result.urgencyAssessment.level.toUpperCase()} — {result.urgencyAssessment.timeToIntervention}
          </span>
        </div>
        {result.peritonismAssessment && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Peritonism Assessment</p>
            <div className={`text-xs p-2 rounded border ${result.peritonismAssessment.present ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
              <p className="font-medium">{result.peritonismAssessment.present ? 'Peritonism PRESENT' : 'No peritonism'}</p>
              <p className="mt-0.5">Pattern: {result.peritonismAssessment.pattern}</p>
              <p className="mt-0.5">Likely aetiology: {result.peritonismAssessment.likelyAetiology}</p>
            </div>
          </div>
        )}
        {result.ddxRefinement.filter(d => d.inFavor.length > 0 || d.against.length > 0).length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">DDX Refinement from Exam</p>
            {result.ddxRefinement.filter(d => d.inFavor.length > 0 || d.against.length > 0).map((d, i) => {
              const [exp, setExp] = React.useState(false);
              return (
                <div key={i} className="border border-gray-100 rounded-lg mb-1 overflow-hidden">
                  <button onClick={() => setExp(!exp)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        d.shift === 'up' ? 'bg-green-500' : d.shift === 'down' ? 'bg-red-400' : 'bg-gray-400'
                      }`}>
                        {d.shift === 'up' ? '↑' : d.shift === 'down' ? '↓' : '→'}
                      </span>
                      <span className="text-xs font-medium text-gray-800">{d.diagnosis}</span>
                    </div>
                    <span className="text-gray-300 text-xs">{exp ? '▲' : '▼'}</span>
                  </button>
                  {exp && (
                    <div className="px-3 pb-2 space-y-1 bg-gray-50/50">
                      {d.inFavor.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-green-700 uppercase mt-1">Exam favors this diagnosis</p>
                          {d.inFavor.map((f, fi) => (
                            <div key={fi} className="bg-green-50 border border-green-100 rounded p-1.5 mt-1">
                              <p className="text-[11px] text-green-800 font-medium">{f.finding}</p>
                              <p className="text-[10px] text-green-700 mt-0.5 italic">{f.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {d.against.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-red-600 uppercase mt-1">Exam opposes this diagnosis</p>
                          {d.against.map((a, ai) => (
                            <div key={ai} className="bg-red-50 border border-red-100 rounded p-1.5 mt-1">
                              <p className="text-[11px] text-red-700 font-medium">{a.finding}</p>
                              <p className="text-[10px] text-red-600 mt-0.5 italic">{a.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    );
  } catch {
    return null;
  }
}

// ── Step 1: Registration ───────────────────────────────────────────────────

export function RegistrationStep({ data, onChange }: {
  data: RegistrationData; onChange: (d: RegistrationData) => void;
}) {
  const set = <K extends keyof RegistrationData>(k: K, v: RegistrationData[K]) => onChange({ ...data, [k]: v });
  const toggleArr = (k: 'allergies' | 'anticoagulants', v: string) => {
    const arr = data[k];
    set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };
  return (
    <div className="space-y-4">
      <Section title="Patient Demographics">
        <Grid>
          <Field label="Patient Name"><Input value={data.patientName} onChange={v => set('patientName', v)} placeholder="e.g. John Kamau" /></Field>
          <Field label="MRN"><Input value={data.mrn} onChange={v => set('mrn', v)} placeholder="Medical record number" /></Field>
          <Field label="Age"><Input value={data.age} onChange={v => set('age', parseInt(v) || 0)} type="number" /></Field>
          <Field label="Sex">
            <Select value={data.sex} onChange={v => set('sex', v as any)} options={[
              { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' },
            ]} />
          </Field>
        </Grid>
      </Section>
      <Section title="Encounter">
        <Grid>
          <Field label="Date"><Input value={data.encounterDate} onChange={v => set('encounterDate', v)} type="date" /></Field>
          <Field label="Type">
            <Select value={data.encounterType} onChange={v => set('encounterType', v as any)} options={[
              { value: 'emergency', label: 'Emergency' }, { value: 'inpatient', label: 'Inpatient' },
              { value: 'ward_round', label: 'Ward Round' }, { value: 'follow_up', label: 'Follow-up' },
            ]} />
          </Field>
          <Field label="Referring Facility"><Input value={data.referringFacility} onChange={v => set('referringFacility', v)} placeholder="e.g. Kisii Teaching & Referral" /></Field>
          <Field label="Consultant"><Input value={data.consultant} onChange={v => set('consultant', v)} placeholder="Consultant surgeon" /></Field>
          <Field label="Ward"><Input value={data.ward} onChange={v => set('ward', v)} placeholder="e.g. Surgical Ward 3B" /></Field>
          <Field label="Bed"><Input value={data.bed} onChange={v => set('bed', v)} placeholder="e.g. Bed 12A" /></Field>
          <Field label="Surgeon"><Input value={data.surgeon} onChange={v => set('surgeon', v)} placeholder="Operating surgeon" /></Field>
          <Field label="Blood Group">
            <Select value={data.bloodGroup} onChange={v => set('bloodGroup', v)} options={[
              { value: '', label: '-- Select --' }, { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' }, { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' }, { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
            ]} />
          </Field>
        </Grid>
      </Section>
      <Section title="Pre-Existing Conditions">
        <Grid>
          <Field label="Allergies">
            <div className="flex flex-wrap gap-2">
              {['Penicillin','Cephalosporins','Sulfa','Aspirin','NSAIDs','Latex','Iodine','None'].map(a => (
                <button key={a} type="button" onClick={() => toggleArr('allergies', a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    data.allergies.includes(a) ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}>{a}</button>
              ))}
            </div>
          </Field>
          <Field label="Anticoagulants">
            <div className="flex flex-wrap gap-2">
              {['Warfarin','Heparin','Enoxaparin','Rivaroxaban','Apixaban','Dabigatran','Aspirin','None'].map(a => (
                <button key={a} type="button" onClick={() => toggleArr('anticoagulants', a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    data.anticoagulants.includes(a) ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}>{a}</button>
              ))}
            </div>
          </Field>
        </Grid>
        <Field label="Previous Surgery"><TextArea value={data.previousSurgery} onChange={v => set('previousSurgery', v)} rows={2} placeholder="Previous abdominal surgeries, dates, complications" /></Field>
      </Section>
    </div>
  );
}

// ── Step 2: History ─────────────────────────────────────────────────────────
// (delegates to TimelineHistoryStep component)

// ── Step 3: Examination (Enhanced with Impression) ──────────────────────────

export function HistoryStep({ data, onChange, registration }: {
  data: HistoryData; onChange: (d: HistoryData) => void;
  registration?: RegistrationData;
}) {
  return <TimelineHistoryStep data={data} onChange={onChange} registration={registration} />;
}

function getDefaultSystemic() {
  return {
    cvs: { jvp: '', heartSounds: '', murmurs: '', peripheralOedema: 'none' as const, capillaryRefill: '', peripheralPulses: '' },
    respiratory: { chestWall: '', breathSounds: '', addedSounds: '', percussion: '', accessoryMuscleUse: false },
    cns: { alertness: 'alert' as const, gcs: 15, power: '', sensation: '', speech: '' },
    msk: { spineTenderness: false, jointSwelling: '', deformity: '', mobility: 'independent' as const },
  };
}

export function ExaminationStep({ data, onChange, registration, history: historyData }: {
  data: ExamData; onChange: (d: ExamData) => void;
  registration?: RegistrationData; history?: HistoryData;
}) {
  const set = <K extends keyof ExamData>(k: K, v: ExamData[K]) => onChange({ ...data, [k]: v });
  const setV = <K extends keyof ExamData['vitals']>(k: K, v: number) => {
    onChange({ ...data, vitals: { ...data.vitals, [k]: v } });
  };

  const reg = registration || { patientName: '', mrn: '', age: 0, sex: 'male' as const, encounterDate: '', encounterType: 'emergency' as const, referringFacility: '', consultant: '', ward: '', bed: '', surgeon: '', bloodGroup: '', allergies: [], anticoagulants: [], previousSurgery: '' };
  const hist = historyData || {
    presentingComplaint: '', complaintDuration: '', complaintSeverity: 5,
    hpiOnset: '', hpiDuration: '', hpiProgression: '', hpiPainCharacter: '',
    hpiPainLocation: '', hpiPainRadiation: '', hpiAssociatedVomiting: false,
    hpiVomitingFrequency: '', hpiVomitContent: '', hpiFlatusStatus: 'unknown' as const,
    hpiBowelStatus: 'open' as const, hpiLastBowelDays: 0, hpiWeightLoss: false,
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
    eatingImpact: 'normal' as const, sleepImpact: 'normal' as const, workCapacity: 'normal' as const,
  };

  return (
    <div className="space-y-4">
      <Section title="Vital Signs">
        <Grid cols={4}>
          <Field label="HR (bpm)"><Input value={data.vitals.heartRate} onChange={v => setV('heartRate', parseInt(v) || 0)} type="number" /></Field>
          <Field label="Systolic BP"><Input value={data.vitals.systolicBP} onChange={v => setV('systolicBP', parseInt(v) || 0)} type="number" /></Field>
          <Field label="Diastolic BP"><Input value={data.vitals.diastolicBP} onChange={v => setV('diastolicBP', parseInt(v) || 0)} type="number" /></Field>
          <Field label="Temperature"><Input value={data.vitals.temperature} onChange={v => setV('temperature', parseFloat(v) || 0)} type="number" step="0.1" /></Field>
          <Field label="RR"><Input value={data.vitals.respiratoryRate} onChange={v => setV('respiratoryRate', parseInt(v) || 0)} type="number" /></Field>
          <Field label="SpO2 (%)"><Input value={data.vitals.spO2} onChange={v => setV('spO2', parseInt(v) || 0)} type="number" /></Field>
          <Field label="GCS"><Input value={data.vitals.gcs} onChange={v => setV('gcs', parseInt(v) || 15)} type="number" /></Field>
        </Grid>
      </Section>
      <Section title="General Examination">
        <Grid>
          <Field label="Appearance"><Input value={data.generalAppearance} onChange={v => set('generalAppearance', v)} placeholder="e.g. In pain, restless, comfortable, acutely unwell" /></Field>
          <Field label="Hydration"><Select value={data.hydrationStatus} onChange={v => set('hydrationStatus', v)} options={[
            { value: '', label: '-- Select --' }, { value: 'well_hydrated', label: 'Well hydrated' },
            { value: 'mild_dehydration', label: 'Mildly dehydrated (dry mucosa, reduced turgor)' },
            { value: 'moderate_dehydration', label: 'Moderately dehydrated (sunken eyes, tachycardia)' },
            { value: 'severe_dehydration', label: 'Severely dehydrated (shock, oliguria)' },
          ]} /></Field>
          <Field label="Distress Level"><Select value={data.distressLevel} onChange={v => set('distressLevel', v)} options={[
            { value: '', label: '-- Select --' }, { value: 'none', label: 'No distress' },
            { value: 'mild', label: 'Mild distress' }, { value: 'moderate', label: 'Moderate distress' },
            { value: 'severe', label: 'Severe distress / in agony' },
          ]} /></Field>
          <Field label="Jaundice"><Checkbox checked={data.jaundice || false} onChange={v => set('jaundice' as any, v)} label="Jaundice / icterus" /></Field>
          <Field label="Anaemia"><Checkbox checked={data.anaemia || false} onChange={v => set('anaemia' as any, v)} label="Pallor / anaemia" /></Field>
          <Field label="Lymphadenopathy"><Checkbox checked={data.lymphadenopathy || false} onChange={v => set('lymphadenopathy' as any, v)} label="Lymphadenopathy (Virchow's node)" /></Field>
        </Grid>
      </Section>
      <Section title="Systemic Examination" desc="Complete head-to-toe assessment — positive and negative findings">
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Cardiovascular System</p>
        <Grid cols={3}>
          <Field label="JVP"><Input value={data.systemic?.cvs.jvp || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cvs: { ...(data.systemic?.cvs || getDefaultSystemic().cvs), jvp: v } })} placeholder="e.g. Not raised, raised 4cm" /></Field>
          <Field label="Heart Sounds"><Input value={data.systemic?.cvs.heartSounds || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cvs: { ...(data.systemic?.cvs || getDefaultSystemic().cvs), heartSounds: v } })} placeholder="S1+S2 normal" /></Field>
          <Field label="Murmurs"><Input value={data.systemic?.cvs.murmurs || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cvs: { ...(data.systemic?.cvs || getDefaultSystemic().cvs), murmurs: v } })} placeholder="None, systolic murmur..." /></Field>
          <Field label="Capillary Refill"><Input value={data.systemic?.cvs.capillaryRefill || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cvs: { ...(data.systemic?.cvs || getDefaultSystemic().cvs), capillaryRefill: v } })} placeholder="<2 sec" /></Field>
          <Field label="Peripheral Pulses"><Input value={data.systemic?.cvs.peripheralPulses || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cvs: { ...(data.systemic?.cvs || getDefaultSystemic().cvs), peripheralPulses: v } })} placeholder="Femoral+DP+PT palpable" /></Field>
          <Field label="Oedema">
            <Select value={data.systemic?.cvs.peripheralOedema || 'none'} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cvs: { ...(data.systemic?.cvs || getDefaultSystemic().cvs), peripheralOedema: v as any } })} options={[
              { value: 'none', label: 'None' }, { value: 'mild', label: 'Mild (ankle)' },
              { value: 'moderate', label: 'Moderate (leg)' }, { value: 'severe', label: 'Severe (sacral/generalised)' },
            ]} />
          </Field>
        </Grid>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase mt-3">Respiratory System</p>
        <Grid cols={3}>
          <Field label="Chest Wall"><Input value={data.systemic?.respiratory.chestWall || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), respiratory: { ...(data.systemic?.respiratory || getDefaultSystemic().respiratory), chestWall: v } })} placeholder="Symmetrical, nil deformity" /></Field>
          <Field label="Breath Sounds"><Input value={data.systemic?.respiratory.breathSounds || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), respiratory: { ...(data.systemic?.respiratory || getDefaultSystemic().respiratory), breathSounds: v } })} placeholder="Vesicular, equal bilaterally" /></Field>
          <Field label="Added Sounds"><Input value={data.systemic?.respiratory.addedSounds || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), respiratory: { ...(data.systemic?.respiratory || getDefaultSystemic().respiratory), addedSounds: v } })} placeholder="None, crepitations, wheeze" /></Field>
          <Field label="Percussion"><Input value={data.systemic?.respiratory.percussion || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), respiratory: { ...(data.systemic?.respiratory || getDefaultSystemic().respiratory), percussion: v } })} placeholder="Resonant, dull at bases" /></Field>
          <Field label="Accessory Muscles"><Checkbox checked={data.systemic?.respiratory.accessoryMuscleUse || false} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), respiratory: { ...(data.systemic?.respiratory || getDefaultSystemic().respiratory), accessoryMuscleUse: v } })} label="Accessory muscle use / distress" /></Field>
        </Grid>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase mt-3">Central Nervous System</p>
        <Grid cols={3}>
          <Field label="Alertness">
            <Select value={data.systemic?.cns.alertness || 'alert'} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cns: { ...(data.systemic?.cns || getDefaultSystemic().cns), alertness: v as any } })} options={[
              { value: 'alert', label: 'Alert & oriented' }, { value: 'confused', label: 'Confused / disoriented' },
              { value: 'drowsy', label: 'Drowsy / rousable' }, { value: 'unresponsive', label: 'Unresponsive' },
            ]} />
          </Field>
          <Field label="Motor Power"><Input value={data.systemic?.cns.power || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cns: { ...(data.systemic?.cns || getDefaultSystemic().cns), power: v } })} placeholder="5/5 all limbs" /></Field>
          <Field label="Sensation"><Input value={data.systemic?.cns.sensation || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cns: { ...(data.systemic?.cns || getDefaultSystemic().cns), sensation: v } })} placeholder="Intact to light touch" /></Field>
          <Field label="Speech"><Input value={data.systemic?.cns.speech || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), cns: { ...(data.systemic?.cns || getDefaultSystemic().cns), speech: v } })} placeholder="Normal, dysarthric, aphasic" /></Field>
        </Grid>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase mt-3">Musculoskeletal System</p>
        <Grid cols={3}>
          <Field label="Spine"><Checkbox checked={data.systemic?.msk.spineTenderness || false} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), msk: { ...(data.systemic?.msk || getDefaultSystemic().msk), spineTenderness: v } })} label="Spinal tenderness" /></Field>
          <Field label="Joint Swelling"><Input value={data.systemic?.msk.jointSwelling || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), msk: { ...(data.systemic?.msk || getDefaultSystemic().msk), jointSwelling: v } })} placeholder="None, knee effusion" /></Field>
          <Field label="Deformity"><Input value={data.systemic?.msk.deformity || ''} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), msk: { ...(data.systemic?.msk || getDefaultSystemic().msk), deformity: v } })} placeholder="None, kyphosis" /></Field>
          <Field label="Mobility">
            <Select value={data.systemic?.msk.mobility || 'independent'} onChange={v => set('systemic', { ...(data.systemic || getDefaultSystemic()), msk: { ...(data.systemic?.msk || getDefaultSystemic().msk), mobility: v as any } })} options={[
              { value: 'independent', label: 'Independent' }, { value: 'assisted', label: 'With assistance' },
              { value: 'bedridden', label: 'Bedridden' },
            ]} />
          </Field>
        </Grid>
      </Section>
      <Section title="Abdominal Examination">
        <Grid>
          <Field label="Inspection"><TextArea value={data.abdominalInspection} onChange={v => set('abdominalInspection', v)} rows={2} placeholder="Symmetry, distension pattern (dome-shaped?), visible peristalsis, scars, herniae, caput medusae" /></Field>
          <Field label="Distension Severity">
            <Select value={data.distensionSeverity} onChange={v => set('distensionSeverity', v as any)} options={[
              { value: 'none', label: 'No distension' }, { value: 'mild', label: 'Mild distension' },
              { value: 'moderate', label: 'Moderate distension' }, { value: 'severe', label: 'Severe / tense distension' },
            ]} />
          </Field>
          <Field label="Abdominal Mass"><Checkbox checked={data.abdominalMass} onChange={v => set('abdominalMass', v)} label="Palpable abdominal mass" /></Field>
          <Field label="Mass Location"><Input value={data.massLocation || ''} onChange={v => set('massLocation' as any, v)} placeholder="e.g. LLQ, central, epigastric" /></Field>
          <Field label="Scars"><Input value={data.scars} onChange={v => set('scars', v)} placeholder="Previous incision scars (type, location)" /></Field>
          <Field label="Hernial Orifices"><Input value={data.hernialOrifices} onChange={v => set('hernialOrifices', v)} placeholder="e.g. Irreducible inguinal hernia, no hernia" /></Field>
        </Grid>
        <Grid>
          <Field label="Tenderness">
            <Select value={data.abdominalTenderness} onChange={v => set('abdominalTenderness', v as any)} options={[
              { value: 'none', label: 'No tenderness' }, { value: 'mild', label: 'Mild tenderness' },
              { value: 'moderate', label: 'Moderate tenderness' }, { value: 'severe', label: 'Severe tenderness' },
            ]} />
          </Field>
          <Field label="Tenderness Location"><Input value={data.tendernessLocation} onChange={v => set('tendernessLocation', v)} placeholder="e.g. LLQ, RLQ, diffuse, periumbilical" /></Field>
        </Grid>
        <Grid>
          <Field label="Peritonism"><Checkbox checked={data.peritonism} onChange={v => set('peritonism', v)} label="Peritoneal signs (cough tenderness)" /></Field>
          <Field label="Guarding"><Checkbox checked={data.guarding} onChange={v => set('guarding', v)} label="Voluntary guarding" /></Field>
          <Field label="Rigidity"><Checkbox checked={data.rigidity} onChange={v => set('rigidity', v)} label="Involuntary rigidity (board-like)" /></Field>
          <Field label="Rebound"><Checkbox checked={data.reboundTenderness} onChange={v => set('reboundTenderness', v)} label="Rebound tenderness (Blumberg sign)" /></Field>
          <Field label="Murphy"><Checkbox checked={data.murphySign || false} onChange={v => set('murphySign' as any, v)} label="Murphy's sign (RUQ)" /></Field>
          <Field label="Rovsing"><Checkbox checked={data.rovsingSign || false} onChange={v => set('rovsingSign' as any, v)} label="Rovsing's sign" /></Field>
          <Field label="Tympanic"><Checkbox checked={data.percussionTympanic} onChange={v => set('percussionTympanic', v)} label="Tympanic on percussion" /></Field>
          <Field label="Dullness"><Checkbox checked={data.percussionDull} onChange={v => set('percussionDull', v)} label="Dullness (shifting)" /></Field>
          <Field label="Bowel Sounds">
            <Select value={data.bowelSounds} onChange={v => set('bowelSounds', v as any)} options={[
              { value: 'normal', label: 'Normal bowel sounds' }, { value: 'reduced', label: 'Reduced bowel sounds' },
              { value: 'absent', label: 'Absent bowel sounds' }, { value: 'high_pitched', label: 'High-pitched / tinkling' },
            ]} />
          </Field>
        </Grid>
      </Section>
      <Section title="Digital Rectal Examination" desc="Mandatory in all suspected LBO — provides critical diagnostic information">
        <Grid>
          <Field label="DRE Performed"><Checkbox checked={data.drePerformed} onChange={v => set('drePerformed', v)} label="DRE performed" /></Field>
          <Field label="Sphincter Tone">
            <Select value={data.dreSphincterTone || ''} onChange={v => set('dreSphincterTone' as any, v)} options={[
              { value: '', label: '-- Select --' }, { value: 'normal', label: 'Normal tone' },
              { value: 'reduced', label: 'Reduced tone' }, { value: 'increased', label: 'Increased tone' },
            ]} />
          </Field>
          <Field label="DRE Finding"><TextArea value={data.dreFinding} onChange={v => set('dreFinding', v)} rows={2} placeholder="Empty rectum, tender, mass palpable, blood, stool character" /></Field>
          <Field label="Stool Colour">
            <Select value={data.dreStoolColour} onChange={v => set('dreStoolColour', v)} options={[
              { value: '', label: '-- Select --' }, { value: 'brown', label: 'Brown (normal)' },
              { value: 'black', label: 'Black / melaena' }, { value: 'red', label: 'Bright red blood' },
              { value: 'maroon', label: 'Maroon / dark blood' }, { value: 'no_stool', label: 'No stool (empty rectum)' },
              { value: 'pale', label: 'Pale / clay-coloured' },
            ]} />
          </Field>
          <Field label="Mass on DRE"><Checkbox checked={data.dreMass} onChange={v => set('dreMass', v)} label="Palpable rectal mass" /></Field>
          <Field label="Blood on DRE"><Checkbox checked={data.dreBlood} onChange={v => set('dreBlood', v)} label="Blood on examining finger" /></Field>
        </Grid>
      </Section>

      {/* Live Exam Impression */}
      <ExamImpression exam={data} history={hist} registration={reg} />
    </div>
  );
}

// ── Step 4: Investigations ─────────────────────────────────────────────────

export function InvestigationsStep({ data, onChange }: {
  data: InvestigationsData; onChange: (d: InvestigationsData) => void;
}) {
  const set = <K extends keyof InvestigationsData>(k: K, v: InvestigationsData[K]) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <Section title="Haematology" desc="FBC with differential">
        <Grid cols={3}>
          <Field label="WBC (×10⁹/L)"><Input value={data.wbc} onChange={v => set('wbc', parseFloat(v) || 0)} type="number" step="0.1" placeholder="4.0-11.0" /></Field>
          <Field label="Hb (g/dL)"><Input value={data.hemoglobin} onChange={v => set('hemoglobin', parseFloat(v) || 0)} type="number" step="0.1" placeholder="13-17 M / 12-15 F" /></Field>
          <Field label="Platelets (×10⁹/L)"><Input value={data.platelets} onChange={v => set('platelets', parseFloat(v) || 0)} type="number" placeholder="150-450" /></Field>
          <Field label="Neutrophils (×10⁹/L)"><Input value={data.neutrophils} onChange={v => set('neutrophils', parseFloat(v) || 0)} type="number" step="0.1" placeholder="2.0-7.5" /></Field>
        </Grid>
      </Section>
      <Section title="Biochemistry">
        <Grid cols={3}>
          <Field label="CRP (mg/L)"><Input value={data.crp} onChange={v => set('crp', parseFloat(v) || 0)} type="number" step="0.1" placeholder="<5" /></Field>
          <Field label="Lactate (mmol/L)"><Input value={data.lactate} onChange={v => set('lactate', parseFloat(v) || 0)} type="number" step="0.1" placeholder="0.5-2.0" /></Field>
          <Field label="Na⁺ (mmol/L)"><Input value={data.sodium} onChange={v => set('sodium', parseFloat(v) || 0)} type="number" placeholder="135-145" /></Field>
          <Field label="K⁺ (mmol/L)"><Input value={data.potassium} onChange={v => set('potassium', parseFloat(v) || 0)} type="number" step="0.1" placeholder="3.5-5.0" /></Field>
          <Field label="Creatinine (µmol/L)"><Input value={data.creatinine} onChange={v => set('creatinine', parseFloat(v) || 0)} type="number" placeholder="60-110" /></Field>
          <Field label="Urea (mmol/L)"><Input value={data.urea} onChange={v => set('urea', parseFloat(v) || 0)} type="number" step="0.1" placeholder="2.5-7.8" /></Field>
          <Field label="Glucose (mmol/L)"><Input value={data.glucose} onChange={v => set('glucose', parseFloat(v) || 0)} type="number" step="0.1" placeholder="4.0-6.0" /></Field>
          <Field label="HCO₃⁻ (mmol/L)"><Input value={data.bicarbonate} onChange={v => set('bicarbonate', parseFloat(v) || 0)} type="number" step="0.1" placeholder="22-28" /></Field>
        </Grid>
      </Section>
      <Section title="Arterial Blood Gas" desc="ABG / VBG on room air or specified FiO2">
        <Grid cols={3}>
          <Field label="pH"><Input value={data.ph} onChange={v => set('ph', parseFloat(v) || 7.4)} type="number" step="0.01" placeholder="7.35-7.45" /></Field>
          <Field label="Base Excess"><Input value={data.baseExcess} onChange={v => set('baseExcess', parseFloat(v) || 0)} type="number" step="0.1" placeholder="-2 to +2" /></Field>
          <Field label="Lactate (ABG)"><Input value={data.lactate} onChange={v => set('lactate', parseFloat(v) || 0)} type="number" step="0.1" /></Field>
        </Grid>
      </Section>
      <Section title="Other">
        <Grid>
          <Field label="Crossmatch"><Checkbox checked={data.crossmatch} onChange={v => set('crossmatch', v)} label="Crossmatch done (consider 2-4 units PRBC)" /></Field>
          <Field label="ECG / Rhythm"><Input value={data.ecg} onChange={v => set('ecg', v)} placeholder="e.g. NSR, AF, ischaemia" /></Field>
        </Grid>
      </Section>
      {/* Auto-interpretation */}
      {data.wbc > 0 && (
        <Section title="Lab Interpretation">
          <div className="space-y-1 text-sm">
            {data.wbc > 11 && <p className="text-amber-700">• WBC elevated ({data.wbc}) — suggests inflammation or infection</p>}
            {data.wbc > 15 && <p className="text-red-700">{'• WBC >15 — concern for ischaemia or significant sepsis'}</p>}
            {data.hemoglobin > 0 && data.hemoglobin < 10 && <p className="text-red-700">• Hb low ({data.hemoglobin}) — anaemia; suspect underlying malignancy or acute blood loss</p>}
            {data.lactate > 2 && data.lactate <= 4 && <p className="text-amber-700">• Lactate {data.lactate} — mild elevation; early ischaemia or hypoperfusion</p>}
            {data.lactate > 4 && <p className="text-red-700 font-bold">• 🚨 Lactate {data.lactate} — strongly suggests bowel ischaemia/gangrene; emergency laparotomy indicated</p>}
            {data.crp > 50 && data.crp <= 200 && <p className="text-amber-700">• CRP elevated ({data.crp}) — significant inflammation</p>}
            {data.crp > 200 && <p className="text-red-700">{'• CRP >200 — concern for complication (ischaemia, perforation, abscess)'}</p>}
            {data.creatinine > 110 && <p className="text-amber-700">• Creatinine elevated ({data.creatinine}) — AKI likely prerenal from dehydration/third-spacing</p>}
            {data.ph < 7.35 && <p className="text-red-700">• pH low ({data.ph}) — metabolic acidosis; correlates with ischaemia</p>}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Step 5: Imaging ────────────────────────────────────────────────────────

export function ImagingStep({ data, onChange }: {
  data: ImagingData; onChange: (d: ImagingData) => void;
}) {
  const set = <K extends keyof ImagingData>(k: K, v: ImagingData[K]) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <Section title="Abdominal X-Ray (AXR)" desc="Erect chest + supine abdomen — first-line imaging">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Signs</p>
            <Checkbox checked={data.axrCoffeeBeanSign} onChange={v => set('axrCoffeeBeanSign', v)} label="Coffee bean sign (sigmoid volvulus)" />
            <Checkbox checked={data.axrBentInnerTubeSign} onChange={v => set('axrBentInnerTubeSign', v)} label="Bent inner tube sign (caecal volvulus)" />
            <Checkbox checked={data.axrFreeAir} onChange={v => set('axrFreeAir', v)} label="Free air under diaphragm (perforation) 🚨" />
            <Checkbox checked={data.axrAirFluidLevels} onChange={v => set('axrAirFluidLevels', v)} label="Air-fluid levels" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Measurements</p>
            <Field label="Colonic dilation (cm)"><Input value={data.axrColonicDilationCm} onChange={v => set('axrColonicDilationCm', parseFloat(v) || 0)} type="number" step="0.1" /></Field>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">Haustral Pattern</p>
            <Select value={data.axrHaustraPattern} onChange={v => set('axrHaustraPattern', v as any)} options={[
              { value: 'haustra', label: 'Haustra present (normal colon)' },
              { value: 'valvulae', label: 'Valvulae conniventes (small bowel pattern)' },
              { value: 'absent', label: 'Absent / featureless (suggests pseudo-obstruction)' },
            ]} />
          </div>
        </div>
        {/* Auto interpretation */}
        {data.axrColonicDilationCm > 0 && (
          <div className="mt-2 text-xs">
            {data.axrCoffeeBeanSign && <p className="text-green-700">✅ Coffee bean sign — diagnostic of sigmoid volvulus</p>}
            {data.axrFreeAir && <p className="text-red-700 font-bold">🚨 Free air — perforation; emergency laparotomy indicated</p>}
            {data.axrColonicDilationCm > 10 && <p className="text-amber-700">{'⚠️ Colonic dilation >10 cm — risk of perforation'}</p>}
            {data.axrAirFluidLevels && <p className="text-gray-600">Air-fluid levels present — consistent with obstruction</p>}
          </div>
        )}
      </Section>
      <Section title="CT Abdomen & Pelvis (IV contrast)" desc="Gold standard — identifies level, cause, and complications">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1">
          <Checkbox checked={data.ctTransitionPoint} onChange={v => set('ctTransitionPoint', v)} label="Transition point" />
          <Checkbox checked={data.ctMesentericSwirl} onChange={v => set('ctMesentericSwirl', v)} label="Mesenteric swirl / whirl sign" />
          <Checkbox checked={data.ctBirdBeakSign} onChange={v => set('ctBirdBeakSign', v)} label="Bird beak sign" />
          <Checkbox checked={data.ctAppleCoreLesion} onChange={v => set('ctAppleCoreLesion', v)} label="Apple core lesion" />
          <Checkbox checked={data.ctColonicWallThickening} onChange={v => set('ctColonicWallThickening', v)} label="Colonic wall thickening" />
          <Checkbox checked={data.ctPneumatosis} onChange={v => set('ctPneumatosis', v)} label="Pneumatosis (bowel wall gas) 🚨" />
          <Checkbox checked={data.ctPortalVenousGas} onChange={v => set('ctPortalVenousGas', v)} label="Portal venous gas 🚨" />
          <Checkbox checked={data.ctFreeFluid} onChange={v => set('ctFreeFluid', v)} label="Free fluid (ascites)" />
          <Checkbox checked={data.ctFreeAir} onChange={v => set('ctFreeAir', v)} label="Free air (perforation) 🚨" />
          <Checkbox checked={data.ctTargetLesion} onChange={v => set('ctTargetLesion', v)} label="Target lesion (intussusception)" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 mt-3">
          <Field label="Transition Level">
            <Select value={data.ctTransitionLevel} onChange={v => set('ctTransitionLevel', v)} options={[
              { value: 'none', label: 'No transition point' }, { value: 'sigmoid', label: 'Sigmoid colon' },
              { value: 'rectosigmoid', label: 'Rectosigmoid' }, { value: 'descending', label: 'Descending colon' },
              { value: 'splenic_flexure', label: 'Splenic flexure' }, { value: 'transverse', label: 'Transverse colon' },
              { value: 'hepatic_flexure', label: 'Hepatic flexure' }, { value: 'ascending', label: 'Ascending colon' },
              { value: 'caecum', label: 'Caecum' },
            ]} />
          </Field>
          <Field label="Cecal dilation (cm)"><Input value={data.ctCecalDilationCm} onChange={v => set('ctCecalDilationCm', parseFloat(v) || 0)} type="number" step="0.1" /></Field>
        </div>
        {/* Auto interpretation */}
        {(data.ctMesentericSwirl || data.ctBirdBeakSign || data.ctAppleCoreLesion || data.ctPneumatosis) && (
          <div className="mt-2 text-xs">
            {data.ctMesentericSwirl && data.ctBirdBeakSign && <p className="text-green-700 font-bold">✅ Mesenteric swirl + bird beak = diagnostic of sigmoid volvulus</p>}
            {data.ctAppleCoreLesion && <p className="text-amber-700">⚠️ Apple core lesion — obstructing colorectal carcinoma</p>}
            {data.ctPneumatosis && <p className="text-red-700 font-bold">🚨 Pneumatosis intestinalis — transmural bowel ischaemia; emergency laparotomy</p>}
            {data.ctPortalVenousGas && <p className="text-red-700 font-bold">🚨 Portal venous gas — ominous sign; advanced ischaemia</p>}
            {data.ctFreeAir && <p className="text-red-700 font-bold">🚨 Free air — perforation</p>}
            {data.ctCecalDilationCm > 12 && <p className="text-amber-700">{'⚠️ Caecal dilation >12 cm — risk of caecal perforation'}</p>}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Step 10: Documentation ──────────────────────────────────────────────────

export function DocumentationStep({ registration, history, exam, investigations, imaging, engineOutput, postOp, clerkingPdf, operativeNotePdf, dischargePdf }: {
  registration: RegistrationData; history: HistoryData; exam: ExamData; investigations: InvestigationsData; imaging: ImagingData; engineOutput: LboApiOutput | null; postOp?: PostOpMonitoringData; clerkingPdf: string; operativeNotePdf?: string; dischargePdf?: string;
}) {
  const handleDownloadCasePresentation = () => {
    if (!engineOutput) return;
    const doc = generateCasePresentationPdf(registration, history, exam, investigations, imaging, engineOutput, postOp);
    downloadPdf(doc, `LBO-Case-${registration.patientName?.replace(/\s+/g, '-') || 'unknown'}-${registration.mrn || Date.now()}.pdf`);
  };

  const docs = [
    { title: 'Clerking Note / Admission Document', content: clerkingPdf },
    ...(operativeNotePdf ? [{ title: 'Operative Note', content: operativeNotePdf }] : []),
    ...(dischargePdf ? [{ title: 'Discharge Summary', content: dischargePdf }] : []),
  ];
  return (
    <div className="space-y-6">
      {engineOutput && (
        <div className="flex gap-3 mb-4">
          <button onClick={handleDownloadCasePresentation}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-semibold text-sm flex items-center gap-2 shadow-sm">
            📄 Download Complete Case Presentation (PDF)
          </button>
        </div>
      )}
      {docs.map((doc, i) => (
        <Section key={i} title={doc.title}>
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 font-mono">{doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf</span>
            </div>
            <pre className="p-6 text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-[800px] overflow-auto">
              {doc.content}
            </pre>
          </div>
        </Section>
      ))}
    </div>
  );
}
