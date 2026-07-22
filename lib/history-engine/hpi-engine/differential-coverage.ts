// ── Differential Coverage Engine ───────────────────────────────
// RULES:
// H11 — System maintains a candidate differential list.
// H12 — For every candidate diagnosis, store supporting/opposing/pending.
// H13 — Rule-in when enough supporting evidence collected.
// H14 — Rule-out when enough opposing evidence collected.
// H15 — Track risk factors and complications per diagnosis.
// H17 — Never ask questions unrelated to active differential set.
// H18 — Never repeat answered questions.
// H19 — Ask the question that removes the greatest uncertainty first.
// H20 — Remove questions once enough evidence gathered.

import type {
  SymptomInstance, DifferentialDiagnosis, DifferentialCoverage,
  Question, HpiState, ExplorationField,
} from './types';

// ── Thresholds ─────────────────────────────────────────────────
const MIN_SUPPORTING_FOR_RULE_IN = 3;
const MIN_OPPOSING_FOR_EXCLUSION = 2;
const MIN_COVERAGE_PERCENT = 60;

// ── Knowledge Interface ────────────────────────────────────────
export interface DiagnosisKnowledge {
  id: string;
  name: string;
  supportingFindings: { field: string; weight: number; symptomCategory?: string; expectedValue?: any }[];
  opposingFindings: { field: string; weight: number; symptomCategory?: string; expectedValue?: any }[];
  riskFactors: string[];
  complications: string[];
  ruleInFields: string[];
  ruleOutFields: string[];
  minSupportingForRuleIn: number;
  minOpposingForExclusion: number;
  ddPriority: 'high' | 'medium' | 'low';
  investigations: string[];
  management: { initial: string[]; definitive: string[] };
  typicalPresentation: string;
}

// ── Complete Differential Knowledge Base ───────────────────────
// Every LBO-relevant diagnosis with full supporting/opposing findings,
// risk factors, complications, and rule-in/rule-out fields.
// Each field ID maps to an exploration template field.
export const CORE_DIFFERENTIAL_KNOWLEDGE: Record<string, DiagnosisKnowledge> = {

  // ═══════════════════════════════════════════════════════════════
  // SIGMOID VOLVULUS
  // ═══════════════════════════════════════════════════════════════
sigmoid_volvulus: {
    id: 'sigmoid_volvulus',
    name: 'Sigmoid Volvulus',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_location', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_onset', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_timing', weight: 2, symptomCategory: 'pain' },
      { field: 'distension_course', weight: 5, symptomCategory: 'distension' },
      { field: 'distension_rate', weight: 4, symptomCategory: 'distension' },
      { field: 'distension_flatus', weight: 5, symptomCategory: 'distension', expectedValue: false },
      { field: 'distension_bowel_movement', weight: 5, symptomCategory: 'distension' },
      { field: 'distension_previous_similar', weight: 5, symptomCategory: 'distension', expectedValue: true },
      { field: 'distension_visible_peristalsis', weight: 3, symptomCategory: 'distension' },
      { field: 'constipation_completeness', weight: 4, symptomCategory: 'constipation' },
      { field: 'vomiting_content', weight: 3, symptomCategory: 'vomiting' },
      { field: 'vomiting_faeculent', weight: 4, symptomCategory: 'vomiting', expectedValue: true },
      { field: 'constipation_prior_habit', weight: 2, symptomCategory: 'constipation' },
    ],
    opposingFindings: [
      { field: 'constipation_blood', weight: 4, symptomCategory: 'constipation', expectedValue: true },
      { field: 'constipation_stool_caliber', weight: 2, symptomCategory: 'constipation' },
      { field: 'vomiting_bilious', weight: 2, symptomCategory: 'vomiting', expectedValue: true },
      { field: 'diarrhea_consistency', weight: 3, symptomCategory: 'diarrhea', expectedValue: 'watery' },
      { field: 'fever_pattern', weight: 2, symptomCategory: 'fever' },
    ],
    riskFactors: [
      'age_above_60', 'male_sex', 'chronic_constipation',
      'high_fibre_diet', 'previous_episodes', 'no_prior_abdominal_surgery',
      'neurological_disease', 'institutionalized',
    ],
    complications: [
      'ischaemia', 'perforation', 'peritonitis', 'sepsis',
      'AKI', 'electrolyte_imbalance', 'bowel_necrosis',
    ],
    ruleInFields: [
      'distension_course_rapidly_progressive',
      'distension_flatus_false',
      'distension_bowel_movement_5_days_ago',
      'distension_previous_similar_true',
      'constipation_completeness_complete_no_stool',
    ],
    ruleOutFields: [
      'constipation_blood_true',
      'diarrhea_consistency_watery',
      'vomiting_bilious_true',
    ],
    minSupportingForRuleIn: 4,
    minOpposingForExclusion: 3,
    investigations: ['FBC', 'U&E', 'CRP', 'Abdominal XR', 'CT abdomen/pelvis'],
    management: { initial: ['IV fluids', 'NG tube', 'NBM', 'Analgesia'], definitive: ['Sigmoidoscopic decompression', 'Resection if ischaemic'] },
    typicalPresentation: 'Elderly patient with sudden severe colicky lower abdominal pain, gross abdominal distension, and absolute constipation.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CAECAL VOLVULUS
  // ═══════════════════════════════════════════════════════════════
  caecal_volvulus: {
    id: 'caecal_volvulus',
    name: 'Caecal Volvulus',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_location', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_onset', weight: 4, symptomCategory: 'pain' },
      { field: 'distension_course', weight: 4, symptomCategory: 'distension' },
      { field: 'distension_rate', weight: 3, symptomCategory: 'distension' },
      { field: 'distension_flatus', weight: 4, symptomCategory: 'distension', expectedValue: false },
      { field: 'distension_bowel_movement', weight: 3, symptomCategory: 'distension' },
      { field: 'vomiting_content', weight: 3, symptomCategory: 'vomiting' },
      { field: 'vomiting_bilious', weight: 3, symptomCategory: 'vomiting', expectedValue: true },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 5, symptomCategory: 'distension', expectedValue: true },
      { field: 'constipation_prior_habit', weight: 2, symptomCategory: 'constipation' },
      { field: 'constipation_blood', weight: 2, symptomCategory: 'constipation', expectedValue: true },
    ],
    riskFactors: [
      'age_40_60', 'previous_abdominal_surgery', 'malrotation',
      'pregnancy', 'caecal_mobility', 'distal_obstruction',
    ],
    complications: [
      'ischaemia', 'perforation', 'peritonitis', 'sepsis', 'bowel_necrosis',
    ],
    ruleInFields: [
      'pain_location_right_lower_quadrant',
      'distension_course_rapidly_progressive',
      'distension_flatus_false',
    ],
    ruleOutFields: [
      'distension_previous_similar_true',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'CRP', 'Abdominal XR', 'CT abdomen/pelvis'],
    management: { initial: ['IV fluids', 'NG tube', 'NBM', 'Analgesia'], definitive: ['Right hemicolectomy', 'Caecopexy'] },
    typicalPresentation: 'Middle-aged patient with acute right lower quadrant pain, vomiting, and abdominal distension.',
  },

  // ═══════════════════════════════════════════════════════════════
  // SMALL BOWEL OBSTRUCTION (Adhesions)
  // ═══════════════════════════════════════════════════════════════
  small_bowel_obstruction: {
    id: 'small_bowel_obstruction',
    name: 'Small Bowel Obstruction',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'vomiting_content', weight: 5, symptomCategory: 'vomiting' },
      { field: 'vomiting_bilious', weight: 5, symptomCategory: 'vomiting', expectedValue: true },
      { field: 'vomiting_frequency', weight: 3, symptomCategory: 'vomiting' },
      { field: 'pain_character', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_timing', weight: 3, symptomCategory: 'pain' },
      { field: 'distension_course', weight: 3, symptomCategory: 'distension' },
      { field: 'distension_flatus', weight: 3, symptomCategory: 'distension', expectedValue: false },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'vomiting_faeculent', weight: 5, symptomCategory: 'vomiting', expectedValue: true },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 2, symptomCategory: 'distension', expectedValue: true },
      { field: 'distension_girth_change', weight: 1, symptomCategory: 'distension' },
      { field: 'constipation_prior_habit', weight: 2, symptomCategory: 'constipation' },
      { field: 'diarrhea_consistency', weight: 3, symptomCategory: 'diarrhea', expectedValue: 'watery' },
    ],
    riskFactors: [
      'previous_abdominal_surgery', 'abdominal_hernia',
      'Crohn_disease', 'previous_radiation', 'adhesions',
      'previous_episodes', 'incisional_hernia',
    ],
    complications: [
      'ischaemia', 'perforation', 'strangulation', 'sepsis',
      'fluid_depletion', 'electrolyte_imbalance', 'AKI',
    ],
    ruleInFields: [
      'vomiting_bilious_true',
      'vomiting_content_bilious',
      'pain_character_colicky',
      'pain_timing_colicky',
    ],
    ruleOutFields: [
      'constipation_prior_habit_chronic_constipation',
      'diarrhea_consistency_watery',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'CRP', 'Lactate', 'Abdominal XR', 'CT abdomen/pelvis with oral contrast'],
    management: { initial: ['IV fluids', 'NG tube', 'NBM', 'Analgesia', 'Catheter'], definitive: ['Laparotomy + adhesiolysis', 'Bowel resection if strangulated'] },
    typicalPresentation: 'Patient with previous abdominal surgery presenting with colicky central abdominal pain, bilious vomiting, and abdominal distension.',
  },

  // ═══════════════════════════════════════════════════════════════
  // SMALL BOWEL OBSTRUCTION (Hernia)
  // ═══════════════════════════════════════════════════════════════
  sbo_hernia: {
    id: 'sbo_hernia',
    name: 'SBO (Strangulated Hernia)',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_location', weight: 3, symptomCategory: 'pain' },
      { field: 'vomiting_content', weight: 4, symptomCategory: 'vomiting' },
      { field: 'vomiting_bilious', weight: 3, symptomCategory: 'vomiting', expectedValue: true },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'distension_course', weight: 2, symptomCategory: 'distension' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension', expectedValue: true },
    ],
    riskFactors: [
      'inguinal_hernia', 'femoral_hernia', 'incisional_hernia',
      'heavy_lifting', 'chronic_cough', 'constipation',
      'previous_hernia_repair',
    ],
    complications: [
      'strangulation', 'ischaemia', 'perforation', 'sepsis', 'bowel_necrosis',
    ],
    ruleInFields: [
      'pain_location_groin',
      'vomiting_bilious_true',
    ],
    ruleOutFields: [],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'CRP', 'Lactate', 'Abdominal XR', 'CT abdomen/pelvis', 'Groin US'],
    management: { initial: ['IV fluids', 'NG tube', 'NBM', 'Analgesia', 'Manual reduction attempt'], definitive: ['Hernia repair (Mayo/mesh)', 'Bowel resection if strangulated'] },
    typicalPresentation: 'Patient with known hernia presenting with acute groin pain, nausea/vomiting, and a tender irreducible swelling.',
  },

  // ═══════════════════════════════════════════════════════════════
  // OBSTRUCTING COLORECTAL CANCER
  // ═══════════════════════════════════════════════════════════════
  obstructing_colorectal_cancer: {
    id: 'obstructing_colorectal_cancer',
    name: 'Obstructing Colorectal Carcinoma',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'constipation_prior_habit', weight: 3, symptomCategory: 'constipation' },
      { field: 'constipation_stool_caliber', weight: 4, symptomCategory: 'constipation' },
      { field: 'constipation_blood', weight: 5, symptomCategory: 'constipation', expectedValue: true },
      { field: 'constipation_duration', weight: 3, symptomCategory: 'constipation' },
      { field: 'constipation_tenesmus', weight: 3, symptomCategory: 'constipation' },
      { field: 'bleeding_color', weight: 4, symptomCategory: 'bleeding' },
      { field: 'constitutional_weight_loss', weight: 5, symptomCategory: 'constitutional', expectedValue: true },
      { field: 'constitutional_appetite_change', weight: 3, symptomCategory: 'constitutional' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'constitutional_fatigue', weight: 2, symptomCategory: 'constitutional' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 4, symptomCategory: 'distension', expectedValue: true },
      { field: 'distension_flatus', weight: 2, symptomCategory: 'distension', expectedValue: true },
      { field: 'pain_onset', weight: 2, symptomCategory: 'pain' },
      { field: 'distension_rate', weight: 2, symptomCategory: 'distension' },
    ],
    riskFactors: [
      'age_above_50', 'family_history_crc', 'smoking', 'obesity',
      'sedentary_lifestyle', 'low_fibre_diet', 'IBD_history',
      'alcohol', 'red_meat_consumption', 'diabetes',
    ],
    complications: [
      'obstruction', 'perforation', 'bleeding', 'metastasis',
      'anaemia', 'weight_loss', 'obstruction',
    ],
    ruleInFields: [
      'constipation_stool_caliber_narrow_pencil',
      'constipation_blood_true',
      'constitutional_weight_loss_significant',
      'bleeding_color_dark_red',
    ],
    ruleOutFields: [
      'distension_previous_similar_true',
      'distension_flatus_true',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'LFT', 'CRP', 'CEA', 'CT abdomen/pelvis', 'Colonoscopy + biopsy', 'PR exam'],
    management: { initial: ['IV fluids', 'NG tube', 'NBM', 'Analgesia', 'Colonic stent (bridge to surgery)'], definitive: ['Surgical resection (colectomy)', 'Chemotherapy if metastatic'] },
    typicalPresentation: 'Elderly patient with gradual onset of constipation, narrow-calibre stools, PR bleeding, and unintentional weight loss.',
  },

  // ═══════════════════════════════════════════════════════════════
  // PSEUDO-OBSTRUCTION (Ogilvie's)
  // ═══════════════════════════════════════════════════════════════
  pseudo_obstruction: {
    id: 'pseudo_obstruction',
    name: 'Pseudo-obstruction (Ogilvie\'s)',
    ddPriority: 'medium',
    supportingFindings: [
      { field: 'distension_course', weight: 3, symptomCategory: 'distension' },
      { field: 'distension_flatus', weight: 2, symptomCategory: 'distension' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'pain_timing', weight: 1, symptomCategory: 'pain' },
      { field: 'distension_girth_change', weight: 2, symptomCategory: 'distension' },
    ],
    opposingFindings: [
      { field: 'distension_visible_peristalsis', weight: 4, symptomCategory: 'distension', expectedValue: true },
      { field: 'vomiting_content', weight: 3, symptomCategory: 'vomiting' },
      { field: 'vomiting_faeculent', weight: 3, symptomCategory: 'vomiting', expectedValue: true },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
    ],
    riskFactors: [
      'critical_illness', 'recent_surgery', 'electrolyte_imbalance',
      'anticholinergic_medication', 'opioid_use', 'immobility',
      'sepsis', 'MI', 'stroke',
    ],
    complications: [
      'perforation', 'ischemia', 'abdominal_compartment_syndrome',
    ],
    ruleInFields: [
      'distension_course_slowly_progressive',
      'distension_flatus_partial',
    ],
    ruleOutFields: [
      'distension_visible_peristalsis_true',
      'vomiting_content_faeculent',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'LFT', 'CRP', 'TFT', 'Calcium', 'Magnesium', 'Abdominal XR', 'CT abdomen/pelvis'],
    management: { initial: ['IV fluids', 'NBM', 'NG tube', 'Correct electrolytes', 'Mobilisation', 'Neostigmine (IV)'], definitive: ['Colonoscopic decompression', 'Caecostomy / colectomy if refractory'] },
    typicalPresentation: 'Elderly hospitalised patient with massive abdominal distension but minimal pain, still passing some flatus.',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACUTE APPENDICITIS
  // ═══════════════════════════════════════════════════════════════
  acute_appendicitis: {
    id: 'acute_appendicitis',
    name: 'Acute Appendicitis',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_location', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_onset', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_radiation', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_course', weight: 2, symptomCategory: 'pain' },
      { field: 'vomiting_onset', weight: 2, symptomCategory: 'vomiting' },
      { field: 'vomiting_content', weight: 1, symptomCategory: 'vomiting' },
      { field: 'fever_onset', weight: 2, symptomCategory: 'fever' },
      { field: 'fever_chills', weight: 1, symptomCategory: 'fever' },
      { field: 'constipation_completeness', weight: 1, symptomCategory: 'constipation' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension', expectedValue: true },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'constipation_prior_habit', weight: 2, symptomCategory: 'constipation' },
      { field: 'vomiting_faeculent', weight: 4, symptomCategory: 'vomiting', expectedValue: true },
      { field: 'distension_flatus', weight: 2, symptomCategory: 'distension', expectedValue: false },
    ],
    riskFactors: [
      'age_10_30', 'male_sex', 'family_history',
      'low_fibre_diet', 'previous_viral_infection',
    ],
    complications: [
      'perforation', 'abscess', 'peritonitis', 'sepsis',
      'portal_pyophlebitis', 'appendiceal_mass',
    ],
    ruleInFields: [
      'pain_location_right_iliac_fossa',
      'pain_radiation_migrates_from_umbilicus',
      'pain_onset_gradual_then_worsening',
    ],
    ruleOutFields: [
      'vomiting_faeculent_true',
      'distension_previous_similar_true',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'CRP', 'Urine HCG', 'Abdominal US', 'CT abdomen/pelvis'],
    management: { initial: ['IV fluids', 'NBM', 'Analgesia', 'IV antibiotics'], definitive: ['Laparoscopic appendicectomy', 'Antibiotics alone (uncomplicated)'] },
    typicalPresentation: 'Young patient with peri-umbilical pain migrating to the right iliac fossa, with anorexia, nausea, and low-grade fever.',
  },

  // ═══════════════════════════════════════════════════════════════
  // PERFORATED PEPTIC ULCER
  // ═══════════════════════════════════════════════════════════════
  perforated_peptic_ulcer: {
    id: 'perforated_peptic_ulcer',
    name: 'Perforated Peptic Ulcer',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_onset', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_location', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_timing', weight: 2, symptomCategory: 'pain' },
      { field: 'pain_radiation', weight: 2, symptomCategory: 'pain' },
      { field: 'pain_course', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_severity', weight: 2, symptomCategory: 'pain' },
      { field: 'vomiting_content', weight: 2, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension', expectedValue: true },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'pain_aggravating', weight: 2, symptomCategory: 'pain' },
    ],
    riskFactors: [
      'NSAID_use', 'H_pylori', 'smoking', 'alcohol',
      'stress', 'previous_ulcer', 'steroid_use',
      'anticoagulant_use', 'age_above_60',
    ],
    complications: [
      'peritonitis', 'sepsis', 'shock', 'abscess', 'death',
    ],
    ruleInFields: [
      'pain_onset_sudden',
      'pain_character_stabbing',
      'pain_location_epigastric',
      'pain_course_worsening',
    ],
    ruleOutFields: [
      'distension_previous_similar_true',
      'pain_aggravating_food',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 3,
    investigations: ['FBC', 'U&E', 'CRP', 'LFT', 'Amylase', 'Erect CXR', 'CT abdomen/pelvis', 'ABG'],
    management: { initial: ['IV fluids', 'NBM', 'NG tube', 'PPI (IV)', 'IV antibiotics', 'Analgesia'], definitive: ['Laparoscopic repair (omentopexy / Graham patch)', 'Oversewing + omental patch'] },
    typicalPresentation: 'Patient with known PUD or NSAID use presenting with sudden severe epigastric pain and board-like abdominal rigidity.',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACUTE PANCREATITIS
  // ═══════════════════════════════════════════════════════════════
  acute_pancreatitis: {
    id: 'acute_pancreatitis',
    name: 'Acute Pancreatitis',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_location', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_radiation', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_onset', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_aggravating', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_severity', weight: 2, symptomCategory: 'pain' },
      { field: 'vomiting_content', weight: 2, symptomCategory: 'vomiting' },
      { field: 'vomiting_frequency', weight: 2, symptomCategory: 'vomiting' },
      { field: 'fever_onset', weight: 1, symptomCategory: 'fever' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension', expectedValue: true },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'distension_visible_peristalsis', weight: 2, symptomCategory: 'distension', expectedValue: true },
    ],
    riskFactors: [
      'gallstones', 'alcohol', 'hypertriglyceridemia',
      'hypercalcemia', 'ERCP', 'trauma', 'medications',
      'family_history', 'smoking', 'obesity',
    ],
    complications: [
      'necrosis', 'abscess', 'pseudocyst', 'sepsis',
      'ARDS', 'AKI', 'DIC', 'multi_organ_failure',
    ],
    ruleInFields: [
      'pain_radiation_to_back',
      'pain_location_epigastric',
      'pain_aggravating_eating',
      'pain_character_boring',
    ],
    ruleOutFields: [
      'distension_previous_similar_true',
      'distension_visible_peristalsis_true',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'LFT', 'CRP', 'Amylase/Lipase', 'Calcium', 'Triglycerides', 'Abdominal US', 'CT abdomen/pelvis with contrast', 'ABG', 'ECG'],
    management: { initial: ['Aggressive IV fluids', 'NBM', 'Analgesia', 'NG tube', 'HDU/ICU monitoring', 'Oxygen'], definitive: ['ERCP (if gallstone)', 'Cholecystectomy', 'Necrosectomy (if necrotising)'] },
    typicalPresentation: 'Patient with gallstones or heavy alcohol use presenting with acute severe epigastric pain radiating to the back, with vomiting.',
  },

  // ═══════════════════════════════════════════════════════════════
  // MESENTERIC ISCHAEMIA
  // ═══════════════════════════════════════════════════════════════
  mesenteric_ischaemia: {
    id: 'mesenteric_ischaemia',
    name: 'Mesenteric Ischaemia',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_onset', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_severity', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_location', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_timing', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'vomiting_content', weight: 2, symptomCategory: 'vomiting' },
      { field: 'distension_course', weight: 2, symptomCategory: 'distension' },
      { field: 'vomiting_ability_to_tolerate', weight: 2, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 4, symptomCategory: 'distension', expectedValue: true },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'fever_pattern', weight: 2, symptomCategory: 'fever' },
    ],
    riskFactors: [
      'age_above_60', 'atrial_fibrillation', 'atherosclerosis',
      'heart_failure', 'hypotension', 'recent_MI',
      'hypercoagulable_state', 'valvular_heart_disease',
      'cardiac_emboli', 'vasculitis',
    ],
    complications: [
      'bowel_infarction', 'perforation', 'peritonitis',
      'sepsis', 'shock', 'death', 'short_bowel_syndrome',
    ],
    ruleInFields: [
      'pain_onset_sudden',
      'pain_severity_severe_above_7',
      'pain_character_out_of_proportion',
      'pain_timing_constant',
    ],
    ruleOutFields: [
      'distension_previous_similar_true',
      'pain_character_colicky',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 3,
    investigations: ['FBC', 'U&E', 'CRP', 'Lactate', 'D-dimer', 'ABG', 'CT angiography (mesenteric)', 'Echocardiogram', 'ECG'],
    management: { initial: ['Aggressive IV fluids', 'NBM', 'NG tube', 'Broad-spectrum IV antibiotics', 'Analgesia', 'Oxygen', 'Catheter'], definitive: ['Emergency laparotomy + embolectomy/bypass/resection', 'Anticoagulation', 'ICU'] },
    typicalPresentation: 'Elderly patient with atrial fibrillation presenting with sudden severe abdominal pain out of proportion to examination findings.',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACUTE GASTROENTERITIS
  // ═══════════════════════════════════════════════════════════════
  gastroenteritis: {
    id: 'gastroenteritis',
    name: 'Acute Gastroenteritis',
    ddPriority: 'medium',
    supportingFindings: [
      { field: 'vomiting_onset', weight: 3, symptomCategory: 'vomiting' },
      { field: 'vomiting_content', weight: 2, symptomCategory: 'vomiting' },
      { field: 'diarrhea_onset', weight: 5, symptomCategory: 'diarrhea', expectedValue: 'acute' },
      { field: 'diarrhea_consistency', weight: 4, symptomCategory: 'diarrhea', expectedValue: 'watery' },
      { field: 'diarrhea_frequency', weight: 3, symptomCategory: 'diarrhea' },
      { field: 'fever_onset', weight: 2, symptomCategory: 'fever' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'vomiting_frequency', weight: 2, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'constipation_completeness', weight: 5, symptomCategory: 'constipation', expectedValue: 'complete_no_stool' },
      { field: 'distension_flatus', weight: 3, symptomCategory: 'distension', expectedValue: false },
      { field: 'distension_previous_similar', weight: 2, symptomCategory: 'distension' },
      { field: 'constipation_prior_habit', weight: 2, symptomCategory: 'constipation' },
    ],
    riskFactors: [
      'contact_with_similar_illness', 'recent_travel',
      'contaminated_food', 'poor_hygiene', 'recent_antibiotics',
      'immunosuppression', 'daycare_attendance',
    ],
    complications: [
      'dehydration', 'electrolyte_imbalance', 'AKI',
      'hypovolemic_shock',
    ],
    ruleInFields: [
      'diarrhea_onset_acute',
      'diarrhea_consistency_watery',
      'vomiting_onset_before_diarrhea',
    ],
    ruleOutFields: [
      'constipation_completeness_complete_no_stool',
      'distension_flatus_false',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'CRP', 'Stool MC&S', 'Stool antigen/PCR', 'Blood cultures (if febrile)'],
    management: { initial: ['Oral/IV fluids (rehydration)', 'Antiemetics', 'Antidiarrhoeals (cautious)', 'Analgesia'], definitive: ['Supportive care', 'Antibiotics (if bacterial/severe)'] },
    typicalPresentation: 'Patient with acute onset watery diarrhea, vomiting, and crampy abdominal pain, often with known contacts or recent travel.',
  },

  // ═══════════════════════════════════════════════════════════════
  // SIMPLE CONSTIPATION
  // ═══════════════════════════════════════════════════════════════
  simple_constipation: {
    id: 'simple_constipation',
    name: 'Simple Constipation',
    ddPriority: 'low',
    supportingFindings: [
      { field: 'constipation_duration', weight: 3, symptomCategory: 'constipation' },
      { field: 'constipation_prior_habit', weight: 4, symptomCategory: 'constipation' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension' },
      { field: 'constipation_laxative_use', weight: 3, symptomCategory: 'constipation' },
    ],
    opposingFindings: [
      { field: 'vomiting_content', weight: 4, symptomCategory: 'vomiting' },
      { field: 'distension_course', weight: 3, symptomCategory: 'distension' },
      { field: 'distension_rate', weight: 3, symptomCategory: 'distension' },
      { field: 'distension_flatus', weight: 3, symptomCategory: 'distension' },
      { field: 'pain_severity', weight: 2, symptomCategory: 'pain' },
    ],
    riskFactors: [
      'low_fibre_diet', 'low_fluid_intake', 'sedentary_lifestyle',
      'medications_opioids', 'medications_anticholinergics',
      'medications_antidepressants', 'ignoring_urge', 'travel',
    ],
    complications: [
      'faecal_impaction', 'haemorrhoids', 'anal_fissure',
    ],
    ruleInFields: [
      'constipation_prior_habit_chronic_constipation',
      'distension_previous_similar_true',
    ],
    ruleOutFields: [
      'vomiting_content_bilious',
      'distension_course_rapidly_progressive',
      'pain_severity_above_7',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'Abdominal XR', 'Digital rectal exam'],
    management: { initial: ['Dietary advice', 'Increase fluid intake', 'Laxatives (bulk-forming or osmotic)'], definitive: ['Referral to dietitian', 'Stool softeners', 'Biofeedback therapy if dyssynergic'] },
    typicalPresentation: 'Patient with infrequent, hard, or difficult-to-pass stools for weeks to months, often with abdominal bloating and straining.',
  },

  // ═══════════════════════════════════════════════════════════════
  // IRRITABLE BOWEL SYNDROME
  // ═══════════════════════════════════════════════════════════════
  irritable_bowel_syndrome: {
    id: 'irritable_bowel_syndrome',
    name: 'Irritable Bowel Syndrome',
    ddPriority: 'low',
    supportingFindings: [
      { field: 'pain_timing', weight: 2, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'constipation_prior_habit', weight: 2, symptomCategory: 'constipation' },
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension' },
      { field: 'diarrhea_consistency', weight: 2, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_night_waking', weight: 1, symptomCategory: 'diarrhea' },
      { field: 'constipation_mucus', weight: 2, symptomCategory: 'constipation' },
    ],
    opposingFindings: [
      { field: 'vomiting_content', weight: 3, symptomCategory: 'vomiting' },
      { field: 'fever_onset', weight: 3, symptomCategory: 'fever' },
      { field: 'constipation_blood', weight: 3, symptomCategory: 'constipation' },
      { field: 'constitutional_weight_loss', weight: 4, symptomCategory: 'constitutional' },
    ],
    riskFactors: [
      'stress', 'anxiety', 'depression', 'family_history_IBS',
      'food_intolerance', 'post_infectious', 'female_sex',
    ],
    complications: [
      'reduced_quality_of_life', 'anxiety', 'depression',
    ],
    ruleInFields: [
      'pain_relieving_defecation',
      'distension_previous_similar_true',
      'constipation_prior_habit_irregular',
    ],
    ruleOutFields: [
      'vomiting_content_bilious',
      'fever_onset_true',
      'constipation_blood_true',
      'constitutional_weight_loss_significant',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'U&E', 'CRP', 'Stool MC&S', 'Hydrogen breath test', 'Colonoscopy (if needed)'],
    management: { initial: ['FODMAP diet trial', 'Stress reduction', 'Probiotics', 'Antispasmodics (e.g. mebeverine)'], definitive: ['Cognitive behavioural therapy', 'Low FODMAP dietitian referral', 'Tricyclic antidepressants (low dose)'] },
    typicalPresentation: 'Patient with chronic recurrent abdominal pain associated with altered bowel habits (diarrhoea and/or constipation), bloating, and straining, with symptoms relieved by defecation.',
  },

  // ═══════════════════════════════════════════════════════════════
  // DIVERTICULITIS
  // ═══════════════════════════════════════════════════════════════
  diverticulitis: {
    id: 'diverticulitis',
    name: 'Acute Diverticulitis',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_location', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_onset', weight: 2, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'fever_onset', weight: 3, symptomCategory: 'fever' },
      { field: 'fever_chills', weight: 2, symptomCategory: 'fever' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'constipation_blood', weight: 2, symptomCategory: 'constipation' },
      { field: 'vomiting_onset', weight: 1, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'distension_visible_peristalsis', weight: 3, symptomCategory: 'distension' },
      { field: 'vomiting_faeculent', weight: 3, symptomCategory: 'vomiting' },
    ],
    riskFactors: [
      'age_above_50', 'low_fibre_diet', 'obesity',
      'smoking', 'NSAID_use', 'sedentary_lifestyle',
      'previous_diverticulitis',
    ],
    complications: [
      'abscess', 'perforation', 'peritonitis', 'sepsis',
      'fistula', 'stricture', 'obstruction',
    ],
    ruleInFields: [
      'pain_location_left_lower_quadrant',
      'fever_chills_true',
      'pain_character_constant',
    ],
    ruleOutFields: [
      'distension_visible_peristalsis_true',
      'vomiting_faeculent_true',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'CRP', 'U&E'],
    management: { initial: ['Supportive care'], definitive: ['Referral'] },
    typicalPresentation: 'Please refer to clinical guidelines for further details.'
  },

  // ═══════════════════════════════════════════════════════════════
  // INFLAMMATORY BOWEL DISEASE (Crohn's / UC)
  // ═══════════════════════════════════════════════════════════════
  inflammatory_bowel_disease: {
    id: 'inflammatory_bowel_disease',
    name: 'Inflammatory Bowel Disease',
    ddPriority: 'medium',
    supportingFindings: [
      { field: 'diarrhea_onset', weight: 2, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_duration', weight: 3, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_blood', weight: 4, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_mucus', weight: 3, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_urgency', weight: 2, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_night_waking', weight: 3, symptomCategory: 'diarrhea' },
      { field: 'diarrhea_abdominal_pain', weight: 2, symptomCategory: 'diarrhea' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'constitutional_weight_loss', weight: 3, symptomCategory: 'constitutional' },
      { field: 'constitutional_fatigue', weight: 2, symptomCategory: 'constitutional' },
      { field: 'fever_pattern', weight: 2, symptomCategory: 'fever' },
      { field: 'constitutional_appetite_change', weight: 2, symptomCategory: 'constitutional' },
    ],
    opposingFindings: [
      { field: 'constipation_completeness', weight: 3, symptomCategory: 'constipation' },
      { field: 'distension_flatus', weight: 2, symptomCategory: 'distension' },
      { field: 'vomiting_faeculent', weight: 3, symptomCategory: 'vomiting' },
    ],
    riskFactors: [
      'family_history_IBD', 'smoking_Crohn', 'non_smoking_UC',
      'Ashkenazi_Jewish', 'previous_appendicectomy',
      'oral_contraceptive', 'NSAID_use',
    ],
    complications: [
      'stricture', 'fistula', 'abscess', 'perforation',
      'toxic_megacolon', 'colorectal_cancer', 'malnutrition',
    ],
    ruleInFields: [
      'diarrhea_duration_more_than_4_weeks',
      'diarrhea_blood_true',
      'diarrhea_night_waking_true',
      'diarrhea_mucus_true',
    ],
    ruleOutFields: [
      'constipation_completeness_complete_no_stool',
      'vomiting_faeculent_true',
    ],
    minSupportingForRuleIn: 3,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'CRP', 'U&E'],
    management: { initial: ['Supportive care'], definitive: ['Referral'] },
    typicalPresentation: 'Please refer to clinical guidelines for further details.'
  },

  // ═══════════════════════════════════════════════════════════════
  // URINARY TRACT INFECTION
  // ═══════════════════════════════════════════════════════════════
  urinary_tract_infection: {
    id: 'urinary_tract_infection',
    name: 'Urinary Tract Infection',
    ddPriority: 'medium',
    supportingFindings: [
      { field: 'urinary_dysuria', weight: 5, symptomCategory: 'urinary' },
      { field: 'urinary_frequency', weight: 4, symptomCategory: 'urinary' },
      { field: 'urinary_type', weight: 4, symptomCategory: 'urinary' },
      { field: 'urinary_hematuria', weight: 3, symptomCategory: 'urinary' },
      { field: 'fever_onset', weight: 2, symptomCategory: 'fever' },
      { field: 'fever_chills', weight: 2, symptomCategory: 'fever' },
      { field: 'urinary_flank_pain', weight: 4, symptomCategory: 'urinary' },
      { field: 'urinary_retention', weight: 1, symptomCategory: 'urinary' },
    ],
    opposingFindings: [
      { field: 'distension_flatus', weight: 2, symptomCategory: 'distension' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
      { field: 'vomiting_faeculent', weight: 3, symptomCategory: 'vomiting' },
    ],
    riskFactors: [
      'female_sex', 'sexual_activity', 'catheter',
      'diabetes', 'pregnancy', 'previous_UTI',
      'menopause', 'structural_abnormality',
    ],
    complications: [
      'pyelonephritis', 'renal_abscess', 'sepsis',
      'AKI', 'recurrent_infections',
    ],
    ruleInFields: [
      'urinary_dysuria_true',
      'urinary_frequency_increased',
      'urinary_type_dysuria',
    ],
    ruleOutFields: [],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'CRP', 'U&E'],
    management: { initial: ['Supportive care'], definitive: ['Referral'] },
    typicalPresentation: 'Please refer to clinical guidelines for further details.'
  },

  // ═══════════════════════════════════════════════════════════════
  // GYNAECOLOGICAL — Ovarian Cyst Torsion
  // ═══════════════════════════════════════════════════════════════
  ovarian_cyst_torsion: {
    id: 'ovarian_cyst_torsion',
    name: 'Ovarian Cyst Torsion',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_onset', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_location', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_severity', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 3, symptomCategory: 'pain' },
      { field: 'vomiting_onset', weight: 3, symptomCategory: 'vomiting' },
      { field: 'vomiting_content', weight: 1, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'distension_previous_similar', weight: 3, symptomCategory: 'distension' },
      { field: 'fever_pattern', weight: 2, symptomCategory: 'fever' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
    ],
    riskFactors: [
      'female_sex', 'reproductive_age', 'known_ovarian_cyst',
      'pregnancy', 'ovarian_hyperstimulation',
      'previous_torsion', 'large_cyst',
    ],
    complications: [
      'ovarian_necrosis', 'peritonitis', 'infertility',
    ],
    ruleInFields: [
      'pain_onset_sudden',
      'pain_location_lower_abdomen_ unilateral',
      'pain_severity_severe_above_7',
    ],
    ruleOutFields: [
      'distension_previous_similar_true',
      'fever_pattern_continuous',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 2,
    investigations: ['FBC', 'CRP', 'U&E'],
    management: { initial: ['Supportive care'], definitive: ['Referral'] },
    typicalPresentation: 'Please refer to clinical guidelines for further details.'
  },

  // ═══════════════════════════════════════════════════════════════
  // GYNAECOLOGICAL — Pelvic Inflammatory Disease
  // ═══════════════════════════════════════════════════════════════
  pelvic_inflammatory_disease: {
    id: 'pelvic_inflammatory_disease',
    name: 'Pelvic Inflammatory Disease',
    ddPriority: 'medium',
    supportingFindings: [
      { field: 'pain_location', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_onset', weight: 2, symptomCategory: 'pain' },
      { field: 'fever_onset', weight: 3, symptomCategory: 'fever' },
      { field: 'fever_chills', weight: 2, symptomCategory: 'fever' },
      { field: 'urinary_dysuria', weight: 2, symptomCategory: 'urinary' },
      { field: 'vomiting_onset', weight: 1, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'distension_flatus', weight: 2, symptomCategory: 'distension' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
    ],
    riskFactors: [
      'female_sex', 'reproductive_age', 'multiple_sexual_partners',
      'IUD', 'previous_STI', 'douching', 'young_age',
    ],
    complications: [
      'tubo_ovarian_abscess', 'peritonitis', 'sepsis',
      'infertility', 'ectopic_pregnancy_risk', 'chronic_pelvic_pain',
    ],
    ruleInFields: [
      'pain_location_lower_abdomen_bilateral',
      'fever_chills_true',
      'urinary_dysuria_true',
    ],
    ruleOutFields: [],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 3,
    investigations: ['FBC', 'CRP', 'U&E'],
    management: { initial: ['Supportive care'], definitive: ['Referral'] },
    typicalPresentation: 'Please refer to clinical guidelines for further details.'
  },

  // ═══════════════════════════════════════════════════════════════
  // ECTOPIC PREGNANCY
  // ═══════════════════════════════════════════════════════════════
  ectopic_pregnancy: {
    id: 'ectopic_pregnancy',
    name: 'Ectopic Pregnancy',
    ddPriority: 'high',
    supportingFindings: [
      { field: 'pain_onset', weight: 5, symptomCategory: 'pain' },
      { field: 'pain_location', weight: 4, symptomCategory: 'pain' },
      { field: 'pain_severity', weight: 3, symptomCategory: 'pain' },
      { field: 'pain_character', weight: 2, symptomCategory: 'pain' },
      { field: 'bleeding_volume', weight: 3, symptomCategory: 'bleeding' },
      { field: 'bleeding_color', weight: 2, symptomCategory: 'bleeding' },
      { field: 'vomiting_onset', weight: 1, symptomCategory: 'vomiting' },
    ],
    opposingFindings: [
      { field: 'fever_pattern', weight: 2, symptomCategory: 'fever' },
      { field: 'constipation_completeness', weight: 2, symptomCategory: 'constipation' },
    ],
    riskFactors: [
      'female_sex', 'reproductive_age', 'previous_ectopic',
      'PID', 'IUD', 'tubal_surgery', 'smoking',
      'assisted_reproduction', 'age_above_35',
    ],
    complications: [
      'rupture', 'haemorrhage', 'hypovolemic_shock',
      'infertility', 'death',
    ],
    ruleInFields: [
      'pain_onset_sudden',
      'pain_location_lower_abdomen_unilateral',
      'bleeding_volume_spots_or_lighter',
    ],
    ruleOutFields: [
      'fever_pattern_continuous',
    ],
    minSupportingForRuleIn: 2,
    minOpposingForExclusion: 3,
    investigations: ['FBC', 'CRP', 'U&E'],
    management: { initial: ['Supportive care'], definitive: ['Referral'] },
    typicalPresentation: 'Please refer to clinical guidelines for further details.'
  },
};

// ── Coverage Engine ────────────────────────────────────────────
export function buildCoverage(
  symptoms: SymptomInstance[],
  activeDiagnosisIds: string[],
): DifferentialCoverage[] {
  const coverage: DifferentialCoverage[] = [];

  for (const dxId of activeDiagnosisIds) {
    const knowledge = CORE_DIFFERENTIAL_KNOWLEDGE[dxId];
    if (!knowledge) continue;

    const supportingCollected: string[] = [];
    const opposingCollected: string[] = [];
    const riskFactorsCollected: string[] = [];
    const complicationsScreened: string[] = [];

    for (const symptom of symptoms) {
      for (const [fieldKey, fieldValue] of Object.entries(symptom.coreData)) {
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue;

        for (const sf of knowledge.supportingFindings) {
          if (!sf.symptomCategory || sf.symptomCategory === symptom.category) {
            if (fieldKey === sf.field && fieldValue !== false) {
              supportingCollected.push(`${symptom.category}.${fieldKey}=${fieldValue}`);
            }
          }
        }
        for (const of_ of knowledge.opposingFindings) {
          if (!of_.symptomCategory || of_.symptomCategory === symptom.category) {
            if (fieldKey === of_.field && fieldValue !== false) {
              opposingCollected.push(`${symptom.category}.${fieldKey}=${fieldValue}`);
            }
          }
        }
      }
    }

    const totalRequired = knowledge.supportingFindings.length + knowledge.opposingFindings.length;
    const totalCollected = supportingCollected.length + opposingCollected.length;
    const coveragePercent = totalRequired > 0 ? Math.round((totalCollected / totalRequired) * 100) : 0;

    coverage.push({
      diagnosisId: dxId,
      name: knowledge.name,
      requiredSupporting: knowledge.supportingFindings.map(f => f.field),
      requiredOpposing: knowledge.opposingFindings.map(f => f.field),
      supportingCollected,
      opposingCollected,
      riskFactorsCollected,
      complicationsScreened,
      adequateForRuleIn: supportingCollected.length >= knowledge.minSupportingForRuleIn,
      adequatelyExcluded: opposingCollected.length >= knowledge.minOpposingForExclusion,
      coveragePercent,
    });
  }

  return coverage;
}

// ── Get pending question fields for a diagnosis ────────────────
export function getPendingQuestionFields(
  coverage: DifferentialCoverage,
  symptoms: SymptomInstance[],
): string[] {
  const pending: string[] = [];

  for (const reqField of coverage.requiredSupporting) {
    const collected = coverage.supportingCollected.some(c => c.startsWith(reqField));
    if (!collected) pending.push(reqField);
  }

  for (const reqField of coverage.requiredOpposing) {
    const collected = coverage.opposingCollected.some(c => c.startsWith(reqField));
    if (!collected) pending.push(reqField);
  }

  return pending;
}

// ── Generate initial differential list from symptoms ──────────
export function generateInitialDifferentials(symptoms: SymptomInstance[]): DifferentialDiagnosis[] {
  const activeDx: DifferentialDiagnosis[] = [];
  const dxScores: Record<string, number> = {};

  const allKnowledge = Object.values(CORE_DIFFERENTIAL_KNOWLEDGE);

  for (const knowledge of allKnowledge) {
    let score = 0;
    const maxScore = knowledge.supportingFindings.reduce((sum, f) => sum + f.weight, 0);

    for (const symptom of symptoms) {
      for (const [fieldKey, fieldValue] of Object.entries(symptom.coreData)) {
        if (fieldValue === undefined || fieldValue === null || fieldValue === '' || fieldValue === false) continue;

        const match = knowledge.supportingFindings.find(sf =>
          fieldKey === sf.field && (!sf.symptomCategory || sf.symptomCategory === symptom.category)
        );
        if (match) score += match.weight;
      }
    }

    dxScores[knowledge.id] = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  const sorted = Object.entries(dxScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  for (const [id, prob] of sorted) {
    const knowledge = CORE_DIFFERENTIAL_KNOWLEDGE[id];
    if (!knowledge) continue;

    const supporting: string[] = [];
    const opposing: string[] = [];
    const pending: string[] = [];

    for (const symptom of symptoms) {
      for (const [key, val] of Object.entries(symptom.coreData)) {
        if (val === undefined || val === null || val === '' || val === false) continue;
        const supportMatch = knowledge.supportingFindings.find(sf =>
          key === sf.field && (!sf.symptomCategory || sf.symptomCategory === symptom.category)
        );
        if (supportMatch) supporting.push(`${key}=${val}`);

        const opposeMatch = knowledge.opposingFindings.find(of_ =>
          key === of_.field && (!of_.symptomCategory || of_.symptomCategory === symptom.category)
        );
        if (opposeMatch) opposing.push(`${key}=${val}`);
      }
    }

    for (const rf of knowledge.ruleInFields) {
      const found = symptoms.some(s => {
        const parts = rf.split('_');
        const val = parts[parts.length - 1];
        return Object.values(s.coreData).some(v => String(v).toLowerCase() === val.toLowerCase());
      });
      if (!found) pending.push(rf);
    }

    activeDx.push({
      id: knowledge.id,
      name: knowledge.name,
      probability: prob,
      supporting,
      opposing,
      pendingQuestions: pending,
      complications: knowledge.complications,
      riskFactors: knowledge.riskFactors,
      isActive: prob > 10,
      isExcluded: opposing.length >= knowledge.minOpposingForExclusion,
      exclusionReason: opposing.length >= knowledge.minOpposingForExclusion ? 'Sufficient opposing evidence collected' : undefined,
      ruleInThreshold: knowledge.minSupportingForRuleIn,
      ruleOutThreshold: knowledge.minOpposingForExclusion,
      investigations: knowledge.investigations,
      management: knowledge.management,
      typicalPresentation: knowledge.typicalPresentation,
    });
  }

  return activeDx;
}

// ── Rule H17: Never ask questions unrelated to active DDx ──────
export function isQuestionRelevantToActiveDifferentials(
  field: ExplorationField,
  activeDifferentials: DifferentialDiagnosis[],
): boolean {
  if (!field.ddRelevance || field.ddRelevance.length === 0) {
    if (field.safetyRelevance && field.safetyRelevance.length > 0) return true;
    if (field.mandatory) return true;
    return false;
  }

  for (const dx of activeDifferentials) {
    if (!dx.isActive || dx.isExcluded) continue;
    const matchesDD = field.ddRelevance.some(d => dx.id.includes(d) || dx.name.toLowerCase().includes(d));
    if (matchesDD) return true;
  }

  if (field.safetyRelevance && field.safetyRelevance.length > 0) return true;
  return false;
}

// ── Get total number of diagnoses in knowledge base (scalability) ──
export function getKnowledgeBaseSize(): number {
  return Object.keys(CORE_DIFFERENTIAL_KNOWLEDGE).length;
}

// ── Get all diagnosis IDs ──────────────────────────────────────
export function getAllDiagnosisIds(): string[] {
  return Object.keys(CORE_DIFFERENTIAL_KNOWLEDGE);
}



