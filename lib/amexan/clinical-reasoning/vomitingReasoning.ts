import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type VomitingCategory = 'gi_obstruction' | 'gi_infectious' | 'metabolic' | 'cns' | 'drug_induced' | 'psychogenic' | 'pregnancy' | 'vestibular' | 'other';

interface VomitingDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: VomitingCategory;
  timing: 'before_meals' | 'after_meals' | 'delayed_hours' | 'projectile' | 'morning' | 'unrelated';
  bilious: boolean;
  projectile: boolean;
  painRelief: boolean;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface VomitingPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const VOMITING_DDX: VomitingDisease[] = [
  {
    diseaseId: 'acute_gastroenteritis_vomiting', diseaseName: 'Acute Viral Gastroenteritis', icdCode: 'A09',
    category: 'gi_infectious', timing: 'after_meals',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [0, 90], agePeak: [1, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.2,
    riskFactors: ['exposure', 'daycare'],
    redFlags: ['dehydration', 'sepsis'],
    associatedSymptoms: ['diarrhea', 'abdominal_cramps', 'fever', 'nausea'],
    typicalDescription: 'Nausea and vomiting with diarrhea and abdominal cramps. Self-limited over 24-72 hours.',
  },
  {
    diseaseId: 'gastric_outlet_obstruction', diseaseName: 'Gastric Outlet Obstruction', icdCode: 'K31.1',
    category: 'gi_obstruction', timing: 'delayed_hours',
    bilious: false, projectile: false, painRelief: true,
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['peptic_ulcer_disease', 'gastric_cancer', 'pancreatic_cancer', 'caustic_ingestion'],
    redFlags: ['weight_loss', 'hematemesis', 'dehydration'],
    associatedSymptoms: ['early_satiety', 'epigastric_pain', 'weight_loss', 'bloating'],
    typicalDescription: 'Delayed vomiting (hours after eating) of undigested food. Pain relieved by vomiting. Successive borborygmi on auscultation.',
  },
  {
    diseaseId: 'small_bowel_obstruction_vomiting', diseaseName: 'Small Bowel Obstruction', icdCode: 'K56.5',
    category: 'gi_obstruction', timing: 'delayed_hours',
    bilious: true, projectile: false, painRelief: true,
    ageRange: [1, 90], agePeak: [30, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['prior_abdominal_surgery', 'hernia', 'crohn_disease', 'adhesions', 'tumor'],
    redFlags: ['obstipation', 'peritonism', 'feculent_vomiting'],
    associatedSymptoms: ['abdominal_pain_colicky', 'obstipation', 'abdominal_distension'],
    typicalDescription: 'Colicky abdominal pain with bilious vomiting followed by obstipation. Progressive abdominal distension.',
  },
  {
    diseaseId: 'hypertrophic_pyloric_stenosis_vomit', diseaseName: 'Hypertrophic Pyloric Stenosis', icdCode: 'Q40.0',
    category: 'gi_obstruction', timing: 'projectile',
    bilious: false, projectile: true, painRelief: false,
    ageRange: [0.08, 0.5], agePeak: [0.08, 0.25],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['male_sex', 'first_born', 'family_history'],
    redFlags: ['dehydration', 'electrolyte_imbalance'],
    associatedSymptoms: ['projectile_vomiting', 'olive_mass', 'hungry_after_vomiting', 'constipation'],
    typicalDescription: 'Progressive projectile non-bilious vomiting in infant 2-8 weeks old. Palpable olive-shaped pyloric mass.',
  },
  {
    diseaseId: 'intussusception_vomiting', diseaseName: 'Intussusception', icdCode: 'K56.1',
    category: 'gi_obstruction', timing: 'after_meals',
    bilious: true, projectile: false, painRelief: false,
    ageRange: [0.17, 5], agePeak: [0.5, 2],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['male_sex', 'age', 'recent_viral_illness', 'meckel_diverticulum'],
    redFlags: ['currant_jelly_stool', 'lethargy', 'peritonism'],
    associatedSymptoms: ['colicky_pain', 'currant_jelly_stool', 'lethargy', 'abdominal_mass'],
    typicalDescription: 'Intermittent colicky pain with drawing up of legs, vomiting, and currant jelly stool in infant.',
  },
  {
    diseaseId: 'diabetic_ketoacidosis_vomiting', diseaseName: 'Diabetic Ketoacidosis (DKA)', icdCode: 'E10.1',
    category: 'metabolic', timing: 'unrelated',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [1, 80], agePeak: [10, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['diabetes_type_1', 'missed_insulin', 'infection', 'stress'],
    redFlags: ['kussmaul_respirations', 'confusion', 'hypotension', 'coma'],
    associatedSymptoms: ['abdominal_pain', 'polydipsia', 'polyuria', 'kussmaul_breathing', 'confusion'],
    typicalDescription: 'Nausea and vomiting in a known diabetic with abdominal pain, Kussmaul breathing, and dehydration.',
  },
  {
    diseaseId: 'uremia_vomiting', diseaseName: 'Uremia (Renal Failure)', icdCode: 'N18.9',
    category: 'metabolic', timing: 'morning',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [20, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['chronic_kidney_disease', 'diabetes', 'hypertension'],
    redFlags: ['hyperkalemia', 'pulmonary_edema', 'encephalopathy'],
    associatedSymptoms: ['fatigue', 'oliguria', 'pruritus', 'edema', 'confusion'],
    typicalDescription: 'Nausea and vomiting in patient with known renal failure. Often worse in morning. Uremic fetor.',
  },
  {
    diseaseId: 'increased_icp_vomiting', diseaseName: 'Raised Intracranial Pressure', icdCode: 'G93.2',
    category: 'cns', timing: 'morning',
    bilious: false, projectile: true, painRelief: false,
    ageRange: [1, 80], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['brain_tumor', 'hydrocephalus', 'cerebral_edema', 'intracranial_hemorrhage'],
    redFlags: ['papilledema', 'focal_neurological_deficit', 'seizure', 'altered_consciousness'],
    associatedSymptoms: ['headache', 'visual_disturbance', 'papilledema', 'neurological_deficit'],
    typicalDescription: 'Projectile vomiting without preceding nausea, worse in morning, associated with headache and neurological deficits.',
  },
  {
    diseaseId: 'vestibular_vomiting', diseaseName: 'Vestibular (Labyrinthitis / Meniere)', icdCode: 'H81.4',
    category: 'vestibular', timing: 'unrelated',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [15, 80], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['viral_infection', 'meniere_disease', 'migraine'],
    redFlags: ['hearing_loss', 'tinnitus', 'neurological_deficit'],
    associatedSymptoms: ['vertigo', 'dizziness', 'nystagmus', 'hearing_loss', 'tinnitus'],
    typicalDescription: 'Severe nausea and vomiting with vertigo and nystagmus. May have hearing loss and tinnitus (Meniere).',
  },
  {
    diseaseId: 'pregnancy_hyperemesis', diseaseName: 'Hyperemesis Gravidarum', icdCode: 'O21.1',
    category: 'pregnancy', timing: 'morning',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [15, 45], agePeak: [20, 35],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['first_trimester', 'multiple_pregnancy', 'molar_pregnancy', 'previous_hyperemesis'],
    redFlags: ['weight_loss', 'electrolyte_imbalance', 'thiamine_deficiency'],
    associatedSymptoms: ['breast_tenderness', 'fatigue', 'food_aversion'],
    typicalDescription: 'Persistent nausea and vomiting in early pregnancy, often worse in morning. Severe cases cause weight loss and electrolyte disturbances.',
  },
  {
    diseaseId: 'drug_induced_vomiting', diseaseName: 'Drug-Induced Nausea/Vomiting', icdCode: 'R11.2',
    category: 'drug_induced', timing: 'after_meals',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [1, 90], agePeak: [20, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['chemotherapy', 'opioids', 'antibiotics', 'antiepileptics', 'digoxin', 'theophylline'],
    redFlags: ['dehydration'],
    associatedSymptoms: ['nausea', 'dizziness'],
    typicalDescription: 'Nausea and vomiting temporally related to medication administration. Chemotherapy-induced emesis is most severe.',
  },
  {
    diseaseId: 'psychogenic_vomiting', diseaseName: 'Psychogenic Vomiting / Eating Disorder', icdCode: 'F50.5',
    category: 'psychogenic', timing: 'after_meals',
    bilious: false, projectile: false, painRelief: true,
    ageRange: [12, 50], agePeak: [15, 35],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    riskFactors: ['bulimia_nervosa', 'anorexia', 'body_image_disturbance', 'depression'],
    redFlags: ['electrolyte_imbalance', 'esophageal_rupture', 'dental_erosion'],
    associatedSymptoms: ['self_induced_vomiting', 'weight_preoccupation', 'binge_eating', 'laxative_abuse'],
    typicalDescription: 'Self-induced vomiting after meals in context of eating disorder. Dental erosion, parotid enlargement, and Russell sign.',
  },
  {
    diseaseId: 'pancreatitis_vomiting', diseaseName: 'Acute Pancreatitis', icdCode: 'K85',
    category: 'gi_obstruction', timing: 'after_meals',
    bilious: false, projectile: false, painRelief: false,
    ageRange: [20, 90], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['gallstones', 'alcohol', 'hypertriglyceridemia', 'ercp', 'drugs'],
    redFlags: ['hypotension', 'respiratory_distress', 'oliguria'],
    associatedSymptoms: ['severe_epigastric_pain', 'pain_radiation_to_back', 'anorexia'],
    typicalDescription: 'Persistent vomiting with severe epigastric pain radiating to back. Pain worse with eating.',
  },
  {
    diseaseId: 'cyclic_vomiting_syndrome', diseaseName: 'Cyclic Vomiting Syndrome', icdCode: 'G43.A0',
    category: 'other', timing: 'morning',
    bilious: false, projectile: true, painRelief: false,
    ageRange: [3, 60], agePeak: [5, 40],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['family_history_migraine', 'migraine_history', 'anxiety'],
    redFlags: [],
    associatedSymptoms: ['stereotypical_episodes', 'pallor', 'lethargy', 'abdominal_pain'],
    typicalDescription: 'Recurrent stereotypical episodes of severe vomiting with pain-free intervals. Often migraine-associated.',
  },
];

const VOMITING_PATTERNS: VomitingPatternRule[] = [
  {
    id: 'vomiting_diarrhea', label: 'Nausea/Vomiting + Diarrhea',
    description: 'Vomiting with diarrhea = acute gastroenteritis (most common cause)',
    pattern: ['vomiting', 'diarrhea', 'nausea'],
    suggests: ['acute_gastroenteritis_vomiting'],
    rulesOut: ['increased_icp_vomiting', 'gastric_outlet_obstruction'],
    priorityBoost: 20,
  },
  {
    id: 'projectile_vomiting_no_nausea', label: 'Projectile Vomiting Without Nausea',
    description: 'Projectile vomiting without preceding nausea = raised ICP until proven',
    pattern: ['vomiting', 'headache', 'numbness_tingling'],
    suggests: ['increased_icp_vomiting'],
    rulesOut: ['acute_gastroenteritis_vomiting', 'drug_induced_vomiting'],
    priorityBoost: 35,
  },
  {
    id: 'bilious_vomiting', label: 'Bilious Vomiting',
    description: 'Bilious (green/yellow) vomiting = obstruction distal to ampulla of Vater',
    pattern: ['vomiting_bilious', 'abdominal_pain'],
    suggests: ['small_bowel_obstruction_vomiting', 'intussusception_vomiting'],
    rulesOut: ['gastric_outlet_obstruction', 'psychogenic_vomiting'],
    priorityBoost: 30,
  },
  {
    id: 'delayed_vomiting_undigested', label: 'Delayed Vomiting of Undigested Food',
    description: 'Vomiting hours after eating undigested food = gastric outlet obstruction',
    pattern: ['vomiting_relation_to_eating', 'vomiting_relief'],
    suggests: ['gastric_outlet_obstruction'],
    rulesOut: ['acute_gastroenteritis_vomiting', 'drug_induced_vomiting'],
    priorityBoost: 25,
  },
  {
    id: 'infant_projectile', label: 'Infant with Projectile Vomiting',
    description: 'Infant 2-8 weeks with progressive projectile vomiting = pyloric stenosis',
    pattern: ['vomiting_projectile', 'vomiting_relation_to_eating'],
    suggests: ['hypertrophic_pyloric_stenosis_vomit'],
    rulesOut: ['acute_gastroenteritis_vomiting', 'intussusception_vomiting'],
    priorityBoost: 30,
  },
  {
    id: 'diabetic_vomiting', label: 'Diabetic with Vomiting + Abdominal Pain',
    description: 'Known diabetic with vomiting and abdominal pain = DKA until proven',
    pattern: ['vomiting', 'abdominal_pain', 'diabetes'],
    suggests: ['diabetic_ketoacidosis_vomiting'],
    rulesOut: ['acute_gastroenteritis_vomiting', 'gastric_outlet_obstruction'],
    priorityBoost: 30,
  },
  {
    id: 'morning_vomiting', label: 'Morning Vomiting',
    description: 'Morning vomiting = pregnancy, uremia, or raised ICP',
    pattern: ['vomiting_relation_to_eating', 'headache'],
    suggests: ['pregnancy_hyperemesis', 'uremia_vomiting', 'increased_icp_vomiting'],
    rulesOut: ['acute_gastroenteritis_vomiting', 'drug_induced_vomiting'],
    priorityBoost: 20,
  },
  {
    id: 'vomiting_vertigo', label: 'Vomiting + Vertigo',
    description: 'Severe vomiting with vertigo and nystagmus = vestibular cause',
    pattern: ['vomiting', 'dizziness', 'numbness_tingling'],
    suggests: ['vestibular_vomiting'],
    rulesOut: ['increased_icp_vomiting', 'acute_gastroenteritis_vomiting'],
    priorityBoost: 20,
  },
  {
    id: 'chemotherapy_vomiting', label: 'Post-Chemotherapy Vomiting',
    description: 'Vomiting temporally related to chemotherapy or medications = drug-induced',
    pattern: ['vomiting', 'medication_list'],
    suggests: ['drug_induced_vomiting'],
    rulesOut: ['gastric_outlet_obstruction', 'increased_icp_vomiting'],
    priorityBoost: 15,
  },
  {
    id: 'self_induced_vomiting', label: 'Self-Induced Vomiting After Meals',
    description: 'Self-induced vomiting after meals with weight preoccupation = bulimia',
    pattern: ['vomiting_relation_to_eating', 'weight_loss'],
    suggests: ['psychogenic_vomiting'],
    rulesOut: ['gastric_outlet_obstruction', 'acute_gastroenteritis_vomiting'],
    priorityBoost: 15,
  },
];

export function getVomitingDdx(): VomitingDisease[] {
  return VOMITING_DDX;
}

export function getVomitingPatterns(): VomitingPatternRule[] {
  return VOMITING_PATTERNS;
}

export function getVomitingGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const VOMITING_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'vomiting_presence', label: 'Vomiting Confirmation', features: ['vomiting'], priority: 85, rationale: 'Confirm vomiting presence, timing, and severity.', category: 'documentation' },
    { id: 'vomiting_timing', label: 'Timing Relative to Meals', features: ['vomiting_relation_to_eating', 'vomiting_timing'], priority: 80, rationale: 'Timing is key: after meals = gastritis/GBS. Delayed = obstruction. Morning = ICP/pregnancy.', category: 'diagnostic' },
    { id: 'vomiting_bilious', label: 'Bilious Vomiting', features: ['vomiting_bilious'], priority: 90, rationale: 'Bilious vomiting = obstruction distal to ampulla. EMERGENCY in neonate.', category: 'life_threatening' },
    { id: 'vomiting_projectile', label: 'Projectile Vomiting', features: ['vomiting_projectile', 'vomiting_force'], priority: 85, rationale: 'Projectile vomiting without nausea = raised ICP or pyloric stenosis.', category: 'life_threatening' },
    { id: 'vomiting_relief', label: 'Pain Relief with Vomiting', features: ['vomiting_relief'], priority: 70, rationale: 'Vomiting that relieves pain = gastric outlet obstruction or psychogenic.', category: 'diagnostic' },
    { id: 'vomiting_abdominal_pain', label: 'Associated Abdominal Pain', features: ['abdominal_pain', 'pain_severity'], priority: 80, rationale: 'Vomiting with severe abdominal pain = pancreatitis, SBO, or DKA.', category: 'diagnostic' },
    { id: 'vomiting_diarrhea', label: 'Associated Diarrhea', features: ['diarrhea'], priority: 75, rationale: 'Vomiting + diarrhea = gastroenteritis until proven.', category: 'diagnostic' },
    { id: 'vomiting_headache_neuro', label: 'Headache and Neurological Symptoms', features: ['headache', 'numbness_tingling', 'visual_disturbance'], priority: 90, rationale: 'Vomiting with headache/neuro signs = raised ICP. Life-threatening.', category: 'life_threatening' },
    { id: 'vomiting_dizziness', label: 'Dizziness / Vertigo', features: ['dizziness', 'vertigo'], priority: 75, rationale: 'Vomiting with vertigo = vestibular cause (labyrinthitis, Meniere).', category: 'diagnostic' },
    { id: 'vomiting_pregnancy', label: 'Pregnancy Status', features: ['pregnancy_status', 'last_menstrual_period'], priority: 70, rationale: 'Morning vomiting in reproductive-age female = pregnancy until proven.', category: 'diagnostic' },
    { id: 'vomiting_diabetes', label: 'Diabetic Context', features: ['diabetes'], priority: 80, rationale: 'Vomiting in diabetic = DKA until proven otherwise.', category: 'life_threatening' },
    { id: 'vomiting_drugs', label: 'Drug History', features: ['medication_list'], priority: 65, rationale: 'Review medications for emetogenic drugs (chemotherapy, opioids, antibiotics).', category: 'risk_factor' },
  ];

  for (const def of VOMITING_GAP_DEFS) {
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
          groupLabel: 'Vomiting Assessment',
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
            groupLabel: 'Vomiting Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getVomitingPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of VOMITING_PATTERNS) {
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
          reasonEssential: `Vomiting pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedVomitingPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of VOMITING_DDX) {
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

    if (ddx.sexPredilection === 'male' && sex === 'male') {
      shift += 0.03;
      reasons.push('male predominance');
    } else if (ddx.sexPredilection === 'female' && sex === 'female') {
      shift += 0.03;
      reasons.push('female predominance');
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
