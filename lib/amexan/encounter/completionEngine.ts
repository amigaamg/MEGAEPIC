// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Completion Engine — single authority for "is it done yet?"
// ═══════════════════════════════════════════════════════════════════════════════
// This is the ONLY place that decides:
//   - Is a symptom adequately explored?
//   - Is the history complete?
//   - Can we advance workflow?
// No other engine, no component, no reducer decides these.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId, WorkflowStep, EncounterPhase } from './encounterState';
import { SYMPTOM_SCHEMAS, getUnansweredFields } from './symptomSchemas';
import { getExamCompleteness as getExamSystemCompleteness } from './engines/examinationEngine';
import { ENCOUNTER_PHASES } from './encounterPhases';

// ── Domain definitions — what "completeness" means for each clinical domain ───

export interface DomainRequirement {
  id: string;
  label: string;
  required: boolean;
  check: (state: EncounterState) => { complete: boolean; missing: string[] };
}

// ── Symptom completeness — checks all active symptoms for missing mandatory fields

function getSymptomCompleteness(state: EncounterState) {
  const missing: string[] = [];
  let complete = true;

  const activeSymptomIds = Object.keys(state.symptoms) as SymptomId[];

  for (const symptomId of activeSymptomIds) {
    const symptom = state.symptoms[symptomId];
    if (!symptom || !symptom.present) continue;

    const answeredFields = new Set(Object.keys(symptom).filter(k => k !== 'id' && k !== 'present'));
    const unanswered = getUnansweredFields(symptomId, answeredFields);

    for (const field of unanswered) {
      if (field.mandatory) {
        missing.push(`${symptomId}.${field.id}: ${field.shortLabel}`);
        complete = false;
      }
    }
  }

  return { complete, missing };
}

// ── ROS adequacy — given active symptoms, which ROS systems are mandatory?

function getRosAdequacy(state: EncounterState) {
  const missing: string[] = [];
  const activatedSystems = new Set<string>();

  // Collect ROS systems activated by active symptoms
  for (const symptomId of Object.keys(state.symptoms) as SymptomId[]) {
    const schema = SYMPTOM_SCHEMAS[symptomId];
    if (schema) {
      for (const sys of schema.activatesRosSystems) {
        activatedSystems.add(sys);
      }
    }
  }

  // Always include general
  activatedSystems.add('general');

  // Check each activated system has at least some data
  for (const sys of Array.from(activatedSystems)) {
    const rosSection = (state.history.ros as any)[sys];
    if (!rosSection) {
      missing.push(`ROS: ${sys} not explored`);
      continue;
    }
    const filledFields = Object.values(rosSection).filter(v => v !== false && v !== '').length;
    if (filledFields === 0) {
      missing.push(`ROS: ${sys} not explored`);
    }
  }

  return { complete: missing.length === 0, missing };
}

// ── History domain completeness

function getPMHCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const pmh = state.history.pmh;
  if (pmh.conditions.length === 0) missing.push('PMH: no chronic conditions documented');
  const meds = state.history.medications;
  if (meds.current.length === 0) missing.push('PMH: no medications documented');
  if (meds.allergies.length === 0) missing.push('PMH: no allergies documented');
  return { complete: missing.length === 0, missing };
}

function getSocialCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const s = state.history.social;
  if (!s.housingConditions) missing.push('Social: housing conditions');
  if (!s.occupation && state.demographics.ageYears > 15) missing.push('Social: occupation');
  if (s.smoking === 'never' && state.demographics.ageYears > 12) missing.push('Social: smoking status');
  return { complete: missing.length <= 1, missing };
}

// ── Danger sign check — must always be assessed

function getDangerSignCheck(state: EncounterState) {
  const missing: string[] = [];
  const dangerSymptoms: SymptomId[] = ['chest_pain', 'dyspnea', 'syncope', 'seizure', 'cyanosis', 'stridor', 'gi_bleeding', 'lethargy'];

  for (const sid of dangerSymptoms) {
    const symptom = state.symptoms[sid];
    if (symptom && symptom.present) {
      if (sid === 'chest_pain' && !(symptom as any).exertional) missing.push('Chest pain: exertional status unknown');
      if (sid === 'gi_bleeding' && !(symptom as any).syncope) missing.push('GI bleed: syncope status unknown');
    }
  }

  return { complete: missing.length === 0, missing };
}

// ── Examination completeness — checks if active systems have been examined

function getExamDomainCompleteness(state: EncounterState) {
  const result = getExamSystemCompleteness(state);
  const missing: string[] = [];
  for (const sys of result.notExamined) {
    missing.push(`Examination: ${sys} not examined`);
  }
  for (const sys of result.partiallyExamined) {
    missing.push(`Examination: ${sys} partially examined`);
  }
  return { complete: result.complete, missing };
}

// ── New phase-level domain checkers ────────────────────────────────────────────

function getBiodataCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const d = state.demographics;
  if (!d.name) missing.push('Biodata: patient name');
  if (!d.ageYears && !d.ageMonths) missing.push('Biodata: age');
  if (d.sex === 'other' && !d.mrn) missing.push('Biodata: sex/identifier');
  if (!d.informant) missing.push('Biodata: informant');
  if (!d.historyReliability || d.historyReliability === 'unknown') missing.push('Biodata: history reliability');
  return { complete: missing.length === 0, missing };
}

function getPshCompleteness(state: EncounterState) {
  const missing: string[] = [];
  return { complete: true, missing };
}

function getDrugHistoryCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const meds = state.history.medications;
  if (meds.current.length === 0) missing.push('Drug history: no medications documented');
  return { complete: missing.length <= 1, missing };
}

function getAllergyHistoryCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const meds = state.history.medications;
  if (meds.allergies.length === 0) missing.push('Allergy history: no allergies documented');
  return { complete: missing.length <= 1, missing };
}

function getFamilyHistoryCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const fh = state.history.family;
  if (!fh.tb && !fh.asthma && !fh.diabetes && !fh.hypertension && !fh.sickleCell && fh.cancer.length === 0 && fh.geneticDiseases.length === 0) {
    missing.push('Family history: no data documented');
  }
  return { complete: missing.length === 0, missing };
}

function getClinicalSummaryCompleteness(state: EncounterState) {
  const evidenceDomains = ['symptoms', 'ros', 'danger_signs', 'examination', 'pmh', 'social', 'psh', 'drug_history', 'allergy_history', 'family_history', 'biodata'];
  const allEvidenceComplete = evidenceDomains.every(d => state.completion.domainsComplete[d]);
  const missing: string[] = [];
  if (!allEvidenceComplete) missing.push('Clinical summary: evidence collection not yet complete');
  return { complete: missing.length === 0, missing: missing.length > 0 ? missing : [] };
}

function getProvisionalDiagnosisCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (state.assessment.differentials.length === 0) missing.push('Provisional diagnosis: no working diagnosis stated');
  return { complete: missing.length === 0, missing };
}

function getDifferentialDiagnosesCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (state.assessment.differentials.length < 2) missing.push('Differential diagnoses: at least 2 differentials expected');
  return { complete: missing.length === 0, missing };
}

function getProblemListCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (state.assessment.differentials.length === 0) missing.push('Problem list: no active problems documented');
  return { complete: missing.length === 0, missing };
}

function getResultsReviewCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const pendingLabs = state.investigations.labs.filter(l => l.status === 'ordered' || l.status === 'pending');
  if (pendingLabs.length > 0) missing.push(`Results review: ${pendingLabs.length} investigation(s) still pending`);
  return { complete: missing.length === 0, missing };
}

function getFinalDiagnosisCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (!state.assessment.finalDiagnosis) missing.push('Final diagnosis: not yet established');
  return { complete: missing.length === 0, missing };
}

function getManagementCompleteness(state: EncounterState) {
  const missing: string[] = [];
  const plan = state.plan;
  if (plan.treatments.length === 0 && plan.medications.length === 0) missing.push('Management: no treatments or medications ordered');
  return { complete: missing.length <= 1, missing };
}

function getDispositionCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (!state.plan.admissionDecision) missing.push('Disposition: admission decision not documented');
  if (!state.plan.followUp && state.plan.admissionDecision === 'discharge') missing.push('Disposition: follow-up plan missing');
  return { complete: missing.length === 0, missing };
}

function getDocumentationCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (!state.assessment.finalDiagnosis) missing.push('Documentation: final diagnosis must be established first');
  return { complete: missing.length === 0, missing };
}

function getSignOffCompleteness(state: EncounterState) {
  const missing: string[] = [];
  if (!state.assessment.finalDiagnosis) missing.push('Sign-off: final diagnosis must be established');
  if (!state.plan.admissionDecision) missing.push('Sign-off: disposition must be decided');
  return { complete: missing.length === 0, missing };
}

// ── The domain registry — add new domains here, not scattered across files

const DOMAIN_REQUIREMENTS: DomainRequirement[] = [
  // Evidence collection domains
  { id: 'biodata', label: 'Biodata & demographics', required: true, check: getBiodataCompleteness },
  { id: 'symptoms', label: 'Symptom exploration', required: true, check: getSymptomCompleteness },
  { id: 'ros', label: 'Review of systems', required: true, check: getRosAdequacy },
  { id: 'danger_signs', label: 'Danger sign assessment', required: true, check: getDangerSignCheck },
  { id: 'examination', label: 'Physical examination', required: false, check: getExamDomainCompleteness },
  { id: 'pmh', label: 'Past medical history', required: false, check: getPMHCompleteness },
  { id: 'psh', label: 'Past surgical history', required: false, check: getPshCompleteness },
  { id: 'drug_history', label: 'Drug history', required: false, check: getDrugHistoryCompleteness },
  { id: 'allergy_history', label: 'Allergy history', required: false, check: getAllergyHistoryCompleteness },
  { id: 'family_history', label: 'Family history', required: false, check: getFamilyHistoryCompleteness },
  { id: 'social', label: 'Social history', required: false, check: getSocialCompleteness },

  // Clinical summary (watershed)
  { id: 'clinical_summary', label: 'Clinical summary', required: false, check: getClinicalSummaryCompleteness },

  // Clinical synthesis domains
  { id: 'provisional_diagnosis', label: 'Provisional diagnosis', required: false, check: getProvisionalDiagnosisCompleteness },
  { id: 'differential_diagnoses', label: 'Differential diagnoses', required: false, check: getDifferentialDiagnosesCompleteness },
  { id: 'problem_list', label: 'Problem list', required: false, check: getProblemListCompleteness },
  { id: 'results_review', label: 'Results review', required: false, check: getResultsReviewCompleteness },
  { id: 'final_diagnosis', label: 'Final diagnosis', required: false, check: getFinalDiagnosisCompleteness },
  { id: 'management', label: 'Management plan', required: false, check: getManagementCompleteness },
  { id: 'disposition', label: 'Disposition', required: false, check: getDispositionCompleteness },
  { id: 'documentation', label: 'Documentation', required: false, check: getDocumentationCompleteness },
  { id: 'sign_off', label: 'Sign-off', required: false, check: getSignOffCompleteness },
];

// ── Main completion check ─────────────────────────────────────────────────────

export interface CompletionResult {
  canAdvance: boolean;
  completenessScore: number;
  domains: Record<string, boolean>;
  missingItems: string[];
  suggestedNextStep: WorkflowStep | null;
  suggestedNextDomain: string | null;
  suggestedNextPhase: EncounterPhase | null;
}

export function evaluateCompleteness(state: EncounterState): CompletionResult {
  const domains: Record<string, boolean> = {};
  const missingItems: string[] = [];
  let completedCount = 0;

  for (const req of DOMAIN_REQUIREMENTS) {
    const result = req.check(state);
    domains[req.id] = result.complete;
    if (result.complete) completedCount++;
    else {
      missingItems.push(...result.missing);
    }
  }

  const totalRequired = DOMAIN_REQUIREMENTS.filter(r => r.required).length;
  const requiredComplete = DOMAIN_REQUIREMENTS.filter(r => r.required && domains[r.id]).length;

  const completenessScore = completedCount / DOMAIN_REQUIREMENTS.length;
  const requiredCompleteRatio = totalRequired > 0 ? requiredComplete / totalRequired : 0;

  const canAdvance = requiredCompleteRatio >= 1.0;

  // Determine next step and phase
  let suggestedNextStep: WorkflowStep | null = null;
  let suggestedNextDomain: string | null = null;
  let suggestedNextPhase: EncounterPhase | null = null;

  if (canAdvance) {
    const stepOrder: WorkflowStep[] = ['intake', 'chief_complaint', 'history', 'examination', 'investigations', 'assessment', 'plan', 'complete'];
    const currentIdx = stepOrder.indexOf(state.workflow.currentStep);
    for (let i = currentIdx + 1; i < stepOrder.length; i++) {
      if (!state.workflow.completedSteps.includes(stepOrder[i])) {
        suggestedNextStep = stepOrder[i];
        break;
      }
    }
    // Suggest next phase based on phase order
    const phaseOrder: EncounterPhase[] = ['biodata', 'chief_complaints', 'hpi', 'pmh', 'psh', 'drug_history', 'allergy_history', 'family_history', 'social_history', 'ros', 'physical_examination', 'clinical_summary', 'provisional_diagnosis', 'differential_diagnoses', 'problem_list', 'investigations', 'results_review', 'final_diagnosis', 'management', 'disposition', 'documentation', 'sign_off', 'closed'];
    const currentPhaseIdx = phaseOrder.indexOf(state.workflow.currentPhase);
    for (let i = currentPhaseIdx + 1; i < phaseOrder.length; i++) {
      if (!state.workflow.completedPhases.includes(phaseOrder[i])) {
        suggestedNextPhase = phaseOrder[i];
        break;
      }
    }
  } else {
    // Find first incomplete domain for focused questioning
    for (const req of DOMAIN_REQUIREMENTS) {
      if (!domains[req.id]) {
        suggestedNextDomain = req.id;
        break;
      }
    }
  }

  return {
    canAdvance,
    completenessScore,
    domains,
    missingItems,
    suggestedNextStep,
    suggestedNextDomain,
    suggestedNextPhase,
  };
}

// ── Workflow gate — can we enter a given step? ────────────────────────────────

export function canEnterStep(state: EncounterState, step: WorkflowStep): boolean {
  const stepOrder: WorkflowStep[] = ['intake', 'chief_complaint', 'history', 'examination', 'investigations', 'assessment', 'plan', 'complete'];
  const currentIdx = stepOrder.indexOf(state.workflow.currentStep);
  const targetIdx = stepOrder.indexOf(step);

  if (targetIdx <= currentIdx) return true;
  if (targetIdx === currentIdx + 1) {
    return true;
  }
  return false;
}

export function canEnterPhase(state: EncounterState, phase: EncounterPhase): boolean {
  const phaseOrder: EncounterPhase[] = ['biodata', 'chief_complaints', 'hpi', 'pmh', 'psh', 'drug_history', 'allergy_history', 'family_history', 'social_history', 'ros', 'physical_examination', 'clinical_summary', 'provisional_diagnosis', 'differential_diagnoses', 'problem_list', 'investigations', 'results_review', 'final_diagnosis', 'management', 'disposition', 'documentation', 'sign_off', 'closed'];
  const currentIdx = phaseOrder.indexOf(state.workflow.currentPhase);
  const targetIdx = phaseOrder.indexOf(phase);

  if (targetIdx <= currentIdx) return true;
  if (targetIdx === currentIdx + 1) {
    return true;
  }
  return false;
}

// ── Question exhaustion — has the system run out of useful questions? ─────────

export function questionsExhausted(state: EncounterState): boolean {
  // Check if all active symptoms have all mandatory fields answered
  for (const symptomId of Object.keys(state.symptoms) as SymptomId[]) {
    const symptom = state.symptoms[symptomId];
    if (!symptom || !symptom.present) continue;
    const answeredFields = new Set(Object.keys(symptom).filter(k => k !== 'id' && k !== 'present'));
    const unanswered = getUnansweredFields(symptomId, answeredFields);
    const mandatoryUnanswered = unanswered.filter(f => f.mandatory);
    if (mandatoryUnanswered.length > 0) return false;
  }

  // Check ROS completeness for activated systems
  const ros = evaluateCompleteness(state);
  return ros.domains.ros && ros.domains.symptoms;
}
