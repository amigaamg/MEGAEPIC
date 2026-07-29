import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type DizzinessCategory = 'vestibular_peripheral' | 'vestibular_central' | 'cardiac' | 'orthostatic' | 'metabolic' | 'psychogenic' | 'medication_induced' | 'cervicogenic' | 'other';

interface DizzinessDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: DizzinessCategory;
  quality: 'vertigo_spinning' | 'lightheadedness' | 'imbalance' | 'presyncope' | 'mixed';
  duration: 'seconds' | 'minutes' | 'hours' | 'days' | 'chronic_weeks' | 'variable';
  triggers: string[];
  nystagmus: 'horizontal' | 'vertical' | 'rotatory' | 'none' | 'positional';
  neurologicalSigns: string[];
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface DizzinessPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const DIZZINESS_DDX: DizzinessDisease[] = [
  {
    diseaseId: 'bppv', diseaseName: 'Benign Paroxysmal Positional Vertigo', icdCode: 'H81.1',
    category: 'vestibular_peripheral', quality: 'vertigo_spinning',
    duration: 'seconds', triggers: ['head_movement', 'rolling_over_bed', 'looking_up', 'bending_forward'],
    nystagmus: 'positional', neurologicalSigns: [],
    ageRange: [20, 90], agePeak: [50, 80],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['age', 'head_trauma', 'female_sex', 'prolonged_bed_rest'],
    redFlags: ['central_nystagmus', 'neurological_deficit'],
    associatedSymptoms: ['nausea', 'imbalance_during_episode', 'no_hearing_loss'],
    typicalDescription: 'Brief (<60 seconds) vertigo triggered by head position changes. Dix-Hallpike test reproduces symptoms with fatigable nystagmus. No neurological signs.',
  },
  {
    diseaseId: 'vestibular_neuritis', diseaseName: 'Vestibular Neuritis (Vestibular Neuronitis)', icdCode: 'H81.2',
    category: 'vestibular_peripheral', quality: 'vertigo_spinning',
    duration: 'hours', triggers: ['spontaneous'],
    nystagmus: 'horizontal', neurologicalSigns: [],
    ageRange: [20, 70], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.003,
    riskFactors: ['recent_viral_illness', 'stress'],
    redFlags: ['hearing_loss', 'neurological_deficit', 'persistent_vertigo_days'],
    associatedSymptoms: ['nausea_vomiting_severe', 'imbalance', 'oscillopsia', 'no_hearing_loss', 'recent_uri'],
    typicalDescription: 'Acute severe vertigo lasting hours to days with nausea and vomiting. Horizontal nystagmus away from affected ear. No hearing loss. Recent viral illness common.',
  },
  {
    diseaseId: 'labyrinthitis', diseaseName: 'Labyrinthitis', icdCode: 'H83.0',
    category: 'vestibular_peripheral', quality: 'vertigo_spinning',
    duration: 'days', triggers: ['spontaneous'],
    nystagmus: 'horizontal', neurologicalSigns: ['hearing_loss_ipsilateral'],
    ageRange: [20, 70], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['recent_viral_illness', 'bacterial_meningitis'],
    redFlags: ['hearing_loss', 'meningeal_signs'],
    associatedSymptoms: ['hearing_loss', 'tinnitus', 'nausea_vomiting', 'recent_uri'],
    typicalDescription: 'Acute vertigo with ipsilateral hearing loss and tinnitus. Distinguishes labyrinthitis from vestibular neuritis. Hearsay test shows sensorineural hearing loss.',
  },
  {
    diseaseId: 'meniere_disease', diseaseName: 'Meniere Disease', icdCode: 'H81.0',
    category: 'vestibular_peripheral', quality: 'vertigo_spinning',
    duration: 'minutes', triggers: ['spontaneous', 'stress'],
    nystagmus: 'rotatory', neurologicalSigns: ['hearing_loss_fluctuating', 'tinnitus'],
    ageRange: [20, 70], agePeak: [40, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.001,
    riskFactors: ['family_history', 'female_sex', 'stress', 'high_salt_diet'],
    redFlags: ['hearing_loss_progressive', 'drop_attacks'],
    associatedSymptoms: ['tinnitus', 'hearing_loss_fluctuating', 'aural_fullness', 'nausea_vomiting'],
    typicalDescription: 'Recurrent episodes of vertigo lasting 20 minutes to 12 hours with fluctuating hearing loss, tinnitus, and aural fullness. Classic triad: vertigo, tinnitus, hearing loss.',
  },
  {
    diseaseId: 'vestibular_migraine', diseaseName: 'Vestibular Migraine', icdCode: 'G43.1',
    category: 'vestibular_central', quality: 'vertigo_spinning',
    duration: 'minutes', triggers: ['stress', 'lack_of_sleep', 'certain_foods', 'hormonal_changes'],
    nystagmus: 'horizontal', neurologicalSigns: ['migraine_history', 'photophobia', 'phonophobia'],
    ageRange: [10, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.01,
    riskFactors: ['female_sex', 'migraine_history', 'family_history_migraine'],
    redFlags: ['new_onset_over_50', 'neurological_deficit'],
    associatedSymptoms: ['headache', 'photophobia', 'phonophobia', 'visual_aura', 'nausea'],
    typicalDescription: 'Episodic vertigo with migraine features. May occur without headache. Duration 5 minutes to 72 hours. Responds to migraine therapy.',
  },
  {
    diseaseId: 'central_vertigo_stroke', diseaseName: 'Central Vertigo — Stroke / TIA (Brainstem / Cerebellar)', icdCode: 'I63.9',
    category: 'vestibular_central', quality: 'vertigo_spinning',
    duration: 'minutes', triggers: ['spontaneous', 'head_movement'],
    nystagmus: 'vertical', neurologicalSigns: ['dysarthria', 'diplopia', 'dysphagia', 'hemisensory_loss', 'limb_ataxia', 'facial_weakness'],
    ageRange: [40, 95], agePeak: [55, 85],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['age', 'hypertension', 'diabetes', 'smoking', 'atrial_fibrillation', 'hyperlipidemia', 'previous_stroke'],
    redFlags: ['vertical_nystagmus', 'neurological_deficit', 'dysarthria', 'ataxia'],
    associatedSymptoms: ['vertigo', 'dysarthria', 'diplopia', 'dysphagia', 'hemiparesis', 'ataxia', 'facial_numbness'],
    typicalDescription: 'Acute vertigo with brainstem signs (dysarthria, diplopia, dysphagia). Vertical nystagmus suggests central origin. HINTS exam crucial for differentiation.',
  },
  {
    diseaseId: 'orthostatic_hypotension', diseaseName: 'Orthostatic Hypotension', icdCode: 'I95.1',
    category: 'orthostatic', quality: 'lightheadedness',
    duration: 'seconds', triggers: ['standing_up', 'prolonged_standing'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [10, 95], agePeak: [50, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['dehydration', 'antihypertensives', 'diuretics', 'parkinson_disease', 'diabetes', 'age', 'blood_loss'],
    redFlags: ['syncope', 'falls', 'cardiac_arrhythmia'],
    associatedSymptoms: ['lightheadedness_on_standing', 'visual_dimming', 'weakness', 'syncope', 'no_vertigo'],
    typicalDescription: 'Lightheadedness or presyncope on standing, relieved by sitting/lying. BP drop of >20/10 mmHg within 3 minutes of standing. No vertigo or nystagmus.',
  },
  {
    diseaseId: 'cardiac_arrhythmia_dizziness', diseaseName: 'Cardiac Arrhythmia (Bradycardia / Tachycardia / AF)', icdCode: 'I49.9',
    category: 'cardiac', quality: 'presyncope',
    duration: 'seconds', triggers: ['exertion', 'stress', 'palpitation_onset', 'none'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [0, 95], agePeak: [40, 85],
    sexPredilection: 'none', backgroundPrevalence: 0.03,
    riskFactors: ['age', 'heart_disease', 'structural_heart_disease', 'electrolyte_abnormalities', 'family_history_sudden_death', 'drugs'],
    redFlags: ['syncope', 'chest_pain', 'palpitations', 'family_history_sudden_cardiac_death'],
    associatedSymptoms: ['palpitations', 'syncope', 'chest_pain', 'dyspnea', 'fatigue'],
    typicalDescription: 'Sudden presyncope or syncope with or without palpitations. May be exertional. ECG shows arrhythmia. Episodes are brief and unpredictable.',
  },
  {
    diseaseId: 'vasovagal_syncope', diseaseName: 'Vasovagal Syncope (Reflex Syncope)', icdCode: 'R55',
    category: 'cardiac', quality: 'presyncope',
    duration: 'seconds', triggers: ['emotional_stress', 'pain', 'fear', 'prolonged_standing', 'hot_environment', 'micturition', 'cough', 'defecation'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [5, 80], agePeak: [15, 40],
    sexPredilection: 'none', backgroundPrevalence: 0.2,
    riskFactors: ['dehydration', 'prolonged_standing', 'emotional_triggers'],
    redFlags: ['syncope_without_prodrome', 'exertional_syncope', 'cardiac_history'],
    associatedSymptoms: ['nausea', 'sweating', 'visual_dimming', 'warm_feeling', 'lightheadedness', 'syncope'],
    typicalDescription: 'Prodrome of nausea, sweating, and visual dimming followed by brief syncope. Triggered by emotion, pain, or prolonged standing. Rapid recovery.',
  },
  {
    diseaseId: 'panic_attack_dizziness', diseaseName: 'Panic Attack / Anxiety (Dizziness)', icdCode: 'F41.0',
    category: 'psychogenic', quality: 'lightheadedness',
    duration: 'minutes', triggers: ['stress', 'anxiety', 'panic_triggers', 'crowds'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [10, 70], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.03,
    riskFactors: ['anxiety_disorder', 'depression', 'female_sex', 'stress'],
    redFlags: ['suicidal_ideation', 'psychosis'],
    associatedSymptoms: ['palpitations', 'hyperventilation', 'chest_tightness', 'paresthesia', 'fear_of_dying', 'derealization'],
    typicalDescription: 'Lightheadedness with palpitations, hyperventilation, chest tightness, and paresthesia. Associated with fear and anxiety. No objective vestibular signs.',
  },
  {
    diseaseId: 'medication_induced_dizziness', diseaseName: 'Medication-Induced Dizziness', icdCode: 'R42',
    category: 'medication_induced', quality: 'lightheadedness',
    duration: 'variable', triggers: ['medication intake', 'dose change'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [0, 95], agePeak: [30, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.05,
    riskFactors: ['polypharmacy', 'elderly', 'antihypertensives', 'sedatives', 'anticonvulsants', 'aminoglycosides', 'diuretics', 'antidepressants'],
    redFlags: ['severe_hypotension', 'bradycardia'],
    associatedSymptoms: ['dizziness_medication_linked', 'somnolence', 'hypotension', 'ataxia'],
    typicalDescription: 'Dizziness temporally related to starting or changing medication. Common culprits: antihypertensives, benzodiazepines, anticonvulsants, aminoglycosides.',
  },
  {
    diseaseId: 'anemia_dizziness', diseaseName: 'Anemia (Dizziness / Fatigue)', icdCode: 'D64.9',
    category: 'metabolic', quality: 'lightheadedness',
    duration: 'chronic_weeks', triggers: ['exertion', 'prolonged_standing'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [1, 95], agePeak: [20, 50],
    sexPredilection: 'female', backgroundPrevalence: 0.08,
    riskFactors: ['menorrhagia', 'poor_diet', 'chronic_disease', 'gi_bleeding', 'pregnancy'],
    redFlags: ['severe_anemia', 'cardiac_failure', 'active_bleeding'],
    associatedSymptoms: ['fatigue', 'pallor', 'dyspnea_on_exertion', 'palpitations', 'weakness', 'lightheadedness'],
    typicalDescription: 'Chronic lightheadedness with fatigue, pallor, and exertional dyspnea. Normal vestibular and cardiac exam. Low hemoglobin and hematocrit.',
  },
  {
    diseaseId: 'hypoglycemia_dizziness', diseaseName: 'Hypoglycemia', icdCode: 'E16.2',
    category: 'metabolic', quality: 'lightheadedness',
    duration: 'minutes', triggers: ['missed_meal', 'excess_insulin', 'exertion'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [0, 80], agePeak: [10, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['diabetes_on_medication', 'insulin_use', 'sulfonylurea_use', 'liver_disease', 'alcohol'],
    redFlags: ['loss_of_consciousness', 'seizure', 'severe_hypoglycemia'],
    associatedSymptoms: ['sweating', 'tremor', 'palpitations', 'hunger', 'confusion', 'irritability', 'blurred_vision'],
    typicalDescription: 'Lightheadedness with autonomic symptoms (sweating, tremor, palpitations) and confusion. Resolves rapidly with glucose intake. Capillary glucose low.',
  },
  {
    diseaseId: 'cervicogenic_dizziness', diseaseName: 'Cervicogenic Dizziness / Cervical Vertigo', icdCode: 'M53.0',
    category: 'cervicogenic', quality: 'imbalance',
    duration: 'variable', triggers: ['neck_movement', 'prolonged_neck_posture', 'whiplash'],
    nystagmus: 'none', neurologicalSigns: [],
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'female', backgroundPrevalence: 0.005,
    riskFactors: ['previous_whiplash', 'neck_pain', 'cervical_spondylosis', 'sedentary_work'],
    redFlags: ['neurological_deficit', 'vertigo_true_spinning'],
    associatedSymptoms: ['neck_pain', 'headache', 'limited_neck_range', 'shoulder_tension', 'imbalance'],
    typicalDescription: 'Dizziness/imbalance associated with neck pain and movement. No true vertigo or nystagmus. Proprioceptive mismatch from cervical afferents.',
  },
];

const DIZZINESS_PATTERNS: DizzinessPatternRule[] = [
  {
    id: 'positional_vertigo_seconds', label: 'Positional Vertigo Lasting Seconds',
    description: 'Vertigo triggered by head position changes lasting <60 seconds = BPPV.',
    pattern: ['dizziness', 'head_movement'],
    suggests: ['bppv'],
    rulesOut: ['central_vertigo_stroke', 'vestibular_migraine', 'orthostatic_hypotension'],
    priorityBoost: 25,
  },
  {
    id: 'vertigo_hearing_loss', label: 'Acute Vertigo + Hearing Loss',
    description: 'Acute vertigo with ipsilateral hearing loss = labyrinthitis.',
    pattern: ['dizziness', 'hearing_loss'],
    suggests: ['labyrinthitis', 'meniere_disease'],
    rulesOut: ['bppv', 'vestibular_neuritis'],
    priorityBoost: 20,
  },
  {
    id: 'vertigo_no_hearing_loss_viral', label: 'Acute Vertigo + No Hearing Loss + Viral Prodrome',
    description: 'Acute severe vertigo with nausea/vomiting but no hearing loss = vestibular neuritis.',
    pattern: ['dizziness', 'fever'],
    suggests: ['vestibular_neuritis'],
    rulesOut: ['labyrinthitis', 'meniere_disease'],
    priorityBoost: 20,
  },
  {
    id: 'brainstem_signs_vertigo', label: 'Vertigo + Brainstem Signs / HINTS Positive',
    description: 'Vertigo with dysarthria, diplopia, ataxia, or facial weakness = central/stroke. EMERGENCY.',
    pattern: ['dizziness', 'dysarthria', 'ataxia'],
    suggests: ['central_vertigo_stroke'],
    rulesOut: ['bppv', 'vestibular_neuritis', 'meniere_disease'],
    priorityBoost: 40,
  },
  {
    id: 'migraine_vertigo', label: 'Episodic Vertigo + Migraine Features',
    description: 'Episodic vertigo with headache, photophobia, or aura = vestibular migraine.',
    pattern: ['dizziness', 'headache'],
    suggests: ['vestibular_migraine'],
    rulesOut: ['bppv', 'central_vertigo_stroke'],
    priorityBoost: 15,
  },
  {
    id: 'orthostatic_symptoms', label: 'Lightheadedness on Standing',
    description: 'Lightheadedness on standing relieved by sitting = orthostatic hypotension.',
    pattern: ['dizziness'],
    suggests: ['orthostatic_hypotension'],
    rulesOut: ['bppv', 'vestibular_neuritis', 'central_vertigo_stroke'],
    priorityBoost: 20,
  },
  {
    id: 'palpitation_presyncope', label: 'Presyncope/Syncope with Palpitations',
    description: 'Sudden presyncope with palpitations = cardiac arrhythmia.',
    pattern: ['dizziness', 'palpitations'],
    suggests: ['cardiac_arrhythmia_dizziness', 'vasovagal_syncope'],
    rulesOut: ['bppv', 'vestibular_neuritis', 'cervicogenic_dizziness'],
    priorityBoost: 30,
  },
  {
    id: 'anxiety_hyperventilation_dizziness', label: 'Dizziness + Anxiety + Palpitations',
    description: 'Lightheadedness with hyperventilation, chest tightness, and fear = panic attack.',
    pattern: ['dizziness', 'anxiety'],
    suggests: ['panic_attack_dizziness'],
    rulesOut: ['cardiac_arrhythmia_dizziness', 'vestibular_neuritis'],
    priorityBoost: 10,
  },
  {
    id: 'medication_dizziness', label: 'Dizziness + New Medication',
    description: 'Dizziness temporally related to starting new medication = drug-induced.',
    pattern: ['dizziness', 'medication_list'],
    suggests: ['medication_induced_dizziness'],
    rulesOut: ['bppv', 'vestibular_neuritis'],
    priorityBoost: 15,
  },
  {
    id: 'anemia_fatigue_dizziness', label: 'Chronic Dizziness + Fatigue + Pallor',
    description: 'Chronic lightheadedness with fatigue and pallor = anemia.',
    pattern: ['dizziness', 'fatigue'],
    suggests: ['anemia_dizziness'],
    rulesOut: ['bppv', 'vestibular_neuritis', 'central_vertigo_stroke'],
    priorityBoost: 10,
  },
  {
    id: 'hypoglycemia_sweating', label: 'Dizziness + Sweating + Confusion',
    description: 'Lightheadedness with sweating, tremor, and confusion = hypoglycemia.',
    pattern: ['dizziness', 'sweating'],
    suggests: ['hypoglycemia_dizziness'],
    rulesOut: ['cardiac_arrhythmia_dizziness', 'vasovagal_syncope'],
    priorityBoost: 15,
  },
  {
    id: 'neck_pain_dizziness', label: 'Dizziness + Neck Pain',
    description: 'Imbalance/dizziness with neck pain and stiffness = cervicogenic dizziness.',
    pattern: ['dizziness', 'neck_pain'],
    suggests: ['cervicogenic_dizziness'],
    rulesOut: ['bppv', 'central_vertigo_stroke', 'vestibular_migraine'],
    priorityBoost: 10,
  },
  {
    id: 'meniere_triad', label: 'Recurrent Vertigo + Tinnitus + Hearing Loss',
    description: 'Recurrent episodes of vertigo with tinnitus and fluctuating hearing loss = Meniere disease.',
    pattern: ['dizziness', 'hearing_loss'],
    suggests: ['meniere_disease'],
    rulesOut: ['bppv', 'vestibular_neuritis', 'labyrinthitis'],
    priorityBoost: 20,
  },
];

export function getDizzinessDdx(): DizzinessDisease[] {
  return DIZZINESS_DDX;
}

export function getDizzinessPatterns(): DizzinessPatternRule[] {
  return DIZZINESS_PATTERNS;
}

export function classifyDizzinessType(
  quality: 'vertigo_spinning' | 'lightheadedness' | 'imbalance' | 'presyncope',
  duration: string,
  triggers: string[],
  neurologicalSigns: boolean,
): { primaryCategory: DizzinessCategory; rationale: string } {
  if (neurologicalSigns) return { primaryCategory: 'vestibular_central', rationale: 'Dizziness with neurological signs = central vertigo (stroke/TIA). Urgent neuroimaging and HINTS exam.' };
  if (quality === 'vertigo_spinning' && duration === 'seconds' && triggers.some(t => ['head_movement', 'rolling_over_bed'].includes(t))) return { primaryCategory: 'vestibular_peripheral', rationale: 'Positional vertigo lasting seconds = BPPV. Dix-Hallpike diagnostic.' };
  if (quality === 'vertigo_spinning' && (duration === 'hours' || duration === 'days')) return { primaryCategory: 'vestibular_peripheral', rationale: 'Acute prolonged vertigo = vestibular neuritis (no hearing loss) or labyrinthitis (with hearing loss).' };
  if (quality === 'presyncope' && triggers.some(t => ['standing_up', 'prolonged_standing'].includes(t))) return { primaryCategory: 'orthostatic', rationale: 'Orthostatic presyncope = orthostatic hypotension. Check BP lying/standing.' };
  if (quality === 'presyncope' && triggers.some(t => ['emotional_stress', 'pain', 'fear'].includes(t))) return { primaryCategory: 'cardiac', rationale: 'Presyncope with emotional trigger = vasovagal syncope.' };
  if (quality === 'lightheadedness' && triggers.some(t => ['medication intake', 'dose change'].includes(t))) return { primaryCategory: 'medication_induced', rationale: 'Lightheadedness temporally linked to medication = drug-induced dizziness.' };
  if (quality === 'lightheadedness' && triggers.some(t => ['stress', 'anxiety', 'panic_triggers'].includes(t))) return { primaryCategory: 'psychogenic', rationale: 'Lightheadedness with anxiety/panic features = panic attack or hyperventilation.' };
  if (quality === 'imbalance' && triggers.some(t => ['neck_movement', 'prolonged_neck_posture'].includes(t))) return { primaryCategory: 'cervicogenic', rationale: 'Imbalance with neck pain and movement = cervicogenic dizziness.' };
  return { primaryCategory: 'other', rationale: 'Pattern not clearly classified. Consider metabolic, medication, or psychogenic causes.' };
}

export function getDizzinessGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const DIZZINESS_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'dizziness_quality', label: 'Dizziness Quality', features: ['dizziness'], priority: 85, rationale: 'Quality is key: vertigo (vestibular) vs lightheadedness (orthostatic/metabolic) vs presyncope (cardiac) vs imbalance (cervicogenic/proprioceptive).', category: 'diagnostic' },
    { id: 'dizziness_duration', label: 'Dizziness Duration', features: ['dizziness'], priority: 80, rationale: 'Seconds = BPPV, minutes = Meniere/migraine, hours = neuritis, days = labyrinthitis/stroke.', category: 'diagnostic' },
    { id: 'dizziness_triggers', label: 'Dizziness Triggers', features: ['dizziness'], priority: 80, rationale: 'Position triggers = BPPV, standing = orthostatic, stress = vasovagal/panic, exertion = cardiac.', category: 'diagnostic' },
    { id: 'dizziness_neurological', label: 'Neurological Symptoms with Dizziness', features: ['dysarthria', 'diplopia', 'dysphagia', 'ataxia', 'facial_weakness', 'headache'], priority: 95, rationale: 'CRITICAL: Vertigo + brainstem signs = stroke. Perform HINTS exam urgently.', category: 'life_threatening' },
    { id: 'dizziness_hearing', label: 'Hearing Loss / Tinnitus', features: ['hearing_loss', 'tinnitus'], priority: 70, rationale: 'Hearing loss distinguishes labyrinthitis (with HL) from neuritis (without). Fluctuating HL + tinnitus = Meniere.', category: 'diagnostic' },
    { id: 'dizziness_cardiac', label: 'Cardiac Symptoms with Dizziness', features: ['palpitations', 'chest_pain', 'syncope'], priority: 90, rationale: 'Presyncope/syncope with palpitations = cardiac arrhythmia until proven. ECG and cardiac monitoring.', category: 'life_threatening' },
    { id: 'dizziness_medication', label: 'Medication History', features: ['medication_list'], priority: 65, rationale: 'New or changed medication can cause dizziness. Review all meds including OTC and herbal.', category: 'diagnostic' },
    { id: 'dizziness_orthostatic', label: 'Orthostatic Symptoms', features: ['dizziness'], priority: 75, rationale: 'Lightheadedness on standing suggests orthostatic hypotension. Check BP lying, sitting, standing.', category: 'diagnostic' },
    { id: 'dizziness_metabolic', label: 'Metabolic / Anemia / Hypoglycemia', features: ['fatigue', 'sweating', 'tremor', 'diabetes', 'pallor'], priority: 60, rationale: 'Chronic lightheadedness with fatigue = anemia. Sweating + tremor = hypoglycemia.', category: 'diagnostic' },
    { id: 'dizziness_neck', label: 'Neck Pain / Cervical Symptoms', features: ['neck_pain', 'headache'], priority: 50, rationale: 'Dizziness with neck pain suggests cervicogenic cause. Proprioceptive re-education.', category: 'diagnostic' },
    { id: 'dizziness_psychogenic', label: 'Anxiety / Panic Features', features: ['anxiety', 'palpitations', 'paresthesia'], priority: 55, rationale: 'Dizziness with panic features suggests psychogenic cause. Rule out organic causes first.', category: 'diagnostic' },
  ];

  for (const def of DIZZINESS_GAP_DEFS) {
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
          groupLabel: 'Dizziness Assessment',
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
            groupLabel: 'Dizziness Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getDizzinessPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of DIZZINESS_PATTERNS) {
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
          reasonEssential: `Dizziness pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedDizzinessPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of DIZZINESS_DDX) {
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
