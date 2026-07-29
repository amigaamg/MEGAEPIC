import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type HeadacheType = 'primary_tension' | 'primary_migraine' | 'primary_cluster' | 'primary_trigeminal' | 'secondary_vascular' | 'secondary_infectious' | 'secondary_structural' | 'secondary_medication' | 'secondary_giant_cell' | 'secondary_tension' | 'other';
type HeadacheOnset = 'instantaneous_thunderclap' | 'acute_hours' | 'subacute_days' | 'chronic_months' | 'chronic_years' | 'episodic' | 'gradual';
type HeadacheLocation = 'unilateral' | 'bilateral' | 'frontal' | 'occipital' | 'temporal' | 'periorbital' | 'holocranial' | 'variable';

interface HeadacheDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  headacheType: HeadacheType;
  typicalOnset: HeadacheOnset;
  typicalLocation: HeadacheLocation;
  quality: string[];
  duration: string;
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  aura: boolean;
  triggers: string[];
  typicalDescription: string;
}

interface HeadachePatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const HEADACHE_DDX: HeadacheDisease[] = [
  {
    diseaseId: 'tension_headache', diseaseName: 'Tension-Type Headache', icdCode: 'G44.2',
    headacheType: 'primary_tension', typicalOnset: 'gradual',
    typicalLocation: 'bilateral', quality: ['Pressing', 'Tightening', 'Band-like', 'Dull ache'],
    duration: '30 min to 7 days',
    ageRange: [5, 80], agePeak: [20, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.4,
    riskFactors: ['stress', 'anxiety', 'poor_sleep', 'neck_tension', 'eye_strain'],
    redFlags: [],
    associatedSymptoms: ['mild_photophobia', 'mild_phonophobia'],
    aura: false,
    triggers: ['Stress', 'Fatigue', 'Poor posture', 'Eye strain'],
    typicalDescription: 'Bilateral pressing/tightening band-like headache. Mild to moderate intensity. Not aggravated by routine physical activity. No nausea or vomiting.',
  },
  {
    diseaseId: 'migraine_without_aura', diseaseName: 'Migraine Without Aura', icdCode: 'G43.0',
    headacheType: 'primary_migraine', typicalOnset: 'gradual',
    typicalLocation: 'unilateral', quality: ['Pulsating', 'Throbbing', 'Pounding'],
    duration: '4-72 hours',
    ageRange: [10, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.12,
    riskFactors: ['family_history_migraine', 'female_sex', 'hormonal_changes'],
    redFlags: ['status_migrainosus', 'migrainous_infarction'],
    associatedSymptoms: ['nausea', 'vomiting', 'photophobia', 'phonophobia', 'osmophobia'],
    aura: false,
    triggers: ['Menstruation', 'Certain foods', 'Sleep deprivation', 'Weather changes', 'Stress'],
    typicalDescription: 'Recurrent unilateral throbbing headache with nausea, photophobia, and phonophobia. Lasts 4-72 hours. Worsened by routine physical activity.',
  },
  {
    diseaseId: 'migraine_with_aura', diseaseName: 'Migraine With Aura', icdCode: 'G43.1',
    headacheType: 'primary_migraine', typicalOnset: 'gradual',
    typicalLocation: 'unilateral', quality: ['Pulsating', 'Throbbing'],
    duration: '4-72 hours',
    ageRange: [10, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.04,
    riskFactors: ['family_history_migraine', 'female_sex'],
    redFlags: ['prolonged_aura', 'brainstem_aura', 'hemiplegic_migraine'],
    associatedSymptoms: ['nausea', 'vomiting', 'photophobia', 'phonophobia', 'visual_aura', 'sensory_aura'],
    aura: true,
    triggers: ['Menstruation', 'Certain foods', 'Sleep deprivation', 'Stress'],
    typicalDescription: 'Migraine preceded by reversible visual, sensory, or speech symptoms lasting 5-60 minutes. Aura typically resolves before headache phase.',
  },
  {
    diseaseId: 'cluster_headache', diseaseName: 'Cluster Headache', icdCode: 'G44.0',
    headacheType: 'primary_cluster', typicalOnset: 'acute_hours',
    typicalLocation: 'unilateral', quality: ['Sharp', 'Stabbing', 'Boring', 'Burning'],
    duration: '15-180 minutes',
    ageRange: [20, 70], agePeak: [30, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['smoking', 'male_sex', 'family_history_cluster'],
    redFlags: [],
    associatedSymptoms: ['ipsilateral_lacrimation', 'ipsilateral_rhinorrhea', 'ptosis', 'miosis', 'facial_sweating', 'restlessness'],
    aura: false,
    triggers: ['Alcohol', 'Strong smells', 'Sleep', 'Stress'],
    typicalDescription: 'Severe strictly unilateral orbital/supraorbital pain with ipsilateral autonomic features. Patient is restless and agitated during attacks.',
  },
  {
    diseaseId: 'subarachnoid_hemorrhage', diseaseName: 'Subarachnoid Hemorrhage', icdCode: 'I60.9',
    headacheType: 'secondary_vascular', typicalOnset: 'instantaneous_thunderclap',
    typicalLocation: 'holocranial', quality: ['Worst_of_life', 'Severe', 'Explosive'],
    duration: 'Continuous',
    ageRange: [20, 80], agePeak: [40, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.001,
    riskFactors: ['hypertension', 'smoking', 'family_history_aneurysm', 'autosomal_dominant_polycystic_kidney', 'ehlers_danlos'],
    redFlags: ['thunderclap_onset', 'neck_stiffness', 'photophobia', 'vomiting', 'syncope'],
    associatedSymptoms: ['neck_stiffness', 'photophobia', 'vomiting', 'syncope', 'seizure', 'decreased_consciousness'],
    aura: false,
    triggers: ['Exertion', 'Valsalva', 'Sexual_activity'],
    typicalDescription: 'Sudden explosive "thunderclap" headache peaking within seconds — worst headache of life. Associated with neck stiffness and photophobia from meningeal irritation.',
  },
  {
    diseaseId: 'bacterial_meningitis', diseaseName: 'Bacterial Meningitis', icdCode: 'G00.9',
    headacheType: 'secondary_infectious', typicalOnset: 'acute_hours',
    typicalLocation: 'holocranial', quality: ['Severe', 'Throbbing', 'Constant'],
    duration: 'Continuous',
    ageRange: [0, 90], agePeak: [0, 5],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['age', 'immunosuppression', 'asplenia', 'cochlear_implant', 'crowding'],
    redFlags: ['neck_stiffness', 'fever', 'altered_mental_status', 'petechial_rash', 'seizure'],
    associatedSymptoms: ['fever', 'neck_stiffness', 'photophobia', 'vomiting', 'confusion', 'seizure'],
    aura: false,
    triggers: [],
    typicalDescription: 'Severe progressive headache with fever, neck stiffness, and altered mental status. Kernig and Brudzinski signs may be positive.',
  },
  {
    diseaseId: 'encephalitis', diseaseName: 'Viral Encephalitis', icdCode: 'G04.9',
    headacheType: 'secondary_infectious', typicalOnset: 'acute_hours',
    typicalLocation: 'holocranial', quality: ['Severe', 'Constant'],
    duration: 'Days to weeks',
    ageRange: [0, 80], agePeak: [5, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['immunosuppression', 'mosquito_exposure', 'herpes_simplex'],
    redFlags: ['altered_mental_status', 'seizure', 'focal_neurological_signs', 'confusion'],
    associatedSymptoms: ['fever', 'confusion', 'seizure', 'behavioral_change', 'focal_neurological_deficit'],
    aura: false,
    triggers: [],
    typicalDescription: 'Fever, headache, and altered mental status with focal neurological signs or seizures. HSV encephalitis has temporal lobe predilection.',
  },
  {
    diseaseId: 'giant_cell_arteritis', diseaseName: 'Giant Cell Arteritis (Temporal Arteritis)', icdCode: 'M31.6',
    headacheType: 'secondary_giant_cell', typicalOnset: 'subacute_days',
    typicalLocation: 'temporal', quality: ['Throbbing', 'Ache', 'Tender'],
    duration: 'Weeks to months',
    ageRange: [50, 90], agePeak: [65, 85],
    sexPredilection: 'female', backgroundPrevalence: 0.002,
    riskFactors: ['age_over_50', 'polymyalgia_rheumatica', 'female_sex', 'northern_european_ancestry'],
    redFlags: ['visual_loss', 'jaw_claudication', 'scalp_tenderness'],
    associatedSymptoms: ['scalp_tenderness', 'jaw_claudication', 'visual_disturbance', 'myalgia', 'fatigue', 'fever', 'weight_loss'],
    aura: false,
    triggers: [],
    typicalDescription: 'New-onset headache in patient over 50 with scalp tenderness and jaw claudication. Elevated ESR/CRP. Urgent steroids needed to prevent blindness.',
  },
  {
    diseaseId: 'cerebral_venous_thrombosis', diseaseName: 'Cerebral Venous Sinus Thrombosis', icdCode: 'I63.6',
    headacheType: 'secondary_vascular', typicalOnset: 'subacute_days',
    typicalLocation: 'holocranial', quality: ['Severe', 'Progressive', 'Pressure'],
    duration: 'Days',
    ageRange: [15, 60], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.0005,
    riskFactors: ['pregnancy', 'postpartum', 'oral_contraceptives', 'thrombophilia', 'dehydration', 'infection'],
    redFlags: ['seizure', 'neurological_deficit', 'papilledema', 'altered_consciousness'],
    associatedSymptoms: ['seizure', 'neurological_deficit', 'papilledema', 'vomiting'],
    aura: false,
    triggers: [],
    typicalDescription: 'Severe progressive headache with seizures and focal neurological signs. May present with isolated intracranial hypertension. High index of suspicion in postpartum women.',
  },
  {
    diseaseId: 'intracranial_tumor', diseaseName: 'Intracranial Tumor (Mass Effect)', icdCode: 'C71.9',
    headacheType: 'secondary_structural', typicalOnset: 'chronic_months',
    typicalLocation: 'variable', quality: ['Dull ache', 'Pressure', 'Progressive'],
    duration: 'Weeks to months',
    ageRange: [1, 90], agePeak: [40, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['family_history_brain_tumor', 'radiation_exposure', 'immunosuppression', 'neurofibromatosis'],
    redFlags: ['progressive_worsening', 'early_morning_headache', 'vomiting_without_nausea', 'papilledema', 'focal_neurological_deficit', 'seizure'],
    associatedSymptoms: ['nausea', 'vomiting', 'papilledema', 'focal_neurological_deficit', 'seizure', 'personality_change'],
    aura: false,
    triggers: [],
    typicalDescription: 'Progressive headache worse in morning, associated with vomiting and neurological deficits. Papilledema on fundoscopy.',
  },
  {
    diseaseId: 'medication_overuse_headache', diseaseName: 'Medication-Overuse Headache', icdCode: 'G44.4',
    headacheType: 'secondary_medication', typicalOnset: 'chronic_months',
    typicalLocation: 'bilateral', quality: ['Dull ache', 'Pressure', 'Variable'],
    duration: 'Daily or near-daily',
    ageRange: [15, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['chronic_headache', 'frequent_analgesic_use', 'triptan_overuse', 'opioid_use'],
    redFlags: [],
    associatedSymptoms: ['fatigue', 'irritability', 'difficulty_concentrating'],
    aura: false,
    triggers: ['Analgesic_withdrawal'],
    typicalDescription: 'Daily or near-daily headache in a patient using acute headache medication >10-15 days/month. Improves with medication withdrawal.',
  },
  {
    diseaseId: 'cervicogenic_headache', diseaseName: 'Cervicogenic Headache', icdCode: 'G44.8',
    headacheType: 'secondary_tension', typicalOnset: 'chronic_months',
    typicalLocation: 'occipital', quality: ['Dull ache', 'Pressure', 'Stiffness'],
    duration: 'Hours to days',
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['neck_injury', 'whiplash', 'poor_posture', 'cervical_spondylosis'],
    redFlags: [],
    associatedSymptoms: ['neck_pain', 'neck_stiffness', 'shoulder_pain', 'limited_neck_movement'],
    aura: false,
    triggers: ['Neck_movement', 'Prolonged_posture'],
    typicalDescription: 'Unilateral headache originating from the neck, with neck pain and stiffness. Pain radiates from occiput to frontotemporal region.',
  },
  {
    diseaseId: 'hypertensive_encephalopathy', diseaseName: 'Hypertensive Encephalopathy / PRES', icdCode: 'I67.4',
    headacheType: 'secondary_vascular', typicalOnset: 'subacute_days',
    typicalLocation: 'holocranial', quality: ['Severe', 'Pounding', 'Pressure'],
    duration: 'Continuous',
    ageRange: [20, 80], agePeak: [30, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['severe_hypertension', 'renal_disease', 'immunosuppression', 'eclampsia', 'chemotherapy'],
    redFlags: ['visual_disturbance', 'seizure', 'confusion', 'hypertension_malignant'],
    associatedSymptoms: ['hypertension_severe', 'visual_disturbance', 'confusion', 'seizure', 'nausea'],
    aura: false,
    triggers: ['Uncontrolled_hypertension'],
    typicalDescription: 'Severe headache with markedly elevated blood pressure, visual changes, and confusion. Posterior reversible encephalopathy syndrome (PRES) on imaging.',
  },
  {
    diseaseId: 'post_lumbar_puncture', diseaseName: 'Post-Dural Puncture Headache', icdCode: 'G97.0',
    headacheType: 'secondary_structural', typicalOnset: 'acute_hours',
    typicalLocation: 'bilateral', quality: ['Dull ache', 'Pressure'],
    duration: 'Days',
    ageRange: [15, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['recent_lumbar_puncture', 'epidural_anesthesia', 'myelogram', 'young_age', 'female_sex'],
    redFlags: [],
    associatedSymptoms: ['neck_stiffness', 'tinnitus', 'photophobia', 'nausea'],
    aura: false,
    triggers: ['Sitting_up', 'Standing'],
    typicalDescription: 'Postural headache worse on sitting/standing and relieved by lying flat, following dural puncture. May have neck stiffness and tinnitus.',
  },
  {
    diseaseId: 'trigeminal_neuralgia', diseaseName: 'Trigeminal Neuralgia', icdCode: 'G50.0',
    headacheType: 'primary_trigeminal', typicalOnset: 'instantaneous_thunderclap',
    typicalLocation: 'unilateral', quality: ['Electric_shock', 'Stabbing', 'Shooting'],
    duration: 'Seconds to 2 minutes',
    ageRange: [30, 80], agePeak: [50, 70],
    sexPredilection: 'female', backgroundPrevalence: 0.003,
    riskFactors: ['multiple_sclerosis', 'female_sex', 'age'],
    redFlags: ['sensory_loss', 'multiple_cranial_neuropathies'],
    associatedSymptoms: ['facial_pain', 'trigger_zones', 'wincing'],
    aura: false,
    triggers: ['Light_touch', 'Chewing', 'Brushing_teeth', 'Cold_wind'],
    typicalDescription: 'Brief electric-shock-like unilateral facial pain in trigeminal distribution, triggered by light touch. Remissions and exacerbations.',
  },
];

const HEADACHE_PATTERNS: HeadachePatternRule[] = [
  {
    id: 'thunderclap_headache', label: 'Thunderclap Headache',
    description: 'Sudden explosive headache peaking in <60 seconds = SAH until proven',
    pattern: ['headache', 'pain_onset'],
    suggests: ['subarachnoid_hemorrhage'],
    rulesOut: ['tension_headache', 'migraine_without_aura', 'cervicogenic_headache'],
    priorityBoost: 40,
  },
  {
    id: 'migrainous_pattern', label: 'Migraine Pattern',
    description: 'Unilateral throbbing + nausea + photophobia/phonophobia = migraine',
    pattern: ['headache', 'nausea', 'photophobia'],
    suggests: ['migraine_without_aura', 'migraine_with_aura'],
    rulesOut: ['tension_headache', 'cluster_headache', 'medication_overuse_headache'],
    priorityBoost: 25,
  },
  {
    id: 'cluster_autonomic', label: 'Cluster with Autonomic Features',
    description: 'Unilateral severe pain + ipsilateral autonomic features = cluster headache',
    pattern: ['headache', 'nasal_congestion', 'eye_pain'],
    suggests: ['cluster_headache'],
    rulesOut: ['migraine_without_aura', 'tension_headache', 'trigeminal_neuralgia'],
    priorityBoost: 25,
  },
  {
    id: 'meningitis_triad', label: 'Meningitis Triad',
    description: 'Headache + fever + neck stiffness = meningitis until proven',
    pattern: ['headache', 'fever', 'neck_pain'],
    suggests: ['bacterial_meningitis', 'encephalitis'],
    rulesOut: ['tension_headache', 'migraine_without_aura', 'cervicogenic_headache'],
    priorityBoost: 35,
  },
  {
    id: 'giant_cell_arteritis', label: 'Giant Cell Arteritis (Age >50)',
    description: 'New headache in patient >50 + scalp tenderness/jaw claudication = GCA',
    pattern: ['headache', 'weight_loss'],
    suggests: ['giant_cell_arteritis'],
    rulesOut: ['tension_headache', 'migraine_without_aura', 'cervicogenic_headache'],
    priorityBoost: 30,
  },
  {
    id: 'tension_pattern', label: 'Tension-Type Headache Pattern',
    description: 'Bilateral pressing/tightening band-like headache without nausea = tension headache',
    pattern: ['headache', 'neck_pain'],
    suggests: ['tension_headache', 'cervicogenic_headache'],
    rulesOut: ['migraine_without_aura', 'cluster_headache', 'subarachnoid_hemorrhage'],
    priorityBoost: 15,
  },
  {
    id: 'cerebral_venous', label: 'Headache + Seizure + Neurological Deficit',
    description: 'Headache with seizure and focal signs in postpartum/OCP user = CVT',
    pattern: ['headache', 'seizure', 'numbness_tingling'],
    suggests: ['cerebral_venous_thrombosis'],
    rulesOut: ['tension_headache', 'migraine_without_aura'],
    priorityBoost: 30,
  },
  {
    id: 'brain_tumor_pattern', label: 'Progressive Headache + Vomiting + Neuro Signs',
    description: 'Progressive headache worse in morning with vomiting and focal signs = mass lesion',
    pattern: ['headache', 'vomiting', 'numbness_tingling'],
    suggests: ['intracranial_tumor'],
    rulesOut: ['tension_headache', 'medication_overuse_headache'],
    priorityBoost: 25,
  },
  {
    id: 'medication_overuse', label: 'Daily Headache with Frequent Medication Use',
    description: 'Daily/near-daily headache in patient using PRN analgesics >10 days/month = MOH',
    pattern: ['headache', 'medication_list'],
    suggests: ['medication_overuse_headache'],
    rulesOut: ['intracranial_tumor', 'giant_cell_arteritis'],
    priorityBoost: 15,
  },
  {
    id: 'trigeminal_shock', label: 'Electric Shock Facial Pain',
    description: 'Brief unilateral electric shock pain triggered by light touch = trigeminal neuralgia',
    pattern: ['headache', 'numbness_tingling'],
    suggests: ['trigeminal_neuralgia'],
    rulesOut: ['cluster_headache', 'migraine_without_aura', 'giant_cell_arteritis'],
    priorityBoost: 20,
  },
  {
    id: 'hypertensive_emergency', label: 'Severe Headache + Hypertension + Visual Change',
    description: 'Severe headache with markedly elevated BP and visual changes = hypertensive encephalopathy',
    pattern: ['headache', 'visual_disturbance', 'hypertension'],
    suggests: ['hypertensive_encephalopathy'],
    rulesOut: ['migraine_without_aura', 'tension_headache'],
    priorityBoost: 30,
  },
  {
    id: 'cervicogenic_occipital', label: 'Occipital Headache with Neck Pain',
    description: 'Unilateral occipital headache originating from neck with restricted movement = cervicogenic',
    pattern: ['headache', 'neck_pain'],
    suggests: ['cervicogenic_headache'],
    rulesOut: ['migraine_without_aura', 'subarachnoid_hemorrhage', 'tension_headache'],
    priorityBoost: 15,
  },
];

export function getHeadacheDdx(): HeadacheDisease[] {
  return HEADACHE_DDX;
}

export function getHeadachePatterns(): HeadachePatternRule[] {
  return HEADACHE_PATTERNS;
}

export function classifyHeadacheType(
  onset: string,
  quality: string,
  location: string,
  nausea: boolean,
  photophobia: boolean,
  autonomic: boolean,
  age: number,
): { primaryType: HeadacheType; confidence: 'high' | 'moderate' | 'low'; rationale: string } {
  if (onset === 'instantaneous_thunderclap') {
    return { primaryType: 'secondary_vascular', confidence: 'high', rationale: 'Thunderclap onset = vascular cause (SAH, CVT, PRES) until proven.' };
  }
  if (quality.includes('throbbing') && nausea && photophobia) {
    return { primaryType: 'primary_migraine', confidence: 'high', rationale: 'Unilateral throbbing with nausea and photophobia = migraine.' };
  }
  if (autonomic && quality.includes('sharp')) {
    return { primaryType: 'primary_cluster', confidence: 'moderate', rationale: 'Unilateral severe pain with autonomic features = cluster headache.' };
  }
  if (quality.includes('pressing') || quality.includes('tight')) {
    return { primaryType: 'primary_tension', confidence: 'moderate', rationale: 'Bilateral pressing/tightening without nausea = tension-type headache.' };
  }
  if (age > 50) {
    return { primaryType: 'secondary_giant_cell', confidence: 'low', rationale: 'Age >50 with new headache = rule out giant cell arteritis.' };
  }
  return { primaryType: 'other', confidence: 'low', rationale: 'Unable to classify with available data.' };
}

export function getHeadacheGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const HEADACHE_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'headache_presence', label: 'Headache Recognition', features: ['headache'], priority: 95, rationale: 'Confirm headache characteristics as the presenting symptom.', category: 'documentation' },
    { id: 'headache_onset', label: 'Headache Onset', features: ['pain_onset', 'pain_onset_sudden'], priority: 100, rationale: 'CRITICAL: Thunderclap onset (peaking in <60 sec) = SAH until proven otherwise.', category: 'life_threatening' },
    { id: 'headache_quality', label: 'Headache Quality', features: ['pain_character'], priority: 85, rationale: 'Throbbing = migraine. Pressing/tight = tension. Sharp/stabbing = cluster or trigeminal.', category: 'diagnostic' },
    { id: 'headache_location', label: 'Headache Location', features: ['pain_initial_location', 'pain_location_now'], priority: 80, rationale: 'Unilateral = migraine/cluster. Bilateral = tension. Temporal = GCA. Occipital = cervicogenic.', category: 'diagnostic' },
    { id: 'headache_severity', label: 'Headache Severity', features: ['pain_severity'], priority: 75, rationale: 'Severity guides urgency. Worst-of-life = SAH until proven.', category: 'diagnostic' },
    { id: 'headache_nausea', label: 'Nausea/Vomiting with Headache', features: ['nausea', 'vomiting'], priority: 85, rationale: 'Nausea + headache = migraine. Vomiting without nausea = raised ICP or SAH.', category: 'diagnostic' },
    { id: 'headache_photophobia', label: 'Photophobia/Phonophobia', features: ['photophobia', 'phonophobia'], priority: 70, rationale: 'Photophobia + phonophobia = migraine or meningitis. Photophobia alone = SAH or meningitis.', category: 'diagnostic' },
    { id: 'headache_neck_stiffness', label: 'Neck Stiffness', features: ['neck_pain', 'neck_stiffness'], priority: 95, rationale: 'RED FLAG: Headache + neck stiffness = meningitis or SAH until proven.', category: 'life_threatening' },
    { id: 'headache_neurological', label: 'Neurological Symptoms', features: ['numbness_tingling', 'weakness', 'visual_disturbance', 'seizure', 'confusion'], priority: 95, rationale: 'RED FLAG: Headache with neurological symptoms = structural or vascular cause.', category: 'life_threatening' },
    { id: 'headache_fever', label: 'Fever with Headache', features: ['fever', 'fever_chills'], priority: 90, rationale: 'Fever + headache = CNS infection until proven. Meningitis and encephalitis are time-critical.', category: 'life_threatening' },
    { id: 'headache_autonomic', label: 'Autonomic Features', features: ['nasal_congestion', 'eye_pain', 'facial_swelling'], priority: 65, rationale: 'Ipsilateral autonomic features = cluster headache or trigeminal autonomic cephalalgia.', category: 'diagnostic' },
    { id: 'headache_visual', label: 'Visual Changes / Aura', features: ['visual_disturbance', 'vision_loss'], priority: 75, rationale: 'Visual aura = migraine. Visual loss = GCA or raised ICP. Blurred vision = PRES or HTN emergency.', category: 'diagnostic' },
    { id: 'headache_temporal', label: 'Scalp Tenderness / Jaw Claudication', features: ['scalp_tenderness', 'jaw_claudication'], priority: 85, rationale: 'Age >50 + scalp tenderness + jaw claudication = giant cell arteritis. URGENT steroids to prevent blindness.', category: 'life_threatening' },
    { id: 'headache_postural', label: 'Postural Component', features: ['headache_worse_standing', 'headache_relieved_lying'], priority: 60, rationale: 'Postural headache = CSF leak/post-LP headache. Worse on standing, better lying flat.', category: 'diagnostic' },
  ];

  for (const def of HEADACHE_GAP_DEFS) {
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
          groupLabel: 'Headache Assessment',
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
            groupLabel: 'Headache Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getHeadachePatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of HEADACHE_PATTERNS) {
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
          reasonEssential: `Headache pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedHeadachePriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of HEADACHE_DDX) {
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
