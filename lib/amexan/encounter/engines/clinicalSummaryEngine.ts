// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Summary Engine — the constitutional watershed
// ═══════════════════════════════════════════════════════════════════════════════
// Everything BEFORE this is evidence collection.
// Everything AFTER this is clinical synthesis.
//
// This engine generates the single paragraph that every consultant expects
// on ward rounds: age, sex, risk factors, presenting complaints, important
// positives/negatives, examination findings, severity.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, ClinicalSummaryState } from '../encounterState';
import type { ClinicalFinding } from '../examination/examinationTypes';
import { generateGeneralExaminationSummary } from './generalExaminationEngine';
import { interpretAllVitals } from './vitalsEngine';

// ── Clinical Summary — single paragraph ───────────────────────────────────────

export interface ClinicalSummaryInput {
  ageYears: number;
  ageMonths: number;
  sex: string;
  chiefComplaint: string;
  chiefComplaintDuration: string;
  activeSymptoms: string[];
  pmhSummary: string;
  pshSummary: string;
  drugSummary: string;
  socialSummary: string;
  rosPositives: string[];
  rosNegatives: string[];
  examinationSummary: string;
  vitalSignsSummary: string;
  severity: 'stable' | 'moderate' | 'severe' | 'critical';
}

export function buildClinicalSummaryInput(state: EncounterState): ClinicalSummaryInput {
  const demographics = state.demographics;
  const cc = state.chiefComplaint;
  const history = state.history;
  const exam = state.examination;

  // Active symptoms
  const activeSymptoms: string[] = [];
  for (const symptomId of Object.keys(state.symptoms)) {
    const symptom = state.symptoms[symptomId as any];
    if (symptom && symptom.present) {
      activeSymptoms.push((symptom as any).id || symptomId);
    }
  }

  // PMH summary
  const pmhItems: string[] = [];
  const pmh = history.pmh;
  if (pmh.diabetes) pmhItems.push('diabetes');
  if (pmh.hypertension) pmhItems.push('hypertension');
  if (pmh.asthma) pmhItems.push('asthma');
  if (pmh.hiv === 'positive') pmhItems.push('HIV positive');
  if (pmh.tb === 'treated' || pmh.tb === 'current') pmhItems.push(`TB (${pmh.tb})`);
  if (pmh.sickleCell) pmhItems.push('sickle cell disease');
  if (pmh.cardiacDisease) pmhItems.push('cardiac disease');
  if (pmh.conditions.length > 0) pmhItems.push(...pmh.conditions);

  // Social summary
  const socialItems: string[] = [];
  const soc = history.social;
  if (soc.smoking === 'current') socialItems.push('smoker');
  if (soc.smoking === 'former') socialItems.push('ex-smoker');
  if (soc.alcohol) socialItems.push(`alcohol: ${soc.alcohol}`);

  // ROS positives and negatives
  const rosPositives: string[] = [];
  const rosNegatives: string[] = [];
  const rosMap: Record<string, Record<string, string>> = {
    general: { fever: 'fever', weightLoss: 'weight loss', nightSweats: 'night sweats', fatigue: 'fatigue' },
    respiratory: { cough: 'cough', dyspnea: 'dyspnoea', wheeze: 'wheeze', hemoptysis: 'haemoptysis' },
    cardiovascular: { chestPain: 'chest pain', palpitations: 'palpitations', orthopnea: 'orthopnoea', edema: 'oedema' },
    gastrointestinal: { nausea: 'nausea', vomiting: 'vomiting', diarrhea: 'diarrhoea', constipation: 'constipation', dysphagia: 'dysphagia', bleeding: 'GI bleeding', jaundice: 'jaundice' },
    neurological: { headache: 'headache', dizziness: 'dizziness', seizures: 'seizures', numbness: 'numbness', visionChanges: 'vision changes' },
  };

  for (const [system, fields] of Object.entries(rosMap)) {
    const rosSystem = (history.ros as any)[system];
    if (!rosSystem) continue;
    for (const [key, label] of Object.entries(fields)) {
      if (rosSystem[key] === true) rosPositives.push(label);
      else if (rosSystem[key] === false) rosNegatives.push(label);
    }
  }

  const examSummary = generateGeneralExaminationSummary(state.examination.generalExamination);
  const vitals = exam.vitals;
  const vsSummary = vitals.temp
    ? `T ${vitals.temp}°C, HR ${vitals.hr}/min, RR ${vitals.rr}/min, BP ${vitals.bpSystolic}/${vitals.bpDiastolic}`
    : 'Vitals not yet recorded';

  // Severity assessment
  let severity: 'stable' | 'moderate' | 'severe' | 'critical' = 'stable';
  const redFlags = state.assessment.severity.redFlags;
  if (redFlags.length > 2) severity = 'critical';
  else if (redFlags.length > 0) severity = 'severe';
  else if (state.assessment.severity.level === 'severe' || state.assessment.severity.level === 'critical') severity = 'severe';
  else if (state.assessment.severity.level === 'moderate') severity = 'moderate';

  return {
    ageYears: demographics.ageYears,
    ageMonths: demographics.ageMonths,
    sex: demographics.sex,
    chiefComplaint: cc.text,
    chiefComplaintDuration: cc.duration,
    activeSymptoms,
    pmhSummary: pmhItems.length > 0 ? pmhItems.join(', ') : 'no significant past medical history',
    pshSummary: pmh.surgeries.length > 0 ? pmh.surgeries.join(', ') : 'no previous surgeries',
    drugSummary: history.medications.current.length > 0
      ? history.medications.current.map(m => `${m.name} ${m.dose} ${m.frequency}`).join(', ')
      : 'no regular medications',
    socialSummary: socialItems.length > 0 ? socialItems.join(', ') : 'social history unremarkable',
    rosPositives,
    rosNegatives,
    examinationSummary: examSummary,
    vitalSignsSummary: vsSummary,
    severity,
  };
}

export function generateClinicalSummary(input: ClinicalSummaryInput): string {
  const parts: string[] = [];

  // Age and sex
  const ageStr = input.ageYears > 0
    ? `${input.ageYears}-year-old`
    : `${input.ageMonths}-month-old`;
  parts.push(`${ageStr} ${input.sex}`);

  // Chief complaint
  parts.push(`presented with ${input.chiefComplaint}`);
  if (input.chiefComplaintDuration) {
    parts[parts.length - 1] += ` of ${input.chiefComplaintDuration} duration`;
  }

  // Active symptoms
  if (input.activeSymptoms.length > 0) {
    parts.push(`associated with ${input.activeSymptoms.join(', ')}`);
  }

  // Past medical history
  parts.push(`Past medical history: ${input.pmhSummary}.`);

  // Social
  if (input.socialSummary) {
    parts.push(`${input.socialSummary}.`);
  }

  // ROS positives
  if (input.rosPositives.length > 0) {
    parts.push(`Positive review of systems: ${input.rosPositives.join(', ')}.`);
  }

  // ROS negatives
  if (input.rosNegatives.length > 0) {
    parts.push(`Negative review of systems: ${input.rosNegatives.join(', ')}.`);
  }

  // Examination
  parts.push(`Examination: ${input.examinationSummary}`);

  // Vitals
  parts.push(`Vitals: ${input.vitalSignsSummary}.`);

  // Severity
  const severityLabel = input.severity.charAt(0).toUpperCase() + input.severity.slice(1);
  parts.push(`Clinical severity: ${severityLabel}.`);

  return parts.join(' ');
}

// ── Editable clinical summary state ────────────────────────────────────────────

export function createClinicalSummaryState(): ClinicalSummaryState {
  return {
    generated: '',
    edited: '',
    isEdited: false,
    finalized: false,
  };
}

export function finalizeClinicalSummary(state: ClinicalSummaryState): ClinicalSummaryState {
  return {
    ...state,
    finalized: true,
  };
}

export function editClinicalSummary(state: ClinicalSummaryState, editedText: string): ClinicalSummaryState {
  return {
    ...state,
    edited: editedText,
    isEdited: editedText !== state.generated,
  };
}
