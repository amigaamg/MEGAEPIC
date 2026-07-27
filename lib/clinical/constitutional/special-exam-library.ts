// ─────────────────────────────────────────────────────────────────
// AMEXAN Special Examination Library
// Plug-and-play standard clinical tools: GCS, NIHSS, MMSE, Braden, etc.
// Each is a self-contained module with cards, scoring, documentation
// ─────────────────────────────────────────────────────────────────

export interface SpecialExamOption {
  value: string;
  label: string;
  score?: number;
  documentationPhrase?: string;
}

export interface SpecialExamCardDef {
  id: string;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options?: SpecialExamOption[];
  scoringWeight?: number;
  documentationTemplate: string;
  teachingNote?: string;
}

export interface SpecialExamModule {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  specialty: string[];
  contextTriggers: { complaints?: string[]; diseases?: string[]; modules?: string[]; ageBands?: string[] };
  cards: SpecialExamCardDef[];
  scoring: { type: 'sum' | 'weighted' | 'categorical'; maxScore: number; severityRanges?: { min: number; max: number; label: string; action?: string }[] };
  documentationGenerator: (scores: Record<string, number>, findings: Record<string, unknown>) => string;
  teachingNotes?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────
// GLASGOW COMA SCALE
// ─────────────────────────────────────────────────────────────────

export const GCS_MODULE: SpecialExamModule = {
  id: 'gcs',
  label: 'Glasgow Coma Scale',
  shortLabel: 'GCS',
  description: 'Standardised assessment of level of consciousness',
  specialty: ['emergency', 'neurology', 'neurosurgery', 'trauma', 'icu', 'general'],
  contextTriggers: { complaints: ['head_injury', 'unconscious', 'stroke', 'overdose', 'seizure'], diseases: ['head_injury', 'stroke', 'meningitis', 'encephalopathy', 'brain_tumour'], modules: ['neurology', 'neurosurgery', 'trauma', 'icu'] },
  cards: [
    { id: 'spec_gcs_eye', label: 'Eye Opening', question: 'Best eye opening response', type: 'single_select', options: [
      { value: 'spontaneous', label: 'Spontaneous', score: 4 },
      { value: 'to_speech', label: 'To speech', score: 3 },
      { value: 'to_pain', label: 'To pain', score: 2 },
      { value: 'none', label: 'None', score: 1 },
    ], documentationTemplate: 'Eyes open {value} (E{score})', scoringWeight: 1, teachingNote: 'Spontaneous eye opening does not indicate intact awareness.' },
    { id: 'spec_gcs_verbal', label: 'Verbal Response', question: 'Best verbal response', type: 'single_select', options: [
      { value: 'orientated', label: 'Orientated', score: 5 },
      { value: 'confused', label: 'Confused conversation', score: 4 },
      { value: 'inappropriate', label: 'Inappropriate words', score: 3 },
      { value: 'incomprehensible', label: 'Incomprehensible sounds', score: 2 },
      { value: 'none', label: 'None', score: 1 },
    ], documentationTemplate: 'Verbal response: {value} (V{score})', scoringWeight: 1, teachingNote: 'Intubation makes verbal assessment impossible — document as "V1 - intubated" or "V-t".' },
    { id: 'spec_gcs_motor', label: 'Motor Response', question: 'Best motor response', type: 'single_select', options: [
      { value: 'obeys_commands', label: 'Obeys commands', score: 6 },
      { value: 'localises_pain', label: 'Localises pain', score: 5 },
      { value: 'withdraws', label: 'Withdraws from pain', score: 4 },
      { value: 'abnormal_flexion', label: 'Abnormal flexion (decorticate)', score: 3 },
      { value: 'abnormal_extension', label: 'Abnormal extension (decerebrate)', score: 2 },
      { value: 'none', label: 'None (flaccid)', score: 1 },
    ], documentationTemplate: 'Motor response: {value} (M{score})', scoringWeight: 1, teachingNote: 'Localising pain is the best prognostic sign after head injury.' },
  ],
  scoring: { type: 'sum', maxScore: 15, severityRanges: [
    { min: 13, max: 15, label: 'Mild brain injury', action: 'Observation' },
    { min: 9, max: 12, label: 'Moderate brain injury', action: 'CT head, admit for observation' },
    { min: 3, max: 8, label: 'Severe brain injury', action: 'ICU admission, intubation strongly considered at GCS ≤8' },
  ]},
  documentationGenerator: (scores) => {
    const total = scores['spec_gcs_eye'] + scores['spec_gcs_verbal'] + scores['spec_gcs_motor'];
    const e = scores['spec_gcs_eye'] || 0;
    const v = scores['spec_gcs_verbal'] || 0;
    const m = scores['spec_gcs_motor'] || 0;
    const range = GCS_MODULE.scoring.severityRanges?.find(r => total >= r.min && total <= r.max);
    const sev = range ? range.label : 'Unable to assess';
    return `GCS ${total}/15 (E${e} V${v} M${m}) — ${sev}.`;
  },
  teachingNotes: {
    'spec_gcs_eye': 'Eye opening is the most basic arousal response. Absence does not equal brain death.',
    'spec_gcs_verbal': 'Confused conversation means the patient can speak in sentences but cannot answer questions correctly.',
    'spec_gcs_motor': 'Abnormal flexion (decorticate) suggests damage above the red nucleus. Abnormal extension (decerebrate) suggests damage below the red nucleus.',
  },
};

// ─────────────────────────────────────────────────────────────────
// NIH STROKE SCALE (abbreviated)
// ─────────────────────────────────────────────────────────────────

export const NIHSS_MODULE: SpecialExamModule = {
  id: 'nihss',
  label: 'NIH Stroke Scale',
  shortLabel: 'NIHSS',
  description: 'Quantitative measure of stroke-related neurological deficit',
  specialty: ['neurology', 'emergency', 'stroke'],
  contextTriggers: { complaints: ['stroke', 'facial_droop', 'arm_weakness', 'speech_difficulty'], diseases: ['stroke', 'tia', 'cva'], modules: ['neurology', 'stroke', 'emergency'] },
  cards: [
    { id: 'spec_nihss_consciousness', label: 'Level of Consciousness', question: 'Level of consciousness', type: 'single_select', options: [
      { value: 'alert', label: 'Alert (0)', score: 0 }, { value: 'drowsy', label: 'Drowsy (1)', score: 1 }, { value: 'obtunded', label: 'Obtunded (2)', score: 2 }, { value: 'coma', label: 'Coma (3)', score: 3 },
    ], documentationTemplate: 'LOC: {value}', scoringWeight: 1, teachingNote: 'NIHSS LOC assesses arousal, not content of thought.' },
    { id: 'spec_nihss_loca_questions', label: 'LOC Questions', question: 'Age and current month', type: 'single_select', options: [
      { value: 'both_correct', label: 'Both correct (0)', score: 0 }, { value: 'one_correct', label: 'One correct (1)', score: 1 }, { value: 'none_correct', label: 'None correct (2)', score: 2 },
    ], documentationTemplate: 'LOC questions: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_loc_commands', label: 'LOC Commands', question: 'Open/close eyes, make fist', type: 'single_select', options: [
      { value: 'both_correct', label: 'Both correct (0)', score: 0 }, { value: 'one_correct', label: 'One correct (1)', score: 1 }, { value: 'none_correct', label: 'None correct (2)', score: 2 },
    ], documentationTemplate: 'LOC commands: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_best_gaze', label: 'Best Gaze', question: 'Horizontal eye movements', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'partial_gaze_palsy', label: 'Partial gaze palsy (1)', score: 1 }, { value: 'forced_deviation', label: 'Forced deviation (2)', score: 2 },
    ], documentationTemplate: 'Gaze: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_visual', label: 'Visual Fields', question: 'Visual field testing by confrontation', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'partial_hemianopia', label: 'Partial hemianopia (1)', score: 1 }, { value: 'complete_hemianopia', label: 'Complete hemianopia (2)', score: 2 }, { value: 'bilateral_hemianopia', label: 'Bilateral (3)', score: 3 },
    ], documentationTemplate: 'Visual fields: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_facial_palsy', label: 'Facial Palsy', question: 'Facial movement', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'minor', label: 'Minor (1)', score: 1 }, { value: 'partial', label: 'Partial (2)', score: 2 }, { value: 'complete', label: 'Complete (3)', score: 3 },
    ], documentationTemplate: 'Facial palsy: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_motor_arm_l', label: 'Motor Arm - Left', question: 'Left arm strength', type: 'single_select', options: [
      { value: 'no_drift', label: 'No drift (0)', score: 0 }, { value: 'drift', label: 'Drift (1)', score: 1 }, { value: 'some_effort', label: 'Some effort vs gravity (2)', score: 2 }, { value: 'no_effort', label: 'No effort vs gravity (3)', score: 3 }, { value: 'no_movement', label: 'No movement (4)', score: 4 },
    ], documentationTemplate: 'Left arm motor: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_motor_arm_r', label: 'Motor Arm - Right', question: 'Right arm strength', type: 'single_select', options: [
      { value: 'no_drift', label: 'No drift (0)', score: 0 }, { value: 'drift', label: 'Drift (1)', score: 1 }, { value: 'some_effort', label: 'Some effort vs gravity (2)', score: 2 }, { value: 'no_effort', label: 'No effort vs gravity (3)', score: 3 }, { value: 'no_movement', label: 'No movement (4)', score: 4 },
    ], documentationTemplate: 'Right arm motor: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_motor_leg_l', label: 'Motor Leg - Left', question: 'Left leg strength', type: 'single_select', options: [
      { value: 'no_drift', label: 'No drift (0)', score: 0 }, { value: 'drift', label: 'Drift (1)', score: 1 }, { value: 'some_effort', label: 'Some effort vs gravity (2)', score: 2 }, { value: 'no_effort', label: 'No effort vs gravity (3)', score: 3 }, { value: 'no_movement', label: 'No movement (4)', score: 4 },
    ], documentationTemplate: 'Left leg motor: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_motor_leg_r', label: 'Motor Leg - Right', question: 'Right leg strength', type: 'single_select', options: [
      { value: 'no_drift', label: 'No drift (0)', score: 0 }, { value: 'drift', label: 'Drift (1)', score: 1 }, { value: 'some_effort', label: 'Some effort vs gravity (2)', score: 2 }, { value: 'no_effort', label: 'No effort vs gravity (3)', score: 3 }, { value: 'no_movement', label: 'No movement (4)', score: 4 },
    ], documentationTemplate: 'Right leg motor: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_ataxia', label: 'Limb Ataxia', question: 'Finger-nose, heel-shin', type: 'single_select', options: [
      { value: 'absent', label: 'Absent (0)', score: 0 }, { value: 'present_one_limb', label: 'Present in 1 limb (1)', score: 1 }, { value: 'present_two_limbs', label: 'Present in 2 limbs (2)', score: 2 },
    ], documentationTemplate: 'Ataxia: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_sensory', label: 'Sensory', question: 'Sensation to pinprick', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'partial_loss', label: 'Partial loss (1)', score: 1 }, { value: 'severe_loss', label: 'Severe loss (2)', score: 2 },
    ], documentationTemplate: 'Sensory: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_best_language', label: 'Best Language', question: 'Describe picture, name objects, read sentences', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'mild_aphasia', label: 'Mild-moderate aphasia (1)', score: 1 }, { value: 'severe_aphasia', label: 'Severe aphasia (2)', score: 2 }, { value: 'mute', label: 'Mute/global aphasia (3)', score: 3 },
    ], documentationTemplate: 'Language: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_dysarthria', label: 'Dysarthria', question: 'Speech clarity', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'mild', label: 'Mild-moderate (1)', score: 1 }, { value: 'severe', label: 'Severe (2)', score: 2 },
    ], documentationTemplate: 'Dysarthria: {value}', scoringWeight: 1 },
    { id: 'spec_nihss_extinction', label: 'Extinction / Inattention', question: 'Sensory extinction or hemi-inattention', type: 'single_select', options: [
      { value: 'normal', label: 'Normal (0)', score: 0 }, { value: 'mild', label: 'Mild (1)', score: 1 }, { value: 'severe', label: 'Severe (2)', score: 2 },
    ], documentationTemplate: 'Extinction: {value}', scoringWeight: 1 },
  ],
  scoring: { type: 'sum', maxScore: 42, severityRanges: [
    { min: 0, max: 4, label: 'Minor stroke' }, { min: 5, max: 15, label: 'Moderate stroke' },
    { min: 16, max: 20, label: 'Moderate-severe stroke' }, { min: 21, max: 42, label: 'Severe stroke' },
  ]},
  documentationGenerator: (scores) => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const range = NIHSS_MODULE.scoring.severityRanges?.find(r => total >= r.min && total <= r.max);
    return `NIHSS Score: ${total}/42 — ${range ? range.label : 'Unable to assess'}.`;
  },
};

// ─────────────────────────────────────────────────────────────────
// MINI-MENTAL STATE EXAMINATION
// ─────────────────────────────────────────────────────────────────

export const MMSE_MODULE: SpecialExamModule = {
  id: 'mmse',
  label: 'Mini-Mental State Examination',
  shortLabel: 'MMSE',
  description: 'Standardised cognitive function screening',
  specialty: ['neurology', 'psychiatry', 'geriatrics', 'general'],
  contextTriggers: { complaints: ['memory_loss', 'cognitive_decline', 'confusion', 'dementia'], diseases: ['dementia', 'alzheimers', 'cognitive_impairment', 'delirium'], modules: ['neurology', 'psychiatry', 'geriatrics'], ageBands: ['elderly'] },
  cards: [
    { id: 'spec_mmse_orientation_time', label: 'Orientation - Time', question: 'Year, season, date, day, month (5 points)', type: 'numeric', documentationTemplate: 'Time orientation: {value}/5', scoringWeight: 1, teachingNote: 'Each correct answer = 1 point. Ask: What is the year? Season? Date? Day? Month?' },
    { id: 'spec_mmse_orientation_place', label: 'Orientation - Place', question: 'Country, county, town, hospital, floor (5 points)', type: 'numeric', documentationTemplate: 'Place orientation: {value}/5', scoringWeight: 1, teachingNote: 'Ask: Where are we? Country, county/city, town, hospital/clinic, floor/ward.' },
    { id: 'spec_mmse_registration', label: 'Registration', question: 'Name 3 objects, ask to repeat (1 point per object)', type: 'numeric', documentationTemplate: 'Registration: {value}/3', scoringWeight: 1 },
    { id: 'spec_mmse_attention', label: 'Attention & Calculation', question: 'Serial 7s or spell WORLD backwards (5 points)', type: 'numeric', documentationTemplate: 'Attention: {value}/5', scoringWeight: 1, teachingNote: 'Serial 7 subtraction: 100-7=93, 93-7=86, etc. One point per correct subtraction.' },
    { id: 'spec_mmse_recall', label: 'Recall', question: 'Recall 3 objects from registration (1 point each)', type: 'numeric', documentationTemplate: 'Recall: {value}/3', scoringWeight: 1 },
    { id: 'spec_mmse_naming', label: 'Naming', question: 'Name pencil and watch (2 points)', type: 'numeric', documentationTemplate: 'Naming: {value}/2', scoringWeight: 1 },
    { id: 'spec_mmse_repetition', label: 'Repetition', question: 'Repeat "no ifs, ands, or buts" (1 point)', type: 'boolean', options: [{ value: 'correct', label: 'Correct (1)', score: 1 }, { value: 'incorrect', label: 'Incorrect (0)', score: 0 }], documentationTemplate: 'Repetition: {value}', scoringWeight: 1 },
    { id: 'spec_mmse_3stage', label: '3-Stage Command', question: 'Take paper, fold in half, put on floor (3 points)', type: 'numeric', documentationTemplate: '3-stage command: {value}/3', scoringWeight: 1 },
    { id: 'spec_mmse_reading', label: 'Reading', question: 'Read and obey "Close your eyes" (1 point)', type: 'boolean', options: [{ value: 'correct', label: 'Correct (1)', score: 1 }, { value: 'incorrect', label: 'Incorrect (0)', score: 0 }], documentationTemplate: 'Reading: {value}', scoringWeight: 1 },
    { id: 'spec_mmse_writing', label: 'Writing', question: 'Write a sentence (1 point)', type: 'boolean', options: [{ value: 'correct', label: 'Correct (1)', score: 1 }, { value: 'incorrect', label: 'Incorrect (0)', score: 0 }], documentationTemplate: 'Writing: {value}', scoringWeight: 1 },
    { id: 'spec_mmse_construction', label: 'Construction', question: 'Copy intersecting pentagons (1 point)', type: 'boolean', options: [{ value: 'correct', label: 'Correct (1)', score: 1 }, { value: 'incorrect', label: 'Incorrect (0)', score: 0 }], documentationTemplate: 'Construction: {value}', scoringWeight: 1 },
  ],
  scoring: { type: 'sum', maxScore: 30, severityRanges: [
    { min: 24, max: 30, label: 'Normal cognition' }, { min: 18, max: 23, label: 'Mild cognitive impairment' },
    { min: 10, max: 17, label: 'Moderate cognitive impairment' }, { min: 0, max: 9, label: 'Severe cognitive impairment' },
  ]},
  documentationGenerator: (scores) => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const range = MMSE_MODULE.scoring.severityRanges?.find(r => total >= r.min && total <= r.max);
    return `MMSE Score: ${total}/30 — ${range ? range.label : 'Unable to assess'}.`;
  },
};

// ─────────────────────────────────────────────────────────────────
// BRADEN SCALE (pressure ulcer risk)
// ─────────────────────────────────────────────────────────────────

export const BRADEN_MODULE: SpecialExamModule = {
  id: 'braden',
  label: 'Braden Scale for Pressure Ulcer Risk',
  shortLabel: 'Braden',
  description: 'Predicts pressure ulcer risk in hospitalised patients',
  specialty: ['nursing', 'geriatrics', 'icu', 'orthopaedics', 'general'],
  contextTriggers: { complaints: ['immobility', 'pressure_ulcer'], diseases: ['paralysis', 'spinal_cord_injury', 'hip_fracture', 'critical_illness'] },
  cards: [
    { id: 'spec_braden_sensory', label: 'Sensory Perception', question: 'Ability to respond to pressure-related discomfort', type: 'single_select', options: [
      { value: 'completely_limited', label: 'Completely limited (1)', score: 1 }, { value: 'very_limited', label: 'Very limited (2)', score: 2 },
      { value: 'slightly_limited', label: 'Slightly limited (3)', score: 3 }, { value: 'no_impairment', label: 'No impairment (4)', score: 4 },
    ], documentationTemplate: 'Sensory: {value}', scoringWeight: 1 },
    { id: 'spec_braden_moisture', label: 'Moisture', question: 'Degree of skin exposure to moisture', type: 'single_select', options: [
      { value: 'constantly_moist', label: 'Constantly moist (1)', score: 1 }, { value: 'very_moist', label: 'Very moist (2)', score: 2 },
      { value: 'occasionally_moist', label: 'Occasionally moist (3)', score: 3 }, { value: 'rarely_moist', label: 'Rarely moist (4)', score: 4 },
    ], documentationTemplate: 'Moisture: {value}', scoringWeight: 1 },
    { id: 'spec_braden_activity', label: 'Activity', question: 'Degree of physical activity', type: 'single_select', options: [
      { value: 'bedfast', label: 'Bedfast (1)', score: 1 }, { value: 'chairfast', label: 'Chairfast (2)', score: 2 },
      { value: 'walks_occasionally', label: 'Walks occasionally (3)', score: 3 }, { value: 'walks_frequently', label: 'Walks frequently (4)', score: 4 },
    ], documentationTemplate: 'Activity: {value}', scoringWeight: 1 },
    { id: 'spec_braden_mobility', label: 'Mobility', question: 'Ability to change body position', type: 'single_select', options: [
      { value: 'completely_immobile', label: 'Completely immobile (1)', score: 1 }, { value: 'very_limited', label: 'Very limited (2)', score: 2 },
      { value: 'slightly_limited', label: 'Slightly limited (3)', score: 3 }, { value: 'no_limitations', label: 'No limitations (4)', score: 4 },
    ], documentationTemplate: 'Mobility: {value}', scoringWeight: 1 },
    { id: 'spec_braden_nutrition', label: 'Nutrition', question: 'Usual food intake pattern', type: 'single_select', options: [
      { value: 'very_poor', label: 'Very poor (1)', score: 1 }, { value: 'probably_inadequate', label: 'Probably inadequate (2)', score: 2 },
      { value: 'adequate', label: 'Adequate (3)', score: 3 }, { value: 'excellent', label: 'Excellent (4)', score: 4 },
    ], documentationTemplate: 'Nutrition: {value}', scoringWeight: 1 },
    { id: 'spec_braden_friction', label: 'Friction & Shear', question: 'Friction and shear risk', type: 'single_select', options: [
      { value: 'problem', label: 'Problem (1)', score: 1 }, { value: 'potential_problem', label: 'Potential problem (2)', score: 2 },
      { value: 'no_apparent_problem', label: 'No apparent problem (3)', score: 3 },
    ], documentationTemplate: 'Friction/shear: {value}', scoringWeight: 1 },
  ],
  scoring: { type: 'sum', maxScore: 23, severityRanges: [
    { min: 19, max: 23, label: 'No risk' }, { min: 15, max: 18, label: 'Mild risk', action: 'Standard prevention' },
    { min: 13, max: 14, label: 'Moderate risk', action: 'Risk-based prevention' },
    { min: 10, max: 12, label: 'High risk', action: 'Aggressive prevention' },
    { min: 6, max: 9, label: 'Very high risk', action: 'Urgent prevention protocol' },
  ]},
  documentationGenerator: (scores) => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const range = BRADEN_MODULE.scoring.severityRanges?.find(r => total >= r.min && total <= r.max);
    return `Braden Score: ${total}/23 — ${range ? range.label : ''}. ${range?.action || ''}`;
  },
};

// ─────────────────────────────────────────────────────────────────
// LEOPOLD MANEUVERS (obstetric abdominal examination)
// ─────────────────────────────────────────────────────────────────

export const LEOPOLD_MODULE: SpecialExamModule = {
  id: 'leopold',
  label: 'Leopold Maneuvers',
  shortLabel: 'Leopold',
  description: 'Abdominal palpation to determine fetal lie, presentation, and position',
  specialty: ['obstetrics', 'midwifery'],
  contextTriggers: { complaints: ['pregnancy', 'labour', 'decreased_fetal_movements'], modules: ['obstetrics', 'maternity'], ageBands: ['adult', 'elderly'] },
  cards: [
    { id: 'spec_leopold_fundal', label: 'Fundal Grip', question: 'What is felt at the uterine fundus?', type: 'single_select', options: [
      { value: 'head', label: 'Head (smooth, firm, round)', documentationPhrase: 'head at fundus' },
      { value: 'breech', label: 'Breech (soft, irregular, broad)', documentationPhrase: 'breech at fundus' },
      { value: 'empty', label: 'Empty fundus (transverse lie)', documentationPhrase: 'fundus empty - transverse lie' },
      { value: 'unable_to_assess', label: 'Unable to assess', documentationPhrase: 'unable to assess fundal grip' },
    ], documentationTemplate: 'Fundal grip: {value}.', scoringWeight: 1, teachingNote: 'First Leopold maneuver. Face the patient. Palpate the fundus with both hands to determine which fetal pole occupies the fundus.' },
    { id: 'spec_leopold_lateral', label: 'Lateral/ Umbilical Grip', question: 'Where is the fetal back?', type: 'single_select', options: [
      { value: 'left', label: 'Left side (smooth, hard, curved)', documentationPhrase: 'fetal back on left side' },
      { value: 'right', label: 'Right side', documentationPhrase: 'fetal back on right side' },
      { value: 'anterior', label: 'Anterior', documentationPhrase: 'fetal back anterior' },
      { value: 'posterior', label: 'Posterior', documentationPhrase: 'fetal back posterior' },
      { value: 'unable', label: 'Unable to assess', documentationPhrase: 'unable to determine fetal back' },
    ], documentationTemplate: 'Lateral grip: fetal back on {value}.', scoringWeight: 1, teachingNote: 'Second Leopold maneuver. Palpate the abdomen with one hand while steadying with the other. The back feels smooth and firm; fetal limbs feel irregular.' },
    { id: 'spec_leopold_pawlik', label: 'Pawlik\'s Grip', question: 'What is the presenting part?', type: 'single_select', options: [
      { value: 'head_engaged', label: 'Head - engaged', documentationPhrase: 'head engaged in pelvis' },
      { value: 'head_not_engaged', label: 'Head - not engaged', documentationPhrase: 'head not engaged (ballotable)' },
      { value: 'breech', label: 'Breech', documentationPhrase: 'breech presentation' },
      { value: 'shoulder', label: 'Shoulder/transverse', documentationPhrase: 'shoulder presentation (transverse lie)' },
      { value: 'unable', label: 'Unable to assess', documentationPhrase: 'unable to determine presenting part' },
    ], documentationTemplate: 'Pawlik grip: {value}.', scoringWeight: 1, teachingNote: 'Third Leopold maneuver. Face the patient. Use thumb and fingers of the dominant hand to grasp the lower pole of the uterus above the symphysis.' },
    { id: 'spec_leopold_pelvic', label: 'Pelvic Grip', question: 'Is the head engaged? (Descent)', type: 'single_select', options: [
      { value: 'engaged', label: 'Engaged (5/5 palpable or less)', documentationPhrase: 'fetal head engaged' },
      { value: 'not_engaged', label: 'Not engaged (>5/5 palpable)', documentationPhrase: 'fetal head not engaged' },
      { value: 'n/a', label: 'N/A (breech/transverse)', documentationPhrase: 'engagement not applicable' },
    ], documentationTemplate: 'Pelvic grip: {value}.', scoringWeight: 1, teachingNote: 'Fourth Leopold maneuver. Face the feet. Slide hands down both sides of the uterus toward the pelvis. Determine the degree of engagement in fifths.' },
    { id: 'spec_leopold_fetal_heart', label: 'Fetal Heart Rate', question: 'Fetal heart rate auscultation', type: 'numeric', documentationTemplate: 'FHR: {value} bpm.', scoringWeight: 1, teachingNote: 'Normal FHR: 110-160 bpm. Use Pinard stethoscope or Doppler. Position depends on fetal back location.' },
  ],
  scoring: { type: 'categorical', maxScore: 0, severityRanges: [] },
  documentationGenerator: (_scores, findings) => {
    const fundal = findings['spec_leopold_fundal'] || 'not assessed';
    const lateral = findings['spec_leopold_lateral'] || 'not assessed';
    const pawlik = findings['spec_leopold_pawlik'] || 'not assessed';
    const pelvic = findings['spec_leopold_pelvic'] || 'not assessed';
    const fhr = findings['spec_leopold_fetal_heart'];
    const parts: string[] = [`Leopold maneuvers: Fundal grip reveals ${fundal}.`];
    if (lateral !== 'not assessed') parts.push(`Fetal back is on the ${lateral} side.`);
    parts.push(`Presenting part: ${pawlik}.`);
    if (pelvic !== 'n/a') parts.push(`Engagement: ${pelvic}.`);
    if (fhr) parts.push(`Fetal heart rate: ${fhr} bpm.`);
    return parts.join(' ');
  },
};

// ─────────────────────────────────────────────────────────────────
// REGISTRY - all special exams
// ─────────────────────────────────────────────────────────────────

export const SPECIAL_EXAM_REGISTRY: Record<string, SpecialExamModule> = {
  gcs: GCS_MODULE,
  nihss: NIHSS_MODULE,
  mmse: MMSE_MODULE,
  braden: BRADEN_MODULE,
  leopold: LEOPOLD_MODULE,
};

export function getSpecialExamsForContext(
  complaints: string[], diseases: string[], modules: string[], ageBand?: string,
): SpecialExamModule[] {
  return Object.values(SPECIAL_EXAM_REGISTRY).filter(mod => {
    const t = mod.contextTriggers;
    if (t.complaints && t.complaints.some(c => complaints.includes(c))) return true;
    if (t.diseases && t.diseases.some(d => diseases.includes(d))) return true;
    if (t.modules && t.modules.some(m => modules.includes(m))) return true;
    if (t.ageBands && ageBand && t.ageBands.includes(ageBand)) return true;
    return false;
  });
}

export function computeSpecialExamScore(module: SpecialExamModule, findings: Record<string, unknown>): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const card of module.cards) {
    const v = findings[card.id];
    if (v == null) continue;
    if (card.type === 'numeric') {
      scores[card.id] = Number(v) || 0;
    } else if (card.type === 'boolean') {
      const matched = card.options?.find(o => o.value === v);
      if (matched && matched.score != null) scores[card.id] = matched.score;
    } else if (card.type === 'single_select') {
      const matched = card.options?.find(o => o.value === v);
      if (matched && matched.score != null) scores[card.id] = matched.score;
    } else if (card.type === 'multi_select') {
      const vals = Array.isArray(v) ? v : [];
      const total = vals.reduce((sum, val) => {
        const opt = card.options?.find(o => o.value === val);
        return sum + (opt?.score || 0);
      }, 0);
      scores[card.id] = total;
    }
  }
  return scores;
}
