// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Schema Framework v2 — composable mixins with priority tiers
// ═══════════════════════════════════════════════════════════════════════════════
// Schemas are no longer monolithic. They are composed from mixins.
// Each field has an explicit priority tier.
// Demographic mixins auto-attach based on patient age/sex.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId } from './encounterState';

// ── Priority tiers — encodes clinical urgency of each question ──────────────

export type FieldPriority =
  | 'critical'   // Red flag — must ask NOW (e.g., pregnancy, haemoptysis)
  | 'high'       // Strong discriminator — ask before DDX (e.g., fever with pain)
  | 'medium'     // Standard field — completes the picture (e.g., character)
  | 'low';       // Refinement — nice to have (e.g., relieving factors)

// ── Extended field definition with priority ─────────────────────────────────

export type FieldType = 'boolean' | 'text' | 'select' | 'number' | 'multi_select';

export interface SymptomField {
  id: string;
  label: string;
  shortLabel: string;
  type: FieldType;
  options?: string[];
  mandatory: boolean;
  priority: FieldPriority;
  phase: 'onset' | 'location' | 'character' | 'evolution' | 'associated' | 'context';
  dependsOn?: { field: string; value: string | boolean };
  clinicalGuide?: string;
  canBeFromCC?: boolean;
  ccKeywords?: string[];
}

// ── Mixin — a reusable bundle of fields ─────────────────────────────────────

export interface SymptomMixin {
  id: string;
  label: string;
  fields: SymptomField[];
  activatesRosSystems: string[];
}

// ── Demographic mixin — auto-attached based on patient data ─────────────────

export interface DemographicMixin {
  id: string;
  label: string;
  applies: (state: EncounterState) => boolean;
  fields: SymptomField[];
  activatesRosSystems: string[];
}

// ── Core symptom fields — EVERY schema gets these ──────────────────────────

export const CORE_SYMPTOM_FIELDS: SymptomField[] = [
  { id: 'present', label: 'Has this symptom?', shortLabel: 'Present?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'onset' },
  { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'intermittent', 'since_birth'], mandatory: true, priority: 'high', phase: 'onset' },
  { id: 'duration', label: 'How long has it lasted?', shortLabel: 'Duration', type: 'text', mandatory: true, priority: 'high', phase: 'onset' },
  { id: 'chronicity', label: 'Is this acute or chronic?', shortLabel: 'Chronicity', type: 'select', options: ['acute_less_2_weeks', 'subacute_2_12_weeks', 'chronic_more_12_weeks'], mandatory: true, priority: 'medium', phase: 'onset' },
  { id: 'severity', label: 'How severe is it on a scale of 0-10?', shortLabel: 'Severity', type: 'number', mandatory: true, priority: 'high', phase: 'character' },
  { id: 'progression', label: 'Is it getting better, worse, or staying the same?', shortLabel: 'Progression', type: 'select', options: ['worsening', 'improving', 'stable', 'fluctuating', 'relapsing'], mandatory: true, priority: 'high', phase: 'evolution' },
  { id: 'timing', label: 'Is it constant or does it come and go?', shortLabel: 'Timing', type: 'select', options: ['constant', 'intermittent', 'nocturnal', 'morning', 'variable'], mandatory: true, priority: 'medium', phase: 'evolution' },
  { id: 'previousEpisodes', label: 'Has this happened before?', shortLabel: 'Previous?', type: 'boolean', mandatory: true, priority: 'medium', phase: 'context' },
  { id: 'triggers', label: 'What triggers or worsens it?', shortLabel: 'Triggers', type: 'multi_select', options: ['exercise', 'eating', 'lying_down', 'standing', 'cold_air', 'stress', 'specific_food', 'medication', 'nothing'], mandatory: false, priority: 'low', phase: 'context' },
  { id: 'relievingFactors', label: 'What makes it better?', shortLabel: 'Relieving', type: 'multi_select', options: ['rest', 'medication', 'position_change', 'heat', 'cold', 'passing_stool', 'passing_gas', 'nothing'], mandatory: false, priority: 'low', phase: 'context' },
  { id: 'impactOnDailyLife', label: 'How much does it affect daily activities?', shortLabel: 'Impact', type: 'select', options: ['none', 'mild', 'moderate', 'severe', 'unable_to_function'], mandatory: false, priority: 'low', phase: 'context' },
];

// ── Pain mixin — used by ALL pain symptoms ─────────────────────────────────

export const PAIN_MIXIN: SymptomMixin = {
  id: 'pain',
  label: 'Pain characteristics',
  activatesRosSystems: [],
  fields: [
    { id: 'location', label: 'Where is the pain?', shortLabel: 'Location', type: 'select', options: ['Upper abdomen', 'Lower abdomen', 'Chest', 'Head', 'Back', 'Limb', 'Pelvic', 'Generalised'], mandatory: true, priority: 'critical', phase: 'location' },
    { id: 'character', label: 'What does the pain feel like?', shortLabel: 'Character', type: 'select', options: ['sharp', 'dull', 'burning', 'cramping', 'colicky', 'tearing', 'pressure', 'stabbing', 'throbbing', 'aching'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'radiation', label: 'Does the pain spread anywhere?', shortLabel: 'Radiation', type: 'select', options: ['none', 'back', 'shoulder', 'groin', 'chest', 'jaw', 'arm', 'down_leg'], mandatory: false, priority: 'high', phase: 'location' },
    { id: 'aggravatingFactors', label: 'What makes the pain worse?', shortLabel: 'Aggravating', type: 'multi_select', options: ['movement', 'eating', 'coughing', 'breathing', 'lying_down', 'standing', 'palpation'], mandatory: false, priority: 'medium', phase: 'associated' },
  ],
};

// ── Infection mixin — for symptoms where infection is a consideration ───────

export const INFECTION_MIXIN: SymptomMixin = {
  id: 'infection',
  label: 'Infection screening',
  activatesRosSystems: ['general'],
  fields: [
    { id: 'fever', label: 'Is there a fever?', shortLabel: 'Fever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'rigors', label: 'Are there severe shaking chills (rigors)?', shortLabel: 'Rigors?', type: 'boolean', mandatory: false, priority: 'high', phase: 'character', clinicalGuide: 'Rigors suggest bacteraemia or malaria' },
    { id: 'weightLoss', label: 'Unintentional weight loss?', shortLabel: 'Weight loss?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
    { id: 'nightSweats', label: 'Drenching night sweats?', shortLabel: 'Night sweats?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
  ],
};

// ── Cardiac mixin — for chest pain, palpitations, dyspnea ──────────────────

export const CARDIAC_MIXIN: SymptomMixin = {
  id: 'cardiac',
  label: 'Cardiac screening',
  activatesRosSystems: ['cardiovascular'],
  fields: [
    { id: 'exertional', label: 'Does it come on with exercise or effort?', shortLabel: 'Exertional?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'pleuritic', label: 'Is it worse when you breathe in?', shortLabel: 'Pleuritic?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Pleuritic pain suggests pericarditis or pulmonary cause' },
    { id: 'associatedDyspnea', label: 'Associated shortness of breath?', shortLabel: 'SOB?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'associatedDiaphoresis', label: 'Associated sweating?', shortLabel: 'Sweating?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated', clinicalGuide: 'Diaphoresis with chest pain is a major MI predictor' },
    { id: 'associatedNausea', label: 'Associated nausea or vomiting?', shortLabel: 'Nausea?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated', clinicalGuide: 'Nausea with chest pain suggests inferior MI' },
    { id: 'associatedPalpitations', label: 'Associated palpitations?', shortLabel: 'Palpitations?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
    { id: 'orthopnea', label: 'Worse when lying flat?', shortLabel: 'Orthopnea?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context', clinicalGuide: 'Orthopnea suggests heart failure' },
  ],
};

// ── Respiratory mixin — for cough, dyspnea, stridor ────────────────────────

export const RESPIRATORY_MIXIN: SymptomMixin = {
  id: 'respiratory',
  label: 'Respiratory screening',
  activatesRosSystems: ['respiratory'],
  fields: [
    { id: 'associatedCough', label: 'Associated cough?', shortLabel: 'Cough?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedWheeze', label: 'Associated wheezing?', shortLabel: 'Wheeze?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedChestPain', label: 'Associated chest pain?', shortLabel: 'Chest pain?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedFever', label: 'Associated fever?', shortLabel: 'Fever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'nocturnal', label: 'Worse at night?', shortLabel: 'Nocturnal?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'evolution' },
    { id: 'exerciseTriggered', label: 'Triggered by exercise?', shortLabel: 'Exercise?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

// ── Gastrointestinal mixin — for abdominal symptoms ────────────────────────

export const GI_MIXIN: SymptomMixin = {
  id: 'gastrointestinal',
  label: 'GI screening',
  activatesRosSystems: ['gastrointestinal'],
  fields: [
    { id: 'associatedNausea', label: 'Associated nausea?', shortLabel: 'Nausea?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedVomiting', label: 'Associated vomiting?', shortLabel: 'Vomiting?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedDiarrhea', label: 'Associated diarrhoea?', shortLabel: 'Diarrhoea?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedConstipation', label: 'Associated constipation?', shortLabel: 'Constipation?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedBleeding', label: 'Any GI bleeding?', shortLabel: 'Bleeding?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'appetiteChange', label: 'Change in appetite?', shortLabel: 'Appetite', type: 'select', options: ['normal', 'increased', 'decreased', 'absent'], mandatory: false, priority: 'medium', phase: 'evolution' },
    { id: 'timingRelativeToMeals', label: 'How is it related to eating?', shortLabel: 'Meals', type: 'select', options: ['worse_after_eating', 'better_after_eating', 'no_relation', 'empty_stomach_worse'], mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

// ── Neurological mixin — for headache, dizziness, seizure ──────────────────

export const NEUROLOGICAL_MIXIN: SymptomMixin = {
  id: 'neurological',
  label: 'Neurological screening',
  activatesRosSystems: ['neurological'],
  fields: [
    { id: 'associatedHeadache', label: 'Associated headache?', shortLabel: 'Headache?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedDizziness', label: 'Associated dizziness?', shortLabel: 'Dizzy?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedVisualChanges', label: 'Any vision changes?', shortLabel: 'Vision?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedNumbness', label: 'Any numbness or tingling?', shortLabel: 'Numbness?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedWeakness', label: 'Any weakness?', shortLabel: 'Weakness?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedNeckStiffness', label: 'Neck stiffness?', shortLabel: 'Neck stiffness?', type: 'boolean', mandatory: false, priority: 'critical', phase: 'associated', clinicalGuide: 'Neck stiffness + headache/fever = meningitis until proven otherwise' },
    { id: 'associatedPhotophobia', label: 'Sensitivity to light?', shortLabel: 'Photophobia?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
  ],
};

// ── Abdominal-specific fields (beyond pain + GI) ───────────────────────────

export const ABDOMINAL_SPECIFIC: SymptomMixin = {
  id: 'abdominal_specific',
  label: 'Abdominal-specific',
  activatesRosSystems: ['genitourinary'],
  fields: [
    { id: 'migration', label: 'Has the pain moved from its starting location?', shortLabel: 'Migration?', type: 'boolean', mandatory: false, priority: 'high', phase: 'location', clinicalGuide: 'RLQ migration from periumbilical = appendicitis' },
    { id: 'associatedDysuria', label: 'Associated painful urination?', shortLabel: 'Dysuria?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated' },
    { id: 'associatedUrinaryFrequency', label: 'Increased urinary frequency?', shortLabel: 'Frequency?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
    { id: 'stoolChange', label: 'Change in bowel habit?', shortLabel: 'Stool change', type: 'select', options: ['normal', 'constipated', 'diarrhoea', 'blood_in_stool', 'mucous', 'ribbon_stool'], mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'menstrualLink', label: 'Related to menstrual cycle?', shortLabel: 'Menstrual?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context' },
  ],
};

// ── Chest-specific fields (beyond pain + cardiac) ──────────────────────────

export const CHEST_SPECIFIC: SymptomMixin = {
  id: 'chest_specific',
  label: 'Chest-specific',
  activatesRosSystems: [],
  fields: [
    { id: 'positional', label: 'Is it worse in any position?', shortLabel: 'Positional?', type: 'select', options: ['lying_flat', 'leaning_forward', 'left_side', 'none'], mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'trauma', label: 'Any recent injury to the chest?', shortLabel: 'Trauma?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

// ── Cough-specific fields (beyond core + respiratory) ───────────────────────

export const COUGH_SPECIFIC: SymptomMixin = {
  id: 'cough_specific',
  label: 'Cough details',
  activatesRosSystems: [],
  fields: [
    { id: 'character', label: 'What kind of cough?', shortLabel: 'Character', type: 'select', options: ['dry', 'productive', 'barking', 'paroxysmal', 'whooping'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'sputumColor', label: 'What colour is the sputum?', shortLabel: 'Sputum', type: 'select', options: ['clear', 'white', 'yellow', 'green', 'rust', 'blood_tinged'], mandatory: false, priority: 'medium', phase: 'character', dependsOn: { field: 'character', value: 'productive' } },
    { id: 'sputumVolume', label: 'How much sputum?', shortLabel: 'Volume', type: 'select', options: ['scanty', 'moderate', 'large', 'massive'], mandatory: false, priority: 'low', phase: 'character', dependsOn: { field: 'character', value: 'productive' } },
    { id: 'hemoptysis', label: 'Is there blood in the sputum?', shortLabel: 'Blood?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'character' },
    { id: 'postTussiveVomiting', label: 'Does coughing cause vomiting?', shortLabel: 'Post-tussive vomiting?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated', clinicalGuide: 'Post-tussive vomiting is classic for pertussis' },
  ],
};

// ── Fever-specific fields (beyond core + infection) ─────────────────────────

export const FEVER_SPECIFIC: SymptomMixin = {
  id: 'fever_specific',
  label: 'Fever details',
  activatesRosSystems: [],
  fields: [
    { id: 'pattern', label: 'What is the fever pattern?', shortLabel: 'Pattern', type: 'select', options: ['continuous', 'intermittent', 'remittent', 'relapsing', 'unknown'], mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Continuous: always above normal. Intermittent: spikes then normal. Remittent: fluctuates but never normal. Relapsing: fever-free periods between episodes.' },
    { id: 'highestTemp', label: 'What was the highest temperature measured? (°C)', shortLabel: 'Highest', type: 'number', mandatory: true, priority: 'high', phase: 'character' },
    { id: 'responseToAntipyretics', label: 'Does the fever respond to paracetamol/ibuprofen?', shortLabel: 'Response', type: 'select', options: ['good_response', 'partial_response', 'no_response', 'not_tried'], mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'sourceLocalized', label: 'Is there a clear source of infection?', shortLabel: 'Source?', type: 'select', options: ['respiratory', 'urinary', 'gastrointestinal', 'skin', 'unknown'], mandatory: true, priority: 'critical', phase: 'associated' },
  ],
};

// ── Seizure-specific fields (beyond core + neurological) ────────────────────

export const SEIZURE_SPECIFIC: SymptomMixin = {
  id: 'seizure_specific',
  label: 'Seizure details',
  activatesRosSystems: [],
  fields: [
    { id: 'type', label: 'What type of seizure?', shortLabel: 'Type', type: 'select', options: ['generalised_tonic_clonic', 'absence', 'focal', 'myoclonic', 'unknown'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'witnessAvailable', label: 'Was there a witness to the event?', shortLabel: 'Witness?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'aura', label: 'Did they notice anything unusual before it started?', shortLabel: 'Aura', type: 'select', options: ['none', 'visual', 'olfactory', 'epigastric', 'dizziness', 'fear', 'unknown'], mandatory: false, priority: 'high', phase: 'onset' },
    { id: 'tongueBiting', label: 'Did they bite their tongue?', shortLabel: 'Tongue bite?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Tongue biting strongly discriminates seizure from syncope' },
    { id: 'incontinence', label: 'Was there loss of bladder or bowel control?', shortLabel: 'Incontinence?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Incontinence during episode suggests seizure rather than syncope' },
    { id: 'injuryFromFall', label: 'Did they injure themselves from falling?', shortLabel: 'Injury?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
    { id: 'eyeDeviation', label: 'Did the eyes turn to one side?', shortLabel: 'Eye deviation', type: 'select', options: ['none', 'left', 'right', 'up', 'unknown'], mandatory: false, priority: 'medium', phase: 'character' },
    { id: 'bodyPartsInvolved', label: 'Which body parts were moving?', shortLabel: 'Body parts', type: 'multi_select', options: ['face', 'arm', 'leg', 'one_side', 'both_sides', 'whole_body'], mandatory: false, priority: 'medium', phase: 'character' },
    { id: 'postIctalDuration', label: 'How long were they confused or sleepy afterwards?', shortLabel: 'Post-ictal', type: 'select', options: ['none', 'less_5_minutes', '5_30_minutes', 'more_30_minutes', 'hours'], mandatory: true, priority: 'high', phase: 'evolution' },
    { id: 'frequency', label: 'How many times has this happened?', shortLabel: 'Frequency', type: 'select', options: ['first_time', 'rarely', 'monthly', 'weekly', 'daily'], mandatory: true, priority: 'high', phase: 'evolution' },
    { id: 'onMedication', label: 'Are they on seizure medication?', shortLabel: 'On meds?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
    { id: 'medicationAdherence', label: 'Do they take it as prescribed?', shortLabel: 'Adherence?', type: 'select', options: ['always', 'sometimes', 'rarely', 'not_prescribed'], mandatory: false, priority: 'medium', phase: 'context', dependsOn: { field: 'onMedication', value: true } },
  ],
};

// ── Headache-specific fields (beyond core + neurological) ───────────────────

export const HEADACHE_SPECIFIC: SymptomMixin = {
  id: 'headache_specific',
  label: 'Headache details',
  activatesRosSystems: [],
  fields: [
    { id: 'location', label: 'Where is the headache?', shortLabel: 'Location', type: 'select', options: ['frontal', 'temporal', 'occipital', 'generalised', 'unilateral', 'behind_eyes'], mandatory: true, priority: 'high', phase: 'location' },
    { id: 'character', label: 'What does it feel like?', shortLabel: 'Character', type: 'select', options: ['throbbing', 'pressure', 'stabbing', 'dull', 'band_like', 'burning'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'thunderclap', label: 'Did it reach maximum intensity instantly (within seconds)?', shortLabel: 'Thunderclap?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'onset', clinicalGuide: 'Thunderclap headache = subarachnoid haemorrhage until proven otherwise' },
    { id: 'worstOfLife', label: 'Is this the worst headache of your life?', shortLabel: 'Worst ever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'character' },
    { id: 'associatedNauseaVomiting', label: 'Associated nausea or vomiting?', shortLabel: 'Nausea?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedPhotophobia', label: 'Sensitivity to light?', shortLabel: 'Photophobia?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedPhonophobia', label: 'Sensitivity to sound?', shortLabel: 'Phonophobia?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'aura', label: 'Did you have any warning signs before the headache?', shortLabel: 'Aura', type: 'select', options: ['none', 'visual_flashing', 'visual_blind_spot', 'numbness', 'speech_difficulty', 'dizziness'], mandatory: false, priority: 'medium', phase: 'onset' },
    { id: 'positional', label: 'Is it worse when lying down or standing?', shortLabel: 'Positional', type: 'select', options: ['lying_worse', 'standing_worse', 'no_difference'], mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'neurologicalSymptoms', label: 'Any focal neurological symptoms?', shortLabel: 'Focal signs', type: 'multi_select', options: ['weakness', 'numbness', 'speech_difficulty', 'vision_loss', 'double_vision', 'dizziness', 'seizure'], mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'medicationOveruse', label: 'How often do you take painkillers for headaches?', shortLabel: 'Medication use', type: 'select', options: ['rarely', 'once_weekly', '2-3_times_weekly', 'daily'], mandatory: false, priority: 'medium', phase: 'context', clinicalGuide: 'Medication overuse headache is one of the most common causes of chronic daily headache' },
  ],
};

// ── Nausea/vomiting-specific fields ────────────────────────────────────────

export const VOMITING_SPECIFIC: SymptomMixin = {
  id: 'vomiting_specific',
  label: 'Vomiting details',
  activatesRosSystems: [],
  fields: [
    { id: 'frequency', label: 'How many times have they vomited in the last 24 hours?', shortLabel: 'Frequency', type: 'select', options: ['1-2', '3-5', '6-10', '10+', 'continuous'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'nauseaOnly', label: 'Is there nausea without vomiting?', shortLabel: 'Nausea only?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'character' },
    { id: 'color', label: 'What colour is the vomit?', shortLabel: 'Color', type: 'select', options: ['clear', 'food_particles', 'yellow_green_bilious', 'coffee_ground', 'bright_red', 'feculent'], mandatory: true, priority: 'critical', phase: 'character' },
    { id: 'projectile', label: 'Is it projectile?', shortLabel: 'Projectile?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'character', clinicalGuide: 'Projectile vomiting suggests pyloric stenosis in infants' },
    { id: 'associatedPain', label: 'Associated abdominal pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'reliefAfterVomiting', label: 'Does vomiting relieve the pain?', shortLabel: 'Relief?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'evolution' },
    { id: 'ableToKeepFluids', label: 'Can they keep down fluids?', shortLabel: 'Fluids?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'urineOutput', label: 'Is urine output normal?', shortLabel: 'Urine output', type: 'select', options: ['normal', 'reduced', 'none', 'unknown'], mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Reduced urine output = significant dehydration — urgent assessment needed' },
  ],
};

// ── Diarrhea-specific fields ───────────────────────────────────────────────

export const DIARRHEA_SPECIFIC: SymptomMixin = {
  id: 'diarrhea_specific',
  label: 'Diarrhoea details',
  activatesRosSystems: [],
  fields: [
    { id: 'frequency', label: 'How many times per day?', shortLabel: 'Frequency', type: 'select', options: ['3-5', '5-10', '10-20', '20+'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'character', label: 'What does the stool look like?', shortLabel: 'Character', type: 'select', options: ['watery', 'bloody', 'mucoid', 'fatty_greasy', 'rice_water', 'frothy'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'volume', label: 'How much per episode?', shortLabel: 'Volume', type: 'select', options: ['small', 'moderate', 'large', 'massive'], mandatory: true, priority: 'medium', phase: 'character' },
    { id: 'nocturnal', label: 'Does it wake you from sleep?', shortLabel: 'Nocturnal?', type: 'boolean', mandatory: true, priority: 'high', phase: 'evolution', clinicalGuide: 'Nocturnal diarrhoea suggests organic disease (IBD, not IBS)' },
    { id: 'tenesmus', label: 'Feeling of incomplete emptying?', shortLabel: 'Tenesmus?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
    { id: 'travelHistory', label: 'Recent travel?', shortLabel: 'Travel?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
    { id: 'similarIllnessContacts', label: 'Anyone else with similar symptoms?', shortLabel: 'Contacts?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context' },
    { id: 'antibioticUse', label: 'Recent antibiotic use?', shortLabel: 'Antibiotics?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context', clinicalGuide: 'Antibiotic-associated diarrhoea suggests C. difficile' },
    { id: 'foodHistory', label: 'Suspicious food in last 72 hours?', shortLabel: 'Food?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'dehydrationSigns', label: 'Signs of dehydration?', shortLabel: 'Dehydration', type: 'multi_select', options: ['thirst', 'reduced_urine', 'dry_mouth', 'sunken_eyes', 'lethargy', 'none'], mandatory: true, priority: 'critical', phase: 'associated' },
  ],
};

// ── Vaginal bleeding-specific fields ────────────────────────────────────────

export const VAGINAL_BLEEDING_SPECIFIC: SymptomMixin = {
  id: 'vaginal_bleeding_specific',
  label: 'Vaginal bleeding details',
  activatesRosSystems: [],
  fields: [
    { id: 'duration', label: 'How long has the bleeding lasted?', shortLabel: 'Duration', type: 'text', mandatory: true, priority: 'high', phase: 'onset' },
    { id: 'volume', label: 'How heavy is the bleeding?', shortLabel: 'Volume', type: 'select', options: ['spotting', 'light', 'moderate', 'heavy', 'soaking_pad_per_hour'], mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Soaking ≥1 pad per hour = haemorrhage — emergency' },
    { id: 'timing', label: 'When does the bleeding occur?', shortLabel: 'Timing', type: 'select', options: ['during_period', 'between_periods', 'post_coital', 'post_menopausal', 'during_pregnancy', 'unknown'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'passedTissue', label: 'Did you pass any tissue or clots?', shortLabel: 'Tissue?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'character', clinicalGuide: 'Passing tissue suggests miscarriage' },
    { id: 'associatedPain', label: 'Associated pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'painLocation', label: 'Where is the pain?', shortLabel: 'Pain location', type: 'select', options: ['central_lower', 'right_side', 'left_side', 'back', 'none'], mandatory: false, priority: 'high', phase: 'associated', dependsOn: { field: 'associatedPain', value: true } },
    { id: 'associatedSyncope', label: 'Did you feel faint or pass out?', shortLabel: 'Syncope?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Syncope + vaginal bleeding = ruptured ectopic until proven otherwise' },
    { id: 'sexualActivity', label: 'Are you sexually active?', shortLabel: 'Sexually active?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'contraception', label: 'Are you using contraception?', shortLabel: 'Contraception', type: 'select', options: ['none', 'pill', 'iud', 'implant', 'injection', 'condoms', 'sterilisation'], mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

// ── Dyspnea-specific fields (beyond core + respiratory) ────────────────────

export const DYSPNEA_SPECIFIC: SymptomMixin = {
  id: 'dyspnea_specific',
  label: 'Dyspnea details',
  activatesRosSystems: [],
  fields: [
    { id: 'atRest', label: 'Are you short of breath even at rest?', shortLabel: 'At rest?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'character', clinicalGuide: 'SOB at rest = severe distress — immediate assessment' },
    { id: 'onExertion', label: 'Do you get short of breath on exertion?', shortLabel: 'On exertion?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
    { id: 'orthopnea', label: 'Do you need to sit up to breathe?', shortLabel: 'Orthopnea?', type: 'select', options: ['none', 'one_pillow', 'two_pillow', 'three_pillow', 'chair_only'], mandatory: true, priority: 'critical', phase: 'context', clinicalGuide: 'Orthopnea = heart failure until proven otherwise' },
    { id: 'pnd', label: 'Do you wake up gasping for air at night?', shortLabel: 'PND?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'evolution', clinicalGuide: 'Paroxysmal nocturnal dyspnea = left heart failure' },
    { id: 'wheeze', label: 'Associated wheezing?', shortLabel: 'Wheeze?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedChestPain', label: 'Associated chest pain?', shortLabel: 'Chest pain?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Chest pain + dyspnea = high risk for PE or MI' },
    { id: 'associatedCough', label: 'Associated cough?', shortLabel: 'Cough?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'sputumProduction', label: 'Are you coughing up phlegm?', shortLabel: 'Sputum?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'character' },
    { id: 'hemoptysis', label: 'Any blood in sputum?', shortLabel: 'Hemoptysis?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'character' },
    { id: 'legSwelling', label: 'Any leg swelling?', shortLabel: 'Leg swelling?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated', clinicalGuide: 'Leg swelling + dyspnea = heart failure or PE' },
  ],
};

// ── Dizziness-specific fields (beyond core + neurological) ─────────────────

export const DIZZINESS_SPECIFIC: SymptomMixin = {
  id: 'dizziness_specific',
  label: 'Dizziness details',
  activatesRosSystems: ['neurological'],
  fields: [
    { id: 'character', label: 'What does the dizziness feel like?', shortLabel: 'Character', type: 'select', options: ['spinning_vertigo', 'lightheadedness', 'floating', 'imbalance', 'fainting_sensation'], mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'True vertigo = spinning; lightheadedness = presyncope or metabolic' },
    { id: 'onset', label: 'How did it start?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'positional', 'after_standing'], mandatory: true, priority: 'high', phase: 'onset' },
    { id: 'duration', label: 'How long do episodes last?', shortLabel: 'Duration', type: 'select', options: ['seconds', 'minutes', 'hours', 'days', 'constant'], mandatory: true, priority: 'high', phase: 'evolution' },
    { id: 'associatedVertigo', label: 'Does the room feel like it is spinning?', shortLabel: 'Vertigo?', type: 'boolean', mandatory: false, priority: 'high', phase: 'character' },
    { id: 'triggeredByPosition', label: 'Is it triggered by head movement?', shortLabel: 'Positional?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Positional vertigo = BPPV' },
    { id: 'associatedHearingLoss', label: 'Any hearing loss or ringing in the ears?', shortLabel: 'Hearing change?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
    { id: 'associatedPalpitations', label: 'Associated palpitations?', shortLabel: 'Palpitations?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated', clinicalGuide: 'Dizziness + palpitations = arrhythmia until proven otherwise' },
    { id: 'associatedChestPain', label: 'Associated chest pain?', shortLabel: 'Chest pain?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated' },
    { id: 'associatedNausea', label: 'Associated nausea or vomiting?', shortLabel: 'Nausea?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
  ],
};

// ── Syncope-specific fields (beyond core + neurological) ──────────────────

export const SYNCOPE_SPECIFIC: SymptomMixin = {
  id: 'syncope_specific',
  label: 'Syncope details',
  activatesRosSystems: ['cardiovascular'],
  fields: [
    { id: 'context', label: 'What were you doing when it happened?', shortLabel: 'Context', type: 'select', options: ['standing', 'sitting', 'lying_down', 'exercise', 'after_coughing', 'after_urinating', 'emotional_stress', 'unknown'], mandatory: true, priority: 'high', phase: 'onset', clinicalGuide: 'Exertional syncope = outflow obstruction (AS/HOCM) or arrhythmia' },
    { id: 'prodrome', label: 'Did you have any warning before passing out?', shortLabel: 'Prodrome', type: 'select', options: ['none', 'dizziness', 'nausea', 'sweating', 'visual_greyout', 'palpitations', 'chest_pain'], mandatory: true, priority: 'high', phase: 'onset', clinicalGuide: 'No prodrome = higher risk cardiac cause' },
    { id: 'durationUnconscious', label: 'How long were you unconscious?', shortLabel: 'Duration', type: 'select', options: ['seconds', 'less_5_minutes', 'more_5_minutes', 'unknown'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'recovery', label: 'How did you feel when you came round?', shortLabel: 'Recovery', type: 'select', options: ['immediate_normal', 'confused', 'headache', 'weak', 'chest_pain'], mandatory: true, priority: 'high', phase: 'evolution', clinicalGuide: 'Confusion after = seizure, not simple syncope' },
    { id: 'tongueBiting', label: 'Did you bite your tongue?', shortLabel: 'Tongue bite?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Tongue biting = seizure, not syncope' },
    { id: 'incontinence', label: 'Loss of bladder control?', shortLabel: 'Incontinence?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
    { id: 'associatedChestPain', label: 'Chest pain before or after?', shortLabel: 'Chest pain?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'associatedPalpitations', label: 'Palpitations before or after?', shortLabel: 'Palpitations?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'familySuddenDeath', label: 'Family history of sudden cardiac death?', shortLabel: 'Family SCD?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Family history of sudden death = inherited cardiac condition — urgent cardiology' },
    { id: 'injuryFromFall', label: 'Did you injure yourself in the fall?', shortLabel: 'Injury?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
  ],
};

// ── Palpitations-specific fields (beyond core + cardiac) ───────────────────

export const PALPITATIONS_SPECIFIC: SymptomMixin = {
  id: 'palpitations_specific',
  label: 'Palpitations details',
  activatesRosSystems: [],
  fields: [
    { id: 'onset', label: 'Do the palpitations start suddenly or gradually?', shortLabel: 'Onset', type: 'select', options: ['sudden', 'gradual', 'variable'], mandatory: true, priority: 'high', phase: 'onset', clinicalGuide: 'Sudden onset/offset = SVT/atrial flutter' },
    { id: 'offset', label: 'Do they stop suddenly or gradually?', shortLabel: 'Offset', type: 'select', options: ['sudden', 'gradual', 'variable'], mandatory: true, priority: 'high', phase: 'evolution' },
    { id: 'regularity', label: 'Are the palpitations regular or irregular?', shortLabel: 'Rhythm', type: 'select', options: ['regular', 'irregular', 'skipped_beats', 'unknown'], mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Irregularly irregular = atrial fibrillation' },
    { id: 'rate', label: 'How fast does your heart feel?', shortLabel: 'Rate', type: 'select', options: ['mildly_fast', 'very_fast', 'racing', 'unknown'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'duration', label: 'How long do they last?', shortLabel: 'Duration', type: 'select', options: ['seconds', 'minutes', 'hours', 'days', 'constant'], mandatory: true, priority: 'high', phase: 'evolution' },
    { id: 'associatedDizziness', label: 'Associated dizziness?', shortLabel: 'Dizzy?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'associatedSyncope', label: 'Did you pass out?', shortLabel: 'Syncope?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Palpitations + syncope = high risk arrhythmia' },
    { id: 'associatedChestPain', label: 'Associated chest pain?', shortLabel: 'Chest pain?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'associatedDyspnea', label: 'Associated shortness of breath?', shortLabel: 'SOB?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'triggers', label: 'What triggers them?', shortLabel: 'Triggers', type: 'multi_select', options: ['exercise', 'stress', 'caffeine', 'alcohol', 'sleep_deprivation', 'resting', 'none'], mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

// ── Rash-specific fields (beyond core) ────────────────────────────────────

export const RASH_SPECIFIC: SymptomMixin = {
  id: 'rash_specific',
  label: 'Rash details',
  activatesRosSystems: ['dermatological'],
  fields: [
    { id: 'location', label: 'Where on the body is the rash?', shortLabel: 'Location', type: 'multi_select', options: ['face', 'trunk', 'arms', 'legs', 'palms_soles', 'flexural', 'extensor', 'generalised'], mandatory: true, priority: 'high', phase: 'location' },
    { id: 'morphology', label: 'What does the rash look like?', shortLabel: 'Morphology', type: 'select', options: ['macules', 'papules', 'vesicles', 'bullae', 'pustules', 'wheals', 'petechiae', 'purpura', 'scaly', 'ulcer'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'distribution', label: 'How is it distributed?', shortLabel: 'Distribution', type: 'select', options: ['localised', 'widespread', 'symmetrical', 'asymmetrical', 'linear', 'dermatomal'], mandatory: true, priority: 'high', phase: 'location' },
    { id: 'pruritus', label: 'Is it itchy?', shortLabel: 'Itchy?', type: 'boolean', mandatory: true, priority: 'medium', phase: 'character' },
    { id: 'painful', label: 'Is it painful?', shortLabel: 'Painful?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Painful rash = consider herpes zoster before lesions appear' },
    { id: 'associatedFever', label: 'Associated fever?', shortLabel: 'Fever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Rash + fever = infectious cause until proven otherwise' },
    { id: 'rashOnset', label: 'When did the rash first appear relative to other symptoms?', shortLabel: 'Onset relative', type: 'select', options: ['before_fever', 'with_fever', 'after_fever', 'no_fever'], mandatory: false, priority: 'medium', phase: 'onset' },
    { id: 'mucosalInvolvement', label: 'Is there involvement of the mouth, eyes, or genitals?', shortLabel: 'Mucosal?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'location', clinicalGuide: 'Mucosal involvement = Stevens-Johnson syndrome — emergency' },
    { id: 'recentMedication', label: 'Any new medication in the last 4 weeks?', shortLabel: 'New med?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Drug eruption is one of the most common causes of rash' },
  ],
};

// ── Dysphagia-specific fields (beyond core + GI) ──────────────────────────

export const DYSPHAGIA_SPECIFIC: SymptomMixin = {
  id: 'dysphagia_specific',
  label: 'Dysphagia details',
  activatesRosSystems: [],
  fields: [
    { id: 'solidsLiquids', label: 'Difficulty with solids, liquids, or both?', shortLabel: 'Solids/liquids', type: 'select', options: ['solids_only', 'liquids_only', 'both', 'variable'], mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Solids only → mechanical obstruction. Both solids and liquids → motility disorder.' },
    { id: 'progressive', label: 'Is it getting worse over time?', shortLabel: 'Progressive?', type: 'boolean', mandatory: true, priority: 'high', phase: 'evolution', clinicalGuide: 'Progressive dysphagia = oesophageal cancer until proven otherwise' },
    { id: 'level', label: 'Where does it feel like food gets stuck?', shortLabel: 'Level', type: 'select', options: ['throat_neck', 'chest', 'lower_chest', 'epigastric', 'variable'], mandatory: true, priority: 'high', phase: 'location' },
    { id: 'associatedPain', label: 'Pain on swallowing?', shortLabel: 'Odynophagia?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated', clinicalGuide: 'Odynophagia = oesophagitis (infectious or reflux)' },
    { id: 'associatedHeartburn', label: 'Associated heartburn or regurgitation?', shortLabel: 'Heartburn?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
    { id: 'weightLoss', label: 'Unintentional weight loss?', shortLabel: 'Weight loss?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'choking', label: 'Do you cough or choke when swallowing?', shortLabel: 'Choking?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Choking = aspiration risk — urgent assessment' },
    { id: 'neurologicalSymptoms', label: 'Any weakness, slurred speech, or voice change?', shortLabel: 'Neuro symptoms?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Neurological dysphagia = CVA, MG, or ALS' },
  ],
};

// ── GI Bleeding-specific fields (beyond core + GI) ────────────────────────

export const GI_BLEEDING_SPECIFIC: SymptomMixin = {
  id: 'gi_bleeding_specific',
  label: 'GI bleeding details',
  activatesRosSystems: [],
  fields: [
    { id: 'bleedingType', label: 'What kind of bleeding?', shortLabel: 'Type', type: 'select', options: ['hematemesis', 'melena', 'hematochezia', 'occult', 'multiple'], mandatory: true, priority: 'critical', phase: 'character', clinicalGuide: 'Hematemesis = upper GI. Melena = upper GI. Hematochezia = lower GI unless massive upper GI.' },
    { id: 'volume', label: 'How much blood?', shortLabel: 'Volume', type: 'select', options: ['streaks_only', 'moderate', 'large', 'massive'], mandatory: true, priority: 'critical', phase: 'character' },
    { id: 'color', label: 'What colour is the blood?', shortLabel: 'Color', type: 'select', options: ['bright_red', 'dark_red', 'coffee_ground', 'black_tarry', 'maroon'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'syncope', label: 'Did you feel faint or pass out?', shortLabel: 'Syncope?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Syncope with GI bleed = haemorrhagic shock — emergency' },
    { id: 'associatedPain', label: 'Associated abdominal pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated' },
    { id: 'associatedVomiting', label: 'Was there vomiting before the bleeding?', shortLabel: 'Preceding vomiting?', type: 'boolean', mandatory: false, priority: 'high', phase: 'onset', clinicalGuide: 'Vomiting then bleeding = Mallory-Weiss tear' },
    { id: 'nsaidUse', label: 'Have you taken NSAIDs or aspirin recently?', shortLabel: 'NSAIDs?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
    { id: 'anticoagulantUse', label: 'Are you on blood thinners?', shortLabel: 'Anticoagulants?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'knownLiverDisease', label: 'Known liver disease?', shortLabel: 'Liver disease?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context', clinicalGuide: 'Liver disease + GI bleed = variceal bleed — mortality >20%' },
  ],
};

// ── Jaundice-specific fields (beyond core) ────────────────────────────────

export const JAUNDICE_SPECIFIC: SymptomMixin = {
  id: 'jaundice_specific',
  label: 'Jaundice details',
  activatesRosSystems: ['hepatobiliary'],
  fields: [
    { id: 'onset', label: 'How quickly did the jaundice develop?', shortLabel: 'Onset', type: 'select', options: ['acute_hours', 'acute_days', 'subacute', 'chronic', 'intermittent'], mandatory: true, priority: 'high', phase: 'onset', clinicalGuide: 'Acute onset = hepatitis or obstruction' },
    { id: 'itch', label: 'Is there itching (pruritus)?', shortLabel: 'Itch?', type: 'boolean', mandatory: true, priority: 'medium', phase: 'character', clinicalGuide: 'Pruritus = obstructive jaundice (cholestasis)' },
    { id: 'darkUrine', label: 'Is urine dark in colour?', shortLabel: 'Dark urine?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character' },
    { id: 'paleStool', label: 'Are stools pale or clay-coloured?', shortLabel: 'Pale stool?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Pale stools + dark urine = obstructive jaundice' },
    { id: 'associatedPain', label: 'Associated abdominal pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated', clinicalGuide: 'Painless jaundice = pancreatic cancer until proven otherwise' },
    { id: 'painLocation', label: 'Where is the pain?', shortLabel: 'Pain location', type: 'select', options: ['ruq', 'epigastric', 'diffuse', 'none'], mandatory: false, priority: 'medium', phase: 'associated', dependsOn: { field: 'associatedPain', value: true } },
    { id: 'associatedFever', label: 'Associated fever?', shortLabel: 'Fever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated', clinicalGuide: 'Fever + jaundice + RUQ pain = Charcot triad = cholangitis — emergency' },
    { id: 'weightLoss', label: 'Unintentional weight loss?', shortLabel: 'Weight loss?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'alcoholUse', label: 'Alcohol intake?', shortLabel: 'Alcohol?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
  ],
};

// ── Constipation-specific fields (beyond core + GI) ───────────────────────

export const CONSTIPATION_SPECIFIC: SymptomMixin = {
  id: 'constipation_specific',
  label: 'Constipation details',
  activatesRosSystems: [],
  fields: [
    { id: 'stoolFrequency', label: 'How often do you pass stool?', shortLabel: 'Frequency', type: 'select', options: ['daily', 'alternate_days', '2-3_times_week', 'once_week', 'less_than_weekly'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'stoolConsistency', label: 'What is the consistency?', shortLabel: 'Consistency', type: 'select', options: ['hard_pellets', 'lumpy', 'normal', 'difficult_to_pass'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'straining', label: 'Do you need to strain?', shortLabel: 'Straining?', type: 'boolean', mandatory: true, priority: 'medium', phase: 'character' },
    { id: 'sensationIncomplete', label: 'Feeling of incomplete emptying?', shortLabel: 'Incomplete?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'character' },
    { id: 'laxativeUse', label: 'Do you use laxatives?', shortLabel: 'Laxatives?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'bloodInStool', label: 'Any blood with stool?', shortLabel: 'Blood?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'weightLoss', label: 'Unintentional weight loss?', shortLabel: 'Weight loss?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'obstipation', label: 'Unable to pass gas or stool at all?', shortLabel: 'Obstipation?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'evolution', clinicalGuide: 'Obstipation = bowel obstruction — surgical emergency' },
  ],
};

// ── Weight loss-specific fields (beyond core) ─────────────────────────────

export const WEIGHT_LOSS_SPECIFIC: SymptomMixin = {
  id: 'weight_loss_specific',
  label: 'Weight loss details',
  activatesRosSystems: ['general'],
  fields: [
    { id: 'amount', label: 'How much weight have you lost?', shortLabel: 'Amount', type: 'text', mandatory: true, priority: 'high', phase: 'character' },
    { id: 'timeframe', label: 'Over what period?', shortLabel: 'Timeframe', type: 'select', options: ['1-2_weeks', '1_month', '2-3_months', '6_months', '1_year'], mandatory: true, priority: 'high', phase: 'evolution' },
    { id: 'intentional', label: 'Is the weight loss intentional?', shortLabel: 'Intentional?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character' },
    { id: 'appetite', label: 'Has your appetite changed?', shortLabel: 'Appetite', type: 'select', options: ['increased', 'decreased', 'normal', 'variable'], mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'associatedFever', label: 'Associated fever?', shortLabel: 'Fever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'nightSweats', label: 'Night sweats?', shortLabel: 'Night sweats?', type: 'boolean', mandatory: true, priority: 'high', phase: 'associated', clinicalGuide: 'Weight loss + night sweats = TB, lymphoma, or HIV' },
    { id: 'associatedPain', label: 'Any pain?', shortLabel: 'Pain?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
  ],
};

// ── Fatigue-specific fields (beyond core) ─────────────────────────────────

export const FATIGUE_SPECIFIC: SymptomMixin = {
  id: 'fatigue_specific',
  label: 'Fatigue details',
  activatesRosSystems: ['general'],
  fields: [
    { id: 'severity', label: 'How would you rate the fatigue?', shortLabel: 'Severity', type: 'select', options: ['mild', 'moderate', 'severe', 'exhausted_all_day'], mandatory: true, priority: 'high', phase: 'character' },
    { id: 'duration', label: 'How long has it lasted?', shortLabel: 'Duration', type: 'select', options: ['days', 'weeks', 'months', 'years'], mandatory: true, priority: 'high', phase: 'onset' },
    { id: 'pattern', label: 'Is the fatigue constant or does it come and go?', shortLabel: 'Pattern', type: 'select', options: ['constant', 'worse_evening', 'worse_morning', 'intermittent'], mandatory: true, priority: 'medium', phase: 'evolution' },
    { id: 'associatedSymptoms', label: 'Any other symptoms?', shortLabel: 'Other symptoms', type: 'multi_select', options: ['fever', 'weight_loss', 'night_sweats', 'joint_pain', 'muscle_weakness', 'headache', 'shortness_of_breath', 'palpitations', 'none'], mandatory: true, priority: 'high', phase: 'associated' },
    { id: 'sleepQuality', label: 'How is your sleep?', shortLabel: 'Sleep', type: 'select', options: ['good', 'difficulty_falling', 'waking_often', 'early_waking', 'unrefreshing'], mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'mood', label: 'Have you felt depressed or anxious?', shortLabel: 'Mood', type: 'boolean', mandatory: false, priority: 'medium', phase: 'associated' },
  ],
};

// ── Joint pain-specific fields (beyond core + pain) ───────────────────────

export const JOINT_PAIN_SPECIFIC: SymptomMixin = {
  id: 'joint_pain_specific',
  label: 'Joint pain details',
  activatesRosSystems: ['musculoskeletal'],
  fields: [
    { id: 'jointsAffected', label: 'Which joints are affected?', shortLabel: 'Joints', type: 'multi_select', options: ['hands', 'wrists', 'elbows', 'shoulders', 'hips', 'knees', 'ankles', 'feet', 'spine'], mandatory: true, priority: 'high', phase: 'location' },
    { id: 'pattern', label: 'Is it symmetrical or asymmetrical?', shortLabel: 'Pattern', type: 'select', options: ['symmetrical', 'asymmetrical', 'migratory', 'single_joint'], mandatory: true, priority: 'high', phase: 'location', clinicalGuide: 'Symmetrical small joints = RA. Migratory = rheumatic fever. Single joint = septic or gout.' },
    { id: 'morningStiffness', label: 'Is there morning stiffness?', shortLabel: 'Morning stiffness?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character' },
    { id: 'morningStiffnessDuration', label: 'How long does morning stiffness last?', shortLabel: 'Stiffness duration', type: 'select', options: ['less_30_min', '30min_1hr', 'more_1hr'], mandatory: false, priority: 'medium', phase: 'character', dependsOn: { field: 'morningStiffness', value: true }, clinicalGuide: 'Morning stiffness >1 hour = inflammatory arthritis' },
    { id: 'swelling', label: 'Are the joints swollen?', shortLabel: 'Swelling?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character' },
    { id: 'redness', label: 'Are the joints red or warm?', shortLabel: 'Redness?', type: 'boolean', mandatory: true, priority: 'high', phase: 'character', clinicalGuide: 'Red, hot joint = septic arthritis or gout — emergency' },
    { id: 'associatedRash', label: 'Associated rash?', shortLabel: 'Rash?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated' },
    { id: 'associatedFever', label: 'Associated fever?', shortLabel: 'Fever?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'trauma', label: 'Any recent injury?', shortLabel: 'Trauma?', type: 'boolean', mandatory: true, priority: 'high', phase: 'context' },
  ],
};

// ── Demographic mixins — auto-attached based on patient data ───────────────

export const PREGNANCY_MIXIN: DemographicMixin = {
  id: 'pregnancy',
  label: 'Pregnancy screening',
  applies: (state) =>
    state.demographics.sex === 'female' &&
    state.demographics.ageMonths >= 144 && // ≥12 years
    state.demographics.ageMonths <= 660,   // ≤55 years
  activatesRosSystems: ['genitourinary'],
  fields: [
    { id: 'pregnant', label: 'Could you be pregnant?', shortLabel: 'Pregnant?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'LMP', label: 'When was your last menstrual period?', shortLabel: 'LMP', type: 'text', mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'gravidaPara', label: 'How many pregnancies and births? (G/P)', shortLabel: 'G/P', type: 'text', mandatory: false, priority: 'high', phase: 'context' },
    { id: 'breastfeeding', label: 'Are you currently breastfeeding?', shortLabel: 'Breastfeeding?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

export const PEDIATRIC_MIXIN: DemographicMixin = {
  id: 'pediatric',
  label: 'Paediatric screening',
  applies: (state) => state.demographics.ageMonths < 144, // <12 years
  activatesRosSystems: [],
  fields: [
    { id: 'reducedFeeding', label: 'Is the child feeding less than usual?', shortLabel: 'Feeding?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'urineOutput', label: 'Is urine output normal?', shortLabel: 'Urine?', type: 'select', options: ['normal', 'reduced', 'none_6_hours', 'unknown'], mandatory: true, priority: 'critical', phase: 'context' },
    { id: 'lethargy', label: 'Is the child unusually sleepy or difficult to wake?', shortLabel: 'Lethargy?', type: 'boolean', mandatory: true, priority: 'critical', phase: 'associated' },
    { id: 'cryingPattern', label: 'What is the crying pattern?', shortLabel: 'Crying', type: 'select', options: ['normal', 'high_pitched', 'inconsolable', 'weak', 'none'], mandatory: false, priority: 'high', phase: 'context', clinicalGuide: 'High-pitched or inconsolable crying suggests serious illness' },
    { id: 'sweatingDuringFeeds', label: 'Does the child sweat during feeding?', shortLabel: 'Sweating?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated', clinicalGuide: 'Sweating during feeds suggests cardiac cause' },
    { id: 'vomitingAfterFeeds', label: 'Does the child vomit after feeds?', shortLabel: 'Post-feed vomiting?', type: 'boolean', mandatory: false, priority: 'high', phase: 'associated' },
    { id: 'immunizationsUpToDate', label: 'Are immunizations up to date?', shortLabel: 'Immunizations?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
    { id: 'birthHistory', label: 'Was there any birth complication?', shortLabel: 'Birth history', type: 'select', options: ['normal', 'premature', 'low_birth_weight', 'birth_asphyxia', 'unknown'], mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

export const GERIATRIC_MIXIN: DemographicMixin = {
  id: 'geriatric',
  label: 'Geriatric screening',
  applies: (state) => state.demographics.ageMonths >= 720, // ≥60 years
  activatesRosSystems: [],
  fields: [
    { id: 'falls', label: 'Have you had any falls recently?', shortLabel: 'Falls?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context' },
    { id: 'functionalDecline', label: 'Any decline in ability to do daily activities?', shortLabel: 'Functional decline?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context' },
    { id: 'confusion', label: 'Any new confusion or memory problems?', shortLabel: 'Confusion?', type: 'boolean', mandatory: false, priority: 'high', phase: 'context' },
    { id: 'polypharmacy', label: 'Are you taking 5 or more medications?', shortLabel: 'Polypharmacy?', type: 'boolean', mandatory: false, priority: 'medium', phase: 'context' },
  ],
};

export const ALL_DEMOGRAPHIC_MIXINS: DemographicMixin[] = [
  PREGNANCY_MIXIN,
  PEDIATRIC_MIXIN,
  GERIATRIC_MIXIN,
];

export function getActiveDemographicMixins(state: EncounterState): DemographicMixin[] {
  return ALL_DEMOGRAPHIC_MIXINS.filter(m => m.applies(state));
}

// ── Schema factory — composes a schema from mixins ─────────────────────────

export interface ComposedSchema {
  symptomId: SymptomId;
  label: string;
  description: string;
  fields: SymptomField[];
  activatesRosSystems: string[];
  minimumForDDX: string[];
  /** Field IDs that must be answered before this schema is clinically complete */
  requiredForCompletion: string[];
}

export function composeSchema(
  symptomId: SymptomId,
  label: string,
  description: string,
  mixins: (SymptomMixin | SymptomField[])[],
  minimumForDDX: string[],
  requiredForCompletion: string[],
): ComposedSchema {
  const fieldMap = new Map<string, SymptomField>();
  const rosSystems = new Set<string>();

  for (const mixin of mixins) {
    const fields = Array.isArray(mixin) ? mixin : mixin.fields;
    for (const field of fields) {
      fieldMap.set(field.id, { ...field, priority: field.priority ?? 'medium' });
    }
    if (!Array.isArray(mixin)) {
      for (const sys of mixin.activatesRosSystems) {
        rosSystems.add(sys);
      }
    }
  }

  return {
    symptomId,
    label,
    description,
    fields: Array.from(fieldMap.values()),
    activatesRosSystems: Array.from(rosSystems),
    minimumForDDX,
    requiredForCompletion,
  };
}
