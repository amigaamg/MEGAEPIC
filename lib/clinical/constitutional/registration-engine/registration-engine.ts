import type { Answer, RegistrationStage, GateStatus } from './types';
import { REGISTRATION_FIELDS, INFORMANT_RULES } from './field-registry';

import {
  resolveAgeGroup, resolveReproductiveStage,
  buildClinicalContext, resolveVisibilityRules,
} from './context-resolver';

export interface RegistrationState {
  stage: RegistrationStage;
  completedStages: RegistrationStage[];
  data: Record<string, Answer>;
  stageStatuses: Record<string, GateStatus>;
  validationErrors: Record<string, string[]>;
  activeFields: string[];
  contextSummary: string[];
}

const STAGE_ORDER: RegistrationStage[] = [
  'identity',
  'patient_context',
  'encounter_context',
  'clinical_context',
  'administrative_context',
  'registration_complete',
];

function calculateAgeFromDOB(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function getNextHospitalNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return `HN-${year}-${seq}`;
}

function createAnswer<T>(
  value: T | null,
  state: 'captured' | 'unknown' | 'unable' | 'declined' | 'not_applicable' = 'captured',
  source: 'patient' | 'guardian' | 'record' | 'clinician' | 'system' | 'ai' | 'calculated' = 'patient'
): Answer<T> {
  return {
    value,
    state,
    source,
    confidence: value !== null ? 1.0 : 0,
    timestamp: Date.now(),
    author: 'system',
  };
}

function isStageComplete(
  stage: RegistrationStage,
  data: Record<string, Answer>
): boolean {
  const stageFields = Object.entries(REGISTRATION_FIELDS)
    .filter(([, def]) => def.stage === stage);

  for (const [fieldId, def] of stageFields) {
    if (def.required.length === 0) continue;
    const answer = data[fieldId];
    if (!answer || answer.value === null || answer.value === undefined || answer.value === '') {
      return false;
    }
  }
  return true;
}

function getActiveFieldsForStage(
  stage: RegistrationStage,
  data: Record<string, Answer>,
  ageGroup: string,
  sex: string,
  ageMonths: number,
): string[] {
  const activeFields: string[] = [];
  for (const [fieldId, def] of Object.entries(REGISTRATION_FIELDS)) {
    if (def.stage !== stage) continue;
    let visible = true;
    for (const rule of def.visibility) {
      visible = evaluateRule(rule, data, ageGroup, sex, ageMonths);
      if (!visible) break;
    }
    if (!visible) continue;
    for (const rule of def.hideWhen) {
      if (evaluateRule(rule, data, ageGroup, sex, ageMonths)) {
        visible = false;
        break;
      }
    }
    if (visible) activeFields.push(fieldId);
  }
  return activeFields;
}

function evaluateRule(
  rule: any,
  data: Record<string, Answer>,
  ageGroup: string,
  sex: string,
  ageMonths: number,
): boolean {
  switch (rule.type) {
    case 'always': return true;
    case 'never': return false;
    case 'sex': return rule.values.includes(sex);
    case 'age_group': return rule.values.includes(ageGroup);
    case 'age_min_months': return ageMonths >= rule.months;
    case 'age_max_months': return ageMonths <= rule.months;
    case 'field_equals': {
      const answer = data[rule.field];
      return answer?.value === rule.value;
    }
    case 'field_not_empty': {
      const answer = data[rule.field];
      return answer?.value !== null && answer?.value !== undefined && answer?.value !== '';
    }
    case 'module_active': return false;
    case 'module_inactive': return true;
    default: return true;
  }
}

function computeContextSummary(
  data: Record<string, Answer>,
  ageGroup: string,
  sex: string,
  ageMonths: number,
  cohort: string,
  reproductiveStage: string,
): string[] {
  const summary: string[] = [];
  const ageYears = Math.floor(ageMonths / 12);
  const cohortLabel = cohort.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  summary.push(`${cohortLabel}`);
  summary.push(`${ageYears} years`);

  if (sex === 'female' && reproductiveStage === 'reproductive_age') {
    summary.push('Reproductive age');
  }
  if (sex === 'female' && reproductiveStage !== 'male') {
    summary.push(reproductiveStage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }

  if (data['are_you_pregnant']?.value === 'pregnant') {
    const ga = data['gestational_age_weeks']?.value;
    summary.push(`Pregnant${ga ? ` — ${ga} weeks` : ''}`);
  }

  const encounterType = data['encounter_type']?.value as string;
  if (encounterType) {
    summary.push(encounterType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }

  const dept = data['department']?.value as string;
  if (dept) {
    summary.push(dept.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }

  const triage = data['triage_category']?.value as string;
  if (triage && triage !== 'none') {
    summary.push(`${triage.toUpperCase()} priority`);
  }

  return summary;
}

export function createRegistrationEngine() {
  let state: RegistrationState = {
    stage: 'identity',
    completedStages: [],
    data: {},
    stageStatuses: Object.fromEntries(STAGE_ORDER.map(s => [s, 'pending' as GateStatus])),
    validationErrors: {},
    activeFields: [],
    contextSummary: [],
  };

  function initialize(): RegistrationState {
    const now = new Date();
    state.data['hospital_number'] = createAnswer(getNextHospitalNumber(), 'captured', 'system');
    state.data['age_unit'] = createAnswer('years', 'captured', 'system');
    state.data['date'] = createAnswer(now.toISOString().split('T')[0], 'captured', 'system');
    state.data['time'] = createAnswer(now.toTimeString().split(' ')[0], 'captured', 'system');
    state.stageStatuses['identity'] = 'active';
    return getState();
  }

  function setField(fieldId: string, value: unknown): RegistrationState {
    const fieldDef = REGISTRATION_FIELDS[fieldId];
    if (!fieldDef) return getState();

    state.data[fieldId] = createAnswer(value);

    if (fieldId === 'date_of_birth' && value) {
      const calculatedAge = calculateAgeFromDOB(value as string);
      if (calculatedAge !== null) {
        state.data['age'] = createAnswer(calculatedAge, 'captured', 'calculated');
      }
    }

    if (fieldId === 'age' && !state.data['date_of_birth']?.value) {
      const age = value as number;
      if (age <= 2) {
        state.data['age_unit'] = createAnswer('months', 'captured', 'system');
      }
    }

    if (fieldId === 'sex') {
      applySexRules(value as string);
    }

    const age = state.data['age']?.value as number || 0;
    const ageUnit = state.data['age_unit']?.value as string || 'years';
    const ageMonths = ageUnit === 'years' ? age * 12 : ageUnit === 'months' ? age : Math.round(age / 30);
    const sex = state.data['sex']?.value as string || 'unknown';
    const ageGroup = resolveAgeGroup(ageMonths);
    const reproductiveStage = resolveReproductiveStage(sex, ageMonths, state.data['reproductive_status']?.value as string);

    applyInformantRules(ageMonths, ageGroup);

    state.activeFields = getActiveFieldsForStage(state.stage, state.data, ageGroup, sex, ageMonths);

    const currentStageComplete = isStageComplete(state.stage, state.data);
    if (currentStageComplete) {
      state.stageStatuses[state.stage] = 'completed';
    }

    state.contextSummary = computeContextSummary(state.data, ageGroup, sex, ageMonths, `${ageGroup}_${sex}`, reproductiveStage);

    return getState();
  }

  function applySexRules(sex: string): void {
    if (sex === 'male') {
      state.data['reproductive_status'] = createAnswer('male', 'captured', 'system');
    }
  }

  function applyInformantRules(ageMonths: number, ageGroup: string): void {
    for (const rule of INFORMANT_RULES) {
      const ageMin = rule.applicableAges?.minMonths ?? -Infinity;
      const ageMax = rule.applicableAges?.maxMonths ?? Infinity;
      if (ageMonths >= ageMin && ageMonths <= ageMax) {
        if (rule.reliabilityOverride) {
          state.data['informant_reliability'] = createAnswer(rule.reliabilityOverride, 'captured', 'system');
        }
        if (ageMonths < 2 && !state.data['informant']?.value) {
          state.data['informant'] = createAnswer('mother', 'captured', 'system');
        }
        break;
      }
    }
  }

  function nextStage(): RegistrationState {
    const currentIdx = STAGE_ORDER.indexOf(state.stage);

    if (state.stage !== 'registration_complete') {
      state.stageStatuses[state.stage] = 'completed';
      if (!state.completedStages.includes(state.stage)) {
        state.completedStages.push(state.stage);
      }
    }

    if (currentIdx < STAGE_ORDER.length - 1) {
      state.stage = STAGE_ORDER[currentIdx + 1];
      state.stageStatuses[state.stage] = 'active';
    }

    const age = state.data['age']?.value as number || 0;
    const ageUnit = state.data['age_unit']?.value as string || 'years';
    const ageMonths = ageUnit === 'years' ? age * 12 : ageUnit === 'months' ? age : Math.round(age / 30);
    const sex = state.data['sex']?.value as string || 'unknown';
    const ageGroup = resolveAgeGroup(ageMonths);

    state.activeFields = getActiveFieldsForStage(state.stage, state.data, ageGroup, sex, ageMonths);

    return getState();
  }

  function previousStage(): RegistrationState {
    const currentIdx = STAGE_ORDER.indexOf(state.stage);
    if (currentIdx > 0) {
      state.stageStatuses[state.stage] = 'pending';
      state.stage = STAGE_ORDER[currentIdx - 1];
      state.stageStatuses[state.stage] = 'active';
    }

    const age = state.data['age']?.value as number || 0;
    const ageUnit = state.data['age_unit']?.value as string || 'years';
    const ageMonths = ageUnit === 'years' ? age * 12 : ageUnit === 'months' ? age : Math.round(age / 30);
    const sex = state.data['sex']?.value as string || 'unknown';
    const ageGroup = resolveAgeGroup(ageMonths);

    state.activeFields = getActiveFieldsForStage(state.stage, state.data, ageGroup, sex, ageMonths);

    return getState();
  }

  function getState(): RegistrationState {
    return { ...state, data: { ...state.data } };
  }

  function getClinicalContext() {
    return buildClinicalContext(state.data);
  }

  function setAnswerState(
    fieldId: string,
    answerState: 'captured' | 'unknown' | 'unable' | 'declined' | 'not_applicable'
  ): RegistrationState {
    const existing = state.data[fieldId];
    if (existing) {
      state.data[fieldId] = {
        ...existing,
        state: answerState,
        value: answerState === 'not_applicable' ? null : existing.value,
        timestamp: Date.now(),
      };
    }
    return getState();
  }

  return {
    initialize,
    setField,
    setAnswerState,
    nextStage,
    previousStage,
    getState,
    getClinicalContext,
  };
}
