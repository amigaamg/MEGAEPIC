// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL REASONING ENGINE -- Structured Rule-Based Question Selection
//
// This engine replaces stochastic EIG with deterministic clinical logic.
// It mirrors the real-time reasoning of a consultant approaching abdominal pain:
//   1. Filter DDx by biodata (age, sex, region)
//   2. Walk through phases in clinical order (onset -> location -> character -> ...)
//   3. At each phase, ask the MOST discriminating unanswered question
//   4. Build constellation by linking associated symptoms to leading hypotheses
//   5. Track reasoning path for narrative generation
//
// EIG is ONLY used as a fallback when no rule fires.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterState, AnswerRecord, CandidateDiseaseState,
  FeatureRecord, DiseaseNode, ConvergenceState,
} from '../knowbase/diseaseNode';
import { FEATURES } from '../knowbase/features/featureLibrary';
import type { SymptomHighway } from '../highways/abdominalPain';
import { getActiveHighways } from '../highways/abdominalPain';

// ── TYPES ──────────────────────────────────────────────────────────────────

export interface ClinicalReasoningStep {
  phase: string;
  featureId: string;
  rationale: string;
  priority: number;
  reason: string;
}

export interface ClinicalReasoningPath {
  filteredDifferentials: FilteredDifferential[];
  currentPhase: string;
  nextQuestion: ClinicalReasoningStep | null;
  constellation: SymptomCluster[];
  reasoningLog: string[];
}

export interface FilteredDifferential {
  diseaseId: string;
  diseaseName: string;
  reasonIncluded: string;
  probabilityWeight: number;
}

export interface SymptomCluster {
  name: string;
  features: string[];
  present: string[];
  absent: string[];
  likelihood: 'high' | 'moderate' | 'low' | 'excluded';
}

// ── ABDOMINAL PAIN BIODATA FILTERS ─────────────────────────────────────────
// Each disease gets a pre-test probability multiplier based on age + sex.
// These are NOT Bayesian priors -- they are structured clinical filters
// that every surgeon applies subconsciously.

interface BiodataFilter {
  diseaseId: string;
  ageMin: number;
  ageMax: number;
  sexWeight: { male: number; female: number };
  ageWeights: { startAge: number; endAge: number; weight: number }[];
  regionRelevance?: string[];
  description: string;
}

const BIODATA_FILTERS: BiodataFilter[] = [
  {
    diseaseId: 'acute_appendicitis',
    ageMin: 1, ageMax: 90,
    sexWeight: { male: 1.0, female: 1.1 },
    ageWeights: [
      { startAge: 10, endAge: 30, weight: 3.0 },
      { startAge: 30, endAge: 50, weight: 1.5 },
      { startAge: 0, endAge: 10, weight: 0.5 },
      { startAge: 50, endAge: 90, weight: 0.3 },
    ],
    description: 'Peak incidence 10-30 years, rare in elderly',
  },
  {
    diseaseId: 'acute_cholecystitis',
    ageMin: 20, ageMax: 90,
    sexWeight: { male: 0.5, female: 2.0 },
    ageWeights: [
      { startAge: 30, endAge: 60, weight: 3.0 },
      { startAge: 60, endAge: 90, weight: 2.0 },
      { startAge: 20, endAge: 30, weight: 1.0 },
      { startAge: 0, endAge: 20, weight: 0.0 },
    ],
    description: 'Fair, fat, female, fertile, forty -- classic 5Fs',
  },
  {
    diseaseId: 'acute_pancreatitis',
    ageMin: 20, ageMax: 90,
    sexWeight: { male: 1.5, female: 1.0 },
    ageWeights: [
      { startAge: 40, endAge: 70, weight: 3.0 },
      { startAge: 20, endAge: 40, weight: 1.0 },
      { startAge: 0, endAge: 20, weight: 0.1 },
      { startAge: 70, endAge: 90, weight: 2.0 },
    ],
    description: 'Alcohol + gallstones -- peak middle-aged to elderly',
  },
  {
    diseaseId: 'intestinal_obstruction',
    ageMin: 0, ageMax: 90,
    sexWeight: { male: 1.0, female: 1.0 },
    ageWeights: [
      { startAge: 60, endAge: 90, weight: 4.0 },
      { startAge: 0, endAge: 1, weight: 3.0 },
      { startAge: 40, endAge: 60, weight: 1.5 },
      { startAge: 1, endAge: 40, weight: 0.5 },
    ],
    description: 'Bimodal: infants (congenital/atresia) + elderly (adhesions/malignancy/hernia)',
  },
  {
    diseaseId: 'generalised_peritonitis',
    ageMin: 0, ageMax: 90,
    sexWeight: { male: 1.0, female: 1.0 },
    ageWeights: [
      { startAge: 50, endAge: 90, weight: 3.0 },
      { startAge: 0, endAge: 50, weight: 1.0 },
    ],
    description: 'Complication of another disease -- increases with age and delay',
  },
  {
    diseaseId: 'perforated_peptic_ulcer',
    ageMin: 20, ageMax: 85,
    sexWeight: { male: 1.5, female: 0.7 },
    ageWeights: [
      { startAge: 40, endAge: 70, weight: 3.0 },
      { startAge: 20, endAge: 40, weight: 1.0 },
      { startAge: 70, endAge: 85, weight: 1.5 },
    ],
    description: 'More common in males, NSAID use amplifies risk',
  },
  {
    diseaseId: 'acute_gastroenteritis',
    ageMin: 0, ageMax: 90,
    sexWeight: { male: 1.0, female: 1.0 },
    ageWeights: [
      { startAge: 0, endAge: 10, weight: 3.0 },
      { startAge: 10, endAge: 90, weight: 1.0 },
    ],
    description: 'Most common overall -- affects all ages, especially children',
  },
  {
    diseaseId: 'ureteric_colic',
    ageMin: 15, ageMax: 70,
    sexWeight: { male: 2.0, female: 0.7 },
    ageWeights: [
      { startAge: 30, endAge: 60, weight: 3.0 },
      { startAge: 15, endAge: 30, weight: 1.0 },
      { startAge: 60, endAge: 70, weight: 1.5 },
    ],
    description: 'Males 2:1, peak 30-60 years',
  },
  {
    diseaseId: 'ruptured_ectopic_pregnancy',
    ageMin: 15, ageMax: 50,
    sexWeight: { male: 0.0, female: 1.0 },
    ageWeights: [
      { startAge: 20, endAge: 35, weight: 3.0 },
      { startAge: 15, endAge: 20, weight: 1.0 },
      { startAge: 35, endAge: 50, weight: 1.0 },
    ],
    description: 'Reproductive-age females ONLY -- always ask LMP',
  },
  {
    diseaseId: 'abdominal_aortic_aneurysm',
    ageMin: 50, ageMax: 90,
    sexWeight: { male: 3.0, female: 0.5 },
    ageWeights: [
      { startAge: 60, endAge: 80, weight: 4.0 },
      { startAge: 50, endAge: 60, weight: 1.0 },
      { startAge: 80, endAge: 90, weight: 2.0 },
    ],
    description: 'Males > 60: the most lethal missed diagnosis',
  },
  {
    diseaseId: 'mesenteric_ischemia',
    ageMin: 50, ageMax: 90,
    sexWeight: { male: 1.0, female: 1.2 },
    ageWeights: [
      { startAge: 60, endAge: 80, weight: 4.0 },
      { startAge: 50, endAge: 60, weight: 1.5 },
      { startAge: 80, endAge: 90, weight: 3.0 },
    ],
    description: 'Elderly with AF / vascular disease -- pain out of proportion',
  },
  {
    diseaseId: 'colorectal_cancer',
    ageMin: 40, ageMax: 90,
    sexWeight: { male: 1.3, female: 1.0 },
    ageWeights: [
      { startAge: 60, endAge: 80, weight: 4.0 },
      { startAge: 40, endAge: 60, weight: 2.0 },
      { startAge: 80, endAge: 90, weight: 3.0 },
    ],
    description: 'Most common GI malignancy -- increasing with age',
  },
  {
    diseaseId: 'strangulated_hernia',
    ageMin: 0, ageMax: 90,
    sexWeight: { male: 3.0, female: 0.5 },
    ageWeights: [
      { startAge: 60, endAge: 90, weight: 3.0 },
      { startAge: 0, endAge: 1, weight: 2.0 },
      { startAge: 1, endAge: 60, weight: 0.5 },
    ],
    description: 'Bimodal: infants (congenital) + elderly (acquired)',
  },
  {
    diseaseId: 'diverticulitis',
    ageMin: 30, ageMax: 90,
    sexWeight: { male: 0.8, female: 1.2 },
    ageWeights: [
      { startAge: 50, endAge: 80, weight: 4.0 },
      { startAge: 30, endAge: 50, weight: 1.0 },
      { startAge: 80, endAge: 90, weight: 2.0 },
    ],
    description: 'Left-sided in Western populations, right-sided in Asian',
  },
  {
    diseaseId: 'typhoid_ileal_perforation',
    ageMin: 5, ageMax: 60,
    sexWeight: { male: 1.0, female: 1.0 },
    ageWeights: [
      { startAge: 5, endAge: 30, weight: 3.0 },
      { startAge: 30, endAge: 60, weight: 0.5 },
    ],
    regionRelevance: ['sub_saharan_africa', 'south_asia', 'southeast_asia'],
    description: 'Endemic in resource-limited settings -- classic ileal perforation',
  },
];

// ── CONSTELLATION DEFINITIONS ──────────────────────────────────────────────

interface ConstellationDef {
  name: string;
  coreFeatures: string[];
  supportingFeatures: string[];
  excludingFeatures: string[];
  diseasesSupported: string[];
}

const CONSTELLATIONS: ConstellationDef[] = [
  {
    name: 'Intestinal Obstruction',
    coreFeatures: ['obstipation', 'abdominal_distension'],
    supportingFeatures: ['vomiting_bilious', 'pain_colicky', 'vomiting', 'vomiting_relief', 'pain_cramping'],
    excludingFeatures: ['diarrhea', 'diarrhoea', 'pain_sharp_stabbing'],
    diseasesSupported: ['intestinal_obstruction', 'strangulated_hernia', 'colorectal_cancer', 'adhesions', 'volvulus'],
  },
  {
    name: 'Peritoneal Irritation',
    coreFeatures: ['peritonism', 'rigidity'],
    supportingFeatures: ['pain_worsening_movement', 'pain_worsening_cough', 'guarding', 'rebound_history', 'fever_chills', 'pain_constant'],
    excludingFeatures: ['pain_relieving_bending_forward'],
    diseasesSupported: ['generalised_peritonitis', 'perforated_peptic_ulcer', 'appendicitis_perforated', 'typhoid_ileal_perforation'],
  },
  {
    name: 'Appendicitis Classical',
    coreFeatures: ['pain_migration', 'pain_initial_periumbilical', 'pain_location_rlq'],
    supportingFeatures: ['anorexia', 'nausea', 'vomiting', 'fever', 'pain_worsening_movement'],
    excludingFeatures: ['pain_radiation_back', 'pain_migration_to_llq'],
    diseasesSupported: ['acute_appendicitis'],
  },
  {
    name: 'Biliary / Pancreatic',
    coreFeatures: ['pain_location_ruq', 'pain_location_epigastric'],
    supportingFeatures: ['pain_radiation_back', 'pain_radiation_right_shoulder', 'fever', 'nausea', 'vomiting', 'jaundice'],
    excludingFeatures: ['pain_migration_to_rlq'],
    diseasesSupported: ['acute_cholecystitis', 'acute_pancreatitis', 'cholangitis', 'biliary_colic'],
  },
  {
    name: 'Ureteric Colic',
    coreFeatures: ['flank_pain', 'pain_radiation_groin'],
    supportingFeatures: ['hematuria', 'dysuria', 'nausea', 'pain_colicky', 'pain_worsening_movement'],
    excludingFeatures: ['fever', 'peritonism', 'abdominal_distension'],
    diseasesSupported: ['ureteric_colic', 'pyelonephritis', 'renal_stone'],
  },
  {
    name: 'Ectopic / Gynaecological',
    coreFeatures: ['last_menstrual_period', 'vaginal_bleeding'],
    supportingFeatures: ['abdominal_pain_lower', 'syncope', 'shoulder_tip_pain', 'dyspareunia', 'vaginal_discharge'],
    excludingFeatures: ['obstipation', 'vomiting_bilious'],
    diseasesSupported: ['ruptured_ectopic_pregnancy', 'ovarian_torsion', 'pelvic_inflammatory_disease'],
  },
  {
    name: 'Gastroenteritis',
    coreFeatures: ['diarrhea', 'diarrhoea'],
    supportingFeatures: ['vomiting', 'nausea', 'fever', 'pain_cramping', 'recent_travel'],
    excludingFeatures: ['obstipation', 'peritonism', 'rigidity', 'pain_migration'],
    diseasesSupported: ['acute_gastroenteritis', 'food_poisoning', 'infectious_colitis'],
  },
  {
    name: 'Vascular Emergency',
    coreFeatures: ['pain_onset_sudden', 'pain_character_tearing'],
    supportingFeatures: ['syncope', 'age_over_60', 'male', 'pain_severe_10', 'known_aaa'],
    excludingFeatures: ['pain_migration'],
    diseasesSupported: ['abdominal_aortic_aneurysm', 'mesenteric_ischemia', 'aortic_dissection'],
  },
];

// ── PHASE DEFINITIONS ──────────────────────────────────────────────────────

interface PhaseDef {
  id: string;
  label: string;
  priorityFeatures: string[];
  branchFeatures: string[];
  completionFeatures: string[];
  minAnswersToComplete: number;
}

const PHASES: PhaseDef[] = [
  {
    id: 'onset',
    label: 'Onset & Timing',
    priorityFeatures: ['pain_onset', 'pain_onset_sudden'],
    branchFeatures: ['pain_onset_sudden'],
    completionFeatures: ['pain_onset'],
    minAnswersToComplete: 1,
  },
  {
    id: 'location',
    label: 'Location & Radiation',
    priorityFeatures: ['pain_initial_location', 'pain_migration', 'pain_location_now', 'pain_radiation', 'flank_pain'],
    branchFeatures: ['pain_initial_location', 'pain_migration', 'flank_pain'],
    completionFeatures: ['pain_initial_location'],
    minAnswersToComplete: 1,
  },
  {
    id: 'character',
    label: 'Character & Severity',
    priorityFeatures: ['pain_character', 'pain_severity', 'pain_worsening_factors', 'pain_relieving_factors'],
    branchFeatures: ['pain_character', 'pain_severity'],
    completionFeatures: ['pain_character', 'pain_severity'],
    minAnswersToComplete: 2,
  },
  {
    id: 'progression',
    label: 'Progression & Evolution',
    priorityFeatures: ['pain_migration', 'pain_location_now', 'pain_duration_hours', 'pain_progression'],
    branchFeatures: ['pain_migration'],
    completionFeatures: ['pain_migration', 'pain_location_now'],
    minAnswersToComplete: 1,
  },
  {
    id: 'constellation',
    label: 'Associated Symptoms / Constellation',
    priorityFeatures: ['vomiting', 'nausea', 'anorexia', 'fever', 'fever_chills', 'abdominal_distension',
      'obstipation', 'diarrhea', 'constipation', 'melena', 'hematochezia', 'hematemesis',
      'dysuria', 'hematuria', 'flank_pain', 'jaundice', 'chest_pain', 'dyspnea', 'syncope',
      'last_menstrual_period', 'vaginal_bleeding', 'vaginal_discharge', 'dyspareunia',
      'peritonism', 'rigidity', 'guarding', 'rebound_history'],
    branchFeatures: ['vomiting', 'abdominal_distension', 'diarrhea', 'peritonism', 'fever', 'last_menstrual_period', 'syncope'],
    completionFeatures: ['vomiting', 'nausea', 'anorexia', 'fever', 'abdominal_distension', 'obstipation', 'diarrhea', 'dysuria', 'syncope', 'peritonism'],
    minAnswersToComplete: 4,
  },
  {
    id: 'risk',
    label: 'Risk Factors',
    priorityFeatures: ['prior_abdominal_surgery', 'nsaid_use', 'alcohol_use', 'smoking', 'known_gallstones', 'previous_similar_episodes', 'recent_travel', 'anticoagulant_use', 'steroid_use', 'pregnancy_status', 'family_history_gi_cancer', 'diabetes', 'htn_cad'],
    branchFeatures: ['prior_abdominal_surgery', 'nsaid_use', 'alcohol_use', 'pregnancy_status'],
    completionFeatures: ['prior_abdominal_surgery', 'nsaid_use', 'alcohol_use', 'known_gallstones', 'previous_similar_episodes'],
    minAnswersToComplete: 3,
  },
  {
    id: 'impact',
    label: 'Impact & Context',
    priorityFeatures: ['weight_loss', 'fatigue', 'night_sweats', 'cough', 'dyspnea', 'urinary_frequency', 'urinary_retention', 'leg_swelling'],
    branchFeatures: ['weight_loss', 'night_sweats'],
    completionFeatures: ['weight_loss', 'fatigue'],
    minAnswersToComplete: 1,
  },
];

// ── BIODATA-BASED DDx FILTERING ────────────────────────────────────────────

export function filterDifferentialsByBiodata(
  age: number,
  sex: 'male' | 'female',
  region: string,
  allDiseaseIds: string[],
): FilteredDifferential[] {
  const results: FilteredDifferential[] = [];

  for (const diseaseId of allDiseaseIds) {
    const filter = BIODATA_FILTERS.find(f => f.diseaseId === diseaseId);
    if (!filter) {
      results.push({
        diseaseId,
        diseaseName: diseaseId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        reasonIncluded: 'No specific biodata filter -- included by default',
        probabilityWeight: 1,
      });
      continue;
    }

    if (age < filter.ageMin || age > filter.ageMax) continue;

    const sexWeight = sex === 'male' ? filter.sexWeight.male : filter.sexWeight.female;
    if (sexWeight === 0) continue;

    let ageWeight = 0.5;
    for (const aw of filter.ageWeights) {
      if (age >= aw.startAge && age < aw.endAge) {
        ageWeight = aw.weight;
        break;
      }
    }
    if (ageWeight === 0) continue;

    if (filter.regionRelevance && filter.regionRelevance.length > 0) {
      const regionStr = region.toLowerCase().replace(/[^a-z]/g, '_');
      const isRelevant = filter.regionRelevance.some(r => regionStr.includes(r));
      if (!isRelevant) ageWeight *= 0.3;
    }

    const totalWeight = ageWeight * sexWeight;
    results.push({
      diseaseId,
      diseaseName: diseaseId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      reasonIncluded: filter.description + ` (age ${age}, ${sex})`,
      probabilityWeight: Math.round(totalWeight * 10),
    });
  }

  results.sort((a, b) => b.probabilityWeight - a.probabilityWeight);
  return results;
}

// ── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

function getAnswerValue(state: EncounterState, featureId: string): string | boolean | string[] | number | undefined {
  const answer = state.answers.find(a => a.featureId === featureId);
  return answer?.value;
}

function isAnswered(state: EncounterState, featureId: string): boolean {
  return state.answers.some(a => a.featureId === featureId) ||
    state.chiefComplaint.preFiledFeatures.some(p => p.featureId === featureId);
}

function answerMatches(val: string | boolean | string[] | number | undefined, target: string): boolean {
  if (val === undefined) return false;
  if (typeof val === 'string') return val.toLowerCase().includes(target.toLowerCase()) || val.toLowerCase() === target.toLowerCase();
  if (typeof val === 'boolean') return val.toString() === target;
  if (typeof val === 'number') return val.toString() === target;
  return false;
}

function isPositive(val: string | boolean | string[] | number | undefined): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  if (typeof val === 'string') return ['yes', 'true', 'present', 'positive'].includes(val.toLowerCase()) || val.startsWith('Yes');
  return false;
}

function getAnsweredFeatures(state: EncounterState): Set<string> {
  const answered = new Set(state.answers.map(a => a.featureId));
  for (const pf of state.chiefComplaint.preFiledFeatures) {
    answered.add(pf.featureId);
  }
  return answered;
}

// ── PHASE MANAGEMENT ───────────────────────────────────────────────────────

function getCurrentPhase(state: EncounterState): { phase: PhaseDef; idx: number } {
  const answeredIds = getAnsweredFeatures(state);

  let currentIdx = 0;
  for (let i = 0; i < PHASES.length; i++) {
    const phase = PHASES[i];
    const answeredInPhase = phase.completionFeatures.filter(f => answeredIds.has(f)).length;
    if (answeredInPhase >= phase.minAnswersToComplete && i < PHASES.length - 1) {
      currentIdx = i + 1;
    } else {
      break;
    }
  }

  return { phase: PHASES[currentIdx], idx: currentIdx };
}

// ── CONSTELLATION DETECTION ────────────────────────────────────────────────

export function detectConstellations(state: EncounterState): SymptomCluster[] {
  const clusters: SymptomCluster[] = [];
  const answeredIds = getAnsweredFeatures(state);

  for (const def of CONSTELLATIONS) {
    const present: string[] = [];
    const absent: string[] = [];

    for (const f of def.coreFeatures) {
      if (answeredIds.has(f) && isPositive(getAnswerValue(state, f))) {
        present.push(f);
      } else if (answeredIds.has(f) && !isPositive(getAnswerValue(state, f))) {
        absent.push(f);
      }
    }
    for (const f of def.supportingFeatures) {
      if (answeredIds.has(f) && isPositive(getAnswerValue(state, f))) {
        present.push(f);
      } else if (answeredIds.has(f) && !isPositive(getAnswerValue(state, f))) {
        absent.push(f);
      }
    }

    let likelihood: 'high' | 'moderate' | 'low' | 'excluded' = 'low';
    if (present.length >= def.coreFeatures.length) {
      likelihood = present.length >= (def.coreFeatures.length + def.supportingFeatures.length / 2) ? 'high' : 'moderate';
    } else if (present.length >= 1) {
      likelihood = 'low';
    }
    for (const f of def.excludingFeatures) {
      if (present.includes(f) || (answeredIds.has(f) && isPositive(getAnswerValue(state, f)))) {
        likelihood = 'excluded';
        break;
      }
    }

    if (present.length > 0 || likelihood !== 'low') {
      clusters.push({
        name: def.name,
        features: [...def.coreFeatures, ...def.supportingFeatures],
        present,
        absent,
        likelihood,
      });
    }
  }

  clusters.sort((a, b) => {
    const order = { high: 3, moderate: 2, low: 1, excluded: 0 };
    return order[b.likelihood] - order[a.likelihood];
  });
  return clusters;
}

// ── RULE ENGINE ────────────────────────────────────────────────────────────

interface ClinicalRule {
  phase: string;
  priority: number;
  id: string;
  condition: (state: EncounterState, answeredIds: Set<string>, phase: PhaseDef) => boolean;
  getQuestion: (state: EncounterState, answeredIds: Set<string>, phase: PhaseDef) => { featureId: string; rationale: string; reason: string } | null;
}

// ── BIODATA -> RED FLAG RULES ─────────────────────────────────────────────

const BIODATA_RED_FLAG_RULES: ClinicalRule[] = [
  {
    phase: 'onset',
    priority: 1,
    id: 'red_flag_aaa_age_sex',
    condition: (state) => state.patient.age >= 55 && state.patient.sex === 'male',
    getQuestion: (state) => {
      if (!isAnswered(state, 'pain_character')) {
        return {
          featureId: 'pain_character',
          rationale: 'This patient is a ' + state.patient.age + '-year-old male -- the highest-risk demographic for AAA. Tearing/ripping pain is a surgical emergency.',
          reason: 'HIGH RISK: Age 55+ male -- must exclude AAA. Pain character is the most discriminating feature.',
        };
      }
      if (!isAnswered(state, 'pain_onset')) {
        return {
          featureId: 'pain_onset',
          rationale: 'Sudden onset of pain in this demographic raises concern for AAA rupture or mesenteric ischemia.',
          reason: 'HIGH RISK: Sudden onset in elderly male -- vascular emergency until proven otherwise.',
        };
      }
      if (!isAnswered(state, 'syncope')) {
        return {
          featureId: 'syncope',
          rationale: 'Syncope with abdominal pain in an elderly male suggests ruptured AAA with haemodynamic compromise. Must ask immediately.',
          reason: 'RED FLAG: Syncope + abdominal pain in elderly male = ruptured AAA until proven otherwise.',
        };
      }
      return null;
    },
  },
  {
    phase: 'onset',
    priority: 2,
    id: 'red_flag_ectopic_age_sex',
    condition: (state) => state.patient.sex === 'female' && state.patient.age >= 15 && state.patient.age <= 50,
    getQuestion: (state) => {
      if (!isAnswered(state, 'last_menstrual_period')) {
        return {
          featureId: 'last_menstrual_period',
          rationale: 'Reproductive-age female with abdominal pain -- ectopic pregnancy is a surgical emergency. LMP is the single most important question.',
          reason: 'RED FLAG: Reproductive-age female -- must exclude ectopic pregnancy before any other DDx.',
        };
      }
      if (!isAnswered(state, 'vaginal_bleeding')) {
        return {
          featureId: 'vaginal_bleeding',
          rationale: 'Vaginal bleeding with abdominal pain in a reproductive-age female raises concern for ectopic pregnancy, miscarriage, or ruptured corpus luteum.',
          reason: 'Essential gynaecological screening question.',
        };
      }
      return null;
    },
  },
  {
    phase: 'onset',
    priority: 3,
    id: 'red_flag_peritonism',
    condition: () => true,
    getQuestion: (state) => {
      if (!isAnswered(state, 'peritonism')) {
        return {
          featureId: 'peritonism',
          rationale: 'Peritonism (pain worsened by coughing/movement) is the earliest sign of peritoneal irritation -- a surgical abdomen.',
          reason: 'RED FLAG: Peritoneal irritation = surgical abdomen. Must be assessed in every abdominal pain.',
        };
      }
      return null;
    },
  },
  {
    phase: 'onset',
    priority: 4,
    id: 'red_flag_rigidity',
    condition: (state) => isAnswered(state, 'peritonism') && isPositive(getAnswerValue(state, 'peritonism')),
    getQuestion: (state) => {
      if (!isAnswered(state, 'rigidity')) {
        return {
          featureId: 'rigidity',
          rationale: 'Given positive peritonism, rigidity suggests generalised peritonitis -- board-like abdomen is a surgical emergency requiring immediate laparotomy.',
          reason: 'RED FLAG: Peritonism + rigidity = generalised peritonitis. Surgical emergency.',
        };
      }
      return null;
    },
  },
];

// ── ONSET RULES ────────────────────────────────────────────────────────────

const ONSET_RULES: ClinicalRule[] = [
  {
    phase: 'onset',
    priority: 10,
    id: 'onset_primary',
    condition: (_, answeredIds) => !answeredIds.has('pain_onset') && !answeredIds.has('pain_onset_sudden'),
    getQuestion: () => ({
      featureId: 'pain_onset',
      rationale: 'The onset of pain is the most important discriminator: sudden (seconds-minutes) suggests perforation, rupture, or ischemia; gradual (hours-days) suggests inflammation or obstruction.',
      reason: 'Primary triage: onset duration is the first branch point in surgical abdominal pain.',
    }),
  },
  {
    phase: 'onset',
    priority: 11,
    id: 'onset_sudden',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_onset_sudden')) return false;
      const onset = getAnswerValue(state, 'pain_onset');
      return answerMatches(onset, 'sudden') || answerMatches(onset, 'instantaneous');
    },
    getQuestion: () => ({
      featureId: 'pain_onset_sudden',
      rationale: 'Sudden/instantaneous onset dramatically narrows the DDx to perforated ulcer, ruptured AAA, mesenteric ischemia, torsion, or ruptured ectopic. This is the most time-critical presentation.',
      reason: 'Sudden onset -> vascular/perforation pathway activated. Confirm the exact onset pattern.',
    }),
  },
  {
    phase: 'onset',
    priority: 12,
    id: 'onset_gradual',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_onset_sudden')) return false;
      const onset = getAnswerValue(state, 'pain_onset');
      return answerMatches(onset, 'gradual') || answerMatches(onset, 'slow') || answerMatches(onset, 'hours') || answerMatches(onset, 'days');
    },
    getQuestion: () => ({
      featureId: 'pain_onset_sudden',
      rationale: 'Gradual onset suggests inflammation (appendicitis, cholecystitis) or obstruction rather than perforation/ischemia. Let\'s confirm there\'s no sudden component.',
      reason: 'Gradual onset -> inflammation/obstruction pathway. Confirm no sudden component.',
    }),
  },
];

// ── LOCATION RULES ─────────────────────────────────────────────────────────

const LOCATION_RULES: ClinicalRule[] = [
  {
    phase: 'location',
    priority: 10,
    id: 'location_initial',
    condition: (_, answeredIds) => !answeredIds.has('pain_initial_location'),
    getQuestion: () => ({
      featureId: 'pain_initial_location',
      rationale: 'The initial location tells us which organ was first involved. Periumbilical = midgut (appendix, small bowel). Epigastric = foregut (stomach, duodenum, pancreas). RUQ = biliary/liver. Suprapubic = pelvic.',
      reason: 'Location is the second major discriminator -- tells us the organ system of origin.',
    }),
  },
  {
    phase: 'location',
    priority: 11,
    id: 'location_migration',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_migration')) return false;
      const initLoc = getAnswerValue(state, 'pain_initial_location');
      return answerMatches(initLoc, 'periumbilical') || answerMatches(initLoc, 'epigastrium') || answerMatches(initLoc, 'navel');
    },
    getQuestion: () => ({
      featureId: 'pain_migration',
      rationale: 'Migration from the periumbilical/epigastric area is the single most pathognomonic feature in abdominal pain. Periumbilical -> RLQ is appendicitis until proven otherwise.',
      reason: 'Central onset + migration = appendicitis pathway. This single feature has the highest diagnostic yield.',
    }),
  },
  {
    phase: 'location',
    priority: 12,
    id: 'location_current',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_location_now')) return false;
      return answeredIds.has('pain_initial_location');
    },
    getQuestion: (state) => {
      const initLoc = getAnswerValue(state, 'pain_initial_location');
      return {
        featureId: 'pain_location_now',
        rationale: 'The pain started ' + (initLoc ? String(initLoc).toLowerCase() : 'somewhere') + '. Where is it NOW? The change in location reveals the disease\'s progression -- migration, spread, or localisation.',
        reason: 'Comparing initial vs current location reveals disease progression pattern.',
      };
    },
  },
  {
    phase: 'location',
    priority: 13,
    id: 'location_radiation',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_radiation')) return false;
      return answeredIds.has('pain_initial_location') || answeredIds.has('pain_location_now');
    },
    getQuestion: (state) => {
      const locNow = getAnswerValue(state, 'pain_location_now') || getAnswerValue(state, 'pain_initial_location');
      return {
        featureId: 'pain_radiation',
        rationale: 'Radiation follows the affected organ\'s nerve supply. ' + (locNow ? 'With ' + String(locNow).toLowerCase() + ' pain' : 'For this location') + ': back = pancreas/AAA, right shoulder = gallbladder, groin = ureter.',
        reason: 'Radiation is highly localising -- points to specific organ systems.',
      };
    },
  },
];

// ── CHARACTER RULES ────────────────────────────────────────────────────────

const CHARACTER_RULES: ClinicalRule[] = [
  {
    phase: 'character',
    priority: 10,
    id: 'character_primary',
    condition: (_, answeredIds) => !answeredIds.has('pain_character'),
    getQuestion: (state) => {
      const onset = getAnswerValue(state, 'pain_onset');
      if (answerMatches(onset, 'sudden')) {
        return {
          featureId: 'pain_character',
          rationale: 'With sudden onset, character is critical: tearing/ripping suggests AAA dissection; sharp/stabbing suggests perforation; colicky suggests stone/obstruction.',
          reason: 'Sudden onset + character = specific vascular/perforation pathway.',
        };
      }
      return {
        featureId: 'pain_character',
        rationale: 'The character of pain tells us the pathophysiology: colicky/cramping = hollow viscus (bowel, ureter, bile duct); dull ache = solid organ distension (liver, pancreas); burning = mucosal inflammation (ulcer).',
        reason: 'Pain character indicates the underlying pathophysiology -- hollow viscus vs solid organ vs peritoneal.',
      };
    },
  },
  {
    phase: 'character',
    priority: 11,
    id: 'character_severity',
    condition: (_, answeredIds) => !answeredIds.has('pain_severity'),
    getQuestion: () => ({
      featureId: 'pain_severity',
      rationale: 'Severity helps gauge the acuity and guides management. Severe pain (8+/10) suggests advanced pathology -- perforation, ischemia, or high-grade obstruction.',
      reason: 'Severity correlates with disease progression and guides urgency.',
    }),
  },
  {
    phase: 'character',
    priority: 12,
    id: 'character_worsening',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_worsening_factors')) return false;
      return answeredIds.has('pain_character');
    },
    getQuestion: (state) => {
      const painChar = getAnswerValue(state, 'pain_character');
      if (answerMatches(painChar, 'colicky') || answerMatches(painChar, 'cramping')) {
        return {
          featureId: 'pain_worsening_factors',
          rationale: 'Colicky pain worsened by movement or eating suggests mechanical obstruction. This is key -- real colic comes in waves regardless of position.',
          reason: 'Colicky pain + worsening factors = mechanical obstruction vs inflammatory ileus.',
        };
      }
      return {
        featureId: 'pain_worsening_factors',
        rationale: 'What makes the pain worse? Movement/coughing suggests peritoneal irritation. Eating suggests gastric/pancreatic. Lying flat suggests pancreatitis or AAA.',
        reason: 'Aggravating factors help distinguish peritoneal, inflammatory, and mechanical causes.',
      };
    },
  },
  {
    phase: 'character',
    priority: 13,
    id: 'character_relieving',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_relieving_factors')) return false;
      return answeredIds.has('pain_worsening_factors') || answeredIds.has('pain_character');
    },
    getQuestion: () => ({
      featureId: 'pain_relieving_factors',
      rationale: 'Relieving factors are highly discriminating: lying still = peritonitis; bending forward = pancreatitis; passing stool/gas = IBS/colitis; nothing helps = advanced pathology.',
      reason: 'Relieving factors narrow the differential -- pathognomonic for several diseases.',
    }),
  },
];

// ── PROGRESSION RULES ──────────────────────────────────────────────────────

const PROGRESSION_RULES: ClinicalRule[] = [
  {
    phase: 'progression',
    priority: 10,
    id: 'progression_migration',
    condition: (state, answeredIds) => {
      if (answeredIds.has('pain_migration')) return false;
      return answeredIds.has('pain_initial_location') && !answeredIds.has('pain_location_now');
    },
    getQuestion: () => ({
      featureId: 'pain_migration',
      rationale: 'Has the pain moved from its original location? Migration patterns are the highest-yield clinical feature -- periumbilical -> RLQ is virtually diagnostic of appendicitis.',
      reason: 'Migration is the single highest-yield feature in abdominal pain workup.',
    }),
  },
  {
    phase: 'progression',
    priority: 11,
    id: 'progression_duration',
    condition: (_, answeredIds) => !answeredIds.has('pain_duration_hours') && answeredIds.has('pain_onset'),
    getQuestion: () => ({
      featureId: 'pain_duration_hours',
      rationale: 'The total duration of pain is essential for staging the disease -- how many hours/days since onset? This determines urgency and helps stage pathology.',
      reason: 'Duration helps stage disease progression and determine urgency.',
    }),
  },
];

// ── CONSTELLATION (ASSOCIATED SYMPTOMS) RULES ──────────────────────────────

const CONSTELLATION_RULES: ClinicalRule[] = [
  {
    phase: 'constellation',
    priority: 5,
    id: 'constellation_vomiting',
    condition: (state, answeredIds) => {
      if (answeredIds.has('vomiting')) return false;
      const painChar = getAnswerValue(state, 'pain_character');
      const painLoc = getAnswerValue(state, 'pain_initial_location');
      const isObstructionSuspect = answerMatches(painChar, 'colicky') || answerMatches(painLoc, 'periumbilical');
      return isObstructionSuspect;
    },
    getQuestion: () => ({
      featureId: 'vomiting',
      rationale: 'Colicky periumbilical pain together with vomiting is the classic triad of intestinal obstruction. This is the key diagnostic question.',
      reason: 'Obstruction suspect: vomiting + colicky pain + distension = IO triad.',
    }),
  },
  {
    phase: 'constellation',
    priority: 6,
    id: 'constellation_obstipation',
    condition: (state, answeredIds) => {
      if (answeredIds.has('obstipation')) return false;
      const painChar = getAnswerValue(state, 'pain_character');
      return answerMatches(painChar, 'colicky') || answerMatches(painChar, 'cramping');
    },
    getQuestion: () => ({
      featureId: 'obstipation',
      rationale: 'With colicky pain, obstipation (no gas or stool passage) is the hallmark of complete intestinal obstruction. Its absence strongly rules out obstruction (LR- 0.05).',
      reason: 'Obstipation is the defining feature of mechanical bowel obstruction.',
    }),
  },
  {
    phase: 'constellation',
    priority: 7,
    id: 'constellation_distension',
    condition: (state, answeredIds) => {
      if (answeredIds.has('abdominal_distension')) return false;
      const obstipationAnswered = answeredIds.has('obstipation');
      const obstipationPositive = obstipationAnswered && isPositive(getAnswerValue(state, 'obstipation'));
      return obstipationPositive;
    },
    getQuestion: () => ({
      featureId: 'abdominal_distension',
      rationale: 'With obstipation, abdominal distension completes the intestinal obstruction triad (pain + vomiting + distension + obstipation). Its presence confirms the diagnosis.',
      reason: 'Obstipation + distension = IO confirmed. Assess degree and character of distension.',
    }),
  },
  {
    phase: 'constellation',
    priority: 8,
    id: 'constellation_anorexia',
    condition: (state, answeredIds) => {
      if (answeredIds.has('anorexia')) return false;
      const painLoc = getAnswerValue(state, 'pain_initial_location');
      const migration = getAnswerValue(state, 'pain_migration');
      return answerMatches(painLoc, 'periumbilical') || (migration !== undefined);
    },
    getQuestion: () => ({
      featureId: 'anorexia',
      rationale: 'Anorexia is a sensitive indicator of surgical pathology -- especially appendicitis. Absence of anorexia significantly reduces appendicitis likelihood (LR- 0.35).',
      reason: 'Appendicitis pathway: anorexia is part of the classic presentation.',
    }),
  },
  {
    phase: 'constellation',
    priority: 9,
    id: 'constellation_fever',
    condition: (state, answeredIds) => {
      if (answeredIds.has('fever')) return false;
      const peritonismAnswered = answeredIds.has('peritonism');
      const anorexiaAnswered = answeredIds.has('anorexia');
      return peritonismAnswered || anorexiaAnswered || answeredIds.has('pain_worsening_factors');
    },
    getQuestion: () => ({
      featureId: 'fever',
      rationale: 'Fever with abdominal pain suggests an inflammatory or infective process -- appendicitis, cholecystitis, diverticulitis, or abscess formation. Rigors suggest bacteraemia.',
      reason: 'Fever indicates inflammation/infection -- essential for surgical vs medical differentiation.',
    }),
  },
  {
    phase: 'constellation',
    priority: 10,
    id: 'constellation_diarrhea',
    condition: (state, answeredIds) => {
      if (answeredIds.has('diarrhea') || answeredIds.has('diarrhoea')) return false;
      const vomiting = getAnswerValue(state, 'vomiting');
      const fever = getAnswerValue(state, 'fever');
      return answerMatches(vomiting, 'yes') || isPositive(fever);
    },
    getQuestion: () => ({
      featureId: 'diarrhea',
      rationale: 'Diarrhoea with vomiting/fever suggests gastroenteritis or food poisoning -- a key differential from surgical causes of abdominal pain.',
      reason: 'Diarrhoea = medical (GE) rather than surgical cause. High discriminant value.',
    }),
  },
  {
    phase: 'constellation',
    priority: 11,
    id: 'constellation_nausea',
    condition: (state, answeredIds) => {
      if (answeredIds.has('nausea')) return false;
      return answeredIds.has('vomiting') && !isPositive(getAnswerValue(state, 'vomiting'));
    },
    getQuestion: () => ({
      featureId: 'nausea',
      rationale: 'Nausea without vomiting may still indicate surgical pathology -- many patients with appendicitis or cholecystitis report nausea without vomiting.',
      reason: 'Nausea is a sensitive but non-specific indicator of GI pathology.',
    }),
  },
  {
    phase: 'constellation',
    priority: 12,
    id: 'constellation_dysuria',
    condition: (state, answeredIds) => {
      if (answeredIds.has('dysuria')) return false;
      const painLoc = getAnswerValue(state, 'pain_location_now') || getAnswerValue(state, 'pain_initial_location');
      return answerMatches(painLoc, 'suprapubic') || answerMatches(painLoc, 'rlq') || answerMatches(painLoc, 'llq') || answerMatches(painLoc, 'lower');
    },
    getQuestion: () => ({
      featureId: 'dysuria',
      rationale: 'Dysuria with lower abdominal pain suggests UTI, pyelonephritis, or -- in RLQ pain -- a retrocaecal appendix irritating the ureter.',
      reason: 'Lower abdominal pain + dysuria = genitourinary cause vs referred appendicitis.',
    }),
  },
  {
    phase: 'constellation',
    priority: 13,
    id: 'constellation_syncope',
    condition: (state, answeredIds) => {
      if (answeredIds.has('syncope')) return false;
      const severity = getAnswerValue(state, 'pain_severity');
      const onset = getAnswerValue(state, 'pain_onset');
      return answerMatches(onset, 'sudden') || (typeof severity === 'number' && severity >= 7) ||
        answerMatches(severity, '7') || answerMatches(severity, '8') || answerMatches(severity, '9') || answerMatches(severity, '10');
    },
    getQuestion: () => ({
      featureId: 'syncope',
      rationale: 'Syncope with severe/sudden abdominal pain suggests haemodynamic compromise -- ruptured AAA, ruptured ectopic, massive GI bleed, or severe sepsis.',
      reason: 'Syncope = red flag for haemodynamic instability. Must ask in severe/sudden pain.',
    }),
  },
  {
    phase: 'constellation',
    priority: 14,
    id: 'constellation_jaundice',
    condition: (state, answeredIds) => {
      if (answeredIds.has('jaundice')) return false;
      const painLoc = getAnswerValue(state, 'pain_initial_location') || getAnswerValue(state, 'pain_location_now');
      return answerMatches(painLoc, 'ruq') || answerMatches(painLoc, 'epigastrium');
    },
    getQuestion: () => ({
      featureId: 'jaundice',
      rationale: 'Jaundice with RUQ/epigastric pain strongly suggests biliary pathology -- choledocholithiasis, cholangitis, or hepatic abscess.',
      reason: 'RUQ pain + jaundice = obstructive jaundice pathway. Surgical emergency if cholangitis.',
    }),
  },
];

// ── RISK FACTOR RULES ──────────────────────────────────────────────────────

const RISK_RULES: ClinicalRule[] = [
  {
    phase: 'risk',
    priority: 5,
    id: 'risk_surgery',
    condition: (_, answeredIds) => !answeredIds.has('prior_abdominal_surgery'),
    getQuestion: () => ({
      featureId: 'prior_abdominal_surgery',
      rationale: 'Prior abdominal surgery is THE most important risk factor for adhesive intestinal obstruction, especially with colicky pain. Previous appendectomy? Hysterectomy?',
      reason: 'Single highest risk factor for small bowel obstruction.',
    }),
  },
  {
    phase: 'risk',
    priority: 6,
    id: 'risk_nsaids',
    condition: (_, answeredIds) => !answeredIds.has('nsaid_use'),
    getQuestion: () => ({
      featureId: 'nsaid_use',
      rationale: 'NSAID use is the most common reversible cause of peptic ulcer disease and gastritis -- always ask. Also relevant for acute kidney injury in dehydrated patients.',
      reason: 'NSAIDs = most common reversible cause of PUD and GI bleeding.',
    }),
  },
  {
    phase: 'risk',
    priority: 7,
    id: 'risk_alcohol',
    condition: (_, answeredIds) => !answeredIds.has('alcohol_use'),
    getQuestion: (state) => {
      const painLoc = getAnswerValue(state, 'pain_initial_location');
      if (answerMatches(painLoc, 'epigastrium')) {
        return {
          featureId: 'alcohol_use',
          rationale: 'Epigastric pain with alcohol use is highly suggestive of acute pancreatitis or alcoholic gastritis. This is the key risk factor.',
          reason: 'Epigastric pain + alcohol = pancreatitis pathway.',
        };
      }
      return {
        featureId: 'alcohol_use',
        rationale: 'Alcohol use is relevant for pancreatitis, gastritis, hepatitis, and as a risk factor for GI bleeding.',
        reason: 'General risk factor -- impacts multiple abdominal DDx.',
      };
    },
  },
  {
    phase: 'risk',
    priority: 8,
    id: 'risk_gallstones',
    condition: (_, answeredIds) => !answeredIds.has('known_gallstones'),
    getQuestion: (state) => {
      const painLoc = getAnswerValue(state, 'pain_initial_location');
      if (answerMatches(painLoc, 'ruq') || answerMatches(painLoc, 'epigastrium')) {
        return {
          featureId: 'known_gallstones',
          rationale: 'Known gallstones with RUQ/epigastric pain makes gallstone-related disease the leading hypothesis -- cholecystitis, biliary colic, or gallstone pancreatitis.',
          reason: 'Known gallstones = leading hypothesis for biliary-type pain.',
        };
      }
      return {
        featureId: 'known_gallstones',
        rationale: 'Known gallstones are relevant for any upper abdominal pain -- may present atypically.',
        reason: 'Known gallstones add context to any abdominal DDx.',
      };
    },
  },
  {
    phase: 'risk',
    priority: 9,
    id: 'risk_previous_episodes',
    condition: (_, answeredIds) => !answeredIds.has('previous_similar_episodes'),
    getQuestion: () => ({
      featureId: 'previous_similar_episodes',
      rationale: 'Previous similar episodes suggest a recurrent condition -- biliary colic, peptic ulcer, IBS, or IBD. First episode favours appendicitis or obstruction.',
      reason: 'Recurrent vs first episode distinguishes acute from chronic conditions.',
    }),
  },
  {
    phase: 'risk',
    priority: 10,
    id: 'risk_anticoagulants',
    condition: (state, answeredIds) => {
      if (answeredIds.has('anticoagulant_use')) return false;
      const severity = getAnswerValue(state, 'pain_severity');
      const hasBleeding = answeredIds.has('melena') || answeredIds.has('hematochezia') || answeredIds.has('hematemesis');
      const severePain = typeof severity === 'number' ? severity >= 7 : false;
      return severePain || hasBleeding || state.patient.age >= 65;
    },
    getQuestion: () => ({
      featureId: 'anticoagulant_use',
      rationale: 'Anticoagulant use with abdominal pain raises concern for retroperitoneal haematoma or spontaneous intra-abdominal bleeding -- especially in the elderly.',
      reason: 'Anticoagulants + abdominal pain = risk of spontaneous haemorrhage.',
    }),
  },
  {
    phase: 'risk',
    priority: 11,
    id: 'risk_travel',
    condition: (_, answeredIds) => !answeredIds.has('recent_travel'),
    getQuestion: (state) => {
      const hasDiarrhoea = isAnswered(state, 'diarrhea') && isPositive(getAnswerValue(state, 'diarrhea'));
      if (hasDiarrhoea) {
        return {
          featureId: 'recent_travel',
          rationale: 'Recent travel with diarrhoea suggests infectious enterocolitis -- consider typhoid, amoebiasis, giardia, or travellers\' diarrhoea. In endemic areas, typhoid ileal perforation is a surgical concern.',
          reason: 'Diarrhoea + travel = infectious enterocolitis. Must ask geographical history.',
        };
      }
      return {
        featureId: 'recent_travel',
        rationale: 'Recent travel history helps identify region-specific infectious causes of abdominal pain -- especially in endemic areas.',
        reason: 'Travel history contextualises the DDx for region-specific infections.',
      };
    },
  },
];

// ── IMPACT RULES ───────────────────────────────────────────────────────────

const IMPACT_RULES: ClinicalRule[] = [
  {
    phase: 'impact',
    priority: 10,
    id: 'impact_weight_loss',
    condition: (state, answeredIds) => {
      if (answeredIds.has('weight_loss')) return false;
      const hasChronic = answeredIds.has('constipation') || answeredIds.has('diarrhea');
      const hasBleeding = answeredIds.has('melena') || answeredIds.has('hematochezia');
      const age = state.patient.age >= 50;
      return hasChronic || hasBleeding || age;
    },
    getQuestion: () => ({
      featureId: 'weight_loss',
      rationale: 'Weight loss with abdominal symptoms is a red flag for malignancy (especially in patients over 50), IBD, or chronic malabsorption.',
      reason: 'Weight loss = red flag for malignancy in abdominal pain workup.',
    }),
  },
  {
    phase: 'impact',
    priority: 11,
    id: 'impact_night_sweats',
    condition: (_, answeredIds) => {
      if (answeredIds.has('night_sweats')) return false;
      return answeredIds.has('fever') || answeredIds.has('weight_loss');
    },
    getQuestion: () => ({
      featureId: 'night_sweats',
      rationale: 'Night sweats with abdominal pain suggest chronic infection (TB, abscess) or lymphoma -- especially with fever and weight loss.',
      reason: 'B symptoms (night sweats + weight loss + fever) = systemic/chronic disease.',
    }),
  },
];

// ── ALL RULES IN ORDER ────────────────────────────────────────────────────

const ALL_RULES: ClinicalRule[] = [
  ...BIODATA_RED_FLAG_RULES,
  ...ONSET_RULES,
  ...LOCATION_RULES,
  ...CHARACTER_RULES,
  ...PROGRESSION_RULES,
  ...CONSTELLATION_RULES,
  ...RISK_RULES,
  ...IMPACT_RULES,
];

// ── MAIN ENTRY POINT ───────────────────────────────────────────────────────

/**
 * Select the next question using structured clinical reasoning.
 * Returns null if no rule-based question is found -- caller should fall back to EIG.
 */
export function selectNextQuestionClinical(
  state: EncounterState,
  previousQuestionIds: string[],
): ClinicalReasoningStep | null {
  const answeredIds = getAnsweredFeatures(state);
  const { phase: currentPhase } = getCurrentPhase(state);

  // Evaluate rules in priority order within the current phase
  const candidateRules = ALL_RULES.filter(r => r.phase === currentPhase.id);
  candidateRules.sort((a, b) => a.priority - b.priority);

  for (const rule of candidateRules) {
    if (previousQuestionIds.includes(rule.id)) continue;

    if (rule.condition(state, answeredIds, currentPhase)) {
      const result = rule.getQuestion(state, answeredIds, currentPhase);
      if (result && !answeredIds.has(result.featureId) && !previousQuestionIds.includes(result.featureId)) {
        const feature = FEATURES[result.featureId];
        if (feature?.dependsOn) {
          const parentAnswer = state.answers.find(a => a.featureId === feature.dependsOn!.featureId);
          if (!parentAnswer) continue;
          const reqVal = feature.dependsOn!.value;
          const actualVal = parentAnswer.value;
          if (typeof reqVal === 'boolean') {
            const isParentPositive = typeof actualVal === 'boolean' ? actualVal === reqVal :
              (actualVal.toString().toLowerCase().startsWith('yes') || actualVal.toString().toLowerCase() === 'true') === reqVal;
            if (!isParentPositive) continue;
          } else if (String(actualVal) !== String(reqVal)) {
            continue;
          }
        }

        return {
          phase: currentPhase.id,
          featureId: result.featureId,
          rationale: result.rationale,
          priority: rule.priority,
          reason: result.reason,
        };
      }
    }
  }

  // Fallback: check if there are still unanswered priority features in the current phase
  for (const featureId of currentPhase.priorityFeatures) {
    if (!answeredIds.has(featureId) && !previousQuestionIds.includes(featureId)) {
      const feature = FEATURES[featureId];
      if (feature) {
        if (feature.dependsOn) {
          const parentAnswer = state.answers.find(a => a.featureId === feature.dependsOn!.featureId);
          if (!parentAnswer) continue;
          const reqVal = feature.dependsOn!.value;
          const actualVal = parentAnswer.value;
          if (typeof reqVal === 'boolean') {
            const isParentPositive = typeof actualVal === 'boolean' ? actualVal === reqVal :
              (actualVal.toString().toLowerCase().startsWith('yes') || actualVal.toString().toLowerCase() === 'true') === reqVal;
            if (!isParentPositive) continue;
          } else if (String(actualVal) !== String(reqVal)) {
            continue;
          }
        }

        return {
          phase: currentPhase.id,
          featureId,
          rationale: 'Continuing ' + currentPhase.label.toLowerCase() + ' phase -- this feature helps complete the clinical picture.',
          priority: 50,
          reason: 'Phase completion: ' + currentPhase.label + ' still needs characterization.',
        };
      }
    }
  }

  return null;
}

/**
 * Get the full clinical reasoning path for narrative generation
 */
export function getClinicalReasoningPath(state: EncounterState): ClinicalReasoningPath {
  const { phase: currentPhase } = getCurrentPhase(state);
  const constellations = detectConstellations(state);

  const reasoningLog: string[] = [];

  reasoningLog.push('Patient: ' + state.patient.age + 'yo ' + state.patient.sex + ', region: ' + (state.patient.geographicRegion || 'N/A'));
  reasoningLog.push('Chief complaint: ' + state.chiefComplaint.text);
  reasoningLog.push('Current phase: ' + currentPhase.label);
  reasoningLog.push('Answers so far: ' + state.answers.length);

  const activeClusters = constellations.filter(c => c.likelihood === 'high' || c.likelihood === 'moderate');
  if (activeClusters.length > 0) {
    reasoningLog.push('Active constellations:');
    for (const c of activeClusters) {
      reasoningLog.push('  - ' + c.name + ' (' + c.likelihood + '): present: ' + (c.present.join(', ') || 'none') + ', absent: ' + (c.absent.join(', ') || 'none'));
    }
  }

  const filtered = filterDifferentialsByBiodata(
    state.patient.age, state.patient.sex, state.patient.geographicRegion,
    ['acute_appendicitis', 'acute_cholecystitis', 'acute_pancreatitis', 'intestinal_obstruction',
     'generalised_peritonitis', 'perforated_peptic_ulcer', 'acute_gastroenteritis', 'ureteric_colic',
     'ruptured_ectopic_pregnancy', 'abdominal_aortic_aneurysm', 'mesenteric_ischemia',
     'colorectal_cancer', 'strangulated_hernia', 'diverticulitis', 'typhoid_ileal_perforation'],
  );
  const topDifferentials = filtered.slice(0, 5);

  return {
    filteredDifferentials: topDifferentials,
    currentPhase: currentPhase.id,
    nextQuestion: null,
    constellation: constellations,
    reasoningLog,
  };
}
