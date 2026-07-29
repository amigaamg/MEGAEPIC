import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type FeverCategory = 'infectious_bacterial' | 'infectious_viral' | 'infectious_parasitic' | 'infectious_fungal' | 'inflammatory_autoimmune' | 'neoplastic' | 'drug_fever' | 'factitious' | 'other';
type FeverPattern = 'continuous' | 'intermittent' | 'remittent' | 'relapsing' | 'pel_ebstein' | 'saddle_back' | 'hectic' | 'undulant';

interface FeverDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: FeverCategory;
  typicalFeverPattern: FeverPattern;
  peakTemperature: string;
  durationTypical: string;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface FeverPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const FEVER_DDX: FeverDisease[] = [
  {
    diseaseId: 'viral_urti', diseaseName: 'Viral Upper Respiratory Tract Infection', icdCode: 'J06.9',
    category: 'infectious_viral', typicalFeverPattern: 'intermittent',
    peakTemperature: '38-39°C', durationTypical: '3-7 days',
    ageRange: [0, 90], agePeak: [1, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.3,
    riskFactors: ['crowding', 'winter_season', 'daycare', 'immunosuppression'],
    redFlags: ['respiratory_distress', 'seizure'],
    associatedSymptoms: ['cough', 'runny_nose', 'sore_throat', 'myalgia', 'fatigue'],
    typicalDescription: 'Self-limited febrile illness with coryza, cough, and sore throat. Fever usually subsides within 3-5 days.',
  },
  {
    diseaseId: 'influenza', diseaseName: 'Influenza', icdCode: 'J11.1',
    category: 'infectious_viral', typicalFeverPattern: 'continuous',
    peakTemperature: '38.5-40°C', durationTypical: '3-8 days',
    ageRange: [0, 90], agePeak: [1, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.08,
    riskFactors: ['winter_season', 'immunosuppression', 'chronic_lung_disease', 'pregnancy', 'elderly'],
    redFlags: ['respiratory_distress', 'pneumonia', 'encephalitis'],
    associatedSymptoms: ['high_fever', 'myalgia_severe', 'headache', 'cough', 'fatigue', 'malaise'],
    typicalDescription: 'Abrupt onset of high fever, severe myalgia, headache, and dry cough. More severe in elderly and immunocompromised.',
  },
  {
    diseaseId: 'covid_infection', diseaseName: 'COVID-19 (SARS-CoV-2)', icdCode: 'U07.1',
    category: 'infectious_viral', typicalFeverPattern: 'remittent',
    peakTemperature: '37.5-39.5°C', durationTypical: '5-14 days',
    ageRange: [0, 90], agePeak: [20, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['exposure', 'immunosuppression', 'chronic_disease', 'obesity', 'elderly'],
    redFlags: ['hypoxia', 'respiratory_distress', 'sepsis'],
    associatedSymptoms: ['cough', 'anosmia', 'dyspnea', 'fatigue', 'myalgia', 'sore_throat'],
    typicalDescription: 'Febrile illness with cough, anosmia, and dyspnea. Ranges from asymptomatic to severe respiratory failure.',
  },
  {
    diseaseId: 'community_acquired_pneumonia', diseaseName: 'Community-Acquired Pneumonia', icdCode: 'J15.9',
    category: 'infectious_bacterial', typicalFeverPattern: 'continuous',
    peakTemperature: '38.5-40°C', durationTypical: '5-14 days',
    ageRange: [0, 90], agePeak: [1, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['age', 'smoking', 'copd', 'immunosuppression', 'aspiration_risk'],
    redFlags: ['hypoxia', 'hypotension', 'confusion', 'rr_above_30'],
    associatedSymptoms: ['cough_productive', 'dyspnea', 'pleuritic_pain', 'fever_chills'],
    typicalDescription: 'Fever with productive cough, dyspnea, and localized chest findings. CURB-65 score guides severity and admission decision.',
  },
  {
    diseaseId: 'urinary_tract_infection_fever', diseaseName: 'Febrile Urinary Tract Infection / Pyelonephritis', icdCode: 'N10',
    category: 'infectious_bacterial', typicalFeverPattern: 'continuous',
    peakTemperature: '38-40°C', durationTypical: '3-14 days',
    ageRange: [1, 90], agePeak: [15, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['female_sex', 'sexual_activity', 'catheter', 'pregnancy', 'diabetes'],
    redFlags: ['sepsis', 'abscess', 'emphysematous'],
    associatedSymptoms: ['dysuria', 'frequency', 'flank_pain', 'fever_chills', 'nausea'],
    typicalDescription: 'Fever with flank pain, dysuria, and urinary frequency. Costovertebral angle tenderness on exam.',
  },
  {
    diseaseId: 'cellulitis', diseaseName: 'Cellulitis / Skin Infection', icdCode: 'L03.9',
    category: 'infectious_bacterial', typicalFeverPattern: 'intermittent',
    peakTemperature: '37.5-39.5°C', durationTypical: '5-14 days',
    ageRange: [1, 90], agePeak: [20, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['skin_break', 'diabetes', 'pvd', 'immunosuppression', 'obesity', 'lymphedema'],
    redFlags: ['necrotizing_fasciitis', 'sepsis', 'compartment_syndrome'],
    associatedSymptoms: ['skin_redness', 'swelling', 'warmth', 'pain'],
    typicalDescription: 'Fever with spreading erythema, swelling, and tenderness of the skin. Well-demarcated borders in erysipelas.',
  },
  {
    diseaseId: 'sepsis', diseaseName: 'Sepsis / Bacteremia', icdCode: 'A41.9',
    category: 'infectious_bacterial', typicalFeverPattern: 'continuous',
    peakTemperature: '38-41°C', durationTypical: 'Variable',
    ageRange: [0, 90], agePeak: [1, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['immunosuppression', 'indwelling_catheter', 'recent_surgery', 'malignancy', 'diabetes'],
    redFlags: ['hypotension', 'altered_mental_status', 'organ_failure', 'rr_above_22'],
    associatedSymptoms: ['fever_chills', 'tachycardia', 'tachypnea', 'confusion', 'hypotension'],
    typicalDescription: 'Systemic inflammatory response to infection with end-organ dysfunction. qSOFA score ≥2 suggests sepsis.',
  },
  {
    diseaseId: 'malaria', diseaseName: 'Malaria (P. falciparum / P. vivax)', icdCode: 'B54',
    category: 'infectious_parasitic', typicalFeverPattern: 'intermittent',
    peakTemperature: '39-41°C', durationTypical: '7-30 days',
    ageRange: [0, 80], agePeak: [2, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['travel_endemic_area', 'splenectomy', 'no_prophylaxis'],
    redFlags: ['cerebral_malaria', 'severe_anemia', 'acute_renal_failure', 'hypoglycemia'],
    associatedSymptoms: ['cyclic_fever', 'chills', 'headache', 'myalgia', 'sweating', 'splenomegaly'],
    typicalDescription: 'Cyclic fevers with rigors, headache, and myalgia in a patient from endemic area. Falciparum can be severe and fatal.',
  },
  {
    diseaseId: 'typhoid_fever', diseaseName: 'Typhoid / Enteric Fever', icdCode: 'A01.0',
    category: 'infectious_bacterial', typicalFeverPattern: 'continuous',
    peakTemperature: '39-40°C', durationTypical: '14-28 days',
    ageRange: [1, 60], agePeak: [5, 30],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['travel_endemic', 'poor_sanitation', 'contaminated_food_water'],
    redFlags: ['intestinal_perforation', 'gi_bleeding', 'encephalopathy'],
    associatedSymptoms: ['step_ladder_fever', 'abdominal_pain', 'constipation_early', 'relative_bradycardia', 'rose_spots'],
    typicalDescription: 'Step-ladder rising fever with relative bradycardia, abdominal pain, and rose spots. Constipation early, diarrhea late.',
  },
  {
    diseaseId: 'tuberculosis_fever', diseaseName: 'Pulmonary / Disseminated Tuberculosis', icdCode: 'A15.0',
    category: 'infectious_bacterial', typicalFeverPattern: 'intermittent',
    peakTemperature: '37.5-38.5°C', durationTypical: 'Weeks to months',
    ageRange: [1, 90], agePeak: [20, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['hiv', 'immunosuppression', 'contact_with_tb', 'homelessness', 'malnutrition'],
    redFlags: ['hemoptysis', 'weight_loss', 'night_sweats'],
    associatedSymptoms: ['chronic_cough', 'weight_loss', 'night_sweats', 'hemoptysis', 'fatigue'],
    typicalDescription: 'Low-grade fever with chronic cough, night sweats, and weight loss. May present as pyrexia of unknown origin.',
  },
  {
    diseaseId: 'infective_endocarditis', diseaseName: 'Infective Endocarditis', icdCode: 'I33.0',
    category: 'infectious_bacterial', typicalFeverPattern: 'intermittent',
    peakTemperature: '38-40°C', durationTypical: 'Days to weeks',
    ageRange: [15, 90], agePeak: [40, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['valvular_heart_disease', 'ivdu', 'prosthetic_valve', 'indwelling_catheter', 'dental_procedure'],
    redFlags: ['heart_failure', 'embolic_event', 'septic_shock'],
    associatedSymptoms: ['fever', 'heart_murmur', 'petechiae', 'osler_nodes', 'janeway_lesions', 'splinter_hemorrhages'],
    typicalDescription: 'Persistent fever with cardiac murmur and peripheral stigmata in a patient with risk factors. Duke criteria guide diagnosis.',
  },
  {
    diseaseId: 'osteomyelitis', diseaseName: 'Osteomyelitis / Septic Arthritis', icdCode: 'M86.9',
    category: 'infectious_bacterial', typicalFeverPattern: 'continuous',
    peakTemperature: '38-40°C', durationTypical: 'Days to weeks',
    ageRange: [1, 90], agePeak: [2, 20],
    sexPredilection: 'male', backgroundPrevalence: 0.003,
    riskFactors: ['open_fracture', 'diabetes', 'ivdu', 'surgery', 'sickle_cell'],
    redFlags: ['sepsis', 'pathological_fracture', 'chronic_discharge'],
    associatedSymptoms: ['bone_pain', 'swelling', 'erythema', 'fever', 'reduced_movement'],
    typicalDescription: 'Fever with localized bone/joint pain, swelling, and restricted movement. Most common in long bones in children.',
  },
  {
    diseaseId: 'meningococcal_disease', diseaseName: 'Meningococcal Disease (Meningococcemia)', icdCode: 'A39.9',
    category: 'infectious_bacterial', typicalFeverPattern: 'continuous',
    peakTemperature: '38.5-41°C', durationTypical: 'Hours to days',
    ageRange: [0, 30], agePeak: [1, 5],
    sexPredilection: 'none', backgroundPrevalence: 0.0005,
    riskFactors: ['crowding', 'asplenia', 'complement_deficiency', 'college_dormitory'],
    redFlags: ['petechial_rash', 'purpura', 'hypotension', 'meningitis', 'purpura_fulminans'],
    associatedSymptoms: ['fever', 'petechial_rash', 'headache', 'neck_stiffness', 'vomiting', 'hypotension'],
    typicalDescription: 'Fever with rapidly progressive petechial/purpuric rash and meningitis. Can progress to purpura fulminans and septic shock within hours.',
  },
  {
    diseaseId: 'dengue_fever', diseaseName: 'Dengue Fever', icdCode: 'A90',
    category: 'infectious_viral', typicalFeverPattern: 'saddle_back',
    peakTemperature: '39-41°C', durationTypical: '7-10 days',
    ageRange: [0, 80], agePeak: [5, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['travel_endemic', 'mosquito_exposure'],
    redFlags: ['dengue_shock_syndrome', 'severe_bleeding', 'plasma_leakage'],
    associatedSymptoms: ['high_fever', 'retro_orbital_pain', 'myalgia', 'arthralgia', 'rash', 'bleeding_tendency'],
    typicalDescription: 'High fever with retro-orbital pain, severe myalgia (break-bone fever), and rash. Saddle-back fever pattern with defervescence around day 3-4 then recurrence.',
  },
  {
    diseaseId: 'brucellosis', diseaseName: 'Brucellosis (Undulant Fever)', icdCode: 'A23.9',
    category: 'infectious_bacterial', typicalFeverPattern: 'undulant',
    peakTemperature: '38-40°C', durationTypical: 'Weeks to months',
    ageRange: [10, 70], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['animal_exposure', 'unpasteurized_dairy', 'veterinary', 'slaughterhouse'],
    redFlags: ['neurobrucellosis', 'endocarditis'],
    associatedSymptoms: ['undulant_fever', 'night_sweats', 'arthralgia', 'fatigue', 'hepatosplenomegaly', 'lymphadenopathy'],
    typicalDescription: 'Undulant (wave-like) fever with night sweats, arthralgia, and hepatosplenomegaly. History of unpasteurized dairy or animal exposure.',
  },
  {
    diseaseId: 'still_disease', diseaseName: 'Adult-Onset Still Disease (AOSD)', icdCode: 'M06.1',
    category: 'inflammatory_autoimmune', typicalFeverPattern: 'intermittent',
    peakTemperature: '39-40°C', durationTypical: 'Days to weeks',
    ageRange: [16, 60], agePeak: [20, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.0002,
    riskFactors: ['female_sex'],
    redFlags: ['macrophage_activation_syndrome', 'disseminated_intravascular_coagulation'],
    associatedSymptoms: ['quotidian_fever', 'salmon_pink_rash', 'arthralgia', 'sore_throat', 'lymphadenopathy', 'hepatosplenomegaly'],
    typicalDescription: 'Daily quotidian fever with evanescent salmon-pink rash, arthralgia, and sore throat. Elevated ferritin and negative ANA/RF.',
  },
  {
    diseaseId: 'drug_fever', diseaseName: 'Drug-Induced Fever', icdCode: 'R50.2',
    category: 'drug_fever', typicalFeverPattern: 'intermittent',
    peakTemperature: '38-40°C', durationTypical: 'Duration of drug exposure',
    ageRange: [1, 90], agePeak: [20, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.005,
    riskFactors: ['polypharmacy', 'antibiotic_use', 'antiepileptic_use', 'specific_drugs'],
    redFlags: ['rash', 'eosinophilia', 'anaphylaxis'],
    associatedSymptoms: ['fever', 'rash', 'eosinophilia', 'relative_bradycardia'],
    typicalDescription: 'Fever coinciding with drug administration, resolving on discontinuation. May have rash and eosinophilia. Any drug can cause drug fever.',
  },
  {
    diseaseId: 'lymphoma_fever', diseaseName: 'Lymphoma (Hodgkin / Non-Hodgkin)', icdCode: 'C85.9',
    category: 'neoplastic', typicalFeverPattern: 'pel_ebstein',
    peakTemperature: '38-40°C', durationTypical: 'Weeks to months',
    ageRange: [10, 80], agePeak: [20, 70],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['immunosuppression', 'ebv', 'family_history'],
    redFlags: ['superior_vena_cava_syndrome', 'spinal_cord_compression', 'tumor_lysis'],
    associatedSymptoms: ['pel_ebstein_fever', 'night_sweats', 'weight_loss', 'lymphadenopathy', 'pruritus', 'fatigue'],
    typicalDescription: 'Pel-Ebstein fever (cycling fever pattern) with lymphadenopathy, night sweats, and weight loss. Classic B symptoms of lymphoma.',
  },
];

const FEVER_PATTERNS: FeverPatternRule[] = [
  {
    id: 'fever_neck_stiffness', label: 'Fever + Neck Stiffness',
    description: 'Fever with neck stiffness and headache = meningitis until proven',
    pattern: ['fever', 'neck_pain', 'headache'],
    suggests: ['bacterial_meningitis', 'meningococcal_disease'],
    rulesOut: ['viral_urti', 'influenza', 'drug_fever'],
    priorityBoost: 35,
  },
  {
    id: 'fever_petechial_rash', label: 'Fever + Petechial/Purpuric Rash',
    description: 'Fever with petechial rash = meningococcemia until proven',
    pattern: ['fever', 'skin_rash', 'fever_chills'],
    suggests: ['meningococcal_disease', 'dengue_fever', 'sepsis'],
    rulesOut: ['viral_urti', 'influenza', 'drug_fever'],
    priorityBoost: 40,
  },
  {
    id: 'fever_cough_dyspnea', label: 'Fever + Cough + Dyspnea',
    description: 'Fever with productive cough and dyspnea = pneumonia',
    pattern: ['fever', 'cough', 'dyspnea'],
    suggests: ['community_acquired_pneumonia', 'covid_infection'],
    rulesOut: ['viral_urti', 'drug_fever', 'urinary_tract_infection_fever'],
    priorityBoost: 25,
  },
  {
    id: 'fever_flank_dysuria', label: 'Fever + Flank Pain + Dysuria',
    description: 'Fever with flank pain and urinary symptoms = pyelonephritis',
    pattern: ['fever', 'flank_pain', 'dysuria'],
    suggests: ['urinary_tract_infection_fever'],
    rulesOut: ['viral_urti', 'community_acquired_pneumonia'],
    priorityBoost: 20,
  },
  {
    id: 'fever_cyclic_rigors', label: 'Cyclic Fever with Rigors',
    description: 'High cyclic fever with rigors in endemic area = malaria',
    pattern: ['fever', 'fever_chills', 'headache'],
    suggests: ['malaria', 'typhoid_fever', 'dengue_fever'],
    rulesOut: ['viral_urti', 'drug_fever'],
    priorityBoost: 25,
  },
  {
    id: 'fever_weight_loss_night_sweats', label: 'Fever + Weight Loss + Night Sweats',
    description: 'Chronic fever with weight loss and night sweats = TB, lymphoma, or autoimmune',
    pattern: ['fever', 'weight_loss', 'fatigue'],
    suggests: ['tuberculosis_fever', 'lymphoma_fever', 'still_disease'],
    rulesOut: ['viral_urti', 'community_acquired_pneumonia', 'urinary_tract_infection_fever'],
    priorityBoost: 25,
  },
  {
    id: 'fever_murmur_embolic', label: 'Fever + Murmur + Embolic Signs',
    description: 'Fever with cardiac murmur and peripheral emboli = infective endocarditis',
    pattern: ['fever', 'palpitations', 'chest_pain'],
    suggests: ['infective_endocarditis'],
    rulesOut: ['viral_urti', 'drug_fever'],
    priorityBoost: 30,
  },
  {
    id: 'fever_travel_related', label: 'Travel-Related Fever',
    description: 'Fever in patient with recent travel = consider malaria, dengue, typhoid',
    pattern: ['fever', 'recent_travel', 'diarrhea'],
    suggests: ['malaria', 'dengue_fever', 'typhoid_fever'],
    rulesOut: ['viral_urti', 'community_acquired_pneumonia', 'drug_fever'],
    priorityBoost: 25,
  },
  {
    id: 'fever_joint_rash', label: 'Fever + Joint Pain + Rash',
    description: 'Fever with arthralgia and characteristic rash = Still disease or viral arthralgia',
    pattern: ['fever', 'joint_pain', 'skin_rash'],
    suggests: ['still_disease', 'dengue_fever'],
    rulesOut: ['viral_urti', 'community_acquired_pneumonia'],
    priorityBoost: 20,
  },
  {
    id: 'fever_drug_exposure', label: 'Drug-Exposure Fever',
    description: 'Fever coinciding with drug administration, resolving on discontinuation = drug fever',
    pattern: ['fever', 'skin_rash'],
    suggests: ['drug_fever'],
    rulesOut: ['sepsis', 'infective_endocarditis'],
    priorityBoost: 15,
  },
  {
    id: 'fever_localized_infection', label: 'Fever + Localized Redness/Swelling',
    description: 'Fever with localized skin redness/swelling = cellulitis or abscess',
    pattern: ['fever', 'skin_rash'],
    suggests: ['cellulitis', 'osteomyelitis'],
    rulesOut: ['viral_urti', 'drug_fever'],
    priorityBoost: 20,
  },
  {
    id: 'fever_post_surgery', label: 'Post-Operative Fever',
    description: 'Fever following surgery = wound infection, atelectasis, UTI, or DVT',
    pattern: ['fever', 'prior_abdominal_surgery'],
    suggests: ['sepsis', 'urinary_tract_infection_fever', 'pulmonary_embolism_dyspnea'],
    rulesOut: ['viral_urti', 'drug_fever'],
    priorityBoost: 20,
  },
];

export function getFeverDdx(): FeverDisease[] {
  return FEVER_DDX;
}

export function getFeverPatterns(): FeverPatternRule[] {
  return FEVER_PATTERNS;
}

export function classifyFeverPattern(
  pattern: string,
  peakTemperature: number,
  rigors: boolean,
  duration: number,
): { pattern: FeverPattern; confidence: 'high' | 'moderate' | 'low'; likelyCategory: FeverCategory } {
  if (pattern.includes('saddle') || pattern.includes('defervescence')) {
    return { pattern: 'saddle_back', confidence: 'moderate', likelyCategory: 'infectious_viral' };
  }
  if (pattern.includes('cyclic') || pattern.includes('wave')) {
    return { pattern: 'undulant', confidence: 'moderate', likelyCategory: 'infectious_bacterial' };
  }
  if (rigors && pattern.includes('intermittent')) {
    return { pattern: 'intermittent', confidence: 'moderate', likelyCategory: 'infectious_bacterial' };
  }
  if (duration > 21 && pattern.includes('intermittent')) {
    return { pattern: 'intermittent', confidence: 'moderate', likelyCategory: 'inflammatory_autoimmune' };
  }
  if (pattern.includes('continuous') || pattern.includes('constant')) {
    return { pattern: 'continuous', confidence: 'low', likelyCategory: 'infectious_bacterial' };
  }
  return { pattern: 'intermittent', confidence: 'low', likelyCategory: 'infectious_viral' };
}

export function getFeverGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const FEVER_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'fever_presence', label: 'Fever Confirmation', features: ['fever'], priority: 90, rationale: 'Confirm fever presence and onset as the core clinical finding.', category: 'documentation' },
    { id: 'fever_temperature', label: 'Peak Temperature', features: ['fever_temperature'], priority: 85, rationale: 'Peak temperature helps distinguish viral (usually <39°C) from bacterial (often >39°C) causes.', category: 'diagnostic' },
    { id: 'fever_pattern', label: 'Fever Pattern', features: ['fever_pattern', 'fever_duration_days'], priority: 80, rationale: 'Pattern (continuous vs intermittent vs relapsing) is key for differential diagnosis.', category: 'diagnostic' },
    { id: 'fever_rigors', label: 'Rigors', features: ['fever_chills'], priority: 85, rationale: 'Rigors suggest bacteremia, malaria, or pyelonephritis. Their presence raises severity.', category: 'life_threatening' },
    { id: 'fever_localizing', label: 'Localizing Symptoms', features: ['cough', 'dysuria', 'flank_pain', 'headache', 'neck_pain', 'abdominal_pain'], priority: 80, rationale: 'Localizing symptoms identify the source of infection — critical for targeted management.', category: 'diagnostic' },
    { id: 'fever_rash', label: 'Rash with Fever', features: ['skin_rash'], priority: 85, rationale: 'Fever with rash = meningococcemia, dengue, Still disease, or drug fever. Petechiae = EMERGENCY.', category: 'life_threatening' },
    { id: 'fever_vitals', label: 'Hemodynamic Status', features: ['syncope', 'palpitations', 'dyspnea'], priority: 95, rationale: 'Hypotension/tachycardia with fever = sepsis until proven.', category: 'life_threatening' },
    { id: 'fever_neurological', label: 'Neurological Symptoms', features: ['confusion', 'seizure', 'numbness_tingling', 'neck_stiffness'], priority: 95, rationale: 'Altered mental status + fever = CNS infection (meningitis/encephalitis) — treat empirically.', category: 'life_threatening' },
    { id: 'fever_weight_loss', label: 'Constitutional Symptoms', features: ['weight_loss', 'fatigue', 'night_sweats'], priority: 70, rationale: 'Chronic fever with weight loss and night sweats = TB, lymphoma, or autoimmune disease.', category: 'diagnostic' },
    { id: 'fever_joint_muscle', label: 'Joint and Muscle Pain', features: ['joint_pain', 'myalgia'], priority: 65, rationale: 'Severe myalgia = influenza or dengue. Arthralgia + fever = Still disease or viral arthritis.', category: 'diagnostic' },
    { id: 'fever_travel', label: 'Travel / Exposure History', features: ['recent_travel', 'ivdu', 'hiv_status'], priority: 75, rationale: 'Travel + fever = malaria, dengue, typhoid. Immunosuppression broadens differential.', category: 'risk_factor' },
    { id: 'fever_drug_history', label: 'Drug History', features: ['medication_list'], priority: 60, rationale: 'Drug fever is a diagnosis of exclusion — any drug can cause it.', category: 'management' },
  ];

  for (const def of FEVER_GAP_DEFS) {
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
          groupLabel: 'Fever Assessment',
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
            groupLabel: 'Fever Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getFeverPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of FEVER_PATTERNS) {
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
          reasonEssential: `Fever pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedFeverPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of FEVER_DDX) {
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
