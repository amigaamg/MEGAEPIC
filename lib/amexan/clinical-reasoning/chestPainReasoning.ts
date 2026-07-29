import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type ChestPainCategory = 'cardiac_ischemic' | 'cardiac_non_ischemic' | 'pulmonary' | 'vascular' | 'gi' | 'musculoskeletal' | 'dermatomal' | 'psychogenic' | 'other';

interface ChestPainDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: ChestPainCategory;
  typicalOnset: 'instantaneous' | 'minutes' | 'gradual_hours' | 'chronic';
  character: string[];
  location: string[];
  radiation: string[];
  aggravating: string[];
  relieving: string[];
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface ChestPainPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const CHEST_PAIN_DDX: ChestPainDisease[] = [
  {
    diseaseId: 'acute_coronary_syndrome', diseaseName: 'Acute Coronary Syndrome (STEMI/NSTEMI/UA)', icdCode: 'I24.9',
    category: 'cardiac_ischemic', typicalOnset: 'minutes',
    character: ['Pressure', 'Tightness', 'Crushing', 'Burning', 'Heaviness'],
    location: ['Retrosternal', 'Precordial', 'Central chest'],
    radiation: ['Left arm', 'Neck', 'Jaw', 'Interscapular', 'Right arm'],
    aggravating: ['Exertion', 'Emotional stress', 'Cold'],
    relieving: ['Rest', 'Nitroglycerin'],
    ageRange: [25, 90], agePeak: [45, 75],
    sexPredilection: 'male', backgroundPrevalence: 0.05,
    riskFactors: ['smoking', 'diabetes', 'hypertension', 'hyperlipidemia', 'family_history_cad', 'obesity'],
    redFlags: ['hypotension', 'pulmonary_edema', 'arrhythmia', 'cardiac_arrest'],
    associatedSymptoms: ['dyspnea', 'diaphoresis', 'nausea', 'lightheadedness', 'palpitations'],
    typicalDescription: 'Retrosternal pressure-type pain radiating to left arm/jaw, worse with exertion, relieved by rest. May present as atypical in women, diabetics, and elderly.',
  },
  {
    diseaseId: 'stable_angina', diseaseName: 'Stable Angina Pectoris', icdCode: 'I20.8',
    category: 'cardiac_ischemic', typicalOnset: 'minutes',
    character: ['Pressure', 'Tightness', 'Heaviness'],
    location: ['Retrosternal', 'Precordial'],
    radiation: ['Left arm', 'Neck', 'Jaw'],
    aggravating: ['Exertion', 'Cold', 'Emotional stress'],
    relieving: ['Rest', 'GTN within minutes'],
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.04,
    riskFactors: ['smoking', 'diabetes', 'hypertension', 'hyperlipidemia', 'family_history_cad'],
    redFlags: ['crescendo_pattern', 'rest_pain', 'hemodynamic_instability'],
    associatedSymptoms: ['dyspnea', 'fatigue'],
    typicalDescription: 'Episodic retrosternal chest tightness brought on by exertion and relieved by rest or nitroglycerin. Predictable pattern over weeks to months.',
  },
  {
    diseaseId: 'pericarditis', diseaseName: 'Acute Pericarditis', icdCode: 'I30.9',
    category: 'cardiac_non_ischemic', typicalOnset: 'gradual_hours',
    character: ['Sharp', 'Stabbing', 'Pleuritic'],
    location: ['Precordial', 'Left chest', 'Retrosternal'],
    radiation: ['Left shoulder', 'Left trapezius ridge', 'Neck'],
    aggravating: ['Deep breathing', 'Lying flat', 'Coughing', 'Swallowing'],
    relieving: ['Sitting up', 'Leaning forward', 'NSAIDs'],
    ageRange: [15, 80], agePeak: [20, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['viral_infection', 'autoimmune_disease', 'renal_failure', 'post_mi', 'post_cardiac_surgery'],
    redFlags: ['cardiac_tamponade', 'pulsus_paradoxus', 'hypotension'],
    associatedSymptoms: ['fever', 'malaise', 'myalgia', 'dyspnea'],
    typicalDescription: 'Sharp pleuritic chest pain worse lying flat, better sitting forward. May have pericardial rub. Diffuse ST elevation on ECG.',
  },
  {
    diseaseId: 'myocarditis', diseaseName: 'Acute Myocarditis', icdCode: 'I40.9',
    category: 'cardiac_non_ischemic', typicalOnset: 'gradual_hours',
    character: ['Pressure', 'Sharp', 'Dull ache'],
    location: ['Precordial', 'Central chest'],
    radiation: [],
    aggravating: ['Exertion'],
    relieving: [],
    ageRange: [15, 60], agePeak: [20, 45],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['viral_infection', 'covid', 'chemotherapy', 'giant_cell', 'sarcoidosis'],
    redFlags: ['heart_failure', 'arrhythmia', 'cardiogenic_shock'],
    associatedSymptoms: ['dyspnea', 'fever', 'fatigue', 'palpitations', 'malaise'],
    typicalDescription: 'Chest pain with dyspnea, fever, and malaise following a viral illness. Elevated troponin with non-obstructed coronaries on angiogram.',
  },
  {
    diseaseId: 'aortic_stenosis', diseaseName: 'Severe Aortic Stenosis (Angina)', icdCode: 'I35.0',
    category: 'cardiac_non_ischemic', typicalOnset: 'chronic',
    character: ['Pressure', 'Tightness'],
    location: ['Retrosternal', 'Central chest'],
    radiation: ['Neck', 'Left arm'],
    aggravating: ['Exertion'],
    relieving: ['Rest'],
    ageRange: [50, 90], agePeak: [65, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['age', 'bicuspid_aortic_valve', 'rheumatic_heart_disease', 'hypertension'],
    redFlags: ['syncope', 'heart_failure', 'sudden_cardiac_death'],
    associatedSymptoms: ['dyspnea', 'syncope_exertion', 'fatigue', 'palpitations'],
    typicalDescription: 'Angina, syncope, and dyspnea on exertion in an elderly patient with a systolic ejection murmur radiating to the carotids.',
  },
  {
    diseaseId: 'pulmonary_embolism', diseaseName: 'Pulmonary Embolism', icdCode: 'I26.9',
    category: 'pulmonary', typicalOnset: 'minutes',
    character: ['Sharp', 'Stabbing', 'Pleuritic'],
    location: ['Unilateral chest', 'Lateral chest'],
    radiation: ['Back', 'Shoulder'],
    aggravating: ['Deep breathing', 'Coughing'],
    relieving: [],
    ageRange: [15, 90], agePeak: [40, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['surgery', 'immobilization', 'pregnancy', 'oral_contraceptives', 'cancer', 'dvt', 'hypercoagulable'],
    redFlags: ['massive_pe', 'hypotension', 'syncope', 'hypoxia'],
    associatedSymptoms: ['dyspnea_sudden', 'tachypnea', 'hemoptysis', 'palpitations', 'syncope'],
    typicalDescription: 'Sudden pleuritic chest pain with dyspnea and tachypnea. Risk factors for VTE. Wells criteria guide probability assessment.',
  },
  {
    diseaseId: 'pneumothorax', diseaseName: 'Spontaneous Pneumothorax', icdCode: 'J93.1',
    category: 'pulmonary', typicalOnset: 'instantaneous',
    character: ['Sharp', 'Stabbing', 'Tearing'],
    location: ['Unilateral chest', 'Shoulder tip'],
    radiation: ['Shoulder', 'Back'],
    aggravating: ['Deep breathing', 'Coughing'],
    relieving: [],
    ageRange: [15, 60], agePeak: [20, 40],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['tall_thin_habitus', 'smoking', 'marfan_syndrome', 'copd', 'asthma', 'mechanical_ventilation'],
    redFlags: ['tension_pneumothorax', 'hypotension', 'tracheal_deviation'],
    associatedSymptoms: ['dyspnea', 'decreased_breath_sounds', 'hyperresonance'],
    typicalDescription: 'Sudden sharp unilateral chest pain with dyspnea in a tall thin young male. Breath sounds decreased on affected side.',
  },
  {
    diseaseId: 'pleurisy', diseaseName: 'Pleurisy (Pleuritis)', icdCode: 'R09.1',
    category: 'pulmonary', typicalOnset: 'gradual_hours',
    character: ['Sharp', 'Stabbing'],
    location: ['Unilateral chest', 'Lateral chest'],
    radiation: [],
    aggravating: ['Deep breathing', 'Coughing', 'Sneezing'],
    relieving: ['Shallow breathing', 'Splinting'],
    ageRange: [5, 80], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['viral_infection', 'pneumonia', 'pulmonary_infarction', 'autoimmune_disease', 'uremia'],
    redFlags: ['empyema', 'massive_effusion'],
    associatedSymptoms: ['fever', 'cough', 'dyspnea'],
    typicalDescription: 'Sharp pain on inspiration, often with viral prodrome. May have pleural rub on auscultation.',
  },
  {
    diseaseId: 'aortic_dissection', diseaseName: 'Acute Aortic Dissection', icdCode: 'I71.0',
    category: 'vascular', typicalOnset: 'instantaneous',
    character: ['Tearing', 'Ripping', 'Sharp severe'],
    location: ['Anterior chest', 'Interscapular back'],
    radiation: ['Back', 'Abdomen', 'Neck', 'Carotids'],
    aggravating: [],
    relieving: [],
    ageRange: [40, 90], agePeak: [55, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['hypertension', 'marfan_syndrome', 'ehlers_danlos', 'bicuspid_aortic_valve', 'vasculitis'],
    redFlags: ['syncope', 'pulse_deficit', 'neurological_deficit', 'cardiac_tamponade'],
    associatedSymptoms: ['syncope', 'neurological_deficits', 'dyspnea', 'hoarseness', 'dysphagia'],
    typicalDescription: 'Sudden severe tearing chest pain radiating to the back. Hypertension is the most important risk factor. Pulse deficit or BP differential between arms.',
  },
  {
    diseaseId: 'gerd_chest_pain', diseaseName: 'Gastroesophageal Reflux (GERD)', icdCode: 'K21.0',
    category: 'gi', typicalOnset: 'gradual_hours',
    character: ['Burning', 'Pressure'],
    location: ['Retrosternal', 'Epigastrium'],
    radiation: ['Throat', 'Back'],
    aggravating: ['Lying down', 'Bending', 'Large meals', 'Spicy food'],
    relieving: ['Antacids', 'Sitting up'],
    ageRange: [15, 80], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.15,
    riskFactors: ['obesity', 'hiatal_hernia', 'pregnancy', 'smoking', 'alcohol'],
    redFlags: ['dysphagia', 'hematemesis', 'weight_loss'],
    associatedSymptoms: ['heartburn', 'regurgitation', 'dysphagia', 'belching'],
    typicalDescription: 'Retrosternal burning pain, worse after meals and lying down. Responds to antacids. Can mimic cardiac chest pain.',
  },
  {
    diseaseId: 'esophageal_spasm', diseaseName: 'Esophageal Spasm (Nutcracker Esophagus)', icdCode: 'K22.4',
    category: 'gi', typicalOnset: 'minutes',
    character: ['Crushing', 'Pressure', 'Burning'],
    location: ['Retrosternal', 'Central chest'],
    radiation: ['Back', 'Jaw'],
    aggravating: ['Swallowing', 'Cold liquids', 'Stress'],
    relieving: ['NTG (may mimic angina)', 'Calcium channel blockers'],
    ageRange: [30, 80], agePeak: [40, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['gerd', 'anxiety', 'diffuse_esophageal_spasm'],
    redFlags: ['complete_dysphagia', 'weight_loss'],
    associatedSymptoms: ['dysphagia', 'odynophagia', 'regurgitation'],
    typicalDescription: 'Crushing retrosternal pain often triggered by swallowing. Can be indistinguishable from cardiac chest pain. Manometry is diagnostic.',
  },
  {
    diseaseId: 'costochondritis', diseaseName: 'Costochondritis (Tietze Syndrome)', icdCode: 'M94.0',
    category: 'musculoskeletal', typicalOnset: 'gradual_hours',
    character: ['Sharp', 'Ache', 'Tender to touch'],
    location: ['Anterior chest wall', 'Parasternal', 'Localized'],
    radiation: [],
    aggravating: ['Palpation', 'Deep breathing', 'Movement', 'Coughing'],
    relieving: ['Rest', 'NSAIDs', 'Local pressure'],
    ageRange: [12, 60], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['recent_exercise', 'heavy_lifting', 'coughing', 'recent_chest_trauma', 'viral_illness'],
    redFlags: [],
    associatedSymptoms: ['local_tenderness', 'swelling'],
    typicalDescription: 'Localized chest wall tenderness reproducible by palpation. Most common at costochondral junctions 2nd-5th ribs. Swelling may be present in Tietze.',
  },
  {
    diseaseId: 'chest_wall_trauma', diseaseName: 'Chest Wall Trauma / Rib Fracture', icdCode: 'S22.4',
    category: 'musculoskeletal', typicalOnset: 'instantaneous',
    character: ['Sharp', 'Ache'],
    location: ['Localized to injury site'],
    radiation: [],
    aggravating: ['Deep breathing', 'Coughing', 'Palpation'],
    relieving: ['Rest', 'Analgesics', 'Splinting'],
    ageRange: [1, 90], agePeak: [20, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['fall', 'mva', 'assault', 'sports_injury', 'osteoporosis'],
    redFlags: ['flail_chest', 'pneumothorax', 'hemothorax', 'hypoxia'],
    associatedSymptoms: ['bruising', 'swelling', 'crepitus', 'dyspnea'],
    typicalDescription: 'Pain following direct trauma to the chest wall, worse with deep breathing and coughing. Focal tenderness at injury site.',
  },
  {
    diseaseId: 'herpes_zoster_thoracic', diseaseName: 'Herpes Zoster (Shingles) — Pre-eruptive Thoracic', icdCode: 'B02.2',
    category: 'dermatomal', typicalOnset: 'gradual_hours',
    character: ['Burning', 'Stabbing', 'Shooting'],
    location: ['Dermatomal distribution', 'Unilateral'],
    radiation: ['Along dermatome'],
    aggravating: ['Touch', 'Light touch allodynia'],
    relieving: ['Analgesics', 'Antivirals'],
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'immunosuppression', 'prior_chickenpox', 'stress'],
    redFlags: ['disseminated_zoster', 'ophthalmic_involvement', 'immunocompromised'],
    associatedSymptoms: ['rash', 'vesicles', 'fever', 'malaise'],
    typicalDescription: 'Burning or stabbing pain in a dermatomal distribution, often before the characteristic vesicular rash appears. May be misdiagnosed before rash.',
  },
  {
    diseaseId: 'panic_attack', diseaseName: 'Panic Attack / Anxiety', icdCode: 'F41.0',
    category: 'psychogenic', typicalOnset: 'minutes',
    character: ['Tightness', 'Pressure', 'Sharp'],
    location: ['Central chest', 'Precordial'],
    radiation: [],
    aggravating: ['Stress', 'Anxiety'],
    relieving: ['Reassurance', 'Distraction', 'Benzodiazepines'],
    ageRange: [15, 60], agePeak: [20, 45],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['anxiety_disorder', 'panic_disorder', 'depression', 'stress', 'trauma'],
    redFlags: [],
    associatedSymptoms: ['palpitations', 'dyspnea', 'paresthesias', 'dizziness', 'depersonalization', 'fear_of_dying'],
    typicalDescription: 'Chest tightness with palpitations, dyspnea, and paresthesias during panic attacks. Fear of impending doom. Symptoms resolve with reassurance.',
  },
];

const CHEST_PAIN_PATTERNS: ChestPainPatternRule[] = [
  {
    id: 'cardiac_crushing_radiation', label: 'Crushing Retrosternal Pain with Radiation',
    description: 'Retrosternal pressure/crushing pain radiating to left arm/jaw = ACS until proven otherwise',
    pattern: ['chest_pain', 'pain_radiation'],
    suggests: ['acute_coronary_syndrome', 'stable_angina'],
    rulesOut: ['costochondritis', 'gerd_chest_pain', 'panic_attack'],
    priorityBoost: 35,
  },
  {
    id: 'pleuritic_pattern', label: 'Pleuritic Chest Pain',
    description: 'Sharp pain worse with deep breathing suggests pleural, pericardial, or chest wall origin',
    pattern: ['chest_pain', 'pleuritic_pain'],
    suggests: ['pericarditis', 'pleurisy', 'pulmonary_embolism', 'pneumothorax', 'costochondritis'],
    rulesOut: ['acute_coronary_syndrome', 'gerd_chest_pain', 'panic_attack'],
    priorityBoost: 25,
  },
  {
    id: 'tearing_instant_onset', label: 'Tearing/Ripping Pain with Instant Onset',
    description: 'Sudden severe tearing chest pain radiating to back = aortic dissection until proven',
    pattern: ['chest_pain', 'pain_onset', 'pain_character'],
    suggests: ['aortic_dissection'],
    rulesOut: ['costochondritis', 'gerd_chest_pain', 'panic_attack'],
    priorityBoost: 40,
  },
  {
    id: 'exertional_precipitated', label: 'Exertional Chest Pain',
    description: 'Chest pain brought on by exertion and relieved by rest = ischemic heart disease',
    pattern: ['chest_pain', 'pain_worsening_factors'],
    suggests: ['acute_coronary_syndrome', 'stable_angina', 'aortic_stenosis'],
    rulesOut: ['costochondritis', 'gerd_chest_pain', 'panic_attack'],
    priorityBoost: 30,
  },
  {
    id: 'positional_pleuritic', label: 'Positional Pleuritic Pain',
    description: 'Pain worse lying flat, better sitting forward = pericarditis',
    pattern: ['chest_pain', 'pleuritic_pain', 'pain_relieving_factors'],
    suggests: ['pericarditis'],
    rulesOut: ['acute_coronary_syndrome', 'pulmonary_embolism'],
    priorityBoost: 20,
  },
  {
    id: 'postprandial_burning', label: 'Postprandial Burning Retrosternal Pain',
    description: 'Burning retrosternal pain after meals, worse lying down = GERD',
    pattern: ['chest_pain', 'heartburn', 'pain_worsening_factors'],
    suggests: ['gerd_chest_pain', 'esophageal_spasm'],
    rulesOut: ['acute_coronary_syndrome', 'pericarditis'],
    priorityBoost: 20,
  },
  {
    id: 'palpable_tenderness', label: 'Chest Wall Tenderness on Palpation',
    description: 'Localized reproducible tenderness to palpation = costochondritis or chest wall injury',
    pattern: ['chest_pain', 'pain_character'],
    suggests: ['costochondritis', 'chest_wall_trauma'],
    rulesOut: ['acute_coronary_syndrome', 'pulmonary_embolism', 'aortic_dissection'],
    priorityBoost: 15,
  },
  {
    id: 'sudden_dyspnea_pleuritic', label: 'Sudden Dyspnea with Pleuritic Pain',
    description: 'Sudden pleuritic pain with acute dyspnea = PE or pneumothorax',
    pattern: ['chest_pain', 'dyspnea', 'pain_onset'],
    suggests: ['pulmonary_embolism', 'pneumothorax'],
    rulesOut: ['costochondritis', 'gerd_chest_pain'],
    priorityBoost: 30,
  },
  {
    id: 'panic_with_paresthesias', label: 'Chest Pain with Paresthesias and Fear',
    description: 'Chest tightness + palpitations + paresthesias + fear = panic attack',
    pattern: ['chest_pain', 'palpitations', 'numbness_tingling'],
    suggests: ['panic_attack'],
    rulesOut: ['acute_coronary_syndrome', 'pulmonary_embolism'],
    priorityBoost: 15,
  },
  {
    id: 'burning_dermatomal', label: 'Burning Unilateral Dermatomal Pain',
    description: 'Burning pain in dermatomal distribution = herpes zoster (pre-eruptive)',
    pattern: ['chest_pain', 'skin_rash'],
    suggests: ['herpes_zoster_thoracic'],
    rulesOut: ['acute_coronary_syndrome', 'costochondritis'],
    priorityBoost: 15,
  },
  {
    id: 'cardiac_risk_factors', label: 'Chest Pain with Cardiac Risk Factors',
    description: 'Multiple cardiac risk factors + chest pain = ACS until proven',
    pattern: ['smoking', 'diabetes', 'chest_pain'],
    suggests: ['acute_coronary_syndrome', 'stable_angina'],
    rulesOut: [],
    priorityBoost: 25,
  },
  {
    id: 'post_surgery_dyspnea', label: 'Post-Surgery Chest Pain with Dyspnea',
    description: 'Recent surgery + chest pain + dyspnea = pulmonary embolism',
    pattern: ['chest_pain', 'dyspnea', 'prior_abdominal_surgery'],
    suggests: ['pulmonary_embolism'],
    rulesOut: ['costochondritis', 'panic_attack'],
    priorityBoost: 25,
  },
];

export function getChestPainDdx(): ChestPainDisease[] {
  return CHEST_PAIN_DDX;
}

export function getChestPainPatterns(): ChestPainPatternRule[] {
  return CHEST_PAIN_PATTERNS;
}

export function getChestPainGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const CHEST_PAIN_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'chest_pain_presence', label: 'Chest Pain Recognition', features: ['chest_pain'], priority: 100, rationale: 'Confirm the presence and nature of chest pain as the presenting symptom.', category: 'life_threatening' },
    { id: 'chest_pain_character', label: 'Chest Pain Character', features: ['pain_character', 'pain_severity'], priority: 95, rationale: 'Character is the single most important discriminator: pressure = cardiac, sharp = pleuritic, tearing = dissection, burning = GI.', category: 'life_threatening' },
    { id: 'chest_pain_location', label: 'Chest Pain Location and Radiation', features: ['pain_initial_location', 'pain_location_now', 'pain_radiation'], priority: 90, rationale: 'Location and radiation pattern narrow the differential: central + arm/jaw = cardiac, unilateral = pulmonary/pleural, back = aortic.', category: 'diagnostic' },
    { id: 'chest_pain_onset', label: 'Chest Pain Onset', features: ['pain_onset', 'pain_onset_sudden'], priority: 85, rationale: 'Instant onset = dissection or pneumothorax. Gradual = pericarditis or musculoskeletal.', category: 'diagnostic' },
    { id: 'chest_dyspnea', label: 'Associated Dyspnea', features: ['dyspnea', 'orthopnea', 'pnd'], priority: 90, rationale: 'Dyspnea with chest pain = PE, pneumothorax, HF, or ACS. Its presence raises severity.', category: 'life_threatening' },
    { id: 'chest_pleuritic', label: 'Pleuritic Component', features: ['pleuritic_pain', 'pain_worsening_factors'], priority: 80, rationale: 'Pain worse with deep breathing = pleural, pericardial, or chest wall origin. Key discriminator from cardiac ischemia.', category: 'diagnostic' },
    { id: 'chest_exertional', label: 'Exertional Relationship', features: ['pain_worsening_factors', 'pain_relieving_factors'], priority: 78, rationale: 'Exertional pain relieved by rest = ischemic. Worse lying flat = pericardial. Postprandial = GI.', category: 'diagnostic' },
    { id: 'chest_associated_cardiac', label: 'Cardiac Associated Symptoms', features: ['palpitations', 'syncope', 'diaphoresis'], priority: 85, rationale: 'Diaphoresis + chest pain = ACS. Syncope = aortic dissection or PE. Palpitations = arrhythmia or panic.', category: 'life_threatening' },
    { id: 'chest_risk_factors', label: 'Cardiac Risk Factors', features: ['smoking', 'diabetes', 'hypertension', 'hyperlipidemia'], priority: 75, rationale: 'Risk factor assessment stratifies probability of ACS and guides urgency.', category: 'risk_factor' },
    { id: 'chest_gastro', label: 'GI Association', features: ['heartburn', 'dysphagia', 'nausea'], priority: 70, rationale: 'Heartburn and regurgitation suggest GERD or esophageal cause. Important to differentiate from cardiac.', category: 'diagnostic' },
    { id: 'chest_viral', label: 'Viral Prodrome / Systemic Symptoms', features: ['fever', 'cough', 'myalgia', 'fatigue'], priority: 65, rationale: 'Fever and cough suggest pleural or pericardial inflammation, or pneumonia mimicking chest pain.', category: 'diagnostic' },
    { id: 'chest_thrombotic_risk', label: 'Thrombotic Risk Factors', features: ['surgery', 'immobilization', 'pregnancy', 'cancer'], priority: 75, rationale: 'Risk factors for VTE raise probability of PE as cause of pleuritic chest pain.', category: 'risk_factor' },
  ];

  for (const def of CHEST_PAIN_GAP_DEFS) {
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
          groupLabel: 'Chest Pain Assessment',
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
            groupLabel: 'Chest Pain Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getChestPainPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of CHEST_PAIN_PATTERNS) {
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
          reasonEssential: `Chest pain pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function classifyChestPainCategory(
  character: string,
  onset: string,
  location: string,
  pleuritic: boolean,
  exertional: boolean,
  positional: boolean,
): { primary: ChestPainCategory; confidence: 'high' | 'moderate' | 'low'; rationale: string } {
  const tearing = character.toLowerCase().includes('tear') || character.toLowerCase().includes('rip');
  const crushing = character.toLowerCase().includes('crush') || character.toLowerCase().includes('press') || character.toLowerCase().includes('tight');
  const sharp = character.toLowerCase().includes('sharp') || character.toLowerCase().includes('stab');
  const burning = character.toLowerCase().includes('burn');

  if (tearing && onset === 'instantaneous') {
    return { primary: 'vascular', confidence: 'high', rationale: 'Tearing/ripping pain with instantaneous onset = aortic dissection until proven.' };
  }
  if (crushing && exertional) {
    return { primary: 'cardiac_ischemic', confidence: 'high', rationale: 'Crushing/pressure exertional chest pain = ischemic heart disease.' };
  }
  if (sharp && pleuritic && positional) {
    return { primary: 'cardiac_non_ischemic', confidence: 'moderate', rationale: 'Sharp pleuritic pain worse lying flat = pericarditis.' };
  }
  if (sharp && pleuritic && !positional) {
    return { primary: 'pulmonary', confidence: 'moderate', rationale: 'Sharp pleuritic pain without positional component = pleural or pulmonary origin.' };
  }
  if (burning && !exertional) {
    return { primary: 'gi', confidence: 'moderate', rationale: 'Burning retrosternal pain without exertional component = GERD or esophageal cause.' };
  }
  if (!pleuritic && !exertional && location === 'localized') {
    return { primary: 'musculoskeletal', confidence: 'moderate', rationale: 'Localized non-pleuritic non-exertional pain = musculoskeletal.' };
  }

  return { primary: 'other', confidence: 'low', rationale: 'Insufficient data to classify chest pain category.' };
}

export function getBiodataAdjustedChestPainPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of CHEST_PAIN_DDX) {
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
