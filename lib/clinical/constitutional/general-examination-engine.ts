// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal General Examination Engine (UGEE)
// Constitutional Volume — 25-card structured flow
// Follows Hutchison's, Macleod's, Talley & O'Connor, Bates
// ═══════════════════════════════════════════════════════════════

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export interface GeneralExamContext {
  ageBand: AgeBand;
  sex: 'male' | 'female';
  pregnant: boolean;
  knownDiseases: string[];
  chiefComplaints: string[];
  consciousLevel: string;
}

// ─── GE Card Definition ───

export type GEFindingType = 'single_select' | 'multi_select' | 'boolean' | 'text' | 'numeric';

export interface GEOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersCascade?: string;
  triggersFindings?: string[];
}

export interface GECardDef {
  id: string;
  cardNumber: number;
  label: string;
  question: string;
  type: GEFindingType;
  options: GEOption[];
  documentationTemplate: string;
  contextVisibility: {
    showForAgeBands?: AgeBand[];
    hideForAgeBands?: AgeBand[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    alwaysShow?: boolean;
  };
  conditionalExpand?: {
    triggerValues: string[];
    expandCardIds: string[];
  };
  cascadeTrigger?: string;
  cascadeTargetCardIds?: string[];
}

// ─── The 25-card General Examination Flow ───

export const GENERAL_EXAMINATION_CARDS: GECardDef[] = [
  // ── CARD 1: Overall Appearance ──
  {
    id: 'ge_appearance', cardNumber: 1,
    label: 'Overall Appearance',
    question: 'How does the patient appear?',
    type: 'multi_select',
    options: [
      { value: 'well', label: 'Well looking', documentationPhrase: 'well looking, alert and cooperative' },
      { value: 'mildly_ill', label: 'Mildly ill', documentationPhrase: 'mildly ill appearing' },
      { value: 'moderately_ill', label: 'Moderately ill', documentationPhrase: 'moderately ill appearing' },
      { value: 'severely_ill', label: 'Severely ill', documentationPhrase: 'severely ill appearing' },
      { value: 'toxic', label: 'Toxic / Septic appearing', documentationPhrase: 'toxic appearing' },
      { value: 'cachectic', label: 'Cachectic', documentationPhrase: 'cachectic' },
      { value: 'chronically_ill', label: 'Chronically ill', documentationPhrase: 'chronically ill appearing' },
      { value: 'obese', label: 'Obese', documentationPhrase: 'obese habitus' },
      { value: 'thin', label: 'Thin', documentationPhrase: 'thin' },
      { value: 'wasted', label: 'Wasted', documentationPhrase: 'wasted' },
      { value: 'frail', label: 'Frail', documentationPhrase: 'frail' },
      { value: 'anxious', label: 'Anxious', documentationPhrase: 'anxious' },
      { value: 'agitated', label: 'Agitated', documentationPhrase: 'agitated' },
      { value: 'restless', label: 'Restless', documentationPhrase: 'restless' },
      { value: 'comfortable', label: 'Comfortable', documentationPhrase: 'comfortable' },
      { value: 'pain', label: 'In obvious pain', documentationPhrase: 'in obvious pain' },
      { value: 'respiratory_distress', label: 'In respiratory distress', documentationPhrase: 'in respiratory distress' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 2: Conscious Level ──
  {
    id: 'ge_consciousness', cardNumber: 2,
    label: 'Level of Consciousness',
    question: 'What is the patient\'s level of consciousness?',
    type: 'single_select',
    options: [
      { value: 'alert', label: 'Alert', documentationPhrase: 'alert and oriented to time, place and person' },
      { value: 'voice', label: 'Responds to voice', documentationPhrase: 'responds to voice' },
      { value: 'pain', label: 'Responds to pain', documentationPhrase: 'responds only to painful stimuli' },
      { value: 'unresponsive', label: 'Unresponsive', documentationPhrase: 'unresponsive' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['voice', 'pain', 'unresponsive'],
      expandCardIds: ['ge_gcs'],
    },
  },

  // ── CARD 2b: GCS (conditional) ──
  {
    id: 'ge_gcs', cardNumber: 2,
    label: 'Glasgow Coma Scale',
    question: 'GCS Score',
    type: 'numeric',
    options: [],
    documentationTemplate: 'GCS was {fifteenslash} / 15 (E{eye} V{verbal} M{motor}).',
    contextVisibility: { alwaysShow: false },
  },

  // ── CARD 3: Distress ──
  {
    id: 'ge_distress', cardNumber: 3,
    label: 'Distress',
    question: 'Is the patient in distress?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'not in obvious distress' },
      { value: 'pain', label: 'Pain', documentationPhrase: 'in painful distress' },
      { value: 'respiratory', label: 'Respiratory', documentationPhrase: 'in respiratory distress' },
      { value: 'cardiovascular', label: 'Cardiovascular', documentationPhrase: 'in cardiovascular distress' },
      { value: 'neurological', label: 'Neurological', documentationPhrase: 'in neurological distress' },
      { value: 'psychological', label: 'Psychological', documentationPhrase: 'in psychological distress' },
      { value: 'metabolic', label: 'Metabolic', documentationPhrase: 'metabolic distress' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['respiratory'],
      expandCardIds: ['ge_resp_distress_severity'],
    },
  },

  // ── CARD 3b: Respiratory Distress Severity ──
  {
    id: 'ge_resp_distress_severity', cardNumber: 3,
    label: 'Respiratory Distress Details',
    question: 'Respiratory distress features:',
    type: 'multi_select',
    options: [
      { value: 'accessory_muscle', label: 'Accessory muscle use', documentationPhrase: 'using accessory muscles of respiration' },
      { value: 'grunting', label: 'Grunting', documentationPhrase: 'grunting' },
      { value: 'tripod', label: 'Tripod positioning', documentationPhrase: 'tripod positioning' },
      { value: 'retractions', label: 'Retractions (intercostal/subcostal)', documentationPhrase: 'intercostal and subcostal retractions' },
      { value: 'nasal_flaring', label: 'Nasal flaring', documentationPhrase: 'nasal flaring' },
      { value: 'head_bobbing', label: 'Head bobbing', documentationPhrase: 'head bobbing' },
      { value: 'tracheal_tug', label: 'Tracheal tug', documentationPhrase: 'tracheal tug present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { hideForAgeBands: ['neonate', 'infant', 'toddler'] },
  },

  // ── CARD 4: Hydration Status ──
  {
    id: 'ge_hydration', cardNumber: 4,
    label: 'Hydration Status',
    question: 'What is the patient\'s hydration status?',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'adequately hydrated' },
      { value: 'mild_dehydration', label: 'Mild dehydration', documentationPhrase: 'mildly dehydrated' },
      { value: 'moderate_dehydration', label: 'Moderate dehydration', documentationPhrase: 'moderately dehydrated' },
      { value: 'severe_dehydration', label: 'Severe dehydration', documentationPhrase: 'severely dehydrated' },
      { value: 'overhydrated', label: 'Overhydrated / Fluid overload', documentationPhrase: 'fluid overloaded' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['mild_dehydration', 'moderate_dehydration', 'severe_dehydration'],
      expandCardIds: ['ge_dehydration_signs'],
    },
  },

  // ── CARD 4b: Dehydration Signs ──
  {
    id: 'ge_dehydration_signs', cardNumber: 4,
    label: 'Dehydration Signs',
    question: 'Dehydration signs present:',
    type: 'multi_select',
    options: [
      { value: 'dry_mucosa', label: 'Dry mucosa', documentationPhrase: 'dry oral mucosa' },
      { value: 'sunken_eyes', label: 'Sunken eyes', documentationPhrase: 'sunken eyes' },
      { value: 'reduced_turgor', label: 'Reduced skin turgor', documentationPhrase: 'reduced skin turgor' },
      { value: 'absent_tears', label: 'Absent tears', documentationPhrase: 'absent tears' },
      { value: 'prolonged_cr', label: 'Prolonged capillary refill', documentationPhrase: 'prolonged capillary refill > 2 seconds' },
      { value: 'reduced_urine', label: 'Reduced urine output', documentationPhrase: 'reduced urine output' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
  },

  // ── CARD 5: Nutritional Status ──
  {
    id: 'ge_nutrition', cardNumber: 5,
    label: 'Nutritional Status',
    question: 'What is the patient\'s nutritional status?',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal / Well nourished', documentationPhrase: 'well nourished' },
      { value: 'underweight', label: 'Underweight', documentationPhrase: 'underweight' },
      { value: 'overweight', label: 'Overweight', documentationPhrase: 'overweight' },
      { value: 'obese', label: 'Obese', documentationPhrase: 'obese' },
      { value: 'cachectic', label: 'Cachectic', documentationPhrase: 'cachectic' },
      { value: 'wasted', label: 'Wasted (visible muscle wasting)', documentationPhrase: 'wasted with visible muscle wasting' },
      { value: 'sam', label: 'Severe Acute Malnutrition', documentationPhrase: 'severely malnourished with signs of SAM' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 6: Body Habitus ──
  {
    id: 'ge_habitus', cardNumber: 6,
    label: 'Body Habitus',
    question: 'Describe the patient\'s body habitus:',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'normal body habitus' },
      { value: 'short_stature', label: 'Short stature', documentationPhrase: 'short stature' },
      { value: 'tall_stature', label: 'Tall stature', documentationPhrase: 'tall stature' },
      { value: 'marfanoid', label: 'Marfanoid', documentationPhrase: 'marfanoid habitus' },
      { value: 'cushingoid', label: 'Cushingoid', documentationPhrase: 'cushingoid habitus' },
      { value: 'acromegalic', label: 'Acromegalic features', documentationPhrase: 'acromegalic features' },
      { value: 'dysmorphic', label: 'Dysmorphic features', documentationPhrase: 'dysmorphic features' },
      { value: 'kyphotic', label: 'Kyphotic', documentationPhrase: 'kyphotic posture' },
      { value: 'scoliotic', label: 'Scoliotic', documentationPhrase: 'scoliotic posture' },
    ],
    documentationTemplate: 'The patient has {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 7: Mobility & Gait ──
  {
    id: 'ge_mobility', cardNumber: 7,
    label: 'Mobility & Gait',
    question: 'What is the patient\'s mobility status?',
    type: 'single_select',
    options: [
      { value: 'independent', label: 'Walking independently', documentationPhrase: 'ambulating independently' },
      { value: 'aid', label: 'Walking with aid', documentationPhrase: 'ambulating with walking aid' },
      { value: 'wheelchair', label: 'Wheelchair-bound', documentationPhrase: 'wheelchair-bound' },
      { value: 'bedbound', label: 'Bedbound', documentationPhrase: 'bedbound' },
      { value: 'unable_to_assess', label: 'Unable to assess', documentationPhrase: 'unable to assess mobility' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { hideForAgeBands: ['neonate', 'infant'] },
  },

  // ── CARD 8: Speech ──
  {
    id: 'ge_speech', cardNumber: 8,
    label: 'Speech',
    question: 'Describe the patient\'s speech:',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'speech is normal' },
      { value: 'slurred', label: 'Slurred', documentationPhrase: 'speech is slurred' },
      { value: 'hoarse', label: 'Hoarse', documentationPhrase: 'hoarse voice' },
      { value: 'aphasic', label: 'Aphasic', documentationPhrase: 'aphasic' },
      { value: 'dysarthric', label: 'Dysarthric', documentationPhrase: 'dysarthric speech' },
      { value: 'mute', label: 'Mute', documentationPhrase: 'mute' },
      { value: 'weak_cry', label: 'Weak cry (infant)', documentationPhrase: 'weak cry' },
      { value: 'high_cry', label: 'High-pitched cry (infant)', documentationPhrase: 'high-pitched cry' },
      { value: 'inappropriate', label: 'Inappropriate / Pressured', documentationPhrase: 'inappropriate speech content' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 9: Odours ──
  {
    id: 'ge_odour', cardNumber: 9,
    label: 'Characteristic Odours',
    question: 'Are there any characteristic odours?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None / Normal', documentationPhrase: 'no characteristic odour' },
      { value: 'ketotic', label: 'Ketotic / Acetone', documentationPhrase: 'ketotic breath odour' },
      { value: 'alcohol', label: 'Alcohol', documentationPhrase: 'alcohol on breath' },
      { value: 'uremic', label: 'Uremic', documentationPhrase: 'uremic breath odour' },
      { value: 'hepatic', label: 'Hepatic (fetor hepaticus)', documentationPhrase: 'fetor hepaticus' },
      { value: 'foul', label: 'Foul / Purulent', documentationPhrase: 'foul odour' },
      { value: 'pseudomonas', label: 'Pseudomonas (grape-like)', documentationPhrase: 'grape-like pseudomonas odour' },
      { value: 'anaerobic', label: 'Anaerobic (putrid)', documentationPhrase: 'putrid anaerobic odour' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 10: Pallor ──
  {
    id: 'ge_pallor', cardNumber: 10,
    label: 'Pallor / Anaemia',
    question: 'Is pallor present?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no pallor' },
      { value: 'mild', label: 'Mild', documentationPhrase: 'mild pallor' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate pallor' },
      { value: 'severe', label: 'Severe', documentationPhrase: 'severe pallor' },
    ],
    documentationTemplate: '{value} conjunctival pallor is noted.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['mild', 'moderate', 'severe'],
      expandCardIds: ['ge_pallor_sites'],
    },
  },

  // ── CARD 10b: Pallor Sites ──
  {
    id: 'ge_pallor_sites', cardNumber: 10,
    label: 'Pallor Sites',
    question: 'Pallor noted at:',
    type: 'multi_select',
    options: [
      { value: 'conjunctiva', label: 'Conjunctiva', documentationPhrase: 'conjunctival pallor' },
      { value: 'palmar_creases', label: 'Palmar creases', documentationPhrase: 'pale palmar creases' },
      { value: 'nail_beds', label: 'Nail beds', documentationPhrase: 'pale nail beds' },
      { value: 'tongue', label: 'Tongue', documentationPhrase: 'pale tongue' },
      { value: 'generalized', label: 'Generalized skin pallor', documentationPhrase: 'generalized skin pallor' },
    ],
    documentationTemplate: 'Pallor noted at {value}.',
    contextVisibility: { alwaysShow: false },
  },

  // ── CARD 11: Jaundice ──
  {
    id: 'ge_jaundice', cardNumber: 11,
    label: 'Jaundice / Icterus',
    question: 'Is jaundice present?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no jaundice' },
      { value: 'mild', label: 'Mild / Scleral icterus', documentationPhrase: 'mild scleral icterus' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate jaundice' },
      { value: 'severe', label: 'Severe', documentationPhrase: 'deep jaundice' },
    ],
    documentationTemplate: '{value} is present.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 12: Cyanosis ──
  {
    id: 'ge_cyanosis', cardNumber: 12,
    label: 'Cyanosis',
    question: 'Is cyanosis present?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no cyanosis' },
      { value: 'central', label: 'Central', documentationPhrase: 'central cyanosis' },
      { value: 'peripheral', label: 'Peripheral', documentationPhrase: 'peripheral cyanosis' },
      { value: 'mixed', label: 'Mixed', documentationPhrase: 'mixed cyanosis' },
    ],
    documentationTemplate: '{value} is present.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['central', 'peripheral', 'mixed'],
      expandCardIds: ['ge_cyanosis_sites'],
    },
  },

  // ── CARD 12b: Cyanosis Sites ──
  {
    id: 'ge_cyanosis_sites', cardNumber: 12,
    label: 'Cyanosis Sites',
    question: 'Cyanosis noted at:',
    type: 'multi_select',
    options: [
      { value: 'lips', label: 'Lips', documentationPhrase: 'central cyanosis of lips' },
      { value: 'tongue', label: 'Tongue', documentationPhrase: 'cyanosis of tongue' },
      { value: 'fingers', label: 'Fingers / Nail beds', documentationPhrase: 'cyanosis of fingertips' },
      { value: 'toes', label: 'Toes', documentationPhrase: 'cyanosis of toes' },
      { value: 'circumoral', label: 'Circumoral', documentationPhrase: 'circumoral cyanosis' },
    ],
    documentationTemplate: 'Cyanosis noted at {value}.',
    contextVisibility: { alwaysShow: false },
  },

  // ── CARD 13: Clubbing ──
  {
    id: 'ge_clubbing', cardNumber: 13,
    label: 'Digital Clubbing',
    question: 'Is digital clubbing present?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no digital clubbing' },
      { value: 'grade1', label: 'Grade I — Fluctuation of nail bed', documentationPhrase: 'Grade I clubbing — increased fluctuation of nail bed' },
      { value: 'grade2', label: 'Grade II — Loss of Lovibond\'s angle', documentationPhrase: 'Grade II clubbing — loss of Lovibond\'s angle' },
      { value: 'grade3', label: 'Grade III — Drumstick appearance', documentationPhrase: 'Grade III clubbing — drumstick appearance' },
      { value: 'grade4', label: 'Grade IV — Hypertrophic osteoarthropathy', documentationPhrase: 'Grade IV clubbing with hypertrophic osteoarthropathy' },
    ],
    documentationTemplate: 'Digital clubbing: {value}.',
    contextVisibility: { hideForAgeBands: ['neonate', 'infant'] },
  },

  // ── CARD 14: Lymphadenopathy ──
  {
    id: 'ge_lymphadenopathy', cardNumber: 14,
    label: 'Lymphadenopathy',
    question: 'Is lymphadenopathy present?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no clinically significant lymphadenopathy' },
      { value: 'present', label: 'Present', documentationPhrase: 'lymphadenopathy present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    cascadeTrigger: 'lymph_node_cascade',
    conditionalExpand: {
      triggerValues: ['present'],
      expandCardIds: ['ge_ln_region', 'ge_ln_size', 'ge_ln_tender', 'ge_ln_consistency', 'ge_ln_mobility'],
    },
  },

  // ── CARD 14b-n: Lymph Node Cascade ──
  {
    id: 'ge_ln_region', cardNumber: 14,
    label: 'LN Region',
    question: 'Lymph node region(s) involved:',
    type: 'multi_select',
    options: [
      { value: 'cervical', label: 'Cervical', documentationPhrase: 'cervical lymphadenopathy' },
      { value: 'axillary', label: 'Axillary', documentationPhrase: 'axillary lymphadenopathy' },
      { value: 'inguinal', label: 'Inguinal', documentationPhrase: 'inguinal lymphadenopathy' },
      { value: 'supraclavicular', label: 'Supraclavicular', documentationPhrase: 'supraclavicular lymphadenopathy' },
      { value: 'epitrochlear', label: 'Epitrochlear', documentationPhrase: 'epitrochlear lymphadenopathy' },
      { value: 'generalized', label: 'Generalized', documentationPhrase: 'generalized lymphadenopathy' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
  },
  {
    id: 'ge_ln_size', cardNumber: 14, label: 'LN Size', question: 'Maximum node size (cm):',
    type: 'numeric', options: [], documentationTemplate: 'Nodes measure {value} cm.',
    contextVisibility: { alwaysShow: false },
  },
  {
    id: 'ge_ln_tender', cardNumber: 14, label: 'LN Tenderness', question: 'Are the nodes tender?',
    type: 'boolean', options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'tender lymph nodes' },
      { value: 'no', label: 'No', documentationPhrase: 'non-tender lymph nodes' },
    ], documentationTemplate: 'Nodes are {value}.',
    contextVisibility: { alwaysShow: false },
  },
  {
    id: 'ge_ln_consistency', cardNumber: 14, label: 'LN Consistency', question: 'Consistency:',
    type: 'single_select', options: [
      { value: 'soft', label: 'Soft', documentationPhrase: 'soft' },
      { value: 'firm', label: 'Firm', documentationPhrase: 'firm' },
      { value: 'hard', label: 'Hard', documentationPhrase: 'hard' },
      { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery' },
    ], documentationTemplate: 'Nodes are {value}.',
    contextVisibility: { alwaysShow: false },
  },
  {
    id: 'ge_ln_mobility', cardNumber: 14, label: 'LN Mobility', question: 'Mobility:',
    type: 'single_select', options: [
      { value: 'mobile', label: 'Mobile', documentationPhrase: 'mobile' },
      { value: 'matted', label: 'Matted', documentationPhrase: 'matted together' },
      { value: 'fixed', label: 'Fixed to underlying tissue', documentationPhrase: 'fixed to underlying structures' },
    ], documentationTemplate: 'Nodes are {value}.',
    contextVisibility: { alwaysShow: false },
  },

  // ── CARD 15: Edema ──
  {
    id: 'ge_edema', cardNumber: 15,
    label: 'Edema',
    question: 'Is edema present?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no peripheral edema' },
      { value: 'pitting_mild', label: 'Pitting + / Mild', documentationPhrase: 'mild pitting edema' },
      { value: 'pitting_moderate', label: 'Pitting ++ / Moderate', documentationPhrase: 'moderate pitting edema' },
      { value: 'pitting_severe', label: 'Pitting +++ / Severe', documentationPhrase: 'severe pitting edema' },
      { value: 'non_pitting', label: 'Non-pitting', documentationPhrase: 'non-pitting edema' },
      { value: 'anasarca', label: 'Anasarca / Generalized', documentationPhrase: 'anasarca' },
    ],
    documentationTemplate: '{value} edema is present.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['pitting_mild', 'pitting_moderate', 'pitting_severe', 'non_pitting', 'anasarca'],
      expandCardIds: ['ge_edema_site'],
    },
  },

  // ── CARD 15b: Edema Site ──
  {
    id: 'ge_edema_site', cardNumber: 15,
    label: 'Edema Distribution',
    question: 'Edema distribution:',
    type: 'multi_select',
    options: [
      { value: 'pedal', label: 'Pedal / Ankle', documentationPhrase: 'pedal edema' },
      { value: 'pretibial', label: 'Pretibial / Lower leg', documentationPhrase: 'pretibial edema' },
      { value: 'sacral', label: 'Sacral', documentationPhrase: 'sacral edema' },
      { value: 'periorbital', label: 'Periorbital', documentationPhrase: 'periorbital edema' },
      { value: 'scrotal', label: 'Scrotal / Labial', documentationPhrase: 'scrotal edema' },
      { value: 'hand', label: 'Hands', documentationPhrase: 'hand edema' },
      { value: 'generalized', label: 'Generalized (anasarca)', documentationPhrase: 'generalized edema' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
  },

  // ── CARD 16: Peripheral Perfusion ──
  {
    id: 'ge_perfusion', cardNumber: 16,
    label: 'Peripheral Perfusion',
    question: 'Peripheral perfusion status:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'well perfused with warm peripheries' },
      { value: 'cold_peripheries', label: 'Cold peripheries', documentationPhrase: 'cold peripheries' },
      { value: 'prolonged_cr', label: 'Prolonged capillary refill', documentationPhrase: 'capillary refill time prolonged > 2 seconds' },
      { value: 'weak_pulse', label: 'Weak / Thready pulse', documentationPhrase: 'weak peripheral pulses' },
      { value: 'bounding_pulse', label: 'Bounding pulse', documentationPhrase: 'bounding peripheral pulses' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 17: Skin (Quick Survey) ──
  {
    id: 'ge_skin', cardNumber: 17,
    label: 'Skin (Quick Survey)',
    question: 'Skin findings on general survey:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'skin is normal' },
      { value: 'rash', label: 'Rash', documentationPhrase: 'rash noted' },
      { value: 'petechiae', label: 'Petechiae', documentationPhrase: 'petechiae' },
      { value: 'purpura', label: 'Purpura / Ecchymosis', documentationPhrase: 'purpura' },
      { value: 'hyperpigmentation', label: 'Hyperpigmentation', documentationPhrase: 'skin hyperpigmentation' },
      { value: 'hypopigmentation', label: 'Hypopigmentation', documentationPhrase: 'skin hypopigmentation' },
      { value: 'ulcers', label: 'Ulcers / Sores', documentationPhrase: 'skin ulcers' },
      { value: 'pressure_sores', label: 'Pressure sores', documentationPhrase: 'pressure sores' },
      { value: 'scars', label: 'Scars', documentationPhrase: 'scars' },
      { value: 'track_marks', label: 'Track marks (IV drug use)', documentationPhrase: 'track marks' },
      { value: 'tattoos', label: 'Tattoos', documentationPhrase: 'tattoos' },
      { value: 'bruises', label: 'Bruises', documentationPhrase: 'bruises' },
      { value: 'burns', label: 'Burns', documentationPhrase: 'burns' },
      { value: 'birthmarks', label: 'Birthmarks', documentationPhrase: 'birthmarks' },
    ],
    documentationTemplate: 'Skin: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 18: Nails ──
  {
    id: 'ge_nails', cardNumber: 18,
    label: 'Nails',
    question: 'Nail findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'nails are normal' },
      { value: 'koilonychia', label: 'Koilonychia (spoon nails)', documentationPhrase: 'koilonychia' },
      { value: 'leukonychia', label: 'Leukonychia (white nails)', documentationPhrase: 'leukonychia' },
      { value: 'splinter_hem', label: 'Splinter hemorrhages', documentationPhrase: 'splinter hemorrhages' },
      { value: 'clubbing', label: 'Clubbing (see above)', documentationPhrase: 'clubbing' },
      { value: 'onychomycosis', label: 'Onychomycosis (fungal)', documentationPhrase: 'onychomycosis' },
      { value: 'pitting', label: 'Nail pitting', documentationPhrase: 'nail pitting' },
    ],
    documentationTemplate: 'Nails: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 19: Hands ──
  {
    id: 'ge_hands', cardNumber: 19,
    label: 'Hands',
    question: 'Hand examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'hands are normal' },
      { value: 'tremor', label: 'Tremor', documentationPhrase: 'fine tremor of hands' },
      { value: 'asterixis', label: 'Asterixis (flapping)', documentationPhrase: 'asterixis' },
      { value: 'dupuytren', label: 'Dupuytren\'s contracture', documentationPhrase: 'Dupuytren\'s contracture' },
      { value: 'palmar_erythema', label: 'Palmar erythema', documentationPhrase: 'palmar erythema' },
      { value: 'nicotine', label: 'Nicotine staining', documentationPhrase: 'nicotine staining' },
      { value: 'cold', label: 'Cold hands', documentationPhrase: 'cold hands' },
      { value: 'sweating', label: 'Excessive sweating', documentationPhrase: 'palmar hyperhidrosis' },
    ],
    documentationTemplate: 'Hands: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 20: Face ──
  {
    id: 'ge_face', cardNumber: 20,
    label: 'Face',
    question: 'Facial examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'facies are normal' },
      { value: 'puffiness', label: 'Puffy / Moon face', documentationPhrase: 'facial puffiness' },
      { value: 'mask', label: 'Mask-like facies', documentationPhrase: 'mask-like facies' },
      { value: 'cushingoid', label: 'Cushingoid facies', documentationPhrase: 'cushingoid facies' },
      { value: 'parkinsonian', label: 'Parkinsonian facies', documentationPhrase: 'parkinsonian facies' },
      { value: 'asymmetry', label: 'Facial asymmetry', documentationPhrase: 'facial asymmetry' },
      { value: 'dysmorphism', label: 'Dysmorphic features', documentationPhrase: 'dysmorphic facial features' },
      { value: 'proptosis', label: 'Proptosis / Exophthalmos', documentationPhrase: 'proptosis' },
      { value: 'ptosis', label: 'Ptosis', documentationPhrase: 'ptosis' },
    ],
    documentationTemplate: 'Face: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 21: Eyes ──
  {
    id: 'ge_eyes', cardNumber: 21,
    label: 'Eyes (Quick Screen)',
    question: 'Eye examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'eyes are normal' },
      { value: 'pale_conjunctiva', label: 'Pale conjunctiva', documentationPhrase: 'pale conjunctiva' },
      { value: 'injected', label: 'Injected / Red', documentationPhrase: 'conjunctival injection' },
      { value: 'icteric', label: 'Icteric sclera', documentationPhrase: 'icteric sclerae' },
      { value: 'discharge', label: 'Discharge', documentationPhrase: 'eye discharge' },
      { value: 'anisocoria', label: 'Anisocoria (unequal pupils)', documentationPhrase: 'anisocoria' },
      { value: 'nystagmus', label: 'Nystagmus', documentationPhrase: 'nystagmus' },
      { value: 'strabismus', label: 'Strabismus / Squint', documentationPhrase: 'strabismus' },
      { value: 'cataract', label: 'Cataract', documentationPhrase: 'cataract' },
    ],
    documentationTemplate: 'Eyes: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 22: Mouth & Throat ──
  {
    id: 'ge_mouth', cardNumber: 22,
    label: 'Mouth & Throat',
    question: 'Oral examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'oral cavity is normal' },
      { value: 'dry', label: 'Dry mucosa', documentationPhrase: 'dry oral mucosa' },
      { value: 'ulcers', label: 'Oral ulcers', documentationPhrase: 'oral ulcers' },
      { value: 'thrush', label: 'Oral thrush / Candidiasis', documentationPhrase: 'oral thrush' },
      { value: 'dental_caries', label: 'Dental caries', documentationPhrase: 'dental caries' },
      { value: 'poor_dentition', label: 'Poor dentition', documentationPhrase: 'poor dentition' },
      { value: 'halitosis', label: 'Halitosis', documentationPhrase: 'halitosis' },
      { value: 'pharyngeal_erythema', label: 'Pharyngeal erythema', documentationPhrase: 'pharyngeal erythema' },
      { value: 'tonsillar_exudate', label: 'Tonsillar exudate', documentationPhrase: 'tonsillar exudate' },
      { value: 'deviation', label: 'Uvula deviation', documentationPhrase: 'uvula deviation' },
    ],
    documentationTemplate: 'Mouth: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 23: Neck ──
  {
    id: 'ge_neck', cardNumber: 23,
    label: 'Neck',
    question: 'Neck examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'neck is normal' },
      { value: 'visible_mass', label: 'Visible mass', documentationPhrase: 'visible neck mass' },
      { value: 'goitre', label: 'Goitre / Thyroid enlargement', documentationPhrase: 'goitre' },
      { value: 'elevated_jvp', label: 'Elevated JVP', documentationPhrase: 'elevated JVP' },
      { value: 'deviated_trachea', label: 'Deviated trachea', documentationPhrase: 'tracheal deviation' },
      { value: 'scars', label: 'Scars', documentationPhrase: 'neck scars' },
      { value: 'lymph_nodes', label: 'Lymphadenopathy (see above)', documentationPhrase: 'neck lymphadenopathy' },
      { value: 'neck_stiffness', label: 'Neck stiffness', documentationPhrase: 'neck stiffness' },
    ],
    documentationTemplate: 'Neck: {value}.',
    contextVisibility: { alwaysShow: true },
  },

  // ── CARD 24: Breasts (context-dependent) ──
  {
    id: 'ge_breasts', cardNumber: 24,
    label: 'Breasts (Quick Screen)',
    question: 'Breast examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'breasts are normal' },
      { value: 'symmetrical', label: 'Symmetrical', documentationPhrase: 'breasts are symmetrical' },
      { value: 'asymmetry', label: 'Asymmetry', documentationPhrase: 'breast asymmetry' },
      { value: 'lump', label: 'Palpable lump', documentationPhrase: 'palpable breast lump' },
      { value: 'tenderness', label: 'Tenderness', documentationPhrase: 'breast tenderness' },
      { value: 'skin_changes', label: 'Skin changes (peau d\'orange)', documentationPhrase: 'peau d\'orange skin changes' },
      { value: 'nipple_retraction', label: 'Nipple retraction', documentationPhrase: 'nipple retraction' },
      { value: 'discharge', label: 'Nipple discharge', documentationPhrase: 'nipple discharge' },
    ],
    documentationTemplate: 'Breast: {value}.',
    contextVisibility: {
      showForSex: ['female'],
      showForPregnancy: true,
    },
  },

  // ── CARD 25: Back & Spine ──
  {
    id: 'ge_back', cardNumber: 25,
    label: 'Back & Spine',
    question: 'Back and spine examination findings:',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'back and spine are normal' },
      { value: 'kyphosis', label: 'Kyphosis', documentationPhrase: 'kyphosis' },
      { value: 'scoliosis', label: 'Scoliosis', documentationPhrase: 'scoliosis' },
      { value: 'tenderness', label: 'Spinal tenderness', documentationPhrase: 'spinal tenderness' },
      { value: 'sacral_edema', label: 'Sacral edema', documentationPhrase: 'sacral edema' },
      { value: 'piloniidal', label: 'Pilonidal sinus', documentationPhrase: 'pilonidal sinus' },
      { value: 'scars', label: 'Scars', documentationPhrase: 'back scars' },
    ],
    documentationTemplate: 'Back: {value}.',
    contextVisibility: { alwaysShow: true },
  },
];

// ─── Pediatric-specific overrides ───

export function getPediatricCardVisibility(cards: GECardDef[], ageBand: AgeBand): string[] {
  const hiddenAdultCards = ['ge_breasts', 'ge_odour'];
  const neonatalHiddenCards = ['ge_mobility', 'ge_clubbing', 'ge_gait', 'ge_speech'];
  if (ageBand === 'neonate') {
    return cards
      .filter(c => !neonatalHiddenCards.includes(c.id))
      .map(c => c.id);
  }
  if (ageBand === 'infant' || ageBand === 'toddler' || ageBand === 'child') {
    return cards
      .filter(c => !hiddenAdultCards.includes(c.id))
      .map(c => c.id);
  }
  return cards.map(c => c.id);
}

// ─── UGEE Narrative Generator ───

export interface GEFindings {
  [cardId: string]: string | string[] | number | boolean | null;
}

export function generateGeneralExamNarrative(
  cards: GECardDef[],
  findings: GEFindings,
  ctx: GeneralExamContext,
): string {
  const parts: string[] = [];

  // Card 1: General Appearance
  const appearance = findings['ge_appearance'] as string[] | undefined;
  if (appearance && appearance.length > 0 && !appearance.includes('well')) {
    const phrases = appearance.map(a => {
      const opt = GENERAL_EXAMINATION_CARDS[0].options.find(o => o.value === a);
      return opt?.documentationPhrase || a;
    });
    parts.push(`The patient appears ${phrases.join(', ')}.`);
  }

  // Conscious level
  const consciousness = findings['ge_consciousness'] as string | undefined;
  if (consciousness === 'alert') {
    parts.push('The patient is alert and oriented to time, place and person.');
  } else if (consciousness) {
    const opt = GENERAL_EXAMINATION_CARDS[1].options.find(o => o.value === consciousness);
    if (opt) parts.push(`The patient ${opt.documentationPhrase}.`);
  }

  // Distress
  const distress = findings['ge_distress'] as string[] | undefined;
  if (distress && distress.length > 0 && !distress.includes('none')) {
    const phrases = distress.map(d => {
      const opt = GENERAL_EXAMINATION_CARDS[2].options.find(o => o.value === d);
      return opt?.documentationPhrase || d;
    });
    parts.push(`The patient is ${phrases.join(', ')}.`);
  } else if (distress?.includes('none')) {
    parts.push('The patient is not in obvious distress.');
  }

  // Hydration
  const hydration = findings['ge_hydration'] as string | undefined;
  if (hydration) {
    if (hydration === 'normal') parts.push('The patient is adequately hydrated.');
    else if (hydration === 'overhydrated') parts.push('The patient appears fluid overloaded.');
    else parts.push(`The patient appears ${hydration.replace(/_/g, ' ')}.`);
  }

  // Nutrition
  const nutrition = findings['ge_nutrition'] as string | undefined;
  if (nutrition) {
    if (nutrition === 'normal') parts.push('The patient is well nourished.');
    else if (nutrition === 'sam') parts.push('The patient is severely malnourished with signs of SAM.');
    else parts.push(`The patient appears ${nutrition}.`);
  }

  // Pallor
  const pallor = findings['ge_pallor'] as string | undefined;
  if (pallor && pallor !== 'absent') {
    parts.push(`${pallor} conjunctival pallor is noted.`);
  }

  // Jaundice
  const jaundice = findings['ge_jaundice'] as string | undefined;
  if (jaundice && jaundice !== 'absent') {
    parts.push(`${jaundice.replace(/_/g, ' ')} jaundice is present.`);
  }

  // Cyanosis
  const cyanosis = findings['ge_cyanosis'] as string | undefined;
  if (cyanosis && cyanosis !== 'absent') {
    parts.push(`${cyanosis} cyanosis is present.`);
  }

  // Clubbing
  const clubbing = findings['ge_clubbing'] as string | undefined;
  if (clubbing && clubbing !== 'absent') {
    parts.push(`Digital clubbing is present (${clubbing.replace(/_/g, ' ')}).`);
  }

  // Edema
  const edema = findings['ge_edema'] as string | undefined;
  if (edema && edema !== 'absent') {
    const edemaLabel = edema === 'anasarca' ? 'anasarca' : `${edema.replace(/_/g, ' ')} edema`;
    parts.push(`${edemaLabel} is present.`);
  }

  // Lymphadenopathy
  const ln = findings['ge_lymphadenopathy'] as string | undefined;
  if (ln === 'present') {
    const region = findings['ge_ln_region'] as string[] | undefined;
    if (region && region.length > 0) {
      parts.push(`Lymphadenopathy is noted in the ${region.join(' and ')} region(s).`);
    } else {
      parts.push('Lymphadenopathy is present.');
    }
  }

  // Hands
  const hands = findings['ge_hands'] as string[] | undefined;
  if (hands && hands.length > 0 && !hands.includes('normal')) {
    const phrases = hands.map(h => {
      const opt = GENERAL_EXAMINATION_CARDS.find(c => c.id === 'ge_hands')?.options.find(o => o.value === h);
      return opt?.documentationPhrase || h;
    });
    parts.push(`Hands: ${phrases.join('; ')}.`);
  }

  // Negative findings summary (things checked and found normal)
  const negativeChecks: string[] = [];
  if (pallor === 'absent') negativeChecks.push('pallor');
  if (jaundice === 'absent') negativeChecks.push('jaundice');
  if (cyanosis === 'absent') negativeChecks.push('cyanosis');
  if (clubbing === 'absent' || clubbing == null) negativeChecks.push('clubbing');
  if (edema === 'absent' || edema == null) negativeChecks.push('edema');
  if (ln === 'absent' || ln == null) negativeChecks.push('significant lymphadenopathy');

  if (negativeChecks.length > 0) {
    const last = negativeChecks.pop()!;
    const prefix = negativeChecks.length > 0 ? negativeChecks.join(', ') + ' and ' : '';
    parts.push(`There is no ${prefix}${last}.`);
  }

  return parts.join(' ');
}
