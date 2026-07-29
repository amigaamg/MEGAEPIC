import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type DyspneaCategory = 'cardiac' | 'pulmonary' | 'vascular' | 'anemia' | 'metabolic' | 'neuromuscular' | 'psychogenic' | 'other';
type DyspneaOnset = 'sudden_minutes' | 'acute_hours' | 'subacute_days' | 'chronic_weeks' | 'chronic_months';

interface DyspneaDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: DyspneaCategory;
  typicalOnset: DyspneaOnset;
  orthopnea: boolean;
  pnd: boolean;
  exertional: boolean;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface DyspneaPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const DYSPNEA_DDX: DyspneaDisease[] = [
  {
    diseaseId: 'acute_pulmonary_edema', diseaseName: 'Acute Pulmonary Edema / Heart Failure', icdCode: 'I50.1',
    category: 'cardiac', typicalOnset: 'acute_hours',
    orthopnea: true, pnd: true, exertional: true,
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.02,
    riskFactors: ['hypertension', 'cad', 'valvular_disease', 'cardiomyopathy', 'alcohol', 'chemotherapy'],
    redFlags: ['cardiogenic_shock', 'respiratory_failure'],
    associatedSymptoms: ['orthopnea', 'pnd', 'leg_swelling', 'cough_pink_sputum', 'fatigue'],
    typicalDescription: 'Acute onset of severe dyspnea with orthopnea, PND, and pink frothy sputum. Bilateral crackles and raised JVP on exam.',
  },
  {
    diseaseId: 'copd_exacerbation_dyspnea', diseaseName: 'COPD Exacerbation', icdCode: 'J44.1',
    category: 'pulmonary', typicalOnset: 'acute_hours',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [40, 90], agePeak: [55, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.05,
    riskFactors: ['smoking', 'chronic_bronchitis', 'emphysema'],
    redFlags: ['respiratory_failure', 'hypercapnic_coma'],
    associatedSymptoms: ['cough', 'sputum', 'wheeze', 'cyanosis'],
    typicalDescription: 'Increased dyspnea, cough, and sputum in known COPD patient. Barrel chest, prolonged expiration, and wheeze on exam.',
  },
  {
    diseaseId: 'asthma_exacerbation_dyspnea', diseaseName: 'Acute Asthma Exacerbation', icdCode: 'J45.9',
    category: 'pulmonary', typicalOnset: 'acute_hours',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [1, 70], agePeak: [5, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['known_asthma', 'allergens', 'exercise', 'infection', 'nsaid'],
    redFlags: ['silent_chest', 'cyanosis', 'exhaustion', 'bradycardia'],
    associatedSymptoms: ['wheeze', 'cough', 'chest_tightness', 'tachypnea'],
    typicalDescription: 'Episodic dyspnea with wheeze, cough, and chest tightness. Prolonged expiration and diffuse wheeze on exam.',
  },
  {
    diseaseId: 'pneumonia_dyspnea', diseaseName: 'Pneumonia (Dyspnea-Predominant)', icdCode: 'J18.9',
    category: 'pulmonary', typicalOnset: 'acute_hours',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [0, 90], agePeak: [1, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['age', 'smoking', 'immunosuppression', 'chronic_lung_disease'],
    redFlags: ['hypoxia', 'hypotension', 'confusion'],
    associatedSymptoms: ['fever', 'cough', 'sputum', 'pleuritic_pain'],
    typicalDescription: 'Dyspnea with fever, productive cough, and localized chest findings. Bronchial breathing and crackles on exam.',
  },
  {
    diseaseId: 'pulmonary_embolism_dyspnea', diseaseName: 'Pulmonary Embolism (Dyspnea)', icdCode: 'I26.9',
    category: 'vascular', typicalOnset: 'sudden_minutes',
    orthopnea: false, pnd: false, exertional: false,
    ageRange: [15, 90], agePeak: [40, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['surgery', 'immobilization', 'cancer', 'pregnancy', 'ocp'],
    redFlags: ['massive_pe', 'hypotension', 'syncope'],
    associatedSymptoms: ['pleuritic_pain', 'tachypnea', 'hemoptysis', 'syncope'],
    typicalDescription: 'Sudden onset dyspnea often with pleuritic chest pain and tachypnea. Risk factors for VTE. Wells criteria guide probability.',
  },
  {
    diseaseId: 'pneumothorax_dyspnea', diseaseName: 'Spontaneous Pneumothorax', icdCode: 'J93.1',
    category: 'pulmonary', typicalOnset: 'sudden_minutes',
    orthopnea: false, pnd: false, exertional: false,
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['tall_thin', 'smoking', 'marfan', 'copd', 'mechanical_ventilation'],
    redFlags: ['tension_pneumothorax', 'hypotension'],
    associatedSymptoms: ['pleuritic_pain', 'decreased_breath_sounds'],
    typicalDescription: 'Sudden dyspnea with unilateral pleuritic chest pain. Hyperresonance and decreased breath sounds on affected side.',
  },
  {
    diseaseId: 'anemia_dyspnea', diseaseName: 'Severe Anemia (Dyspnea)', icdCode: 'D64.9',
    category: 'anemia', typicalOnset: 'subacute_days',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [1, 90], agePeak: [20, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['menorrhagia', 'gi_bleed', 'malnutrition', 'chronic_disease', 'hemolysis'],
    redFlags: ['hemodynamic_instability', 'cardiac_failure'],
    associatedSymptoms: ['fatigue', 'pallor', 'palpitations', 'lightheadedness'],
    typicalDescription: 'Exertional dyspnea with fatigue, pallor, and palpitations. Hemoglobin low with compensatory tachycardia.',
  },
  {
    diseaseId: 'pulmonary_fibrosis', diseaseName: 'Pulmonary Fibrosis / ILD', icdCode: 'J84.1',
    category: 'pulmonary', typicalOnset: 'chronic_months',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [40, 90], agePeak: [50, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['smoking', 'occupational_exposure', 'connective_tissue_disease', 'radiation', 'drugs'],
    redFlags: ['respiratory_failure', 'pulmonary_hypertension'],
    associatedSymptoms: ['dry_cough', 'fatigue', 'clubbing', 'fine_crackles'],
    typicalDescription: 'Progressive exertional dyspnea with dry cough over months to years. Velcro crackles on auscultation. Honeycombing on HRCT.',
  },
  {
    diseaseId: 'pleural_effusion_dyspnea', diseaseName: 'Pleural Effusion (Large)', icdCode: 'J90',
    category: 'pulmonary', typicalOnset: 'subacute_days',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [20, 90], agePeak: [40, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['heart_failure', 'pneumonia', 'malignancy', 'pulmonary_embolism', 'tuberculosis'],
    redFlags: ['massive_effusion', 'tamponade', 'empyema'],
    associatedSymptoms: ['pleuritic_pain', 'cough', 'decreased_breath_sounds'],
    typicalDescription: 'Dyspnea with dullness to percussion and decreased breath sounds on affected side. Large effusions cause mediastinal shift.',
  },
  {
    diseaseId: 'metabolic_acidosis_dyspnea', diseaseName: 'Metabolic Acidosis (Kussmaul Breathing)', icdCode: 'E87.2',
    category: 'metabolic', typicalOnset: 'acute_hours',
    orthopnea: false, pnd: false, exertional: false,
    ageRange: [1, 80], agePeak: [10, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['diabetes', 'renal_failure', 'sepsis', 'salicylate_overdose', 'alcohol'],
    redFlags: ['coma', 'cardiac_arrhythmia', 'hypotension'],
    associatedSymptoms: ['kussmaul_respirations', 'confusion', 'vomiting', 'abdominal_pain'],
    typicalDescription: 'Deep rapid breathing (Kussmaul) as compensation for metabolic acidosis. Most commonly DKA in diabetics.',
  },
  {
    diseaseId: 'panic_attack_dyspnea', diseaseName: 'Panic Attack / Anxiety (Dyspnea)', icdCode: 'F41.0',
    category: 'psychogenic', typicalOnset: 'sudden_minutes',
    orthopnea: false, pnd: false, exertional: false,
    ageRange: [15, 60], agePeak: [20, 45],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['anxiety_disorder', 'stress', 'depression', 'trauma'],
    redFlags: [],
    associatedSymptoms: ['palpitations', 'chest_tightness', 'paresthesias', 'dizziness', 'fear'],
    typicalDescription: 'Episodic dyspnea with palpitations, chest tightness, and paresthesias. Normal oxygen saturation and chest exam.',
  },
  {
    diseaseId: 'myasthenia_gravis', diseaseName: 'Myasthenia Gravis (Respiratory Weakness)', icdCode: 'G70.0',
    category: 'neuromuscular', typicalOnset: 'chronic_weeks',
    orthopnea: false, pnd: false, exertional: true,
    ageRange: [15, 80], agePeak: [20, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.001,
    riskFactors: ['thymoma', 'autoimmune_disease', 'female_sex'],
    redFlags: ['myasthenic_crisis', 'respiratory_failure'],
    associatedSymptoms: ['ptosis', 'diplopia', 'dysphagia', 'proximal_weakness', 'fatigability'],
    typicalDescription: 'Fluctuating dyspnea with ptosis, diplopia, and proximal weakness worse at end of day. Improves with rest.',
  },
  {
    diseaseId: 'postnasal_drip_dyspnea', diseaseName: 'Upper Airway / Postnasal Drip', icdCode: 'R09.8',
    category: 'pulmonary', typicalOnset: 'subacute_days',
    orthopnea: false, pnd: false, exertional: false,
    ageRange: [5, 80], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['allergies', 'sinusitis', 'gerd'],
    redFlags: [],
    associatedSymptoms: ['nasal_congestion', 'sore_throat', 'cough', 'throat_clearing'],
    typicalDescription: 'Dyspnea sensation due to nasal congestion and postnasal drip. Normal oxygen saturation and chest exam.',
  },
];

const DYSPNEA_PATTERNS: DyspneaPatternRule[] = [
  {
    id: 'sudden_dyspnea_pleuritic', label: 'Sudden Dyspnea + Pleuritic Chest Pain',
    description: 'Sudden onset dyspnea with pleuritic pain = PE or pneumothorax',
    pattern: ['dyspnea', 'chest_pain', 'pain_onset'],
    suggests: ['pulmonary_embolism_dyspnea', 'pneumothorax_dyspnea'],
    rulesOut: ['copd_exacerbation_dyspnea', 'anemia_dyspnea', 'panic_attack_dyspnea'],
    priorityBoost: 35,
  },
  {
    id: 'orthopnea_pnd', label: 'Dyspnea + Orthopnea + PND',
    description: 'Dyspnea with orthopnea and paroxysmal nocturnal dyspnea = heart failure',
    pattern: ['dyspnea', 'leg_swelling', 'cough'],
    suggests: ['acute_pulmonary_edema'],
    rulesOut: ['copd_exacerbation_dyspnea', 'pneumothorax_dyspnea', 'anemia_dyspnea'],
    priorityBoost: 30,
  },
  {
    id: 'wheeze_dyspnea', label: 'Dyspnea + Wheeze',
    description: 'Dyspnea with wheeze = asthma or COPD exacerbation',
    pattern: ['dyspnea', 'cough', 'wheeze'],
    suggests: ['asthma_exacerbation_dyspnea', 'copd_exacerbation_dyspnea'],
    rulesOut: ['acute_pulmonary_edema', 'pulmonary_embolism_dyspnea', 'pneumothorax_dyspnea'],
    priorityBoost: 20,
  },
  {
    id: 'dyspnea_fever_cough', label: 'Dyspnea + Fever + Productive Cough',
    description: 'Dyspnea with fever and productive cough = pneumonia',
    pattern: ['dyspnea', 'fever', 'cough'],
    suggests: ['pneumonia_dyspnea'],
    rulesOut: ['asthma_exacerbation_dyspnea', 'acute_pulmonary_edema'],
    priorityBoost: 20,
  },
  {
    id: 'dyspnea_pallor_fatigue', label: 'Dyspnea + Pallor + Fatigue',
    description: 'Exertional dyspnea with pallor and fatigue = anemia',
    pattern: ['dyspnea', 'fatigue', 'palpitations'],
    suggests: ['anemia_dyspnea'],
    rulesOut: ['pulmonary_embolism_dyspnea', 'acute_pulmonary_edema'],
    priorityBoost: 15,
  },
  {
    id: 'dyspnea_paresthesias', label: 'Dyspnea + Paresthesias + Palpitations',
    description: 'Dyspnea with paresthesias and palpitations without hypoxia = panic attack',
    pattern: ['dyspnea', 'palpitations', 'numbness_tingling'],
    suggests: ['panic_attack_dyspnea'],
    rulesOut: ['pulmonary_embolism_dyspnea', 'acute_pulmonary_edema'],
    priorityBoost: 10,
  },
  {
    id: 'chronic_progressive_dyspnea', label: 'Chronic Progressive Exertional Dyspnea',
    description: 'Slowly progressive exertional dyspnea with dry cough = ILD/pulmonary fibrosis',
    pattern: ['dyspnea', 'cough', 'fatigue'],
    suggests: ['pulmonary_fibrosis', 'pleural_effusion_dyspnea'],
    rulesOut: ['asthma_exacerbation_dyspnea', 'acute_pulmonary_edema'],
    priorityBoost: 15,
  },
  {
    id: 'kussmaul_dyspnea', label: 'Dyspnea with Deep Rapid Breathing',
    description: 'Deep rapid breathing (Kussmaul) = metabolic acidosis (DKA, renal failure)',
    pattern: ['dyspnea', 'diabetes', 'vomiting'],
    suggests: ['metabolic_acidosis_dyspnea'],
    rulesOut: ['asthma_exacerbation_dyspnea', 'pneumonia_dyspnea', 'panic_attack_dyspnea'],
    priorityBoost: 25,
  },
  {
    id: 'dyspnea_ptosis_diplopia', label: 'Dyspnea + Ptosis + Diplopia',
    description: 'Dyspnea with ptosis, diplopia, and proximal weakness = myasthenia gravis',
    pattern: ['dyspnea', 'fatigue', 'proximal_muscle_weakness'],
    suggests: ['myasthenia_gravis'],
    rulesOut: ['copd_exacerbation_dyspnea', 'anemia_dyspnea', 'panic_attack_dyspnea'],
    priorityBoost: 20,
  },
  {
    id: 'post_surgery_dyspnea_pe', label: 'Post-Surgery Dyspnea',
    description: 'Recent surgery + dyspnea = pulmonary embolism until proven',
    pattern: ['dyspnea', 'prior_abdominal_surgery', 'chest_pain'],
    suggests: ['pulmonary_embolism_dyspnea'],
    rulesOut: ['asthma_exacerbation_dyspnea', 'panic_attack_dyspnea'],
    priorityBoost: 30,
  },
];

export function getDyspneaDdx(): DyspneaDisease[] {
  return DYSPNEA_DDX;
}

export function getDyspneaPatterns(): DyspneaPatternRule[] {
  return DYSPNEA_PATTERNS;
}

export function getDyspneaGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const DYSPNEA_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'dyspnea_presence', label: 'Dyspnea Confirmation', features: ['dyspnea'], priority: 95, rationale: 'Confirm dyspnea onset, severity, and progression.', category: 'life_threatening' },
    { id: 'dyspnea_onset', label: 'Dyspnea Onset', features: ['pain_onset', 'dyspnea_sudden'], priority: 90, rationale: 'Sudden dyspnea = PE, pneumothorax, or panic. Gradual = HF, COPD, or ILD.', category: 'diagnostic' },
    { id: 'dyspnea_positional', label: 'Orthopnea and PND', features: ['orthopnea', 'pnd'], priority: 85, rationale: 'Orthopnea and PND = heart failure until proven. Hallmark of cardiogenic dyspnea.', category: 'diagnostic' },
    { id: 'dyspnea_exertional', label: 'Exertional Component', features: ['dyspnea_on_exertion'], priority: 75, rationale: 'Exertional dyspnea = cardiac, pulmonary, or anemia. Helps distinguish from psychogenic.', category: 'diagnostic' },
    { id: 'dyspnea_chest_pain', label: 'Associated Chest Pain', features: ['chest_pain', 'pleuritic_pain'], priority: 85, rationale: 'Chest pain + dyspnea = PE, pneumothorax, or ACS. Pleuritic = PE or pneumothorax.', category: 'life_threatening' },
    { id: 'dyspnea_cough_sputum', label: 'Cough and Sputum', features: ['cough', 'cough_sputum', 'sputum_character'], priority: 80, rationale: 'Dry cough = ILD or HF. Productive = pneumonia or COPD. Pink frothy = pulmonary edema.', category: 'diagnostic' },
    { id: 'dyspnea_wheeze', label: 'Wheeze', features: ['wheeze'], priority: 75, rationale: 'Wheeze = asthma or COPD exacerbation. Absent wheeze does not rule out COPD.', category: 'diagnostic' },
    { id: 'dyspnea_leg_swelling', label: 'Leg Swelling / Edema', features: ['leg_swelling', 'peripheral_oedema'], priority: 80, rationale: 'Leg edema with dyspnea = heart failure. Also consider PE with DVT.', category: 'diagnostic' },
    { id: 'dyspnea_fever', label: 'Fever with Dyspnea', features: ['fever', 'fever_chills'], priority: 80, rationale: 'Fever + dyspnea = pneumonia, sepsis, or PE. Chills suggest infection.', category: 'life_threatening' },
    { id: 'dyspnea_palpitations', label: 'Palpitations with Dyspnea', features: ['palpitations', 'syncope'], priority: 75, rationale: 'Palpitations + dyspnea = arrhythmia, PE, or panic. Syncope = massive PE or aortic stenosis.', category: 'life_threatening' },
    { id: 'dyspnea_anemia', label: 'Anemia Symptoms', features: ['fatigue', 'pallor'], priority: 65, rationale: 'Fatigue + pallor + exertional dyspnea = anemia. Check hemoglobin.', category: 'diagnostic' },
    { id: 'dyspnea_smoking', label: 'Smoking / Lung Disease History', features: ['smoking', 'cough'], priority: 70, rationale: 'Smoking history = COPD and lung cancer risk. Key for chronic dyspnea assessment.', category: 'risk_factor' },
  ];

  for (const def of DYSPNEA_GAP_DEFS) {
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
          groupLabel: 'Dyspnea Assessment',
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
            groupLabel: 'Dyspnea Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getDyspneaPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of DYSPNEA_PATTERNS) {
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
          reasonEssential: `Dyspnea pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function classifyDyspneaOnset(
  onset: string,
  orthopnea: boolean,
  pnd: boolean,
  wheeze: boolean,
): { likelyCategory: DyspneaCategory; confidence: 'high' | 'moderate' | 'low' } {
  if (orthopnea || pnd) {
    return { likelyCategory: 'cardiac', confidence: 'high' };
  }
  if (onset.includes('sudden') || onset.includes('minute')) {
    return { likelyCategory: 'vascular', confidence: 'moderate' };
  }
  if (wheeze) {
    return { likelyCategory: 'pulmonary', confidence: 'moderate' };
  }
  return { likelyCategory: 'pulmonary', confidence: 'low' };
}

export function getBiodataAdjustedDyspneaPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of DYSPNEA_DDX) {
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
