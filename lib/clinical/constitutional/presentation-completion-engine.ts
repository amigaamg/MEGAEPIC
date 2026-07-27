// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK VI
// PRESENTATION COMPLETION ENGINE
// Determines when clinically sufficient data exists to unlock
// reasoning, differentials, investigations, and management.
// ═══════════════════════════════════════════════════════════════

import type { ClinicalPresentationObject, ClinicalSyndrome, EmergencyLevel } from './clinical-presentation-constitution';
import { CLINICAL_PRESENTATIONS } from './clinical-presentation-constitution';

export interface CompletionField {
  fieldId: string;
  captured: boolean;
  required: boolean;
}

export interface CompletionCheckInput {
  presentationIds: string[];
  capturedFields: Set<string>;
  syndrome: ClinicalSyndrome | null;
  emergencyLevel: EmergencyLevel;
  ageGroup: string;
  sex: string;
  pregnancyStatus: string;
}

export interface CompletionGate {
  gateId: string;
  label: string;
  passed: boolean;
  requiredFields: string[];
  missingFields: string[];
  score: number;
}

export interface CompletionResult {
  canReason: boolean;
  canDifferential: boolean;
  canInvestigate: boolean;
  canManage: boolean;
  canDisposition: boolean;
  gates: CompletionGate[];
  missingCriticalFields: string[];
  completenessScore: number;
  recommendation: string;
}

const PRESENTATION_TO_MINIMUM: Record<string, string[]> = {
  fever: ['fever_duration', 'fever_pattern', 'temperature'],
  cough: ['cough_duration', 'cough_character', 'oxygen_saturation'],
  abdominal_pain: ['pain_location', 'pain_character', 'pain_severity', 'abdominal_exam_findings'],
  headache: ['headache_onset', 'headache_severity', 'headache_character', 'blood_pressure'],
  chest_pain: ['chest_pain_onset', 'chest_pain_character', 'ecg', 'troponin'],
  difficulty_breathing: ['dyspnea_onset', 'oxygen_saturation', 'respiratory_rate', 'chest_auscultation'],
  vomiting: ['vomiting_timing', 'vomiting_frequency', 'hydration_status'],
  diarrhea: ['diarrhea_duration', 'diarrhea_stool_type', 'hydration_status'],
  seizure: ['seizure_type', 'seizure_duration', 'blood_glucose', 'gcs'],
  bleeding: ['bleeding_source', 'bleeding_volume', 'blood_pressure', 'heart_rate'],
};

const SYNDROME_TO_MINIMUM: Record<ClinicalSyndrome, string[]> = {
  respiratory_syndrome: ['cough_duration', 'cough_character', 'oxygen_saturation', 'respiratory_rate', 'chest_auscultation'],
  cardiovascular_syndrome: ['chest_pain_onset', 'chest_pain_character', 'ecg', 'troponin', 'blood_pressure'],
  acute_abdomen: ['pain_location', 'pain_character', 'pain_severity', 'abdominal_exam_findings', 'vomiting_timing'],
  neurological_syndrome: ['headache_onset', 'headache_character', 'neurological_exam_findings', 'gcs'],
  hemorrhagic_shock: ['bleeding_source', 'bleeding_volume', 'blood_pressure', 'heart_rate', 'hemoglobin'],
  sepsis_syndrome: ['fever_duration', 'temperature', 'heart_rate', 'blood_pressure', 'respiratory_rate'],
  obstructive_airway: ['dyspnea_onset', 'oxygen_saturation', 'respiratory_rate', 'stridor_present'],
  head_trauma: ['trauma_mechanism', 'gcs', 'neurological_exam_findings'],
  obstetric_emergency: ['bleeding_volume', 'gestational_age', 'fetal_heart_rate', 'blood_pressure'],
  neonatal_sepsis: ['fever', 'poor_feeding', 'irritability', 'respiratory_rate', 'oxygen_saturation'],
  anaphylaxis: ['airway_compromised', 'breathing_distress', 'blood_pressure', 'rash'],
  toxic_ingestion: ['ingestion_substance', 'ingestion_time', 'gcs', 'vomiting'],
};

export function checkCompletion(input: CompletionCheckInput): CompletionResult {
  const missingCritical: string[] = [];
  const gates: CompletionGate[] = [];

  let allMinimumFields: string[] = [];

  for (const pid of input.presentationIds) {
    const pMin = PRESENTATION_TO_MINIMUM[pid];
    if (pMin) allMinimumFields.push(...pMin);
  }

  if (input.syndrome && SYNDROME_TO_MINIMUM[input.syndrome]) {
    allMinimumFields.push(...SYNDROME_TO_MINIMUM[input.syndrome]);
  }

  if (input.emergencyLevel === 'red') {
    const emergencyFields = ['airway_compromised', 'breathing_distress', 'circulation_compromised', 'blood_pressure', 'heart_rate', 'oxygen_saturation', 'gcs'];
    allMinimumFields.push(...emergencyFields);
  }

  allMinimumFields = [...new Set(allMinimumFields)];

  const capturedSet = input.capturedFields;

  const missingFields = allMinimumFields.filter(f => !capturedSet.has(f));

  const historyGate: CompletionGate = {
    gateId: 'history_complete',
    label: 'History Sufficiency',
    passed: missingFields.filter(f => !f.includes('exam') && !f.includes('ecg') && !f.includes('troponin')).length === 0,
    requiredFields: allMinimumFields.filter(f => !f.includes('exam') && !f.includes('ecg') && !f.includes('troponin')),
    missingFields: missingFields.filter(f => !f.includes('exam') && !f.includes('ecg') && !f.includes('troponin')),
    score: 1 - (missingFields.filter(f => !f.includes('exam') && !f.includes('ecg') && !f.includes('troponin')).length / Math.max(1, allMinimumFields.filter(f => !f.includes('exam') && !f.includes('ecg') && !f.includes('troponin')).length)),
  };

  const examGate: CompletionGate = {
    gateId: 'exam_sufficient',
    label: 'Examination Sufficiency',
    passed: missingFields.filter(f => f.includes('exam') || f.includes('ecg')).length === 0,
    requiredFields: allMinimumFields.filter(f => f.includes('exam') || f.includes('ecg')),
    missingFields: missingFields.filter(f => f.includes('exam') || f.includes('ecg')),
    score: 1 - (missingFields.filter(f => f.includes('exam') || f.includes('ecg')).length / Math.max(1, allMinimumFields.filter(f => f.includes('exam') || f.includes('ecg')).length)),
  };

  const safetyGate: CompletionGate = {
    gateId: 'safety_clear',
    label: 'Red Flag Clearance',
    passed: !input.emergencyLevel || input.emergencyLevel === 'green' || missingFields.filter(f => ['airway_compromised', 'breathing_distress', 'circulation_compromised'].includes(f)).length === 0,
    requiredFields: input.emergencyLevel === 'red' || input.emergencyLevel === 'orange' ? ['airway_compromised', 'breathing_distress', 'circulation_compromised'] : [],
    missingFields: [],
    score: input.emergencyLevel === 'red' || input.emergencyLevel === 'orange' ? 0.5 : 1.0,
  };

  gates.push(historyGate, examGate, safetyGate);

  const totalScore = gates.reduce((sum, g) => sum + g.score, 0) / gates.length;

  const canReason = historyGate.passed;
  const canDifferential = historyGate.passed && examGate.passed;
  const canInvestigate = historyGate.passed && examGate.passed;
  const canManage = canDifferential;
  const canDisposition = canDifferential && safetyGate.passed;

  for (const f of missingFields) {
    if (isRedFlagField(f)) missingCritical.push(f);
  }

  let recommendation: string;
  if (input.emergencyLevel === 'red' && !safetyGate.passed) {
    recommendation = 'EMERGENCY: Complete ABCDE assessment before any further history or reasoning.';
  } else if (!historyGate.passed) {
    recommendation = `Collect history: missing ${historyGate.missingFields.join(', ')}.`;
  } else if (!examGate.passed) {
    recommendation = 'History sufficient. Complete examination to unlock differentials.';
  } else if (totalScore > 0.8) {
    recommendation = 'Clinically sufficient. Reasoning, differentials, and management may proceed.';
  } else {
    recommendation = `Sufficient for reasoning. Missing non-critical: ${missingFields.join(', ')}.`;
  }

  return {
    canReason,
    canDifferential,
    canInvestigate,
    canManage,
    canDisposition,
    gates,
    missingCriticalFields: missingCritical,
    completenessScore: Math.round(totalScore * 100) / 100,
    recommendation,
  };
}

function isRedFlagField(field: string): boolean {
  const redFlags = ['airway_compromised', 'breathing_distress', 'circulation_compromised',
    'gcs', 'oxygen_saturation', 'blood_pressure', 'heart_rate', 'ecg'];
  return redFlags.includes(field);
}

export function getRequiredFieldsForPresentation(id: string): string[] {
  return PRESENTATION_TO_MINIMUM[id] || [];
}

export function getRequiredFieldsForSyndrome(syndrome: ClinicalSyndrome): string[] {
  return SYNDROME_TO_MINIMUM[syndrome] || [];
}

export function getCompletenessStatus(
  presentationIds: string[],
  capturedFields: Set<string>,
  syndrome: ClinicalSyndrome | null,
): { completeness: number; missing: string[]; ready: boolean } {
  let allFields: string[] = [];
  for (const pid of presentationIds) {
    const f = PRESENTATION_TO_MINIMUM[pid];
    if (f) allFields.push(...f);
  }
  if (syndrome) {
    const sf = SYNDROME_TO_MINIMUM[syndrome];
    if (sf) allFields.push(...sf);
  }
  allFields = [...new Set(allFields)];
  if (allFields.length === 0) return { completeness: 1, missing: [], ready: true };

  const missing = allFields.filter(f => !capturedFields.has(f));
  const completeness = 1 - (missing.length / allFields.length);
  const READY_THRESHOLD = 0.6;

  return {
    completeness: Math.round(completeness * 100) / 100,
    missing,
    ready: completeness >= READY_THRESHOLD,
  };
}
