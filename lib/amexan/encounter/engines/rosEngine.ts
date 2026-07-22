// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ROS Engine — targeted review of systems based on active symptoms
// ═══════════════════════════════════════════════════════════════════════════════
// This engine determines WHICH ROS systems to activate and WHICH questions to ask.
// No hardcoded 200-question ROS. Only systems relevant to the chief complaint.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId } from '../encounterState';
import { SYMPTOM_SCHEMAS } from '../symptomSchemas';

// ── ROS System definitions ─────────────────────────────────────────────────

export interface RosSystemDefinition {
  id: string;
  label: string;
  fields: RosField[];
  /** Symptoms that should activate this system */
  activatedBySymptoms: SymptomId[];
  /** Age range this system is relevant for (null = all ages) */
  ageRangeMonths: { min: number; max: number } | null;
  /** Chief complaint keywords that should trigger this system */
  ccKeywords: string[];
}

export interface RosField {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'select';
  options?: string[];
  clinicalGuide?: string;
}

// ── All ROS systems ───────────────────────────────────────────────────────

export const ROS_SYSTEMS: RosSystemDefinition[] = [
  {
    id: 'general',
    label: 'General',
    activatedBySymptoms: ['fever', 'weight_loss', 'fatigue', 'night_sweats', 'reduced_feeding', 'lethargy'],
    ageRangeMonths: null,
    ccKeywords: ['fever', 'weight loss', 'fatigue', 'tired', 'sweat'],
    fields: [
      { id: 'fever', label: 'Fever documented above?', type: 'boolean' },
      { id: 'weightLoss', label: 'Unintentional weight loss?', type: 'boolean', clinicalGuide: 'Significant weight loss suggests chronic disease, TB, or malignancy' },
      { id: 'nightSweats', label: 'Drenching night sweats?', type: 'boolean', clinicalGuide: 'Classic for TB, lymphoma, chronic infection' },
      { id: 'fatigue', label: 'Generalised fatigue?', type: 'boolean' },
      { id: 'appetite', label: 'Appetite status', type: 'select', options: ['normal', 'increased', 'decreased', 'poor'] },
    ],
  },
  {
    id: 'respiratory',
    label: 'Respiratory',
    activatedBySymptoms: ['cough', 'dyspnea', 'chest_pain', 'cyanosis', 'stridor'] as SymptomId[],
    ageRangeMonths: null,
    ccKeywords: ['cough', 'breathless', 'short of breath', 'wheeze', 'stridor', 'chest'],
    fields: [
      { id: 'cough', label: 'Cough?', type: 'boolean' },
      { id: 'dyspnea', label: 'Shortness of breath?', type: 'boolean' },
      { id: 'wheeze', label: 'Wheezing?', type: 'boolean' },
      { id: 'hemoptysis', label: 'Coughing blood?', type: 'boolean', clinicalGuide: 'Haemoptysis = TB, bronchiectasis, or pulmonary embolism until proven otherwise' },
    ],
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    activatedBySymptoms: ['chest_pain', 'palpitations', 'dyspnea', 'syncope', 'cyanosis'],
    ageRangeMonths: null,
    ccKeywords: ['chest pain', 'palpitations', 'fainting', 'blue'],
    fields: [
      { id: 'chestPain', label: 'Chest pain or discomfort?', type: 'boolean' },
      { id: 'palpitations', label: 'Palpitations or awareness of heartbeat?', type: 'boolean' },
      { id: 'orthopnea', label: 'Worse lying flat?', type: 'boolean', clinicalGuide: 'Orthopnea suggests heart failure' },
      { id: 'edema', label: 'Swelling of feet/ankles?', type: 'boolean', clinicalGuide: 'Bilateral pitting oedema suggests heart failure or nephrotic syndrome' },
    ],
  },
  {
    id: 'gastrointestinal',
    label: 'Gastrointestinal',
    activatedBySymptoms: ['abdominal_pain', 'nausea_vomiting', 'diarrhea', 'constipation', 'dysphagia', 'gi_bleeding', 'jaundice', 'distension'],
    ageRangeMonths: null,
    ccKeywords: ['pain', 'vomit', 'diarrhoea', 'constipat', 'swallow', 'bleed', 'yellow', 'bloat'],
    fields: [
      { id: 'nausea', label: 'Nausea?', type: 'boolean' },
      { id: 'vomiting', label: 'Vomiting?', type: 'boolean' },
      { id: 'diarrhea', label: 'Diarrhoea?', type: 'boolean' },
      { id: 'constipation', label: 'Constipation?', type: 'boolean' },
      { id: 'dysphagia', label: 'Difficulty swallowing?', type: 'boolean' },
      { id: 'bleeding', label: 'GI bleeding?', type: 'boolean' },
      { id: 'jaundice', label: 'Jaundice / yellow eyes?', type: 'boolean' },
    ],
  },
  {
    id: 'genitourinary',
    label: 'Genitourinary',
    activatedBySymptoms: ['dysuria', 'frequency', 'hematuria', 'vaginal_bleeding', 'vaginal_discharge'],
    ageRangeMonths: null,
    ccKeywords: ['urine', 'burning', 'blood in urine', 'discharge', 'bleeding'],
    fields: [
      { id: 'dysuria', label: 'Painful urination?', type: 'boolean' },
      { id: 'frequency', label: 'Increased frequency of urination?', type: 'boolean' },
      { id: 'hematuria', label: 'Blood in urine?', type: 'boolean' },
      { id: 'discharge', label: 'Abnormal discharge?', type: 'boolean' },
    ],
  },
  {
    id: 'musculoskeletal',
    label: 'Musculoskeletal',
    activatedBySymptoms: ['joint_pain', 'back_pain', 'weakness'],
    ageRangeMonths: { min: 24, max: 1200 },
    ccKeywords: ['joint', 'back pain', 'muscle', 'weakness'],
    fields: [
      { id: 'jointPain', label: 'Joint pain?', type: 'boolean' },
      { id: 'swelling', label: 'Joint swelling?', type: 'boolean' },
      { id: 'weakness', label: 'Muscle weakness?', type: 'boolean' },
    ],
  },
  {
    id: 'neurological',
    label: 'Neurological',
    activatedBySymptoms: ['headache', 'dizziness', 'syncope', 'seizure', 'numbness', 'weakness'],
    ageRangeMonths: null,
    ccKeywords: ['headache', 'dizzy', 'faint', 'seizure', 'numb', 'vision'],
    fields: [
      { id: 'headache', label: 'Headache?', type: 'boolean' },
      { id: 'dizziness', label: 'Dizziness?', type: 'boolean' },
      { id: 'seizures', label: 'Seizures or fits?', type: 'boolean' },
      { id: 'numbness', label: 'Numbness or tingling?', type: 'boolean' },
      { id: 'visionChanges', label: 'Vision changes?', type: 'boolean' },
    ],
  },
  {
    id: 'endocrine',
    label: 'Endocrine',
    activatedBySymptoms: ['weight_loss', 'fatigue', 'palpitations'],
    ageRangeMonths: { min: 60, max: 1200 },
    ccKeywords: ['weight', 'thyroid', 'sweat', 'tremor'],
    fields: [
      { id: 'heatCold', label: 'Heat or cold intolerance?', type: 'boolean' },
      { id: 'tremor', label: 'Tremor?', type: 'boolean' },
      { id: 'skinChanges', label: 'Skin changes?', type: 'boolean' },
    ],
  },
  {
    id: 'psychiatric',
    label: 'Psychiatric',
    activatedBySymptoms: ['headache', 'fatigue', 'weight_loss'],
    ageRangeMonths: { min: 144, max: 1200 },
    ccKeywords: ['mood', 'sleep', 'anxiety'],
    fields: [
      { id: 'depression', label: 'Depressed mood?', type: 'boolean' },
      { id: 'anxiety', label: 'Anxiety?', type: 'boolean' },
      { id: 'sleepChanges', label: 'Sleep changes?', type: 'boolean' },
    ],
  },
];

// ── Public API ─────────────────────────────────────────────────────────────

export function getActiveRosSystems(state: EncounterState): RosSystemDefinition[] {
  const activeSymptoms = Object.keys(state.symptoms) as SymptomId[];
  const activeSymptomSet = new Set(activeSymptoms);
  const activatedIds = new Set<string>();

  // Always include general
  activatedIds.add('general');

  for (const symptomId of Array.from(activeSymptomSet)) {
    const schema = SYMPTOM_SCHEMAS[symptomId];
    if (schema) {
      for (const sys of schema.activatesRosSystems) {
        activatedIds.add(sys);
      }
    }
  }

  // Check chief complaint keywords
  const cc = state.chiefComplaint.text.toLowerCase();
  for (const system of ROS_SYSTEMS) {
    for (const kw of system.ccKeywords) {
      if (cc.includes(kw)) {
        activatedIds.add(system.id);
        break;
      }
    }
  }

  // Filter by age
  const ageMonths = state.demographics.ageMonths;
  return ROS_SYSTEMS.filter(sys => {
    if (!activatedIds.has(sys.id)) return false;
    if (sys.ageRangeMonths) {
      if (ageMonths < sys.ageRangeMonths.min || ageMonths > sys.ageRangeMonths.max) return false;
    }
    return true;
  });
}

export function getNextRosQuestion(state: EncounterState): { system: string; field: RosField } | null {
  const activeSystems = getActiveRosSystems(state);

  for (const system of activeSystems) {
    const rosSection = (state.history.ros as any)[system.id];
    if (!rosSection) continue;

    for (const field of system.fields) {
      const value = rosSection[field.id];
      if (value === false || value === '') {
        return { system: system.id, field };
      }
    }
  }

  return null;
}

export function getRosCompleteness(state: EncounterState) {
  const activeSystems = getActiveRosSystems(state);
  const completed: string[] = [];
  const incomplete: string[] = [];

  for (const system of activeSystems) {
    const rosSection = (state.history.ros as any)[system.id];
    if (!rosSection) {
      incomplete.push(system.label);
      continue;
    }

    const answeredFields = system.fields.filter(f => {
      const v = rosSection[f.id];
      return v !== false && v !== '';
    });

    if (answeredFields.length >= system.fields.length) {
      completed.push(system.label);
    } else {
      incomplete.push(system.label);
    }
  }

  return {
    completed,
    incomplete,
    complete: incomplete.length === 0,
    completionRatio: completed.length / (completed.length + incomplete.length),
  };
}
