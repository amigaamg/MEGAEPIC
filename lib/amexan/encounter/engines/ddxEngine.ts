// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DDX Engine — adapter layer between EncounterState and Bayesian engine
// ═══════════════════════════════════════════════════════════════════════════════
// This engine ONLY transforms data. It does NOT maintain state.
// It reads EncounterState, calls the Bayesian engine, writes back to state.
// The actual disease reasoning lives in lib/amexan/reasoning/bayesianEngine.ts
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId, Assessment, DifferentialCandidate } from '../encounterState';
import type { AnswerRecord } from '../../knowbase/diseaseNode';
import { computeDdxUpdate, answerToPolarity } from '../../reasoning/bayesianEngine';
import { getActiveHighways, getHighway, getMergedDiseaseMap } from '../../highways/abdominalPain';
import { FEATURES } from '../../knowbase/features/featureLibrary';

// ── Field-to-feature mapping — converts structured symptom fields → feature library IDs ──

const FIELD_TO_FEATURE: Record<string, Record<string, string>> = {
  abdominal_pain: {
    onset: 'pain_onset',
    location: 'pain_initial_location',
    character: 'pain_character',
    severity: 'pain_severity',
    radiation: 'pain_radiation',
    progression: 'pain_worsening_factors',
    relieving: 'pain_relieving_factors',
    aggravating: 'pain_worsening_factors',
    temporalPattern: 'pain_temporal_pattern',
  },
  chest_pain: {
    onset: 'pain_onset',
    location: 'pain_initial_location',
    character: 'pain_character',
    severity: 'pain_severity',
    radiation: 'pain_radiation',
    exertional: 'chest_pain',
    pleuritic: 'pleuritic',
    relievingFactors: 'pain_relieving_factors',
  },
  nausea_vomiting: {
    onset: 'vomiting_timing',
    frequency: 'vomiting_frequency',
    character: 'vomiting_description',
    color: 'vomiting_description',
    projectile: 'vomiting_description',
    associatedPain: 'pain_worsening_factors',
  },
  diarrhea: {
    onset: 'diarrhoea_duration',
    frequency: 'diarrhoea_frequency',
    character: 'diarrhoea_stool_type',
    volume: 'diarrhoea_volume',
    tenesmus: 'tenesmus',
  },
  constipation: {
    duration: 'constipation_duration',
    frequency: 'constipation_stool_frequency',
  },
  fever: {
    pattern: 'fever_pattern',
    highestTemp: 'fever',
    responseToAntipyretics: 'fever_response',
    duration: 'fever_duration',
  },
  cough: {
    duration: 'cough_duration',
    character: 'cough',
    sputumColor: 'cough_sputum',
    hemoptysis: 'hemoptysis',
  },
  dyspnea: {
    onset: 'dyspnea_onset',
    severity: 'dyspnea',
    atRest: 'dyspnea',
    exertional: 'dyspnea_exertional',
  },
  headache: {
    onset: 'headache_onset',
    location: 'headache_location',
    character: 'headache_character',
    severity: 'headache_severity',
    thunderclap: 'thunderclap_headache',
  },
  syncope: {
    context: 'syncope',
    duration: 'syncope_duration',
    associatedSymptoms: 'syncope_associated',
  },
  dizziness: {
    character: 'dizziness_character',
    onset: 'dizziness_onset',
    duration: 'dizziness_duration',
  },
  palpitations: {
    onset: 'palpitations_onset',
    duration: 'palpitations_duration',
    frequency: 'palpitations_frequency',
  },
  seizure: {
    type: 'seizure_type',
    duration: 'seizure_duration',
    aura: 'seizure_aura',
    incontinence: 'seizure_incontinence',
  },
  dysuria: {
    character: 'dysuria',
    frequency: 'urinary_frequency',
    hematuria: 'hematuria',
  },
  gi_bleeding: {
    character: 'hematochezia',
    volume: 'gi_bleeding_volume',
    syncope: 'gi_bleeding_syncope',
  },
  rash: {
    location: 'skin_rash',
    character: 'skin_rash_description',
    pruritus: 'skin_rash_pruritus',
  },
  jaundice: {
    onset: 'jaundice_onset',
    progression: 'jaundice_progression',
    pruritus: 'jaundice_pruritus',
  },
  distension: {
    onset: 'distension_onset',
    progression: 'distension_progression',
    character: 'distension_character',
  },
  dysphagia: {
    onset: 'dysphagia_onset',
    duration: 'dysphagia_duration',
    solidsLiquids: 'dysphagia_solids_liquids',
  },
  vaginal_bleeding: {
    duration: 'vaginal_bleeding_duration',
    volume: 'vaginal_bleeding',
    timing: 'last_menstrual_period',
    associatedPain: 'dysmenorrhea',
  },
  back_pain: {
    onset: 'pain_onset',
    location: 'pain_initial_location',
    character: 'pain_character',
    severity: 'pain_severity',
    radiation: 'pain_radiation',
  },
};

function symptomToAnswerRecords(
  symptomId: string,
  symptom: Record<string, any>,
  timestamp: number,
): AnswerRecord[] {
  const records: AnswerRecord[] = [];
  const mapping = FIELD_TO_FEATURE[symptomId];
  if (!mapping) return records;

  // Map known fields to feature IDs
  for (const [field, featureId] of Object.entries(mapping)) {
    const value = symptom[field];
    if (value === undefined || value === null || value === '') continue;

    const questionLabel = FEATURES[featureId]?.label || `${symptomId} ${field}`;
    records.push({
      featureId,
      questionLabel,
      value: typeof value === 'object' ? JSON.stringify(value) : value,
      polarity: answerToPolarity(value),
      timestamp: timestamp++,
      source: 'socrates',
    });
  }

  // Also emit presence as a boolean answer
  if (symptom.present) {
    const presenceFeatureId = symptomId;
    if (FEATURES[presenceFeatureId]) {
      records.push({
        featureId: presenceFeatureId,
        questionLabel: FEATURES[presenceFeatureId].label,
        value: true,
        polarity: 'present',
        timestamp: timestamp++,
        source: 'socrates',
      });
    }
  }

  return records;
}

// ── Run full DDX — bridges new EncounterState to Bayesian engine ────────────

export function runDDX(state: EncounterState): DDXOutput {
  const { demographics, chiefComplaint, symptoms, history } = state;

  // Resolve active highways from chief complaint
  const rawHighways = chiefComplaint.activeHighways.length > 0
    ? chiefComplaint.activeHighways.map(id => getHighway(id))
    : getActiveHighways(
        (Object.keys(symptoms) as SymptomId[]).find(s => symptoms[s]?.present) || 'abdominal_pain',
        chiefComplaint.text,
      );
  const highways = rawHighways.filter((h): h is NonNullable<typeof h> => h != null);

  if (highways.length === 0) {
    return { differentials: [], dangerRanked: [], mustNotMissDiseases: [] };
  }

  const diseaseMap = getMergedDiseaseMap(highways);
  const now = Date.now();

  // Convert structured symptoms to flat AnswerRecord[]
  const answers: AnswerRecord[] = [];
  for (const sid of Object.keys(symptoms) as SymptomId[]) {
    const s = symptoms[sid];
    if (s?.present) {
      answers.push(...symptomToAnswerRecords(sid, s as Record<string, any>, now + answers.length));
    }
  }

  // Build old-format EncounterState bridge for the Bayesian engine
  const bridgeState: import('../../knowbase/diseaseNode').EncounterState = {
    patient: {
      age: demographics.ageYears,
      sex: demographics.sex === 'female' ? 'female' : 'male',
      setting: 'ED',
      geographicRegion: demographics.geographicRegion,
      knownComorbidities: history.pmh.conditions || [],
      medications: history.medications.current?.map(m => m.name) || [],
      surgicalHistory: [],
    },
    chiefComplaint: {
      text: chiefComplaint.text,
      symptomId: highways[0]?.id || 'abdominal_pain',
      highwayId: highways.map(h => h.id).join('+'),
      duration: chiefComplaint.duration,
      preFiledFeatures: [],
    },
    answers,
    questionsAsked: answers.map(a => a.featureId),
    redFlagsTriggered: [],
    ddx: {
      activeCandidates: [],
      leadingDiagnosis: null,
      convergenceState: 'exploring',
      lastUpdated: now,
    },
    phase: 'triage',
    interviewState: 'symptom_characterization',
    completeness: {} as any,
    contradictions: [],
    narrativeParts: [],
  };

  // Run Bayesian DDX
  const ddxResult = computeDdxUpdate(bridgeState, diseaseMap);

  // Map danger levels from disease acuity
  const dangerLevels: Record<string, 'low' | 'moderate' | 'high' | 'critical'> = {};
  const mustNotMissIds: string[] = [];
  Array.from(diseaseMap.entries()).forEach(([diseaseId, disease]) => {
    const tier = disease.acuityTier;
    if (tier === 1) {
      dangerLevels[diseaseId] = 'critical';
      mustNotMissIds.push(diseaseId);
    } else if (tier === 2) {
      dangerLevels[diseaseId] = 'high';
      mustNotMissIds.push(diseaseId);
    } else if (tier === 3) {
      dangerLevels[diseaseId] = 'moderate';
    } else {
      dangerLevels[diseaseId] = 'low';
    }
  });

  // Convert to new-format raw results
  const rawResults = ddxResult.activeCandidates.map(c => ({
    diseaseId: c.diseaseId,
    diseaseName: c.diseaseName,
    probability: c.currentProb,
    priorProbability: c.priorProb,
    confidence: (c.currentProb >= 0.7 ? 'high' : c.currentProb >= 0.3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    supportingFeatures: c.evidenceFor,
    againstFeatures: c.evidenceAgainst,
  }));

  return prepareDDXOutput(rawResults, dangerLevels, mustNotMissIds);
}

// ── Input transformation — convert EncounterState to Bayesian engine input ──

export interface DDXInput {
  ageMonths: number;
  sex: string;
  chiefComplaint: string;
  activeHighways: string[];
  symptoms: Record<string, any>;
  riskFactors: {
    hiv: string;
    tb: string;
    diabetes: boolean;
    immunodeficiency: boolean;
    smoker: boolean;
    exposureToTb: boolean;
  };
  vitals: {
    temp: number | undefined;
    spo2: number | undefined;
    rr: number | undefined;
    hr: number | undefined;
  };
}

export function prepareDDXInput(state: EncounterState): DDXInput {
  const symptoms: Record<string, any> = {};
  for (const sid of Object.keys(state.symptoms) as SymptomId[]) {
    const s = state.symptoms[sid];
    if (s?.present) {
      symptoms[sid] = { ...s };
      delete (symptoms[sid] as any).id;
      delete (symptoms[sid] as any).present;
    }
  }

  return {
    ageMonths: state.demographics.ageMonths,
    sex: state.demographics.sex,
    chiefComplaint: state.chiefComplaint.text,
    activeHighways: state.chiefComplaint.activeHighways,
    symptoms,
    riskFactors: {
      hiv: state.history.pmh.hiv,
      tb: state.history.pmh.tb,
      diabetes: state.history.pmh.diabetes,
      immunodeficiency: state.history.pmh.immunodeficiency,
      smoker: state.history.social.smoking === 'current',
      exposureToTb: state.history.social.exposureToTb,
    },
    vitals: {
      temp: state.examination.vitals.temp,
      spo2: state.examination.vitals.spo2,
      rr: state.examination.vitals.rr,
      hr: state.examination.vitals.hr,
    },
  };
}

// ── Output transformation — convert Bayesian engine result to EncounterState ──

export interface DDXOutput {
  differentials: DifferentialCandidate[];
  dangerRanked: DifferentialCandidate[];
  mustNotMissDiseases: DifferentialCandidate[];
}

export function prepareDDXOutput(
  rawResults: {
    diseaseId: string;
    diseaseName: string;
    probability: number;
    priorProbability: number;
    confidence: 'low' | 'medium' | 'high';
    supportingFeatures: string[];
    againstFeatures: string[];
  }[],
  dangerLevels: Record<string, 'low' | 'moderate' | 'high' | 'critical'>,
  mustNotMissIds: string[],
): DDXOutput {
  const candidates: DifferentialCandidate[] = rawResults.map(r => ({
    ...r,
    dangerLevel: dangerLevels[r.diseaseId] ?? 'moderate',
    mustNotMiss: mustNotMissIds.includes(r.diseaseId),
    actionMessage: '',
  }));

  const dangerRanked = [...candidates].sort((a, b) => {
    const dangerOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    return dangerOrder[a.dangerLevel] - dangerOrder[b.dangerLevel];
  });

  const mustNotMissDiseases = candidates.filter(c => c.mustNotMiss);

  return { differentials: candidates, dangerRanked, mustNotMissDiseases };
}

// ── Severity estimation from vitals and symptoms ──────────────────────────

export function estimateTriagePriority(state: EncounterState): 'green' | 'yellow' | 'orange' | 'red' {
  const v = state.examination.vitals;

  // Red flags (immediate life threat)
  if (v.spo2 !== undefined && v.spo2 < 90) return 'red';
  if (v.bpSystolic !== undefined && v.bpSystolic < 90) return 'red';
  if (v.avpu === 'unresponsive' || v.avpu === 'pain') return 'red';

  // Orange (high urgency)
  if (v.rr !== undefined) {
    const threshold = state.demographics.ageMonths < 12 ? 50 : state.demographics.ageMonths < 60 ? 40 : 30;
    if (v.rr > threshold + 10) return 'orange';
  }
  if (v.temp !== undefined && v.temp > 40) return 'orange';

  // Yellow (moderate urgency)
  if (v.temp !== undefined && v.temp > 38.5) return 'yellow';
  if (v.hr !== undefined && v.hr > 140) return 'yellow';

  return 'green';
}
