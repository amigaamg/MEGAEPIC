// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal Respiratory Examination Engine (UREE)
// Constitutional Volume — full structured respiratory exam flow
// Follows Hutchison's, Macleod's, Talley & O'Connor, Bates, Nelson
// ═══════════════════════════════════════════════════════════════

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type RespExamMode = 'primary' | 'secondary';

export type RespSection =
  | 'preparation' | 'observation' | 'hands' | 'face' | 'neck'
  | 'chest_inspection' | 'palpation' | 'percussion' | 'auscultation'
  | 'special_manoeuvres' | 'summary';

export interface RespContext {
  ageBand: AgeBand;
  sex: 'male' | 'female';
  pregnant: boolean;
  knownDiseases: string[];
  chiefComplaints: string[];
  activeModules: string[];
  findings: Record<string, unknown>;
}

export interface RespOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersCascade?: string;
  triggersFindings?: string[];
}

export interface EvidenceLink {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  documentationPhrase: string;
}

export interface RespConditionalExpand {
  triggerValues: string[];
  expandCardIds: string[];
}

export interface RespCascadeTrigger {
  findingValuePattern: string[];
  expandSection: RespSection;
  expandCardIds: string[];
  explanation: string;
}

export interface RespCardDef {
  id: string;
  section: RespSection;
  sectionOrder: number;
  cardNumber: number;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: RespOption[];
  documentationTemplate: string;
  contextVisibility: {
    showForAgeBands?: AgeBand[];
    hideForAgeBands?: AgeBand[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    alwaysShow?: boolean;
    screeningMode?: boolean;
  };
  conditionalExpand?: RespConditionalExpand;
  cascadeTrigger?: RespCascadeTrigger;
  evidenceLinks: EvidenceLink[];
}

// ─────────────────────────────────────────────────────────────────
// MODE DETECTION
// ─────────────────────────────────────────────────────────────────

export function detectRespiratoryMode(ctx: RespContext): RespExamMode {
  const respKeywords = [
    'cough', 'dyspnea', 'breathlessness', 'shortness of breath', 'wheeze',
    'chest pain', 'haemoptysis', 'sputum', 'hemoptysis', 'stridor',
    'respiratory', 'breathing', 'difficulty breathing', 'pneumonia',
    'asthma', 'copd', 'bronchitis', 'bronchiolitis', 'croup', 'tb',
    'chest infection', 'lung', 'pleuritic', 'orthopnea', 'pnd',
  ];
  const respDiseases = [
    'asthma', 'copd', 'pneumonia', 'tb', 'bronchiectasis', 'covid19',
    'influenza', 'lung_cancer', 'pleural_effusion', 'pneumothorax',
    'pulmonary_embolism', 'croup', 'bronchiolitis', 'cf',
  ];

  const hasRespComplaint = ctx.chiefComplaints.some(c =>
    respKeywords.some(k => c.toLowerCase().includes(k)),
  );
  const hasRespDisease = ctx.knownDiseases.some(d =>
    respDiseases.includes(d),
  );
  const hasRespModule = ctx.activeModules.some(m =>
    ['respiratory', 'pulmonology', 'cardiology'].includes(m.toLowerCase()),
  );

  if (hasRespComplaint || hasRespDisease || hasRespModule) return 'primary';

  const respFindings = [
    'respiratory_rate', 'resp_shape', 'resp_movements', 'resp_trachea',
    'resp_added_sounds', 'resp_breath_sounds', 'resp_percussion_note',
  ];
  const hasRespFindings = respFindings.some(f => {
    const v = ctx.findings[f];
    return v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0);
  });
  if (hasRespFindings) return 'primary';

  return 'secondary';
}

// ─────────────────────────────────────────────────────────────────
// AUTO-ESCALATION RULES
// ─────────────────────────────────────────────────────────────────

export const RESP_AUTO_ESCALATION_RULES: RespCascadeTrigger[] = [
  {
    findingValuePattern: ['reduced', 'absent', 'bronchial'],
    expandSection: 'percussion',
    expandCardIds: ['resp_percussion_note', 'resp_percussion_diaphragm'],
    explanation: 'Abnormal breath sounds detected — expanding percussion assessment',
  },
  {
    findingValuePattern: ['wheeze', 'wheezing'],
    expandSection: 'auscultation',
    expandCardIds: ['resp_wheeze_character', 'resp_wheeze_timing', 'resp_peak_flow'],
    explanation: 'Wheeze detected — expanding for wheeze characterisation',
  },
  {
    findingValuePattern: ['stridor'],
    expandSection: 'neck',
    expandCardIds: ['resp_trachea', 'resp_jvp', 'resp_neck_muscles'],
    explanation: 'Stridor detected — expanding upper airway assessment',
  },
  {
    findingValuePattern: ['crackles', 'crepitations'],
    expandSection: 'auscultation',
    expandCardIds: ['resp_crackle_character', 'resp_crackle_timing', 'resp_crackle_distribution'],
    explanation: 'Crackles detected — expanding for crackle characterisation',
  },
  {
    findingValuePattern: ['pleural_rub'],
    expandSection: 'auscultation',
    expandCardIds: ['resp_pleural_rub', 'resp_percussion_note'],
    explanation: 'Pleural rub detected — expanding for pleural assessment',
  },
  {
    findingValuePattern: ['reduced_left', 'reduced_right', 'bilateral_reduced', 'accessory_muscle', 'intercostal_recession'],
    expandSection: 'observation',
    expandCardIds: ['resp_distress_level', 'resp_respiratory_distress_expand', 'resp_oxygen'],
    explanation: 'Respiratory distress signs detected — expanding distress assessment',
  },
];

// ─────────────────────────────────────────────────────────────────
// SECONDARY (SCREENING) CARDS — 5-card minimal set
// ─────────────────────────────────────────────────────────────────

export const RESP_SCREENING_CARDS: RespCardDef[] = [
  {
    id: 'scr_chest_movement', section: 'chest_inspection', sectionOrder: 1, cardNumber: 1,
    label: 'Chest Movement',
    question: 'Chest movement',
    type: 'single_select',
    options: [
      { value: 'symmetrical', label: 'Symmetrical', documentationPhrase: 'chest movements are symmetrical' },
      { value: 'mild_asymmetry', label: 'Mild asymmetry', documentationPhrase: 'mild asymmetry of chest movements' },
      { value: 'marked_asymmetry', label: 'Marked asymmetry', documentationPhrase: 'marked asymmetry of chest movements' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'pleural_effusion', 'pneumothorax'], weight: 0.4, documentationPhrase: 'chest asymmetry' },
    ],
  },
  {
    id: 'scr_chest_expansion', section: 'chest_inspection', sectionOrder: 2, cardNumber: 2,
    label: 'Chest Expansion',
    question: 'Chest expansion',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'with normal chest expansion' },
      { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'with reduced expansion on the left' },
      { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'with reduced expansion on the right' },
      { value: 'diffuse_reduced', label: 'Diffuse reduction', documentationPhrase: 'with diffusely reduced expansion' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'pleural_effusion', 'fibrosis'], weight: 0.5, documentationPhrase: 'reduced chest expansion' },
    ],
  },
  {
    id: 'scr_air_entry', section: 'auscultation', sectionOrder: 3, cardNumber: 3,
    label: 'Air Entry',
    question: 'Air entry',
    type: 'single_select',
    options: [
      { value: 'equal_bilateral', label: 'Equal bilateral', documentationPhrase: 'air entry is equal bilaterally' },
      { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'air entry is reduced on the left' },
      { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'air entry is reduced on the right' },
      { value: 'reduced_diffuse', label: 'Diffuse reduction', documentationPhrase: 'air entry is diffusely reduced' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'pleural_effusion', 'pneumothorax', 'asthma'], weight: 0.5, documentationPhrase: 'reduced air entry' },
    ],
  },
  {
    id: 'scr_breath_sounds', section: 'auscultation', sectionOrder: 4, cardNumber: 4,
    label: 'Breath Sounds',
    question: 'Breath sounds',
    type: 'single_select',
    options: [
      { value: 'normal_vesicular', label: 'Normal vesicular', documentationPhrase: 'normal vesicular breath sounds' },
      { value: 'bronchial', label: 'Bronchial', documentationPhrase: 'bronchial breath sounds' },
      { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced breath sounds' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'absent breath sounds' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'consolidation'], weight: 0.6, documentationPhrase: 'bronchial breath sounds' },
      { supportsDisease: ['pleural_effusion', 'pneumothorax'], weight: 0.5, documentationPhrase: 'reduced breath sounds' },
    ],
  },
  {
    id: 'scr_added_sounds', section: 'auscultation', sectionOrder: 5, cardNumber: 5,
    label: 'Added Sounds',
    question: 'Added sounds',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no added sounds' },
      { value: 'crackles', label: 'Crackles', documentationPhrase: 'crackles are heard' },
      { value: 'wheeze', label: 'Wheeze', documentationPhrase: 'wheeze is heard' },
      { value: 'rhonchi', label: 'Rhonchi', documentationPhrase: 'rhonchi are heard' },
      { value: 'pleural_rub', label: 'Pleural rub', documentationPhrase: 'a pleural rub is heard' },
      { value: 'stridor', label: 'Stridor', documentationPhrase: 'stridor is heard' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'bronchiectasis', 'heart_failure'], weight: 0.6, documentationPhrase: 'crackles on auscultation' },
      { supportsDisease: ['asthma', 'copd'], weight: 0.6, documentationPhrase: 'wheeze on auscultation' },
      { supportsDisease: ['croup', 'epiglottitis', 'foreign_body'], weight: 0.7, documentationPhrase: 'stridor' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// PRIMARY CARDS — the full 25-card respiratory examination flow
// ─────────────────────────────────────────────────────────────────

export const RESP_CARDS: RespCardDef[] = [

  // ══ PART 0: PREPARATION ══
  {
    id: 'resp_prep_reminder', section: 'preparation', sectionOrder: 0, cardNumber: 0,
    label: 'Preparation',
    question: 'Preparation complete?',
    type: 'single_select',
    options: [
      { value: 'complete', label: '✓ Patient appropriately exposed, good lighting, sitting, consent obtained', documentationPhrase: '' },
    ],
    documentationTemplate: '',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },

  // ══ PART 1: OBSERVATION FROM FOOT OF BED ══
  {
    id: 'resp_appearance', section: 'observation', sectionOrder: 1, cardNumber: 1,
    label: 'General Appearance',
    question: 'General appearance (imported from general exam — no repetition)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal / Comfortable', documentationPhrase: 'The patient is seated comfortably and is not in respiratory distress' },
      { value: 'distressed', label: 'In respiratory distress', documentationPhrase: 'The patient appears dyspnoeic' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'asthma', 'copd', 'heart_failure'], weight: 0.3, documentationPhrase: 'in respiratory distress' },
    ],
  },
  {
    id: 'resp_distress_level', section: 'observation', sectionOrder: 2, cardNumber: 2,
    label: 'Respiratory Distress',
    question: 'Degree of respiratory distress',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No distress', documentationPhrase: 'not in respiratory distress' },
      { value: 'mild', label: 'Mild', documentationPhrase: 'mild respiratory distress' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate respiratory distress' },
      { value: 'severe', label: 'Severe', documentationPhrase: 'severe respiratory distress' },
    ],
    documentationTemplate: 'The patient has {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Increased work of breathing', supportsDisease: ['pneumonia', 'asthma', 'copd', 'bronchiolitis', 'heart_failure'], weight: 0.5, documentationPhrase: 'in respiratory distress' },
    ],
    conditionalExpand: {
      triggerValues: ['mild', 'moderate', 'severe'],
      expandCardIds: ['resp_respiratory_distress_expand', 'resp_oxygen'],
    },
  },
  {
    id: 'resp_respiratory_distress_expand', section: 'observation', sectionOrder: 3, cardNumber: 3,
    label: 'Respiratory Distress Signs',
    question: 'Respiratory distress signs',
    type: 'multi_select',
    options: [
      { value: 'accessory_muscles', label: 'Accessory muscle use', documentationPhrase: 'with marked use of accessory muscles' },
      { value: 'intercostal_recession', label: 'Intercostal recession', documentationPhrase: 'intercostal recession' },
      { value: 'subcostal_recession', label: 'Subcostal recession', documentationPhrase: 'subcostal recession' },
      { value: 'suprasternal_recession', label: 'Suprasternal recession', documentationPhrase: 'suprasternal recession' },
      { value: 'grunting', label: 'Grunting', documentationPhrase: 'grunting' },
      { value: 'tripod', label: 'Tripod posture', documentationPhrase: 'adopting tripod posture' },
      { value: 'nasal_flaring', label: 'Nasal flaring', documentationPhrase: 'nasal flaring' },
      { value: 'head_bobbing', label: 'Head bobbing (infants)', documentationPhrase: 'head bobbing' },
      { value: 'apnea', label: 'Apnea', documentationPhrase: 'apneic episodes' },
    ],
    documentationTemplate: 'There is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { mechanism: 'Increased work of breathing', phenotype: 'Respiratory failure', supportsDisease: ['pneumonia', 'asthma', 'bronchiolitis', 'copd'], weight: 0.6, documentationPhrase: 'accessory muscle use' },
      { mechanism: 'Airway obstruction', phenotype: 'Respiratory failure', supportsDisease: ['croup', 'epiglottitis', 'foreign_body'], weight: 0.6, documentationPhrase: 'suprasternal recession' },
    ],
  },
  {
    id: 'resp_oxygen', section: 'observation', sectionOrder: 4, cardNumber: 4,
    label: 'Oxygen / Respiratory Support',
    question: 'Oxygen delivery method',
    type: 'single_select',
    options: [
      { value: 'room_air', label: 'Room air', documentationPhrase: 'on room air' },
      { value: 'nasal_prongs', label: 'Nasal prongs', documentationPhrase: 'receiving oxygen via nasal prongs' },
      { value: 'simple_mask', label: 'Simple face mask', documentationPhrase: 'receiving oxygen via simple face mask' },
      { value: 'non_rebreather', label: 'Non-rebreather mask', documentationPhrase: 'receiving oxygen via non-rebreather mask' },
      { value: 'hfnc', label: 'HFNC', documentationPhrase: 'on high-flow nasal cannula' },
      { value: 'cpap', label: 'CPAP', documentationPhrase: 'on CPAP' },
      { value: 'bipap', label: 'BiPAP', documentationPhrase: 'on BiPAP' },
      { value: 'ventilator', label: 'Ventilator', documentationPhrase: 'mechanically ventilated' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { mechanism: 'Respiratory failure', supportsDisease: ['pneumonia', 'asthma', 'copd', 'ards'], weight: 0.5, documentationPhrase: 'on oxygen therapy' },
    ],
  },

  // ══ PART 2: HANDS ══
  {
    id: 'resp_clubbing', section: 'hands', sectionOrder: 5, cardNumber: 5,
    label: 'Clubbing',
    question: 'Digital clubbing',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no digital clubbing' },
      { value: 'mild', label: 'Mild', documentationPhrase: 'mild digital clubbing' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate digital clubbing' },
      { value: 'severe', label: 'Severe / Drumstick', documentationPhrase: 'severe drumstick clubbing' },
      { value: 'hypertrophic_pulmonary', label: 'Hygp / Periosteal', documentationPhrase: 'hypertrophic pulmonary osteoarthropathy' },
    ],
    documentationTemplate: 'There is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Bronchiectasis', supportsDisease: ['bronchiectasis', 'ild', 'lung_cancer', 'cf', 'cyanotic_chd'], weight: 0.7, documentationPhrase: 'digital clubbing' },
    ],
  },
  {
    id: 'resp_cyanosis_peripheral', section: 'hands', sectionOrder: 6, cardNumber: 6,
    label: 'Peripheral Cyanosis',
    question: 'Peripheral cyanosis',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no peripheral cyanosis' },
      { value: 'present', label: 'Present', documentationPhrase: 'peripheral cyanosis is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['copd', 'heart_failure', 'shock'], weight: 0.5, documentationPhrase: 'peripheral cyanosis' },
    ],
  },
  {
    id: 'resp_nicotine_staining', section: 'hands', sectionOrder: 7, cardNumber: 7,
    label: 'Nicotine / Tar Staining',
    question: 'Nicotine or tar staining',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no nicotine staining' },
      { value: 'nicotine', label: 'Nicotine staining', documentationPhrase: 'nicotine staining of the fingers' },
      { value: 'tar', label: 'Tar staining', documentationPhrase: 'tar staining of the fingers' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { hideForAgeBands: ['neonate', 'infant', 'toddler'], alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['copd', 'lung_cancer'], weight: 0.3, documentationPhrase: 'nicotine staining' },
    ],
  },
  {
    id: 'resp_peripheral_perfusion', section: 'hands', sectionOrder: 8, cardNumber: 8,
    label: 'Peripheral Perfusion',
    question: 'Peripheral perfusion',
    type: 'single_select',
    options: [
      { value: 'warm', label: 'Warm / Well-perfused', documentationPhrase: 'peripherally warm and well-perfused' },
      { value: 'cold', label: 'Cold / Poor perfusion', documentationPhrase: 'peripherally cool with poor perfusion' },
    ],
    documentationTemplate: 'The patient is {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Shock', supportsDisease: ['sepsis', 'heart_failure', 'shock'], weight: 0.4, documentationPhrase: 'poor peripheral perfusion' },
    ],
  },
  {
    id: 'resp_capillary_refill', section: 'hands', sectionOrder: 9, cardNumber: 9,
    label: 'Capillary Refill',
    question: 'Capillary refill time (seconds)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Capillary refill time is {value} seconds.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { mechanism: 'Shock', supportsDisease: ['sepsis', 'dehydration', 'shock'], weight: 0.5, documentationPhrase: 'prolonged capillary refill' },
    ],
  },
  {
    id: 'resp_flapping_tremor', section: 'hands', sectionOrder: 10, cardNumber: 10,
    label: 'Flapping Tremor (Asterixis)',
    question: 'Flapping tremor / Asterixis',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no flapping tremor' },
      { value: 'present', label: 'Present', documentationPhrase: 'flapping tremor (asterixis) is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Hypercapnia', supportsDisease: ['copd', 'respiratory_failure'], weight: 0.7, documentationPhrase: 'asterixis suggesting hypercapnia' },
    ],
  },
  {
    id: 'resp_fine_tremor', section: 'hands', sectionOrder: 11, cardNumber: 11,
    label: 'Fine Tremor',
    question: 'Fine tremor',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no fine tremor' },
      { value: 'present', label: 'Present', documentationPhrase: 'fine tremor is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Beta-agonist effect', supportsDisease: ['asthma', 'copd'], weight: 0.3, documentationPhrase: 'fine tremor due to beta-agonist therapy' },
      { disease: 'Thyrotoxicosis', supportsDisease: ['thyrotoxicosis'], weight: 0.4, documentationPhrase: 'fine tremor' },
    ],
  },

  // ══ PART 3: FACE ══
  {
    id: 'resp_central_cyanosis', section: 'face', sectionOrder: 12, cardNumber: 12,
    label: 'Central Cyanosis',
    question: 'Central cyanosis (lips / tongue)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no central cyanosis' },
      { value: 'present', label: 'Present', documentationPhrase: 'central cyanosis is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Hypoxemia', supportsDisease: ['pneumonia', 'copd', 'congenital_heart_disease', 'respiratory_failure'], weight: 0.7, documentationPhrase: 'central cyanosis' },
    ],
  },
  {
    id: 'resp_pursed_lip', section: 'face', sectionOrder: 13, cardNumber: 13,
    label: 'Pursed Lip Breathing',
    question: 'Pursed lip breathing',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no pursed lip breathing' },
      { value: 'present', label: 'Present', documentationPhrase: 'pursed lip breathing is noted' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { disease: 'COPD', supportsDisease: ['copd'], weight: 0.6, documentationPhrase: 'pursed lip breathing' },
    ],
  },
  {
    id: 'resp_horner', section: 'face', sectionOrder: 14, cardNumber: 14,
    label: 'Horner Syndrome',
    question: 'Horner syndrome (ptosis, miosis, anhidrosis)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no Horner syndrome' },
      { value: 'present', label: 'Present', documentationPhrase: 'Horner syndrome is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Pancoast tumour', supportsDisease: ['lung_cancer'], weight: 0.7, documentationPhrase: 'Horner syndrome suggesting Pancoast tumour' },
    ],
  },
  {
    id: 'resp_facial_swelling', section: 'face', sectionOrder: 15, cardNumber: 15,
    label: 'Facial Swelling',
    question: 'Facial swelling / SVC obstruction',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no facial swelling' },
      { value: 'present', label: 'Present', documentationPhrase: 'facial swelling is present suggesting SVC obstruction' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'SVC obstruction', supportsDisease: ['lung_cancer', 'lymphoma', 'mediastinal_mass'], weight: 0.8, documentationPhrase: 'facial swelling suggesting SVC obstruction' },
    ],
  },

  // ══ PART 4: NECK ══
  {
    id: 'resp_trachea', section: 'neck', sectionOrder: 16, cardNumber: 16,
    label: 'Trachea',
    question: 'Tracheal position',
    type: 'single_select',
    options: [
      { value: 'central', label: 'Central', documentationPhrase: 'trachea is central' },
      { value: 'shifted_left', label: 'Shifted to left', documentationPhrase: 'trachea is shifted to the left' },
      { value: 'shifted_right', label: 'Shifted to right', documentationPhrase: 'trachea is shifted to the right' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Collapse', supportsDisease: ['lung_collapse', 'pneumothorax', 'pleural_effusion'], weight: 0.7, documentationPhrase: 'tracheal deviation' },
    ],
  },
  {
    id: 'resp_jvp', section: 'neck', sectionOrder: 17, cardNumber: 17,
    label: 'Jugular Venous Pressure',
    question: 'JVP (imported from CVS)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'JVP is normal' },
      { value: 'raised', label: 'Raised / Elevated', documentationPhrase: 'JVP is elevated' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['heart_failure', 'copd', 'constrictive_pericarditis'], weight: 0.5, documentationPhrase: 'elevated JVP' },
    ],
  },
  {
    id: 'resp_neck_lymph_nodes', section: 'neck', sectionOrder: 18, cardNumber: 18,
    label: 'Neck Lymph Nodes',
    question: 'Palpable cervical / supraclavicular lymph nodes',
    type: 'single_select',
    options: [
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'no palpable cervical or supraclavicular lymph nodes' },
      { value: 'supraclavicular', label: 'Supraclavicular nodes', documentationPhrase: 'palpable supraclavicular lymph nodes' },
      { value: 'cervical', label: 'Cervical nodes', documentationPhrase: 'palpable cervical lymph nodes' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Lung cancer', supportsDisease: ['lung_cancer', 'tb', 'lymphoma'], weight: 0.6, documentationPhrase: 'palpable supraclavicular node' },
    ],
  },
  {
    id: 'resp_neck_muscles', section: 'neck', sectionOrder: 19, cardNumber: 19,
    label: 'Neck Muscles',
    question: 'Accessory muscle use (neck)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'no accessory muscle use in the neck' },
      { value: 'scm_use', label: 'SCM use', documentationPhrase: 'sternocleidomastoid muscle use' },
      { value: 'scalenes', label: 'Scalene muscle use', documentationPhrase: 'scalene muscle use' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Increased work of breathing', supportsDisease: ['asthma', 'copd', 'pneumonia', 'bronchiolitis'], weight: 0.5, documentationPhrase: 'accessory muscle use' },
    ],
  },

  // ══ PART 5: CHEST INSPECTION ══
  {
    id: 'resp_chest_shape', section: 'chest_inspection', sectionOrder: 20, cardNumber: 20,
    label: 'Chest Shape',
    question: 'Chest shape',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'chest is normally shaped' },
      { value: 'barrel', label: 'Barrel-shaped', documentationPhrase: 'barrel-shaped chest' },
      { value: 'pectus_excavatum', label: 'Pectus excavatum', documentationPhrase: 'pectus excavatum' },
      { value: 'pectus_carinatum', label: 'Pectus carinatum', documentationPhrase: 'pectus carinatum' },
      { value: 'kyphosis', label: 'Kyphosis', documentationPhrase: 'kyphosis' },
      { value: 'scoliosis', label: 'Scoliosis', documentationPhrase: 'scoliosis' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'COPD', supportsDisease: ['copd'], weight: 0.5, documentationPhrase: 'barrel-shaped chest' },
    ],
  },
  {
    id: 'resp_chest_expansion', section: 'chest_inspection', sectionOrder: 21, cardNumber: 21,
    label: 'Chest Expansion (inspection)',
    question: 'Chest expansion symmetry',
    type: 'single_select',
    options: [
      { value: 'symmetrical', label: 'Symmetrical', documentationPhrase: 'chest expansion is symmetrical' },
      { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'chest expansion is reduced on the left' },
      { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'chest expansion is reduced on the right' },
      { value: 'diffuse_reduced', label: 'Diffusely reduced', documentationPhrase: 'chest expansion is diffusely reduced' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'pleural_effusion', 'fibrosis', 'pneumothorax'], weight: 0.5, documentationPhrase: 'reduced chest expansion' },
    ],
  },
  {
    id: 'resp_respiratory_rate', section: 'chest_inspection', sectionOrder: 22, cardNumber: 22,
    label: 'Respiratory Rate',
    question: 'Respiratory rate (imported from vitals)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Respiratory rate is {value} breaths per minute.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Tachypnoea', supportsDisease: ['pneumonia', 'asthma', 'copd', 'heart_failure', 'sepsis'], weight: 0.4, documentationPhrase: 'tachypnoeic at {value}/min' },
    ],
  },
  {
    id: 'resp_respiratory_pattern', section: 'chest_inspection', sectionOrder: 23, cardNumber: 23,
    label: 'Respiratory Pattern',
    question: 'Respiratory pattern',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'respiratory pattern is normal' },
      { value: 'cheyne_stokes', label: 'Cheyne-Stokes', documentationPhrase: 'Cheyne-Stokes respiration' },
      { value: 'kussmaul', label: 'Kussmaul', documentationPhrase: 'Kussmaul breathing' },
      { value: 'biot', label: 'Biot / Ataxic', documentationPhrase: 'Biot respiration' },
      { value: 'apneustic', label: 'Apneustic', documentationPhrase: 'apneustic breathing' },
      { value: 'agonal', label: 'Agonal', documentationPhrase: 'agonal respirations' },
    ],
    documentationTemplate: 'The patient has {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'CNS depression', supportsDisease: ['cva', 'metabolic_acidosis', 'increased_icp'], weight: 0.6, documentationPhrase: 'abnormal respiratory pattern' },
    ],
  },
  {
    id: 'resp_scars', section: 'chest_inspection', sectionOrder: 24, cardNumber: 24,
    label: 'Chest Scars',
    question: 'Chest wall scars',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no chest wall scars' },
      { value: 'thoracotomy', label: 'Thoracotomy scar', documentationPhrase: 'thoracotomy scar' },
      { value: 'chest_drain', label: 'Chest drain scar', documentationPhrase: 'previous chest drain scar' },
      { value: 'pacemaker', label: 'Pacemaker scar', documentationPhrase: 'pacemaker scar' },
      { value: 'sternotomy', label: 'Sternotomy scar', documentationPhrase: 'sternotomy scar' },
      { value: 'burn', label: 'Burn scar', documentationPhrase: 'burn scar on chest wall' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'resp_chest_drain', section: 'chest_inspection', sectionOrder: 25, cardNumber: 25,
    label: 'Chest Drain',
    question: 'Chest drain in situ',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no chest drain in situ' },
      { value: 'present_functional', label: 'Present — functioning', documentationPhrase: 'chest drain is in situ and functioning' },
      { value: 'present_blocked', label: 'Present — not functioning', documentationPhrase: 'chest drain is in situ but not functioning' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'resp_visible_masses', section: 'chest_inspection', sectionOrder: 26, cardNumber: 26,
    label: 'Visible Chest Masses',
    question: 'Visible chest wall masses',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no visible chest wall masses' },
      { value: 'present', label: 'Present', documentationPhrase: 'visible chest wall mass' },
    ],
    documentationTemplate: 'There {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'resp_dilated_veins', section: 'chest_inspection', sectionOrder: 27, cardNumber: 27,
    label: 'Dilated Chest Veins',
    question: 'Dilated chest wall veins',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no dilated chest wall veins' },
      { value: 'present', label: 'Present (SVC obstruction)', documentationPhrase: 'dilated chest wall veins suggesting SVC obstruction' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'SVC obstruction', supportsDisease: ['lung_cancer', 'mediastinal_mass'], weight: 0.7, documentationPhrase: 'dilated chest wall veins' },
    ],
  },
  {
    id: 'resp_intercostal_recession', section: 'chest_inspection', sectionOrder: 28, cardNumber: 28,
    label: 'Intercostal Recession',
    question: 'Intercostal recession',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no intercostal recession' },
      { value: 'mild', label: 'Mild', documentationPhrase: 'mild intercostal recession' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate intercostal recession' },
      { value: 'severe', label: 'Severe', documentationPhrase: 'severe intercostal recession' },
    ],
    documentationTemplate: 'There is {value}.',
    contextVisibility: { showForAgeBands: ['neonate', 'infant', 'toddler', 'child'] },
    evidenceLinks: [
      { mechanism: 'Increased work of breathing', supportsDisease: ['bronchiolitis', 'pneumonia', 'asthma', 'croup'], weight: 0.6, documentationPhrase: 'intercostal recession' },
    ],
  },

  // ══ PART 6: PALPATION ══
  {
    id: 'resp_palp_trachea', section: 'palpation', sectionOrder: 29, cardNumber: 29,
    label: 'Trachea (palpation confirm)',
    question: 'Confirm tracheal position by palpation',
    type: 'single_select',
    options: [
      { value: 'central', label: 'Central', documentationPhrase: 'trachea is central on palpation' },
      { value: 'deviated_left', label: 'Deviated left', documentationPhrase: 'trachea is deviated to the left on palpation' },
      { value: 'deviated_right', label: 'Deviated right', documentationPhrase: 'trachea is deviated to the right on palpation' },
    ],
    documentationTemplate: 'On palpation, the {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'resp_palp_expansion', section: 'palpation', sectionOrder: 30, cardNumber: 30,
    label: 'Chest Expansion (palpation)',
    question: 'Chest expansion on palpation',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'chest expansion is normal and symmetrical on palpation' },
      { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'reduced expansion on the left on palpation' },
      { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'reduced expansion on the right on palpation' },
      { value: 'bilateral_reduced', label: 'Bilaterally reduced', documentationPhrase: 'bilaterally reduced expansion on palpation' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'pleural_effusion', 'fibrosis', 'pneumothorax'], weight: 0.5, documentationPhrase: 'reduced expansion on palpation' },
    ],
  },
  {
    id: 'resp_tactile_vocal_fremitus', section: 'palpation', sectionOrder: 31, cardNumber: 31,
    label: 'Tactile Vocal Fremitus',
    question: 'Tactile vocal fremitus',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'tactile vocal fremitus is normal' },
      { value: 'increased', label: 'Increased', documentationPhrase: 'tactile vocal fremitus is increased' },
      { value: 'decreased', label: 'Decreased', documentationPhrase: 'tactile vocal fremitus is decreased' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'tactile vocal fremitus is absent' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { hideForAgeBands: ['neonate'] },
    evidenceLinks: [
      { supportsDisease: ['pneumonia', 'consolidation'], weight: 0.5, documentationPhrase: 'increased tactile vocal fremitus' },
      { supportsDisease: ['pleural_effusion', 'pneumothorax'], weight: 0.5, documentationPhrase: 'decreased tactile vocal fremitus' },
    ],
  },
  {
    id: 'resp_tenderness', section: 'palpation', sectionOrder: 32, cardNumber: 32,
    label: 'Chest Wall Tenderness',
    question: 'Chest wall tenderness',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no chest wall tenderness' },
      { value: 'present', label: 'Present', documentationPhrase: 'chest wall tenderness is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['costochondritis', 'trauma', 'pleurisy'], weight: 0.4, documentationPhrase: 'chest wall tenderness' },
    ],
  },
  {
    id: 'resp_subcutaneous_emphysema', section: 'palpation', sectionOrder: 33, cardNumber: 33,
    label: 'Subcutaneous Emphysema',
    question: 'Subcutaneous emphysema',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no subcutaneous emphysema' },
      { value: 'present', label: 'Present', documentationPhrase: 'subcutaneous emphysema is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['pneumothorax', 'chest_trauma'], weight: 0.7, documentationPhrase: 'subcutaneous emphysema' },
    ],
  },

  // ══ PART 7: PERCUSSION ══
  {
    id: 'resp_percussion_note', section: 'percussion', sectionOrder: 34, cardNumber: 34,
    label: 'Percussion Note',
    question: 'Percussion note',
    type: 'single_select',
    options: [
      { value: 'resonant', label: 'Resonant', documentationPhrase: 'percussion note is resonant throughout' },
      { value: 'dull', label: 'Dull', documentationPhrase: 'dull percussion note' },
      { value: 'stony_dull', label: 'Stony dull', documentationPhrase: 'stony dull percussion note' },
      { value: 'hyperresonant', label: 'Hyperresonant', documentationPhrase: 'hyperresonant percussion note' },
      { value: 'impaired', label: 'Impaired', documentationPhrase: 'impaired percussion note' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Pleural effusion', supportsDisease: ['pleural_effusion'], weight: 0.7, documentationPhrase: 'stony dull percussion note' },
      { disease: 'Pneumothorax', supportsDisease: ['pneumothorax', 'copd'], weight: 0.6, documentationPhrase: 'hyperresonant percussion note' },
      { disease: 'Consolidation', supportsDisease: ['pneumonia', 'lung_cancer', 'lung_collapse'], weight: 0.5, documentationPhrase: 'dull percussion note' },
    ],
  },
  {
    id: 'resp_percussion_region', section: 'percussion', sectionOrder: 35, cardNumber: 35,
    label: 'Percussion Region',
    question: 'Region of abnormal percussion note',
    type: 'multi_select',
    options: [
      { value: 'right_upper', label: 'Right upper zone', documentationPhrase: 'right upper zone' },
      { value: 'right_mid', label: 'Right mid zone', documentationPhrase: 'right mid zone' },
      { value: 'right_lower', label: 'Right lower zone', documentationPhrase: 'right lower zone' },
      { value: 'left_upper', label: 'Left upper zone', documentationPhrase: 'left upper zone' },
      { value: 'left_mid', label: 'Left mid zone', documentationPhrase: 'left mid zone' },
      { value: 'left_lower', label: 'Left lower zone', documentationPhrase: 'left lower zone' },
    ],
    documentationTemplate: 'Affecting the {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'resp_percussion_diaphragm', section: 'percussion', sectionOrder: 36, cardNumber: 36,
    label: 'Diaphragm Excursion',
    question: 'Diaphragmatic excursion',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'diaphragmatic excursion is normal' },
      { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'reduced diaphragmatic excursion on the left' },
      { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'reduced diaphragmatic excursion on the right' },
      { value: 'bilateral_reduced', label: 'Bilaterally reduced', documentationPhrase: 'bilaterally reduced diaphragmatic excursion' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['copd', 'phrenic_nerve_palsy', 'pleural_effusion'], weight: 0.5, documentationPhrase: 'reduced diaphragmatic excursion' },
    ],
  },

  // ══ PART 8: AUSCULTATION ══
  {
    id: 'resp_breath_sounds', section: 'auscultation', sectionOrder: 37, cardNumber: 37,
    label: 'Breath Sounds',
    question: 'Breath sounds',
    type: 'single_select',
    options: [
      { value: 'normal_vesicular', label: 'Normal vesicular', documentationPhrase: 'normal vesicular breath sounds are heard throughout both lung fields' },
      { value: 'bronchial', label: 'Bronchial', documentationPhrase: 'bronchial breath sounds are heard' },
      { value: 'reduced', label: 'Reduced', documentationPhrase: 'breath sounds are reduced' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'breath sounds are absent' },
      { value: 'harsh', label: 'Harsh', documentationPhrase: 'harsh breath sounds' },
      { value: 'amphoric', label: 'Amphoric', documentationPhrase: 'amphoric breath sounds' },
      { value: 'cavernous', label: 'Cavernous', documentationPhrase: 'cavernous breath sounds' },
    ],
    documentationTemplate: 'On auscultation, {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Consolidation', supportsDisease: ['pneumonia', 'fibrosis', 'lung_cavity'], weight: 0.6, documentationPhrase: 'bronchial breath sounds' },
      { supportsDisease: ['pleural_effusion', 'pneumothorax'], weight: 0.5, documentationPhrase: 'reduced breath sounds' },
    ],
  },
  {
    id: 'resp_added_sounds', section: 'auscultation', sectionOrder: 38, cardNumber: 38,
    label: 'Added Sounds',
    question: 'Added sounds on auscultation',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no added sounds' },
      { value: 'crackles', label: 'Crackles', documentationPhrase: 'crackles are heard' },
      { value: 'wheeze', label: 'Wheeze', documentationPhrase: 'wheeze is heard' },
      { value: 'rhonchi', label: 'Rhonchi', documentationPhrase: 'rhonchi are heard' },
      { value: 'pleural_rub', label: 'Pleural rub', documentationPhrase: 'a pleural rub is heard' },
      { value: 'stridor', label: 'Stridor', documentationPhrase: 'stridor is heard' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Airway inflammation', phenotype: 'Obstructive syndrome', supportsDisease: ['asthma', 'copd'], weight: 0.5, documentationPhrase: 'wheeze on auscultation' },
      { mechanism: 'Alveolar fluid / fibrosis', phenotype: 'Restrictive syndrome', supportsDisease: ['pneumonia', 'heart_failure', 'bronchiectasis', 'pulmonary_fibrosis'], weight: 0.5, documentationPhrase: 'crackles on auscultation' },
    ],
    conditionalExpand: {
      triggerValues: ['crackles', 'wheeze', 'rhonchi', 'pleural_rub', 'stridor'],
      expandCardIds: ['resp_crackle_character', 'resp_wheeze_character', 'resp_vocal_resonance'],
    },
  },
  {
    id: 'resp_crackle_character', section: 'auscultation', sectionOrder: 39, cardNumber: 39,
    label: 'Crackle Characteristics',
    question: 'Crackle characteristics',
    type: 'multi_select',
    options: [
      { value: 'fine', label: 'Fine (velcro)', documentationPhrase: 'fine crackles' },
      { value: 'coarse', label: 'Coarse', documentationPhrase: 'coarse crackles' },
      { value: 'early_inspiratory', label: 'Early inspiratory', documentationPhrase: 'early inspiratory crackles' },
      { value: 'late_inspiratory', label: 'Late inspiratory', documentationPhrase: 'late inspiratory crackles' },
      { value: 'bibasal', label: 'Bibasal', documentationPhrase: 'bibasal crackles' },
      { value: 'diffuse', label: 'Diffuse', documentationPhrase: 'diffuse crackles' },
      { value: 'localized', label: 'Localized', documentationPhrase: 'localized crackles' },
    ],
    documentationTemplate: 'Characterized as {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { mechanism: 'Pulmonary oedema', supportsDisease: ['heart_failure', 'pulmonary_fibrosis'], weight: 0.6, documentationPhrase: 'fine crackles' },
      { mechanism: 'Airway secretion', supportsDisease: ['bronchiectasis', 'pneumonia'], weight: 0.6, documentationPhrase: 'coarse crackles' },
    ],
  },
  {
    id: 'resp_wheeze_character', section: 'auscultation', sectionOrder: 40, cardNumber: 40,
    label: 'Wheeze Characteristics',
    question: 'Wheeze characteristics',
    type: 'multi_select',
    options: [
      { value: 'inspiratory', label: 'Inspiratory', documentationPhrase: 'inspiratory wheeze' },
      { value: 'expiratory', label: 'Expiratory', documentationPhrase: 'expiratory wheeze' },
      { value: 'polyphonic', label: 'Polyphonic', documentationPhrase: 'polyphonic wheeze' },
      { value: 'monophonic', label: 'Monophonic', documentationPhrase: 'monophonic wheeze' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Asthma', supportsDisease: ['asthma', 'copd'], weight: 0.6, documentationPhrase: 'polyphonic expiratory wheeze' },
      { disease: 'Foreign body', supportsDisease: ['foreign_body', 'lung_tumour'], weight: 0.6, documentationPhrase: 'monophonic wheeze' },
    ],
  },
  {
    id: 'resp_vocal_resonance', section: 'auscultation', sectionOrder: 41, cardNumber: 41,
    label: 'Vocal Resonance',
    question: 'Vocal resonance',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'vocal resonance is normal' },
      { value: 'increased', label: 'Increased', documentationPhrase: 'increased vocal resonance' },
      { value: 'decreased', label: 'Decreased', documentationPhrase: 'decreased vocal resonance' },
      { value: 'bronchophony', label: 'Bronchophony', documentationPhrase: 'bronchophony is present' },
      { value: 'whispering_pectoriloquy', label: 'Whispering pectoriloquy', documentationPhrase: 'whispering pectoriloquy is present' },
      { value: 'egophony', label: 'Egophony (A to E change)', documentationPhrase: 'egophony is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { hideForAgeBands: ['neonate'] },
    evidenceLinks: [
      { disease: 'Consolidation', supportsDisease: ['pneumonia', 'lung_collapse'], weight: 0.6, documentationPhrase: 'increased vocal resonance' },
      { disease: 'Pleural effusion', supportsDisease: ['pleural_effusion'], weight: 0.5, documentationPhrase: 'reduced vocal resonance' },
    ],
  },

  // ══ PART 9: SPECIAL MANOEUVRES ══
  {
    id: 'resp_peak_flow', section: 'special_manoeuvres', sectionOrder: 42, cardNumber: 42,
    label: 'Peak Expiratory Flow',
    question: 'Peak expiratory flow rate (L/min)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Peak expiratory flow rate is {value} L/min ({predicted}% predicted).',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { disease: 'Asthma', supportsDisease: ['asthma', 'copd'], weight: 0.5, documentationPhrase: 'PEFR {value} L/min' },
    ],
  },
  {
    id: 'resp_sputum', section: 'special_manoeuvres', sectionOrder: 43, cardNumber: 43,
    label: 'Sputum Assessment',
    question: 'Sputum characteristics',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No sputum', documentationPhrase: 'no sputum production' },
      { value: 'clear', label: 'Clear / Mucoid', documentationPhrase: 'clear mucoid sputum' },
      { value: 'purulent', label: 'Purulent', documentationPhrase: 'purulent sputum' },
      { value: 'blood_tinged', label: 'Blood-tinged', documentationPhrase: 'blood-tinged sputum' },
      { value: 'frank_blood', label: 'Frank haemoptysis', documentationPhrase: 'frank haemoptysis' },
      { value: 'frothy', label: 'Frothy pink (pulmonary oedema)', documentationPhrase: 'frothy pink sputum suggesting pulmonary oedema' },
      { value: 'rusty', label: 'Rusty (pneumococcal)', documentationPhrase: 'rusty-coloured sputum' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Pneumonia', supportsDisease: ['pneumonia', 'bronchiectasis', 'tb', 'lung_cancer', 'heart_failure'], weight: 0.5, documentationPhrase: 'sputum assessment' },
    ],
  },
  {
    id: 'resp_six_minute_walk', section: 'special_manoeuvres', sectionOrder: 44, cardNumber: 44,
    label: 'Six-Minute Walk Test',
    question: '6-minute walk test distance (m)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Six-minute walk distance is {value} meters.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant', 'toddler'] },
    evidenceLinks: [
      { disease: 'ILD', supportsDisease: ['ild', 'copd', 'pulmonary_hypertension'], weight: 0.4, documentationPhrase: 'six-minute walk distance {value} m' },
    ],
  },
  {
    id: 'resp_cough_assessment', section: 'special_manoeuvres', sectionOrder: 45, cardNumber: 45,
    label: 'Cough Assessment',
    question: 'Cough characteristics',
    type: 'multi_select',
    options: [
      { value: 'dry', label: 'Dry / Non-productive', documentationPhrase: 'dry cough' },
      { value: 'productive', label: 'Productive', documentationPhrase: 'productive cough' },
      { value: 'barking', label: 'Barking (croup)', documentationPhrase: 'barking cough' },
      { value: 'paroxysmal', label: 'Paroxysmal (whooping cough)', documentationPhrase: 'paroxysmal cough' },
      { value: 'staccato', label: 'Staccato (chlamydia)', documentationPhrase: 'staccato cough' },
      { value: 'nocturnal', label: 'Nocturnal', documentationPhrase: 'nocturnal cough' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['asthma', 'copd', 'bronchiectasis', 'uri', 'pneumonia'], weight: 0.4, documentationPhrase: 'cough' },
    ],
  },

  // ══ NEONATAL-SPECIFIC CARDS (replace adult cards for neonates) ══
  {
    id: 'resp_neonatal_observations', section: 'observation', sectionOrder: 46, cardNumber: 46,
    label: 'Neonatal Respiratory Observations',
    question: 'Neonatal respiratory assessment',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal breathing', documentationPhrase: 'normal neonatal respiratory pattern' },
      { value: 'grunting', label: 'Grunting', documentationPhrase: 'expiratory grunting' },
      { value: 'nasal_flaring', label: 'Nasal flaring', documentationPhrase: 'nasal flaring' },
      { value: 'chest_indrawing', label: 'Chest indrawing', documentationPhrase: 'chest indrawing' },
      { value: 'head_bobbing', label: 'Head bobbing', documentationPhrase: 'head bobbing' },
      { value: 'feeding_difficulty', label: 'Feeding difficulty', documentationPhrase: 'feeding difficulty due to respiratory distress' },
      { value: 'apnea', label: 'Apnea', documentationPhrase: 'apneic episodes' },
      { value: 'central_cyanosis', label: 'Central cyanosis', documentationPhrase: 'central cyanosis' },
      { value: 'seesaw', label: 'See-saw respiration', documentationPhrase: 'see-saw respiration' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { showForAgeBands: ['neonate'] },
    evidenceLinks: [
      { mechanism: 'Neonatal respiratory distress', supportsDisease: ['ttn', 'hie', 'neonatal_pneumonia', 'congenital_heart_disease'], weight: 0.6, documentationPhrase: 'neonatal respiratory distress' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// FILTER CARDS BY AGE, SEX, PREGNANCY, MODE
// ─────────────────────────────────────────────────────────────────

export function filterRespCards(
  cards: RespCardDef[],
  ctx: RespContext,
  mode: RespExamMode,
): RespCardDef[] {
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
// GET EXPANDED CARD IDS — which cards to show based on findings
// ─────────────────────────────────────────────────────────────────

export function getExpandedCardIds(
  findings: Record<string, unknown>,
  cards: RespCardDef[],
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
// CHECK IF SCREENING → PRIMARY AUTO-ESCALATION IS NEEDED
// ─────────────────────────────────────────────────────────────────

export function shouldEscalateToPrimary(findings: Record<string, unknown>): boolean {
  const escalationFindings = [
    'scr_chest_movement', 'scr_chest_expansion', 'scr_air_entry',
    'scr_breath_sounds', 'scr_added_sounds',
  ];
  for (const fId of escalationFindings) {
    const val = findings[fId];
    if (val != null && val !== '' && val !== false) {
      const strVal = String(val);
      if (strVal !== 'symmetrical' && strVal !== 'normal' && strVal !== 'equal_bilateral' &&
          strVal !== 'normal_vesicular' && strVal !== 'none') {
        return true;
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────
// GENERATE RESPIRATORY NARRATIVE
// ─────────────────────────────────────────────────────────────────

export function generateRespiratoryNarrative(
  cards: RespCardDef[],
  findings: Record<string, unknown>,
  mode: RespExamMode,
  ctx: RespContext,
): string {
  if (mode === 'secondary') {
    const movement = findings['scr_chest_movement'];
    const expansion = findings['scr_chest_expansion'];
    const airEntry = findings['scr_air_entry'];
    const breathSounds = findings['scr_breath_sounds'];
    const addedSounds = findings['scr_added_sounds'];

    const hasAbnormal =
      (movement && String(movement) !== 'symmetrical') ||
      (expansion && String(expansion) !== 'normal') ||
      (airEntry && String(airEntry) !== 'equal_bilateral') ||
      (breathSounds && String(breathSounds) !== 'normal_vesicular') ||
      (addedSounds && String(addedSounds) !== 'none');

    if (hasAbnormal) {
      const parts: string[] = ['**Respiratory System:**'];
      if (movement) parts.push(findDocPhrase(cards, 'scr_chest_movement', movement));
      if (expansion) parts.push(findDocPhrase(cards, 'scr_chest_expansion', expansion));
      if (airEntry) parts.push(findDocPhrase(cards, 'scr_air_entry', airEntry));
      if (breathSounds) parts.push(findDocPhrase(cards, 'scr_breath_sounds', breathSounds));
      if (addedSounds && String(addedSounds) !== 'none') parts.push(findDocPhrase(cards, 'scr_added_sounds', addedSounds));
      return parts.join(' ');
    }

    return '**Respiratory System:** Chest movements are symmetrical with equal bilateral chest expansion. Air entry is equal bilaterally with normal vesicular breath sounds throughout. No added sounds are appreciated.';
  }

  // Primary mode narrative — build from sections
  const sections: RespSection[] = [
    'observation', 'hands', 'face', 'neck', 'chest_inspection',
    'palpation', 'percussion', 'auscultation', 'special_manoeuvres',
  ];
  const paraParts: string[] = [];

  for (const section of sections) {
    const sectionCards = cards.filter(c => c.section === section);
    const phrases: string[] = [];

    for (const card of sectionCards) {
      const val = findings[card.id];
      if (val == null || val === '' || val === false) continue;

      const vals = Array.isArray(val) ? val : [val];
      for (const v of vals) {
        if (v === 'none' || v === 'absent' || v === 'normal' || v === 'room_air') continue;
        const phrase = findDocPhrase(cards, card.id, v);
        if (phrase) phrases.push(phrase);
      }
    }

    if (phrases.length > 0) {
      paraParts.push(phrases.join('; '));
    }
  }

  if (paraParts.length === 0) {
    return '**Respiratory System:** The patient is comfortable at rest with no obvious respiratory distress. Respiratory rate is within normal limits. There is no cyanosis or digital clubbing. Trachea is central and chest expansion is symmetrical bilaterally. Percussion note is resonant throughout both lung fields. Vesicular breath sounds are heard bilaterally with no added sounds.';
  }

  return '**Respiratory Examination:** ' + paraParts.join('. ');
}

function findDocPhrase(cards: RespCardDef[], cardId: string, value: unknown): string {
  const card = cards.find(c => c.id === cardId);
  if (!card) return String(value);
  if (card.type === 'numeric' || card.type === 'text') {
    return card.documentationTemplate.replace(/\{value\}/g, String(value));
  }
  const opt = card.options.find(o => o.value === String(value));
  return opt ? opt.documentationPhrase : String(value);
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE GRAPH — findings → mechanisms → phenotypes → diseases
// ─────────────────────────────────────────────────────────────────

export interface EvidenceGraphNode {
  finding: string;
  findingLabel: string;
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];
  monitoring: string[];
}

export function buildEvidenceGraph(
  findings: Record<string, unknown>,
  cards: RespCardDef[],
): EvidenceGraphNode[] {
  const graph: EvidenceGraphNode[] = [];

  for (const card of cards) {
    const val = findings[card.id];
    if (val == null || val === '' || val === false) continue;
    if (card.evidenceLinks.length === 0) continue;

    const mechanisms = [...new Set(card.evidenceLinks.map(l => l.mechanism).filter(Boolean))] as string[];
    const phenotypes = [...new Set(card.evidenceLinks.map(l => l.phenotype).filter(Boolean))] as string[];
    const diseases = [...new Set(card.evidenceLinks.flatMap(l => l.supportsDisease))];

    const node: EvidenceGraphNode = {
      finding: card.id,
      findingLabel: card.label,
      mechanisms,
      phenotypes,
      diseases,
      investigations: getInvestigationsForDiseases(diseases),
      monitoring: ['Respiratory rate', 'SpO₂', 'NEWS2'],
    };
    graph.push(node);
  }

  return graph;
}

function getInvestigationsForDiseases(diseases: string[]): string[] {
  const invMap: Record<string, string[]> = {
    pneumonia: ['Chest X-ray', 'CBC', 'CRP', 'Sputum studies', 'Blood cultures'],
    asthma: ['Peak flow', 'Spirometry', 'Chest X-ray', 'Eosinophil count'],
    copd: ['Chest X-ray', 'Spirometry', 'ABG', 'Hb', 'CT chest'],
    pleural_effusion: ['Chest X-ray', 'Ultrasound chest', 'Pleural tap', 'CT chest'],
    pneumothorax: ['Chest X-ray', 'CT chest'],
    bronchiectasis: ['Chest X-ray', 'HRCT chest', 'Sputum culture', 'Sweat test'],
    heart_failure: ['Chest X-ray', 'BNP', 'Echocardiogram', 'ECG'],
    lung_cancer: ['Chest X-ray', 'CT chest', 'Bronchoscopy', 'Biopsy'],
    tb: ['Chest X-ray', 'GeneXpert', 'AFB smear', 'TB culture', 'Quantiferon'],
    pulmonary_fibrosis: ['HRCT chest', 'PFTs', 'ABG'],
    foreign_body: ['Chest X-ray', 'Bronchoscopy'],
    croup: ['Clinical diagnosis', 'Chest X-ray (rule out epiglottitis)'],
    bronchiolitis: ['Clinical diagnosis', 'Chest X-ray', 'RSV swab'],
    covid19: ['PCR test', 'Chest X-ray', 'CRP', 'D-dimer'],
  };
  const invs = new Set<string>();
  for (const d of diseases) {
    if (invMap[d]) {
      for (const inv of invMap[d]) invs.add(inv);
    }
  }
  return [...invs];
}
