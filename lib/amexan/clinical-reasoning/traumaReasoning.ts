import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type TraumaCategory = 'head_tbi' | 'spinal' | 'chest' | 'chest_trauma' | 'abdominal' | 'abdominal_trauma' | 'pelvic' | 'pelvic_fracture' | 'extremity' | 'vascular' | 'crush' | 'burns' | 'polytrauma' | 'amputation' | 'other';

interface TraumaDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: TraumaCategory;
  mechanism: string[];
  severityKeywords: string[];
  anatomicLocation: string[];
  redFlags: string[];
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  presentation: string[];
  typicalDescription: string;
}

interface TraumaPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const TRAUMA_DDX: TraumaDisease[] = [
  {
    diseaseId: 'traumatic_brain_injury', diseaseName: 'Traumatic Brain Injury (Concussion / Contusion / SDH / EDH)', icdCode: 'S06.9',
    category: 'head_tbi',
    mechanism: ['blunt_head_trauma', 'fall', 'mva', 'assault', 'sports_injury', 'penetrating_head'],
    severityKeywords: ['mild_gcs_13_15', 'moderate_gcs_9_12', 'severe_gcs_3_8', 'loss_of_consciousness', 'amnesia'],
    anatomicLocation: ['Frontal', 'Temporal', 'Parietal', 'Occipital', 'Diffuse'],
    redFlags: ['gcs_decline', 'asymmetric_pupils', 'posturing', 'seizure', 'vomiting_repeated', 'penetrating_injury', 'coagulopathy'],
    ageRange: [0, 95], agePeak: [15, 35],
    sexPredilection: 'male', backgroundPrevalence: 0.01,
    riskFactors: ['male_sex', 'contact_sports', 'occupational_hazard', 'alcohol', 'anticoagulation', 'previous_tbi'],
    presentation: ['loss_of_consciousness', 'headache', 'vomiting', 'amnesia', 'confusion', 'seizure', 'focal_deficit', 'gcs_reduced'],
    typicalDescription: 'Head trauma with altered consciousness. GCS guides severity: mild (13-15), moderate (9-12), severe (3-8). CT head to rule out intracranial bleed.',
  },
  {
    diseaseId: 'spinal_cord_trauma', diseaseName: 'Spinal Cord Injury (Cervical / Thoracic / Lumbar)', icdCode: 'S14.1',
    category: 'spinal',
    mechanism: ['mva', 'fall_from_height', 'diving', 'sports', 'assault', 'penetrating_spine'],
    severityKeywords: ['complete_cord', 'incomplete_cord', 'central_cord', 'anterior_cord', 'brown_sequard'],
    anatomicLocation: ['Cervical', 'Thoracic', 'Lumbar', 'Sacral'],
    redFlags: ['spinal_tenderness', 'neurological_deficit', 'neurogenic_shock', 'respiratory_compromise', 'cervical_pain'],
    ageRange: [15, 80], agePeak: [20, 45],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['male_sex', 'contact_sports', 'mva', 'fall_risk', 'osteoporosis'],
    presentation: ['neck_pain', 'back_pain', 'weakness', 'numbness', 'paralysis', 'loss_of_bowel_bladder', 'respiratory_distress'],
    typicalDescription: 'Spinal trauma with neurological deficit. Immobilize immediately. Methylprednisolone within 8 hours. CT/MRI spine. Surgical decompression for incomplete cord.',
  },
  {
    diseaseId: 'chest_trauma', diseaseName: 'Chest Trauma (Rib Fracture / Hemothorax / Pneumothorax / Cardiac Contusion)', icdCode: 'S29.9',
    category: 'chest',
    mechanism: ['blunt_chest', 'mva', 'fall', 'assault', 'penetrating_chest', 'crush'],
    severityKeywords: ['simple_pneumothorax', 'tension_pneumothorax', 'open_pneumothorax', 'hemothorax', 'flail_chest', 'cardiac_tamponade'],
    anatomicLocation: ['Ribs', 'Sternum', 'Lung', 'Heart', 'Great_vessels', 'Trachea', 'Diaphragm'],
    redFlags: ['tension_pneumothorax', 'cardiac_tamponade', 'massive_hemothorax', 'open_pneumothorax', 'flail_chest', 'traumatic_aortic_injury'],
    ageRange: [10, 90], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['mva_high_speed', 'fall_from_height', 'penetrating_injury'],
    presentation: ['chest_pain', 'dyspnea', 'decreased_breath_sounds', 'hypotension', 'tracheal_deviation', 'subcutaneous_emphysema', 'distended_neck_veins'],
    typicalDescription: 'Chest trauma with respiratory or hemodynamic compromise. Tension pneumothorax and cardiac tamponade are immediately life-threatening. Needle decompression or thoracostomy.',
  },
  {
    diseaseId: 'abdominal_trauma', diseaseName: 'Abdominal Trauma (Solid Viscus / Hollow Viscus / Vascular)', icdCode: 'S36.9',
    category: 'abdominal',
    mechanism: ['blunt_abdomen', 'mva', 'fall', 'assault', 'penetrating_abdomen', 'blast'],
    severityKeywords: ['solid_organ_injury', 'hollow_viscus_perforation', 'mesenteric_tear', 'retroperitoneal_hematoma'],
    anatomicLocation: ['Liver', 'Spleen', 'Kidney', 'Pancreas', 'Stomach', 'Small bowel', 'Colon', 'Mesentery', 'Great_vessels'],
    redFlags: ['peritonitis', 'hypotension_unresponsive', 'evisceration', 'penetrating_abdomen', 'seatbelt_sign', 'distension_progressive'],
    ageRange: [5, 85], agePeak: [20, 45],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['mva', 'fall_from_height', 'penetrating_injury', 'blunt_trauma'],
    presentation: ['abdominal_pain', 'tenderness', 'distension', 'hypotension', 'peritonitis', 'bruising', 'hematuria'],
    typicalDescription: 'Blunt or penetrating abdominal trauma. FAST exam for free fluid. CT with IV contrast in stable patient. Unstable patient goes to OR. Serial exams for hollow viscus injury.',
  },
  {
    diseaseId: 'pelvic_fracture', diseaseName: 'Pelvic Fracture (Unstable / Stable)', icdCode: 'S32.8',
    category: 'pelvic',
    mechanism: ['mva', 'fall_from_height', 'crush', 'pedestrian_struck'],
    severityKeywords: ['stable_ring', 'unstable_ring', 'open_fracture', 'complex_pelvic'],
    anatomicLocation: ['Pelvic ring', 'Acetabulum', 'Pubis', 'Ilium', 'Ischium', 'Sacrum'],
    redFlags: ['hemodynamic_instability', 'open_fracture', 'urethral_injury', 'bladder_injury', 'rectal_injury', 'vaginal_injury'],
    ageRange: [15, 90], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['high_energy_trauma', 'osteoporosis', 'elderly'],
    presentation: ['pelvic_pain', 'instability_on_compression', 'ecchymosis', 'leg_length_discrepancy', 'blood_at_urethra_meatus'],
    typicalDescription: 'High-energy pelvic trauma with potential for massive hemorrhage. Pelvic binder. CT with contrast. May need angiographic embolization or preperitoneal packing.',
  },
  {
    diseaseId: 'long_bone_fracture', diseaseName: 'Long Bone Fracture (Femur / Tibia / Humerus / Forearm)', icdCode: 'S72.9',
    category: 'extremity',
    mechanism: ['fall', 'mva', 'sports', 'direct_blow', 'twisting', 'pathologic_on_minimal_trauma'],
    severityKeywords: ['closed', 'open_compound', 'comminuted', 'transverse', 'oblique', 'spiral', 'segmental', 'intra_articular'],
    anatomicLocation: ['Femur', 'Tibia', 'Fibula', 'Humerus', 'Radius', 'Ulna'],
    redFlags: ['open_fracture', 'neurovascular_compromise', 'compartment_syndrome', 'fat_embolism', 'vascular_injury'],
    ageRange: [0, 95], agePeak: [10, 35],
    sexPredilection: 'male', backgroundPrevalence: 0.01,
    riskFactors: ['osteoporosis', 'sports', 'occupational', 'elderly', 'pathologic_lesion'],
    presentation: ['pain', 'deformity', 'swelling', 'inability_to_weight_bear', 'crepitus', 'neurovascular_deficit'],
    typicalDescription: 'Closed or open extremity fracture. Assess neurovascular status before and after reduction. Open fractures require IV antibiotics and urgent OR debridement.',
  },
  {
    diseaseId: 'major_vascular_injury', diseaseName: 'Major Vascular Injury (Arterial / Venous)', icdCode: 'S35.9',
    category: 'vascular',
    mechanism: ['penetrating', 'blunt', 'crush', 'fracture_related', 'dislocation_related', 'iatrogenic'],
    severityKeywords: ['complete_transection', 'partial_laceration', 'thrombosis', 'intimal_flap', 'pseudoaneurysm', 'avulsion'],
    anatomicLocation: ['Aorta', 'Carotid', 'Subclavian', 'Axillary', 'Brachial', 'Femoral', 'Popliteal', 'Tibial'],
    redFlags: ['pulsatile_bleeding', 'expanding_hematoma', 'absent_pulse', 'ischemic_limb', 'hemodynamic_instability', 'bruit_thrill'],
    ageRange: [10, 80], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['penetrating_trauma', 'high_energy_blunt', 'fracture_dislocation'],
    presentation: ['bleeding', 'hematoma_expanding', 'absent_distal_pulses', 'pallor', 'pain', 'paresthesia', 'paralysis', 'cold_limb'],
    typicalDescription: 'Vascular injury with distal ischemia or active hemorrhage. Hard signs (absent pulse, expanding hematoma, pulsatile bleeding) require immediate surgical exploration.',
  },
  {
    diseaseId: 'crush_injury', diseaseName: 'Crush Injury / Crush Syndrome', icdCode: 'T79.5',
    category: 'crush',
    mechanism: ['building_collapse', 'industrial_accident', 'mva_prolonged_extrication', 'heavy_object_fall', 'entrapment'],
    severityKeywords: ['prolonged_compression', 'massive_muscle_injury', 'compartment_syndrome'],
    anatomicLocation: ['Lower extremity', 'Upper extremity', 'Pelvis', 'Trunk'],
    redFlags: ['hyperkalemia', 'cardiac_arrhythmia', 'renal_failure', 'compartment_syndrome', 'prolonged_entrapment_gt_4h'],
    ageRange: [10, 70], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.0002,
    riskFactors: ['construction_worker', 'industrial', 'earthquake', 'war'],
    presentation: ['swelling_massive', 'pain_out_of_proportion', 'dark_urine_myoglobin', 'numbness', 'weakness', 'hypotension', 'arrhythmia'],
    typicalDescription: 'Prolonged compression of muscle tissue leading to rhabdomyolysis, hyperkalemia, and renal failure. Aggressive fluid resuscitation, urine alkalinization, monitor potassium.',
  },
  {
    diseaseId: 'compartment_syndrome', diseaseName: 'Compartment Syndrome (Acute)', icdCode: 'T79.6',
    category: 'extremity',
    mechanism: ['fracture', 'crush', 'reperfusion_injury', 'tight_cast_dressing', 'burn', 'hemorrhage'],
    severityKeywords: ['impending', 'established', 'irreversible'],
    anatomicLocation: ['Lower leg anterior', 'Lower leg deep posterior', 'Forearm volar', 'Foot', 'Hand', 'Thigh', 'Buttock'],
    redFlags: ['pain_on_passive_stretch', 'pallor', 'pulselessness', 'paresthesia', 'paralysis', 'tense_compartment'],
    ageRange: [5, 80], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['tibial_fracture', 'forearm_fracture', 'crush', 'prolonged_compression', 'anticoagulation'],
    presentation: ['pain_out_of_proportion', 'tense_swollen_compartment', 'pain_on_passive_movement', 'paresthesia', 'weakness', 'late_pulselessness'],
    typicalDescription: 'Emergency. Pain out of proportion to injury with pain on passive stretch of muscles in the compartment. Late signs are pulselessness and paralysis. Fasciotomy within 6 hours.',
  },
  {
    diseaseId: 'burn_injury', diseaseName: 'Burn Injury (Thermal / Chemical / Electrical)', icdCode: 'T30.0',
    category: 'burns',
    mechanism: ['flame', 'scald', 'contact', 'chemical', 'electrical', 'inhalation'],
    severityKeywords: ['superficial_1st', 'partial_thickness_2nd', 'full_thickness_3rd', 'fourth_degree'],
    anatomicLocation: ['Face', 'Hand', 'Perineum', 'Joints', 'Circumferential', 'Airway_inhalation'],
    redFlags: ['inhalation_injury', 'circumferential_burn', 'high_voltage_electrical', 'facial_burn', 'burn_gt_20_percent_tbsa'],
    ageRange: [0, 90], agePeak: [1, 5],
    sexPredilection: 'male', backgroundPrevalence: 0.002,
    riskFactors: ['children', 'elderly', 'occupational', 'epilepsy', 'alcohol', 'smoking'],
    presentation: ['skin_redness', 'blistering', 'charred_skin', 'airway_edema', 'pain', 'hypovolemic_shock'],
    typicalDescription: 'Thermal, chemical, or electrical burn. Assess TBSA using rule of nines. Airway first — inhalation injury is life-threatening. Fluid resuscitation per Parkland formula.',
  },
  {
    diseaseId: 'polytrauma', diseaseName: 'Polytrauma (Multiple Injuries / Major Trauma)', icdCode: 'T07',
    category: 'polytrauma',
    mechanism: ['mva_high_speed', 'fall_from_height_greater_than_6m', 'explosion', 'pedestrian_struck', 'motorcycle_crash'],
    severityKeywords: ['major_trauma', 'multi_system', 'hemorrhagic_shock', 'massive_transfusion'],
    anatomicLocation: ['Multiple', 'Head', 'Chest', 'Abdomen', 'Pelvis', 'Extremities'],
    redFlags: ['hemodynamic_instability', 'gcs_less_than_8', 'hypoxia', 'coagulopathy', 'hypothermia', 'acidosis'],
    ageRange: [5, 85], agePeak: [20, 50],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['high_energy_mechanism', 'no_seatbelt', 'ejection', 'death_same_car'],
    presentation: ['hypotension', 'tachycardia', 'reduced_gcs', 'respiratory_distress', 'multiple_injuries'],
    typicalDescription: 'Major trauma involving two or more body systems with significant physiological derangement. ATLS protocol: primary survey (ABCDE), resuscitation, secondary survey, definitive care.',
  },
  {
    diseaseId: 'traumatic_amputation', diseaseName: 'Traumatic Amputation (Complete / Partial)', icdCode: 'T14.7',
    category: 'amputation',
    mechanism: ['industrial_machinery', 'mva', 'explosion', 'train', 'lawnmower', 'chainsaw'],
    severityKeywords: ['complete', 'partial', 'crush_avulsion', 'guillotine', 'replantation_candidate'],
    anatomicLocation: ['Finger', 'Hand', 'Forearm', 'Arm', 'Foot', 'Leg', 'Thigh'],
    redFlags: ['uncontrolled_bleeding', 'crush_injury', 'prolonged_ischemia_gt_6h', 'multiple_levels'],
    ageRange: [5, 80], agePeak: [20, 55],
    sexPredilection: 'male', backgroundPrevalence: 0.0001,
    riskFactors: ['industrial_worker', 'farmer', 'mechanic', 'mva'],
    presentation: ['partial_amputation', 'complete_amputation', 'bleeding', 'bone_exposure', 'tissue_loss'],
    typicalDescription: 'Partial or complete severance of a limb or digit. Control hemorrhage with direct pressure, not tourniquet unless life-threatening. Wrap amputated part in moist gauze, place in sealed bag on ice.',
  },
];

const TRAUMA_PATTERNS: TraumaPatternRule[] = [
  {
    id: 'high_energy_mva', label: 'High-Energy MVA / Ejection / Death in Same Car',
    description: 'High-energy mechanism with potential for polytrauma. Full ATLS primary and secondary survey.',
    pattern: ['dizziness', 'trauma_history'],
    suggests: ['polytrauma', 'traumatic_brain_injury', 'chest_trauma', 'abdominal_trauma'],
    rulesOut: [],
    priorityBoost: 35,
  },
  {
    id: 'head_trauma_loc', label: 'Head Trauma with LOC / GCS Decline',
    description: 'Head trauma with loss of consciousness or declining GCS = TBI with possible intracranial bleed.',
    pattern: ['headache', 'vomiting'],
    suggests: ['traumatic_brain_injury'],
    rulesOut: ['spinal_cord_trauma', 'burn_injury'],
    priorityBoost: 30,
  },
  {
    id: 'spinal_neuro_deficit', label: 'Spinal Trauma + Neurological Deficit',
    description: 'Spinal tenderness with neurological deficit = spinal cord injury. Immobilize immediately.',
    pattern: ['back_pain'],
    suggests: ['spinal_cord_trauma'],
    rulesOut: [],
    priorityBoost: 35,
  },
  {
    id: 'chest_trauma_resp', label: 'Chest Trauma + Respiratory Compromise',
    description: 'Chest trauma with dyspnea, decreased breath sounds, or hypotension = tension pneumothorax or hemothorax.',
    pattern: ['dizziness', 'chest_pain'],
    suggests: ['chest_trauma'],
    rulesOut: ['traumatic_brain_injury', 'abdominal_trauma'],
    priorityBoost: 35,
  },
  {
    id: 'abdominal_trauma_peritonitis', label: 'Abdominal Trauma + Peritonitis / Shock',
    description: 'Abdominal trauma with peritonitis or hypotension = intra-abdominal injury. FAST or OR.',
    pattern: ['abdominal_pain'],
    suggests: ['abdominal_trauma'],
    rulesOut: ['chest_trauma', 'pelvic_fracture'],
    priorityBoost: 30,
  },
  {
    id: 'pelvic_binder_indication', label: 'Pelvic Pain + Instability + Hypotension',
    description: 'Pelvic tenderness with hemodynamic instability = unstable pelvic fracture. Pelvic binder.',
    pattern: ['dizziness'],
    suggests: ['pelvic_fracture'],
    rulesOut: [],
    priorityBoost: 30,
  },
  {
    id: 'open_fracture', label: 'Open Fracture / Compound Fracture',
    description: 'Fracture with skin breach = open fracture. IV antibiotics and urgent OR washout.',
    pattern: ['dizziness', 'pain_severity'],
    suggests: ['long_bone_fracture'],
    rulesOut: [],
    priorityBoost: 25,
  },
  {
    id: 'vascular_hard_signs', label: 'Hard Signs of Vascular Injury',
    description: 'Absent pulse, expanding hematoma, pulsatile bleeding, or bruit = vascular injury. Vascular surgery.',
    pattern: ['dizziness'],
    suggests: ['major_vascular_injury'],
    rulesOut: [],
    priorityBoost: 40,
  },
  {
    id: 'compartment_pain_stretch', label: 'Pain Out of Proportion + Pain on Passive Stretch',
    description: 'Severe pain with passive stretch of compartment = compartment syndrome. Fasciotomy.',
    pattern: ['dizziness', 'pain_severity'],
    suggests: ['compartment_syndrome', 'crush_injury'],
    rulesOut: ['long_bone_fracture'],
    priorityBoost: 35,
  },
  {
    id: 'crush_myoglobinuria', label: 'Crush + Dark Urine',
    description: 'Prolonged compression with dark urine = crush syndrome with rhabdomyolysis.',
    pattern: ['dizziness'],
    suggests: ['crush_injury', 'compartment_syndrome'],
    rulesOut: [],
    priorityBoost: 30,
  },
  {
    id: 'burn_inhalation', label: 'Burn + Facial / Inhalation Injury',
    description: 'Burn with facial involvement, hoarseness, or stridor = inhalation injury. Intubate early.',
    pattern: ['dizziness'],
    suggests: ['burn_injury'],
    rulesOut: [],
    priorityBoost: 35,
  },
  {
    id: 'amputation_hemorrhage', label: 'Traumatic Amputation with Hemorrhage',
    description: 'Partial or complete amputation. Control bleeding, salvage amputated part.',
    pattern: ['dizziness'],
    suggests: ['traumatic_amputation'],
    rulesOut: [],
    priorityBoost: 30,
  },
];

export function getTraumaDdx(): TraumaDisease[] {
  return TRAUMA_DDX;
}

export function getTraumaPatterns(): TraumaPatternRule[] {
  return TRAUMA_PATTERNS;
}

export function assessTraumaSeverity(
  mechanism: string,
  gcs: number,
  systolicBP: number,
  respiratoryRate: number,
): {
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  traumaTeamActivation: boolean;
  rationale: string;
} {
  if (gcs <= 8 || systolicBP < 90 || respiratoryRate < 10 || respiratoryRate > 29) {
    return { severity: 'critical', traumaTeamActivation: true, rationale: 'Critical trauma: GCS ≤8, SBP <90, or respiratory compromise. Immediate life-saving interventions and trauma team activation.' };
  }
  if (gcs <= 13 || systolicBP < 110 || mechanism.includes('high_energy') || mechanism.includes('fall_gt_6m') || mechanism.includes('mva_high_speed')) {
    return { severity: 'severe', traumaTeamActivation: true, rationale: 'Severe trauma: GCS 9-13, borderline vital signs, or high-energy mechanism. Trauma team evaluation and CT polytrauma protocol.' };
  }
  if (gcs === 14 || mechanism.includes('fall') || mechanism.includes('mva') || mechanism.includes('assault')) {
    return { severity: 'moderate', traumaTeamActivation: false, rationale: 'Moderate trauma: isolated injury without physiological compromise. Monitored in ED with serial assessments.' };
  }
  return { severity: 'minor', traumaTeamActivation: false, rationale: 'Minor trauma: isolated low-energy injury. Outpatient or ED discharge with safety netting.' };
}

export function classifyTraumaMechanism(
  mechanismType: 'blunt' | 'penetrating' | 'burn' | 'blast',
  energy: 'low' | 'high',
): TraumaCategory[] {
  if (mechanismType === 'blast') return ['polytrauma', 'chest_trauma', 'abdominal_trauma', 'head_tbi'];
  if (mechanismType === 'penetrating' && energy === 'high') return ['vascular', 'chest_trauma', 'abdominal_trauma'];
  if (mechanismType === 'penetrating' && energy === 'low') return ['vascular', 'abdominal_trauma'];
  if (mechanismType === 'burn') return ['burns'];
  if (mechanismType === 'blunt' && energy === 'high') return ['head_tbi', 'spinal', 'chest_trauma', 'abdominal_trauma', 'pelvic_fracture', 'polytrauma'];
  return ['extremity', 'other'];
}

export function getTraumaGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const TRAUMA_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'trauma_mechanism', label: 'Mechanism of Injury', features: ['trauma_history'], priority: 95, rationale: 'CRITICAL: Mechanism determines injury pattern and energy. High-energy MVA, fall from height, penetrating trauma = higher risk.', category: 'life_threatening' },
    { id: 'trauma_head_neuro', label: 'Head Trauma / Neurological Assessment', features: ['headache', 'vomiting'], priority: 95, rationale: 'CRITICAL: GCS, pupillary response, focal signs. Any decline = imminent brain herniation.', category: 'life_threatening' },
    { id: 'trauma_spinal', label: 'Spinal Assessment', features: ['back_pain'], priority: 90, rationale: 'CRITICAL: Spinal tenderness + neuro deficit = spinal cord injury. Full spine immobilization.', category: 'life_threatening' },
    { id: 'trauma_airway_breathing', label: 'Airway / Breathing Assessment', features: ['dizziness'], priority: 100, rationale: 'A = airway patency, B = breathing, breath sounds, tracheal position, chest wall excursion. Tension pneumothorax kills in minutes.', category: 'life_threatening' },
    { id: 'trauma_circulation', label: 'Circulation / Hemorrhage Control', features: ['dizziness'], priority: 100, rationale: 'C = circulation. Hypotension after trauma is hemorrhagic until proven. Two large IVs, fluids, blood. Identify source: chest, abdomen, pelvis, external.', category: 'life_threatening' },
    { id: 'trauma_pelvis', label: 'Pelvic Fracture Assessment', features: ['dizziness'], priority: 85, rationale: 'Pelvic fracture can cause massive retroperitoneal hemorrhage. Pelvic binder if unstable.', category: 'life_threatening' },
    { id: 'trauma_abdomen', label: 'Abdominal Trauma Assessment', features: ['abdominal_pain'], priority: 85, rationale: 'Blunt or penetrating abdominal trauma. FAST for free fluid. Peritonitis = surgical emergency.', category: 'life_threatening' },
    { id: 'trauma_extremity', label: 'Extremity Injury / Compartment Syndrome', features: ['dizziness'], priority: 80, rationale: 'Open fracture, vascular compromise, or compartment syndrome. Pain on passive stretch = compartment syndrome until proven.', category: 'life_threatening' },
    { id: 'trauma_vascular', label: 'Vascular Injury Assessment', features: ['dizziness'], priority: 90, rationale: 'Hard signs of vascular injury: absent pulse, expanding hematoma, pulsatile bleeding, cold limb.', category: 'life_threatening' },
    { id: 'trauma_burn', label: 'Burn Assessment', features: ['dizziness'], priority: 80, rationale: 'Burn percentage TBSA, depth, inhalation injury. Airway edema may develop over hours.', category: 'life_threatening' },
    { id: 'trauma_coagulation', label: 'Coagulation Status', features: ['medication_list'], priority: 75, rationale: 'Anticoagulation dramatically increases bleeding risk after trauma. Reverse anticoagulation if active bleeding.', category: 'management' },
    { id: 'trauma_secondary_survey', label: 'Secondary Survey (Head to Toe)', features: ['dizziness'], priority: 60, rationale: 'Complete head-to-toe examination after primary survey and stabilization. Look for occult injuries.', category: 'documentation' },
  ];

  for (const def of TRAUMA_GAP_DEFS) {
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
          groupLabel: 'Trauma Assessment',
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
            groupLabel: 'Trauma Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getTraumaPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of TRAUMA_PATTERNS) {
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
          category: 'life_threatening',
          priorityScore: Math.min(100, 60 + boost),
          reasonEssential: `Trauma pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
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

export function getBiodataAdjustedTraumaPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of TRAUMA_DDX) {
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
