// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Symptom Schema Registry — field definitions per symptom
// ═══════════════════════════════════════════════════════════════════════════════
// This is the single source of "what fields does each symptom have?"
// The QuestionEngine reads this to determine what to ask.
// No hardcoded question banks. No scattered field lists.
// ═══════════════════════════════════════════════════════════════════════════════

import type { SymptomId } from './encounterState';
import { composeSchema, CORE_SYMPTOM_FIELDS, PAIN_MIXIN, INFECTION_MIXIN, CARDIAC_MIXIN, RESPIRATORY_MIXIN, GI_MIXIN, NEUROLOGICAL_MIXIN, DYSPNEA_SPECIFIC } from './schemaMixins';

// ── Field definition — describes one piece of information about a symptom ─────

export type FieldType = 'boolean' | 'text' | 'select' | 'number' | 'multi_select';

export interface SymptomField {
  id: string;
  label: string;
  shortLabel: string;
  type: FieldType;
  options?: string[];
  mandatory: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  phase: 'onset' | 'location' | 'character' | 'evolution' | 'associated' | 'context';
  dependsOn?: { field: string; value: string | boolean };
  clinicalGuide?: string;
  /** If true, this field can be pre-filled from chief complaint text */
  canBeFromCC?: boolean;
  /** Example: 'Fever that moved' → fever_present=true, fever_pattern='intermittent' */
  ccKeywords?: string[];
}

// ── Symptom schema — the complete field requirements for one symptom type ─────

export interface SymptomSchema {
  symptomId: SymptomId;
  label: string;
  description: string;
  fields: SymptomField[];
  /** Systems to activate in ROS when this symptom is present */
  activatesRosSystems: string[];
  /** Minimal fields needed before DDX can run on this symptom */
  minimumForDDX: string[];
  /** Field IDs required before this symptom is clinically complete */
  requiredForCompletion?: string[];
}

// ── Schema Registry ───────────────────────────────────────────────────────────

export const SYMPTOM_SCHEMAS: Record<SymptomId, SymptomSchema> = {
  abdominal_pain: composeSchema(
    'abdominal_pain', 'Abdominal Pain', 'Pain in the abdominal region',
    [CORE_SYMPTOM_FIELDS, PAIN_MIXIN, INFECTION_MIXIN, GI_MIXIN],
    ['location', 'onset', 'severity'],
    ['location', 'onset', 'duration', 'character', 'severity', 'progression', 'temporalPattern', 'associatedSymptoms'],
  ),

  chest_pain: composeSchema(
    'chest_pain', 'Chest Pain', 'Pain or discomfort in the chest area',
    [CORE_SYMPTOM_FIELDS, PAIN_MIXIN, CARDIAC_MIXIN, RESPIRATORY_MIXIN],
    ['location', 'onset', 'severity'],
    ['location', 'onset', 'duration', 'character', 'severity', 'exertional', 'pleuritic', 'radiation', 'associatedSymptoms'],
  ),

  cough: composeSchema(
    'cough', 'Cough', 'Cough — duration, character, and associated features',
    [CORE_SYMPTOM_FIELDS, RESPIRATORY_MIXIN, INFECTION_MIXIN],
    ['duration', 'character'],
    ['duration', 'character', 'hemoptysis', 'sputumColour', 'associatedSymptoms'],
  ),

  fever: composeSchema(
    'fever', 'Fever', 'Fever — temperature, pattern, and associated features',
    [CORE_SYMPTOM_FIELDS, INFECTION_MIXIN],
    ['duration', 'pattern'],
    ['duration', 'pattern', 'highestTemp', 'rigors', 'sourceLocalisation'],
  ),

  dyspnea: composeSchema(
    'dyspnea', 'Shortness of Breath', 'Difficulty breathing or breathlessness',
    [CORE_SYMPTOM_FIELDS, RESPIRATORY_MIXIN, CARDIAC_MIXIN, DYSPNEA_SPECIFIC],
    ['onset', 'severity'],
    ['onset', 'severity', 'at_rest', 'orthopnea', 'PND', 'hemoptysis', 'associatedDistress'],
  ),

  nausea_vomiting: composeSchema(
    'nausea_vomiting', 'Nausea & Vomiting', 'Nausea and/or vomiting — frequency, character, triggers',
    [CORE_SYMPTOM_FIELDS, GI_MIXIN],
    ['frequency', 'bilious'],
    ['frequency', 'bilious', 'projectile', 'hematemesis', 'feculent'],
  ),

  diarrhea: composeSchema(
    'diarrhea', 'Diarrhoea', 'Diarrhoea — frequency, character, duration',
    [CORE_SYMPTOM_FIELDS, GI_MIXIN, INFECTION_MIXIN],
    ['duration', 'character'],
    ['duration', 'frequency', 'character', 'volume', 'nocturnal', 'associatedSymptoms'],
  ),

  constipation: {
    symptomId: 'constipation',
    label: 'Constipation',
    description: 'Constipation — frequency, consistency, associated symptoms',
    activatesRosSystems: ['gastrointestinal'],
    minimumForDDX: ['duration', 'frequency'],
    fields: [
      { id: 'present', label: 'Has constipation?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['constipat', 'hard stool', 'difficulty passing stool'] },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'select', options: ['acute', 'chronic', 'lifelong'], mandatory: true, phase: 'onset' },
      { id: 'frequency', label: 'How many bowel movements per week?', shortLabel: 'Frequency', type: 'select', options: ['less_than_1', '1-2', '3-5'], mandatory: true, phase: 'character' },
      { id: 'stoolConsistency', label: 'What is the stool consistency?', shortLabel: 'Consistency', type: 'select', options: ['hard_pellets', 'large_painful', 'ribbon_like', 'normal_with_straining'], mandatory: true, phase: 'character' },
      { id: 'straining', label: 'Do you need to strain to pass stool?', shortLabel: 'Straining?', type: 'boolean', mandatory: false, phase: 'character' },
      { id: 'incompleteEvacuation', label: 'Do you feel like you haven\'t fully emptied?', shortLabel: 'Incomplete?', type: 'boolean', mandatory: false, phase: 'character' },
      { id: 'bleeding', label: 'Is there blood with the stool?', shortLabel: 'Bleeding?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  dysphagia: {
    symptomId: 'dysphagia',
    label: 'Difficulty Swallowing',
    description: 'Dysphagia or odynophagia — difficulty or pain on swallowing',
    activatesRosSystems: ['gastrointestinal'],
    minimumForDDX: ['phase', 'foodType'],
    fields: [
      { id: 'present', label: 'Has difficulty swallowing?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['difficulty swallowing', 'dysphagia', 'food stuck'] },
      { id: 'phase', label: 'Where does the food get stuck?', shortLabel: 'Phase', type: 'select', options: ['throat/neck', 'chest', 'both'], mandatory: true, phase: 'location', clinicalGuide: 'Throat = oropharyngeal dysphagia. Chest = esophageal dysphagia.' },
      { id: 'foodType', label: 'What foods cause difficulty?', shortLabel: 'Food type', type: 'select', options: ['solids_only', 'liquids_only', 'both', 'intermittent_solids'], mandatory: true, phase: 'character' },
      { id: 'progression', label: 'Is it getting worse over time?', shortLabel: 'Progression', type: 'select', options: ['progressive', 'stable', 'intermittent', 'improving'], mandatory: true, phase: 'evolution', clinicalGuide: 'Progressive dysphagia for solids suggests stricture or malignancy' },
      { id: 'odynophagia', label: 'Is there pain when swallowing?', shortLabel: 'Painful?', type: 'boolean', mandatory: true, phase: 'character' },
      { id: 'associatedSymptoms', label: 'Associated symptoms?', shortLabel: 'Associated', type: 'multi_select', options: ['weight_loss', 'regurgitation', 'aspiration', 'choking', 'heartburn', 'hoarseness', 'neck_mass'], mandatory: false, phase: 'associated' },
    ],
  },

  gi_bleeding: {
    symptomId: 'gi_bleeding',
    label: 'GI Bleeding',
    description: 'Gastrointestinal bleeding — hematemesis, melena, or hematochezia',
    activatesRosSystems: ['gastrointestinal'],
    minimumForDDX: ['type', 'volume'],
    fields: [
      { id: 'present', label: 'Has GI bleeding?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['bleeding', 'blood in stool', 'blood in vomit', 'black stool'] },
      { id: 'type', label: 'What type of bleeding?', shortLabel: 'Type', type: 'select', options: ['vomiting_blood', 'black_tarry_stool', 'bright_red_per_rectum', 'occult', 'coffee_ground_vomit'], mandatory: true, phase: 'character', canBeFromCC: true, ccKeywords: ['vomiting blood', 'black stool', 'blood in stool', 'coffee ground'] },
      { id: 'volume', label: 'How much blood?', shortLabel: 'Volume', type: 'select', options: ['scanty', 'moderate', 'large_massive', 'unknown'], mandatory: true, phase: 'character' },
      { id: 'color', label: 'What colour is the blood?', shortLabel: 'Color', type: 'select', options: ['bright_red', 'dark_red', 'coffee_ground', 'black_tarry', 'maroon'], mandatory: true, phase: 'character' },
      { id: 'associated_pain', label: 'Is there associated abdominal pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'syncope', label: 'Did you feel faint or pass out?', shortLabel: 'Syncope?', type: 'boolean', mandatory: true, phase: 'context', clinicalGuide: 'Syncope with GI bleeding indicates significant haemodynamic compromise' },
    ],
  },

  jaundice: {
    symptomId: 'jaundice',
    label: 'Jaundice',
    description: 'Yellowing of the skin/eyes — duration, progression, associated features',
    activatesRosSystems: ['gastrointestinal'],
    minimumForDDX: ['duration', 'progression'],
    fields: [
      { id: 'present', label: 'Has jaundice?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['yellow', 'jaundice', 'yellow eyes'] },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'progression', label: 'Is it getting worse, better, or stable?', shortLabel: 'Progression', type: 'select', options: ['worsening', 'improving', 'stable', 'fluctuating'], mandatory: true, phase: 'evolution' },
      { id: 'itching', label: 'Is there itching?', shortLabel: 'Itching?', type: 'boolean', mandatory: false, phase: 'associated', clinicalGuide: 'Pruritus suggests cholestatic jaundice' },
      { id: 'darkUrine', label: 'Is the urine dark?', shortLabel: 'Dark urine?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'paleStools', label: 'Are the stools pale or clay-coloured?', shortLabel: 'Pale stool?', type: 'boolean', mandatory: false, phase: 'associated', clinicalGuide: 'Pale stools suggest obstructive jaundice' },
      { id: 'associated_pain', label: 'Is there abdominal pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  distension: {
    symptomId: 'distension',
    label: 'Abdominal Distension',
    description: 'Abdominal swelling or bloating',
    activatesRosSystems: ['gastrointestinal'],
    minimumForDDX: ['onset', 'site'],
    fields: [
      { id: 'present', label: 'Has abdominal distension?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['bloated', 'distended', 'swollen', 'big'] },
      { id: 'onset', label: 'How quickly did it develop?', shortLabel: 'Onset', type: 'select', options: ['sudden_hours', 'gradual_days', 'slow_weeks', 'intermittent'], mandatory: true, phase: 'onset' },
      { id: 'site', label: 'What part of the abdomen is most swollen?', shortLabel: 'Site', type: 'select', options: ['generalised', 'upper_abdomen', 'lower_abdomen', 'left_side', 'right_side', 'localised_mass'], mandatory: true, phase: 'location' },
      { id: 'progression', label: 'Is the swelling getting worse?', shortLabel: 'Progression', type: 'select', options: ['stable', 'progressive', 'intermittent', 'variable'], mandatory: true, phase: 'evolution' },
      { id: 'postprandial', label: 'Is it worse after eating?', shortLabel: 'Postprandial?', type: 'boolean', mandatory: false, phase: 'context' },
      { id: 'relievedByStoolGas', label: 'Does passing stool or gas relieve it?', shortLabel: 'Relieved by?', type: 'boolean', mandatory: false, phase: 'context' },
      { id: 'associated_pain', label: 'Is there associated abdominal pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  // ── Generic schemas for symptoms without specific structures ─────────

  headache: composeSchema(
    'headache', 'Headache', 'Head pain',
    [CORE_SYMPTOM_FIELDS, PAIN_MIXIN, NEUROLOGICAL_MIXIN],
    ['onset', 'severity'],
    ['onset', 'duration', 'severity', 'location', 'character', 'associatedSymptoms'],
  ),

  dizziness: {
    symptomId: 'dizziness',
    label: 'Dizziness',
    description: 'Feeling dizzy, lightheaded, or vertiginous',
    activatesRosSystems: ['neurological'],
    minimumForDDX: ['onset'],
    fields: [
      { id: 'present', label: 'Has dizziness?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'type', label: 'What kind of dizziness?', shortLabel: 'Type', type: 'select', options: ['spinning_vertigo', 'lightheaded', 'imbalance', 'floating'], mandatory: true, phase: 'character' },
      { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'positional'], mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long does it last?', shortLabel: 'Duration', type: 'select', options: ['seconds', 'minutes', 'hours', 'days', 'constant'], mandatory: true, phase: 'onset' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['nausea', 'vomiting', 'hearing_loss', 'tinnitus', 'headache', 'palpitations'], mandatory: false, phase: 'associated' },
    ],
  },

  syncope: {
    symptomId: 'syncope',
    label: 'Fainting / Loss of Consciousness',
    description: 'Transient loss of consciousness',
    activatesRosSystems: ['cardiovascular', 'neurological'],
    minimumForDDX: ['onset', 'duration'],
    fields: [
      { id: 'present', label: 'Has fainted or lost consciousness?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'onset', label: 'Did it happen suddenly or with warning?', shortLabel: 'Onset', type: 'select', options: ['sudden_no_warning', 'with_warning', 'after_standing'], mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long were you unconscious?', shortLabel: 'Duration', type: 'select', options: ['seconds', 'minutes', 'more_than_5_minutes', 'unknown'], mandatory: true, phase: 'onset' },
      { id: 'context', label: 'What were you doing when it happened?', shortLabel: 'Context', type: 'select', options: ['standing', 'sitting', 'exercise', 'emotional_stress', 'bathroom', 'unknown'], mandatory: false, phase: 'context' },
      { id: 'recovery', label: 'How did you feel after waking?', shortLabel: 'Recovery', type: 'select', options: ['immediately_normal', 'confused', 'headache', 'weak'], mandatory: false, phase: 'context' },
    ],
  },

  palpitations: {
    symptomId: 'palpitations',
    label: 'Palpitations',
    description: 'Awareness of heartbeat — racing, skipping, or fluttering',
    activatesRosSystems: ['cardiovascular'],
    minimumForDDX: ['onset', 'duration'],
    fields: [
      { id: 'present', label: 'Has palpitations?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'onset', label: 'Do they start suddenly or gradually?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual'], mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long do they last?', shortLabel: 'Duration', type: 'select', options: ['seconds', 'minutes', 'hours', 'constant'], mandatory: true, phase: 'onset' },
      { id: 'rateDuring', label: 'What is the heart rate during episodes?', shortLabel: 'Rate', type: 'select', options: ['fast', 'slow', 'irregular', 'skipped_beats', 'unknown'], mandatory: false, phase: 'character' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['chest_pain', 'dizziness', 'shortness_of_breath', 'sweating', 'syncope'], mandatory: false, phase: 'associated' },
    ],
  },

  dysuria: {
    symptomId: 'dysuria',
    label: 'Painful Urination',
    description: 'Pain or burning when passing urine',
    activatesRosSystems: ['genitourinary'],
    minimumForDDX: ['duration'],
    fields: [
      { id: 'present', label: 'Has painful urination?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['burning urine', 'pain passing urine', 'dysuria'] },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'frequency', label: 'Increased frequency?', shortLabel: 'Frequency', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'hematuria', label: 'Blood in urine?', shortLabel: 'Blood?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'flankPain', label: 'Flank pain?', shortLabel: 'Flank pain?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'discharge', label: 'Any discharge?', shortLabel: 'Discharge?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  rash: {
    symptomId: 'rash',
    label: 'Rash / Skin Lesion',
    description: 'Any skin rash, eruption, or lesion',
    activatesRosSystems: [],
    minimumForDDX: ['onset', 'location'],
    fields: [
      { id: 'present', label: 'Has a rash?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['rash', 'spots', 'blisters'] },
      { id: 'onset', label: 'When did it start?', shortLabel: 'Onset', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'location', label: 'Where is the rash?', shortLabel: 'Location', type: 'text', mandatory: true, phase: 'location' },
      { id: 'appearance', label: 'What does it look like?', shortLabel: 'Appearance', type: 'select', options: ['red_spots', 'blisters', 'raised', 'flat', 'scaly', 'purple', 'ulcer'], mandatory: false, phase: 'character' },
      { id: 'itchy', label: 'Is it itchy?', shortLabel: 'Itchy?', type: 'boolean', mandatory: false, phase: 'character' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['fever', 'joint_pain', 'swelling', 'headache'], mandatory: false, phase: 'associated' },
    ],
  },

  joint_pain: {
    symptomId: 'joint_pain',
    label: 'Joint Pain',
    description: 'Pain in one or more joints',
    activatesRosSystems: ['musculoskeletal'],
    minimumForDDX: ['duration', 'distribution'],
    fields: [
      { id: 'present', label: 'Has joint pain?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'distribution', label: 'Which joints?', shortLabel: 'Distribution', type: 'multi_select', options: ['hands', 'wrists', 'elbows', 'shoulders', 'hips', 'knees', 'ankles', 'feet', 'spine'], mandatory: true, phase: 'location' },
      { id: 'onsetType', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'migratory'], mandatory: false, phase: 'onset' },
      { id: 'symmetry', label: 'Is it on both sides?', shortLabel: 'Symmetric?', type: 'boolean', mandatory: false, phase: 'character' },
      { id: 'morningStiffness', label: 'Morning stiffness >30 min?', shortLabel: 'AM stiffness?', type: 'boolean', mandatory: false, phase: 'context' },
      { id: 'swelling', label: 'Any joint swelling?', shortLabel: 'Swelling?', type: 'boolean', mandatory: false, phase: 'character' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['fever', 'rash', 'eye_redness', 'mouth_ulcers', 'back_pain'], mandatory: false, phase: 'associated' },
    ],
  },

  seizure: {
    symptomId: 'seizure',
    label: 'Seizure / Fit',
    description: 'Convulsion, fit, or seizure episode',
    activatesRosSystems: ['neurological'],
    minimumForDDX: ['type', 'duration'],
    fields: [
      { id: 'present', label: 'Has had a seizure?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'type', label: 'What type of seizure?', shortLabel: 'Type', type: 'select', options: ['generalised_tonic_clonic', 'absence', 'focal', 'myoclonic', 'unknown'], mandatory: true, phase: 'character' },
      { id: 'duration', label: 'How long did the seizure last?', shortLabel: 'Duration', type: 'select', options: ['less_than_2_min', '2-5_min', 'more_than_5_min', 'unknown'], mandatory: true, phase: 'onset', clinicalGuide: 'Seizure >5 min is status epilepticus — emergency' },
      { id: 'feverAtTime', label: 'Was there fever at the time?', shortLabel: 'Fever?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'postIctal', label: 'Were they confused or sleepy afterwards?', shortLabel: 'Post-ictal?', type: 'boolean', mandatory: false, phase: 'context' },
      { id: 'frequency', label: 'How many times has this happened?', shortLabel: 'Frequency', type: 'select', options: ['first_time', 'rarely', 'monthly', 'weekly', 'daily'], mandatory: false, phase: 'evolution' },
      { id: 'onMedication', label: 'Are they on seizure medication?', shortLabel: 'On meds?', type: 'boolean', mandatory: false, phase: 'context' },
    ],
  },

  weight_loss: {
    symptomId: 'weight_loss',
    label: 'Weight Loss',
    description: 'Unintentional weight loss',
    activatesRosSystems: ['general'],
    minimumForDDX: ['amount', 'duration'],
    fields: [
      { id: 'present', label: 'Has unintentional weight loss?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'amount', label: 'How much weight lost?', shortLabel: 'Amount', type: 'text', mandatory: true, phase: 'character' },
      { id: 'duration', label: 'Over what period?', shortLabel: 'Period', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'appetite', label: 'How is the appetite?', shortLabel: 'Appetite', type: 'select', options: ['normal', 'increased', 'decreased', 'poor'], mandatory: false, phase: 'context' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['fever', 'night_sweats', 'cough', 'diarrhoea', 'abdominal_pain', 'fatigue'], mandatory: false, phase: 'associated' },
    ],
  },

  fatigue: {
    symptomId: 'fatigue',
    label: 'Fatigue',
    description: 'Generalised tiredness or lack of energy',
    activatesRosSystems: ['general'],
    minimumForDDX: ['duration'],
    fields: [
      { id: 'present', label: 'Has fatigue?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'severity', label: 'How severe?', shortLabel: 'Severity', type: 'select', options: ['mild', 'moderate', 'severe_bedridden'], mandatory: false, phase: 'character' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['weight_loss', 'fever', 'night_sweats', 'shortness_of_breath', 'pallor', 'bleeding'], mandatory: false, phase: 'associated' },
    ],
  },

  night_sweats: {
    symptomId: 'night_sweats',
    label: 'Night Sweats',
    description: 'Drenching sweats at night requiring change of clothes',
    activatesRosSystems: ['general'],
    minimumForDDX: ['frequency'],
    fields: [
      { id: 'present', label: 'Has night sweats?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'frequency', label: 'How often?', shortLabel: 'Frequency', type: 'select', options: ['occasional', 'most_nights', 'every_night'], mandatory: true, phase: 'character' },
      { id: 'severity', label: 'Do you need to change clothes?', shortLabel: 'Severity', type: 'boolean', mandatory: false, phase: 'character', clinicalGuide: 'Drenching sweats requiring clothing change are significant' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['fever', 'weight_loss', 'cough', 'fatigue'], mandatory: false, phase: 'associated' },
    ],
  },

  reduced_feeding: {
    symptomId: 'reduced_feeding',
    label: 'Reduced Feeding',
    description: 'Decreased oral intake in infants/children',
    activatesRosSystems: ['general', 'gastrointestinal'],
    minimumForDDX: ['duration'],
    fields: [
      { id: 'present', label: 'Has reduced feeding?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'severity', label: 'How much less than usual?', shortLabel: 'Severity', type: 'select', options: ['mild_25_percent', 'moderate_50_percent', 'severe_75_percent', 'refusing_all'], mandatory: true, phase: 'character' },
      { id: 'sweatingDuringFeeds', label: 'Sweating during feeds?', shortLabel: 'Sweating?', type: 'boolean', mandatory: false, phase: 'associated', clinicalGuide: 'Sweating during feeds suggests cardiac cause' },
      { id: 'vomitingAfterFeeds', label: 'Vomiting after feeds?', shortLabel: 'Vomiting?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  lethargy: {
    symptomId: 'lethargy',
    label: 'Lethargy',
    description: 'Decreased level of activity or alertness',
    activatesRosSystems: ['neurological', 'general'],
    minimumForDDX: ['duration', 'severity'],
    fields: [
      { id: 'present', label: 'Has lethargy?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'severity', label: 'How severe?', shortLabel: 'Severity', type: 'select', options: ['mild_less_active', 'moderate_difficult_to_rouse', 'severe_unrousable'], mandatory: true, phase: 'character', clinicalGuide: 'Lethargy is a red flag symptom — assess ABC immediately' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['fever', 'reduced_feeding', 'vomiting', 'rash', 'seizure', 'difficulty_breathing'], mandatory: false, phase: 'associated' },
    ],
  },

  cyanosis: {
    symptomId: 'cyanosis',
    label: 'Cyanosis',
    description: 'Blue/purple discolouration of skin or mucous membranes',
    activatesRosSystems: ['respiratory', 'cardiovascular'],
    minimumForDDX: ['context', 'location'],
    fields: [
      { id: 'present', label: 'Has cyanosis?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'context', label: 'When does it occur?', shortLabel: 'Context', type: 'select', options: ['at_rest', 'during_crying', 'during_feeding', 'during_coughing', 'intermittent'], mandatory: true, phase: 'context', clinicalGuide: 'Cyanosis at rest = emergency. Cyanosis with feeding suggests cardiac cause.' },
      { id: 'location', label: 'Where is the cyanosis?', shortLabel: 'Location', type: 'select', options: ['perioral', 'acral_extremities', 'generalised', 'lips_only'], mandatory: true, phase: 'location' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['difficulty_breathing', 'feeding_difficulty', 'lethargy', 'cough'], mandatory: false, phase: 'associated' },
    ],
  },

  stridor: {
    symptomId: 'stridor',
    label: 'Stridor',
    description: 'High-pitched breathing sound, usually on inspiration',
    activatesRosSystems: ['respiratory'],
    minimumForDDX: ['onset', 'severity'],
    fields: [
      { id: 'present', label: 'Has stridor?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'since_birth'], mandatory: true, phase: 'onset', clinicalGuide: 'Sudden onset = foreign body until proven otherwise' },
      { id: 'severity', label: 'How severe?', shortLabel: 'Severity', type: 'select', options: ['mild_only_agitated', 'moderate_at_rest', 'severe_with_distress', 'critical_exhaustion'], mandatory: true, phase: 'character' },
      { id: 'phase', label: 'Inspiratory or expiratory?', shortLabel: 'Phase', type: 'select', options: ['inspiratory', 'expiratory', 'biphasic'], mandatory: false, phase: 'character', clinicalGuide: 'Inspiratory = supraglottic. Biphasic = glottic/subglottic. Expiratory = intrathoracic.' },
      { id: 'drooling', label: 'Is there drooling?', shortLabel: 'Drooling?', type: 'boolean', mandatory: false, phase: 'associated', clinicalGuide: 'Drooling + stridor = epiglottitis — do NOT examine throat' },
      { id: 'cough', label: 'Associated cough? What type?', shortLabel: 'Cough?', type: 'select', options: ['no_cough', 'barking_croup', 'mild_cough'], mandatory: false, phase: 'associated' },
    ],
  },

  // ── Placeholder schemas for remaining symptom IDs ──────────────────

  weakness: {
    symptomId: 'weakness',
    label: 'Weakness',
    description: 'Muscle weakness or paralysis',
    activatesRosSystems: ['neurological', 'musculoskeletal'],
    minimumForDDX: ['onset', 'distribution'],
    fields: [
      { id: 'present', label: 'Has weakness?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'progressive'], mandatory: true, phase: 'onset' },
      { id: 'distribution', label: 'Which body parts?', shortLabel: 'Distribution', type: 'multi_select', options: ['face', 'arm', 'leg', 'one_side', 'both_legs', 'all_limbs'], mandatory: true, phase: 'location' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['numbness', 'tingling', 'headache', 'vision_changes', 'speech_difficulty'], mandatory: false, phase: 'associated' },
    ],
  },

  numbness: {
    symptomId: 'numbness',
    label: 'Numbness',
    description: 'Loss of sensation or tingling',
    activatesRosSystems: ['neurological'],
    minimumForDDX: ['onset', 'distribution'],
    fields: [
      { id: 'present', label: 'Has numbness or tingling?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'progressive'], mandatory: true, phase: 'onset' },
      { id: 'distribution', label: 'Where?', shortLabel: 'Distribution', type: 'text', mandatory: true, phase: 'location' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['weakness', 'pain', 'vision_changes', 'dizziness'], mandatory: false, phase: 'associated' },
    ],
  },

  frequency: {
    symptomId: 'frequency',
    label: 'Urinary Frequency',
    description: 'Increased frequency of urination',
    activatesRosSystems: ['genitourinary'],
    minimumForDDX: ['duration'],
    fields: [
      { id: 'present', label: 'Has increased urinary frequency?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'dysuria', label: 'Pain with urination?', shortLabel: 'Dysuria?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'nocturia', label: 'Waking at night to urinate?', shortLabel: 'Nocturia?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'polydipsia', label: 'Increased thirst?', shortLabel: 'Thirst?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  hematuria: {
    symptomId: 'hematuria',
    label: 'Blood in Urine',
    description: 'Visible or microscopic blood in urine',
    activatesRosSystems: ['genitourinary'],
    minimumForDDX: ['duration', 'pain'],
    fields: [
      { id: 'present', label: 'Has blood in urine?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['blood in urine', 'red urine', 'hematuria'] },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'visible', label: 'Is the blood visible or only on testing?', shortLabel: 'Visible?', type: 'select', options: ['visible', 'microscopic', 'unknown'], mandatory: true, phase: 'character' },
      { id: 'pain', label: 'Is there associated pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'clots', label: 'Are there clots?', shortLabel: 'Clots?', type: 'boolean', mandatory: false, phase: 'character' },
    ],
  },

  vaginal_bleeding: {
    symptomId: 'vaginal_bleeding',
    label: 'Vaginal Bleeding',
    description: 'Abnormal vaginal bleeding',
    activatesRosSystems: ['genitourinary'],
    minimumForDDX: ['duration', 'volume'],
    fields: [
      { id: 'present', label: 'Has abnormal vaginal bleeding?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['vaginal bleeding', 'bleeding per vagina', 'PV bleeding', 'spotting'] },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'volume', label: 'How heavy?', shortLabel: 'Volume', type: 'select', options: ['spotting', 'light', 'moderate', 'heavy', 'soaking_pads'], mandatory: true, phase: 'character' },
      { id: 'timing', label: 'In relation to menstrual cycle?', shortLabel: 'Timing', type: 'select', options: ['during_period', 'between_periods', 'post_menopausal', 'during_pregnancy', 'unknown'], mandatory: false, phase: 'character' },
      { id: 'pain', label: 'Associated pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'pregnant', label: 'Could you be pregnant?', shortLabel: 'Pregnant?', type: 'boolean', mandatory: false, phase: 'context', clinicalGuide: 'Any bleeding in pregnancy = rule out ectopic, miscarriage, placenta praevia' },
    ],
  },

  vaginal_discharge: {
    symptomId: 'vaginal_discharge',
    label: 'Vaginal Discharge',
    description: 'Abnormal vaginal discharge',
    activatesRosSystems: ['genitourinary'],
    minimumForDDX: ['color', 'odor'],
    fields: [
      { id: 'present', label: 'Has abnormal discharge?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset', canBeFromCC: true, ccKeywords: ['discharge', 'vaginal discharge', 'abnormal discharge'] },
      { id: 'color', label: 'What colour?', shortLabel: 'Color', type: 'select', options: ['clear', 'white', 'yellow', 'green', 'grey', 'blood_tinged'], mandatory: true, phase: 'character' },
      { id: 'consistency', label: 'What consistency?', shortLabel: 'Consistency', type: 'select', options: ['watery', 'thick', 'clumpy', 'frothy', 'mucoid'], mandatory: false, phase: 'character' },
      { id: 'odor', label: 'Any odour?', shortLabel: 'Odor', type: 'select', options: ['none', 'fishy', 'foul', 'yeasty'], mandatory: true, phase: 'character' },
      { id: 'itching', label: 'Is there itching?', shortLabel: 'Itching?', type: 'boolean', mandatory: false, phase: 'associated' },
      { id: 'burning', label: 'Is there burning?', shortLabel: 'Burning?', type: 'boolean', mandatory: false, phase: 'associated' },
    ],
  },

  back_pain: {
    symptomId: 'back_pain',
    label: 'Back Pain',
    description: 'Pain in the back, any region',
    activatesRosSystems: ['musculoskeletal'],
    minimumForDDX: ['onset', 'location'],
    fields: [
      { id: 'present', label: 'Has back pain?', shortLabel: 'Present?', type: 'boolean', mandatory: true, phase: 'onset' },
      { id: 'location', label: 'Where in the back?', shortLabel: 'Location', type: 'select', options: ['cervical', 'thoracic', 'lumbar', 'sacral', 'whole_back'], mandatory: true, phase: 'location' },
      { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'after_injury'], mandatory: true, phase: 'onset' },
      { id: 'duration', label: 'How long?', shortLabel: 'Duration', type: 'text', mandatory: true, phase: 'onset' },
      { id: 'radiation', label: 'Does it travel down the leg?', shortLabel: 'Radiation', type: 'select', options: ['none', 'buttock', 'leg_unilateral', 'leg_bilateral', 'groin'], mandatory: false, phase: 'location' },
      { id: 'associatedSymptoms', label: 'Associated?', shortLabel: 'Associated', type: 'multi_select', options: ['fever', 'numbness', 'weakness', 'bladder_dysfunction', 'weight_loss'], mandatory: false, phase: 'associated' },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getSymptomSchema(id: SymptomId): SymptomSchema {
  return SYMPTOM_SCHEMAS[id];
}

export function getMandatoryFields(id: SymptomId): string[] {
  return SYMPTOM_SCHEMAS[id]?.fields.filter(f => f.mandatory).map(f => f.id) ?? [];
}

export function getFieldsForPhase(id: SymptomId, phase: string): SymptomField[] {
  return SYMPTOM_SCHEMAS[id]?.fields.filter(f => f.phase === phase) ?? [];
}

export function getUnansweredFields(
  symptomId: SymptomId,
  answeredFieldIds: Set<string>,
  symptomData?: Record<string, any>
): SymptomField[] {
  const schema = SYMPTOM_SCHEMAS[symptomId];
  if (!schema) return [];
  return schema.fields.filter(f => {
    if (answeredFieldIds.has(f.id)) return false;
    if (f.dependsOn) {
      if (!answeredFieldIds.has(f.dependsOn.field)) return false;
      if (symptomData && symptomData[f.dependsOn.field] !== f.dependsOn.value) return false;
    }
    return true;
  });
}
