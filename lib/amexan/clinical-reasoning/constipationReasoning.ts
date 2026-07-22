// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constipation Clinical Reasoning Rules
// Complete pathway-based classification (slow transit vs outlet obstruction vs
// functional vs drug-induced vs mechanical), drug history integration,
// biodata filtering, and pattern recognition.
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

// ── Core type definitions ──────────────────────────────────────────────

type ConstipationPathway = 'slow_transit' | 'outlet_obstruction' | 'mixed' | 'functional_ibs_c' | 'drug_induced' | 'endocrine' | 'neurological' | 'mechanical_obstruction' | 'pelvic_floor' | 'psychogenic' | 'paediatric_functional';
type ConstipationDuration = 'acute_days' | 'acute_weeks' | 'chronic_months' | 'chronic_years' | 'lifelong' | 'variable';
type StoolType = 'hard_pellets' | 'large_painful' | 'ribbon_like' | 'normal_with_straining' | 'overflow_diarrhoea';

interface ConstipationDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  pathway: ConstipationPathway;
  duration: ConstipationDuration;
  typicalStool: StoolType[];
  frequency: 'mild_3_5_per_week' | 'moderate_1_2_per_week' | 'severe_less_than_1_per_week' | 'variable';
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  painPattern: 'yes_relieved_by_defecation' | 'yes_not_relieved' | 'no';
  straining: 'yes' | 'no' | 'variable';
  incompleteEvacuation: 'yes' | 'no' | 'sometimes';
  manualManeuvers: 'yes' | 'no' | 'variable' | 'sometimes';
  rectalBleeding: 'yes' | 'no' | 'sometimes' | 'sometimes_fissure' | 'sometimes_hemorrhoids';
  bloating: 'yes' | 'no' | 'sometimes';
  mechanism: string;
  typicalDescription: string;
}

interface ConstipationPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  pathway: ConstipationPathway;
  priorityBoost: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Complete Constipation Differential Diagnosis by Pathway
// ═══════════════════════════════════════════════════════════════════════════════

const CONSTIPATION_DDX: ConstipationDisease[] = [
  // ── Functional / IBS-C (most common) ─────────────────────────────────
  {
    diseaseId: 'functional_constipation', diseaseName: 'Functional Constipation', icdCode: 'K59.0',
    pathway: 'functional_ibs_c', duration: 'chronic_years',
    typicalStool: ['hard_pellets', 'normal_with_straining'],
    frequency: 'mild_3_5_per_week',
    ageRange: [1, 90], agePeak: [20, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.15,
    riskFactors: ['low_fiber_diet', 'low_fluid_intake', 'sedentary_lifestyle', 'ignoring_urge'],
    redFlags: [],
    associatedSymptoms: ['bloating', 'abdominal_discomfort', 'flatulence'],
    painPattern: 'yes_relieved_by_defecation', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'sometimes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Idiopathic — likely combination of slow transit and disordered defecation without meeting IBS criteria.',
    typicalDescription: 'Chronic constipation with hard stools and straining. No red flags. Responds to fiber and lifestyle modification.',
  },
  {
    diseaseId: 'ibs_constipation', diseaseName: 'Irritable Bowel Syndrome — Constipation Predominant (IBS-C)', icdCode: 'K58.1',
    pathway: 'functional_ibs_c', duration: 'chronic_years',
    typicalStool: ['hard_pellets', 'normal_with_straining'],
    frequency: 'mild_3_5_per_week',
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.08,
    riskFactors: ['stress', 'anxiety', 'depression', 'family_history_ibs', 'food_intolerance'],
    redFlags: [],
    associatedSymptoms: ['abdominal_pain_relieved_by_defecation', 'bloating', 'mucus', 'urgency'],
    painPattern: 'yes_relieved_by_defecation', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Visceral hypersensitivity + altered gut motility + brain-gut axis dysregulation.',
    typicalDescription: 'Chronic abdominal pain relieved by defecation with altered stool frequency/form. Bloating and mucus common. Rome IV criteria apply.',
  },

  // ── Drug-Induced ──────────────────────────────────────────────────────
  {
    diseaseId: 'opioid_induced_constipation', diseaseName: 'Opioid-Induced Constipation', icdCode: 'F11.2',
    pathway: 'drug_induced', duration: 'variable',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'moderate_1_2_per_week',
    ageRange: [10, 90], agePeak: [30, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['opioid_use', 'codeine', 'morphine', 'oxycodone', 'tramadol', 'fentanyl'],
    redFlags: ['obstipation', 'vomiting'],
    associatedSymptoms: ['nausea', 'abdominal_bloating', 'anorexia'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Opioids bind μ-receptors in the GI tract → decreased peristalsis, increased sphincter tone, and decreased secretions.',
    typicalDescription: 'Constipation starting or worsening after opioid use. Often severe and refractory to standard laxatives. Needs peripherally-acting antagonist.',
  },
  {
    diseaseId: 'drug_induced_constipation_other', diseaseName: 'Drug-Induced Constipation (Non-Opioid)', icdCode: 'K59.0',
    pathway: 'drug_induced', duration: 'variable',
    typicalStool: ['hard_pellets', 'normal_with_straining'],
    frequency: 'mild_3_5_per_week',
    ageRange: [1, 90], agePeak: [20, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.03,
    riskFactors: ['anticholinergics', 'calcium_channel_blockers', 'iron_supplements', 'antidepressants', 'antipsychotics', 'diuretics', 'antacids_calcium', 'antihistamines'],
    redFlags: [],
    associatedSymptoms: ['dry_mouth', 'bloating'],
    painPattern: 'no', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'sometimes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Multiple mechanisms: anticholinergic slows motility, CCBs relax smooth muscle, iron is constipating, calcium-based antacids bind stool.',
    typicalDescription: 'Chronic constipation associated with medication use. Improves with dose reduction or switching to less constipating alternatives.',
  },

  // ── Slow Transit ──────────────────────────────────────────────────────
  {
    diseaseId: 'slow_transit_constipation', diseaseName: 'Slow Transit Constipation', icdCode: 'K59.0',
    pathway: 'slow_transit', duration: 'chronic_years',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'severe_less_than_1_per_week',
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    riskFactors: ['female_sex', 'hysterectomy', 'pelvic_surgery'],
    redFlags: ['obstipation', 'vomiting'],
    associatedSymptoms: ['bloating', 'abdominal_distension', 'anorexia'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'sometimes', manualManeuvers: 'sometimes', rectalBleeding: 'no',
    mechanism: 'Decreased colonic motility with delayed transit through the colon. Often severe. May require subtotal colectomy in refractory cases.',
    typicalDescription: 'Infrequent bowel movements (less than once per week) with severe bloating and distension. Poor response to fiber. Radio-opaque marker study shows delayed colonic transit.',
  },

  // ── Outlet Obstruction / Pelvic Floor ─────────────────────────────────
  {
    diseaseId: 'dyssynergic_defecation', diseaseName: 'Dyssynergic Defecation (Pelvic Floor Dyssynergia)', icdCode: 'K59.4',
    pathway: 'pelvic_floor', duration: 'chronic_years',
    typicalStool: ['normal_with_straining', 'large_painful'],
    frequency: 'mild_3_5_per_week',
    ageRange: [15, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['childbirth', 'pelvic_surgery', 'chronic_straining', 'sexual_abuse'],
    redFlags: [],
    associatedSymptoms: ['incomplete_evacuation', 'excessive_straining', 'digital_evacuation', 'perineal_pressure'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'yes', rectalBleeding: 'sometimes_hemorrhoids',
    mechanism: 'Paradoxical contraction of the pelvic floor muscles during attempted defecation instead of relaxation. Anorectal manometry shows dyssynergia.',
    typicalDescription: 'Feeling of incomplete evacuation despite normal stool frequency. Needs to strain excessively. May use digital maneuvers. Sensation of blockage.',
  },
  {
    diseaseId: 'rectocele', diseaseName: 'Rectocele', icdCode: 'N81.6',
    pathway: 'pelvic_floor', duration: 'chronic_years',
    typicalStool: ['normal_with_straining', 'large_painful'],
    frequency: 'mild_3_5_per_week',
    ageRange: [25, 80], agePeak: [40, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    riskFactors: ['childbirth', 'vaginal_delivery', 'chronic_constipation', 'pelvic_organ_prolapse'],
    redFlags: [],
    associatedSymptoms: ['splinting_vaginal', 'pelvic_pressure', 'incomplete_evacuation', 'bulge'],
    painPattern: 'no', bloating: 'no', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'yes', rectalBleeding: 'no',
    mechanism: 'Weakened rectovaginal septum allows the rectum to bulge into the vagina, trapping stool during attempted defecation.',
    typicalDescription: 'Feeling of a bulge in the vagina and need to splint vaginally or perineally to pass stool. Pelvic pressure and incomplete evacuation.',
  },

  // ── Mechanical Obstruction ────────────────────────────────────────────
  {
    diseaseId: 'colorectal_cancer_constipation', diseaseName: 'Colorectal Cancer (Obstructing)', icdCode: 'C18-C20',
    pathway: 'mechanical_obstruction', duration: 'chronic_months',
    typicalStool: ['ribbon_like', 'hard_pellets'],
    frequency: 'mild_3_5_per_week',
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'family_history_colorectal_cancer', 'ibd', 'smoking', 'obesity', 'low_fiber_diet'],
    redFlags: ['hematochezia', 'weight_loss', 'obstruction', 'anemia'],
    associatedSymptoms: ['weight_loss', 'hematochezia', 'change_bowel_habit', 'abdominal_pain', 'tenesmus'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'variable',
    incompleteEvacuation: 'yes', manualManeuvers: 'no', rectalBleeding: 'yes',
    mechanism: 'Colonic lumen progressively narrowed by tumor, leading to altered stool caliber, obstruction, and eventually complete blockage.',
    typicalDescription: 'Change in bowel habit over weeks to months with narrowing of stool caliber. May have PR bleeding, weight loss, and left iliac fossa discomfort.',
  },
  {
    diseaseId: 'sigmoid_volvulus', diseaseName: 'Sigmoid Volvulus', icdCode: 'K56.2',
    pathway: 'mechanical_obstruction', duration: 'acute_days',
    typicalStool: ['hard_pellets'],
    frequency: 'severe_less_than_1_per_week',
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['chronic_constipation', 'high_fiber_diet', 'megacolon', 'neurological_disease', 'institutionalized'],
    redFlags: ['obstipation', 'abdominal_distension_massive', 'peritonism', 'vomiting'],
    associatedSymptoms: ['massive_abdominal_distension', 'obstipation', 'colicky_pain', 'vomiting'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'no',
    incompleteEvacuation: 'no', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Sigmoid colon twists on its mesentery → closed-loop obstruction → ischemia → perforation if untreated.',
    typicalDescription: 'Elderly or institutionalized patient with massive abdominal distension, colicky pain, and absolute constipation (no stool or flatus).',
  },

  // ── Endocrine / Metabolic ─────────────────────────────────────────────
  {
    diseaseId: 'hypothyroidism_constipation', diseaseName: 'Hypothyroidism', icdCode: 'E03.8',
    pathway: 'endocrine', duration: 'chronic_months',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'mild_3_5_per_week',
    ageRange: [10, 80], agePeak: [30, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['female_sex', 'autoimmune_disease', 'family_history_thyroid', 'postpartum'],
    redFlags: ['myxedema_coma', 'bradycardia', 'hypothermia'],
    associatedSymptoms: ['fatigue', 'weight_gain', 'cold_intolerance', 'dry_skin', 'hair_loss', 'bradycardia', 'hoarseness'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'no', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Decreased thyroid hormone → reduced GI motility and prolonged colonic transit time.',
    typicalDescription: 'Chronic constipation with fatigue, weight gain, cold intolerance, and dry skin. TSH is elevated. Constipation improves with levothyroxine.',
  },
  {
    diseaseId: 'diabetes_constipation', diseaseName: 'Diabetic Gastroparesis / Enteropathy', icdCode: 'E10.42',
    pathway: 'endocrine', duration: 'chronic_years',
    typicalStool: ['hard_pellets', 'normal_with_straining'],
    frequency: 'mild_3_5_per_week',
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['longstanding_diabetes', 'poor_glycemic_control', 'diabetic_neuropathy', 'diabetic_nephropathy'],
    redFlags: ['gastroparesis', 'vomiting', 'weight_loss'],
    associatedSymptoms: ['nausea', 'bloating', 'early_satiety', 'vomiting_undigested_food', 'nocturnal_diarrhea'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'sometimes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Autonomic neuropathy affecting the enteric nervous system → delayed gastric emptying and prolonged colonic transit.',
    typicalDescription: 'Longstanding diabetic with constipation alternating with diarrhea. Bloating, early satiety, and nausea suggest gastroparesis.',
  },
  {
    diseaseId: 'hypercalcemia_constipation', diseaseName: 'Hypercalcemia', icdCode: 'E83.5',
    pathway: 'endocrine', duration: 'variable',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'moderate_1_2_per_week',
    ageRange: [10, 80], agePeak: [40, 80],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['hyperparathyroidism', 'malignancy', 'sarcoidosis', 'immobilization', 'thiazide_diuretics'],
    redFlags: ['confusion', 'cardiac_arrhythmia', 'renal_failure'],
    associatedSymptoms: ['polyuria', 'polydipsia', 'fatigue', 'confusion', 'bone_pain', 'renal_colic'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'no', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Hypercalcemia decreases smooth muscle contractility in the GI tract, slowing motility.',
    typicalDescription: 'Constipation with polyuria, polydipsia, and confusion. Often due to hyperparathyroidism or malignancy-associated hypercalcemia.',
  },

  // ── Neurological ─────────────────────────────────────────────────────
  {
    diseaseId: 'parkinson_constipation', diseaseName: 'Parkinson Disease (Constipation)', icdCode: 'G20',
    pathway: 'neurological', duration: 'chronic_years',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'moderate_1_2_per_week',
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'male', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'neurological_disease'],
    redFlags: ['dementia', 'falls'],
    associatedSymptoms: ['tremor', 'rigidity', 'bradykinesia', 'postural_instability', 'micrographia'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Autonomic dysfunction + pelvic floor dyssynergia + medication effect (anticholinergics) + immobility.',
    typicalDescription: 'Constipation often PRECEDES motor symptoms of Parkinson disease by years. Straining and incomplete evacuation are hallmarks.',
  },
  {
    diseaseId: 'spinal_cord_injury_constipation', diseaseName: 'Spinal Cord Injury / Cauda Equina Syndrome', icdCode: 'G95.8',
    pathway: 'neurological', duration: 'variable',
    typicalStool: ['large_painful', 'hard_pellets'],
    frequency: 'severe_less_than_1_per_week',
    ageRange: [10, 80], agePeak: [20, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['spinal_trauma', 'spinal_surgery', 'spinal_tumor', 'spinal_stenosis'],
    redFlags: ['fecal_incontinence', 'saddle_anesthesia', 'urinary_retention', 'leg_weakness'],
    associatedSymptoms: ['urinary_retention', 'saddle_anesthesia', 'leg_weakness', 'loss_perineal_sensation'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'yes', rectalBleeding: 'no',
    mechanism: 'Loss of sacral parasympathetic innervation → absent or reduced colonic peristalsis and inability to relax the anal sphincter.',
    typicalDescription: 'Constipation with urinary retention and saddle anesthesia. Surgical emergency if cauda equina syndrome suspected.',
  },
  {
    diseaseId: 'multiple_sclerosis_constipation', diseaseName: 'Multiple Sclerosis', icdCode: 'G35',
    pathway: 'neurological', duration: 'chronic_years',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'moderate_1_2_per_week',
    ageRange: [15, 60], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['northern_european_ancestry', 'female_sex', 'family_history_ms'],
    redFlags: ['visual_loss', 'motor_deficit', 'bladder_dysfunction'],
    associatedSymptoms: ['optic_neuritis', 'weakness', 'numbness', 'ataxia', 'fatigue', 'bladder_dysfunction'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Demyelinating lesions in spinal cord → disrupted autonomic signaling to the colon.',
    typicalDescription: 'Constipation in a young adult with relapsing-remitting neurological symptoms. Bladder dysfunction often coexists.',
  },

  // ── Psychogenic ───────────────────────────────────────────────────────
  {
    diseaseId: 'depression_constipation', diseaseName: 'Depression / Anxiety (Constipation)', icdCode: 'F32.9',
    pathway: 'psychogenic', duration: 'chronic_months',
    typicalStool: ['hard_pellets', 'normal_with_straining'],
    frequency: 'mild_3_5_per_week',
    ageRange: [10, 80], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['depression', 'anxiety', 'stress', 'ssri_use', 'tca_use'],
    redFlags: ['suicidal_ideation', 'psychosis'],
    associatedSymptoms: ['low_mood', 'anhedonia', 'fatigue', 'sleep_disturbance', 'appetite_change'],
    painPattern: 'no', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'no', manualManeuvers: 'no', rectalBleeding: 'no',
    mechanism: 'Altered brain-gut axis + medication side effects (TCAs, SSRIs) + reduced physical activity + poor dietary intake.',
    typicalDescription: 'Constipation in the context of low mood, fatigue, and reduced appetite. May be exacerbated by antidepressant medications.',
  },
  {
    diseaseId: 'anorexia_constipation', diseaseName: 'Anorexia Nervosa (Constipation)', icdCode: 'F50.0',
    pathway: 'psychogenic', duration: 'chronic_months',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'moderate_1_2_per_week',
    ageRange: [12, 50], agePeak: [15, 30],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['low_bmi', 'restrictive_eating', 'purging', 'laxative_abuse'],
    redFlags: ['bradycardia', 'hypotension', 'electrolyte_imbalance', 'refeeding_risk'],
    associatedSymptoms: ['weight_loss', 'amenorrhea', 'fatigue', 'lanugo', 'cold_intolerance'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'sometimes', manualManeuvers: 'sometimes', rectalBleeding: 'no',
    mechanism: 'Starvation-induced gut atrophy + electrolyte disturbances + laxative dependence cycle + slow transit.',
    typicalDescription: 'Severe constipation in the context of eating disorder. May alternate with diarrhea from laxative abuse. Refeeding must be cautious.',
  },

  // ── Paediatric ────────────────────────────────────────────────────────
  {
    diseaseId: 'functional_constipation_child', diseaseName: 'Childhood Functional Constipation', icdCode: 'K59.0',
    pathway: 'paediatric_functional', duration: 'chronic_months',
    typicalStool: ['hard_pellets', 'large_painful', 'overflow_diarrhoea'],
    frequency: 'mild_3_5_per_week',
    ageRange: [0.5, 18], agePeak: [2, 8],
    sexPredilection: 'none', backgroundPrevalence: 0.15,
    riskFactors: ['toilet_training_stress', 'low_fiber_diet', 'excessive_milk', 'family_history', 'withholding_behavior', 'school_refusal'],
    redFlags: ['failure_to_thrive', 'vomiting_bilious', 'abdominal_distension_massive'],
    associatedSymptoms: ['soiling_encopresis', 'withholding_posture', 'irritability', 'abdominal_pain', 'urinary_incontinence'],
    painPattern: 'yes_relieved_by_defecation', bloating: 'sometimes', straining: 'yes',
    incompleteEvacuation: 'sometimes', manualManeuvers: 'no', rectalBleeding: 'sometimes_fissure',
    mechanism: 'Withholding behavior leads to fecal impaction → overflow incontinence → vicious cycle.',
    typicalDescription: 'Child with infrequent painful bowel movements, withholding behavior, and overflow soiling. Common around toilet training age.',
  },
  {
    diseaseId: 'hirschsprung_disease', diseaseName: 'Hirschsprung Disease (Aganglionic Megacolon)', icdCode: 'Q43.1',
    pathway: 'mechanical_obstruction', duration: 'lifelong',
    typicalStool: ['hard_pellets', 'large_painful'],
    frequency: 'severe_less_than_1_per_week',
    ageRange: [0, 30], agePeak: [0, 2],
    sexPredilection: 'male', backgroundPrevalence: 0.0005,
    riskFactors: ['down_syndrome', 'family_history_hirschsprung', 'male_sex'],
    redFlags: ['failure_to_pass_meconium', 'vomiting_bilious', 'enterocolitis', 'abdominal_distension'],
    associatedSymptoms: ['failure_to_pass_meconium_48h', 'abdominal_distension', 'vomiting', 'poor_feeding', 'growth_failure'],
    painPattern: 'yes_not_relieved', bloating: 'yes', straining: 'yes',
    incompleteEvacuation: 'yes', manualManeuvers: 'sometimes', rectalBleeding: 'no',
    mechanism: 'Absence of ganglion cells in the distal colon → failure of relaxation of the affected segment → functional obstruction.',
    typicalDescription: 'Neonate who fails to pass meconium in the first 48 hours of life. Progressive abdominal distension and bilious vomiting.',
  },
];

// ── Constipation pattern recognition rules ─────────────────────────────

const CONSTIPATION_PATTERNS: ConstipationPatternRule[] = [
  {
    id: 'drug_history_first', label: 'Constipation + Drug History',
    description: 'Constipation starting after starting opioids, anticholinergics, or other constipating drugs = drug-induced',
    pattern: ['constipation', 'medication_list'],
    suggests: ['opioid_induced_constipation', 'drug_induced_constipation_other'],
    rulesOut: ['functional_constipation', 'ibs_constipation'],
    pathway: 'drug_induced',
    priorityBoost: 25,
  },
  {
    id: 'red_flag_constipation', label: 'Red Flag Constipation',
    description: 'Constipation + PR bleeding + weight loss + change in bowel habit = colorectal cancer until proven',
    pattern: ['hematochezia', 'weight_loss', 'bowel_habits'],
    suggests: ['colorectal_cancer_constipation'],
    rulesOut: ['functional_constipation', 'ibs_constipation'],
    pathway: 'mechanical_obstruction',
    priorityBoost: 30,
  },
  {
    id: 'hypothyroid_constipation_pattern', label: 'Constipation + Fatigue + Weight Gain',
    description: 'Constipation with fatigue, cold intolerance, and weight gain = hypothyroidism',
    pattern: ['constipation', 'fatigue', 'weight_gain'],
    suggests: ['hypothyroidism_constipation'],
    rulesOut: ['colorectal_cancer_constipation', 'functional_constipation'],
    pathway: 'endocrine',
    priorityBoost: 20,
  },
  {
    id: 'neurological_constipation', label: 'Constipation + Neurological Symptoms',
    description: 'Constipation with neurological symptoms = Parkinson, MS, or spinal cord injury',
    pattern: ['constipation', 'neurological_symptoms'],
    suggests: ['parkinson_constipation', 'multiple_sclerosis_constipation', 'spinal_cord_injury_constipation'],
    rulesOut: ['functional_constipation', 'ibs_constipation'],
    pathway: 'neurological',
    priorityBoost: 25,
  },
  {
    id: 'childhood_encopresis', label: 'Child with Constipation + Soiling',
    description: 'Child with constipation and overflow soiling = functional constipation until proven',
    pattern: ['constipation', 'soiling_encopresis'],
    suggests: ['functional_constipation_child'],
    rulesOut: ['hirschsprung_disease'],
    pathway: 'paediatric_functional',
    priorityBoost: 20,
  },
  {
    id: 'neonatal_meconium_delay', label: 'Delayed Meconium Passage',
    description: 'Neonate failing to pass meconium in 48h + distension = Hirschsprung until proven',
    pattern: ['constipation', 'abdominal_distension'],
    suggests: ['hirschsprung_disease'],
    rulesOut: ['functional_constipation_child'],
    pathway: 'mechanical_obstruction',
    priorityBoost: 30,
  },
  {
    id: 'pelvic_floor_pattern', label: 'Straining + Incomplete Evacuation + Normal Frequency',
    description: 'Normal bowel frequency but severe straining and incomplete evacuation = pelvic floor dyssynergia',
    pattern: ['constipation', 'pelvic_pain', 'straining', 'incomplete_evacuation'],
    suggests: ['dyssynergic_defecation', 'rectocele'],
    rulesOut: ['slow_transit_constipation', 'functional_constipation'],
    pathway: 'pelvic_floor',
    priorityBoost: 20,
  },
  {
    id: 'severe_bloating_distension', label: 'Severe Bloating + Distension + Infrequent Stool',
    description: 'Less than 1 BM per week with severe bloating = slow transit constipation',
    pattern: ['constipation', 'abdominal_distension', 'bloating'],
    suggests: ['slow_transit_constipation'],
    rulesOut: ['functional_constipation', 'ibs_constipation'],
    pathway: 'slow_transit',
    priorityBoost: 15,
  },
  {
    id: 'diabetic_with_constipation', label: 'Diabetic with Constipation + Bloating',
    description: 'Known diabetic with constipation, bloating, and early satiety = diabetic enteropathy/gastroparesis',
    pattern: ['constipation', 'diabetes', 'nausea'],
    suggests: ['diabetes_constipation'],
    rulesOut: ['functional_constipation', 'ibs_constipation'],
    pathway: 'endocrine',
    priorityBoost: 20,
  },
  {
    id: 'elderly_distension_volvulus', label: 'Elderly with Massive Distension + Obstipation',
    description: 'Elderly patient with sudden massive distension and inability to pass stool/gas = sigmoid volvulus',
    pattern: ['constipation', 'abdominal_distension', 'pain_severity'],
    suggests: ['sigmoid_volvulus', 'colorectal_cancer_constipation'],
    rulesOut: ['functional_constipation', 'ibs_constipation'],
    pathway: 'mechanical_obstruction',
    priorityBoost: 25,
  },
];

// ── Pathway classification logic ───────────────────────────────────────

export function classifyConstipationPathway(
  frequency: string,
  straining: boolean,
  incompleteEvacuation: boolean,
  manualManeuvers: boolean,
  bloating: boolean,
  painRelievedByDefecation: boolean,
  drugUse: string[],
  age: number,
): { primaryPathway: ConstipationPathway; secondaryPathway?: ConstipationPathway; rationale: string } {
  // Drug-induced is the easiest — ask about medications first
  if (drugUse.some(d => ['opioid', 'codeine', 'morphine', 'oxycodone', 'tramadol'].includes(d))) {
    return { primaryPathway: 'drug_induced', rationale: 'Opioid use is the most common reversible cause of constipation. Rule out other causes if no improvement after opioid cessation/antagonist.' };
  }

  // Paediatric
  if (age < 18) {
    if (!incompleteEvacuation && !manualManeuvers) {
      return { primaryPathway: 'paediatric_functional', rationale: 'Functional constipation is the most common cause in children. Red flags (delayed meconium, bilious vomiting) suggest Hirschsprung.' };
    }
  }

  // Pelvic floor / outlet obstruction
  if (straining && incompleteEvacuation && manualManeuvers && frequency !== 'severe_less_than_1_per_week') {
    return { primaryPathway: 'pelvic_floor', rationale: 'Normal or near-normal frequency with severe straining, incomplete evacuation, and manual maneuvers = pelvic floor dyssynergia or rectocele.' };
  }

  // Slow transit
  if (frequency === 'severe_less_than_1_per_week' && bloating) {
    return { primaryPathway: 'slow_transit', rationale: 'Severe infrequency (<1 BM/week) with bloating = slow transit constipation.' };
  }

  // IBS-C
  if (painRelievedByDefecation && bloating && ['mild_3_5_per_week', 'moderate_1_2_per_week'].includes(frequency)) {
    return { primaryPathway: 'functional_ibs_c', rationale: 'Abdominal pain relieved by defecation with bloating and altered stool form = IBS-C (Rome IV criteria).' };
  }

  // Functional
  if (straining && !incompleteEvacuation && !manualManeuvers && !painRelievedByDefecation) {
    return { primaryPathway: 'functional_ibs_c', rationale: 'Simple straining without red flags or neurological symptoms = functional constipation.' };
  }

  // Neurological
  if (manualManeuvers && !straining) {
    return { primaryPathway: 'neurological', rationale: 'Need for manual maneuvers without excessive straining suggests neurological cause (Parkinson, MS, spinal cord).' };
  }

  return { primaryPathway: 'functional_ibs_c', rationale: 'Most common causes are functional constipation or IBS-C. Assess drug history, red flags, and neurological symptoms.' };
}

// ── Public API ─────────────────────────────────────────────────────────

export function getConstipationDdx(): ConstipationDisease[] {
  return CONSTIPATION_DDX;
}

export function getConstipationPatterns(): ConstipationPatternRule[] {
  return CONSTIPATION_PATTERNS;
}

export function getConstipationByPathway(pathway: ConstipationPathway): ConstipationDisease[] {
  return CONSTIPATION_DDX.filter(d => d.pathway === pathway);
}

export function getBiodataAdjustedConstipationPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of CONSTIPATION_DDX) {
    let shift = 0;
    const reasons: string[] = [];

    if (age >= ddx.ageRange[0] && age <= ddx.ageRange[1]) {
      shift += 0.02;
      if (age >= ddx.agePeak[0] && age <= ddx.agePeak[1]) {
        shift += 0.05;
        reasons.push(`peak age ${ddx.agePeak[0]}-${ddx.agePeak[1]}`);
      }
    } else {
      shift -= 0.03;
    }

    if (ddx.sexPredilection === 'female' && sex === 'female') {
      shift += 0.03;
      reasons.push('female predominance');
    } else if (ddx.sexPredilection === 'male' && sex === 'male') {
      shift += 0.03;
      reasons.push('male predominance');
    }

    result[ddx.diseaseId] = {
      diseaseId: ddx.diseaseId,
      diseaseName: ddx.diseaseName,
      priorShift: Math.max(-0.03, Math.min(0.15, shift)),
      rationale: reasons.length > 0 ? reasons.join('; ') : 'no specific biodata adjustment',
    };
  }

  return result;
}

export function getConstipationGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const CONSTIPATION_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'stool_frequency', label: 'Stool Frequency', features: ['constipation', 'bowel_habits'], priority: 85, rationale: 'Confirming constipation and establishing baseline frequency is the first step.', category: 'documentation' },
    { id: 'stool_consistency', label: 'Stool Consistency', features: ['stool_consistency', 'stool_type'], priority: 80, rationale: 'Bristol Stool Chart type distinguishes slow transit (Type 1-2) from functional (Type 2-3) from IBS (variable).', category: 'diagnostic' },
    { id: 'straining', label: 'Straining Pattern', features: ['straining', 'straining_severity'], priority: 78, rationale: 'Severe straining with normal frequency = outlet obstruction. Absent straining with infrequency = slow transit.', category: 'diagnostic' },
    { id: 'incomplete_evacuation', label: 'Incomplete Evacuation', features: ['incomplete_evacuation'], priority: 75, rationale: 'Sensation of incomplete evacuation is hallmark of pelvic floor dyssynergia and rectocele.', category: 'diagnostic' },
    { id: 'manual_maneuvers', label: 'Digital Maneuvers', features: ['manual_maneuvers_needed'], priority: 72, rationale: 'Need to splint vaginally or digitally evacuate = pelvic floor disorder or severe dyssynergia.', category: 'diagnostic' },
    { id: 'bloating_distension', label: 'Bloating and Distension', features: ['bloating', 'abdominal_distension'], priority: 70, rationale: 'Severe bloating with infrequency = slow transit. Bloating with IBS-C = visceral hypersensitivity.', category: 'diagnostic' },
    { id: 'pain_pattern', label: 'Abdominal Pain Pattern', features: ['pain_character', 'pain_worsening_factors', 'pain_relieving_factors'], priority: 68, rationale: 'Pain relieved by defecation = IBS-C. Pain not relieved = mechanical obstruction or slow transit.', category: 'diagnostic' },
    { id: 'drug_history_cause', label: 'Drug History (Iatrogenic)', features: ['medication_list', 'opioid_use', 'anticholinergic_use', 'iron_supplements'], priority: 85, rationale: 'Drug-induced constipation is the most reversible cause. ALWAYS review medications first.', category: 'management' },
    { id: 'red_flag_colon_cancer', label: 'Red Flags for Colorectal Cancer', features: ['hematochezia', 'weight_loss', 'change_bowel_habit'], priority: 95, rationale: 'RED FLAG: PR bleeding + weight loss + change in bowel habit = colorectal cancer until proven otherwise.', category: 'life_threatening' },
    { id: 'endocrine/metabolic', label: 'Endocrine/Metabolic Causes', features: ['fatigue', 'weight_gain', 'cold_intolerance', 'polyuria', 'polydipsia'], priority: 65, rationale: 'Constipation may be the presenting symptom of hypothyroidism, diabetes, or hypercalcemia.', category: 'diagnostic' },
    { id: 'neurological_cause', label: 'Neurological Causes', features: ['neurological_symptoms', 'tremor', 'rigidity', 'urinary_retention', 'saddle_anesthesia'], priority: 75, rationale: 'Constipation + neurological symptoms = rule out Parkinson, MS, or spinal cord lesion.', category: 'diagnostic' },
    { id: 'ibs_criteria', label: 'IBS Criteria', features: ['abdominal_pain', 'pain_relieved_by_stool', 'bloating', 'mucus_in_stool'], priority: 60, rationale: 'Rome IV criteria for IBS-C: abdominal pain relieved by defecation with change in stool frequency/form.', category: 'diagnostic' },
    { id: 'dietary_assessment', label: 'Dietary / Lifestyle', features: ['fiber_intake', 'fluid_intake', 'exercise_frequency', 'ignoring_urge'], priority: 55, rationale: 'Low fiber, low fluid intake, and ignoring the urge to defecate are the most common modifiable causes.', category: 'management' },
    { id: 'paediatric_red_flags', label: 'Paediatric Red Flags', features: ['delayed_meconium', 'vomiting_bilious', 'failure_to_thrive', 'abdominal_distension'], priority: 95, rationale: 'Delayed meconium + bilious vomiting = Hirschsprung disease until proven. Urgent pediatric surgical referral.', category: 'life_threatening' },
  ];

  for (const def of CONSTIPATION_GAP_DEFS) {
    const answeredCount = def.features.filter(f => answered.has(f)).length;
    if (answeredCount === 0) {
      const firstFeature = def.features[0];
      const feature = FEATURES[firstFeature];
      if (feature) {
        gaps.push({
          featureId: firstFeature,
          label: feature.label,
          category: def.category,
          priorityScore: def.priority,
          reasonEssential: def.rationale,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: 'Constipation Assessment',
        });
      }
    } else if (answeredCount < def.features.length && def.features.length > 1) {
      const unanswered = def.features.find(f => !answered.has(f));
      if (unanswered) {
        const feature = FEATURES[unanswered];
        if (feature) {
          gaps.push({
            featureId: unanswered,
            label: feature.label,
            category: def.category,
            priorityScore: def.priority - 10,
            reasonEssential: def.rationale,
            type: feature.type,
            options: feature.options,
            clinicalGuide: feature.clinicalGuide,
            groupLabel: 'Constipation Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getConstipationPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of CONSTIPATION_PATTERNS) {
    const patternAnswered = pattern.pattern.filter(f => answered.has(f));
    const patternUnanswered = pattern.pattern.filter(f => !answered.has(f));

    if (patternAnswered.length >= 2 && patternUnanswered.length > 0) {
      for (const featureId of patternUnanswered) {
        const feature = FEATURES[featureId];
        if (!feature) continue;

        const matchingDiseases = pattern.suggests.filter(d => activeDiseaseStates[d]?.currentProb > 0.01).length;
        const boost = matchingDiseases > 0 ? pattern.priorityBoost + 10 : pattern.priorityBoost;

        gaps.push({
          featureId,
          label: feature.label,
          category: 'diagnostic',
          priorityScore: Math.min(100, 60 + boost),
          reasonEssential: `Constipation pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: `Pattern: ${pattern.label}`,
        });
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}
