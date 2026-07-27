// ═══════════════════════════════════════════════════════════════
// AMEXAN UNIVERSAL EXAMINATION KNOWLEDGE CONSTITUTION
// Every examination finding defined once as structured evidence.
// Follows Hutchison's Clinical Methods, Macleod's, Nelson Pediatrics.
// ═══════════════════════════════════════════════════════════════

import type { ClinicalConfidence } from './hpi-constitution';

// ─────────────────────────────────────────────────────────────────
// EXAMINATION PHASE — the 3 major sections per encounter
// ─────────────────────────────────────────────────────────────────

export type ExamPhase = 'vitals' | 'anthropometry' | 'general_exam' | 'systemic_exam' | 'local_exam' | 'special_exam';

export interface ExamSequence {
  phases: ExamPhase[];
  label: string;
}

export const EXAM_SEQUENCES: Record<string, ExamSequence> = {
  adult: {
    phases: ['vitals', 'general_exam', 'systemic_exam', 'local_exam', 'special_exam'],
    label: 'Adult Examination',
  },
  pediatric: {
    phases: ['anthropometry', 'vitals', 'general_exam', 'systemic_exam', 'local_exam', 'special_exam'],
    label: 'Pediatric Examination',
  },
  neonatal: {
    phases: ['anthropometry', 'vitals', 'general_exam', 'systemic_exam', 'local_exam', 'special_exam'],
    label: 'Neonatal Examination',
  },
  obstetric: {
    phases: ['vitals', 'general_exam', 'systemic_exam', 'local_exam', 'special_exam'],
    label: 'Obstetric Examination',
  },
  surgical: {
    phases: ['vitals', 'general_exam', 'systemic_exam', 'local_exam', 'special_exam'],
    label: 'Surgical Examination',
  },
};

// ─────────────────────────────────────────────────────────────────
// SYSTEMIC EXAMINATION MODULES — each is IPPA-based
// ─────────────────────────────────────────────────────────────────

export type SystemicExamModule =
  | 'respiratory' | 'cardiovascular' | 'abdominal' | 'neurological'
  | 'musculoskeletal' | 'ent' | 'eye' | 'skin' | 'urogenital'
  | 'obstetric' | 'neonatal_systemic' | 'breast' | 'lymphatic';

export interface SystemicModuleDef {
  id: SystemicExamModule;
  label: string;
  sequence: ('inspection' | 'palpation' | 'percussion' | 'auscultation' | 'special_tests')[];
  contextVisibility: {
    showForAgeGroups?: string[];
    hideForAgeGroups?: string[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    showForModule?: string[];
    triggerOnFinding?: string[];
    alwaysShow?: boolean;
  };
  findingGroups: ExamFindingGroupDef[];
}

// ─────────────────────────────────────────────────────────────────
// EXAM FINDING GROUP — a set of related findings
// ─────────────────────────────────────────────────────────────────

export interface ExamFindingGroupDef {
  id: string;
  label: string;
  findings: ExamFindingDef[];
  cascadeTriggers?: string[];
}

// ─────────────────────────────────────────────────────────────────
// EXAM FINDING — the atomic evidence unit
// ─────────────────────────────────────────────────────────────────

export type ExamFindingType = 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text' | 'scale';

export interface ExamFindingDef {
  id: string;
  label: string;
  type: ExamFindingType;
  options?: { value: string; label: string; documentationPhrase: string }[];
  documentationTemplate?: string;
  evidenceLinks: EvidenceLinkDef[];
  contextVisibility?: {
    showForAgeGroups?: string[];
    hideForAgeGroups?: string[];
    showForSex?: ('male' | 'female')[];
    triggerOnFindings?: string[];
  };
  unit?: string;
  min?: number;
  max?: number;
  cascadeTrigger?: string;
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE LINK — maps a finding to mechanisms/phenotypes/diseases
// ─────────────────────────────────────────────────────────────────

export interface EvidenceLinkDef {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  contradictsDisease?: string[];
  documentationPhrase: string;
}

// ─────────────────────────────────────────────────────────────────
// VITAL SIGNS
// ─────────────────────────────────────────────────────────────────

export const VITAL_SIGNS: ExamFindingGroupDef[] = [
  {
    id: 'vitals_core',
    label: 'Core Vitals',
    findings: [
      {
        id: 'temperature', label: 'Temperature', type: 'numeric', unit: '°C',
        min: 32, max: 42,
        documentationTemplate: 'Temperature was {value}°C ({method}, {site}).',
        evidenceLinks: [
          { supportsDisease: ['pneumonia', 'sepsis', 'tb', 'covid19', 'influenza'], weight: 0.5,
            documentationPhrase: 'Temperature {value}°C' },
        ],
      },
      {
        id: 'heart_rate', label: 'Heart Rate', type: 'numeric', unit: 'bpm',
        min: 20, max: 250,
        documentationTemplate: 'Heart rate was {value} bpm and {rhythm}.',
        evidenceLinks: [
          { supportsDisease: ['sepsis', 'pneumonia', 'pe', 'heart_failure'], weight: 0.3,
            documentationPhrase: 'tachycardic at {value} bpm' },
        ],
        cascadeTrigger: 'tachycardia',
      },
      {
        id: 'respiratory_rate', label: 'Respiratory Rate', type: 'numeric', unit: '/min',
        min: 5, max: 120,
        documentationTemplate: 'Respiratory rate was {value} breaths per minute.',
        evidenceLinks: [
          { supportsDisease: ['pneumonia', 'asthma', 'copd', 'heart_failure', 'sepsis'], weight: 0.4,
            documentationPhrase: 'tachypnoeic at {value}/min' },
        ],
      },
      {
        id: 'blood_pressure_systolic', label: 'Systolic BP', type: 'numeric', unit: 'mmHg',
        min: 40, max: 300,
        documentationTemplate: 'BP was {value}/{diastolic} mmHg.',
        evidenceLinks: [
          { supportsDisease: ['sepsis', 'shock'], weight: 0.5,
            documentationPhrase: 'hypotensive at {value}/{diastolic}' },
        ],
      },
      {
        id: 'blood_pressure_diastolic', label: 'Diastolic BP', type: 'numeric', unit: 'mmHg',
        min: 20, max: 200,
        documentationTemplate: '',
        evidenceLinks: [],
      },
      {
        id: 'oxygen_saturation', label: 'Oxygen Saturation', type: 'numeric', unit: '%',
        min: 50, max: 100,
        documentationTemplate: 'Oxygen saturation was {value}% on room air.',
        evidenceLinks: [
          { supportsDisease: ['pneumonia', 'pe', 'heart_failure', 'asthma', 'copd'], weight: 0.7,
            documentationPhrase: 'hypoxic at {value}% on room air' },
        ],
      },
    ],
  },
  {
    id: 'vitals_extended',
    label: 'Extended Vitals',
    findings: [
      {
        id: 'pain_score', label: 'Pain Score', type: 'scale', min: 0, max: 10,
        documentationTemplate: 'Pain score was {value}/10.',
        evidenceLinks: [],
      },
      {
        id: 'gcs', label: 'Glasgow Coma Scale', type: 'numeric', unit: '/15',
        min: 3, max: 15,
        documentationTemplate: 'GCS was {value}/15 (E{eyes} V{verbal} M{motor}).',
        evidenceLinks: [
          { supportsDisease: ['cva', 'meningitis', 'encephalopathy', 'sepsis'], weight: 0.6,
            documentationPhrase: 'with reduced GCS of {value}/15' },
        ],
      },
      {
        id: 'rbs', label: 'Random Blood Sugar', type: 'numeric', unit: 'mmol/L',
        min: 1, max: 40,
        documentationTemplate: 'RBS was {value} mmol/L.',
        evidenceLinks: [
          { supportsDisease: ['diabetes', 'hypoglycemia'], weight: 0.5,
            documentationPhrase: 'with RBS of {value} mmol/L' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// ANTHROPOMETRY — age-dependent measurements
// ─────────────────────────────────────────────────────────────────

export const ANTHROPOMETRY_FINDINGS: ExamFindingGroupDef[] = [
  {
    id: 'anthropometry_core',
    label: 'Core Measurements',
    findings: [
      {
        id: 'weight', label: 'Weight', type: 'numeric', unit: 'kg',
        documentationTemplate: 'Weight was {value} kg ({percentile} percentile for age).',
        evidenceLinks: [
          { supportsDisease: ['malnutrition', 'failure_to_thrive'], weight: 0.7,
            documentationPhrase: 'weighs {value} kg ({percentile}th percentile)' },
        ],
      },
      {
        id: 'height', label: 'Height / Length', type: 'numeric', unit: 'cm',
        documentationTemplate: 'Height was {value} cm ({percentile} percentile).',
        evidenceLinks: [
          { supportsDisease: ['growth_failure', 'malnutrition'], weight: 0.6,
            documentationPhrase: 'height {value} cm ({percentile}th percentile)' },
        ],
      },
      {
        id: 'head_circumference', label: 'Head Circumference', type: 'numeric', unit: 'cm',
        documentationTemplate: 'Head circumference was {value} cm ({percentile} percentile).',
        evidenceLinks: [
          { supportsDisease: ['microcephaly', 'hydrocephalus'], weight: 0.8,
            documentationPhrase: 'head circumference {value} cm ({percentile}th percentile)' },
        ],
        contextVisibility: { hideForAgeGroups: ['adolescent', 'adult', 'older_adult'] },
      },
      {
        id: 'muac', label: 'MUAC', type: 'numeric', unit: 'cm',
        documentationTemplate: 'MUAC was {value} cm.',
        evidenceLinks: [
          { supportsDisease: ['malnutrition', 'sam', 'mam'], weight: 0.8,
            documentationPhrase: 'MUAC {value} cm' },
        ],
        contextVisibility: { hideForAgeGroups: ['adult'] },
      },
      {
        id: 'bmi', label: 'BMI', type: 'numeric', unit: 'kg/m²',
        documentationTemplate: 'BMI was {value} kg/m² ({category}).',
        evidenceLinks: [
          { supportsDisease: ['obesity', 'overweight', 'underweight'], weight: 0.5,
            documentationPhrase: 'BMI {value} kg/m² ({category})' },
        ],
        contextVisibility: { hideForAgeGroups: ['neonate', 'infant'] },
      },
      {
        id: 'chest_circumference', label: 'Chest Circumference', type: 'numeric', unit: 'cm',
        documentationTemplate: 'Chest circumference was {value} cm.',
        evidenceLinks: [],
        contextVisibility: { showForAgeGroups: ['neonate', 'infant'] },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// GENERAL EXAMINATION FINDINGS
// ─────────────────────────────────────────────────────────────────

export const GENERAL_EXAM_FINDINGS: ExamFindingGroupDef[] = [
  {
    id: 'gen_appearance',
    label: 'General Appearance',
    findings: [
      {
        id: 'general_appearance', label: 'General Appearance', type: 'single_select',
        options: [
          { value: 'well', label: 'Well / Healthy', documentationPhrase: 'well appearing' },
          { value: 'mildly_ill', label: 'Mildly ill', documentationPhrase: 'mildly ill appearing' },
          { value: 'moderately_ill', label: 'Moderately ill', documentationPhrase: 'moderately ill appearing' },
          { value: 'toxic', label: 'Toxic / Severely ill', documentationPhrase: 'toxic appearing' },
          { value: 'distressed', label: 'In distress', documentationPhrase: 'in obvious respiratory distress' },
          { value: 'cachectic', label: 'Cachectic', documentationPhrase: 'cachectic' },
          { value: 'obese', label: 'Obese', documentationPhrase: 'obese' },
          { value: 'wasted', label: 'Wasted', documentationPhrase: 'wasted' },
          { value: 'dehydrated', label: 'Dehydrated', documentationPhrase: 'dehydrated' },
          { value: 'agitated', label: 'Agitated', documentationPhrase: 'agitated' },
          { value: 'drowsy', label: 'Drowsy', documentationPhrase: 'drowsy' },
          { value: 'comatose', label: 'Comatose', documentationPhrase: 'comatose' },
        ],
        documentationTemplate: 'The patient is {value}.',
        evidenceLinks: [
          { supportsDisease: ['sepsis', 'pneumonia', 'meningitis'], weight: 0.3,
            documentationPhrase: 'toxically ill' },
          { supportsDisease: ['copd', 'asthma', 'heart_failure'], weight: 0.3,
            documentationPhrase: 'in respiratory distress' },
          { supportsDisease: ['tb', 'cancer', 'hiv'], weight: 0.4,
            documentationPhrase: 'cachectic' },
        ],
      },
    ],
  },
  {
    id: 'gen_hydration',
    label: 'Hydration Status',
    findings: [
      {
        id: 'hydration_status', label: 'Hydration Status', type: 'single_select',
        options: [
          { value: 'normal', label: 'Normal', documentationPhrase: 'adequately hydrated' },
          { value: 'mild_dehydration', label: 'Mild dehydration', documentationPhrase: 'mildly dehydrated' },
          { value: 'moderate_dehydration', label: 'Moderate dehydration', documentationPhrase: 'moderately dehydrated' },
          { value: 'severe_dehydration', label: 'Severe dehydration', documentationPhrase: 'severely dehydrated' },
        ],
        documentationTemplate: 'The patient is {value}.',
        evidenceLinks: [
          { supportsDisease: ['gastroenteritis', 'sepsis', 'diabetes'], weight: 0.4,
            documentationPhrase: 'dehydrated' },
        ],
      },
    ],
  },
  {
    id: 'gen_nutrition',
    label: 'Nutritional Status',
    findings: [
      {
        id: 'nutritional_status', label: 'Nutritional Status', type: 'single_select',
        options: [
          { value: 'normal', label: 'Normal', documentationPhrase: 'well nourished' },
          { value: 'underweight', label: 'Underweight', documentationPhrase: 'underweight' },
          { value: 'overweight', label: 'Overweight', documentationPhrase: 'overweight' },
          { value: 'obese', label: 'Obese', documentationPhrase: 'obese' },
          { value: 'sam', label: 'Severe Acute Malnutrition', documentationPhrase: 'severely malnourished' },
          { value: 'mam', label: 'Moderate Acute Malnutrition', documentationPhrase: 'moderately malnourished' },
        ],
        documentationTemplate: 'The patient is {value}.',
        evidenceLinks: [
          { supportsDisease: ['malnutrition', 'tb', 'cancer', 'hiv'], weight: 0.5,
            documentationPhrase: 'malnourished' },
        ],
      },
    ],
  },
  {
    id: 'gen_anaemia',
    label: 'Anaemia / Pallor',
    findings: [
      {
        id: 'pallor', label: 'Pallor', type: 'single_select',
        options: [
          { value: 'absent', label: 'Absent', documentationPhrase: 'no pallor' },
          { value: 'mild', label: 'Mild', documentationPhrase: 'mild conjunctival pallor' },
          { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate pallor' },
          { value: 'severe', label: 'Severe', documentationPhrase: 'severe pallor' },
        ],
        documentationTemplate: '{value} conjunctival pallor is present.',
        evidenceLinks: [
          { supportsDisease: ['anaemia', 'chronic_disease', 'malaria', 'bleeding'], weight: 0.6,
            documentationPhrase: 'with conjunctival pallor' },
        ],
      },
    ],
  },
  {
    id: 'gen_jaundice',
    label: 'Jaundice',
    findings: [
      {
        id: 'jaundice', label: 'Jaundice', type: 'single_select',
        options: [
          { value: 'absent', label: 'Absent', documentationPhrase: 'no jaundice' },
          { value: 'mild', label: 'Mild scleral icterus', documentationPhrase: 'mild scleral icterus' },
          { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate jaundice' },
          { value: 'severe', label: 'Severe', documentationPhrase: 'deep jaundice' },
        ],
        documentationTemplate: '{value} is present.',
        evidenceLinks: [
          { supportsDisease: ['hepatitis', 'cirrhosis', 'hemolysis', 'obstructive_jaundice'], weight: 0.7,
            documentationPhrase: 'jaundiced' },
        ],
      },
    ],
  },
  {
    id: 'gen_cyanosis',
    label: 'Cyanosis',
    findings: [
      {
        id: 'cyanosis', label: 'Cyanosis', type: 'single_select',
        options: [
          { value: 'absent', label: 'Absent', documentationPhrase: 'no cyanosis' },
          { value: 'central', label: 'Central', documentationPhrase: 'central cyanosis' },
          { value: 'peripheral', label: 'Peripheral', documentationPhrase: 'peripheral cyanosis' },
        ],
        documentationTemplate: '{value} is present.',
        evidenceLinks: [
          { supportsDisease: ['congenital_heart_disease', 'pneumonia', 'copd', 'heart_failure'], weight: 0.7,
            documentationPhrase: 'cyanosed' },
        ],
      },
    ],
  },
  {
    id: 'gen_clubbing',
    label: 'Clubbing',
    findings: [
      {
        id: 'clubbing', label: 'Digital Clubbing', type: 'single_select',
        options: [
          { value: 'absent', label: 'Absent', documentationPhrase: 'no clubbing' },
          { value: 'mild', label: 'Mild', documentationPhrase: 'mild clubbing' },
          { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate clubbing' },
          { value: 'severe', label: 'Severe / Drumstick', documentationPhrase: 'severe clubbing of digits' },
        ],
        documentationTemplate: '{value} of the digits.',
        evidenceLinks: [
          { supportsDisease: ['bronchiectasis', 'lung_cancer', 'tb', 'copd', 'cyanotic_heart_disease'], weight: 0.6,
            documentationPhrase: 'with digital clubbing' },
        ],
      },
    ],
  },
  {
    id: 'gen_edema',
    label: 'Edema',
    findings: [
      {
        id: 'edema', label: 'Edema', type: 'single_select',
        options: [
          { value: 'absent', label: 'Absent', documentationPhrase: 'no edema' },
          { value: 'pitting_mild', label: 'Pitting +', documentationPhrase: 'mild pitting edema' },
          { value: 'pitting_moderate', label: 'Pitting ++', documentationPhrase: 'moderate pitting edema' },
          { value: 'pitting_severe', label: 'Pitting +++', documentationPhrase: 'severe pitting edema' },
          { value: 'non_pitting', label: 'Non-pitting', documentationPhrase: 'non-pitting edema' },
        ],
        documentationTemplate: '{value} is present.',
        evidenceLinks: [
          { supportsDisease: ['heart_failure', 'nephrotic_syndrome', 'cirrhosis', 'lymphatic_obstruction'], weight: 0.6,
            documentationPhrase: 'with pedal edema' },
        ],
      },
      {
        id: 'edema_location', label: 'Edema Location', type: 'multi_select',
        options: [
          { value: 'pedal', label: 'Pedal', documentationPhrase: 'pedal' },
          { value: 'pretibial', label: 'Pretibial', documentationPhrase: 'pretibial' },
          { value: 'sacral', label: 'Sacral', documentationPhrase: 'sacral' },
          { value: 'periorbital', label: 'Periorbital', documentationPhrase: 'periorbital' },
          { value: 'scrotal', label: 'Scrotal', documentationPhrase: 'scrotal' },
          { value: 'generalized', label: 'Generalized (anasarca)', documentationPhrase: 'generalized edema' },
        ],
        documentationTemplate: 'Affecting {value} areas.',
        evidenceLinks: [],
        contextVisibility: { triggerOnFindings: ['edema'] },
      },
    ],
  },
  {
    id: 'gen_lymph_nodes',
    label: 'Lymph Nodes',
    findings: [
      {
        id: 'lymph_node_status', label: 'Lymph Node Status', type: 'single_select',
        options: [
          { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'no significant lymphadenopathy' },
          { value: 'palpable', label: 'Palpable', documentationPhrase: 'lymphadenopathy present' },
        ],
        documentationTemplate: '{value}.',
        evidenceLinks: [],
        cascadeTrigger: 'lymph_node_cascade',
      },
    ],
  },
  {
    id: 'gen_neonatal',
    label: 'Neonatal General Signs',
    findings: [
      {
        id: 'neonatal_tone', label: 'Muscle Tone', type: 'single_select',
        options: [
          { value: 'normal', label: 'Normal', documentationPhrase: 'normal tone' },
          { value: 'hypertonia', label: 'Hypertonia', documentationPhrase: 'hypertonic' },
          { value: 'hypotonia', label: 'Hypotonia', documentationPhrase: 'hypotonic' },
          { value: 'floppy', label: 'Floppy', documentationPhrase: 'floppy infant' },
        ],
        documentationTemplate: 'Muscle tone is {value}.',
        evidenceLinks: [
          { supportsDisease: ['birth_asphyxia', 'neonatal_sepsis', 'cerebral_palsy'], weight: 0.5,
            documentationPhrase: 'with abnormal tone' },
        ],
        contextVisibility: { showForAgeGroups: ['neonate', 'infant'] },
      },
      {
        id: 'neonatal_skin', label: 'Skin / Rashes', type: 'multi_select',
        options: [
          { value: 'normal', label: 'Normal', documentationPhrase: 'normal skin' },
          { value: 'vernix', label: 'Vernix caseosa', documentationPhrase: 'covered in vernix' },
          { value: 'meconium_staining', label: 'Meconium staining', documentationPhrase: 'meconium-stained skin' },
          { value: 'petechiae', label: 'Petechiae', documentationPhrase: 'petechiae' },
          { value: 'jaundice_visible', label: 'Jaundice visible', documentationPhrase: 'visibly jaundiced' },
          { value: 'rash', label: 'Rash', documentationPhrase: 'rash on trunk' },
          { value: 'birth_marks', label: 'Birth marks', documentationPhrase: 'birth marks' },
        ],
        documentationTemplate: 'Skin: {value}.',
        evidenceLinks: [],
        contextVisibility: { showForAgeGroups: ['neonate', 'infant'] },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// SYSTEMIC EXAMINATION MODULES — complete IPPA-based
// ─────────────────────────────────────────────────────────────────

export const SYSTEMIC_EXAM_MODULES: SystemicModuleDef[] = [
  {
    id: 'respiratory',
    label: 'Respiratory Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: true },
    findingGroups: [
      {
        id: 'resp_inspection',
        label: 'Inspection',
        findings: [
          { id: 'resp_shape', label: 'Chest Shape', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'chest is symmetrical with normal respiratory movements' },
              { value: 'barrel', label: 'Barrel-shaped', documentationPhrase: 'barrel-shaped chest' },
              { value: 'pectus_carinatum', label: 'Pectus carinatum', documentationPhrase: 'pectus carinatum' },
              { value: 'pectus_excavatum', label: 'Pectus excavatum', documentationPhrase: 'pectus excavatum' },
              { value: 'kyphoscoliosis', label: 'Kyphoscoliosis', documentationPhrase: 'kyphoscoliosis' },
            ],
            documentationTemplate: 'The chest is {value}.',
            evidenceLinks: [
              { supportsDisease: ['copd'], weight: 0.5, documentationPhrase: 'barrel-shaped chest' },
            ],
          },
          { id: 'resp_movements', label: 'Respiratory Movements', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'normal respiratory movements' },
              { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'reduced movement on the left' },
              { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'reduced movement on the right' },
              { value: 'bilateral_reduced', label: 'Bilaterally reduced', documentationPhrase: 'bilaterally reduced chest expansion' },
              { value: 'accessory_muscle', label: 'Accessory muscle use', documentationPhrase: 'using accessory muscles of respiration' },
              { value: 'intercostal_recession', label: 'Intercostal recession', documentationPhrase: 'intercostal recession' },
              { value: 'tracheal_tug', label: 'Tracheal tug', documentationPhrase: 'tracheal tug present' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['pneumonia', 'asthma', 'copd', 'pleural_effusion'], weight: 0.5,
                documentationPhrase: 'with reduced chest expansion' },
            ],
          },
          { id: 'resp_trachea', label: 'Trachea', type: 'single_select',
            options: [
              { value: 'central', label: 'Central', documentationPhrase: 'trachea is central' },
              { value: 'deviated_left', label: 'Deviated to left', documentationPhrase: 'trachea deviated to the left' },
              { value: 'deviated_right', label: 'Deviated to right', documentationPhrase: 'trachea deviated to the right' },
            ],
            documentationTemplate: 'The trachea is {value}.',
            evidenceLinks: [
              { supportsDisease: ['pleural_effusion', 'pneumothorax', 'lung_cancer'], weight: 0.5,
                documentationPhrase: 'with tracheal deviation' },
            ],
          },
        ],
      },
      {
        id: 'resp_palpation',
        label: 'Palpation',
        findings: [
          { id: 'resp_expansion', label: 'Chest Expansion', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'chest expansion is normal and symmetrical' },
              { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'reduced expansion on the left' },
              { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'reduced expansion on the right' },
              { value: 'bilateral_reduced', label: 'Bilaterally reduced', documentationPhrase: 'bilaterally reduced expansion' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'resp_tactile_vocal_fremitus', label: 'Tactile Vocal Fremitus', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'tactile vocal fremitus is normal' },
              { value: 'increased', label: 'Increased', documentationPhrase: 'increased tactile vocal fremitus' },
              { value: 'decreased', label: 'Decreased', documentationPhrase: 'decreased tactile vocal fremitus' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'absent tactile vocal fremitus' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['pneumonia'], weight: 0.5,
                documentationPhrase: 'with increased vocal fremitus' },
              { supportsDisease: ['pleural_effusion', 'pneumothorax'], weight: 0.5,
                documentationPhrase: 'with reduced vocal fremitus' },
            ],
          },
        ],
      },
      {
        id: 'resp_percussion',
        label: 'Percussion',
        findings: [
          { id: 'resp_percussion_note', label: 'Percussion Note', type: 'single_select',
            options: [
              { value: 'resonant', label: 'Resonant', documentationPhrase: 'percussion note is resonant throughout' },
              { value: 'dull', label: 'Dull', documentationPhrase: 'dull percussion note' },
              { value: 'stony_dull', label: 'Stony dull', documentationPhrase: 'stony dull percussion note' },
              { value: 'hyperresonant', label: 'Hyperresonant', documentationPhrase: 'hyperresonant percussion note' },
              { value: 'tympanitic', label: 'Tympanitic', documentationPhrase: 'tympanitic percussion note' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['pneumonia', 'pleural_effusion'], weight: 0.6,
                documentationPhrase: 'dull to percussion' },
              { supportsDisease: ['copd', 'pneumothorax'], weight: 0.5,
                documentationPhrase: 'hyperresonant to percussion' },
            ],
          },
        ],
      },
      {
        id: 'resp_auscultation',
        label: 'Auscultation',
        findings: [
          { id: 'resp_breath_sounds', label: 'Breath Sounds', type: 'single_select',
            options: [
              { value: 'vesicular', label: 'Vesicular', documentationPhrase: 'vesicular breath sounds' },
              { value: 'bronchial', label: 'Bronchial', documentationPhrase: 'bronchial breath sounds' },
              { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced breath sounds' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'absent breath sounds' },
              { value: 'bronchovesicular', label: 'Bronchovesicular', documentationPhrase: 'bronchovesicular breath sounds' },
            ],
            documentationTemplate: 'Auscultation reveals {value}.',
            evidenceLinks: [
              { supportsDisease: ['pneumonia'], weight: 0.6,
                documentationPhrase: 'bronchial breath sounds' },
              { supportsDisease: ['pleural_effusion', 'pneumothorax'], weight: 0.5,
                documentationPhrase: 'reduced breath sounds' },
            ],
          },
          { id: 'resp_added_sounds', label: 'Added Sounds', type: 'multi_select',
            options: [
              { value: 'none', label: 'None / Clear', documentationPhrase: 'no added sounds' },
              { value: 'crackles_fine', label: 'Fine crackles', documentationPhrase: 'fine inspiratory crackles' },
              { value: 'crackles_coarse', label: 'Coarse crackles', documentationPhrase: 'coarse crackles' },
              { value: 'crackles_basal', label: 'Basal crackles', documentationPhrase: 'basal crackles' },
              { value: 'wheeze_expiratory', label: 'Expiratory wheeze', documentationPhrase: 'expiratory wheeze' },
              { value: 'wheeze_inspiratory', label: 'Inspiratory wheeze', documentationPhrase: 'inspiratory wheeze' },
              { value: 'rhonchi', label: 'Rhonchi', documentationPhrase: 'rhonchi' },
              { value: 'pleural_rub', label: 'Pleural rub', documentationPhrase: 'pleural rub' },
              { value: 'stridor', label: 'Stridor', documentationPhrase: 'stridor' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['pneumonia', 'heart_failure', 'bronchiectasis'], weight: 0.6,
                documentationPhrase: 'with crackles on auscultation' },
              { supportsDisease: ['asthma', 'copd'], weight: 0.6,
                documentationPhrase: 'with expiratory wheeze' },
              { supportsDisease: ['croup', 'epiglottitis', 'foreign_body'], weight: 0.6,
                documentationPhrase: 'with stridor' },
            ],
          },
          { id: 'resp_vocal_resonance', label: 'Vocal Resonance', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'vocal resonance is normal' },
              { value: 'increased', label: 'Increased', documentationPhrase: 'increased vocal resonance' },
              { value: 'decreased', label: 'Decreased', documentationPhrase: 'decreased vocal resonance' },
              { value: 'whispering_pectoriloquy', label: 'Whispering pectoriloquy', documentationPhrase: 'whispering pectoriloquy' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['pneumonia'], weight: 0.6,
                documentationPhrase: 'with increased vocal resonance' },
            ],
          },
        ],
      },
      {
        id: 'resp_special',
        label: 'Special Tests',
        findings: [
          { id: 'resp_peak_flow', label: 'Peak Flow', type: 'numeric', unit: 'L/min',
            documentationTemplate: 'Peak expiratory flow rate was {value} L/min.',
            evidenceLinks: [
              { supportsDisease: ['asthma', 'copd'], weight: 0.5,
                documentationPhrase: 'with PEFR of {value} L/min' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: true },
    findingGroups: [
      {
        id: 'cvs_inspection',
        label: 'Inspection',
        findings: [
          { id: 'cvs_jvp', label: 'JVP', type: 'single_select',
            options: [
              { value: 'not_visible', label: 'Not visible', documentationPhrase: 'JVP is not elevated' },
              { value: 'elevated', label: 'Elevated', documentationPhrase: 'elevated JVP' },
              { value: 'giant_v', label: 'Giant v waves', documentationPhrase: 'giant v waves' },
              { value: 'cannon', label: 'Cannon a waves', documentationPhrase: 'cannon a waves' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['heart_failure', 'constrictive_pericarditis'], weight: 0.7,
                documentationPhrase: 'with elevated JVP' },
            ],
          },
          { id: 'cvs_praecordial_bulge', label: 'Praecordial Bulge', type: 'boolean',
            documentationTemplate: 'Praecordial bulge is {value}.',
            evidenceLinks: [
              { supportsDisease: ['cardiomegaly', 'congenital_heart_disease'], weight: 0.4,
                documentationPhrase: 'praecordial bulge' },
            ],
          },
          { id: 'cvs_apex_beat_visible', label: 'Apex Beat Visible', type: 'boolean',
            documentationTemplate: 'Apex beat is {value}.',
            evidenceLinks: [],
          },
        ],
      },
      {
        id: 'cvs_palpation',
        label: 'Palpation',
        findings: [
          { id: 'cvs_apex_beat', label: 'Apex Beat Palpation', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal position', documentationPhrase: 'apex beat is in the 5th left intercostal space, midclavicular line' },
              { value: 'displaced_left', label: 'Displaced left', documentationPhrase: 'apex beat is displaced laterally' },
              { value: 'displaced_down', label: 'Displaced down and left', documentationPhrase: 'apex beat is displaced down and to the left' },
              { value: 'tapping', label: 'Tapping', documentationPhrase: 'tapping apex beat' },
              { value: 'heaving', label: 'Heaving', documentationPhrase: 'heaving apex beat' },
              { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'apex beat is not palpable' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cardiomegaly', 'heart_failure'], weight: 0.5,
                documentationPhrase: 'displaced apex beat' },
              { supportsDisease: ['mitral_stenosis'], weight: 0.4,
                documentationPhrase: 'tapping apex beat' },
              { supportsDisease: ['aortic_stenosis', 'hypertension'], weight: 0.4,
                documentationPhrase: 'heaving apex beat' },
            ],
          },
          { id: 'cvs_thrills', label: 'Thrills', type: 'single_select',
            options: [
              { value: 'absent', label: 'Absent', documentationPhrase: 'no thrills palpable' },
              { value: 'aortic', label: 'Aortic area', documentationPhrase: 'aortic thrill' },
              { value: 'pulmonary', label: 'Pulmonary area', documentationPhrase: 'pulmonary thrill' },
              { value: 'left_sternal', label: 'Left sternal border', documentationPhrase: 'parasternal thrill' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['aortic_stenosis', 'vhd'], weight: 0.6,
                documentationPhrase: 'with palpable thrill' },
            ],
          },
          { id: 'cvs_heaves', label: 'Heaves / Lifts', type: 'boolean',
            documentationTemplate: 'Parasternal heave is {value}.',
            evidenceLinks: [
              { supportsDisease: ['rvh', 'pulmonary_hypertension'], weight: 0.5,
                documentationPhrase: 'parasternal heave' },
            ],
          },
        ],
      },
      {
        id: 'cvs_auscultation',
        label: 'Auscultation',
        findings: [
          { id: 'cvs_heart_sounds', label: 'Heart Sounds', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal S1 S2', documentationPhrase: 'S1 and S2 are normal' },
              { value: 'soft_s1', label: 'Soft S1', documentationPhrase: 'soft S1' },
              { value: 'loud_s1', label: 'Loud S1', documentationPhrase: 'loud S1' },
              { value: 'soft_s2', label: 'Soft S2', documentationPhrase: 'soft S2' },
              { value: 'loud_s2', label: 'Loud S2', documentationPhrase: 'loud S2' },
              { value: 'splitting_s2', label: 'Wide splitting S2', documentationPhrase: 'wide splitting of S2' },
              { value: 's3', label: 'S3 gallop', documentationPhrase: 'S3 gallop rhythm' },
              { value: 's4', label: 'S4 gallop', documentationPhrase: 'S4 gallop rhythm' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['heart_failure'], weight: 0.5, documentationPhrase: 'S3 gallop' },
              { supportsDisease: ['hypertension', 'cad'], weight: 0.4, documentationPhrase: 'S4 gallop' },
            ],
          },
          { id: 'cvs_murmurs', label: 'Murmurs', type: 'multi_select',
            options: [
              { value: 'none', label: 'None', documentationPhrase: 'no murmurs' },
              { value: 'ejection_systolic', label: 'Ejection systolic', documentationPhrase: 'ejection systolic murmur' },
              { value: 'pansystolic', label: 'Pansystolic', documentationPhrase: 'pansystolic murmur' },
              { value: 'mid_diastolic', label: 'Mid-diastolic', documentationPhrase: 'mid-diastolic murmur' },
              { value: 'presystolic', label: 'Presystolic', documentationPhrase: 'presystolic murmur' },
              { value: 'continuous', label: 'Continuous', documentationPhrase: 'continuous murmur' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['vhd', 'mitral_regurgitation', 'aortic_stenosis', 'mitral_stenosis'], weight: 0.7,
                documentationPhrase: 'with cardiac murmur' },
            ],
          },
          { id: 'cvs_murmur_grade', label: 'Murmur Grade', type: 'single_select',
            options: [
              { value: '1', label: 'Grade 1/6', documentationPhrase: 'grade 1/6' },
              { value: '2', label: 'Grade 2/6', documentationPhrase: 'grade 2/6' },
              { value: '3', label: 'Grade 3/6', documentationPhrase: 'grade 3/6' },
              { value: '4', label: 'Grade 4/6', documentationPhrase: 'grade 4/6' },
              { value: '5', label: 'Grade 5/6', documentationPhrase: 'grade 5/6' },
              { value: '6', label: 'Grade 6/6', documentationPhrase: 'grade 6/6' },
            ],
            documentationTemplate: 'The murmur is {value}.',
            evidenceLinks: [],
            contextVisibility: { triggerOnFindings: ['cvs_murmurs'] },
          },
          { id: 'cvs_murmur_location', label: 'Murmur Location', type: 'multi_select',
            options: [
              { value: 'aortic', label: 'Aortic area', documentationPhrase: 'heard best at the aortic area' },
              { value: 'pulmonary', label: 'Pulmonary area', documentationPhrase: 'heard at the pulmonary area' },
              { value: 'tricuspid', label: 'Tricuspid area', documentationPhrase: 'heard at the tricuspid area' },
              { value: 'mitral', label: 'Mitral area', documentationPhrase: 'heard at the apex/mitral area' },
              { value: 'left_sternal', label: 'Left sternal border', documentationPhrase: 'heard along the left sternal border' },
            ],
            documentationTemplate: 'The murmur is {value}.',
            evidenceLinks: [],
            contextVisibility: { triggerOnFindings: ['cvs_murmurs'] },
          },
        ],
      },
      {
        id: 'cvs_peripheral',
        label: 'Peripheral Signs',
        findings: [
          { id: 'cvs_radiofemoral_delay', label: 'Radiofemoral Delay', type: 'boolean',
            documentationTemplate: 'Radiofemoral delay is {value}.',
            evidenceLinks: [
              { supportsDisease: ['coarctation_of_aorta'], weight: 0.8,
                documentationPhrase: 'radiofemoral delay' },
            ],
          },
          { id: 'cvs_cap_refill', label: 'Capillary Refill', type: 'single_select',
            options: [
              { value: '<2', label: '<2 seconds', documentationPhrase: 'capillary refill time < 2 seconds' },
              { value: '2_3', label: '2-3 seconds', documentationPhrase: 'capillary refill 2-3 seconds' },
              { value: '>3', label: '>3 seconds', documentationPhrase: 'prolonged capillary refill > 3 seconds' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['shock', 'dehydration', 'heart_failure'], weight: 0.4,
                documentationPhrase: 'prolonged capillary refill' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'abdominal',
    label: 'Abdominal Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: true },
    findingGroups: [
      {
        id: 'abd_inspection',
        label: 'Inspection',
        findings: [
          { id: 'abd_shape', label: 'Abdominal Shape', type: 'single_select',
            options: [
              { value: 'flat', label: 'Flat', documentationPhrase: 'abdomen is flat and symmetrical' },
              { value: 'distended', label: 'Distended', documentationPhrase: 'abdomen is distended' },
              { value: 'scaphoid', label: 'Scaphoid', documentationPhrase: 'abdomen is scaphoid' },
              { value: 'protuberant', label: 'Protuberant', documentationPhrase: 'abdomen is protuberant' },
            ],
            documentationTemplate: 'The {value}.',
            evidenceLinks: [
              { supportsDisease: ['ascites', 'intestinal_obstruction', 'hepatomegaly'], weight: 0.4,
                documentationPhrase: 'abdominal distension' },
            ],
          },
          { id: 'abd_scars', label: 'Scars', type: 'text',
            documentationTemplate: 'Surgical scars: {value}.',
            evidenceLinks: [],
          },
          { id: 'abd_hernia', label: 'Hernia Orifices', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal / No hernia', documentationPhrase: 'hernial orifices are normal' },
              { value: 'umbilical', label: 'Umbilical hernia', documentationPhrase: 'umbilical hernia' },
              { value: 'inguinal', label: 'Inguinal hernia', documentationPhrase: 'inguinal hernia' },
              { value: 'incisional', label: 'Incisional hernia', documentationPhrase: 'incisional hernia' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
        ],
      },
      {
        id: 'abd_palpation',
        label: 'Palpation',
        findings: [
          { id: 'abd_tenderness', label: 'Tenderness', type: 'single_select',
            options: [
              { value: 'none', label: 'None', documentationPhrase: 'no abdominal tenderness' },
              { value: 'mild', label: 'Mild', documentationPhrase: 'mild tenderness' },
              { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate tenderness' },
              { value: 'severe', label: 'Severe / Guarding', documentationPhrase: 'severe tenderness with guarding' },
              { value: 'rebound', label: 'Rebound tenderness', documentationPhrase: 'rebound tenderness' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['appendicitis', 'peritonitis', 'cholecystitis', 'pancreatitis'], weight: 0.5,
                documentationPhrase: 'abdominal tenderness' },
            ],
          },
          { id: 'abd_masses', label: 'Palpable Masses', type: 'multi_select',
            options: [
              { value: 'none', label: 'None', documentationPhrase: 'no palpable masses' },
              { value: 'right_hypochondrium', label: 'RUQ mass', documentationPhrase: 'mass in the right upper quadrant' },
              { value: 'left_hypochondrium', label: 'LUQ mass', documentationPhrase: 'mass in the left upper quadrant' },
              { value: 'epigastric', label: 'Epigastric mass', documentationPhrase: 'epigastric mass' },
              { value: 'umbilical', label: 'Periumbilical mass', documentationPhrase: 'periumbilical mass' },
              { value: 'right_iliac', label: 'RLQ mass', documentationPhrase: 'mass in the right lower quadrant' },
              { value: 'left_iliac', label: 'LLQ mass', documentationPhrase: 'mass in the left lower quadrant' },
              { value: 'suprapubic', label: 'Suprapubic mass', documentationPhrase: 'suprapubic mass' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
            cascadeTrigger: 'mass_cascade',
          },
          {
            id: 'abd_organomegaly', label: 'Organomegaly', type: 'multi_select',
            options: [
              { value: 'none', label: 'None', documentationPhrase: 'no organomegaly' },
              { value: 'hepatomegaly', label: 'Hepatomegaly', documentationPhrase: 'hepatomegaly' },
              { value: 'splenomegaly', label: 'Splenomegaly', documentationPhrase: 'splenomegaly' },
              { value: 'hepatosplenomegaly', label: 'Hepatosplenomegaly', documentationPhrase: 'hepatosplenomegaly' },
              { value: 'renal_enlargement', label: 'Renal enlargement', documentationPhrase: 'renal enlargement' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cirrhosis', 'hepatitis', 'heart_failure', 'malaria', 'leukemia'], weight: 0.6,
                documentationPhrase: 'hepatomegaly' },
              { supportsDisease: ['malaria', 'leukemia', 'lymphoma', 'portal_hypertension'], weight: 0.6,
                documentationPhrase: 'splenomegaly' },
            ],
          },
        ],
      },
      {
        id: 'abd_percussion',
        label: 'Percussion',
        findings: [
          { id: 'abd_percussion_note', label: 'General Percussion', type: 'single_select',
            options: [
              { value: 'tympanic', label: 'Tympanic', documentationPhrase: 'tympanic percussion note throughout' },
              { value: 'dull', label: 'Dull', documentationPhrase: 'diffuse dullness' },
              { value: 'shifting_dullness', label: 'Shifting dullness', documentationPhrase: 'shifting dullness' },
              { value: 'fluid_thrill', label: 'Fluid thrill', documentationPhrase: 'fluid thrill present' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['ascites'], weight: 0.7, documentationPhrase: 'shifting dullness' },
            ],
          },
          { id: 'abd_liver_size', label: 'Liver Span (percussion)', type: 'numeric', unit: 'cm',
            documentationTemplate: 'Liver span was {value} cm on percussion.',
            evidenceLinks: [],
          },
        ],
      },
      {
        id: 'abd_auscultation',
        label: 'Auscultation',
        findings: [
          { id: 'abd_bowel_sounds', label: 'Bowel Sounds', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'normal bowel sounds' },
              { value: 'increased', label: 'Increased', documentationPhrase: 'increased bowel sounds' },
              { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced bowel sounds' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'absent bowel sounds' },
              { value: 'tinkling', label: 'Tinkling / Obstructive', documentationPhrase: 'tinkling bowel sounds suggestive of obstruction' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['intestinal_obstruction'], weight: 0.6,
                documentationPhrase: 'tinkling bowel sounds' },
              { supportsDisease: ['peritonitis', 'ileus'], weight: 0.5,
                documentationPhrase: 'absent bowel sounds' },
            ],
          },
          { id: 'abd_bruits', label: 'Bruits', type: 'boolean',
            documentationTemplate: 'Abdominal bruits are {value}.',
            evidenceLinks: [
              { supportsDisease: ['renal_artery_stenosis', 'aa_aneurysm'], weight: 0.5,
                documentationPhrase: 'abdominal bruit' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'neurological',
    label: 'Neurological Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: false, triggerOnFinding: ['neurological_findings'] },
    findingGroups: [
      {
        id: 'neuro_mental',
        label: 'Mental State',
        findings: [
          { id: 'neuro_consciousness', label: 'Level of Consciousness', type: 'single_select',
            options: [
              { value: 'alert', label: 'Alert', documentationPhrase: 'alert and oriented' },
              { value: 'confused', label: 'Confused', documentationPhrase: 'confused' },
              { value: 'drowsy', label: 'Drowsy', documentationPhrase: 'drowsy but rousable' },
              { value: 'stupor', label: 'Stupor', documentationPhrase: 'in stupor' },
              { value: 'coma', label: 'Coma', documentationPhrase: 'comatose' },
            ],
            documentationTemplate: 'The patient is {value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'meningitis', 'encephalopathy', 'sepsis'], weight: 0.5,
                documentationPhrase: 'reduced consciousness' },
            ],
          },
        ],
      },
      {
        id: 'neuro_cranial_nerves',
        label: 'Cranial Nerves',
        findings: [
          { id: 'neuro_cn_summary', label: 'Cranial Nerves', type: 'single_select',
            options: [
              { value: 'normal', label: 'Intact', documentationPhrase: 'all cranial nerves are intact' },
              { value: 'abnormal', label: 'Abnormal', documentationPhrase: 'cranial nerve deficits present' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'brain_tumor', 'ms'], weight: 0.5,
                documentationPhrase: 'cranial nerve deficit' },
            ],
            cascadeTrigger: 'cranial_nerve_cascade',
          },
        ],
      },
      {
        id: 'neuro_motor',
        label: 'Motor System',
        findings: [
          { id: 'neuro_tone', label: 'Muscle Tone', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'normal muscle tone' },
              { value: 'hypertonia_spastic', label: 'Hypertonia (spastic)', documentationPhrase: 'spastic hypertonia' },
              { value: 'hypertonia_rigid', label: 'Hypertonia (rigid)', documentationPhrase: 'rigid hypertonia' },
              { value: 'hypotonia', label: 'Hypotonia', documentationPhrase: 'hypotonia' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'pd', 'cerebral_palsy'], weight: 0.5,
                documentationPhrase: 'abnormal tone' },
            ],
          },
          { id: 'neuro_power', label: 'Muscle Power', type: 'single_select',
            options: [
              { value: '5', label: '5/5 — Normal', documentationPhrase: 'power 5/5 throughout' },
              { value: '4', label: '4/5 — Reduced', documentationPhrase: 'power 4/5' },
              { value: '3', label: '3/5 — Against gravity', documentationPhrase: 'power 3/5' },
              { value: '2', label: '2/5 — Gravity eliminated', documentationPhrase: 'power 2/5' },
              { value: '1', label: '1/5 — Flicker', documentationPhrase: 'power 1/5' },
              { value: '0', label: '0/5 — No movement', documentationPhrase: 'power 0/5' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'neuropathy', 'myopathy'], weight: 0.6,
                documentationPhrase: 'power {value}/5' },
            ],
          },
          { id: 'neuro_reflexes', label: 'Deep Tendon Reflexes', type: 'multi_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'DTRs are normal' },
              { value: 'brisk', label: 'Brisk / Hyperreflexia', documentationPhrase: 'hyperreflexia' },
              { value: 'reduced', label: 'Reduced / Hyporeflexia', documentationPhrase: 'hyporeflexia' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'absent reflexes' },
              { value: 'clonus', label: 'Clonus', documentationPhrase: 'clonus' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'umnd'], weight: 0.5, documentationPhrase: 'hyperreflexia' },
              { supportsDisease: ['neuropathy', 'lmnd'], weight: 0.5, documentationPhrase: 'hyporeflexia' },
            ],
          },
          { id: 'neuro_planter', label: 'Plantar Response', type: 'single_select',
            options: [
              { value: 'flexor', label: 'Flexor (normal)', documentationPhrase: 'plantar response is flexor' },
              { value: 'extensor', label: 'Extensor (Babinski)', documentationPhrase: 'extensor plantar response (Babinski positive)' },
              { value: 'equivocal', label: 'Equivocal', documentationPhrase: 'equivocal plantar response' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'umnd'], weight: 0.6,
                documentationPhrase: 'extensor plantar response' },
            ],
          },
        ],
      },
      {
        id: 'neuro_sensory',
        label: 'Sensory System',
        findings: [
          { id: 'neuro_sensation', label: 'Sensation', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'sensation is normal throughout' },
              { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced sensation' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'absent sensation' },
              { value: 'hyperesthesia', label: 'Hyperesthesia', documentationPhrase: 'hyperesthesia' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['neuropathy', 'cva', 'spinal_cord_lesion'], weight: 0.5,
                documentationPhrase: 'sensory deficit' },
            ],
          },
        ],
      },
      {
        id: 'neuro_coordination',
        label: 'Coordination & Gait',
        findings: [
          { id: 'neuro_gait', label: 'Gait', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'gait is normal' },
              { value: 'hemiplegic', label: 'Hemiplegic', documentationPhrase: 'hemiplegic gait' },
              { value: 'ataxic', label: 'Ataxic', documentationPhrase: 'ataxic gait' },
              { value: 'parkinsonian', label: 'Parkinsonian', documentationPhrase: 'parkinsonian gait' },
              { value: 'high_stepping', label: 'High-stepping', documentationPhrase: 'high-stepping gait' },
              { value: 'waddling', label: 'Waddling', documentationPhrase: 'waddling gait' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cva', 'pd', 'neuropathy', 'myopathy'], weight: 0.5,
                documentationPhrase: 'abnormal gait' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'neonatal_systemic',
    label: 'Neonatal Systemic Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { showForAgeGroups: ['neonate'] },
    findingGroups: [
      {
        id: 'neonatal_head_to_toe',
        label: 'Head-to-Toe',
        findings: [
          { id: 'neo_head', label: 'Head / Fontanelles', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'head shape and fontanelles are normal' },
              { value: 'large_fontanelle', label: 'Large / Full fontanelle', documentationPhrase: 'full anterior fontanelle' },
              { value: 'small_fontanelle', label: 'Small fontanelle', documentationPhrase: 'small fontanelle' },
              { value: 'cephalohaematoma', label: 'Cephalohaematoma', documentationPhrase: 'cephalohaematoma' },
              { value: 'caput', label: 'Caput succedaneum', documentationPhrase: 'caput succedaneum' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['birth_trauma', 'hydrocephalus', 'meningitis'], weight: 0.5,
                documentationPhrase: 'abnormal fontanelle' },
            ],
          },
          { id: 'neo_eyes', label: 'Eyes', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'eyes normal' },
              { value: 'conjunctivitis', label: 'Conjunctivitis', documentationPhrase: 'conjunctivitis' },
              { value: 'cataract', label: 'Cataract', documentationPhrase: 'congenital cataract' },
              { value: 'icterus', label: 'Icteric', documentationPhrase: 'icteric sclerae' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_ears', label: 'Ears', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'ears normally formed' },
              { value: 'low_set', label: 'Low-set ears', documentationPhrase: 'low-set ears' },
              { value: 'abnormal', label: 'Abnormal shape', documentationPhrase: 'abnormal ear shape' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['genetic_syndrome'], weight: 0.3,
                documentationPhrase: 'dysmorphic ears' },
            ],
          },
          { id: 'neo_palate', label: 'Palate', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'palate intact' },
              { value: 'cleft', label: 'Cleft palate', documentationPhrase: 'cleft palate' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_cord', label: 'Cord / Umbilicus', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'umbilical cord is normal' },
              { value: 'infected', label: 'Infected', documentationPhrase: 'umbilical cord with signs of infection' },
              { value: 'granuloma', label: 'Granuloma', documentationPhrase: 'umbilical granuloma' },
              { value: 'hernia', label: 'Hernia', documentationPhrase: 'umbilical hernia' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_hips', label: 'Hips (Barlow/Ortolani)', type: 'single_select',
            options: [
              { value: 'normal', label: 'Stable', documentationPhrase: 'hips stable on Barlow and Ortolani testing' },
              { value: 'unstable', label: 'Unstable / Dislocatable', documentationPhrase: 'unstable hips on Ortolani/Barlow testing' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['developmental_dysplasia_hip'], weight: 0.8,
                documentationPhrase: 'unstable hip' },
            ],
          },
          { id: 'neo_anogenital', label: 'Anogenital', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'anogenital region normal' },
              { value: 'imperforate_anus', label: 'Imperforate anus', documentationPhrase: 'imperforate anus' },
              { value: 'ambiguous_genitalia', label: 'Ambiguous genitalia', documentationPhrase: 'ambiguous genitalia' },
              { value: 'undescended_testes', label: 'Undescended testes', documentationPhrase: 'undescended testes' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
        ],
      },
      {
        id: 'neonatal_reflexes',
        label: 'Primitive Reflexes',
        findings: [
          { id: 'neo_moro', label: 'Moro Reflex', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'Moro reflex is present and symmetrical' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'Moro reflex is absent' },
              { value: 'asymmetrical', label: 'Asymmetrical', documentationPhrase: 'Moro reflex is asymmetrical' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['birth_asphyxia', 'brachial_plexus_injury'], weight: 0.6,
                documentationPhrase: 'abnormal Moro reflex' },
            ],
          },
          { id: 'neo_sucking', label: 'Sucking Reflex', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'sucking reflex is present' },
              { value: 'weak', label: 'Weak', documentationPhrase: 'sucking reflex is weak' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'sucking reflex is absent' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['birth_asphyxia', 'neonatal_sepsis'], weight: 0.4,
                documentationPhrase: 'weak sucking reflex' },
            ],
          },
          { id: 'neo_rooting', label: 'Rooting Reflex', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'rooting reflex is present' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'rooting reflex is absent' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_grasp_palmar', label: 'Palmar Grasp', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'palmar grasp is present' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'palmar grasp is absent' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_grasp_plantar', label: 'Plantar Grasp', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'plantar grasp is present' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'plantar grasp is absent' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_stepping', label: 'Stepping Reflex', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'stepping reflex is present' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'stepping reflex is absent' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'neo_asymmetric_tonic_neck', label: 'Asymmetric Tonic Neck (ATNR)', type: 'single_select',
            options: [
              { value: 'present', label: 'Present', documentationPhrase: 'ATNR is present' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'ATNR is absent' },
              { value: 'persistent', label: 'Persistent beyond expected', documentationPhrase: 'persistent ATNR' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['cerebral_palsy'], weight: 0.4,
                documentationPhrase: 'persistent ATNR' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'obstetric',
    label: 'Obstetric Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { showForPregnancy: true },
    findingGroups: [
      {
        id: 'obs_abdominal',
        label: 'Abdominal / Obstetric',
        findings: [
          { id: 'obs_fundal_height', label: 'Fundal Height', type: 'numeric', unit: 'cm',
            documentationTemplate: 'Fundal height was {value} cm ({weeks} weeks gestation).',
            evidenceLinks: [
              { supportsDisease: ['sga', 'lga', 'polyhydramnios', 'oligohydramnios'], weight: 0.5,
                documentationPhrase: 'fundal height {value} cm' },
            ],
          },
          { id: 'obs_lie', label: 'Fetal Lie', type: 'single_select',
            options: [
              { value: 'longitudinal', label: 'Longitudinal', documentationPhrase: 'fetal lie is longitudinal' },
              { value: 'transverse', label: 'Transverse', documentationPhrase: 'fetal lie is transverse' },
              { value: 'oblique', label: 'Oblique', documentationPhrase: 'fetal lie is oblique' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'obs_presentation', label: 'Presentation', type: 'single_select',
            options: [
              { value: 'cephalic', label: 'Cephalic', documentationPhrase: 'presentation is cephalic' },
              { value: 'breech', label: 'Breech', documentationPhrase: 'presentation is breech' },
              { value: 'shoulder', label: 'Shoulder', documentationPhrase: 'presentation is shoulder' },
              { value: 'compound', label: 'Compound', documentationPhrase: 'compound presentation' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'obs_engagement', label: 'Engagement', type: 'single_select',
            options: [
              { value: 'free', label: 'Free / Not engaged', documentationPhrase: 'presenting part is free' },
              { value: 'engaging', label: 'Engaging', documentationPhrase: 'presenting part is engaging' },
              { value: 'engaged', label: 'Engaged', documentationPhrase: 'presenting part is engaged' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
          { id: 'obs_contractions', label: 'Uterine Contractions', type: 'single_select',
            options: [
              { value: 'none', label: 'None', documentationPhrase: 'no uterine contractions' },
              { value: 'irregular', label: 'Irregular / Braxton Hicks', documentationPhrase: 'irregular Braxton Hicks contractions' },
              { value: 'regular', label: 'Regular', documentationPhrase: 'regular uterine contractions' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
        ],
      },
      {
        id: 'obs_fetal',
        label: 'Fetal Assessment',
        findings: [
          { id: 'obs_fhr', label: 'Fetal Heart Rate', type: 'numeric', unit: 'bpm',
            min: 60, max: 220,
            documentationTemplate: 'Fetal heart rate was {value} bpm.',
            evidenceLinks: [
              { supportsDisease: ['fetal_distress'], weight: 0.6,
                documentationPhrase: 'fetal heart rate {value} bpm' },
            ],
          },
          { id: 'obs_fetal_movements', label: 'Fetal Movements', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'fetal movements are normal' },
              { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced fetal movements' },
              { value: 'absent', label: 'Absent', documentationPhrase: 'absent fetal movements' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['fetal_distress', 'fetal_death'], weight: 0.7,
                documentationPhrase: 'reduced fetal movements' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ent',
    label: 'ENT Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: false, triggerOnFinding: ['ear_symptoms', 'throat_symptoms', 'nasal_symptoms'] },
    findingGroups: [
      {
        id: 'ent_oral',
        label: 'Oral Cavity & Pharynx',
        findings: [
          { id: 'ent_pharynx', label: 'Pharynx', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'pharynx is normal' },
              { value: 'erythematous', label: 'Erythematous', documentationPhrase: 'pharyngeal erythema' },
              { value: 'exudate', label: 'Exudative tonsillitis', documentationPhrase: 'tonsillar exudate' },
              { value: 'ulcers', label: 'Ulcers', documentationPhrase: 'oral ulcers' },
              { value: 'pus_pouch', label: 'Posterior pharyngeal pus', documentationPhrase: 'posterior pharyngeal pus' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['pharyngitis', 'tonsillitis', 'uri'], weight: 0.5,
                documentationPhrase: 'pharyngeal erythema' },
            ],
          },
        ],
      },
      {
        id: 'ent_hearing',
        label: 'Hearing',
        findings: [
          { id: 'ent_hearing_test', label: 'Hearing', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'hearing is normal' },
              { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced hearing' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
        ],
      },
    ],
  },
  {
    id: 'eye',
    label: 'Eye Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: false, triggerOnFinding: ['eye_symptoms', 'vision_complaint'] },
    findingGroups: [
      {
        id: 'eye_vision',
        label: 'Vision',
        findings: [
          { id: 'eye_acuity', label: 'Visual Acuity', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'visual acuity is normal' },
              { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced visual acuity' },
              { value: 'cf', label: 'Counting fingers', documentationPhrase: 'counting fingers' },
              { value: 'hm', label: 'Hand motion', documentationPhrase: 'hand motion only' },
              { value: 'lp', label: 'Light perception', documentationPhrase: 'light perception only' },
              { value: 'npl', label: 'No light perception', documentationPhrase: 'no light perception' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
        ],
      },
      {
        id: 'eye_anterior',
        label: 'Anterior Segment',
        findings: [
          { id: 'eye_conjunctiva', label: 'Conjunctiva', type: 'single_select',
            options: [
              { value: 'normal', label: 'Normal', documentationPhrase: 'conjunctiva is normal' },
              { value: 'injected', label: 'Injected', documentationPhrase: 'conjunctival injection' },
              { value: 'pale', label: 'Pale', documentationPhrase: 'pale conjunctiva' },
              { value: 'icteric', label: 'Icteric', documentationPhrase: 'icteric conjunctiva' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [
              { supportsDisease: ['conjunctivitis', 'anaemia', 'jaundice'], weight: 0.4,
                documentationPhrase: 'conjunctival abnormality' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'skin',
    label: 'Skin Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: false, triggerOnFinding: ['skin_complaint', 'rash', 'lesion'] },
    findingGroups: [
      {
        id: 'skin_lesions',
        label: 'Skin Lesions',
        findings: [
          { id: 'skin_lesion_type', label: 'Lesion Type', type: 'multi_select',
            options: [
              { value: 'none', label: 'No lesions', documentationPhrase: 'no skin lesions' },
              { value: 'macule', label: 'Macule', documentationPhrase: 'macules' },
              { value: 'papule', label: 'Papule', documentationPhrase: 'papules' },
              { value: 'vesicle', label: 'Vesicle', documentationPhrase: 'vesicles' },
              { value: 'pustule', label: 'Pustule', documentationPhrase: 'pustules' },
              { value: 'ulcer', label: 'Ulcer', documentationPhrase: 'skin ulcer' },
              { value: 'nodule', label: 'Nodule', documentationPhrase: 'nodules' },
              { value: 'plaque', label: 'Plaque', documentationPhrase: 'plaques' },
              { value: 'scale', label: 'Scale', documentationPhrase: 'scaling' },
              { value: 'petechiae', label: 'Petechiae', documentationPhrase: 'petechiae' },
              { value: 'purpura', label: 'Purpura', documentationPhrase: 'purpura' },
            ],
            documentationTemplate: '{value} noted on examination.',
            evidenceLinks: [
              { supportsDisease: ['cellulitis', 'eczema', 'psoriasis', 'meningitis'], weight: 0.3,
                documentationPhrase: 'skin lesions' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'breast',
    label: 'Breast Examination',
    sequence: ['inspection', 'palpation', 'percussion', 'auscultation', 'special_tests'],
    contextVisibility: { alwaysShow: false, triggerOnFinding: ['breast_complaint', 'lump'] },
    findingGroups: [
      {
        id: 'breast_inspection',
        label: 'Inspection',
        findings: [
          { id: 'breast_symmetry', label: 'Symmetry', type: 'single_select',
            options: [
              { value: 'symmetrical', label: 'Symmetrical', documentationPhrase: 'breasts are symmetrical' },
              { value: 'asymmetrical', label: 'Asymmetrical', documentationPhrase: 'breast asymmetry' },
            ],
            documentationTemplate: '{value}.',
            evidenceLinks: [],
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// SPECIAL EXAMINATION CASCADES
// ─────────────────────────────────────────────────────────────────

export interface SpecialCascadeDef {
  id: string;
  label: string;
  triggerFindings: string[];
  groups: ExamFindingGroupDef[];
}

export const SPECIAL_CASCADES: SpecialCascadeDef[] = [
  {
    id: 'mass_cascade',
    label: 'Mass / Lump Examination',
    triggerFindings: ['abd_masses', 'breast_lump', 'lymph_node_palpable', 'scrotal_swelling'],
    groups: [
      {
        id: 'mass_inspection',
        label: 'Inspection',
        findings: [
          { id: 'mass_site', label: 'Site', type: 'text', documentationTemplate: 'Mass located at {value}.', evidenceLinks: [] },
          { id: 'mass_size', label: 'Size (cm)', type: 'numeric', unit: 'cm', documentationTemplate: 'The mass measures {value} cm.', evidenceLinks: [] },
          { id: 'mass_shape', label: 'Shape', type: 'single_select', options: [
            { value: 'round', label: 'Round', documentationPhrase: 'round' },
            { value: 'oval', label: 'Oval', documentationPhrase: 'oval' },
            { value: 'irregular', label: 'Irregular', documentationPhrase: 'irregular' },
          ], documentationTemplate: 'The mass is {value} in shape.', evidenceLinks: [] },
          { id: 'mass_surface', label: 'Surface', type: 'single_select', options: [
            { value: 'smooth', label: 'Smooth', documentationPhrase: 'smooth surface' },
            { value: 'nodular', label: 'Nodular', documentationPhrase: 'nodular surface' },
            { value: 'lobulated', label: 'Lobulated', documentationPhrase: 'lobulated' },
          ], documentationTemplate: 'The mass has a {value}.', evidenceLinks: [] },
          { id: 'mass_edges', label: 'Edges', type: 'single_select', options: [
            { value: 'well_defined', label: 'Well-defined', documentationPhrase: 'well-defined edges' },
            { value: 'ill_defined', label: 'Ill-defined', documentationPhrase: 'ill-defined edges' },
            { value: 'rolled', label: 'Rolled', documentationPhrase: 'rolled edges' },
            { value: 'everted', label: 'Everted', documentationPhrase: 'everted edges' },
          ], documentationTemplate: 'The mass has {value}.', evidenceLinks: [] },
          { id: 'mass_skin', label: 'Overlying Skin', type: 'single_select', options: [
            { value: 'normal', label: 'Normal', documentationPhrase: 'overlying skin is normal' },
            { value: 'fixed', label: 'Fixed', documentationPhrase: 'skin is fixed to the mass' },
            { value: 'ulcerated', label: 'Ulcerated', documentationPhrase: 'overlying skin is ulcerated' },
            { value: 'peau_dorange', label: 'Peau d\'orange', documentationPhrase: 'peau d\'orange appearance' },
          ], documentationTemplate: '{value}.', evidenceLinks: [] },
        ],
      },
      {
        id: 'mass_palpation',
        label: 'Palpation',
        findings: [
          { id: 'mass_temperature', label: 'Temperature', type: 'single_select', options: [
            { value: 'normal', label: 'Normal', documentationPhrase: 'normal temperature' },
            { value: 'warm', label: 'Warm', documentationPhrase: 'warm to touch' },
          ], documentationTemplate: '{value}.', evidenceLinks: [] },
          { id: 'mass_tenderness', label: 'Tenderness', type: 'boolean', documentationTemplate: 'Mass is {value}.', evidenceLinks: [] },
          { id: 'mass_consistency', label: 'Consistency', type: 'single_select', options: [
            { value: 'soft', label: 'Soft', documentationPhrase: 'soft in consistency' },
            { value: 'firm', label: 'Firm', documentationPhrase: 'firm' },
            { value: 'hard', label: 'Hard', documentationPhrase: 'hard' },
            { value: 'cystic', label: 'Cystic', documentationPhrase: 'cystic' },
            { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery' },
          ], documentationTemplate: 'The mass is {value}.', evidenceLinks: [] },
          { id: 'mass_mobility', label: 'Mobility', type: 'single_select', options: [
            { value: 'mobile', label: 'Mobile', documentationPhrase: 'mobile' },
            { value: 'partially_fixed', label: 'Partially fixed', documentationPhrase: 'partially fixed' },
            { value: 'fixed', label: 'Fixed', documentationPhrase: 'fixed to underlying structures' },
          ], documentationTemplate: 'The mass is {value}.', evidenceLinks: [
            { supportsDisease: ['malignancy'], weight: 0.4, documentationPhrase: 'fixed mass' },
          ] },
          { id: 'mass_fluctuation', label: 'Fluctuation', type: 'boolean', documentationTemplate: 'Fluctuation is {value}.', evidenceLinks: [] },
          { id: 'mass_transillumination', label: 'Transillumination', type: 'boolean', documentationTemplate: 'Transillumination is {value}.', evidenceLinks: [] },
          { id: 'mass_reducibility', label: 'Reducibility', type: 'boolean', documentationTemplate: 'Mass is {value}.', evidenceLinks: [] },
          { id: 'mass_pulsatility', label: 'Pulsatility', type: 'boolean', documentationTemplate: 'Mass is {value}.', evidenceLinks: [] },
          { id: 'mass_compressibility', label: 'Compressibility', type: 'boolean', documentationTemplate: 'Mass is {value}.', evidenceLinks: [] },
          { id: 'mass_plane', label: 'Plane (deep/superficial)', type: 'single_select', options: [
            { value: 'superficial', label: 'Superficial to muscle', documentationPhrase: 'superficial to muscle' },
            { value: 'deep_to_muscle', label: 'Deep to muscle', documentationPhrase: 'deep to muscle' },
            { value: 'both_sides', label: 'Both sides of muscle', documentationPhrase: 'extends to both sides of muscle' },
          ], documentationTemplate: 'The mass lies {value}.', evidenceLinks: [] },
        ],
      },
    ],
  },
  {
    id: 'lymph_node_cascade',
    label: 'Lymph Node Cascade',
    triggerFindings: ['lymph_node_status'],
    groups: [
      {
        id: 'ln_assessment',
        label: 'Lymph Node Assessment',
        findings: [
          { id: 'ln_site', label: 'Site', type: 'multi_select', options: [
            { value: 'cervical', label: 'Cervical', documentationPhrase: 'cervical' },
            { value: 'axillary', label: 'Axillary', documentationPhrase: 'axillary' },
            { value: 'inguinal', label: 'Inguinal', documentationPhrase: 'inguinal' },
            { value: 'supraclavicular', label: 'Supraclavicular', documentationPhrase: 'supraclavicular' },
            { value: 'epitrochlear', label: 'Epitrochlear', documentationPhrase: 'epitrochlear' },
            { value: 'generalized', label: 'Generalized', documentationPhrase: 'generalized' },
          ], documentationTemplate: 'Lymphadenopathy in {value} region.', evidenceLinks: [
            { supportsDisease: ['tb', 'lymphoma', 'hiv', 'infection'], weight: 0.5,
              documentationPhrase: 'lymphadenopathy' },
          ] },
          { id: 'ln_size', label: 'Size (cm)', type: 'numeric', unit: 'cm', documentationTemplate: 'Nodes measure {value} cm.', evidenceLinks: [] },
          { id: 'ln_tender', label: 'Tender', type: 'boolean', documentationTemplate: 'Nodes are {value}.', evidenceLinks: [
            { supportsDisease: ['infectious_lymphadenitis'], weight: 0.4,
              documentationPhrase: 'tender lymph nodes' },
          ] },
          { id: 'ln_consistency', label: 'Consistency', type: 'single_select', options: [
            { value: 'soft', label: 'Soft', documentationPhrase: 'soft' },
            { value: 'firm', label: 'Firm', documentationPhrase: 'firm' },
            { value: 'hard', label: 'Hard', documentationPhrase: 'hard' },
            { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery' },
          ], documentationTemplate: 'Nodes are {value}.', evidenceLinks: [] },
          { id: 'ln_mobility', label: 'Mobility', type: 'single_select', options: [
            { value: 'mobile', label: 'Mobile', documentationPhrase: 'mobile' },
            { value: 'matted', label: 'Matted', documentationPhrase: 'matted' },
            { value: 'fixed', label: 'Fixed', documentationPhrase: 'fixed to underlying tissue' },
          ], documentationTemplate: 'Nodes are {value}.', evidenceLinks: [
            { supportsDisease: ['tb', 'malignancy'], weight: 0.5, documentationPhrase: 'matted lymph nodes' },
          ] },
          { id: 'ln_skin', label: 'Overlying Skin', type: 'single_select', options: [
            { value: 'normal', label: 'Normal', documentationPhrase: 'overlying skin is normal' },
            { value: 'fistula', label: 'Sinus / Fistula', documentationPhrase: 'sinus formation' },
            { value: 'scar', label: 'Scar', documentationPhrase: 'scar over node' },
          ], documentationTemplate: '{value}.', evidenceLinks: [
            { supportsDisease: ['tb'], weight: 0.6, documentationPhrase: 'sinus formation' },
          ] },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// CROSS-CHECK RULES — history vs examination inconsistency detection
// ─────────────────────────────────────────────────────────────────

export interface CrossCheckRule {
  id: string;
  historyFact: string;
  historyValue: unknown;
  examFinding: string;
  examValue: unknown;
  conflictType: 'concordant' | 'discordant' | 'history_missed' | 'exam_missed';
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export const CROSS_CHECK_RULES: CrossCheckRule[] = [
  { id: 'cc_dyspnea_vs_rr', historyFact: 'cough_dyspnea', historyValue: 'none', examFinding: 'respiratory_rate', examValue: null, conflictType: 'discordant', severity: 'warning',
    message: 'Patient reports no dyspnea but respiratory rate is elevated. Please clarify.' },
  { id: 'cc_no_jaundice_vs_icterus', historyFact: 'jaundice_reported', historyValue: false, examFinding: 'jaundice', examValue: null, conflictType: 'discordant', severity: 'warning',
    message: 'Patient reported no jaundice but scleral icterus is present clinically. Please clarify.' },
  { id: 'cc_no_swelling_vs_edema', historyFact: 'swelling_reported', historyValue: false, examFinding: 'edema', examValue: null, conflictType: 'discordant', severity: 'info',
    message: 'Edema noted on examination but patient denied swelling. Please clarify.' },
  { id: 'cc_no_fever_vs_temp', historyFact: 'cough_fever', historyValue: 'no', examFinding: 'temperature', examValue: null, conflictType: 'discordant', severity: 'warning',
    message: 'Patient denied fever but temperature is elevated. Please clarify.' },
  { id: 'cc_no_cough_vs_auscultation', historyFact: 'chief_complaint', historyValue: null, examFinding: 'resp_added_sounds', examValue: null, conflictType: 'history_missed', severity: 'info',
    message: 'Abnormal lung findings without respiratory complaint. Consider adding to problem list.' },
];

// ─────────────────────────────────────────────────────────────────
// DOCUMENTATION TEMPLATES — for realtime narrative generation
// ─────────────────────────────────────────────────────────────────

export const EXAM_DOC_SECTIONS: Record<string, string> = {
  vitals: '**Vital Signs:** {vitals_narrative}',
  general_exam: '**General Examination:** The patient is {gen_narrative}',
  anthropometry: '**Anthropometry:** {anthro_narrative}',
  respiratory: '**Respiratory Examination:** {resp_narrative}',
  cardiovascular: '**Cardiovascular Examination:** {cvs_narrative}',
  abdominal: '**Abdominal Examination:** {abd_narrative}',
  neurological: '**Neurological Examination:** {neuro_narrative}',
  ent: '**ENT Examination:** {ent_narrative}',
  eye: '**Eye Examination:** {eye_narrative}',
  skin: '**Skin Examination:** {skin_narrative}',
  neonatal_systemic: '**Neonatal Systemic Examination:** {neo_narrative}',
  obstetric: '**Obstetric Examination:** {obs_narrative}',
  breast: '**Breast Examination:** {breast_narrative}',
};
