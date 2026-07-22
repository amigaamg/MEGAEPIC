// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN SessionAdapter — backward-compatible replacement for encounterOrchestrator
// ═══════════════════════════════════════════════════════════════════════════════
// Wraps the new unified EncounterState + reducer + engines in the old API.
// Consumers of createSession/processAnswer need zero code changes.
// ═══════════════════════════════════════════════════════════════════════════════

import { createEncounterState } from '../encounterState';
import type { EncounterState, SymptomId } from '../encounterState';
import { encounterReducer } from '../encounterReducer';
import { getNextQuestion, getAllPendingQuestions } from './questionEngine';
import type { NextQuestion } from './questionEngine';
import { runDDX } from './ddxEngine';
import { evaluateCompleteness } from '../completionEngine';
import { FEATURES } from '../../knowbase/features/featureLibrary';

// ── Re-export AmexanSession-compatible types ──────────────────────────────

interface OldAnswerRecord {
  featureId: string;
  questionLabel?: string;
  value: string | boolean | string[] | number;
  polarity: 'present' | 'absent';
  timestamp: number;
  source: string;
}

interface OldDdxState {
  activeCandidates: {
    diseaseId: string;
    diseaseName: string;
    priorProb: number;
    currentProb: number;
    evidenceFor: string[];
    evidenceAgainst: string[];
    importantNegativesFound: string[];
    isRedFlagTriggered: boolean;
  }[];
  leadingDiagnosis: {
    diseaseId: string;
    diseaseName: string;
    priorProb: number;
    currentProb: number;
    evidenceFor: string[];
    evidenceAgainst: string[];
    importantNegativesFound: string[];
    isRedFlagTriggered: boolean;
  } | null;
  convergenceState: string;
  lastUpdated: number;
}

// ── Legacy NextQuestion type — matches old encounterOrchestrator API ─────

export interface LegacyNextQuestion {
  featureId: string;
  label: string;
  shortLabel: string;
  type: 'boolean' | 'select' | 'multi_select' | 'number' | 'text';
  options?: string[];
  rationale: string;
  sourceDiseaseId: string;
  informationGain: number;
  priority: number;
  clinicalGuide?: string;
  // Forward-compatible new properties
  symptomId?: string;
  field?: import('./questionEngine').NextQuestion['field'];
  phase?: string;
  currentValues?: Record<string, any>;
}

interface OldEncounterState {
  patient: {
    age: number;
    sex: 'male' | 'female';
    setting: string;
    geographicRegion: string;
    knownComorbidities: string[];
    medications: string[];
    surgicalHistory: string[];
  };
  chiefComplaint: {
    text: string;
    symptomId: string;
    highwayId: string;
    duration?: string;
    preFiledFeatures: any[];
  };
  answers: OldAnswerRecord[];
  questionsAsked: string[];
  redFlagsTriggered: string[];
  ddx: OldDdxState;
  phase: string;
  interviewState: string;
  completeness: Record<string, boolean>;
  contradictions: any[];
  narrativeParts: any[];
}

export interface AmexanSession {
  state: OldEncounterState;
  nextQuestion: import('./questionEngine').NextQuestion | LegacyNextQuestion | null;
  allNextQuestions: (import('./questionEngine').NextQuestion | LegacyNextQuestion)[];
  narrative: any;
  questionsAsked: string[];
  isComplete: boolean;
  activeHighways: string[];
}

// ── Create AnswerRecords from structured symptoms ─────────────────────────

function buildAnswerRecords(state: EncounterState, startTimestamp: number): OldAnswerRecord[] {
  const records: OldAnswerRecord[] = [];
  let ts = startTimestamp;

  for (const [sid, symptom] of Object.entries(state.symptoms)) {
    if (!symptom?.present) continue;
    const s = symptom as Record<string, any>;

    // Emit presence
    records.push({
      featureId: sid,
      questionLabel: FEATURES[sid]?.label || sid,
      value: true,
      polarity: 'present',
      timestamp: ts++,
      source: 'socrates',
    });

    // Emit structured field values
    const skipFields = new Set(['id', 'present']);
    for (const [key, value] of Object.entries(s)) {
      if (skipFields.has(key)) continue;
      if (value === undefined || value === null || value === '') continue;
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
      records.push({
        featureId: `${sid}_${key}`,
        questionLabel: `${sid} ${key}`,
        value: valueStr,
        polarity: typeof valueStr === 'boolean' ? (valueStr ? 'present' : 'absent') : 'present',
        timestamp: ts++,
        source: 'socrates',
      });
    }
  }

  return records;
}

// ── Convert new EncounterState to old format for backward compat ──────────

function toOldState(state: EncounterState): OldEncounterState {
  const ddxOutput = runDDX(state);
  const ddx = state.assessment.differentials;

  const activeCandidates = ddxOutput.differentials.map(d => ({
    diseaseId: d.diseaseId,
    diseaseName: d.diseaseName,
    priorProb: d.priorProbability,
    currentProb: d.probability,
    evidenceFor: d.supportingFeatures,
    evidenceAgainst: d.againstFeatures,
    importantNegativesFound: [] as string[],
    isRedFlagTriggered: d.dangerLevel === 'critical',
  }));

  return {
    patient: {
      age: state.demographics.ageYears,
      sex: state.demographics.sex === 'female' ? 'female' : 'male',
      setting: 'ED',
      geographicRegion: state.demographics.geographicRegion,
      knownComorbidities: state.history.pmh.conditions || [],
      medications: state.history.medications.current?.map(m => m.name) || [],
      surgicalHistory: [],
    },
    chiefComplaint: {
      text: state.chiefComplaint.text,
      symptomId: 'abdominal_pain',
      highwayId: state.chiefComplaint.activeHighways?.join('+') || 'abdominal_pain',
      duration: state.chiefComplaint.duration,
      preFiledFeatures: [],
    },
    answers: buildAnswerRecords(state, Date.now()),
    questionsAsked: [],
    redFlagsTriggered: state.assessment.severity.redFlags,
    ddx: {
      activeCandidates,
      leadingDiagnosis: activeCandidates[0] || null,
      convergenceState: activeCandidates[0] && activeCandidates[0].currentProb >= 0.8
        ? 'confirming' : activeCandidates[0] && activeCandidates[0].currentProb >= 0.6
        ? 'converging' : 'exploring',
      lastUpdated: Date.now(),
    },
    phase: 'triage',
    interviewState: state.workflow.completedSteps.includes('history') ? 'complete' : 'symptom_characterization',
    completeness: { timeline: true, location: true, character: true, severity: true },
    contradictions: [],
    narrativeParts: [],
  };
}

// ── Convert new NextQuestion to old format ──────────────────────────────

function toOldNextQuestion(nq: NextQuestion): any {
  return {
    featureId: nq.field?.id || nq.symptomId,
    label: nq.field?.label || nq.reason,
    shortLabel: nq.field?.shortLabel || nq.field?.id || nq.symptomId,
    type: nq.field?.type || 'boolean',
    options: nq.field?.options,
    rationale: nq.reason,
    sourceDiseaseId: nq.symptomId,
    informationGain: 0,
    priority: nq.priority === 'danger' ? 1
      : nq.priority === 'mandatory' ? 2
      : nq.priority === 'completion' ? 3
      : 4,
    clinicalGuide: nq.field?.clinicalGuide,
    // Preserve new properties for forward-compatible consumers
    symptomId: nq.symptomId,
    field: nq.field,
    phase: nq.phase,
    currentValues: nq.currentValues,
  };
}

// ── createSession — backward compatible replacement ──────────────────────

export function createSession(
  symptomId: string,
  complaintText: string,
  age: number,
  sex: string,
  duration?: string,
  preExistingAnswers: { featureId: string; value: string | boolean | string[] | number }[] = [],
  geographicRegion?: string,
): AmexanSession {
  const state = createEncounterState();

  // Set demographics
  let updated = encounterReducer(state, {
    type: 'SET_DEMOGRAPHICS',
    payload: {
      ageYears: age,
      ageMonths: age * 12,
      sex: sex === 'female' ? 'female' : 'male',
      geographicRegion: geographicRegion || '',
      name: '',
      mrn: '',
      patientId: '',
      encounterId: '',
      residence: '',
      informant: '',
      informantRelation: '',
      historyReliability: 'reliable',
      organizationId: '',
      departmentSlug: '',
      unitSlug: '',
    },
  });

  // Set chief complaint
  updated = encounterReducer(updated, {
    type: 'SET_CHIEF_COMPLAINT',
    payload: {
      text: complaintText,
      duration: duration || '',
      severity: 5,
      priority: 'medium' as const,
      activeHighways: [],
    },
  });

  // Map symptomId to structured symptom
  const symptomIdMap: Record<string, SymptomId> = {
    abdominal_pain: 'abdominal_pain',
    chest_pain: 'chest_pain',
    cough: 'cough',
    fever: 'fever',
    dyspnea: 'dyspnea',
    nausea_vomiting: 'nausea_vomiting',
    diarrhea: 'diarrhea',
    diarrhoea: 'diarrhea',
    constipation: 'constipation',
    dysphagia: 'dysphagia',
    odynophagia: 'dysphagia',
    gi_bleeding: 'gi_bleeding',
    hematemesis: 'gi_bleeding',
    melena: 'gi_bleeding',
    hematochezia: 'gi_bleeding',
    jaundice: 'jaundice',
    distension: 'distension',
    bloating: 'distension',
    headache: 'headache',
    dizziness: 'dizziness',
    syncope: 'syncope',
    palpitations: 'palpitations',
    dysuria: 'dysuria',
    frequency: 'frequency',
    hematuria: 'hematuria',
    vaginal_bleeding: 'vaginal_bleeding',
    vaginal_discharge: 'vaginal_discharge',
    rash: 'rash',
    joint_pain: 'joint_pain',
    back_pain: 'back_pain',
    seizure: 'seizure',
    seizures: 'seizure',
    weakness: 'weakness',
    numbness: 'numbness',
    weight_loss: 'weight_loss',
    fatigue: 'fatigue',
    night_sweats: 'night_sweats',
    reduced_feeding: 'reduced_feeding',
    lethargy: 'lethargy',
    cyanosis: 'cyanosis',
    stridor: 'stridor',
    vomiting: 'nausea_vomiting',
    skin_rash: 'rash',
    swallowing_difficulty: 'dysphagia',
    numbness_tingling: 'numbness',
    hematemesis_melena: 'gi_bleeding',
  };

  const mappedSymptomId = symptomIdMap[symptomId];
  if (!mappedSymptomId) {
    // Unknown symptom — return empty session with no questions
    return {
      state: {
        patient: { age, sex: (sex === 'female' ? 'female' : 'male') as 'male' | 'female', setting: 'ED', geographicRegion: geographicRegion || '', knownComorbidities: [], medications: [], surgicalHistory: [] },
        chiefComplaint: { text: complaintText, symptomId: 'abdominal_pain', highwayId: 'abdominal_pain', duration: duration || '', preFiledFeatures: [] },
        answers: [],
        questionsAsked: [],
        redFlagsTriggered: [],
        ddx: { activeCandidates: [], leadingDiagnosis: null, convergenceState: 'exploring', lastUpdated: Date.now() },
        phase: 'triage',
        interviewState: 'complete',
        completeness: { timeline: true, location: true, character: true, severity: true },
        contradictions: [],
        narrativeParts: [],
      },
      nextQuestion: null,
      allNextQuestions: [],
      narrative: null,
      questionsAsked: [],
      isComplete: true,
      activeHighways: [],
    };
  }

  // Activate the symptom
  updated = encounterReducer(updated, {
    type: 'ACTIVATE_SYMPTOM',
    payload: { id: mappedSymptomId, present: true } as any,
  });

  // Run DDX — skip on initial session creation to avoid blocking; DDX runs on first answer
  // const ddxOutput = runDDX(updated);
  // if (ddxOutput.differentials.length > 0) {
  //   updated = encounterReducer(updated, { type: 'SET_DIFFERENTIALS', payload: ddxOutput.differentials });
  //   updated = encounterReducer(updated, { type: 'SET_DANGER_RANKED', payload: ddxOutput.dangerRanked });
  //   updated = encounterReducer(updated, { type: 'SET_MUST_NOT_MISS', payload: ddxOutput.mustNotMissDiseases });
  // }

  // Get next question
  const next = getNextQuestion(updated);
  const nextOld = next ? toOldNextQuestion(next) : null;
  const allNext = next ? [next, ...getAllPendingQuestions(updated)] : [];
  const allNextOld = allNext.map(toOldNextQuestion);

  return {
    state: toOldState(updated),
    nextQuestion: nextOld,
    allNextQuestions: allNextOld,
    narrative: null,
    questionsAsked: [],
    isComplete: next === null,
    activeHighways: updated.chiefComplaint.activeHighways,
  };
}

// ── Get active highways from symptomId ───────────────────────────────────

export function getActiveHighways(symptomId: string, complaintText: string): string[] {
  const hwMap: Record<string, string> = {
    abdominal_pain: 'abdominal_pain',
    nausea_vomiting: 'vomiting',
    bloating: 'abdominal_distension',
    distension: 'abdominal_distension',
    diarrhea: 'diarrhoea',
    diarrhoea: 'diarrhoea',
    constipation: 'constipation',
    dysphagia: 'dysphagia',
    gi_bleeding: 'gi_bleeding',
  };
  const id = hwMap[symptomId] || symptomId;
  return [id];
}

// ── processAnswer — backward compatible replacement ──────────────────────

export function processAnswer(
  session: AmexanSession,
  featureId: string,
  value: string | boolean | string[] | number,
  _questionLabel?: string,
  symptomId?: string,
): AmexanSession {
  const state = createEncounterState();

  // Determine which symptom this answer belongs to
  let sid: SymptomId;
  if (symptomId) {
    sid = symptomId as SymptomId;
  } else {
    const symptomHint = featureId.split('_')[0];
    const hintMap: Record<string, SymptomId> = {
      pain: 'abdominal_pain', abdominal: 'abdominal_pain',
      vomit: 'nausea_vomiting', diarr: 'diarrhea',
      const: 'constipation', dysph: 'dysphagia',
      chest: 'chest_pain', cough: 'cough',
      fever: 'fever', hemat: 'gi_bleeding', melena: 'gi_bleeding',
    };
    sid = hintMap[symptomHint] || ('abdominal_pain' as SymptomId);
  }

  // Activate the symptom first
  let updated = encounterReducer(state, {
    type: 'ACTIVATE_SYMPTOM',
    payload: { id: sid, present: true } as any,
  });

  // Replay ALL previous answers from the session into the new state
  const prefix = sid + '_';
  for (const prev of session.state.answers) {
    if (!prev.featureId.startsWith(prefix)) continue; // skip presence record / other symptoms
    const prevFieldId = prev.featureId.slice(prefix.length);
    if (prevFieldId === 'id' || prevFieldId === 'present') continue;
    updated = encounterReducer(updated, {
      type: 'UPDATE_SYMPTOM',
      payload: { id: sid, present: true, [prevFieldId]: prev.value } as any,
    });
  }

  // Apply the current answer
  const fieldId = featureId.includes('_') ? featureId.split('_').slice(1).join('_') : featureId;
  updated = encounterReducer(updated, {
    type: 'UPDATE_SYMPTOM',
    payload: { id: sid, present: true, [fieldId]: value } as any,
  });

  // Set demographics from previous session
  updated = encounterReducer(updated, {
    type: 'SET_DEMOGRAPHICS',
    payload: {
      ageYears: session.state.patient.age,
      ageMonths: session.state.patient.age * 12,
      sex: session.state.patient.sex,
      name: '', mrn: '', patientId: '', encounterId: '',
      residence: '', informant: '', informantRelation: '',
      historyReliability: 'reliable',
      organizationId: '', departmentSlug: '', unitSlug: '',
    },
  });

  // Set chief complaint from previous session
  updated = encounterReducer(updated, {
    type: 'SET_CHIEF_COMPLAINT',
    payload: {
      text: session.state.chiefComplaint.text,
      duration: session.state.chiefComplaint.duration || '',
      severity: 5,
      priority: 'medium' as const,
      activeHighways: session.activeHighways,
    },
  });

  // Run DDX
  const ddxOutput = runDDX(updated);
  if (ddxOutput.differentials.length > 0) {
    updated = encounterReducer(updated, { type: 'SET_DIFFERENTIALS', payload: ddxOutput.differentials });
    updated = encounterReducer(updated, { type: 'SET_DANGER_RANKED', payload: ddxOutput.dangerRanked });
    updated = encounterReducer(updated, { type: 'SET_MUST_NOT_MISS', payload: ddxOutput.mustNotMissDiseases });
  }

  // Get next question
  const next = getNextQuestion(updated);
  const allNext = next ? [next, ...getAllPendingQuestions(updated)] : [];
  const nextOld = next ? toOldNextQuestion(next) : null;
  const allNextOld = allNext.map(toOldNextQuestion);

  const questionsAsked = [...session.questionsAsked, featureId];
  const isComplete = next === null || questionsAsked.length >= 25;

  return {
    state: toOldState(updated),
    nextQuestion: isComplete ? null : nextOld,
    allNextQuestions: isComplete ? [] : allNextOld,
    narrative: isComplete ? { hpi: 'History complete.' } : session.narrative,
    questionsAsked,
    isComplete,
    activeHighways: session.activeHighways,
  };
}
