import type {
  DiseaseState, EvidenceItem, DangerLevel, PatientContext,
} from './types';
import type { DiseaseNode, FeatureRecord, AnswerRecord } from '../knowbase/diseaseNode';
import { getLrPlus, getLrMinus } from '../knowbase/features/featureLibrary';

function bayesUpdate(prior: number, lr: number): number {
  if (prior <= 0) return 0;
  if (prior >= 1) return 1;
  if (!isFinite(lr)) return lr > 0 ? 1 : 0;
  const denom = prior * lr + (1 - prior);
  if (denom === 0) return 0;
  return (prior * lr) / denom;
}

function determinePolarity(value: string | boolean | number | string[]): 'present' | 'absent' {
  if (typeof value === 'boolean') return value ? 'present' : 'absent';
  if (Array.isArray(value)) return value.length > 0 ? 'present' : 'absent';
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (['no', 'none', 'never', 'absent', 'n/a', ''].includes(lower)) return 'absent';
    return 'present';
  }
  if (typeof value === 'number') return value > 0 ? 'present' : 'absent';
  return 'present';
}

export function createDiseaseState(
  diseaseNode: DiseaseNode,
  patientContext: PatientContext,
  priorProb: number,
): DiseaseState {
  return {
    diseaseId: diseaseNode.id,
    diseaseName: diseaseNode.name,
    icdCode: diseaseNode.icdCode,
    priorProb,
    currentProb: priorProb,
    previousProb: priorProb,
    probabilityHistory: [{ prob: priorProb, timestamp: Date.now() }],
    supportingEvidence: [],
    againstEvidence: [],
    unknownEvidence: [],
    criticalUnknowns: [...diseaseNode.redFlagFeatureIds],
    scores: {},
    redFlagTriggered: false,
    redFlagFeatures: [...diseaseNode.redFlagFeatureIds],
    dangerLevel: 'low',
    mustNotMiss: diseaseNode.acuity === 'immediately_life_threatening',
    currentStageIndex: 0,
    stageHistory: [{ stageId: 0, enteredAt: Date.now() }],
    lastUpdated: Date.now(),
    owner: 'disease_state_engine',
  };
}

export function applyEvidence(
  state: DiseaseState,
  featureId: string,
  value: string | boolean | number | string[],
  featureRecord: FeatureRecord,
  featureLibraryEntry: FeatureRecord,
): DiseaseState {
  const polarity = determinePolarity(value);
  const lr = polarity === 'present' ? getLrPlus(featureRecord) : getLrMinus(featureRecord);
  const newProb = bayesUpdate(state.currentProb, lr);
  const impact = Math.abs(newProb - state.currentProb);

  const evidenceItem: EvidenceItem = {
    featureId,
    type: polarity === 'present' ? 'supporting' : 'against',
    value: value as string | boolean | number,
    lrPlus: featureRecord.LR_positive ?? getLrPlus(featureRecord),
    lrMinus: featureRecord.LR_negative ?? getLrMinus(featureRecord),
    impact,
    timestamp: Date.now(),
  };

  const updated: DiseaseState = {
    ...state,
    previousProb: state.currentProb,
    currentProb: newProb,
    probabilityHistory: [
      ...state.probabilityHistory,
      { prob: newProb, timestamp: Date.now() },
    ],
    lastUpdated: Date.now(),
  };

  if (polarity === 'present') {
    updated.supportingEvidence = [...state.supportingEvidence, evidenceItem];
  } else {
    updated.againstEvidence = [...state.againstEvidence, evidenceItem];
  }

  updated.unknownEvidence = state.unknownEvidence.filter(e => e.featureId !== featureId);
  updated.criticalUnknowns = state.criticalUnknowns.filter(id => id !== featureId);

  if (state.redFlagFeatures.includes(featureId)) {
    updated.redFlagTriggered = true;
  }

  updated.dangerLevel = computeDangerLevel(updated).dangerLevel;

  return updated;
}

export function computeDangerLevel(state: DiseaseState): { dangerLevel: DangerLevel } {
  if (state.currentProb > 0.8 && state.redFlagTriggered) {
    return { dangerLevel: 'critical' };
  }
  if (state.redFlagTriggered || state.currentProb > 0.6) {
    return { dangerLevel: 'high' };
  }
  if (state.currentProb > 0.3) {
    return { dangerLevel: 'moderate' };
  }
  return { dangerLevel: 'low' };
}

export function getDiscriminatingPower(
  stateA: DiseaseState,
  stateB: DiseaseState,
  featureLibrary: Record<string, FeatureRecord>,
): { featureId: string; lrPlusDiff: number; lrMinusDiff: number } {
  const allFeatureIds = new Set([
    ...stateA.unknownEvidence.map(e => e.featureId),
    ...stateB.unknownEvidence.map(e => e.featureId),
  ]);

  let bestFeature = '';
  let bestLrPlusDiff = 0;
  let bestLrMinusDiff = 0;

  for (const featureId of allFeatureIds) {
    const feature = featureLibrary[featureId];
    if (!feature) continue;

    const lrPlus = getLrPlus(feature);
    const lrMinus = getLrMinus(feature);

    const aPostPresent = bayesUpdate(stateA.currentProb, lrPlus);
    const bPostPresent = bayesUpdate(stateB.currentProb, lrPlus);
    const aPostAbsent = bayesUpdate(stateA.currentProb, lrMinus);
    const bPostAbsent = bayesUpdate(stateB.currentProb, lrMinus);

    const lrPlusDiff = Math.abs(aPostPresent - bPostPresent);
    const lrMinusDiff = Math.abs(aPostAbsent - bPostAbsent);

    if (lrPlusDiff + lrMinusDiff > bestLrPlusDiff + bestLrMinusDiff) {
      bestFeature = featureId;
      bestLrPlusDiff = lrPlusDiff;
      bestLrMinusDiff = lrMinusDiff;
    }
  }

  return { featureId: bestFeature, lrPlusDiff: bestLrPlusDiff, lrMinusDiff: bestLrMinusDiff };
}

export function updateAllDiseaseStates(
  states: Record<string, DiseaseState>,
  answer: AnswerRecord,
  diseaseMap: Map<string, DiseaseNode>,
  featureLibrary: Record<string, FeatureRecord>,
): Record<string, DiseaseState> {
  const updated: Record<string, DiseaseState> = {};

  for (const [diseaseId, state] of Object.entries(states)) {
    const diseaseNode = diseaseMap.get(diseaseId);
    if (!diseaseNode) {
      updated[diseaseId] = state;
      continue;
    }

    const allFeatures = [
      ...diseaseNode.features.symptoms,
      ...diseaseNode.features.signs,
      ...diseaseNode.features.investigations,
      ...diseaseNode.importantNegatives.rulingOut,
      ...diseaseNode.importantNegatives.supporting,
    ];

    const featureRecord = allFeatures.find(f => f.featureId === answer.featureId);
    const featureLibraryEntry = featureLibrary[answer.featureId];

    if (!featureRecord && !featureLibraryEntry) {
      updated[diseaseId] = state;
      continue;
    }

    const fr = featureRecord ?? featureLibraryEntry;

    updated[diseaseId] = applyEvidence(state, answer.featureId, answer.value, fr, featureLibraryEntry ?? fr);
  }

  return updated;
}

export function computeConvergenceState(states: Record<string, DiseaseState>): 'exploring' | 'converging' | 'confirming' {
  const sorted = Object.values(states).sort((a, b) => b.currentProb - a.currentProb);

  if (sorted.length === 0) return 'exploring';

  if (sorted[0].currentProb > 0.7) return 'confirming';

  const topTwoCombined = sorted.length > 1
    ? sorted[0].currentProb + sorted[1].currentProb
    : sorted[0].currentProb;

  if (topTwoCombined > 0.5) return 'converging';

  return 'exploring';
}
