// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal Neurological Examination Engine (UNEE)
// Constitutional Volume — full structured CNS exam flow
// Follows Hutchison's, DeJong's, Macleod's, Talley & O'Connor,
// Bickerstaff & standard neurological examination texts
// ═══════════════════════════════════════════════════════════════

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type NeuroExamMode = 'complete' | 'medical' | 'emergency' | 'ward' | 'pediatric' | 'neonatal' | 'secondary';

export type NeuroSection =
  | 'preparation' | 'mental_status' | 'higher_cortical' | 'speech_language'
  | 'consciousness' | 'cranial_nerves' | 'motor_system' | 'reflexes'
  | 'sensory_system' | 'coordination' | 'gait' | 'meningeal_signs'
  | 'special_tests' | 'neonatal' | 'pediatric' | 'localization' | 'summary';

export interface NeuroContext {
  ageBand: AgeBand;
  sex: 'male' | 'female';
  pregnant: boolean;
  knownDiseases: string[];
  chiefComplaints: string[];
  activeModules: string[];
  findings: Record<string, unknown>;
}

export interface NeuroOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersCascade?: string;
  triggersFindings?: string[];
}

export interface NeuroEvidenceLink {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  documentationPhrase: string;
  localization?: string;
  investigation?: string;
}

export interface NeuroConditionalExpand {
  triggerValues: string[];
  expandCardIds: string[];
}

export interface NeuroCardDef {
  id: string;
  section: NeuroSection;
  sectionOrder: number;
  cardNumber: number;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: NeuroOption[];
  documentationTemplate: string;
  contextVisibility: {
    showForAgeBands?: AgeBand[];
    hideForAgeBands?: AgeBand[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    alwaysShow?: boolean;
    screeningMode?: boolean;
  };
  conditionalExpand?: NeuroConditionalExpand;
  evidenceLinks: NeuroEvidenceLink[];
}

// ─────────────────────────────────────────────────────────────────
// MODE DETECTION
// ─────────────────────────────────────────────────────────────────

export function detectNeurologicalMode(ctx: NeuroContext): NeuroExamMode {
  if (ctx.ageBand === 'neonate') return 'neonatal';
  if (['infant', 'toddler'].includes(ctx.ageBand)) return 'pediatric';

  const neuroModules = ['neurology', 'neurosurgery', 'neuro', 'stroke', 'neuromuscular'];
  const hasNeuroModule = ctx.activeModules.some(m =>
    neuroModules.includes(m.toLowerCase()),
  );
  if (hasNeuroModule) return 'complete';

  const completeKeywords = [
    'multiple_sclerosis', 'ms', 'myasthenia', 'mg', 'motor_neuron', 'als',
    'parkinsons', 'parkinsonism', 'dementia', 'alzheimers', 'neuropathy',
    'myopathy', 'brain_tumour', 'brain_tumor', 'gbc', 'guillain_barre',
    'transverse_myelitis', 'encephalitis', 'meningitis_encephalitis',
    'neurodegenerative',
  ];
  const hasCompleteDisease = ctx.knownDiseases.some(d =>
    completeKeywords.includes(d.toLowerCase()),
  );
  if (hasCompleteDisease) return 'complete';

  const emergencyKeywords = [
    'unconscious', 'collapse', 'gcs', 'decreased_consciousness',
    'stroke', 'cva', 'tia', 'transient_ischaemic_attack',
    'seizure', 'fit', 'epilepsy', 'head_injury', 'traumatic_brain_injury',
    'head_trauma', 'status_epilepticus', 'intracranial_haemorrhage',
    'subarachnoid', 'meningitis',
  ];
  const hasEmergency = ctx.chiefComplaints.some(c =>
    emergencyKeywords.some(k => c.toLowerCase().includes(k)),
  );
  if (hasEmergency) return 'emergency';

  const neuroComplaints = [
    'headache', 'dizziness', 'vertigo', 'numbness', 'tingling',
    'weakness', 'paralysis', 'facial_drop', 'facial_palsy',
    'difficulty_speaking', 'dysphasia', 'dysarthria',
    'difficulty_swallowing', 'dysphagia', 'loss_of_vision',
    'double_vision', 'diplopia', 'hearing_loss', 'tinnitus',
    'memory_loss', 'confusion', 'behaviour_change',
    'tremor', 'shaking', 'unsteadiness', 'ataxia',
    'fall', 'blackout', 'faint', 'loss_of_consciousness',
    'back_pain', 'limb_pain', 'sciatica',
    'developmental_delay', 'learning_difficulty',
  ];
  const hasNeuroComplaint = ctx.chiefComplaints.some(c =>
    neuroComplaints.some(k => c.toLowerCase().includes(k)),
  );
  if (hasNeuroComplaint) return 'medical';

  const medicalDiseases = [
    'stroke', 'cva', 'tia', 'epilepsy', 'parkinsons', 'dementia',
    'peripheral_neuropathy', 'migraine', 'headache', 'cerebral_palsy',
    'spinal_stenosis', 'prolapsed_disc', 'sciatica',
  ];
  const hasMedicalDisease = ctx.knownDiseases.some(d =>
    medicalDiseases.includes(d.toLowerCase()),
  );
  if (hasMedicalDisease) return 'medical';

  const medicalModules = ['general_medicine', 'geriatrics', 'rehabilitation', 'rheumatology'];
  const hasMedicalModule = ctx.activeModules.some(m =>
    medicalModules.includes(m.toLowerCase()),
  );
  if (hasMedicalModule) return 'medical';

  const neuroFindings = [
    'neuro_gcs', 'neuro_pupils', 'neuro_power', 'neuro_tone',
    'neuro_reflexes_plantar', 'neuro_speech',
  ];
  const hasNeuroFindings = neuroFindings.some(f => {
    const v = ctx.findings[f];
    return v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0);
  });
  if (hasNeuroFindings) return 'medical';

  if (ctx.ageBand === 'child' || ctx.ageBand === 'adolescent') return 'pediatric';

  return 'secondary';
}

// ─────────────────────────────────────────────────────────────────
// SECONDARY (SCREENING) CARDS — 6-card minimal neurological set
// ─────────────────────────────────────────────────────────────────

export const NEURO_SCREENING_CARDS: NeuroCardDef[] = [
  {
    id: 'scr_neuro_consciousness', section: 'consciousness', sectionOrder: 1, cardNumber: 1,
    label: 'Consciousness',
    question: 'Level of consciousness',
    type: 'single_select',
    options: [
      { value: 'alert', label: 'Alert and responsive', documentationPhrase: 'alert and responsive' },
      { value: 'drowsy', label: 'Drowsy / Confused', documentationPhrase: 'drowsy and confused' },
      { value: 'reduced', label: 'Reduced / Unresponsive', documentationPhrase: 'reduced level of consciousness' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['encephalopathy', 'stroke', 'seizure', 'head_injury'], weight: 0.5, documentationPhrase: 'abnormal consciousness' },
    ],
  },
  {
    id: 'scr_neuro_speech', section: 'speech_language', sectionOrder: 2, cardNumber: 2,
    label: 'Speech',
    question: 'Speech assessment',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal speech', documentationPhrase: 'speech is normal' },
      { value: 'dysarthria', label: 'Dysarthria (slurred)', documentationPhrase: 'speech is dysarthric' },
      { value: 'dysphasia', label: 'Dysphasia / Aphasia', documentationPhrase: 'speech is dysphasic' },
      { value: 'unable', label: 'Unable to assess', documentationPhrase: 'speech could not be assessed' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { disease: 'Stroke', localization: 'Dominant hemisphere', supportsDisease: ['stroke', 'tia', 'brain_tumour'], weight: 0.5, documentationPhrase: 'speech abnormality' },
    ],
  },
  {
    id: 'scr_neuro_pupils', section: 'cranial_nerves', sectionOrder: 3, cardNumber: 3,
    label: 'Pupils',
    question: 'Pupillary examination',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal (equal, reactive)', documentationPhrase: 'pupils are equal and reactive to light' },
      { value: 'abnormal', label: 'Abnormal', documentationPhrase: 'pupillary abnormality is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { localization: 'Midbrain', supportsDisease: ['brainstem_stroke', 'third_nerve_palsy', 'head_injury', 'raised_icp'], weight: 0.6, documentationPhrase: 'abnormal pupils' },
    ],
  },
  {
    id: 'scr_neuro_power', section: 'motor_system', sectionOrder: 4, cardNumber: 4,
    label: 'Limb Power',
    question: 'Limb power assessment',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Full power (5/5 all limbs)', documentationPhrase: 'power is normal (5/5) in all four limbs' },
      { value: 'reduced', label: 'Reduced power', documentationPhrase: 'reduced power in one or more limbs' },
      { value: 'unable', label: 'Unable to assess', documentationPhrase: 'power could not be assessed' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { localization: 'Corticospinal tract', supportsDisease: ['stroke', 'spinal_cord_lesion', 'neuropathy'], weight: 0.5, documentationPhrase: 'reduced power' },
    ],
  },
  {
    id: 'scr_neuro_tone', section: 'motor_system', sectionOrder: 5, cardNumber: 5,
    label: 'Tone',
    question: 'Muscle tone assessment',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal tone', documentationPhrase: 'tone is normal' },
      { value: 'increased', label: 'Increased (spastic/rigid)', documentationPhrase: 'tone is increased' },
      { value: 'decreased', label: 'Decreased (hypotonic)', documentationPhrase: 'tone is decreased' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { localization: 'UMN / Basal ganglia', supportsDisease: ['stroke', 'parkinsons', 'spinal_cord_lesion'], weight: 0.5, documentationPhrase: 'abnormal tone' },
    ],
  },
  {
    id: 'scr_neuro_plantar', section: 'reflexes', sectionOrder: 6, cardNumber: 6,
    label: 'Plantar Response',
    question: 'Plantar response (Babinski)',
    type: 'single_select',
    options: [
      { value: 'flexor', label: 'Flexor (normal)', documentationPhrase: 'plantars are flexor bilaterally' },
      { value: 'extensor', label: 'Extensor (upgoing / Babinski +)', documentationPhrase: 'plantars are extensor (upgoing)' },
      { value: 'equivocal', label: 'Equivocal / Unable', documentationPhrase: 'plantar response is equivocal or could not be assessed' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { localization: 'Corticospinal tract (UMN)', supportsDisease: ['stroke', 'spinal_cord_lesion', 'motor_neuron_disease'], weight: 0.7, documentationPhrase: 'extensor plantar response (Babinski positive)' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// SECTION ORDER MAPS PER MODE
// ─────────────────────────────────────────────────────────────────

export const NEURO_SECTION_ORDER_COMPLETE: NeuroSection[] = [
  'preparation', 'mental_status', 'higher_cortical', 'speech_language',
  'consciousness', 'cranial_nerves', 'motor_system', 'reflexes',
  'sensory_system', 'coordination', 'gait', 'meningeal_signs',
  'special_tests', 'localization', 'summary',
];

export const NEURO_SECTION_ORDER_MEDICAL: NeuroSection[] = [
  'mental_status', 'speech_language', 'cranial_nerves', 'motor_system',
  'reflexes', 'sensory_system', 'coordination', 'gait',
];

export const NEURO_SECTION_ORDER_EMERGENCY: NeuroSection[] = [
  'consciousness', 'cranial_nerves', 'motor_system', 'reflexes', 'localization',
];

export const NEURO_SECTION_ORDER_WARD: NeuroSection[] = [
  'consciousness', 'speech_language', 'motor_system', 'reflexes', 'cranial_nerves',
];

export const NEURO_SECTION_ORDER_PEDIATRIC: NeuroSection[] = [
  'preparation', 'mental_status', 'speech_language', 'cranial_nerves',
  'motor_system', 'reflexes', 'coordination', 'gait', 'pediatric',
];

export const NEURO_SECTION_ORDER_NEONATAL: NeuroSection[] = [
  'preparation', 'neonatal',
];
// ─────────────────────────────────────────────────────────────────
// PRIMARY CARDS — complete neurological examination flow
// ══ SECTION 0: PREPARATION ══
// ─────────────────────────────────────────────────────────────────

export const NEURO_CARDS: NeuroCardDef[] = [
  {
    id: 'neuro_prep', section: 'preparation', sectionOrder: 0, cardNumber: 0,
    label: 'Preparation',
    question: 'Preparation complete (explain, consent, glasses, hearing aids, comfortable, good lighting)',
    type: 'single_select',
    options: [
      { value: 'complete', label: '✓ Prepared', documentationPhrase: '' },
    ],
    documentationTemplate: '',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },

  // ══ SECTION 1: MENTAL STATUS ══
  {
    id: 'neuro_appearance', section: 'mental_status', sectionOrder: 1, cardNumber: 1,
    label: 'Appearance',
    question: 'General appearance and grooming',
    type: 'single_select',
    options: [
      { value: 'well_groomed', label: 'Well-groomed', documentationPhrase: 'well-groomed' },
      { value: 'unkempt', label: 'Unkempt / Neglected', documentationPhrase: 'unkempt appearance suggesting self-neglect' },
      { value: 'distressed', label: 'Distressed / Anxious', documentationPhrase: 'distressed appearance' },
    ],
    documentationTemplate: 'The patient appears {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['depression', 'dementia', 'psychosis'], weight: 0.3, documentationPhrase: 'unkempt appearance' },
    ],
  },
  {
    id: 'neuro_behaviour', section: 'mental_status', sectionOrder: 2, cardNumber: 2,
    label: 'Behaviour',
    question: 'Behaviour during interview',
    type: 'single_select',
    options: [
      { value: 'appropriate', label: 'Appropriate / Cooperative', documentationPhrase: 'behaviour is appropriate and cooperative' },
      { value: 'agitated', label: 'Agitated / Restless', documentationPhrase: 'behaviour is agitated and restless' },
      { value: 'withdrawn', label: 'Withdrawn / Distant', documentationPhrase: 'behaviour is withdrawn' },
      { value: 'disinhibited', label: 'Disinhibited / Bizarre', documentationPhrase: 'behaviour is disinhibited' },
    ],
    documentationTemplate: 'Behaviour is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['dementia', 'mania', 'psychosis', 'delirium'], weight: 0.4, documentationPhrase: 'abnormal behaviour' },
    ],
  },
  {
    id: 'neuro_mood', section: 'mental_status', sectionOrder: 3, cardNumber: 3,
    label: 'Mood',
    question: 'Mood and affect',
    type: 'single_select',
    options: [
      { value: 'euthymic', label: 'Euthymic (normal)', documentationPhrase: 'mood is euthymic' },
      { value: 'depressed', label: 'Depressed / Flat', documentationPhrase: 'mood is depressed with flat affect' },
      { value: 'anxious', label: 'Anxious', documentationPhrase: 'mood is anxious' },
      { value: 'euphoric', label: 'Euphoric / Elated', documentationPhrase: 'mood is euphoric' },
      { value: 'labile', label: 'Labile / Emotionally unstable', documentationPhrase: 'mood is labile' },
    ],
    documentationTemplate: 'Mood is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Depression', supportsDisease: ['depression', 'bipolar', 'dementia'], weight: 0.5, documentationPhrase: 'depressed mood' },
      { disease: 'Mania', supportsDisease: ['bipolar'], weight: 0.5, documentationPhrase: 'euphoric mood' },
    ],
  },
  {
    id: 'neuro_orientation', section: 'mental_status', sectionOrder: 4, cardNumber: 4,
    label: 'Orientation',
    question: 'Orientation to time, place, person, situation',
    type: 'single_select',
    options: [
      { value: 'fully_oriented', label: 'Fully oriented (x4)', documentationPhrase: 'fully oriented to time, place, person and situation' },
      { value: 'time_only', label: 'Disoriented to time', documentationPhrase: 'disoriented to time' },
      { value: 'time_place', label: 'Disoriented to time and place', documentationPhrase: 'disoriented to time and place' },
      { value: 'all', label: 'Disoriented in all spheres', documentationPhrase: 'disoriented in all spheres' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { phenotype: 'Delirium', supportsDisease: ['delirium', 'dementia', 'encephalopathy'], weight: 0.6, documentationPhrase: 'disorientation' },
    ],
  },
  {
    id: 'neuro_memory', section: 'mental_status', sectionOrder: 5, cardNumber: 5,
    label: 'Memory',
    question: 'Memory assessment',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact (immediate, recent, remote)', documentationPhrase: 'memory is intact in all domains' },
      { value: 'impaired_short', label: 'Impaired short-term memory', documentationPhrase: 'short-term memory is impaired' },
      { value: 'impaired_long', label: 'Impaired long-term memory', documentationPhrase: 'long-term memory is impaired' },
      { value: 'impaired_both', label: 'Impaired short and long-term', documentationPhrase: 'short and long-term memory are impaired' },
    ],
    documentationTemplate: 'Memory is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Dementia', localization: 'Hippocampus / Temporal lobe', supportsDisease: ['dementia', 'alzheimers', 'korsakoffs', 'delirium'], weight: 0.7, documentationPhrase: 'memory impairment' },
    ],
  },
  {
    id: 'neuro_attention', section: 'mental_status', sectionOrder: 6, cardNumber: 6,
    label: 'Attention & Concentration',
    question: 'Attention span and concentration',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'attention and concentration are intact' },
      { value: 'impaired', label: 'Easily distracted / Poor', documentationPhrase: 'attention and concentration are impaired' },
    ],
    documentationTemplate: 'Attention and concentration are {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['delirium', 'dementia', 'adhd', 'anxiety'], weight: 0.5, documentationPhrase: 'poor attention' },
    ],
  },
  {
    id: 'neuro_insight', section: 'mental_status', sectionOrder: 7, cardNumber: 7,
    label: 'Insight & Judgment',
    question: 'Insight into condition and judgment',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'insight and judgment are intact' },
      { value: 'impaired', label: 'Impaired / Poor', documentationPhrase: 'insight is impaired' },
    ],
    documentationTemplate: 'Insight and judgment are {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['dementia', 'psychosis', 'delirium', 'frontal_lobe_damage'], weight: 0.4, documentationPhrase: 'impaired insight' },
    ],
  },
  {
    id: 'neuro_thought', section: 'mental_status', sectionOrder: 8, cardNumber: 8,
    label: 'Thought Form & Content',
    question: 'Thought form and content',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'thought form and content are normal' },
      { value: 'delusions', label: 'Delusions present', documentationPhrase: 'delusions are present' },
      { value: 'hallucinations', label: 'Hallucinations reported', documentationPhrase: 'hallucinations are reported' },
      { value: 'disorganised', label: 'Disorganised / Tangential', documentationPhrase: 'thought processes are disorganised' },
    ],
    documentationTemplate: 'Thought: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Psychosis', supportsDisease: ['psychosis', 'schizophrenia', 'delirium', 'dementia'], weight: 0.6, documentationPhrase: 'delusions/hallucinations' },
    ],
  },
  {
    id: 'neuro_executive', section: 'mental_status', sectionOrder: 9, cardNumber: 9,
    label: 'Executive Function',
    question: 'Executive function (abstract thinking, planning)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'executive function is intact' },
      { value: 'impaired', label: 'Impaired', documentationPhrase: 'executive function is impaired' },
    ],
    documentationTemplate: 'Executive function is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Frontal lobe', supportsDisease: ['frontal_lobe_damage', 'dementia', 'stroke'], weight: 0.5, documentationPhrase: 'impaired executive function' },
    ],
  },
  // ══ SECTION 2: HIGHER CORTICAL FUNCTIONS ══
  {
    id: 'neuro_comprehension', section: 'higher_cortical', sectionOrder: 10, cardNumber: 10,
    label: 'Comprehension',
    question: 'Verbal and written comprehension',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'comprehension is intact' },
      { value: 'verbal', label: 'Impaired verbal comprehension', documentationPhrase: 'verbal comprehension is impaired (Wernicke aphasia)' },
      { value: 'written', label: 'Impaired written comprehension', documentationPhrase: 'written comprehension (alexia) is impaired' },
    ],
    documentationTemplate: 'Comprehension is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Wernicke area / Temporal lobe', supportsDisease: ['stroke', 'dementia', 'brain_tumour'], weight: 0.5, documentationPhrase: 'impaired comprehension' },
    ],
  },
  {
    id: 'neuro_naming', section: 'higher_cortical', sectionOrder: 11, cardNumber: 11,
    label: 'Naming',
    question: 'Object naming (confrontation naming)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'naming is intact' },
      { value: 'impaired', label: 'Impaired (anomia / dysnomia)', documentationPhrase: 'naming is impaired suggesting anomia' },
    ],
    documentationTemplate: 'Naming is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Dominant temporal lobe', supportsDisease: ['dementia', 'stroke', 'alzheimers'], weight: 0.5, documentationPhrase: 'anomia' },
    ],
  },
  {
    id: 'neuro_repetition', section: 'higher_cortical', sectionOrder: 12, cardNumber: 12,
    label: 'Repetition',
    question: 'Sentence repetition',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'repetition is intact' },
      { value: 'impaired', label: 'Impaired', documentationPhrase: 'repetition is impaired (conduction aphasia)' },
    ],
    documentationTemplate: 'Repetition is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Arcuate fasciculus', supportsDisease: ['stroke', 'conduction_aphasia'], weight: 0.6, documentationPhrase: 'impaired repetition' },
    ],
  },
  {
    id: 'neuro_reading', section: 'higher_cortical', sectionOrder: 13, cardNumber: 13,
    label: 'Reading',
    question: 'Reading ability',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'reading is intact' },
      { value: 'dyslexia', label: 'Dyslexia / Alexia', documentationPhrase: 'reading is impaired (alexia)' },
    ],
    documentationTemplate: 'Reading is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Angular gyrus', supportsDisease: ['stroke', 'dementia'], weight: 0.4, documentationPhrase: 'alexia' },
    ],
  },
  {
    id: 'neuro_writing', section: 'higher_cortical', sectionOrder: 14, cardNumber: 14,
    label: 'Writing',
    question: 'Writing ability',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'writing is intact' },
      { value: 'dysgraphia', label: 'Dysgraphia / Agraphia', documentationPhrase: 'writing is impaired (dysgraphia)' },
    ],
    documentationTemplate: 'Writing is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Dominant parietal lobe', supportsDisease: ['stroke', 'dementia'], weight: 0.4, documentationPhrase: 'dysgraphia' },
    ],
  },
  {
    id: 'neuro_praxis', section: 'higher_cortical', sectionOrder: 15, cardNumber: 15,
    label: 'Praxis',
    question: 'Ideomotor and ideational praxis',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'praxis is intact' },
      { value: 'ideomotor', label: 'Ideomotor apraxia', documentationPhrase: 'ideomotor apraxia is present' },
      { value: 'ideational', label: 'Ideational apraxia', documentationPhrase: 'ideational apraxia is present' },
    ],
    documentationTemplate: 'Praxis is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Parietal lobe / Supplementary motor area', supportsDisease: ['dementia', 'stroke', 'brain_tumour'], weight: 0.5, documentationPhrase: 'apraxia' },
    ],
  },
  {
    id: 'neuro_neglect', section: 'higher_cortical', sectionOrder: 16, cardNumber: 16,
    label: 'Neglect / Extinction',
    question: 'Spatial neglect and sensory extinction',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no neglect or extinction detected' },
      { value: 'visual_neglect', label: 'Visual neglect present', documentationPhrase: 'visual neglect is present' },
      { value: 'sensory_extinction', label: 'Sensory extinction present', documentationPhrase: 'sensory extinction is present on double simultaneous stimulation' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Non-dominant parietal lobe', supportsDisease: ['stroke', 'brain_tumour'], weight: 0.7, documentationPhrase: 'spatial neglect' },
    ],
  },
  {
    id: 'neuro_construction', section: 'higher_cortical', sectionOrder: 17, cardNumber: 17,
    label: 'Constructional Ability',
    question: 'Copying figures (clock, cube, intersecting pentagons)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'constructional ability is intact' },
      { value: 'impaired', label: 'Impaired', documentationPhrase: 'constructional ability is impaired' },
    ],
    documentationTemplate: 'Constructional ability is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Parietal lobe', supportsDisease: ['dementia', 'stroke'], weight: 0.4, documentationPhrase: 'impaired construction' },
    ],
  },
  {
    id: 'neuro_calculation', section: 'higher_cortical', sectionOrder: 18, cardNumber: 18,
    label: 'Calculation',
    question: 'Arithmetic (serial sevens, simple sums)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'calculation ability is intact' },
      { value: 'impaired', label: 'Impaired (dyscalculia)', documentationPhrase: 'calculation is impaired (dyscalculia)' },
    ],
    documentationTemplate: 'Calculation is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Dominant parietal lobe', supportsDisease: ['dementia', 'stroke'], weight: 0.4, documentationPhrase: 'dyscalculia' },
    ],
  },
  {
    id: 'neuro_agnosia', section: 'higher_cortical', sectionOrder: 19, cardNumber: 19,
    label: 'Agnosia',
    question: 'Recognition (objects, faces, colours)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'No agnosia', documentationPhrase: 'no agnosia detected' },
      { value: 'visual', label: 'Visual agnosia', documentationPhrase: 'visual agnosia is present' },
      { value: 'prosopagnosia', label: 'Prosopagnosia (face blindness)', documentationPhrase: 'prosopagnosia (face blindness) is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Temporal / Occipital lobe', supportsDisease: ['dementia', 'stroke', 'brain_tumour'], weight: 0.6, documentationPhrase: 'agnosia' },
    ],
  },

  // ══ SECTION 3: SPEECH & LANGUAGE ══
  {
    id: 'neuro_speech_fluency', section: 'speech_language', sectionOrder: 20, cardNumber: 20,
    label: 'Fluency',
    question: 'Speech fluency',
    type: 'single_select',
    options: [
      { value: 'fluent', label: 'Fluent', documentationPhrase: 'speech is fluent' },
      { value: 'non_fluent', label: 'Non-fluent / Halting', documentationPhrase: 'speech is non-fluent and halting (Broca aphasia)' },
      { value: 'pressured', label: 'Pressured / Rapid', documentationPhrase: 'speech is pressured and rapid' },
    ],
    documentationTemplate: 'Speech is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Broca aphasia', localization: 'Inferior frontal gyrus', supportsDisease: ['stroke', 'brain_tumour', 'dementia'], weight: 0.6, documentationPhrase: 'non-fluent speech' },
    ],
  },
  {
    id: 'neuro_speech_articulation', section: 'speech_language', sectionOrder: 21, cardNumber: 21,
    label: 'Articulation',
    question: 'Articulation and clarity',
    type: 'single_select',
    options: [
      { value: 'clear', label: 'Clear articulation', documentationPhrase: 'articulation is clear' },
      { value: 'dysarthria', label: 'Dysarthria (slurred)', documentationPhrase: 'speech is dysarthric' },
    ],
    documentationTemplate: 'Articulation is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Motor / Cerebellar / Bulbar', supportsDisease: ['stroke', 'motor_neuron_disease', 'cerebellar', 'myasthenia', 'parkinsons'], weight: 0.5, documentationPhrase: 'dysarthria' },
    ],
  },
  {
    id: 'neuro_voice', section: 'speech_language', sectionOrder: 22, cardNumber: 22,
    label: 'Voice',
    question: 'Voice quality and volume',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'voice is normal' },
      { value: 'hoarse', label: 'Hoarse / Breathy', documentationPhrase: 'voice is hoarse and breathy' },
      { value: 'nasal', label: 'Nasal speech', documentationPhrase: 'speech has a nasal quality' },
      { value: 'hypophonic', label: 'Hypophonic (soft)', documentationPhrase: 'voice is hypophonic (soft)' },
    ],
    documentationTemplate: 'Voice is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Parkinsons', supportsDisease: ['parkinsons'], weight: 0.4, documentationPhrase: 'hypophonic voice' },
      { disease: 'Myasthenia', supportsDisease: ['myasthenia_gravis'], weight: 0.5, documentationPhrase: 'breathy voice' },
      { localization: 'Bulbar', supportsDisease: ['motor_neuron_disease', 'bulbar_palsy'], weight: 0.5, documentationPhrase: 'nasal speech' },
    ],
  },
  {
    id: 'neuro_prosody', section: 'speech_language', sectionOrder: 23, cardNumber: 23,
    label: 'Prosody',
    question: 'Prosody (melody and rhythm of speech)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'prosody is normal' },
      { value: 'aprosodic', label: 'Monotonous / Aprosodic', documentationPhrase: 'speech is monotonous (aprosodic)' },
    ],
    documentationTemplate: 'Prosody is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Parkinsons', supportsDisease: ['parkinsons', 'depression', 'frontal_lobe_damage'], weight: 0.4, documentationPhrase: 'aprosodic speech' },
    ],
  },
  // ══ SECTION 4: CONSCIOUSNESS / GCS ══
  {
    id: 'neuro_avpu', section: 'consciousness', sectionOrder: 24, cardNumber: 24,
    label: 'AVPU',
    question: 'AVPU consciousness scale',
    type: 'single_select',
    options: [
      { value: 'alert', label: 'Alert', documentationPhrase: 'AVPU: Alert' },
      { value: 'voice', label: 'Voice (responds to voice)', documentationPhrase: 'AVPU: Responds to voice' },
      { value: 'pain', label: 'Pain (responds to pain only)', documentationPhrase: 'AVPU: Responds only to pain' },
      { value: 'unresponsive', label: 'Unresponsive', documentationPhrase: 'AVPU: Unresponsive' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { showForAgeBands: ['adult', 'elderly', 'adolescent', 'child'] },
    evidenceLinks: [
      { supportsDisease: ['reduced_gcs', 'encephalopathy', 'stroke', 'head_injury'], weight: 0.6, documentationPhrase: 'reduced AVPU' },
    ],
    conditionalExpand: {
      triggerValues: ['voice', 'pain', 'unresponsive'],
      expandCardIds: ['neuro_gcs_eye', 'neuro_gcs_verbal', 'neuro_gcs_motor', 'neuro_pupils_reaction', 'neuro_brainstem_reflexes'],
    },
  },
  {
    id: 'neuro_gcs_eye', section: 'consciousness', sectionOrder: 25, cardNumber: 25,
    label: 'GCS Eyes',
    question: 'GCS — Eye opening',
    type: 'single_select',
    options: [
      { value: '4', label: '4 — Spontaneous', documentationPhrase: 'E4 (spontaneous)' },
      { value: '3', label: '3 — To speech', documentationPhrase: 'E3 (to speech)' },
      { value: '2', label: '2 — To pain', documentationPhrase: 'E2 (to pain)' },
      { value: '1', label: '1 — None', documentationPhrase: 'E1 (none)' },
    ],
    documentationTemplate: 'GCS: Eyes = {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['reduced_gcs'], weight: 0.5, documentationPhrase: 'reduced GCS eye opening' },
    ],
  },
  {
    id: 'neuro_gcs_verbal', section: 'consciousness', sectionOrder: 26, cardNumber: 26,
    label: 'GCS Verbal',
    question: 'GCS — Verbal response',
    type: 'single_select',
    options: [
      { value: '5', label: '5 — Oriented', documentationPhrase: 'V5 (oriented)' },
      { value: '4', label: '4 — Confused', documentationPhrase: 'V4 (confused)' },
      { value: '3', label: '3 — Inappropriate', documentationPhrase: 'V3 (inappropriate words)' },
      { value: '2', label: '2 — Incomprehensible', documentationPhrase: 'V2 (incomprehensible sounds)' },
      { value: '1', label: '1 — None', documentationPhrase: 'V1 (none)' },
    ],
    documentationTemplate: 'GCS: Verbal = {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['reduced_gcs'], weight: 0.5, documentationPhrase: 'reduced GCS verbal response' },
    ],
  },
  {
    id: 'neuro_gcs_motor', section: 'consciousness', sectionOrder: 27, cardNumber: 27,
    label: 'GCS Motor',
    question: 'GCS — Motor response',
    type: 'single_select',
    options: [
      { value: '6', label: '6 — Obeys commands', documentationPhrase: 'M6 (obeys commands)' },
      { value: '5', label: '5 — Localises pain', documentationPhrase: 'M5 (localises pain)' },
      { value: '4', label: '4 — Withdraws from pain', documentationPhrase: 'M4 (withdraws from pain)' },
      { value: '3', label: '3 — Abnormal flexion (decorticate)', documentationPhrase: 'M3 (abnormal flexion / decorticate)' },
      { value: '2', label: '2 — Extension (decerebrate)', documentationPhrase: 'M2 (extension / decerebrate)' },
      { value: '1', label: '1 — None (flaccid)', documentationPhrase: 'M1 (none / flaccid)' },
    ],
    documentationTemplate: 'GCS: Motor = {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Corticospinal tract / Brainstem', supportsDisease: ['reduced_gcs', 'brainstem_stroke', 'raised_icp'], weight: 0.6, documentationPhrase: 'abnormal motor response' },
    ],
  },
  {
    id: 'neuro_brainstem_reflexes', section: 'consciousness', sectionOrder: 28, cardNumber: 28,
    label: 'Brainstem Reflexes',
    question: 'Brainstem reflexes (pupillary, corneal, oculocephalic, cough/gag)',
    type: 'multi_select',
    options: [
      { value: 'all_intact', label: 'All brainstem reflexes intact', documentationPhrase: 'all brainstem reflexes are intact' },
      { value: 'absent_pupillary', label: 'Pupillary reflexes absent', documentationPhrase: 'pupillary light reflexes are absent' },
      { value: 'absent_corneal', label: 'Corneal reflexes absent', documentationPhrase: 'corneal reflexes are absent' },
      { value: 'absent_dolls', label: 'Dolls eye / Oculocephalic absent', documentationPhrase: 'oculocephalic reflex (dolls eye) is absent' },
      { value: 'absent_cough', label: 'Cough / Gag reflex absent', documentationPhrase: 'cough and gag reflexes are absent' },
    ],
    documentationTemplate: 'Brainstem reflexes: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Brainstem', supportsDisease: ['brainstem_stroke', 'raised_icp', 'brain_death'], weight: 0.8, documentationPhrase: 'absent brainstem reflexes' },
    ],
  },
  // ══ SECTION 5: CRANIAL NERVES ══
  {
    id: 'neuro_cn1_smell', section: 'cranial_nerves', sectionOrder: 29, cardNumber: 29,
    label: 'CN I — Smell',
    question: 'Olfaction (coffee, peppermint, alcohol swab)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'olfaction (CN I) is intact' },
      { value: 'reduced', label: 'Reduced / Anosmia', documentationPhrase: 'olfaction is reduced (hyposmia/anosmia)' },
    ],
    documentationTemplate: 'CN I (smell): {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Olfactory bulb / Frontal lobe', supportsDisease: ['frontal_lobe_tumour', 'head_injury', 'alzheimers', 'parkinsons', 'covid_19'], weight: 0.5, documentationPhrase: 'anosmia' },
    ],
  },
  {
    id: 'neuro_cn2_acuity', section: 'cranial_nerves', sectionOrder: 30, cardNumber: 30,
    label: 'CN II — Acuity',
    question: 'Visual acuity (Snellen chart / handheld card)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal / Corrected to normal', documentationPhrase: 'visual acuity is normal (CN II)' },
      { value: 'reduced_unilateral', label: 'Reduced (one eye)', documentationPhrase: 'visual acuity is reduced in one eye' },
      { value: 'reduced_bilateral', label: 'Reduced (both eyes)', documentationPhrase: 'visual acuity is reduced bilaterally' },
    ],
    documentationTemplate: 'CN II (acuity): {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Optic nerve', supportsDisease: ['optic_neuritis', 'optic_atrophy', 'glaucoma', 'compressive_lesion'], weight: 0.5, documentationPhrase: 'reduced visual acuity' },
    ],
    conditionalExpand: {
      triggerValues: ['reduced_unilateral', 'reduced_bilateral'],
      expandCardIds: ['neuro_cn2_fields', 'neuro_cn2_fundoscopy'],
    },
  },
  {
    id: 'neuro_cn2_fields', section: 'cranial_nerves', sectionOrder: 31, cardNumber: 31,
    label: 'CN II — Visual Fields',
    question: 'Visual fields by confrontation',
    type: 'single_select',
    options: [
      { value: 'full', label: 'Full to confrontation', documentationPhrase: 'visual fields are full to confrontation in all four quadrants' },
      { value: 'homonymous_hemianopia', label: 'Homonymous hemianopia', documentationPhrase: 'homonymous hemianopia' },
      { value: 'bitemporal', label: 'Bitemporal hemianopia', documentationPhrase: 'bitemporal hemianopia' },
      { value: 'quadrantanopia', label: 'Quadrantanopia', documentationPhrase: 'quadrantanopia' },
      { value: 'monocular', label: 'Monocular field loss', documentationPhrase: 'monocular visual field loss' },
    ],
    documentationTemplate: 'Visual fields: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Optic chiasm / Optic tract / Occipital lobe', supportsDisease: ['pituitary_tumour', 'stroke', 'occipital_lesion'], weight: 0.7, documentationPhrase: 'visual field defect' },
    ],
  },
  {
    id: 'neuro_cn2_fundoscopy', section: 'cranial_nerves', sectionOrder: 32, cardNumber: 32,
    label: 'CN II — Fundoscopy',
    question: 'Fundoscopic examination',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal fundi', documentationPhrase: 'fundoscopic examination is normal' },
      { value: 'papilledema', label: 'Papilledema / Blurred disc margins', documentationPhrase: 'papilledema is present suggesting raised intracranial pressure' },
      { value: 'optic_atrophy', label: 'Optic atrophy (pale disc)', documentationPhrase: 'optic atrophy is present' },
      { value: 'hypertensive', label: 'Hypertensive retinopathy', documentationPhrase: 'hypertensive retinopathy changes are present' },
      { value: 'diabetic', label: 'Diabetic retinopathy', documentationPhrase: 'diabetic retinopathy is present' },
    ],
    documentationTemplate: 'Fundoscopy: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Raised ICP', supportsDisease: ['raised_icp', 'optic_neuritis', 'hypertension', 'diabetes'], weight: 0.6, documentationPhrase: 'fundoscopic abnormality' },
    ],
  },
  {
    id: 'neuro_pupils_reaction', section: 'cranial_nerves', sectionOrder: 33, cardNumber: 33,
    label: 'Pupils',
    question: 'Pupillary size, equality and light reflex',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal (equal, reactive)', documentationPhrase: 'pupils are equal and reactive to light bilaterally' },
      { value: 'unequal', label: 'Unequal (anisocoria)', documentationPhrase: 'anisocoria (unequal pupils) is present' },
      { value: 'sluggish', label: 'Sluggish / Poorly reactive', documentationPhrase: 'pupillary light reflexes are sluggish' },
      { value: 'fixed_dilated_left', label: 'Fixed and dilated (left)', documentationPhrase: 'left pupil is fixed and dilated (suggesting left CN III palsy or uncal herniation)' },
      { value: 'fixed_dilated_right', label: 'Fixed and dilated (right)', documentationPhrase: 'right pupil is fixed and dilated' },
      { value: 'bilateral_fixed', label: 'Fixed and dilated (bilateral)', documentationPhrase: 'both pupils are fixed and dilated' },
      { value: 'pinpoint', label: 'Pinpoint (miotic)', documentationPhrase: 'pupils are bilaterally pinpoint (suggesting pontine lesion or opiate overdose)' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Midbrain / CN III', supportsDisease: ['brainstem_stroke', 'raised_icp', 'third_nerve_palsy', 'horners', 'opiate_overdose'], weight: 0.7, documentationPhrase: 'pupillary abnormality' },
    ],
  },
  {
    id: 'neuro_cn3_eye_movements', section: 'cranial_nerves', sectionOrder: 34, cardNumber: 34,
    label: 'CN III, IV, VI — Eye Movements',
    question: 'Extraocular movements (H pattern)',
    type: 'single_select',
    options: [
      { value: 'full', label: 'Full range, conjugate, no nystagmus', documentationPhrase: 'extraocular movements are full, conjugate and smooth with no nystagmus' },
      { value: 'third_nerve', label: 'CN III palsy (down and out, ptosis, dilated pupil)', documentationPhrase: 'CN III palsy is present' },
      { value: 'fourth_nerve', label: 'CN IV palsy (vertical diplopia, head tilt)', documentationPhrase: 'CN IV (trochlear) palsy is present' },
      { value: 'sixth_nerve', label: 'CN VI palsy (lateral rectus weakness, convergent squint)', documentationPhrase: 'CN VI (abducens) palsy is present' },
      { value: 'conjugate_gaze', label: 'Conjugate gaze palsy', documentationPhrase: 'conjugate gaze palsy is present' },
      { value: 'nystagmus', label: 'Nystagmus present', documentationPhrase: 'nystagmus is present' },
      { value: 'internuclear', label: 'Internuclear ophthalmoplegia (INO)', documentationPhrase: 'internuclear ophthalmoplegia (INO) is present' },
    ],
    documentationTemplate: 'CN III, IV, VI: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Brainstem / CN III, IV, VI', supportsDisease: ['stroke', 'multiple_sclerosis', 'myasthenia', 'brainstem_lesion', 'raised_icp'], weight: 0.6, documentationPhrase: 'abnormal eye movements' },
    ],
  },
  {
    id: 'neuro_cn3_diplopia', section: 'cranial_nerves', sectionOrder: 35, cardNumber: 35,
    label: 'Diplopia',
    question: 'Diplopia assessment',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'No diplopia', documentationPhrase: 'no diplopia reported' },
      { value: 'horizontal', label: 'Horizontal diplopia', documentationPhrase: 'horizontal diplopia' },
      { value: 'vertical', label: 'Vertical diplopia', documentationPhrase: 'vertical diplopia' },
      { value: 'variable', label: 'Variable / Fatigable (suggests MG)', documentationPhrase: 'diplopia is variable and fatigable suggesting myasthenia gravis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Myasthenia gravis', supportsDisease: ['myasthenia_gravis'], weight: 0.5, documentationPhrase: 'fatigable diplopia' },
    ],
  },
  {
    id: 'neuro_cn3_ptosis', section: 'cranial_nerves', sectionOrder: 36, cardNumber: 36,
    label: 'Ptosis',
    question: 'Ptosis (unilateral or bilateral)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no ptosis' },
      { value: 'unilateral_left', label: 'Unilateral left', documentationPhrase: 'left-sided ptosis is present' },
      { value: 'unilateral_right', label: 'Unilateral right', documentationPhrase: 'right-sided ptosis is present' },
      { value: 'bilateral', label: 'Bilateral', documentationPhrase: 'bilateral ptosis is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'CN III / Sympathetic / NMJ', supportsDisease: ['third_nerve_palsy', 'horners', 'myasthenia_gravis', 'mitochondrial'], weight: 0.5, documentationPhrase: 'ptosis' },
    ],
  },
  {
    id: 'neuro_cn5_motor', section: 'cranial_nerves', sectionOrder: 37, cardNumber: 37,
    label: 'CN V — Motor',
    question: 'Masseter and temporalis (jaw clench, open against resistance)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'CN V motor function is normal' },
      { value: 'weak_left', label: 'Weak left', documentationPhrase: 'left CN V motor weakness' },
      { value: 'weak_right', label: 'Weak right', documentationPhrase: 'right CN V motor weakness' },
    ],
    documentationTemplate: 'CN V (motor): {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Pons / CN V motor nucleus', supportsDisease: ['brainstem_stroke', 'motor_neuron_disease'], weight: 0.5, documentationPhrase: 'CN V motor weakness' },
    ],
  },
  {
    id: 'neuro_cn5_sensory', section: 'cranial_nerves', sectionOrder: 38, cardNumber: 38,
    label: 'CN V — Sensory',
    question: 'Facial sensation (V1, V2, V3) — pain, light touch',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'CN V sensory function is normal in all three divisions' },
      { value: 'reduced', label: 'Reduced / Abnormal', documentationPhrase: 'CN V facial sensation is reduced' },
    ],
    documentationTemplate: 'CN V (sensory): {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Pons / Trigeminal nerve', supportsDisease: ['trigeminal_neuralgia', 'brainstem_stroke', 'cavernous_sinus_lesion'], weight: 0.5, documentationPhrase: 'CN V sensory loss' },
    ],
  },
  {
    id: 'neuro_cn5_corneal', section: 'cranial_nerves', sectionOrder: 39, cardNumber: 39,
    label: 'Corneal Reflex',
    question: 'Corneal reflex (CN V afferent, CN VII efferent)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'corneal reflex is intact' },
      { value: 'reduced_left', label: 'Reduced / Absent left', documentationPhrase: 'corneal reflex is reduced or absent on the left' },
      { value: 'reduced_right', label: 'Reduced / Absent right', documentationPhrase: 'corneal reflex is reduced or absent on the right' },
    ],
    documentationTemplate: 'Corneal reflex: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Pons (CN V to CN VII arc)', supportsDisease: ['brainstem_stroke', 'trigeminal_lesion', 'facial_palsy'], weight: 0.5, documentationPhrase: 'absent corneal reflex' },
    ],
  },
  {
    id: 'neuro_cn7_facial', section: 'cranial_nerves', sectionOrder: 40, cardNumber: 40,
    label: 'CN VII — Facial Motor',
    question: 'Facial movements (raise eyebrows, close eyes tightly, smile, puff cheeks)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal bilaterally', documentationPhrase: 'CN VII facial movements are normal bilaterally' },
      { value: 'umn_left', label: 'UMN left (lower face only, forehead spared)', documentationPhrase: 'left lower facial weakness sparing the forehead (UMN pattern)' },
      { value: 'umn_right', label: 'UMN right (lower face only, forehead spared)', documentationPhrase: 'right lower facial weakness sparing the forehead (UMN pattern)' },
      { value: 'lmn_left', label: 'LMN left (entire hemiface including forehead)', documentationPhrase: 'left lower motor neuron facial palsy affecting the entire hemiface including the forehead' },
      { value: 'lmn_right', label: 'LMN right (entire hemiface including forehead)', documentationPhrase: 'right lower motor neuron facial palsy affecting the entire hemiface including the forehead' },
    ],
    documentationTemplate: 'CN VII: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Stroke', localization: 'Contralateral motor cortex / UMN', supportsDisease: ['stroke', 'brain_tumour'], weight: 0.6, documentationPhrase: 'UMN facial weakness' },
      { disease: 'Bell palsy', localization: 'CN VII nerve / LMN', supportsDisease: ['bell_palsy', 'ramsay_hunt', 'acoustic_neuroma'], weight: 0.6, documentationPhrase: 'LMN facial palsy' },
    ],
  },
  {
    id: 'neuro_cn7_taste', section: 'cranial_nerves', sectionOrder: 41, cardNumber: 41,
    label: 'CN VII — Taste',
    question: 'Taste (anterior 2/3 of tongue)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'taste sensation (anterior 2/3) is normal' },
      { value: 'reduced', label: 'Reduced / Absent', documentationPhrase: 'taste sensation on the anterior 2/3 of tongue is reduced' },
    ],
    documentationTemplate: 'CN VII (taste): {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Chorda tympani (CN VII)', supportsDisease: ['bell_palsy', 'facial_nerve_lesion'], weight: 0.5, documentationPhrase: 'reduced taste' },
    ],
  },
  {
    id: 'neuro_cn8_hearing', section: 'cranial_nerves', sectionOrder: 42, cardNumber: 42,
    label: 'CN VIII — Hearing',
    question: 'Hearing (whisper test, Rinne, Weber)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal hearing', documentationPhrase: 'hearing is normal' },
      { value: 'reduced', label: 'Reduced hearing', documentationPhrase: 'hearing is reduced' },
      { value: 'rinne_negative_left', label: 'Rinne negative left (conductive loss)', documentationPhrase: 'Rinne negative on the left suggesting conductive hearing loss' },
      { value: 'rinne_negative_right', label: 'Rinne negative right (conductive loss)', documentationPhrase: 'Rinne negative on the right suggesting conductive hearing loss' },
      { value: 'weber_left', label: 'Weber lateralises left (conductive left / sensorineural right)', documentationPhrase: 'Weber test lateralises to the left' },
      { value: 'weber_right', label: 'Weber lateralises right (conductive right / sensorineural left)', documentationPhrase: 'Weber test lateralises to the right' },
    ],
    documentationTemplate: 'CN VIII: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Cochlear nerve / Inner ear', supportsDisease: ['hearing_loss', 'acoustic_neuroma', 'menieres', 'otitis_media'], weight: 0.5, documentationPhrase: 'hearing abnormality' },
    ],
  },
  {
    id: 'neuro_cn8_vestibular', section: 'cranial_nerves', sectionOrder: 43, cardNumber: 43,
    label: 'CN VIII — Vestibular',
    question: 'Vestibular function (head thrust, nystagmus, Dix-Hallpike if vertigo)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal vestibular function', documentationPhrase: 'vestibular function is normal' },
      { value: 'nystagmus_peripheral', label: 'Peripheral vestibular nystagmus', documentationPhrase: 'peripheral vestibular nystagmus present' },
      { value: 'nystagmus_central', label: 'Central nystagmus (vertical / direction-changing)', documentationPhrase: 'central nystagmus present' },
      { value: 'positive_hallpike', label: 'Positive Dix-Hallpike (BPPV)', documentationPhrase: 'Dix-Hallpike is positive suggesting BPPV' },
    ],
    documentationTemplate: 'Vestibular: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['bppv', 'labyrinthitis', 'menieres', 'brainstem_stroke', 'acoustic_neuroma'], weight: 0.6, documentationPhrase: 'vestibular abnormality' },
    ],
  },
  {
    id: 'neuro_cn9_gag', section: 'cranial_nerves', sectionOrder: 44, cardNumber: 44,
    label: 'CN IX, X — Gag & Palate',
    question: 'Palatal elevation, gag reflex, swallowing',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal palate, gag and swallow', documentationPhrase: 'CN IX and X function is normal with intact palate elevation, gag reflex and swallow' },
      { value: 'reduced_gag', label: 'Reduced gag reflex', documentationPhrase: 'gag reflex is reduced' },
      { value: 'absent_gag', label: 'Absent gag reflex', documentationPhrase: 'gag reflex is absent' },
      { value: 'deviated_uvula', label: 'Uvula deviates to one side', documentationPhrase: 'uvula deviates to the intact side (CN X lesion)' },
      { value: 'palatal_droop', label: 'Palatal droop (nasal regurgitation)', documentationPhrase: 'palatal droop with nasal regurgitation' },
    ],
    documentationTemplate: 'CN IX, X: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Medulla / CN IX, X', supportsDisease: ['bulbar_palsy', 'psuedobulbar_palsy', 'brainstem_stroke', 'motor_neuron_disease'], weight: 0.6, documentationPhrase: 'bulbar dysfunction' },
    ],
  },
  {
    id: 'neuro_cn11_scm', section: 'cranial_nerves', sectionOrder: 45, cardNumber: 45,
    label: 'CN XI — SCM & Trapezius',
    question: 'Head turn (SCM) and shoulder shrug (trapezius) against resistance',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal bilaterally', documentationPhrase: 'CN XI (SCM and trapezius) is normal bilaterally' },
      { value: 'weak_left', label: 'Weak left', documentationPhrase: 'left CN XI weakness' },
      { value: 'weak_right', label: 'Weak right', documentationPhrase: 'right CN XI weakness' },
    ],
    documentationTemplate: 'CN XI: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'CN XI nucleus / Spinal accessory nerve', supportsDisease: ['motor_neuron_disease', 'neck_dissection', 'brainstem_stroke'], weight: 0.4, documentationPhrase: 'CN XI weakness' },
    ],
  },
  {
    id: 'neuro_cn12_tongue', section: 'cranial_nerves', sectionOrder: 46, cardNumber: 46,
    label: 'CN XII — Tongue',
    question: 'Tongue protrusion, wasting, fasciculations, deviation',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal — central protrusion, no wasting', documentationPhrase: 'CN XII (tongue) is normal with central protrusion, no wasting or fasciculations' },
      { value: 'deviation_left', label: 'Deviates left', documentationPhrase: 'tongue deviates to the left suggesting left CN XII weakness' },
      { value: 'deviation_right', label: 'Deviates right', documentationPhrase: 'tongue deviates to the right suggesting right CN XII weakness' },
      { value: 'wasting', label: 'Wasting / Fasciculations', documentationPhrase: 'tongue wasting and fasciculations are present suggesting lower motor neuron lesion (bulbar palsy)' },
    ],
    documentationTemplate: 'CN XII: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Hypoglossal nucleus / CN XII', supportsDisease: ['motor_neuron_disease', 'brainstem_stroke', 'bulbar_palsy'], weight: 0.5, documentationPhrase: 'CN XII abnormality' },
    ],
  },
  // ══ SECTION 6: MOTOR SYSTEM ══
  {
    id: 'neuro_inspection', section: 'motor_system', sectionOrder: 47, cardNumber: 47,
    label: 'Inspection',
    question: 'Muscle bulk, wasting, hypertrophy, symmetry, posture, fasciculations',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal bulk, symmetry, no wasting', documentationPhrase: 'muscle bulk and symmetry are normal with no wasting or fasciculations' },
      { value: 'wasting_upper', label: 'Wasting (upper limbs)', documentationPhrase: 'muscle wasting is present in the upper limbs' },
      { value: 'wasting_lower', label: 'Wasting (lower limbs)', documentationPhrase: 'muscle wasting is present in the lower limbs' },
      { value: 'wasting_generalised', label: 'Generalised wasting', documentationPhrase: 'generalised muscle wasting is present' },
      { value: 'fasciculations', label: 'Fasciculations present', documentationPhrase: 'fasciculations are present' },
      { value: 'hypertrophy', label: 'Pseudohypertrophy (calves)', documentationPhrase: 'pseudohypertrophy of the calves is present' },
      { value: 'posture_abnormal', label: 'Abnormal posture', documentationPhrase: 'abnormal posture is noted' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'LMN / Anterior horn / Muscle', supportsDisease: ['motor_neuron_disease', 'muscular_dystrophy', 'neuropathy', 'myopathy'], weight: 0.6, documentationPhrase: 'wasting / fasciculations' },
    ],
  },
  {
    id: 'neuro_tone', section: 'motor_system', sectionOrder: 48, cardNumber: 48,
    label: 'Tone',
    question: 'Muscle tone assessment',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal tone', documentationPhrase: 'tone is normal throughout' },
      { value: 'spastic_upper', label: 'Spastic (upper limbs)', documentationPhrase: 'spasticity is present in the upper limbs (clasp knife pattern)' },
      { value: 'spastic_lower', label: 'Spastic (lower limbs)', documentationPhrase: 'spasticity is present in the lower limbs' },
      { value: 'rigid_leadpipe', label: 'Rigid (lead pipe)', documentationPhrase: 'lead pipe rigidity is present' },
      { value: 'rigid_cogwheel', label: 'Rigid (cogwheel)', documentationPhrase: 'cogwheel rigidity is present suggesting parkinsonism' },
      { value: 'hypotonic', label: 'Hypotonic / Flaccid', documentationPhrase: 'tone is reduced (hypotonic/flaccid)' },
      { value: 'paratonia', label: 'Paratonia / Gegenhalten', documentationPhrase: 'paratonia (gegenhalten) is present suggesting frontal lobe dysfunction' },
    ],
    documentationTemplate: 'Tone: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Stroke', localization: 'UMN (corticospinal tract)', supportsDisease: ['stroke', 'multiple_sclerosis', 'spinal_cord_lesion'], weight: 0.6, documentationPhrase: 'spasticity' },
      { disease: 'Parkinsons', localization: 'Basal ganglia (extrapyramidal)', supportsDisease: ['parkinsons', 'parkinsonism'], weight: 0.7, documentationPhrase: 'cogwheel rigidity' },
      { localization: 'Cerebellar / LMN', supportsDisease: ['cerebellar_lesion', 'peripheral_neuropathy', 'myopathy'], weight: 0.5, documentationPhrase: 'hypotonia' },
    ],
  },
  {
    id: 'neuro_power_upper', section: 'motor_system', sectionOrder: 49, cardNumber: 49,
    label: 'Power — Upper Limbs',
    question: 'MRC grading — upper limb muscle groups',
    type: 'single_select',
    options: [
      { value: '5_all', label: '5/5 all muscle groups', documentationPhrase: 'power is 5/5 in all upper limb muscle groups' },
      { value: '4_proximal', label: '4/5 proximal weakness', documentationPhrase: 'proximal upper limb weakness (4/5)' },
      { value: '4_distal', label: '4/5 distal weakness', documentationPhrase: 'distal upper limb weakness (4/5)' },
      { value: '4_global', label: '4/5 global upper limb weakness', documentationPhrase: 'global upper limb weakness (4/5)' },
      { value: '3', label: '3/5 — Movement against gravity only', documentationPhrase: 'upper limb power is 3/5' },
      { value: '2', label: '2/5 — Movement with gravity eliminated', documentationPhrase: 'upper limb power is 2/5' },
      { value: '1', label: '1/5 — Flicker only', documentationPhrase: 'upper limb power is 1/5' },
      { value: '0', label: '0/5 — No movement (plegia)', documentationPhrase: 'no movement in the upper limbs (0/5)' },
    ],
    documentationTemplate: 'Upper limb power: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Corticospinal tract / Anterior horn / Peripheral nerve', supportsDisease: ['stroke', 'cervical_radiculopathy', 'neuropathy', 'motor_neuron_disease'], weight: 0.6, documentationPhrase: 'upper limb weakness' },
    ],
  },
  {
    id: 'neuro_power_lower', section: 'motor_system', sectionOrder: 50, cardNumber: 50,
    label: 'Power — Lower Limbs',
    question: 'MRC grading — lower limb muscle groups',
    type: 'single_select',
    options: [
      { value: '5_all', label: '5/5 all muscle groups', documentationPhrase: 'power is 5/5 in all lower limb muscle groups' },
      { value: '4_proximal', label: '4/5 proximal weakness', documentationPhrase: 'proximal lower limb weakness (4/5)' },
      { value: '4_distal', label: '4/5 distal weakness', documentationPhrase: 'distal lower limb weakness (4/5)' },
      { value: '4_global', label: '4/5 global lower limb weakness', documentationPhrase: 'global lower limb weakness (4/5)' },
      { value: '3', label: '3/5 — Movement against gravity only', documentationPhrase: 'lower limb power is 3/5' },
      { value: '2', label: '2/5 — Movement with gravity eliminated', documentationPhrase: 'lower limb power is 2/5' },
      { value: '1', label: '1/5 — Flicker only', documentationPhrase: 'lower limb power is 1/5' },
      { value: '0', label: '0/5 — No movement (plegia)', documentationPhrase: 'no movement in the lower limbs (0/5)' },
    ],
    documentationTemplate: 'Lower limb power: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Corticospinal tract / Anterior horn / Peripheral nerve', supportsDisease: ['stroke', 'lumbar_radiculopathy', 'neuropathy', 'spinal_cord_lesion', 'motor_neuron_disease'], weight: 0.6, documentationPhrase: 'lower limb weakness' },
    ],
  },
  {
    id: 'neuro_power_pattern', section: 'motor_system', sectionOrder: 51, cardNumber: 51,
    label: 'Weakness Pattern',
    question: 'Pattern of weakness',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No weakness pattern', documentationPhrase: 'no pattern of weakness detected' },
      { value: 'hemiplegia_left', label: 'Left hemiplegia/hemiparesis', documentationPhrase: 'left-sided hemiparesis' },
      { value: 'hemiplegia_right', label: 'Right hemiplegia/hemiparesis', documentationPhrase: 'right-sided hemiparesis' },
      { value: 'monoplegia', label: 'Monoplegia (single limb)', documentationPhrase: 'monoplegia of a single limb' },
      { value: 'paraplegia', label: 'Paraplegia (both legs)', documentationPhrase: 'paraplegia (both lower limbs)' },
      { value: 'quadriplegia', label: 'Quadriplegia / Tetraparesis', documentationPhrase: 'quadriplegia / tetraparesis' },
    ],
    documentationTemplate: 'Pattern: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Contralateral motor cortex / Corticospinal tract', supportsDisease: ['stroke', 'brain_tumour', 'spinal_cord_lesion'], weight: 0.6, documentationPhrase: 'hemiparesis pattern' },
    ],
  },
  {
    id: 'neuro_pronator_drift', section: 'motor_system', sectionOrder: 52, cardNumber: 52,
    label: 'Pronator Drift',
    question: 'Pronator drift test',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'No drift', documentationPhrase: 'no pronator drift' },
      { value: 'present_left', label: 'Drift down/pronation left', documentationPhrase: 'pronator drift is present on the left suggesting subtle upper motor neuron weakness' },
      { value: 'present_right', label: 'Drift down/pronation right', documentationPhrase: 'pronator drift is present on the right' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Corticospinal tract (subtle UMN)', supportsDisease: ['stroke', 'tia', 'brain_tumour'], weight: 0.5, documentationPhrase: 'pronator drift' },
    ],
  },
  {
    id: 'neuro_involuntary_movements', section: 'motor_system', sectionOrder: 53, cardNumber: 53,
    label: 'Involuntary Movements',
    question: 'Involuntary movements observed',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no involuntary movements' },
      { value: 'tremor_rest', label: 'Rest tremor (pill-rolling)', documentationPhrase: 'resting tremor (pill-rolling) is present' },
      { value: 'tremor_action', label: 'Action / Intention tremor', documentationPhrase: 'action tremor is present' },
      { value: 'tremor_postural', label: 'Postural / Physiological tremor', documentationPhrase: 'postural tremor is present' },
      { value: 'chorea', label: 'Chorea (brief, jerky, random)', documentationPhrase: 'chorea is present' },
      { value: 'athetosis', label: 'Athetosis (slow, writhing)', documentationPhrase: 'athetosis is present' },
      { value: 'myoclonus', label: 'Myoclonus (brief shock-like jerks)', documentationPhrase: 'myoclonus is present' },
      { value: 'dystonia', label: 'Dystonia (sustained posturing)', documentationPhrase: 'dystonic posturing is present' },
      { value: 'tics', label: 'Tics', documentationPhrase: 'tics are present' },
      { value: 'asterixis', label: 'Asterixis (flapping tremor)', documentationPhrase: 'asterixis is present suggesting metabolic encephalopathy' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Parkinsons', localization: 'Basal ganglia (substantia nigra)', supportsDisease: ['parkinsons', 'parkinsonism'], weight: 0.7, documentationPhrase: 'resting tremor' },
      { disease: 'Huntingtons', localization: 'Basal ganglia (caudate)', supportsDisease: ['huntingtons', 'chorea'], weight: 0.6, documentationPhrase: 'chorea' },
      { disease: 'Hepatic encephalopathy', supportsDisease: ['hepatic_encephalopathy', 'metabolic_encephalopathy'], weight: 0.5, documentationPhrase: 'asterixis' },
    ],
  },
  // ══ SECTION 7: REFLEXES ══
  {
    id: 'neuro_dtr_upper', section: 'reflexes', sectionOrder: 54, cardNumber: 54,
    label: 'Upper Limb DTRs',
    question: 'Deep tendon reflexes — biceps (C5/6), supinator/brachioradialis (C6), triceps (C7)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal and symmetrical', documentationPhrase: 'upper limb deep tendon reflexes are normal and symmetrical' },
      { value: 'brisk', label: 'Brisk / Hyperreflexic', documentationPhrase: 'upper limb reflexes are brisk (hyperreflexic)' },
      { value: 'reduced', label: 'Reduced / Hyporeflexic', documentationPhrase: 'upper limb reflexes are reduced (hyporeflexic)' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'upper limb reflexes are absent' },
      { value: 'inverted_supinator', label: 'Inverted supinator (biceps reduced, finger jerk present)', documentationPhrase: 'inverted supinator reflex suggesting C5/6 cord lesion' },
    ],
    documentationTemplate: 'Upper limb DTRs: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'C5-C7 spinal segments / UMN (if brisk)', supportsDisease: ['stroke', 'spinal_cord_lesion', 'cervical_radiculopathy', 'neuropathy'], weight: 0.5, documentationPhrase: 'abnormal upper limb DTRs' },
    ],
  },
  {
    id: 'neuro_dtr_lower', section: 'reflexes', sectionOrder: 55, cardNumber: 55,
    label: 'Lower Limb DTRs',
    question: 'Deep tendon reflexes — knee (L3/4), ankle (S1)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal and symmetrical', documentationPhrase: 'lower limb deep tendon reflexes are normal and symmetrical' },
      { value: 'brisk', label: 'Brisk / Hyperreflexic', documentationPhrase: 'lower limb reflexes are brisk (hyperreflexic)' },
      { value: 'reduced', label: 'Reduced / Hyporeflexic', documentationPhrase: 'lower limb reflexes are reduced (hyporeflexic)' },
      { value: 'absent_ankle', label: 'Ankle jerks absent', documentationPhrase: 'ankle jerks are absent' },
      { value: 'absent_both', label: 'Knee and ankle jerks absent', documentationPhrase: 'knee and ankle jerks are absent' },
    ],
    documentationTemplate: 'Lower limb DTRs: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'L3-S1 spinal segments', supportsDisease: ['spinal_cord_lesion', 'lumbar_radiculopathy', 'neuropathy', 'diabetes'], weight: 0.5, documentationPhrase: 'abnormal lower limb DTRs' },
    ],
  },
  {
    id: 'neuro_clonus', section: 'reflexes', sectionOrder: 56, cardNumber: 56,
    label: 'Clonus',
    question: 'Ankle / patellar clonus',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no clonus' },
      { value: 'sustained', label: 'Sustained clonus', documentationPhrase: 'sustained clonus is present suggesting upper motor neuron lesion' },
      { value: 'unsustained', label: 'Unsustained (few beats)', documentationPhrase: 'a few beats of clonus are present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'UMN (corticospinal tract)', supportsDisease: ['stroke', 'multiple_sclerosis', 'spinal_cord_lesion'], weight: 0.7, documentationPhrase: 'clonus' },
    ],
  },
  {
    id: 'neuro_plantar', section: 'reflexes', sectionOrder: 57, cardNumber: 57,
    label: 'Plantar Response (Babinski)',
    question: 'Plantar response — upgoing (extensor) / downgoing (flexor)',
    type: 'single_select',
    options: [
      { value: 'flexor', label: 'Flexor (downgoing — normal)', documentationPhrase: 'plantar responses are flexor bilaterally' },
      { value: 'extensor_left', label: 'Extensor left (upgoing — Babinski +)', documentationPhrase: 'left plantar is extensor (Babinski positive) suggesting upper motor neuron lesion' },
      { value: 'extensor_right', label: 'Extensor right (upgoing — Babinski +)', documentationPhrase: 'right plantar is extensor (Babinski positive)' },
      { value: 'extensor_bilateral', label: 'Extensor bilaterally', documentationPhrase: 'plantars are extensor bilaterally suggesting bilateral UMN lesion' },
      { value: 'equivocal', label: 'Equivocal', documentationPhrase: 'plantar responses are equivocal' },
    ],
    documentationTemplate: 'Plantars: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Corticospinal tract (UMN sign)', supportsDisease: ['stroke', 'spinal_cord_lesion', 'multiple_sclerosis', 'motor_neuron_disease'], weight: 0.8, documentationPhrase: 'extensor plantar response' },
    ],
  },
  {
    id: 'neuro_superficial_reflexes', section: 'reflexes', sectionOrder: 58, cardNumber: 58,
    label: 'Superficial Reflexes',
    question: 'Abdominal, cremasteric, anal reflexes',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Abdominal and cremasteric present', documentationPhrase: 'superficial abdominal and cremasteric reflexes are present' },
      { value: 'absent_abdominal', label: 'Abdominal reflexes absent', documentationPhrase: 'abdominal reflexes are absent (UMN sign)' },
      { value: 'anal_present', label: 'Anal reflex present', documentationPhrase: 'anal reflex is present' },
      { value: 'anal_absent', label: 'Anal reflex absent', documentationPhrase: 'anal reflex is absent suggesting cauda equina or spinal cord lesion' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['spinal_cord_lesion', 'multiple_sclerosis', 'cauda_equina'], weight: 0.5, documentationPhrase: 'absent superficial reflexes' },
    ],
  },
  {
    id: 'neuro_hoffman', section: 'reflexes', sectionOrder: 59, cardNumber: 59,
    label: 'Hoffman Reflex',
    question: 'Hoffman sign (finger flexor reflex)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Hoffman reflex is negative' },
      { value: 'positive_left', label: 'Positive left', documentationPhrase: 'Hoffman reflex is positive on the left suggesting cervical cord compression' },
      { value: 'positive_right', label: 'Positive right', documentationPhrase: 'Hoffman reflex is positive on the right' },
    ],
    documentationTemplate: 'Hoffman: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['cervical_myelopathy', 'cervical_stenosis', 'spinal_cord_lesion'], weight: 0.5, documentationPhrase: 'positive Hoffman' },
    ],
  },
  {
    id: 'neuro_primitive_reflexes', section: 'reflexes', sectionOrder: 60, cardNumber: 60,
    label: 'Primitive / Frontal Release Reflexes',
    question: 'Palmomental, snout, grasp, pout reflexes',
    type: 'multi_select',
    options: [
      { value: 'absent', label: 'All absent', documentationPhrase: 'no primitive or frontal release reflexes are present' },
      { value: 'palmomental', label: 'Palmomental present', documentationPhrase: 'palmomental reflex is present' },
      { value: 'snout', label: 'Snout reflex present', documentationPhrase: 'snout reflex is present' },
      { value: 'grasp', label: 'Grasp reflex present', documentationPhrase: 'grasp reflex is present suggesting frontal lobe dysfunction' },
    ],
    documentationTemplate: 'Frontal release: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Frontal lobe (corticobulbar tracts)', supportsDisease: ['frontal_lobe_dementia', 'dementia', 'stroke', 'normal_pressure_hydrocephalus'], weight: 0.6, documentationPhrase: 'frontal release signs' },
    ],
  },

  // ══ SECTION 8: SENSORY SYSTEM ══
  {
    id: 'neuro_sensory_primary', section: 'sensory_system', sectionOrder: 61, cardNumber: 61,
    label: 'Primary Sensation',
    question: 'Pain (pinprick), light touch, temperature sensation',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact to all modalities', documentationPhrase: 'primary sensory modalities (pain, light touch, temperature) are intact throughout' },
      { value: 'reduced_upper', label: 'Reduced in upper limbs', documentationPhrase: 'sensation is reduced in the upper limbs' },
      { value: 'reduced_lower', label: 'Reduced in lower limbs', documentationPhrase: 'sensation is reduced in the lower limbs' },
      { value: 'reduced_left', label: 'Reduced left side', documentationPhrase: 'sensation is reduced on the left side of the body' },
      { value: 'reduced_right', label: 'Reduced right side', documentationPhrase: 'sensation is reduced on the right side of the body' },
      { value: 'reduced_all', label: 'Reduced globally', documentationPhrase: 'sensation is reduced globally' },
    ],
    documentationTemplate: 'Primary sensation: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['stroke', 'spinal_cord_lesion', 'neuropathy', 'multiple_sclerosis', 'peripheral_neuropathy'], weight: 0.5, documentationPhrase: 'reduced primary sensation' },
    ],
    conditionalExpand: {
      triggerValues: ['reduced_upper', 'reduced_lower', 'reduced_left', 'reduced_right', 'reduced_all'],
      expandCardIds: ['neuro_sensory_vibration', 'neuro_sensory_proprioception', 'neuro_sensory_cortical', 'neuro_sensory_distribution'],
    },
  },
  {
    id: 'neuro_sensory_vibration', section: 'sensory_system', sectionOrder: 62, cardNumber: 62,
    label: 'Vibration Sense',
    question: 'Vibration sense (128Hz tuning fork — great toe, ankle, knee, SI, finger, wrist)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'vibration sense is intact throughout' },
      { value: 'reduced_distal', label: 'Reduced distally (stocking distribution)', documentationPhrase: 'vibration sense is reduced in a stocking distribution suggesting peripheral neuropathy' },
      { value: 'reduced_proximal', label: 'Reduced at ankles and above', documentationPhrase: 'vibration sense is reduced at the ankles and above suggesting dorsal column pathology' },
      { value: 'absent', label: 'Absent below knees', documentationPhrase: 'vibration sense is absent below the knees' },
    ],
    documentationTemplate: 'Vibration: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Dorsal columns (medial lemniscus)', supportsDisease: ['peripheral_neuropathy', 'diabetes', 'vitamin_b12_deficiency', 'tabes_dorsalis', 'spinal_cord_lesion'], weight: 0.6, documentationPhrase: 'reduced vibration sense' },
    ],
  },
  {
    id: 'neuro_sensory_proprioception', section: 'sensory_system', sectionOrder: 63, cardNumber: 63,
    label: 'Proprioception',
    question: 'Joint position sense (great toe, finger, ankle, wrist)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact', documentationPhrase: 'joint position sense (proprioception) is intact' },
      { value: 'reduced', label: 'Reduced', documentationPhrase: 'joint position sense is reduced' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'joint position sense is absent' },
    ],
    documentationTemplate: 'Proprioception: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Dorsal columns (medial lemniscus)', supportsDisease: ['peripheral_neuropathy', 'vitamin_b12_deficiency', 'spinal_cord_lesion', 'tabes_dorsalis'], weight: 0.6, documentationPhrase: 'reduced proprioception' },
    ],
  },
  {
    id: 'neuro_sensory_cortical', section: 'sensory_system', sectionOrder: 64, cardNumber: 64,
    label: 'Cortical Sensation',
    question: 'Graphesthesia, stereognosis, two-point discrimination, extinction',
    type: 'multi_select',
    options: [
      { value: 'intact', label: 'All intact', documentationPhrase: 'cortical sensory modalities are intact' },
      { value: 'graphesthesia', label: 'Graphesthesia impaired', documentationPhrase: 'graphesthesia (number identification on palm) is impaired' },
      { value: 'stereognosis', label: 'Stereognosis impaired (astereognosis)', documentationPhrase: 'stereognosis is impaired (astereognosis)' },
      { value: 'two_point', label: 'Two-point discrimination reduced', documentationPhrase: 'two-point discrimination is reduced' },
      { value: 'extinction', label: 'Sensory extinction (double simultaneous stimulation)', documentationPhrase: 'sensory extinction is present on double simultaneous stimulation' },
    ],
    documentationTemplate: 'Cortical sensation: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Parietal lobe (sensory cortex)', supportsDisease: ['stroke', 'brain_tumour', 'multiple_sclerosis', 'parietal_lesion'], weight: 0.7, documentationPhrase: 'impaired cortical sensation' },
    ],
  },
  {
    id: 'neuro_sensory_distribution', section: 'sensory_system', sectionOrder: 65, cardNumber: 65,
    label: 'Sensory Distribution',
    question: 'Pattern of sensory loss',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No sensory loss detected', documentationPhrase: 'no sensory loss detected' },
      { value: 'dermatomal', label: 'Dermatomal / Radicular (nerve root)', documentationPhrase: 'sensory loss follows a dermatomal distribution suggesting radiculopathy' },
      { value: 'peripheral_nerve', label: 'Peripheral nerve / Mononeuropathy', documentationPhrase: 'sensory loss is in a peripheral nerve distribution' },
      { value: 'stocking_glove', label: 'Stocking and glove (polyneuropathy)', documentationPhrase: 'stocking and glove sensory loss suggesting peripheral polyneuropathy' },
      { value: 'hemisensory', label: 'Hemisensory loss (one side body)', documentationPhrase: 'hemisensory loss suggesting contralateral thalamic or parietal lesion' },
      { value: 'suspended', label: 'Suspended / Cape distribution (syringomyelia)', documentationPhrase: 'suspended/cape distribution sensory loss suggesting syringomyelia' },
      { value: 'sensory_level', label: 'Sensory level (spinal cord lesion)', documentationPhrase: 'a sensory level is present suggesting a spinal cord lesion' },
    ],
    documentationTemplate: 'Distribution: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { localization: 'Peripheral nerve / Spinal cord / Brainstem / Thalamus / Cortex', supportsDisease: ['radiculopathy', 'polyneuropathy', 'spinal_cord_lesion', 'stroke', 'syringomyelia', 'multiple_sclerosis'], weight: 0.7, documentationPhrase: 'sensory distribution pattern' },
    ],
  },
  // ══ SECTION 9: COORDINATION ══
  {
    id: 'neuro_coordination_upper', section: 'coordination', sectionOrder: 66, cardNumber: 66,
    label: 'Upper Limb Coordination',
    question: 'Finger-nose test, rapid alternating movements (dysdiadochokinesia), rebound',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'upper limb coordination is normal' },
      { value: 'intention_tremor', label: 'Intention tremor (past pointing)', documentationPhrase: 'intention tremor with past pointing on finger-nose testing is present' },
      { value: 'dysdiadochokinesia', label: 'Dysdiadochokinesia (impaired rapid alternation)', documentationPhrase: 'dysdiadochokinesia is present suggesting cerebellar dysfunction' },
      { value: 'rebound', label: 'Positive rebound phenomenon (Holmes rebound)', documentationPhrase: 'positive Holmes rebound phenomenon is present' },
      { value: 'unable', label: 'Unable to perform due to weakness', documentationPhrase: 'coordination could not be assessed due to weakness' },
    ],
    documentationTemplate: 'Upper limb coordination: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Cerebellum (ipsilateral hemisphere)', supportsDisease: ['cerebellar_lesion', 'stroke', 'multiple_sclerosis', 'brain_tumour'], weight: 0.7, documentationPhrase: 'cerebellar dysfunction upper limbs' },
    ],
  },
  {
    id: 'neuro_coordination_lower', section: 'coordination', sectionOrder: 67, cardNumber: 67,
    label: 'Lower Limb Coordination',
    question: 'Heel-shin test, toe-finger test',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'lower limb coordination is normal' },
      { value: 'impaired', label: 'Impaired heel-shin', documentationPhrase: 'heel-shin test is impaired suggesting cerebellar dysfunction' },
      { value: 'unable', label: 'Unable to perform', documentationPhrase: 'lower limb coordination could not be assessed' },
    ],
    documentationTemplate: 'Lower limb coordination: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { localization: 'Cerebellum (vermis / hemisphere)', supportsDisease: ['cerebellar_lesion', 'stroke', 'multiple_sclerosis'], weight: 0.6, documentationPhrase: 'cerebellar dysfunction lower limbs' },
    ],
  },

  // ══ SECTION 10: GAIT ══
  {
    id: 'neuro_gait', section: 'gait', sectionOrder: 68, cardNumber: 68,
    label: 'Gait',
    question: 'Gait assessment (observe walking)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal gait', documentationPhrase: 'gait is normal' },
      { value: 'hemiplegic', label: 'Hemiplegic gait (circumduction)', documentationPhrase: 'hemiplegic gait with circumduction is present' },
      { value: 'parkinsonian', label: 'Parkinsonian gait (shuffling, reduced arm swing)', documentationPhrase: 'parkinsonian gait is present (shuffling, reduced arm swing, festination)' },
      { value: 'cerebellar', label: 'Cerebellar ataxia (wide-based, unsteady)', documentationPhrase: 'cerebellar ataxic gait is present (wide-based and unsteady)' },
      { value: 'sensory', label: 'Sensory ataxia (high-stepping, Romberg +)', documentationPhrase: 'sensory ataxic gait is present (high-stepping, stamps feet)' },
      { value: 'high_stepping', label: 'High-stepping / Foot drop', documentationPhrase: 'high-stepping gait due to foot drop' },
      { value: 'waddling', label: 'Waddling (myopathic / Trendelenburg)', documentationPhrase: 'waddling gait is present suggesting myopathy' },
      { value: 'scissoring', label: 'Scissoring (spastic paraparesis)', documentationPhrase: 'scissoring gait is present suggesting spastic paraparesis' },
      { value: 'apraxic', label: 'Apraxic / Gait ignition failure (frontal)', documentationPhrase: 'apraxic gait with difficulty initiating walking suggesting frontal lobe dysfunction' },
      { value: 'antalgic', label: 'Antalgic (painful — favouring leg)', documentationPhrase: 'antalgic gait due to pain' },
      { value: 'unable', label: 'Unable to walk safely', documentationPhrase: 'gait could not be assessed as patient was unable to walk safely' },
    ],
    documentationTemplate: 'Gait: {value}.',
    contextVisibility: { showForAgeBands: ['adult', 'elderly', 'adolescent', 'child'] },
    evidenceLinks: [
      { localization: 'Cerebellum / Basal ganglia / Corticospinal tract / Peripheral nerve / Muscle', supportsDisease: ['stroke', 'parkinsons', 'cerebellar_lesion', 'neuropathy', 'myopathy', 'dementia'], weight: 0.7, documentationPhrase: 'abnormal gait' },
    ],
  },
  {
    id: 'neuro_romberg', section: 'gait', sectionOrder: 69, cardNumber: 69,
    label: 'Romberg Test',
    question: 'Romberg test (standing with eyes closed)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative (steady)', documentationPhrase: 'Romberg test is negative (patient remains steady with eyes closed)' },
      { value: 'positive', label: 'Positive (sways / falls with eyes closed)', documentationPhrase: 'Romberg test is positive — patient sways or falls with eyes closed suggesting proprioceptive or vestibular loss' },
      { value: 'unable', label: 'Unable to perform', documentationPhrase: 'Romberg could not be performed' },
    ],
    documentationTemplate: 'Romberg: {value}.',
    contextVisibility: { showForAgeBands: ['adult', 'elderly', 'adolescent', 'child'] },
    evidenceLinks: [
      { localization: 'Dorsal columns (proprioception) / Vestibular', supportsDisease: ['peripheral_neuropathy', 'vitamin_b12_deficiency', 'vestibular_lesion'], weight: 0.6, documentationPhrase: 'positive Romberg' },
    ],
  },
  {
    id: 'neuro_gait_manoeuvres', section: 'gait', sectionOrder: 70, cardNumber: 70,
    label: 'Gait Manoeuvres',
    question: 'Heel walking, toe walking, tandem gait',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'All normal', documentationPhrase: 'heel walking, toe walking and tandem gait are all normal' },
      { value: 'heel_impaired', label: 'Heel walking impaired (foot drop, L5)', documentationPhrase: 'heel walking is impaired suggesting L5 / common peroneal nerve weakness' },
      { value: 'toe_impaired', label: 'Toe walking impaired (S1)', documentationPhrase: 'toe walking is impaired suggesting S1 / Achilles / medial gastrocnemius weakness' },
      { value: 'tandem_impaired', label: 'Tandem gait impaired (cerebellar / vestibular)', documentationPhrase: 'tandem gait is impaired suggesting midline cerebellar or vestibular dysfunction' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { showForAgeBands: ['adult', 'elderly', 'adolescent', 'child'] },
    evidenceLinks: [
      { supportsDisease: ['cerebellar_lesion', 'peripheral_neuropathy', 'lumbar_radiculopathy'], weight: 0.5, documentationPhrase: 'impaired gait manoeuvres' },
    ],
  },

  // ══ SECTION 11: MENINGEAL SIGNS ══
  {
    id: 'neuro_neck_stiffness', section: 'meningeal_signs', sectionOrder: 71, cardNumber: 71,
    label: 'Neck Stiffness',
    question: 'Meningism — nuchal rigidity on passive flexion',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent (no stiffness)', documentationPhrase: 'no neck stiffness' },
      { value: 'present', label: 'Present (nuchal rigidity)', documentationPhrase: 'neck stiffness (nuchal rigidity) is present suggesting meningeal irritation' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Meningitis', supportsDisease: ['meningitis', 'subarachnoid_haemorrhage'], weight: 0.7, documentationPhrase: 'neck stiffness' },
    ],
  },
  {
    id: 'neuro_kernig', section: 'meningeal_signs', sectionOrder: 72, cardNumber: 72,
    label: 'Kernig Sign',
    question: 'Kernig sign (hip flexion 90°, then extend knee)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Kernig sign is negative' },
      { value: 'positive', label: 'Positive (pain and resistance on knee extension)', documentationPhrase: 'Kernig sign is positive suggesting meningeal irritation' },
    ],
    documentationTemplate: 'Kernig: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Meningitis', supportsDisease: ['meningitis', 'subarachnoid_haemorrhage'], weight: 0.6, documentationPhrase: 'positive Kernig' },
    ],
  },
  {
    id: 'neuro_brudzinski', section: 'meningeal_signs', sectionOrder: 73, cardNumber: 73,
    label: 'Brudzinski Sign',
    question: 'Brudzinski sign (passive neck flexion to hip/knee flexion)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Brudzinski sign is negative' },
      { value: 'positive', label: 'Positive (hips flex on neck flexion)', documentationPhrase: 'Brudzinski sign is positive suggesting meningeal irritation' },
    ],
    documentationTemplate: 'Brudzinski: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Meningitis', supportsDisease: ['meningitis', 'subarachnoid_haemorrhage'], weight: 0.6, documentationPhrase: 'positive Brudzinski' },
    ],
  },
  {
    id: 'neuro_jolt', section: 'meningeal_signs', sectionOrder: 74, cardNumber: 74,
    label: 'Jolt Accentuation',
    question: 'Jolt accentuation of headache (horizontal head turn 2-3x per second)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'jolt accentuation of headache is negative' },
      { value: 'positive', label: 'Positive (headache worsens)', documentationPhrase: 'jolt accentuation of headache is positive suggesting meningitis' },
    ],
    documentationTemplate: 'Jolt: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Meningitis', supportsDisease: ['meningitis'], weight: 0.5, documentationPhrase: 'positive jolt accentuation' },
    ],
  },
  // ══ SECTION 12: NEONATAL ASSESSMENT ══
  {
    id: 'neuro_neonatal_inspection', section: 'neonatal', sectionOrder: 75, cardNumber: 75,
    label: 'Neonatal Inspection',
    question: 'General inspection — posture, cry, behaviour, skin colour',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal posture, cry and behaviour', documentationPhrase: 'neonatal posture, cry and behaviour are normal' },
      { value: 'irritable', label: 'Irritable / High-pitched cry', documentationPhrase: 'infant is irritable with a high-pitched cry suggesting neurological irritation' },
      { value: 'floppy', label: 'Floppy / Hypotonic (frog posture)', documentationPhrase: 'infant is hypotonic with a frog-like posture' },
      { value: 'rigid', label: 'Hypertonic / Opisthotonic posturing', documentationPhrase: 'infant is hypertonic with opisthotonic posturing' },
      { value: 'lethargic', label: 'Lethargic / Poor feeding', documentationPhrase: 'infant is lethargic with poor feeding' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { showForAgeBands: ['neonate'] },
    evidenceLinks: [
      { supportsDisease: ['neonatal_encephalopathy', 'hie', 'sepsis', 'meningitis'], weight: 0.6, documentationPhrase: 'abnormal neonatal neurological state' },
    ],
  },
  {
    id: 'neuro_neonatal_tone', section: 'neonatal', sectionOrder: 76, cardNumber: 76,
    label: 'Neonatal Tone',
    question: 'Central and peripheral tone assessment',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal flexor tone', documentationPhrase: 'normal flexor tone in all four limbs' },
      { value: 'hypotonic', label: 'Hypotonic (reduced flexor tone)', documentationPhrase: 'reduced flexor tone (hypotonia)' },
      { value: 'hypertonic', label: 'Hypertonic / Hyperreflexic', documentationPhrase: 'increased tone in all four limbs (hypertonia)' },
    ],
    documentationTemplate: 'Tone: {value}.',
    contextVisibility: { showForAgeBands: ['neonate'] },
    evidenceLinks: [
      { supportsDisease: ['hie', 'hypoglycaemia', 'neonatal_encephalopathy', 'cerebral_palsy'], weight: 0.6, documentationPhrase: 'abnormal neonatal tone' },
    ],
  },
  {
    id: 'neuro_neonatal_moro', section: 'neonatal', sectionOrder: 77, cardNumber: 77,
    label: 'Moro Reflex',
    question: 'Moro (startle) reflex — present (0-4mo)',
    type: 'single_select',
    options: [
      { value: 'present_normal', label: 'Present and symmetrical (normal up to 4 months)', documentationPhrase: 'Moro reflex is present and symmetrical' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'Moro reflex is absent' },
      { value: 'asymmetric', label: 'Asymmetric (suggests brachial plexus / clavicle fracture)', documentationPhrase: 'Moro reflex is asymmetric' },
      { value: 'persistent', label: 'Persistent beyond 4 months (suggests delay)', documentationPhrase: 'Moro reflex is persistent beyond 4 months' },
    ],
    documentationTemplate: 'Moro reflex: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['brachial_plexus_injury', 'neonatal_encephalopathy', 'developmental_delay'], weight: 0.5, documentationPhrase: 'abnormal Moro reflex' },
    ],
  },
  {
    id: 'neuro_neonatal_sucking', section: 'neonatal', sectionOrder: 78, cardNumber: 78,
    label: 'Sucking & Rooting Reflex',
    question: 'Sucking and rooting reflexes',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present', documentationPhrase: 'sucking and rooting reflexes are present' },
      { value: 'weak', label: 'Weak / Poor suck', documentationPhrase: 'sucking reflex is weak suggesting hypotonia or neurological impairment' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'sucking reflex is absent' },
    ],
    documentationTemplate: 'Sucking/rooting: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['neonatal_encephalopathy', 'hypotonia', 'prematurity'], weight: 0.5, documentationPhrase: 'poor suck' },
    ],
  },
  {
    id: 'neuro_neonatal_grasp', section: 'neonatal', sectionOrder: 79, cardNumber: 79,
    label: 'Palmar & Plantar Grasp',
    question: 'Palmar and plantar grasp reflexes',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present', documentationPhrase: 'palmar and plantar grasp reflexes are present' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'palmar and/or plantar grasp reflex is absent' },
    ],
    documentationTemplate: 'Grasp reflexes: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['neonatal_encephalopathy', 'developmental_delay'], weight: 0.4, documentationPhrase: 'abnormal grasp reflex' },
    ],
  },
  {
    id: 'neuro_neonatal_atnr', section: 'neonatal', sectionOrder: 80, cardNumber: 80,
    label: 'ATNR (Tonic Neck Reflex)',
    question: 'Asymmetric tonic neck reflex (fencing posture)',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present (normal 0-6mo)', documentationPhrase: 'asymmetric tonic neck reflex (ATNR) is present' },
      { value: 'persistent', label: 'Persistent beyond 6 months (suggests delay)', documentationPhrase: 'ATNR is persistent beyond 6 months suggesting developmental delay' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'ATNR is absent' },
    ],
    documentationTemplate: 'ATNR: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['developmental_delay', 'cerebral_palsy'], weight: 0.5, documentationPhrase: 'abnormal ATNR' },
    ],
  },
  {
    id: 'neuro_neonatal_stepping', section: 'neonatal', sectionOrder: 81, cardNumber: 81,
    label: 'Stepping & Placing',
    question: 'Stepping and placing reflexes',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present', documentationPhrase: 'stepping and placing reflexes are present' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'stepping and/or placing reflex is absent' },
    ],
    documentationTemplate: 'Stepping/placing: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['neonatal_encephalopathy', 'spinal_lesion'], weight: 0.4, documentationPhrase: 'abnormal stepping/placing' },
    ],
  },
  {
    id: 'neuro_neonatal_head_lag', section: 'neonatal', sectionOrder: 82, cardNumber: 82,
    label: 'Head Lag & Pull-to-Sit',
    question: 'Head lag on pull-to-sit (traction response)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'No head lag (head aligns with trunk)', documentationPhrase: 'no head lag on pull-to-sit (appropriate for corrected age)' },
      { value: 'lag_present', label: 'Head lag present', documentationPhrase: 'head lag is present suggesting hypotonia or developmental delay' },
    ],
    documentationTemplate: 'Head lag: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['hypotonia', 'developmental_delay', 'cerebral_palsy'], weight: 0.5, documentationPhrase: 'head lag' },
    ],
  },
  {
    id: 'neuro_neonatal_galant', section: 'neonatal', sectionOrder: 83, cardNumber: 83,
    label: 'Galant (Trunk Incurvation)',
    question: 'Galant reflex — trunk incurvation on paravertebral stroking',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present', documentationPhrase: 'Galant (trunk incurvation) reflex is present' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'Galant reflex is absent' },
    ],
    documentationTemplate: 'Galant reflex: {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { supportsDisease: ['spinal_lesion', 'neonatal_encephalopathy'], weight: 0.4, documentationPhrase: 'absent Galant reflex' },
    ],
  },
  {
    id: 'neuro_neonatal_landau', section: 'neonatal', sectionOrder: 84, cardNumber: 84,
    label: 'Landau Reflex',
    question: 'Landau reflex (ventral suspension — lift head and extend back/legs)',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present (normal 3-12mo)', documentationPhrase: 'Landau reflex is present' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'Landau reflex is absent suggesting hypotonia or developmental delay' },
    ],
    documentationTemplate: 'Landau reflex: {value}.',
    contextVisibility: { showForAgeBands: ['infant'] },
    evidenceLinks: [
      { supportsDisease: ['hypotonia', 'developmental_delay'], weight: 0.4, documentationPhrase: 'absent Landau' },
    ],
  },
  {
    id: 'neuro_neonatal_parachute', section: 'neonatal', sectionOrder: 85, cardNumber: 85,
    label: 'Parachute Reflex',
    question: 'Parachute / downward protective extension (appears ~6-9mo)',
    type: 'single_select',
    options: [
      { value: 'present', label: 'Present (appropriate for age)', documentationPhrase: 'parachute reflex is present' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'parachute reflex is absent suggesting developmental delay' },
    ],
    documentationTemplate: 'Parachute reflex: {value}.',
    contextVisibility: { showForAgeBands: ['infant', 'toddler'] },
    evidenceLinks: [
      { supportsDisease: ['developmental_delay', 'cerebral_palsy'], weight: 0.5, documentationPhrase: 'absent parachute reflex' },
    ],
  },
  // ══ SECTION 13: PEDIATRIC ASSESSMENT ══
  {
    id: 'neuro_pediatric_development', section: 'pediatric', sectionOrder: 86, cardNumber: 86,
    label: 'Developmental Milestones',
    question: 'Are developmental milestones age-appropriate? (motor, speech, social)',
    type: 'single_select',
    options: [
      { value: 'age_appropriate', label: 'Age-appropriate', documentationPhrase: 'developmental milestones are age-appropriate' },
      { value: 'mild_delay', label: 'Mild delay', documentationPhrase: 'mild developmental delay is noted' },
      { value: 'significant_delay', label: 'Significant delay', documentationPhrase: 'significant developmental delay is present' },
      { value: 'regression', label: 'Loss of previously acquired milestones', documentationPhrase: 'regression of previously acquired milestones is noted' },
    ],
    documentationTemplate: 'Development: {value}.',
    contextVisibility: { showForAgeBands: ['infant', 'toddler', 'child'] },
    evidenceLinks: [
      { supportsDisease: ['developmental_delay', 'cerebral_palsy', 'autism', 'genetic_syndrome'], weight: 0.7, documentationPhrase: 'developmental delay' },
    ],
  },
  {
    id: 'neuro_pediatric_cn', section: 'pediatric', sectionOrder: 87, cardNumber: 87,
    label: 'Pediatric CN Screen',
    question: 'Age-adapted cranial nerve screening (smile, visual tracking, hearing, tongue movement)',
    type: 'single_select',
    options: [
      { value: 'intact', label: 'Intact (age-appropriate)', documentationPhrase: 'age-appropriate cranial nerve function is intact' },
      { value: 'impaired', label: 'Abnormal finding detected', documentationPhrase: 'abnormal cranial nerve finding is present' },
    ],
    documentationTemplate: 'Pediatric CN screening: {value}.',
    contextVisibility: { showForAgeBands: ['infant', 'toddler', 'child'] },
    evidenceLinks: [
      { supportsDisease: ['cerebral_palsy', 'brainstem_lesion', 'congenital_syndrome'], weight: 0.5, documentationPhrase: 'abnormal CN finding' },
    ],
  },
  {
    id: 'neuro_pediatric_behaviour', section: 'pediatric', sectionOrder: 88, cardNumber: 88,
    label: 'Behaviour & Social Interaction',
    question: 'Behaviour, play, social interaction, eye contact',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Age-appropriate social interaction', documentationPhrase: 'social interaction and play are age-appropriate' },
      { value: 'poor_eye_contact', label: 'Poor eye contact / withdrawn', documentationPhrase: 'poor eye contact and withdrawn behaviour noted' },
      { value: 'hyperactive', label: 'Hyperactive / Inattentive', documentationPhrase: 'hyperactive and inattentive behaviour is noted' },
      { value: 'repetitive', label: 'Repetitive / Stereotyped behaviours', documentationPhrase: 'repetitive and stereotyped behaviours are noted' },
    ],
    documentationTemplate: 'Behaviour: {value}.',
    contextVisibility: { showForAgeBands: ['toddler', 'child', 'adolescent'] },
    evidenceLinks: [
      { disease: 'Autism', supportsDisease: ['autism', 'adhd', 'developmental_delay'], weight: 0.6, documentationPhrase: 'abnormal social behaviour' },
    ],
  },

  // ══ SECTION 14: SPECIAL TESTS ══
  {
    id: 'neuro_lhermitte', section: 'special_tests', sectionOrder: 89, cardNumber: 89,
    label: 'Lhermitte Sign',
    question: 'Lhermitte sign (electric shock sensation on neck flexion)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Lhermitte sign is negative' },
      { value: 'positive', label: 'Positive (electric shock down the spine/limbs)', documentationPhrase: 'Lhermitte sign is positive suggesting cervical cord or dorsal column involvement' },
    ],
    documentationTemplate: 'Lhermitte: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Multiple sclerosis', supportsDisease: ['multiple_sclerosis', 'cervical_myelopathy'], weight: 0.7, documentationPhrase: 'positive Lhermitte' },
    ],
  },
  {
    id: 'neuro_slr', section: 'special_tests', sectionOrder: 90, cardNumber: 90,
    label: 'Straight Leg Raise',
    question: 'Straight leg raise / Lasègue sign',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative (>70° without radicular pain)', documentationPhrase: 'straight leg raise is negative (no radicular pain reproduced)' },
      { value: 'positive_left', label: 'Positive left (reproduces radicular pain <70°)', documentationPhrase: 'straight leg raise is positive on the left suggesting lumbar nerve root irritation (L4-S1)' },
      { value: 'positive_right', label: 'Positive right', documentationPhrase: 'straight leg raise is positive on the right' },
      { value: 'crossed', label: 'Crossed SLR positive', documentationPhrase: 'crossed straight leg raise is positive suggesting disc herniation' },
    ],
    documentationTemplate: 'SLR: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Lumbar disc herniation', supportsDisease: ['lumbar_disc', 'sciatica', 'radiculopathy'], weight: 0.7, documentationPhrase: 'positive straight leg raise' },
    ],
  },
  {
    id: 'neuro_spurling', section: 'special_tests', sectionOrder: 91, cardNumber: 91,
    label: 'Spurling Test',
    question: 'Spurling test (cervical nerve root compression)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Spurling test is negative' },
      { value: 'positive_left', label: 'Positive left (reproduces radicular pain)', documentationPhrase: 'Spurling test is positive on the left suggesting cervical radiculopathy' },
      { value: 'positive_right', label: 'Positive right', documentationPhrase: 'Spurling test is positive on the right' },
    ],
    documentationTemplate: 'Spurling: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Cervical radiculopathy', supportsDisease: ['cervical_radiculopathy', 'cervical_disc'], weight: 0.6, documentationPhrase: 'positive Spurling test' },
    ],
  },
  {
    id: 'neuro_tinel_peripheral', section: 'special_tests', sectionOrder: 92, cardNumber: 92,
    label: 'Tinel / Phalen',
    question: 'Tinel and Phalen tests (carpal tunnel)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Both negative', documentationPhrase: 'Tinel and Phalen tests are negative' },
      { value: 'tinel_positive', label: 'Tinel positive (tapping over carpal tunnel to paraesthesia)', documentationPhrase: 'Tinel sign is positive suggesting carpal tunnel syndrome' },
      { value: 'phalen_positive', label: 'Phalen positive (wrist flexion to paraesthesia)', documentationPhrase: 'Phalen test is positive suggesting carpal tunnel syndrome' },
    ],
    documentationTemplate: 'Tinel/Phalen: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Carpal tunnel', supportsDisease: ['carpal_tunnel_syndrome'], weight: 0.6, documentationPhrase: 'positive Tinel/Phalen' },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────
// GET SECTION ORDER FOR A GIVEN MODE
// ─────────────────────────────────────────────────────────────────

export function getNeuroSectionOrder(mode: NeuroExamMode): NeuroSection[] {
  switch (mode) {
    case 'complete': return NEURO_SECTION_ORDER_COMPLETE;
    case 'medical': return NEURO_SECTION_ORDER_MEDICAL;
    case 'emergency': return NEURO_SECTION_ORDER_EMERGENCY;
    case 'ward': return NEURO_SECTION_ORDER_WARD;
    case 'pediatric': return NEURO_SECTION_ORDER_PEDIATRIC;
    case 'neonatal': return NEURO_SECTION_ORDER_NEONATAL;
    default: return NEURO_SECTION_ORDER_MEDICAL;
  }
}

// ─────────────────────────────────────────────────────────────────
// FILTER CARDS BY AGE, MODE, CONTEXT
// ─────────────────────────────────────────────────────────────────

export function filterNeuroCards(
  cards: NeuroCardDef[],
  ctx: NeuroContext,
  mode: NeuroExamMode,
): NeuroCardDef[] {
  return cards.filter(card => {
    const cv = card.contextVisibility;
    if (mode === 'secondary' && !cv.screeningMode) return false;
    if (cv.hideForAgeBands?.includes(ctx.ageBand)) return false;
    if (cv.showForAgeBands && !cv.showForAgeBands.includes(ctx.ageBand)) return false;
    if (cv.showForSex && !cv.showForSex.includes(ctx.sex)) return false;
    if (cv.showForPregnancy && !ctx.pregnant) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────
// GET EXPANDED CARD IDS (conditional expansion)
// ─────────────────────────────────────────────────────────────────

export function getNeuroExpandedCardIds(
  findings: Record<string, unknown>,
  cards: NeuroCardDef[],
): Set<string> {
  const expanded = new Set<string>();
  for (const card of cards) {
    const val = findings[card.id];
    if (val == null || val === '' || val === false) continue;
    if (card.conditionalExpand) {
      const vals = Array.isArray(val) ? val : [val];
      const triggerHit = card.conditionalExpand.triggerValues.some(tv =>
        vals.some((v: unknown) => String(v) === tv),
      );
      if (triggerHit) {
        for (const eid of card.conditionalExpand.expandCardIds) {
          expanded.add(eid);
        }
      }
    }
  }
  return expanded;
}

// ─────────────────────────────────────────────────────────────────
// CHECK IF SCREENING TO PRIMARY AUTO-ESCALATION
// ─────────────────────────────────────────────────────────────────

export function shouldEscalateNeuroToPrimary(findings: Record<string, unknown>): boolean {
  const escFindings = [
    'scr_neuro_consciousness', 'scr_neuro_speech', 'scr_neuro_pupils',
    'scr_neuro_power', 'scr_neuro_tone', 'scr_neuro_plantar',
  ];
  for (const fId of escFindings) {
    const val = findings[fId];
    if (val != null && val !== '' && val !== false) {
      const strVal = String(val);
      if (strVal !== 'alert' && strVal !== 'normal' && strVal !== 'flexor' &&
          strVal !== 'full_power' && strVal !== '5_all') {
        return true;
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────
// GENERATE NEUROLOGICAL NARRATIVE
// ─────────────────────────────────────────────────────────────────

function findDocPhrase(cards: NeuroCardDef[], cardId: string, value: unknown): string {
  const card = cards.find(c => c.id === cardId);
  if (!card) return String(value);
  if (card.type === 'numeric' || card.type === 'text') {
    return card.documentationTemplate.replace(/\\{value\\}/g, String(value));
  }
  const opt = card.options.find(o => o.value === String(value));
  return opt ? opt.documentationPhrase : String(value);
}

function getNormalValue(card: NeuroCardDef, mode: NeuroExamMode): string | null {
  if (mode === 'secondary') return null;
  const normals: Record<string, string> = {
    neuro_appearance: 'well_groomed',
    neuro_behaviour: 'appropriate',
    neuro_mood: 'euthymic',
    neuro_orientation: 'fully_oriented',
    neuro_memory: 'intact',
    neuro_attention: 'intact',
    neuro_insight: 'intact',
    neuro_thought: 'normal',
    neuro_executive: 'intact',
    neuro_speech_fluency: 'fluent',
    neuro_speech_articulation: 'clear',
    neuro_voice: 'normal',
    neuro_prosody: 'normal',
    neuro_avpu: 'alert',
    neuro_pupils_reaction: 'normal',
    neuro_cn3_eye_movements: 'full',
    neuro_cn7_facial: 'normal',
    neuro_cn1_smell: 'intact',
    neuro_cn2_acuity: 'normal',
    neuro_cn5_motor: 'normal',
    neuro_cn5_sensory: 'normal',
    neuro_cn5_corneal: 'intact',
    neuro_cn8_hearing: 'normal',
    neuro_cn9_gag: 'normal',
    neuro_cn11_scm: 'normal',
    neuro_cn12_tongue: 'normal',
    neuro_tone: 'normal',
    neuro_power_upper: '5_all',
    neuro_power_lower: '5_all',
    neuro_power_pattern: 'none',
    neuro_pronator_drift: 'absent',
    neuro_involuntary_movements: 'none',
    neuro_dtr_upper: 'normal',
    neuro_dtr_lower: 'normal',
    neuro_clonus: 'absent',
    neuro_plantar: 'flexor',
    neuro_sensory_primary: 'intact',
    neuro_coordination_upper: 'normal',
    neuro_coordination_lower: 'normal',
    neuro_gait: 'normal',
    neuro_romberg: 'negative',
  };
  return normals[card.id] ?? null;
}

export function generateNeurologicalNarrative(
  cards: NeuroCardDef[],
  findings: Record<string, unknown>,
  mode: NeuroExamMode,
): string {
  if (mode === 'secondary') {
    const consciousness = findings['scr_neuro_consciousness'];
    const speech = findings['scr_neuro_speech'];
    const pupils = findings['scr_neuro_pupils'];
    const power = findings['scr_neuro_power'];
    const tone = findings['scr_neuro_tone'];
    const plantar = findings['scr_neuro_plantar'];

    const hasAbnormal =
      (consciousness && String(consciousness) !== 'alert') ||
      (speech && String(speech) !== 'normal') ||
      (pupils && String(pupils) !== 'normal') ||
      (power && String(power) !== 'normal') ||
      (tone && String(tone) !== 'normal') ||
      (plantar && String(plantar) !== 'flexor');

    if (hasAbnormal) {
      const parts: string[] = ['**Neurological System:**'];
      if (consciousness && String(consciousness) !== 'alert') parts.push(findDocPhrase(cards, 'scr_neuro_consciousness', consciousness));
      if (speech && String(speech) !== 'normal') parts.push(findDocPhrase(cards, 'scr_neuro_speech', speech));
      if (pupils && String(pupils) !== 'normal') parts.push(findDocPhrase(cards, 'scr_neuro_pupils', pupils));
      if (power && String(power) !== 'normal') parts.push(findDocPhrase(cards, 'scr_neuro_power', power));
      if (tone && String(tone) !== 'normal') parts.push(findDocPhrase(cards, 'scr_neuro_tone', tone));
      if (plantar && String(plantar) !== 'flexor') parts.push(findDocPhrase(cards, 'scr_neuro_plantar', plantar));
      return parts.join(' ');
    }

    return '**Neurological System:** The patient is alert and fully oriented. Speech is normal. Pupils are equal and reactive to light. Power is 5/5 in all four limbs. Tone is normal. Plantar responses are flexor bilaterally.';
  }

  const sections: NeuroSection[] = mode === 'complete'
    ? ['mental_status', 'higher_cortical', 'speech_language', 'consciousness', 'cranial_nerves', 'motor_system', 'reflexes', 'sensory_system', 'coordination', 'gait', 'meningeal_signs', 'special_tests', 'neonatal', 'pediatric']
    : mode === 'medical'
    ? ['mental_status', 'speech_language', 'cranial_nerves', 'motor_system', 'reflexes', 'sensory_system', 'coordination', 'gait']
    : ['consciousness', 'cranial_nerves', 'motor_system', 'reflexes', 'speech_language'];

  const paraParts: string[] = [];

  for (const section of sections) {
    const sectionCards = cards.filter(c => c.section === section);
    const phrases: string[] = [];

    for (const card of sectionCards) {
      const val = findings[card.id];
      if (val == null || val === '' || val === false) continue;

      const vals = Array.isArray(val) ? val : [val];
      for (const v of vals) {
        const normalVal = getNormalValue(card, mode);
        if (v === 'none' || v === 'absent' || v === 'normal' || v === 'intact' ||
            v === 'not_palpable' || v === 'equal' || v === normalVal) continue;
        if (card.type === 'multi_select' && v === 'none') continue;
        const phrase = findDocPhrase(cards, card.id, v);
        if (phrase) phrases.push(phrase);
      }
    }

    if (phrases.length > 0) {
      paraParts.push(phrases.join('; '));
    }
  }

  if (paraParts.length === 0) {
    if (mode === 'neonatal') {
      return '**Neurological Examination:** The neonate has normal posture, cry, and behaviour. Tone is appropriate for gestational age. Primitive reflexes including Moro, sucking, grasp, stepping, and ATNR are present.';
    }
    if (mode === 'pediatric' || mode === 'complete' || mode === 'medical') {
      return '**Neurological System:** The patient is conscious, alert and fully oriented to time, place and person. Speech is fluent with intact comprehension and repetition. Cranial nerves II-XII are grossly intact. Muscle bulk, tone and power are normal in all four limbs. Deep tendon reflexes are physiological and symmetrical, with bilateral flexor plantar responses. Sensory examination is intact to all modalities. Coordination is preserved, and gait is normal with a negative Romberg sign. No meningeal signs are elicited.';
    }
    return '**Neurological System:** The patient is conscious and alert. Speech is normal. Pupils are equal and reactive. Power is 5/5 throughout. Tone is normal. Plantars are flexor.';
  }

  return '**Neurological Examination:** ' + paraParts.join('. ');
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE GRAPH
// ─────────────────────────────────────────────────────────────────

export interface NeuroEvidenceGraphNode {
  finding: string;
  findingLabel: string;
  localizations: string[];
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];
  monitoring: string[];
}

export function buildNeuroEvidenceGraph(
  findings: Record<string, unknown>,
  cards: NeuroCardDef[],
): NeuroEvidenceGraphNode[] {
  const graph: NeuroEvidenceGraphNode[] = [];

  for (const card of cards) {
    const val = findings[card.id];
    if (val == null || val === '' || val === false) continue;
    if (card.evidenceLinks.length === 0) continue;

    const localizations = [...new Set(card.evidenceLinks.map(l => l.localization).filter(Boolean))] as string[];
    const mechanisms = [...new Set(card.evidenceLinks.map(l => l.mechanism).filter(Boolean))] as string[];
    const phenotypes = [...new Set(card.evidenceLinks.map(l => l.phenotype).filter(Boolean))] as string[];
    const diseases = [...new Set(card.evidenceLinks.flatMap(l => l.supportsDisease))];

    const node: NeuroEvidenceGraphNode = {
      finding: card.id,
      findingLabel: card.label,
      localizations,
      mechanisms,
      phenotypes,
      diseases,
      investigations: getNeuroInvestigations(diseases),
      monitoring: ['Level of consciousness', 'GCS', 'Pupils', 'Motor function'],
    };
    graph.push(node);
  }

  return graph;
}

function getNeuroInvestigations(diseases: string[]): string[] {
  const map: Record<string, string[]> = {
    stroke: ['CT brain', 'MRI brain', 'Carotid Doppler', 'ECG', 'Echocardiogram', 'Lipids', 'Coagulation'],
    brainstem_stroke: ['MRI brain', 'MRA head and neck', 'ECG', 'Echocardiogram'],
    tia: ['CT brain', 'Carotid Doppler', 'ECG', 'Echocardiogram', 'MRI brain'],
    head_injury: ['CT head', 'C-spine CT', 'Skull X-ray', 'Coagulation'],
    raised_icp: ['CT head', 'ICP monitoring', 'Fundoscopy', 'MRI brain'],
    brain_tumour: ['MRI brain with contrast', 'CT head', 'Biopsy'],
    meningitis: ['LP with CSF culture', 'Blood cultures', 'CRP', 'CT head', 'PCR'],
    subarachnoid_haemorrhage: ['CT head', 'LP for xanthochromia', 'CTA/MRA'],
    multiple_sclerosis: ['MRI brain and spine', 'LP for OCBs', 'Visual evoked potentials', 'VEP'],
    dementia: ['MRI brain', 'Neuropsychometry', 'Bloods (B12, TFT, syphilis)', 'PET scan'],
    alzheimers: ['MRI brain', 'CSF amyloid/tau', 'PET amyloid', 'Neuropsychometry'],
    parkinsons: ['Clinical diagnosis', 'DaTSCAN', 'MRI brain'],
    epilepsy: ['EEG', 'MRI brain', 'Sleep-deprived EEG', 'Ambulatory EEG'],
    motor_neuron_disease: ['EMG', 'NCS', 'MRI brain and spine', 'Bloods (CK, LFT, TFT)'],
    myasthenia_gravis: ['Acetylcholine receptor antibodies', 'Repetitive nerve stimulation', 'CT thorax', 'Single fibre EMG'],
    peripheral_neuropathy: ['NCS', 'EMG', 'Bloods (B12, TFT, HbA1c, ANA, RF)', 'Nerve biopsy'],
    polyneuropathy: ['NCS', 'EMG', 'Bloods (B12, TFT, HbA1c, SPEP)', 'Nerve biopsy'],
    spinal_cord_lesion: ['MRI spine', 'CT spine', 'NCS', 'SSEP'],
    cervical_myelopathy: ['MRI cervical spine', 'CT cervical spine'],
    cervical_radiculopathy: ['MRI cervical spine', 'EMG', 'NCS'],
    lumbar_disc: ['MRI lumbar spine', 'CT lumbar spine', 'NCS'],
    sciatica: ['MRI lumbar spine', 'NCS/EMG'],
    radiculopathy: ['MRI spine', 'EMG', 'NCS'],
    cauda_equina: ['Emergency MRI lumbar spine', 'CT lumbar spine'],
    cerebellar_lesion: ['MRI brain', 'CT head'],
    normal_pressure_hydrocephalus: ['MRI brain', 'LP with CSF drainage', 'ICP monitoring'],
    huntingtons: ['Genetic testing (HTT)', 'MRI brain', 'Neuropsychometry'],
    cerebral_palsy: ['MRI brain', 'Developmental assessment', 'Assessment of care needs'],
    autism: ['Developmental assessment', 'ADOS', 'ADI-R', 'Genetic testing'],
    adhd: ['Clinical assessment', 'Conners scales', 'Vanderbilt scales'],
    developmental_delay: ['Metabolic screen', 'Genetic testing', 'MRI brain', 'EEG'],
    neonatal_encephalopathy: ['Cranial US', 'MRI brain', 'EEG', 'Amplitude-integrated EEG'],
    hie: ['MRI brain (DWI)', 'Cranial US', 'EEG', 'Cord gas'],
    carpal_tunnel_syndrome: ['NCS', 'EMG'],
    bell_palsy: ['Clinical diagnosis', 'MRI brain/IAM (if atypical)'],
    acoustic_neuroma: ['MRI IAM', 'Pure tone audiometry'],
    trigeminal_neuralgia: ['MRI brain with trigeminal protocol', 'MRA'],
    vestibular_lesion: ['Videonystagmography (VNG)', 'Caloric testing', 'MRI IAM', 'Head impulse test'],
    bppv: ['Dix-Hallpike', 'Videonystagmography'],
    encephalopathy: ['Bloods (LFT, U&E, ammonia, glucose)', 'EEG', 'CT/MRI brain', 'Sepsis screen'],
    frontal_lobe_damage: ['MRI brain', 'Neuropsychometry'],
    parietal_lesion: ['MRI brain', 'CT head', 'Visual fields'],
    occipital_lesion: ['MRI brain', 'CT head', 'Visual fields'],
    pituitary_tumour: ['MRI pituitary', 'Visual fields', 'Endocrine screen'],
    optic_neuritis: ['MRI brain and orbits', 'Visual evoked potentials', 'LP for OCBs'],
    syringomyelia: ['MRI whole spine', 'MRI brain'],
    conduction_aphasia: ['MRI brain', 'CT head', 'Speech and language assessment'],
    korsakoffs: ['MRI brain', 'Thiamine levels', 'Bloods (LFT, U&E)'],
    depression: ['Clinical assessment', 'PHQ-9', 'GAD-7'],
    psychosis: ['Clinical assessment', 'CT/MRI brain', 'Toxicology screen'],
    bipolar: ['Clinical assessment', 'Mood diary', 'Bloods (TFT, U&E)'],
  };
  const invs = new Set<string>();
  for (const d of diseases) {
    const key = d.toLowerCase();
    if (map[key]) {
      for (const inv of map[key]) invs.add(inv);
    }
  }
  return [...invs];
}
