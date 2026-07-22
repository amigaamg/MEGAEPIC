// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Cough Clinical Reasoning Engine
// Mechanism-based reasoning for acute cough (<3 weeks) in adults
//
// Symptom → Mechanism → Phenotype → Syndrome → Differential → Probability
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';

// ── Mechanisms ────────────────────────────────────────────────────────────

export type CoughMechanism =
  | 'airway_irritation'
  | 'airway_inflammation'
  | 'alveolar_disease'
  | 'pleural_disease'
  | 'pulmonary_vascular'
  | 'cardiac_congestion'
  | 'aspiration'
  | 'mechanical_obstruction'
  | 'environmental_toxic'
  | 'upper_airway_syndrome';

interface MechanismDef {
  id: CoughMechanism;
  label: string;
  dryCough: boolean;
  productiveCough: boolean;
  diseases: string[];
  phenotypeFeatures: string[];
  redFlags: string[];
}

const MECHANISMS: MechanismDef[] = [
  {
    id: 'airway_irritation',
    label: 'Airway Irritation',
    dryCough: true,
    productiveCough: false,
    diseases: ['viral_urti', 'early_covid', 'ace_inhibitor_cough', 'gerd_cough', 'postnasal_drip_cough'],
    phenotypeFeatures: ['dry_cough', 'tickling_sensation', 'minimal_constitutional', 'normal_chest_exam'],
    redFlags: [],
  },
  {
    id: 'airway_inflammation',
    label: 'Airway Inflammation/Bronchospasm',
    dryCough: true,
    productiveCough: true,
    diseases: ['acute_bronchitis', 'asthma_exacerbation', 'copd_exacerbation', 'allergic_bronchitis'],
    phenotypeFeatures: ['dry_initially', 'may_become_productive', 'diffuse_wheeze', 'chest_tightness', 'dyspnea', 'prolonged_expiration'],
    redFlags: ['silent_chest', 'severe_dyspnea'],
  },
  {
    id: 'alveolar_disease',
    label: 'Alveolar Disease (Pneumonia)',
    dryCough: false,
    productiveCough: true,
    diseases: ['community_acquired_pneumonia', 'aspiration_pneumonia', 'hospital_acquired_pneumonia', 'covid_pneumonia', 'fungal_pneumonia', 'atypical_pneumonia', 'pulmonary_edema_mimic'],
    phenotypeFeatures: ['productive_cough', 'fever', 'pleuritic_pain', 'dyspnea', 'tachypnea', 'localized_chest_findings'],
    redFlags: ['hypoxia', 'confusion', 'hypotension', 'rr_above_30'],
  },
  {
    id: 'pleural_disease',
    label: 'Pleural Disease',
    dryCough: true,
    productiveCough: false,
    diseases: ['pleural_effusion', 'empyema', 'pneumothorax', 'pleurisy'],
    phenotypeFeatures: ['sharp_pain', 'pain_worsens_breathing', 'reduced_breath_sounds', 'stony_dullness_or_hyperresonance', 'little_sputum'],
    redFlags: ['tension_pneumothorax', 'massive_effusion'],
  },
  {
    id: 'pulmonary_vascular',
    label: 'Pulmonary Vascular Disease',
    dryCough: true,
    productiveCough: false,
    diseases: ['pulmonary_embolism', 'pulmonary_infarction', 'pulmonary_hypertension_crisis'],
    phenotypeFeatures: ['acute_onset', 'dyspnea', 'pleuritic_pain', 'small_hemoptysis', 'risk_factors', 'normal_cxr'],
    redFlags: ['massive_pe', 'hemodynamic_instability'],
  },
  {
    id: 'cardiac_congestion',
    label: 'Cardiac Congestion',
    dryCough: true,
    productiveCough: true,
    diseases: ['heart_failure', 'acute_pulmonary_edema', 'mitral_stenosis'],
    phenotypeFeatures: ['orthopnea', 'pnd', 'pink_frothy_sputum', 'basal_crackles', 'leg_edema', 'raised_jvp'],
    redFlags: ['acute_pulmonary_edema', 'cardiogenic_shock'],
  },
  {
    id: 'aspiration',
    label: 'Aspiration',
    dryCough: false,
    productiveCough: true,
    diseases: ['aspiration_pneumonitis', 'aspiration_pneumonia'],
    phenotypeFeatures: ['stroke_history', 'alcohol_intoxication', 'seizure', 'reduced_consciousness', 'dysphagia', 'gerd', 'tube_feeding'],
    redFlags: ['complete_airway_obstruction'],
  },
  {
    id: 'mechanical_obstruction',
    label: 'Mechanical Obstruction',
    dryCough: true,
    productiveCough: false,
    diseases: ['foreign_body', 'bronchogenic_carcinoma', 'endobronchial_tumor', 'large_mucus_plug'],
    phenotypeFeatures: ['sudden_cough', 'unilateral_wheeze', 'recurrent_pneumonia', 'persistent_collapse'],
    redFlags: ['complete_airway_obstruction', 'massive_hemoptysis'],
  },
  {
    id: 'environmental_toxic',
    label: 'Environmental/Toxic Exposure',
    dryCough: true,
    productiveCough: false,
    diseases: ['smoke_inhalation', 'chemical_exposure', 'dust_exposure', 'cold_air_cough'],
    phenotypeFeatures: ['exposure_history', 'dry_cough', 'irritation', 'normal_exam'],
    redFlags: [],
  },
  {
    id: 'upper_airway_syndrome',
    label: 'Upper Airway Syndrome',
    dryCough: true,
    productiveCough: false,
    diseases: ['rhinitis', 'sinusitis', 'postnasal_drip', 'laryngitis'],
    phenotypeFeatures: ['throat_clearing', 'nasal_symptoms', 'night_cough', 'no_chest_findings'],
    redFlags: [],
  },
];

// ── Sputum Character Interpretation ──────────────────────────────────────

interface SputumChar {
  character: string;
  suggests: string[];
  weight: number;
}

const SPUTUM_CHARACTERS: SputumChar[] = [
  { character: 'white', suggests: ['viral_urti', 'asthma', 'early_infection'], weight: 1 },
  { character: 'yellow', suggests: ['bacterial_infection', 'acute_bronchitis'], weight: 2 },
  { character: 'green', suggests: ['bacterial_pneumonia', 'bronchiectasis', 'copd_exacerbation'], weight: 3 },
  { character: 'rust', suggests: ['pneumococcal_pneumonia'], weight: 5 },
  { character: 'currant_jelly', suggests: ['klebsiella_pneumonia'], weight: 5 },
  { character: 'foul_smelling', suggests: ['anaerobic_infection', 'lung_abscess', 'aspiration'], weight: 4 },
  { character: 'blood', suggests: ['tuberculosis', 'pulmonary_embolism', 'lung_cancer', 'bronchiectasis', 'pneumonia'], weight: 5 },
  { character: 'pink_frothy', suggests: ['pulmonary_edema', 'heart_failure'], weight: 5 },
];

// ── Mechanism → Phenotype Recognition ───────────────────────────────────

export interface CoughPhenotype {
  dry: boolean;
  productive: boolean;
  sputumCharacter: string | null;
  mechanism: CoughMechanism | null;
  mechanismProbability: Record<CoughMechanism, number>;
}

export function recognizeCoughPhenotype(state: EncounterBrainState): CoughPhenotype {
  const isDry = !!state.symptoms['dry_cough']?.attributes?.present?.value;
  const isProductive = !!state.symptoms['productive_cough']?.attributes?.present?.value;
  const sputumChar = state.symptoms['sputum_character']?.attributes?.character?.value as string | null;

  const mechanismProbability: Record<CoughMechanism, number> = {
    airway_irritation: 0.1,
    airway_inflammation: 0.1,
    alveolar_disease: 0.1,
    pleural_disease: 0.05,
    pulmonary_vascular: 0.05,
    cardiac_congestion: 0.05,
    aspiration: 0.05,
    mechanical_obstruction: 0.03,
    environmental_toxic: 0.02,
    upper_airway_syndrome: 0.1,
  };

  if (isDry) {
    mechanismProbability.airway_irritation = 0.25;
    mechanismProbability.upper_airway_syndrome = 0.2;
    mechanismProbability.environmental_toxic = 0.1;
    mechanismProbability.airway_inflammation = 0.15;
    mechanismProbability.alveolar_disease = 0.05;
  }

  if (isProductive) {
    mechanismProbability.alveolar_disease = 0.3;
    mechanismProbability.airway_inflammation = 0.2;
    mechanismProbability.aspiration = 0.1;
    mechanismProbability.airway_irritation = 0.05;
  }

  if (sputumChar) {
    const match = SPUTUM_CHARACTERS.find(s => s.character === sputumChar);
    if (match) {
      if (match.suggests.includes('pneumococcal_pneumonia') || match.suggests.includes('klebsiella_pneumonia')) {
        mechanismProbability.alveolar_disease = 0.6;
      }
      if (match.suggests.includes('heart_failure') || match.suggests.includes('pulmonary_edema')) {
        mechanismProbability.cardiac_congestion = 0.6;
      }
      if (match.suggests.includes('tuberculosis') || match.suggests.includes('pulmonary_embolism')) {
        mechanismProbability.pulmonary_vascular = 0.3;
      }
    }
  }

  let dominantMechanism: CoughMechanism = 'airway_irritation';
  let highestProb = 0;
  for (const [mech, prob] of Object.entries(mechanismProbability)) {
    if (prob > highestProb) {
      highestProb = prob;
      dominantMechanism = mech as CoughMechanism;
    }
  }

  return {
    dry: isDry,
    productive: isProductive,
    sputumCharacter: sputumChar,
    mechanism: dominantMechanism,
    mechanismProbability,
  };
}

// ── Information Gap Generation ───────────────────────────────────────────

export function getCoughMechanismGaps(state: EncounterBrainState): InformationGap[] {
  const gaps: InformationGap[] = [];
  const phenotype = recognizeCoughPhenotype(state);

  if (!state.symptoms['cough_duration'] && !state.symptoms['cough_onset']) {
    gaps.push({
      featureId: 'cough_duration',
      priorityScore: 50,
      reasonEssential: 'Duration is the first discriminator: acute (<3 weeks) vs chronic (>8 weeks) cough.',
      label: 'Cough timeline',
      category: 'diagnostic',
      type: 'text',
    });
  }

  if (!state.symptoms['cough_character']) {
    gaps.push({
      featureId: 'cough_character',
      priorityScore: 45,
      reasonEssential: 'Dry vs productive is the highest-yield phenotypic split.',
      label: 'Cough character',
      category: 'diagnostic',
      type: 'text',
    });
  }

  if (phenotype.productive && !state.symptoms['sputum_character']) {
    gaps.push({
      featureId: 'sputum_character',
      priorityScore: 40,
      reasonEssential: 'Sputum colour and character dramatically alter probabilities: yellow/green=bacterial, rust=pneumococcal, currant jelly=Klebsiella, foul=anaerobes, blood=TB/PE/cancer.',
      label: 'Sputum character',
      category: 'diagnostic',
      type: 'text',
    });
  }

  if (!state.symptoms['fever'] && phenotype.mechanism === 'alveolar_disease') {
    gaps.push({
      featureId: 'fever',
      priorityScore: 38,
      reasonEssential: 'Fever greatly increases pneumonia probability. Its absence argues against alveolar disease.',
      label: 'Fever',
      category: 'diagnostic',
      type: 'boolean',
    });
  }

  if (!state.symptoms['dyspnea'] || !state.symptoms['breathlessness']) {
    const mech = phenotype.mechanism;
    if (mech === 'alveolar_disease' || mech === 'cardiac_congestion' || mech === 'pulmonary_vascular') {
      gaps.push({
        featureId: 'dyspnea',
        priorityScore: 35,
        reasonEssential: 'Dyspnea with cough suggests alveolar, cardiac, or vascular pathology. Its absence supports airway-only disease.',
        label: 'Dyspnea',
        category: 'diagnostic',
        type: 'boolean',
      });
    }
  }

  if (!state.symptoms['chest_pain_pleuritic']) {
    gaps.push({
      featureId: 'chest_pain_pleuritic',
      priorityScore: 30,
      reasonEssential: 'Pleuritic chest pain suggests pneumonia, PE, pleurisy, or pneumothorax — alveolar/pleural/vascular mechanisms.',
      label: 'Pleuritic chest pain',
      category: 'diagnostic',
      type: 'boolean',
    });
  }

  if (!state.symptoms['wheeze'] && (phenotype.mechanism === 'airway_inflammation' || phenotype.dry)) {
    gaps.push({
      featureId: 'wheeze',
      priorityScore: 25,
      reasonEssential: 'Wheeze suggests airway inflammation — asthma, COPD, or bronchitis.',
      label: 'Wheeze',
      category: 'diagnostic',
      type: 'boolean',
    });
  }

  return gaps;
}

// ── Red Flag Detection ───────────────────────────────────────────────────

export interface CoughRedFlag {
  id: string;
  label: string;
  critical: boolean;
  action: string;
}

export function getCoughRedFlags(state: EncounterBrainState & { vitals?: { oxygenSaturation?: number; respiratoryRate?: number; bloodPressureSystolic?: number } }): CoughRedFlag[] {
  const flags: CoughRedFlag[] = [];

  if (state.vitals?.oxygenSaturation !== undefined && state.vitals.oxygenSaturation < 90) {
    flags.push({ id: 'rf_hypoxia', label: 'Hypoxia (SpO2 <90%)', critical: true, action: 'Immediate oxygen therapy. Assess for severe pneumonia, PE, or pulmonary edema.' });
  }

  if (state.vitals?.respiratoryRate !== undefined && state.vitals.respiratoryRate > 30) {
    flags.push({ id: 'rf_tachypnea', label: 'Severe tachypnea (RR >30)', critical: true, action: 'High severity — assess for pneumonia, metabolic acidosis, or PE.' });
  }

  if (state.vitals?.bloodPressureSystolic !== undefined && state.vitals.bloodPressureSystolic < 90) {
    flags.push({ id: 'rf_hypotension', label: 'Hypotension (SBP <90)', critical: true, action: 'Septic or cardiogenic shock until proven otherwise.' });
  }

  if (state.symptoms['hemoptysis']?.attributes?.present?.value) {
    flags.push({ id: 'rf_hemoptysis', label: 'Hemoptysis', critical: false, action: 'Assess volume. Massive hemoptysis = emergency. Consider TB, PE, cancer, bronchiectasis.' });
  }

  if (state.symptoms['confusion']?.attributes?.present?.value) {
    flags.push({ id: 'rf_confusion', label: 'Acute confusion', critical: true, action: 'Sepsis-associated encephalopathy or hypoxia. Urgent assessment.' });
  }

  return flags;
}

// ── Differential Probability Distribution ────────────────────────────────

export interface CoughDiseaseProbability {
  diseaseId: string;
  diseaseName: string;
  mechanism: CoughMechanism;
  probability: number;
  supportingFeatures: string[];
  redFlags: string[];
}

export function computeCoughProbabilities(state: EncounterBrainState): CoughDiseaseProbability[] {
  const phenotype = recognizeCoughPhenotype(state);
  const results: CoughDiseaseProbability[] = [];

  const baseRates: Record<string, { mechanism: CoughMechanism; baseProb: number; name: string }> = {
    viral_urti: { mechanism: 'airway_irritation', baseProb: 0.3, name: 'Viral URTI' },
    acute_bronchitis: { mechanism: 'airway_inflammation', baseProb: 0.15, name: 'Acute Bronchitis' },
    community_acquired_pneumonia: { mechanism: 'alveolar_disease', baseProb: 0.12, name: 'Community-Acquired Pneumonia' },
    asthma_exacerbation: { mechanism: 'airway_inflammation', baseProb: 0.08, name: 'Asthma Exacerbation' },
    copd_exacerbation: { mechanism: 'airway_inflammation', baseProb: 0.06, name: 'COPD Exacerbation' },
    postnasal_drip_cough: { mechanism: 'upper_airway_syndrome', baseProb: 0.06, name: 'Postnasal Drip Syndrome' },
    gerd_cough: { mechanism: 'airway_irritation', baseProb: 0.04, name: 'GERD-Related Cough' },
    ace_inhibitor_cough: { mechanism: 'airway_irritation', baseProb: 0.03, name: 'ACE Inhibitor Cough' },
    heart_failure: { mechanism: 'cardiac_congestion', baseProb: 0.03, name: 'Heart Failure' },
    pulmonary_embolism: { mechanism: 'pulmonary_vascular', baseProb: 0.02, name: 'Pulmonary Embolism' },
    aspiration_pneumonia: { mechanism: 'aspiration', baseProb: 0.02, name: 'Aspiration Pneumonia' },
    tuberculosis: { mechanism: 'alveolar_disease', baseProb: 0.02, name: 'Pulmonary Tuberculosis' },
    pleural_effusion: { mechanism: 'pleural_disease', baseProb: 0.02, name: 'Pleural Effusion' },
    bronchogenic_carcinoma: { mechanism: 'mechanical_obstruction', baseProb: 0.01, name: 'Bronchogenic Carcinoma' },
    sinusitis: { mechanism: 'upper_airway_syndrome', baseProb: 0.03, name: 'Sinusitis' },
  };

  for (const [diseaseId, info] of Object.entries(baseRates)) {
    let prob = info.baseProb;

    const mechanismProb = phenotype.mechanismProbability[info.mechanism] || 0.1;
    prob *= (mechanismProb / 0.1);

    const isDryMatch = phenotype.dry && MECHANISMS.find(m => m.id === info.mechanism)?.dryCough;
    const isProductiveMatch = phenotype.productive && MECHANISMS.find(m => m.id === info.mechanism)?.productiveCough;
    if (phenotype.dry && isDryMatch) prob *= 1.5;
    if (phenotype.productive && isProductiveMatch) prob *= 1.5;
    if (phenotype.dry && !isDryMatch && !isProductiveMatch) prob *= 0.5;

    if (phenotype.sputumCharacter) {
      const sputumInfo = SPUTUM_CHARACTERS.find(s => s.character === phenotype.sputumCharacter);
      if (sputumInfo?.suggests.includes(diseaseId)) prob *= 3;
    }

    const supporting: string[] = [];
    if (phenotype.mechanism === info.mechanism) supporting.push(`Mechanism: ${info.mechanism.replace(/_/g, ' ')}`);
    if (phenotype.dry && isDryMatch) supporting.push('Dry cough');
    if (phenotype.productive && isProductiveMatch) supporting.push('Productive cough');
    if (phenotype.sputumCharacter) supporting.push(`Sputum: ${phenotype.sputumCharacter}`);

    results.push({
      diseaseId,
      diseaseName: info.name,
      mechanism: info.mechanism,
      probability: Math.round(prob * 1000) / 10,
      supportingFeatures: supporting,
      redFlags: [],
    });
  }

  results.sort((a, b) => b.probability - a.probability);
  return results.slice(0, 10);
}
