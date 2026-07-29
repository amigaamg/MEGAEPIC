import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type DiarrheaCategory = 'acute_infectious' | 'chronic_inflammatory' | 'malabsorptive' | 'secretory' | 'motility' | 'drug_induced' | 'ischemic' | 'factitious';

interface DiarrheaDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: DiarrheaCategory;
  typicalDuration: 'acute_days' | 'persistent_weeks' | 'chronic_months';
  stoolCharacter: string[];
  nocturnal: boolean;
  fastingImproves: boolean;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface DiarrheaPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const DIARRHEA_DDX: DiarrheaDisease[] = [
  {
    diseaseId: 'acute_gastroenteritis', diseaseName: 'Acute Viral Gastroenteritis', icdCode: 'A09',
    category: 'acute_infectious', typicalDuration: 'acute_days',
    stoolCharacter: ['Watery', 'Loose'],
    nocturnal: false, fastingImproves: true,
    ageRange: [0, 90], agePeak: [1, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.2,
    riskFactors: ['exposure', 'daycare', 'crowding'],
    redFlags: ['dehydration', 'sepsis'],
    associatedSymptoms: ['nausea', 'vomiting', 'abdominal_cramps', 'fever'],
    typicalDescription: 'Acute watery diarrhea with vomiting and cramps, self-limited over 3-7 days. Most common cause of acute diarrhea worldwide.',
  },
  {
    diseaseId: 'bacterial_enteritis', diseaseName: 'Bacterial Enteritis (Salmonella, Shigella, Campylobacter, E. coli)', icdCode: 'A04.9',
    category: 'acute_infectious', typicalDuration: 'acute_days',
    stoolCharacter: ['Watery', 'Bloody', 'Mucoid'],
    nocturnal: false, fastingImproves: true,
    ageRange: [1, 80], agePeak: [1, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['food_poisoning', 'travel', 'poultry', 'unpasteurized_dairy', 'antibiotic_use'],
    redFlags: ['bloody_diarrhea', 'severe_dehydration', 'huss', 'toxic_megacolon'],
    associatedSymptoms: ['fever', 'abdominal_cramps', 'tenesmus', 'bloody_stool'],
    typicalDescription: 'Acute diarrhea with fever, bloody/mucoid stool, and tenesmus. Shigella causes dysentery. EHEC can cause HUS.',
  },
  {
    diseaseId: 'travelers_diarrhea', diseaseName: 'Travelers\' Diarrhea (ETEC)', icdCode: 'A09',
    category: 'acute_infectious', typicalDuration: 'acute_days',
    stoolCharacter: ['Watery', 'Loose'],
    nocturnal: false, fastingImproves: true,
    ageRange: [1, 80], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['travel_to_endemic', 'contaminated_food_water', 'low_hygiene'],
    redFlags: ['bloody_diarrhea', 'severe_dehydration'],
    associatedSymptoms: ['cramps', 'nausea', 'bloating'],
    typicalDescription: 'Acute watery diarrhea in traveler returning from endemic area. Usually self-limited but may need antibiotics.',
  },
  {
    diseaseId: 'clostridioides_difficile', diseaseName: 'Clostridioides Difficile Colitis', icdCode: 'A04.7',
    category: 'acute_infectious', typicalDuration: 'acute_days',
    stoolCharacter: ['Watery', 'Mucoid', 'Bloody'],
    nocturnal: true, fastingImproves: false,
    ageRange: [1, 90], agePeak: [40, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['antibiotic_use', 'hospitalization', 'immunosuppression', 'ppi_use', 'age_65'],
    redFlags: ['toxic_megacolon', 'sepsis', 'colectomy'],
    associatedSymptoms: ['fever', 'abdominal_pain', 'leucocytosis'],
    typicalDescription: 'Watery diarrhea following antibiotic use. Foul-smelling stool. Can progress to pseudomembranous colitis and toxic megacolon.',
  },
  {
    diseaseId: 'ulcerative_colitis_diarrhea', diseaseName: 'Ulcerative Colitis (Active Flare)', icdCode: 'K51.9',
    category: 'chronic_inflammatory', typicalDuration: 'chronic_months',
    stoolCharacter: ['Bloody', 'Mucoid', 'Frequent_small_volume'],
    nocturnal: true, fastingImproves: false,
    ageRange: [15, 70], agePeak: [20, 45],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['family_history', 'non_smoker', 'jewish_ancestry'],
    redFlags: ['toxic_megacolon', 'massive_hemorrhage', 'colorectal_cancer'],
    associatedSymptoms: ['rectal_bleeding', 'tenesmus', 'urgency', 'abdominal_pain', 'fever'],
    typicalDescription: 'Chronic relapsing bloody diarrhea with mucus, tenesmus, and urgency. Continuous colonic inflammation from rectum proximally.',
  },
  {
    diseaseId: 'crohn_disease_diarrhea', diseaseName: 'Crohn Disease (Active Flare)', icdCode: 'K50.9',
    category: 'chronic_inflammatory', typicalDuration: 'chronic_months',
    stoolCharacter: ['Loose', 'Frequent', 'Non_bloody'],
    nocturnal: true, fastingImproves: false,
    ageRange: [10, 60], agePeak: [15, 35],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['family_history', 'smoking', 'jewish_ancestry'],
    redFlags: ['obstruction', 'fistula', 'abscess', 'malnutrition'],
    associatedSymptoms: ['abdominal_pain', 'weight_loss', 'fever', 'perianal_fistula', 'fatigue'],
    typicalDescription: 'Chronic non-bloody diarrhea with RLQ pain, weight loss, and perianal disease. Skip lesions with transmural inflammation.',
  },
  {
    diseaseId: 'irritable_bowel_syndrome_diarrhea', diseaseName: 'Irritable Bowel Syndrome — Diarrhea (IBS-D)', icdCode: 'K58.0',
    category: 'motility', typicalDuration: 'chronic_months',
    stoolCharacter: ['Loose', 'Frequent', 'Urgency'],
    nocturnal: false, fastingImproves: true,
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.08,
    riskFactors: ['stress', 'anxiety', 'food_intolerance', 'post_infectious'],
    redFlags: [],
    associatedSymptoms: ['abdominal_pain', 'bloating', 'urgency', 'mucus'],
    typicalDescription: 'Chronic intermittent diarrhea with abdominal pain relieved by defecation. No nocturnal symptoms. Rome IV criteria apply.',
  },
  {
    diseaseId: 'celiac_disease', diseaseName: 'Celiac Disease', icdCode: 'K90.0',
    category: 'malabsorptive', typicalDuration: 'chronic_months',
    stoolCharacter: ['Bulky', 'Foul', 'Greasy', 'Floating'],
    nocturnal: false, fastingImproves: false,
    ageRange: [1, 70], agePeak: [20, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    riskFactors: ['family_history', 'autoimmune_disease', 'down_syndrome', 'type_1_diabetes'],
    redFlags: ['malnutrition', 'lymphoma'],
    associatedSymptoms: ['weight_loss', 'bloating', 'fatigue', 'anemia', 'dermatitis_herpetiformis'],
    typicalDescription: 'Chronic diarrhea with steatorrhea, weight loss, and bloating triggered by gluten. Associated with dermatitis herpetiformis.',
  },
  {
    diseaseId: 'bile_acid_malabsorption', diseaseName: 'Bile Acid Malabsorption', icdCode: 'K90.8',
    category: 'malabsorptive', typicalDuration: 'chronic_months',
    stoolCharacter: ['Watery', 'Yellow', 'Frequent'],
    nocturnal: true, fastingImproves: true,
    ageRange: [20, 80], agePeak: [30, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['ileal_resection', 'crohn_disease', 'cholecystectomy', 'radiation_enteritis'],
    redFlags: [],
    associatedSymptoms: ['urgency', 'nocturnal_diarrhea', 'bloating'],
    typicalDescription: 'Chronic watery diarrhea worse after meals, often following ileal resection or cholecystectomy. Responds to bile acid sequestrants.',
  },
  {
    diseaseId: 'exocrine_pancreatic_insufficiency', diseaseName: 'Exocrine Pancreatic Insufficiency', icdCode: 'K86.8',
    category: 'malabsorptive', typicalDuration: 'chronic_months',
    stoolCharacter: ['Greasy', 'Bulky', 'Foul', 'Pale'],
    nocturnal: false, fastingImproves: false,
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['chronic_pancreatitis', 'cystic_fibrosis', 'pancreatic_cancer', 'pancreatic_surgery'],
    redFlags: ['weight_loss', 'malnutrition'],
    associatedSymptoms: ['steatorrhea', 'weight_loss', 'bloating', 'abdominal_pain'],
    typicalDescription: 'Chronic greasy floating stool with weight loss. History of pancreatitis or pancreatic surgery. Fecal elastase low.',
  },
  {
    diseaseId: 'diabetic_diarrhea', diseaseName: 'Diabetic Enteropathy / Gastroparesis', icdCode: 'E10.42',
    category: 'motility', typicalDuration: 'chronic_months',
    stoolCharacter: ['Watery', 'Nocturnal', 'Variable'],
    nocturnal: true, fastingImproves: false,
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['longstanding_diabetes', 'poor_glycemic_control', 'autonomic_neuropathy'],
    redFlags: ['gastroparesis', 'hypoglycemia_unawareness'],
    associatedSymptoms: ['constipation_alternating', 'nocturnal_diarrhea', 'nausea', 'bloating'],
    typicalDescription: 'Chronic intermittent diarrhea in longstanding diabetic, often nocturnal. Alternates with constipation.',
  },
  {
    diseaseId: 'medication_induced_diarrhea', diseaseName: 'Medication-Induced Diarrhea', icdCode: 'K59.1',
    category: 'drug_induced', typicalDuration: 'acute_days',
    stoolCharacter: ['Loose', 'Watery'],
    nocturnal: false, fastingImproves: true,
    ageRange: [1, 90], agePeak: [20, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['metformin', 'antibiotics', 'nsaid', 'laxatives', 'colchicine', 'ppis', 'ssris'],
    redFlags: ['dehydration'],
    associatedSymptoms: ['nausea', 'cramping'],
    typicalDescription: 'Diarrhea temporally related to medication initiation or dose increase. Metformin and antibiotics are common causes.',
  },
  {
    diseaseId: 'ischemic_colitis_diarrhea', diseaseName: 'Ischemic Colitis', icdCode: 'K55.0',
    category: 'ischemic', typicalDuration: 'acute_days',
    stoolCharacter: ['Bloody', 'Watery'],
    nocturnal: false, fastingImproves: true,
    ageRange: [40, 90], agePeak: [60, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['age', 'hypertension', 'diabetes', 'aortic_surgery', 'hypotension', 'vasculitis'],
    redFlags: ['peritonism', 'gangrene', 'perforation'],
    associatedSymptoms: ['cramping_pain', 'hematochezia', 'urgency'],
    typicalDescription: 'Acute cramping left-sided pain followed by bloody diarrhea. Typically in elderly with vascular risk factors.',
  },
  {
    diseaseId: 'hyperthyroidism_diarrhea', diseaseName: 'Hyperthyroidism (Diarrhea)', icdCode: 'E05.9',
    category: 'motility', typicalDuration: 'chronic_months',
    stoolCharacter: ['Loose', 'Frequent'],
    nocturnal: false, fastingImproves: true,
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.005,
    riskFactors: ['female_sex', 'family_history_thyroid', 'autoimmune_disease'],
    redFlags: ['thyroid_storm', 'cardiac_arrhythmia'],
    associatedSymptoms: ['weight_loss', 'tachycardia', 'heat_intolerance', 'tremor', 'sweating'],
    typicalDescription: 'Chronic loose stools with weight loss, tremor, tachycardia, and heat intolerance. Increased gut motility from hyperthyroidism.',
  },
];

const DIARRHEA_PATTERNS: DiarrheaPatternRule[] = [
  {
    id: 'acute_watery_vomiting', label: 'Acute Watery Diarrhea + Vomiting',
    description: 'Acute watery diarrhea with vomiting and cramps = viral gastroenteritis',
    pattern: ['diarrhea', 'vomiting', 'fever'],
    suggests: ['acute_gastroenteritis', 'bacterial_enteritis', 'travelers_diarrhea'],
    rulesOut: ['ulcerative_colitis_diarrhea', 'celiac_disease', 'crohn_disease_diarrhea'],
    priorityBoost: 20,
  },
  {
    id: 'bloody_diarrhea_tenesmus', label: 'Bloody Diarrhea + Tenesmus',
    description: 'Bloody diarrhea with mucus and tenesmus = inflammatory bowel disease or bacterial dysentery',
    pattern: ['diarrhea', 'tenesmus', 'fever'],
    suggests: ['ulcerative_colitis_diarrhea', 'bacterial_enteritis', 'clostridioides_difficile'],
    rulesOut: ['acute_gastroenteritis', 'celiac_disease', 'irritable_bowel_syndrome_diarrhea'],
    priorityBoost: 25,
  },
  {
    id: 'chronic_nocturnal_diarrhea', label: 'Chronic Nocturnal Diarrhea',
    description: 'Chronic diarrhea that wakes patient from sleep = organic disease (IBD, BAM, diabetic)',
    pattern: ['diarrhea', 'nocturnal_diarrhea'],
    suggests: ['ulcerative_colitis_diarrhea', 'crohn_disease_diarrhea', 'bile_acid_malabsorption', 'diabetic_diarrhea'],
    rulesOut: ['irritable_bowel_syndrome_diarrhea', 'acute_gastroenteritis'],
    priorityBoost: 20,
  },
  {
    id: 'steatorrhea_weight_loss', label: 'Steatorrhea + Weight Loss',
    description: 'Greasy foul stool with weight loss = malabsorption (celiac, EPI, BAM)',
    pattern: ['diarrhea', 'weight_loss', 'bloating'],
    suggests: ['celiac_disease', 'exocrine_pancreatic_insufficiency', 'bile_acid_malabsorption'],
    rulesOut: ['acute_gastroenteritis', 'irritable_bowel_syndrome_diarrhea'],
    priorityBoost: 20,
  },
  {
    id: 'post_antibiotic_diarrhea', label: 'Post-Antibiotic Diarrhea',
    description: 'Diarrhea following antibiotic use = C. difficile until proven',
    pattern: ['diarrhea', 'medication_list'],
    suggests: ['clostridioides_difficile', 'medication_induced_diarrhea'],
    rulesOut: ['acute_gastroenteritis', 'irritable_bowel_syndrome_diarrhea'],
    priorityBoost: 25,
  },
  {
    id: 'ibs_pattern', label: 'IBS Pattern',
    description: 'Chronic abdominal pain relieved by defecation + altered stool without nocturnal = IBS',
    pattern: ['diarrhea', 'abdominal_pain', 'bloating'],
    suggests: ['irritable_bowel_syndrome_diarrhea'],
    rulesOut: ['ulcerative_colitis_diarrhea', 'celiac_disease', 'crohn_disease_diarrhea'],
    priorityBoost: 15,
  },
  {
    id: 'bloody_cramping_pain_elderly', label: 'Cramping Pain + Bloody Diarrhea in Elderly',
    description: 'Acute cramping pain followed by bloody diarrhea in elderly = ischemic colitis',
    pattern: ['diarrhea', 'hematochezia', 'abdominal_pain'],
    suggests: ['ischemic_colitis_diarrhea'],
    rulesOut: ['acute_gastroenteritis', 'irritable_bowel_syndrome_diarrhea'],
    priorityBoost: 25,
  },
  {
    id: 'diabetic_with_diarrhea', label: 'Longstanding Diabetic with Nocturnal Diarrhea',
    description: 'Known diabetic with chronic nocturnal diarrhea = diabetic enteropathy',
    pattern: ['diarrhea', 'nocturnal_diarrhea', 'diabetes'],
    suggests: ['diabetic_diarrhea'],
    rulesOut: ['acute_gastroenteritis', 'celiac_disease'],
    priorityBoost: 20,
  },
  {
    id: 'travel_acute_diarrhea', label: 'Travel-Related Acute Diarrhea',
    description: 'Acute diarrhea in returning traveler = travelers\' diarrhea, bacterial, or parasitic',
    pattern: ['diarrhea', 'recent_travel', 'vomiting'],
    suggests: ['travelers_diarrhea', 'bacterial_enteritis'],
    rulesOut: ['ulcerative_colitis_diarrhea', 'celiac_disease'],
    priorityBoost: 20,
  },
];

export function getDiarrheaDdx(): DiarrheaDisease[] {
  return DIARRHEA_DDX;
}

export function getDiarrheaPatterns(): DiarrheaPatternRule[] {
  return DIARRHEA_PATTERNS;
}

export function classifyDiarrheaType(
  duration: string,
  nocturnal: boolean,
  bloody: boolean,
  weightLoss: boolean,
  fastingImproves: boolean,
): { category: DiarrheaCategory; confidence: 'high' | 'moderate' | 'low' } {
  if (duration === 'acute_days' && !nocturnal) {
    return { category: 'acute_infectious', confidence: 'high' };
  }
  if (nocturnal && !fastingImproves) {
    return { category: 'chronic_inflammatory', confidence: 'moderate' };
  }
  if (weightLoss && !bloody) {
    return { category: 'malabsorptive', confidence: 'moderate' };
  }
  if (nocturnal && fastingImproves) {
    return { category: 'motility', confidence: 'low' };
  }
  return { category: 'acute_infectious', confidence: 'low' };
}

export function getDiarrheaGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const DIARRHEA_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'diarrhea_presence', label: 'Diarrhea Confirmation', features: ['diarrhea'], priority: 85, rationale: 'Confirm diarrhea presence, duration, and severity.', category: 'documentation' },
    { id: 'diarrhea_duration', label: 'Diarrhea Duration', features: ['diarrhea_duration_days', 'chronic_diarrhoea'], priority: 82, rationale: 'Duration is the first discriminator: acute (<14d) vs persistent vs chronic (>30d).', category: 'diagnostic' },
    { id: 'diarrhea_character', label: 'Stool Character', features: ['diarrhea_consistency', 'diarrhea_stool_type'], priority: 80, rationale: 'Watery = secretory. Bloody = inflammatory. Greasy = malabsorptive. Key diagnostic discriminator.', category: 'diagnostic' },
    { id: 'diarrhea_frequency', label: 'Stool Frequency', features: ['diarrhea_frequency'], priority: 75, rationale: 'Frequency guides severity assessment and hydration needs.', category: 'diagnostic' },
    { id: 'diarrhea_nocturnal', label: 'Nocturnal Diarrhea', features: ['diarrhea_nocturnal'], priority: 80, rationale: 'Nocturnal diarrhea = organic disease (IBD, BAM, diabetic). Absent in IBS.', category: 'diagnostic' },
    { id: 'diarrhea_blood', label: 'Blood in Stool', features: ['hematochezia', 'diarrhea_mucus'], priority: 90, rationale: 'RED FLAG: Bloody diarrhea = dysentery, IBD, or ischemic colitis.', category: 'life_threatening' },
    { id: 'diarrhea_weight_loss', label: 'Weight Loss', features: ['weight_loss', 'diarrhea_weight_loss'], priority: 80, rationale: 'Weight loss with chronic diarrhea = malabsorption, IBD, or malignancy.', category: 'diagnostic' },
    { id: 'diarrhea_dehydration', label: 'Dehydration Assessment', features: ['diarrhea_dehydration', 'fatigue', 'syncope'], priority: 90, rationale: 'Assess hydration status — severe dehydration requires IV fluids.', category: 'life_threatening' },
    { id: 'diarrhea_fever', label: 'Fever with Diarrhea', features: ['fever', 'diarrhoea_fever', 'fever_chills'], priority: 85, rationale: 'Fever + diarrhea = infection, IBD flare, or ischemic colitis.', category: 'diagnostic' },
    { id: 'diarrhea_travel', label: 'Travel / Antibiotic History', features: ['recent_travel', 'medication_list'], priority: 75, rationale: 'Travel history and antibiotic use are critical for infectious diarrhea workup.', category: 'risk_factor' },
    { id: 'diarrhea_fasting', label: 'Fasting Relationship', features: ['diarrhea_relation_to_food', 'diarrhea_improves_fasting'], priority: 60, rationale: 'Diarrhea that improves with fasting = osmotic/motility. No change = secretory or inflammatory.', category: 'diagnostic' },
    { id: 'diarrhea_family', label: 'Family History of IBD', features: ['family_history_gi_cancer'], priority: 55, rationale: 'Family history of IBD increases probability of Crohn or UC.', category: 'risk_factor' },
  ];

  for (const def of DIARRHEA_GAP_DEFS) {
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
          groupLabel: 'Diarrhea Assessment',
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
            groupLabel: 'Diarrhea Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getDiarrheaPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of DIARRHEA_PATTERNS) {
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
          reasonEssential: `Diarrhea pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedDiarrheaPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of DIARRHEA_DDX) {
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
